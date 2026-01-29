import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../logo.png';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import LoadingOverlay from './components/LoadingOverlay';
import CustomMessageModal from './modals/CustomMessageModal';
import StationHistoryModal from './modals/StationHistoryModal';
import UnscannedUnitsTable from './components/UnscannedUnitsTable';
import LiveMonitoringTable from './components/LiveMonitoringTable';
import GeneratedQRList from './components/GeneratedQRList';
import { UserProfileModal } from './modals/UserProfileModal';
import ApprovalConfirmationModal from './modals/ApprovalConfirmationModal'; 
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

ChartJS.register(
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
);

// --- 🛠️ CONFIGURATION ---
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const AVATAR_UPLOAD_PATH = `${API_BASE_URL}/uploads/avatars/`;
const DEFAULT_AVATAR_PATH = `${API_BASE_URL}/uploads/avatars/default_avatar.png`;

const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const USER_ENDPOINT = `${API_BASE_URL}/user_management.php`;
const MAX_QR_COUNT = 100;

const PROCESS_STATIONS = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const DELAY_THRESHOLDS_MINUTES = {
    'Station1': 6, 'Station 1': 6, 'Station2': 8, 'Station 2': 8, 'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12, 'Station5': 15, 'Station 5': 15, 'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3, 'Station8': 15, 'Station 8': 15, 'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8, 'Station11': 22, 'Station 11': 22, 'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10, 'Station14': 8, 'Station 14': 8, 'Station15': 5, 'Station 15': 5
};

const hourLabel = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// Utility Helper Functions
const formatSerial = (num) => String(num).padStart(5, '0');
const safeParseSerial = (serialStr, prefix) => {
    const numStr = serialStr?.replace(prefix, '') || '0';
    return parseInt(numStr, 10) || 0;
};

export default function ITAssistantPage({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Kunin ang huling bahagi ng URL
    const activeTab = location.pathname.split('/').pop() || "overview";

    const setActiveTab = (tab) => {
        navigate(`/itassistant/${tab}`);
    };

    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || null);
    const [currentFullName, setCurrentFullName] = useState(user?.full_name || user?.username);

    // --- DATA & UI STATES ---
    const [qrFormData, setQrFormData] = useState({ model: "MKFF-X1", revision: "REV-01", baseKit: "", accKit: "", quantity: 9 });
    const [generatedQRList, setGeneratedQRList] = useState([]);
    const [unitLogs, setUnitLogs] = useState([]);
    const [stations, setStations] = useState([]);
    const [nextAssemblyNo, setNextAssemblyNo] = useState(1);
    const [pendingUnit, setPendingUnit] = useState(null); 
    
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [activeMonitorStationId, setActiveMonitorStationId] = useState(null);
    const [activeHistoryStation, setActiveHistoryStation] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);

    // --- 📡 DATA SYNC ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(USER_ENDPOINT);
                if (Array.isArray(res.data)) {
                    const currentUser = res.data.find(u => u.username === user.username);
                    if (currentUser) {
                        setCurrentAvatar(currentUser.avatar_url);
                        setCurrentFullName(currentUser.full_name);
                    }
                }
            } catch (err) { console.error("Profile sync failed:", err); }
        };
        fetchUserData();
    }, [user.username]);

    const fetchUnitData = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setProcessStatus('loading');
            setStatusMessage("Fetching initial data...");
        }
        try {
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            const fetchedUnits = Array.isArray(unitsRes.data) ? unitsRes.data : [];
            setUnitLogs(fetchedUnits);

            if (fetchedUnits.length > 0) {
                let maxAssembly = 0;
                fetchedUnits.forEach(unit => {
                    const current = safeParseSerial(unit.assembly_no, 'ASSY-');
                    if (current > maxAssembly) maxAssembly = current;
                });
                setNextAssemblyNo(maxAssembly + 1);
            }
            if (isInitial) setProcessStatus('idle');
        } catch (err) { 
            console.error("Failed to sync units."); 
            if (isInitial) setProcessStatus('idle');
        } 
    }, []);

    useEffect(() => {
        const mockStations = PROCESS_STATIONS.map((name, i) => ({
            id: `Station${i + 1}`, 
            name: name,
        }));
        setStations(mockStations);
        fetchUnitData(true);
        const interval = setInterval(() => fetchUnitData(false), 5000);
        return () => clearInterval(interval);
    }, [fetchUnitData]);

    const handleUpdateProfile = async (formData) => {
        setProcessStatus('loading');
        setStatusMessage("Updating your account details...");
        try {
            const res = await axios.post(USER_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage("Profile updated successfully!");
                setShowProfileModal(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setProcessStatus('error');
                setStatusMessage(res.data.message || "Update Failed");
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage("An error occurred during update.");
            setTimeout(() => setProcessStatus('idle'), 3000);
        }
    };

    // 🔑 HANDLE MANUAL APPROVAL
    const handleApproveButtonClick = (unit) => {
        setPendingUnit(unit);
    };

    const handleConfirmApproval = async (unit) => {
        setPendingUnit(null); 
        setProcessStatus('loading');
        setStatusMessage(`Approving and Returning ${unit.assembly_no} to ${unit.station}...`);

        try {
            const response = await axios.post(`${UNITS_ENDPOINT}?method=PUT`, {
                id: unit.id,
                assembly_no: unit.assembly_no,
                status: 'In Progress', // BINAGO: Ibabalik sa In Progress sa station niya
                remarks: 'Approved by IT Assistant and returned to production line',
                station: unit.station, 
                username: user.username
            });

            if (response.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage("Unit Approved and Returned to Station!");
                fetchUnitData(false); 
                setTimeout(() => setProcessStatus('idle'), 2000);
            }
        } catch (error) {
            setProcessStatus('error');
            setStatusMessage(error.response?.data?.error || "Failed to approve unit.");
            setTimeout(() => setProcessStatus('idle'), 3000);
        }
    };

    const calculateMetrics = (logs) => {
        const counts = { forScanning: 0, completed: 0, inProgress: 0, noGood: 0, totalTracked: 0, pendingApproval: 0 };
        logs.forEach(log => {
            const s = log.status?.trim();
            if (s === 'For Scanning') {
                counts.forScanning++;
            } else {
                counts.totalTracked++; 
                if (s === 'Completed') counts.completed++;
                else if (s === 'In Progress') counts.inProgress++;
                else if (s === 'No Good (NG)') counts.noGood++;
                else if (s === 'Pending Approval') counts.pendingApproval++;
            }
        });
        const totalGenerated = logs.length; 
        const calcPct = (val) => totalGenerated > 0 ? ((val / totalGenerated) * 100).toFixed(1) : 0;
        return { 
            ...counts, 
            total: totalGenerated,
            pctForScanning: calcPct(counts.forScanning),
            pctInProgress: calcPct(counts.inProgress),
            pctCompleted: calcPct(counts.completed),
            pctNoGood: calcPct(counts.noGood),
            pctPending: calcPct(counts.pendingApproval)
        };
    };

    const calculateStationMetrics = (stationLogs) => {
        const total = stationLogs.length;
        const completed = stationLogs.filter(u => u.status === 'Completed').length;
        const inProgress = stationLogs.filter(u => u.status === 'In Progress').length;
        const noGood = stationLogs.filter(u => u.status === 'No Good (NG)').length;
        const yieldRate = total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
        return { completed, inProgress, noGood, total, yieldRate };
    };

    // 🥇 Throughput Trend: Completed units per hour (last 12 hours) + delta vs previous 12 hours
    const throughputTrend = useMemo(() => {
        const now = new Date();
        const hours = 12;
        const bucketStart = new Date(now.getTime() - hours * 60 * 60 * 1000);
        bucketStart.setMinutes(0, 0, 0);

        const makeBuckets = (start, count) => {
            const arr = [];
            for (let i = 0; i < count; i++) {
                const t = new Date(start.getTime() + i * 60 * 60 * 1000);
                arr.push({ t, key: t.getTime(), count: 0 });
            }
            return arr;
        };

        const buckets = makeBuckets(bucketStart, hours + 1); // include current hour
        const bucketMap = new Map(buckets.map(b => [b.key, b]));

        const prevStart = new Date(bucketStart.getTime() - hours * 60 * 60 * 1000);
        const prevEnd = new Date(bucketStart.getTime());

        let currentTotal = 0;
        let prevTotal = 0;

        (unitLogs || []).forEach(l => {
            const status = (l.status || '').toLowerCase();
            const isCompleted = status === 'completed' || status.includes('completed') || status.includes('ok');
            if (!isCompleted) return;

            const ts = new Date(l.updated_at || l.created_at);
            if (Number.isNaN(ts.getTime())) return;

            // current window buckets
            if (ts >= bucketStart) {
                const h = new Date(ts);
                h.setMinutes(0, 0, 0);
                const k = h.getTime();
                if (bucketMap.has(k)) {
                    bucketMap.get(k).count += 1;
                    currentTotal += 1;
                }
            }

            // previous window total
            if (ts >= prevStart && ts < prevEnd) {
                prevTotal += 1;
            }
        });

        const labels = buckets.map(b => hourLabel(b.t));
        const data = buckets.map(b => b.count);
        const deltaPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : (currentTotal > 0 ? 100 : 0);

        return { labels, data, currentTotal, prevTotal, deltaPct };
    }, [unitLogs]);

    // 🥈 Avg Cycle Time per Station: avg minutes in-station for in-progress units vs threshold
    const cycleTimePerStation = useMemo(() => {
        const rows = (stations || []).slice(0, PROCESS_STATIONS.length).map((s, idx) => {
            const stationUnits = unitLogs.filter(u => u.station?.toString().replace(/\s+/g, '') === s.id);
            const inProgress = stationUnits.filter(l => (l.status || '') === 'In Progress');

            const times = inProgress
                .map(l => {
                    const ts = new Date(l.updated_at || l.created_at);
                    if (Number.isNaN(ts.getTime())) return null;
                    return (new Date().getTime() - ts.getTime()) / (1000 * 60);
                })
                .filter(v => typeof v === 'number');

            const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
            const threshold = DELAY_THRESHOLDS_MINUTES[s.id] || 10;
            return {
                id: s.id,
                name: PROCESS_STATIONS[idx] || s.id,
                avgMinutes: avg,
                thresholdMinutes: threshold,
                exceedsPct: threshold > 0 ? ((avg - threshold) / threshold) * 100 : 0,
            };
        });

        // Show worst offenders first (avg above threshold)
        rows.sort((a, b) => (b.avgMinutes - b.thresholdMinutes) - (a.avgMinutes - a.thresholdMinutes));
        return rows;
    }, [stations, unitLogs]);

    // 🥉 FPY (approx): Completed / (Completed + NG)
    const fpy = useMemo(() => {
        const completed = unitLogs.filter(u => u.status === 'Completed').length;
        const ng = unitLogs.filter(u => u.status === 'No Good (NG)').length;
        const processed = completed + ng;
        const pct = processed > 0 ? (completed / processed) * 100 : 0;
        return { completed, ng, processed, pct };
    }, [unitLogs]);

    // Inventory filtered by search
    const filteredInventory = useMemo(() => {
        if (!inventorySearch.trim()) return unitLogs;
        const searchLower = inventorySearch.toLowerCase().trim();
        return unitLogs.filter(u => 
            u.assembly_no?.toLowerCase().includes(searchLower) ||
            u.model?.toLowerCase().includes(searchLower)
        );
    }, [unitLogs, inventorySearch]);

    // Paginated inventory (10 items per page)
    const ITEMS_PER_PAGE = 10;
    const paginatedInventory = useMemo(() => {
        const startIndex = (inventoryCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredInventory.slice(startIndex, endIndex);
    }, [filteredInventory, inventoryCurrentPage]);

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);

    // Reset to page 1 when search changes
    useEffect(() => {
        setInventoryCurrentPage(1);
    }, [inventorySearch]);

    const handleGenerateQR = (e) => {
        e.preventDefault();
        const quantity = parseInt(qrFormData.quantity, 10);
        if (quantity < 1 || quantity > MAX_QR_COUNT) return;
        const newQRList = [];
        let currentAssembly = nextAssemblyNo;
        for (let i = 0; i < quantity; i++) {
            const assyNum = `ASSY-${formatSerial(currentAssembly)}`;
            const qrString = `${qrFormData.model}|${qrFormData.revision}|${qrFormData.baseKit}|${assyNum}||${qrFormData.accKit}`;
            newQRList.push({ 
                assembly_no: assyNum, model: qrFormData.model, revision: qrFormData.revision, 
                base_unit_kitting_no: qrFormData.baseKit, accessory_kitting_no: qrFormData.accKit, 
                qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrString)}`, 
                status: 'For Scanning' 
            });
            currentAssembly++;
        }
        setGeneratedQRList(newQRList);
    };

    const handleSaveToDB = async () => {
        setProcessStatus('loading');
        setStatusMessage("Saving QR Batch to database...");
        try {
            await Promise.all(generatedQRList.map(unit => axios.post(UNITS_ENDPOINT, { ...unit, action: 'create', username: user.username, station: 'N/A' })));
            setProcessStatus('success');
            setStatusMessage("Batch saved successfully!");
            setGeneratedQRList([]); 
            fetchUnitData(false);
            setTimeout(() => setProcessStatus('idle'), 2000);
        } catch (error) {
            setProcessStatus('error');
            setStatusMessage("Failed to save batch.");
            setTimeout(() => setProcessStatus('idle'), 3000);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                const m = calculateMetrics(unitLogs);
                return (
                    <div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-dark shadow-sm p-3 bg-white">
                                    <span className="text-muted fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Scanned Units</span>
                                    <h2 className="fw-bold my-2">{m.totalTracked}</h2>
                                    <div className="badge bg-dark text-white p-2 d-inline-block" style={{ fontSize: '0.7rem', width: 'fit-content' }}>100.0% Share</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-info shadow-sm p-3 bg-white">
                                    <span className="text-info fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>For Scanning Queue</span>
                                    <h2 className="fw-bold my-2">{m.forScanning}</h2>
                                    <div className="badge bg-info bg-opacity-10 text-info p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctForScanning}% Pending</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-warning shadow-sm p-3 bg-white">
                                    <span className="text-warning fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>In Progress (WIP)</span>
                                    <h2 className="fw-bold my-2">{m.inProgress}</h2>
                                    <div className="badge bg-warning bg-opacity-10 text-warning p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctInProgress}% Capacity</div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-success shadow-sm p-3 bg-white">
                                    <span className="text-success fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Completed (Yield)</span>
                                    <h2 className="fw-bold my-2">{m.completed}</h2>
                                    <div className="badge bg-success bg-opacity-10 text-success p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctCompleted}% Rate</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-danger shadow-sm p-3 bg-white">
                                    <span className="text-danger fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Defects (NG)</span>
                                    <h2 className="fw-bold my-2">{m.noGood}</h2>
                                    <div className="badge bg-danger bg-opacity-10 text-danger p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctNoGood}% Failure</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 border-start border-4 border-primary shadow-sm p-3 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <span className="text-primary fw-bold uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Pending QA Approval</span>
                                            <h2 className="fw-bold my-2">{m.pendingApproval}</h2>
                                            <div className="badge bg-primary bg-opacity-10 text-primary p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctPending}% Units</div>
                                        </div>
                                        <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" style={{ fontSize: '0.7rem' }} onClick={() => setActiveTab('approvals')}>GO <i className="bi bi-chevron-right ms-1"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 📊 Advanced Analytics (Top 3 KPIs) */}
                        <div className="row g-4 mt-4">
                            {/* 🥇 Throughput Trend */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold mb-0 uppercase text-dark" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>TOP 1 — Throughput Trend</h6>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Completed units per hour (last 12 hours)</small>
                                        </div>
                                        <span className={`badge rounded-pill px-3 py-2 ${throughputTrend.deltaPct < 0 ? 'bg-danger' : 'bg-success'}`} style={{ fontSize: '0.65rem', fontWeight: '700' }}>
                                            {throughputTrend.deltaPct < 0 ? 'DOWN' : 'UP'} {Math.abs(throughputTrend.deltaPct).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="card-body p-3" style={{ height: 280 }}>
                                        <Line
                                            data={{
                                                labels: throughputTrend.labels,
                                                datasets: [
                                                    {
                                                        label: 'Completed / hour',
                                                        data: throughputTrend.data,
                                                        borderColor: '#0ea5e9',
                                                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                                                        tension: 0.35,
                                                        fill: true,
                                                        pointRadius: 3,
                                                        pointBackgroundColor: '#0ea5e9',
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0, font: { size: 10 } } },
                                                    y: { beginAtZero: true, ticks: { color: '#94a3b8', precision: 0, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="card-footer bg-white border-top px-3 py-2">
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            Total (12h): <strong>{throughputTrend.currentTotal}</strong> • Prev (12h): <strong>{throughputTrend.prevTotal}</strong>
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* 🥈 Avg Cycle Time per Station */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white py-3 border-bottom">
                                        <h6 className="fw-bold mb-0 uppercase text-dark" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>TOP 2 — Average Cycle Time per Station</h6>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Avg minutes in station (WIP) vs threshold</small>
                                    </div>
                                    <div className="card-body p-3" style={{ height: 280 }}>
                                        <Bar
                                            data={{
                                                labels: cycleTimePerStation.map(r => r.name),
                                                datasets: [
                                                    {
                                                        label: 'Avg mins (WIP)',
                                                        data: cycleTimePerStation.map(r => Number(r.avgMinutes.toFixed(1))),
                                                        backgroundColor: 'rgba(245, 158, 11, 0.85)',
                                                        borderRadius: 10,
                                                        barThickness: 10,
                                                    },
                                                    {
                                                        label: 'Threshold',
                                                        data: cycleTimePerStation.map(r => r.thresholdMinutes),
                                                        backgroundColor: 'rgba(148, 163, 184, 0.45)',
                                                        borderRadius: 10,
                                                        barThickness: 10,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: 'y',
                                                plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 } } } },
                                                scales: {
                                                    x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
                                                    y: { ticks: { color: '#475569', font: { size: 10, weight: '600' } }, grid: { display: false } },
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="card-footer bg-white border-top px-3 py-2">
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            Worst station: <strong>{cycleTimePerStation[0]?.name || 'N/A'}</strong>
                                            {cycleTimePerStation[0] ? (
                                                <> • Exceeds by <strong>{Math.max(0, cycleTimePerStation[0].exceedsPct).toFixed(0)}%</strong></>
                                            ) : null}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* 🥉 FPY */}
                            <div className="col-lg-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold mb-0 uppercase text-dark" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>TOP 3 — First Pass Yield (FPY)</h6>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Completed ÷ (Completed + NG)</small>
                                        </div>
                                        <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.65rem', fontWeight: '700' }}>FPY {fpy.pct.toFixed(1)}%</span>
                                    </div>
                                    <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
                                        <div style={{ width: 260, height: 220, position: 'relative' }}>
                                            <Doughnut
                                                data={{
                                                    labels: ['Pass', 'Fail'],
                                                    datasets: [
                                                        {
                                                            data: [Number(fpy.pct.toFixed(1)), Number((100 - fpy.pct).toFixed(1))],
                                                            backgroundColor: ['#10b981', '#ef4444'],
                                                            borderColor: ['#fff', '#fff'],
                                                            borderWidth: 4,
                                                            cutout: '72%',
                                                            borderRadius: 10,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { size: 11 } } } },
                                                }}
                                            />
                                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                <div className="text-uppercase fw-bold" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>FPY</div>
                                                <div className="fw-black" style={{ fontSize: '2rem', color: '#0f172a' }}>{fpy.pct.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex flex-wrap gap-3">
                                                <div className="card border-0 shadow-sm p-3" style={{ minWidth: 220, backgroundColor: '#f8fafc' }}>
                                                    <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>Processed</div>
                                                    <div className="fw-black" style={{ fontSize: '1.6rem' }}>{fpy.processed}</div>
                                                    <div className="small text-muted" style={{ fontSize: '0.7rem' }}>Completed + NG</div>
                                                </div>
                                                <div className="card border-0 shadow-sm p-3" style={{ minWidth: 220, backgroundColor: '#f0fdf4' }}>
                                                    <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>Completed</div>
                                                    <div className="fw-black text-success" style={{ fontSize: '1.6rem' }}>{fpy.completed}</div>
                                                    <div className="small text-muted" style={{ fontSize: '0.7rem' }}>First-pass success</div>
                                                </div>
                                                <div className="card border-0 shadow-sm p-3" style={{ minWidth: 220, backgroundColor: '#fef2f2' }}>
                                                    <div className="text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.5px' }}>NG</div>
                                                    <div className="fw-black text-danger" style={{ fontSize: '1.6rem' }}>{fpy.ng}</div>
                                                    <div className="small text-muted" style={{ fontSize: '0.7rem' }}>First-pass fail</div>
                                                </div>
                                            </div>
                                            <div className="small text-muted mt-2" style={{ fontSize: '0.7rem' }}>
                                                Tip: FPY drops usually indicate checklist gaps, test failures, or rework loops in specific stations.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mt-4">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h6 className="fw-bold mb-0 uppercase text-dark" style={{ fontSize: '0.8rem' }}>Unscanned Units</h6>
                            </div>
                            <div className="card-body p-0">
                                <UnscannedUnitsTable unscannedUnits={unitLogs.filter(u => u.status === 'For Scanning')} />
                            </div>
                        </div>
                    </div>
                );
            case "qr_generator":
                return (
                    <div className="card border">
                        <div className="card-header bg-dark text-white py-3"><h5 className="mb-0 fw-bold">Batch Generator</h5></div>
                        <div className="card-body p-4">
                            <form onSubmit={handleGenerateQR}>
                                <div className="row g-3">
                                    <div className="col-md-12"><label className="fw-bold small text-muted">BATCH QUANTITY</label><input type="number" className="form-control" value={qrFormData.quantity} onChange={(e) => setQrFormData({...qrFormData, quantity: e.target.value})} required /></div>
                                    <div className="col-md-6"><label className="small fw-bold text-muted">MODEL</label><input type="text" className="form-control" value={qrFormData.model} onChange={(e) => setQrFormData({...qrFormData, model: e.target.value})} /></div>
                                    <div className="col-md-6"><label className="small fw-bold text-muted">REVISION</label><input type="text" className="form-control" value={qrFormData.revision} onChange={(e) => setQrFormData({...qrFormData, revision: e.target.value})} /></div>
                                </div>
                                <button type="submit" className="btn btn-primary mt-4 fw-bold px-4">Generate QR Batch</button>
                            </form>
                            <GeneratedQRList list={generatedQRList} onSave={handleSaveToDB} onDiscard={() => setGeneratedQRList([])} isSaving={isSaving} />
                        </div>
                    </div>
                );
            case "station_monitor":
                return (
                    <div className="container-fluid px-0">
                        <div className="row g-3">
                            {stations.map(s => {
                                const stationUnits = unitLogs.filter(u => u.station?.toString().replace(/\s+/g, '') === s.id);
                                const m = calculateStationMetrics(stationUnits);
                                return (
                                    <div key={s.id} className="col-md-3">
                                        <div className="card border h-100">
                                            <div className="card-body p-3">
                                                <div className="text-muted mb-1" style={{ fontSize: '0.65rem', fontWeight: '800' }}>ID: {s.id}</div>
                                                <h6 className="fw-bold text-dark mb-3 border-bottom pb-1">{s.name}</h6>
                                                <div className="bg-light p-2 mb-3 border">
                                                    <div className="d-flex justify-content-between small mb-1"><span>COMPLETED</span><b>{m.completed}</b></div>
                                                    <div className="d-flex justify-content-between small mb-1"><span>IN PROGRESS</span><b>{m.inProgress}</b></div>
                                                    <div className="d-flex justify-content-between small text-danger"><span>NO GOOD (NG)</span><b>{m.noGood}</b></div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-dark btn-sm flex-grow-1 fw-bold" onClick={() => { setActiveMonitorStationId(s.id); setActiveTab('station_details'); }}>MONITOR</button>
                                                    <button className="btn btn-light border btn-sm px-2" onClick={() => setActiveHistoryStation(s.id)}><i className="bi bi-clock-history"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case "station_details":
                return <LiveMonitoringTable stationId={activeMonitorStationId} units={unitLogs} onBack={() => setActiveTab('station_monitor')} calculateStationMetrics={calculateStationMetrics} />;
            case "approvals":
                return (
                    <>
                        <div className="card border shadow-sm">
                            <div className="card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center">
                                <span>APPROVALS QUEUE</span>
                                <span className="badge bg-white text-danger">
                                    {unitLogs.filter(u => u.status === 'Pending Approval').length} Units
                                </span>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered table-sm mb-0 uppercase" style={{ fontSize: '0.75rem' }}>
                                        <thead className="table-dark">
                                            <tr>
                                                <th>MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th><th>DEVICE SERIAL</th><th>STATUS</th><th>REMARKS</th><th>TIMESTAMP</th>
                                                <th className="text-center bg-primary">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unitLogs.filter(u => u.status === 'Pending Approval').map(u => (
                                                <tr key={u.id} className="align-middle">
                                                    <td>{u.model}</td><td>{u.revision}</td><td>{u.base_unit_kitting_no}</td>
                                                    <td className="fw-bold text-primary">{u.assembly_no}</td><td>{u.device_serial_no || 'N/A'}</td>
                                                    <td><span className="badge bg-warning text-dark">{u.status}</span></td>
                                                    <td>{u.remarks || '---'}</td>
                                                    <td>{u.created_at}</td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="btn btn-success btn-sm fw-bold px-3 rounded-pill shadow-sm"
                                                            onClick={() => handleApproveButtonClick(u)} 
                                                        >
                                                            <i className="bi bi-check-circle-fill me-1"></i> APPROVE
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 🔑 CUSTOM MODAL INTEGRATION */}
                        {pendingUnit && (
                            <ApprovalConfirmationModal 
                                unit={pendingUnit} 
                                onClose={() => setPendingUnit(null)} 
                                onConfirm={handleConfirmApproval}
                                isProcessing={processStatus === 'loading'}
                            />
                        )}
                    </>
                );
            case "inventory":
                const getHistoryStatus = (status) => {
                    const statusLower = (status || '').toLowerCase();
                    if (statusLower.includes('dispatched')) {
                        return <span className="badge bg-success">Already Dispatched</span>;
                    }
                    if (statusLower.includes('completed') || 
                        statusLower.includes('no good') || 
                        statusLower.includes('ng') ||
                        statusLower.includes('pending') ||
                        statusLower.includes('in progress') ||
                        statusLower.includes('for scanning')) {
                        return <span className="badge bg-warning text-dark">Still on Production</span>;
                    }
                    return <span className="badge bg-secondary">Unknown</span>;
                };

                const formatDateTime = (dateStr) => {
                    if (!dateStr) return 'N/A';
                    try {
                        const date = new Date(dateStr);
                        return date.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });
                    } catch {
                        return dateStr;
                    }
                };

                return (
                    <div>
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="fw-bold mb-0 uppercase text-dark" style={{ fontSize: '0.85rem' }}>Unit Inventory</h6>
                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>All generated units with generation history</small>
                                </div>
                                <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.7rem', fontWeight: '700' }}>
                                    {filteredInventory.length} {filteredInventory.length === 1 ? 'Unit' : 'Units'}
                                </span>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="position-relative">
                                            <i className="bi bi-search position-absolute start-0 ms-3 top-50 translate-middle-y text-muted"></i>
                                            <input 
                                                type="text" 
                                                className="form-control ps-5" 
                                                placeholder="Search by Assembly No or Model..." 
                                                value={inventorySearch}
                                                onChange={(e) => setInventorySearch(e.target.value)}
                                                style={{ height: '40px' }}
                                            />
                                        </div>
                                    </div>
                                    {inventorySearch && (
                                        <div className="col-md-6 d-flex align-items-center">
                                            <button 
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setInventorySearch('')}
                                            >
                                                <i className="bi bi-x-circle me-1"></i> Clear Search
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover table-bordered mb-0 uppercase" style={{ fontSize: '0.75rem' }}>
                                        <thead className="table-dark">
                                            <tr>
                                                <th style={{ width: '15%' }}>MODEL</th>
                                                <th style={{ width: '18%' }}>ASSEMBLY NO</th>
                                                <th style={{ width: '12%' }}>REVISION</th>
                                                <th style={{ width: '15%' }}>BASE UNIT KIT</th>
                                                <th style={{ width: '15%' }}>ACCESSORY KIT</th>
                                                <th style={{ width: '18%' }}>GENERATION DATE & TIME</th>
                                                <th style={{ width: '17%' }}>HISTORY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedInventory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-muted">
                                                        {inventorySearch ? 'No units found matching your search.' : 'No units in inventory.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedInventory.map(u => (
                                                    <tr key={u.id} className="align-middle">
                                                        <td className="fw-bold">{u.model || 'N/A'}</td>
                                                        <td className="fw-bold text-primary">{u.assembly_no || 'N/A'}</td>
                                                        <td>{u.revision || 'N/A'}</td>
                                                        <td>{u.base_unit_kitting_no || 'N/A'}</td>
                                                        <td>{u.accessory_kitting_no || 'N/A'}</td>
                                                        <td>
                                                            <div className="small">
                                                                <div className="fw-bold">{formatDateTime(u.created_at)}</div>
                                                            </div>
                                                        </td>
                                                        <td>{getHistoryStatus(u.status)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {totalPages > 1 && (
                                <div className="card-footer bg-white border-top d-flex justify-content-between align-items-center py-3">
                                    <div className="text-muted small">
                                        Showing {((inventoryCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(inventoryCurrentPage * ITEMS_PER_PAGE, filteredInventory.length)} of {filteredInventory.length} units
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${inventoryCurrentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setInventoryCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={inventoryCurrentPage === 1}
                                                >
                                                    <i className="bi bi-chevron-left"></i>
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <li key={page} className={`page-item ${inventoryCurrentPage === page ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => setInventoryCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${inventoryCurrentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setInventoryCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={inventoryCurrentPage === totalPages}
                                                >
                                                    <i className="bi bi-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            <style>{`
                .sidebar-link { border-radius: 0; padding: 14px 20px; border: none; background: transparent; color: #9ca3af; width: 100%; text-align: left; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.5px; display: flex; align-items: center; gap: 12px; border-left: 4px solid transparent; }
                .sidebar-link i { font-size: 1.1rem; }
                .sidebar-link:hover { background: #1f2937; color: #fff; }
                .sidebar-link.active { background: #1f2937; color: #fff; border-left-color: #ef4444; }
                .sidebar-label { font-size: 0.65rem; font-weight: 800; color: #4b5563; padding: 20px 20px 10px; letter-spacing: 1px; }
                .avatar-clickable:hover { opacity: 0.8; cursor: pointer; transform: scale(1.05); transition: 0.2s; }
                .uppercase { text-transform: uppercase; }
            `}</style>

            <div className="d-flex flex-column flex-shrink-0 p-3 text-white position-fixed" 
                style={{ 
                    width: "260px", 
                    backgroundColor: "#0f172a", 
                    height: '100vh', 
                    zIndex: 1000, 
                    top: 0, 
                    left: 0,
                    borderRight: "1px solid rgba(255,255,255,0.05)" 
                }}>
                
                <style>
                    {`
                        .sidebar-link {
                            width: 100%;
                            text-align: left;
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            padding: 0.6rem 1rem;
                            background: transparent;
                            border: 1px solid transparent;
                            border-radius: 8px;
                            color: #94a3b8;
                            font-size: 0.85rem;
                            font-weight: 400;
                            transition: all 0.2s ease;
                            margin-bottom: 0.25rem;
                            outline: none !important;
                        }
                        .active-glass {
                            background: rgba(255, 255, 255, 0.1) !important;
                            backdrop-filter: blur(10px);
                            border: 1px solid rgba(255, 255, 255, 0.05) !important;
                            color: white !important;
                        }
                    `}
                </style>

                {/* PROFILE SECTION */}
                <div className="d-flex align-items-center mb-3 mt-1 px-1">
                    <div className="position-relative flex-shrink-0" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
                        <img src={currentAvatar ? `${AVATAR_UPLOAD_PATH}${currentAvatar}` : DEFAULT_AVATAR_PATH} alt="Profile" className="rounded-circle avatar-hover" style={{ width: '42px', height: '42px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <span className="position-absolute bottom-0 end-0 bg-success border border-dark rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                    </div>
                    <div className="ms-3 overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
                        <div className="text-white text-truncate" style={{ fontSize: '0.85rem', fontWeight: '400' }}>{currentFullName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px', letterSpacing: '0.3px' }}>Authorized IT Assistant</div>
                    </div>
                </div>

                <hr className="border-secondary opacity-25 mt-2" />

                <div className="nav flex-column flex-grow-1 overflow-auto custom-scrollbar">
                    <div className="sidebar-label">Main Navigation</div>
                    <button className={`sidebar-link ${activeTab === 'overview' ? 'active-glass' : ''}`} onClick={() => setActiveTab('overview')}><i className="bi bi-grid-1x2"></i> OVERVIEW</button>
                    <button className={`sidebar-link ${activeTab === 'qr_generator' ? 'active-glass' : ''}`} onClick={() => setActiveTab('qr_generator')}><i className="bi bi-qr-code-scan"></i> QR GENERATOR</button>
                    <button className={`sidebar-link ${activeTab.includes('station') ? 'active-glass' : ''}`} onClick={() => setActiveTab('station_monitor')}><i className="bi bi-layers-half"></i> STATION MONITOR</button>
                    <button className={`sidebar-link ${activeTab === 'inventory' ? 'active-glass' : ''}`} onClick={() => setActiveTab('inventory')}><i className="bi bi-box-seam"></i> INVENTORY</button>
                    <button className={`sidebar-link ${activeTab === 'approvals' ? 'active-glass' : ''}`} onClick={() => setActiveTab('approvals')}><i className="bi bi-check-circle"></i> APPROVALS</button>
                    <div className="sidebar-label">System</div>
                    <button onClick={onLogout} className="sidebar-link" style={{ color: '#ef4444' }}><i className="bi bi-power"></i> LOGOUT SESSION</button>
                </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: "260px", backgroundColor: "#eeeeee", height: '100vh', overflow: 'hidden' }}>
                <header className="bg-white d-flex justify-content-between align-items-center px-4 shadow-sm sticky-top z-2" style={{ height: '70px', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                        <h6 className="mb-0 fw-bold text-dark text-uppercase">{activeTab.replace('_', ' ')}</h6>
                        <small className="text-muted d-none d-sm-block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</small>
                    </div>
                    <div className="badge rounded-pill bg-light text-secondary border px-3 py-2" style={{ fontSize: '0.65rem', fontWeight: '500' }}><i className="bi bi-shield-check me-1"></i> SECURE SESSION</div>
                </header>

                <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
                    <div className="fade-in">{renderContent()}</div>
                </div>

                {showProfileModal && (
                    <UserProfileModal user={user} currentAvatar={currentAvatar ? `${AVATAR_UPLOAD_PATH}${currentAvatar}` : DEFAULT_AVATAR_PATH} currentFullName={currentFullName} onClose={() => setShowProfileModal(false)} onSave={handleUpdateProfile} />
                )}

                <LoadingOverlay status={processStatus} message={statusMessage} />
                {showModal && <CustomMessageModal title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} onClose={() => setShowModal(false)} />}
                {activeHistoryStation && <StationHistoryModal stationId={activeHistoryStation} onClose={() => setActiveHistoryStation(null)} user={user} />}
            </div>
        </div>
    );
}