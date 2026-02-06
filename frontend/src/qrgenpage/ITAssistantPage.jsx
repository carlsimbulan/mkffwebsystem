import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { SubmitReportModal } from './modals/SubmitReportModal';
import { ReportDetailModal } from './modals/ReportDetailModal';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTargetTimes } from '../utils/targetTimeService';

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
const REPORTS_ENDPOINT = `${API_BASE_URL}/daily_reports.php`;
const ANNOUNCEMENTS_ENDPOINT = `${API_BASE_URL}/announcements.php`;
const MAX_QR_COUNT = 100;

const PROCESS_STATIONS = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

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

    // Use dynamic target times
    const { thresholds: dynamicDelayThresholds } = useTargetTimes();

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
    
    // Reports and Announcements states
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportFilterStationId, setReportFilterStationId] = useState('All');
    const [lastReadAnnouncementId, setLastReadAnnouncementId] = useState(0);
    const [announcementSelectedDate, setAnnouncementSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    
    // Search and QR states
    const [searchTerm, setSearchTerm] = useState('');
    const [qrValue, setQrValue] = useState('');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const stepperRef = useRef(null);

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

    const fetchReports = async () => {
        try {
            const res = await axios.get(REPORTS_ENDPOINT);
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(ANNOUNCEMENTS_ENDPOINT);
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        }
    };

    useEffect(() => {
        const mockStations = PROCESS_STATIONS.map((name, i) => ({
            id: `Station${i + 1}`, 
            name: name,
        }));
        setStations(mockStations);
        fetchUnitData(true);
        fetchReports();
        fetchAnnouncements();
        
        // Real-time polling every 1 second for all data
        const interval = setInterval(() => {
            fetchUnitData(false);
            fetchReports();
            fetchAnnouncements();
        }, 1000);
        
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

    // QR Input Handler
    const handleQrInput = (val) => {
        setQrValue(val);
        const parts = val.split(/[|]+/);
        const assemblyFromQR = parts.find(p => p.trim().toUpperCase().startsWith('ASSY-'))?.trim();
        if (assemblyFromQR) {
            const matchedUnit = unitLogs.find(l => l.assembly_no?.toLowerCase() === assemblyFromQR.toLowerCase());
            if (matchedUnit) {
                setSelectedUnit(matchedUnit);
                setQrValue('');
            }
        }
    };

    // Search Results
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return unitLogs.filter(l => l.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
    }, [unitLogs, searchTerm]);

    // Stepper scroll
    const scrollStepper = (direction) => {
        if (stepperRef.current) {
            const scrollAmount = 300;
            stepperRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
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
            const threshold = dynamicDelayThresholds[s.id] || 10;
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

    // Auto-mark announcements as read when viewing announcements tab
    useEffect(() => {
        if (activeTab === 'announcements' && announcements.length > 0) {
            const latestId = Math.max(...announcements.map(a => parseInt(a.id) || 0));
            const currentLastRead = parseInt(lastReadAnnouncementId) || 0;
            if (latestId > currentLastRead) {
                setLastReadAnnouncementId(latestId);
            }
        }
    }, [activeTab, announcements, lastReadAnnouncementId]);

    // Filtered reports
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const reportDate_obj = new Date(report.created_at);
            const reportDateStr = reportDate_obj.toISOString().split('T')[0];
            const matchesDate = reportDateStr === reportDate;
            const matchesStation = reportFilterStationId === 'All' || report.station === reportFilterStationId;
            return matchesDate && matchesStation;
        });
    }, [reports, reportDate, reportFilterStationId]);

    // Calculate counts for badges
    const pendingApprovalsCount = useMemo(() => {
        return unitLogs.filter(u => u.status === 'Pending Approval').length;
    }, [unitLogs]);

    const todayReportsCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return reports.filter(report => {
            const reportDate_obj = new Date(report.created_at);
            const reportDateStr = reportDate_obj.toISOString().split('T')[0];
            return reportDateStr === today;
        }).length;
    }, [reports]);

    const unreadAnnouncementsCount = useMemo(() => {
        const numericLastReadId = parseInt(lastReadAnnouncementId) || 0;
        return announcements.filter(a => parseInt(a.id) > numericLastReadId).length;
    }, [announcements, lastReadAnnouncementId]);

    const handleGenerateQR = async (e) => {
        e.preventDefault();
        const quantity = parseInt(qrFormData.quantity, 10);
        if (quantity < 1 || quantity > MAX_QR_COUNT) return;
        
        setProcessStatus('loading');
        setStatusMessage("Generating QR codes...");
        
        try {
            // Fetch unique board numbers from API
            const boardResponse = await axios.get(`${UNITS_ENDPOINT}?generate_board_numbers&quantity=${quantity}`);
            
            if (boardResponse.data.status !== 'success') {
                throw new Error('Failed to generate board numbers');
            }
            
            const boardNumbers = boardResponse.data.board_numbers;
            const newQRList = [];
            let currentAssembly = nextAssemblyNo;
            
            for (let i = 0; i < quantity; i++) {
                const assyNum = `ASSY-${formatSerial(currentAssembly)}`;
                const boards = boardNumbers[i];
                
                // Create QR string with assembly and board numbers
                const qrString = `${qrFormData.model}|${qrFormData.revision}|${qrFormData.baseKit}|${assyNum}|${boards.mnbd_no}|${boards.cmbd_no}|${boards.lrbd_no}|${boards.pqbd_no}|${boards.bkbd_no}|${qrFormData.accKit}`;
                
                newQRList.push({ 
                    assembly_no: assyNum, 
                    model: qrFormData.model, 
                    revision: qrFormData.revision, 
                    base_unit_kitting_no: qrFormData.baseKit, 
                    accessory_kitting_no: qrFormData.accKit,
                    // Add board numbers
                    mnbd_board_no: boards.mnbd_no,
                    cmbd_board_no: boards.cmbd_no,
                    lrbd_board_no: boards.lrbd_no,
                    pqbd_board_no: boards.pqbd_no,
                    bkbd_board_no: boards.bkbd_no,
                    qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrString)}`, 
                    status: 'For Scanning' 
                });
                currentAssembly++;
            }
            
            setGeneratedQRList(newQRList);
            setProcessStatus('idle'); // Just set to idle, no success message
            
        } catch (error) {
            setProcessStatus('error');
            setStatusMessage("Failed to generate QR codes.");
            setTimeout(() => setProcessStatus('idle'), 3000);
        }
    };

    const handleSaveToDB = async () => {
        setProcessStatus('loading');
        setStatusMessage("Saving batch to database...");
        try {
            // First save units to main units table with 'For Scanning' status and 'N/A' station
            await Promise.all(generatedQRList.map(unit => axios.post(UNITS_ENDPOINT, { 
                ...unit, 
                action: 'create', 
                username: user.username, 
                station: 'N/A',
                status: 'For Scanning'
            })));
            
            // Then save board numbers to unit_pcba_details table
            for (const unit of generatedQRList) {
                // Get the unit ID from the created unit
                const unitResponse = await axios.get(`${UNITS_ENDPOINT}?search_assembly=${unit.assembly_no}`);
                if (unitResponse.data.length > 0) {
                    const unitId = unitResponse.data[0].id;
                    
                    // Save board numbers directly to unit_pcba_details table
                    await axios.post(`${UNITS_ENDPOINT}?method=PUT`, {
                        id: unitId,
                        assembly_no: unit.assembly_no,
                        status: 'For Scanning', // Keep as For Scanning
                        station: 'N/A', // Keep as N/A
                        username: user.username,
                        // Include board numbers
                        mnbd_no: unit.mnbd_board_no,
                        cmbd_no: unit.cmbd_board_no,
                        lrbd_no: unit.lrbd_board_no,
                        pqbd_no: unit.pqbd_board_no,
                        bkbd_no: unit.bkbd_board_no
                    });
                }
            }
            
            setProcessStatus('success');
            setStatusMessage("Batch saved successfully!");
            setGeneratedQRList([]); 
            fetchUnitData(false);
            setTimeout(() => setProcessStatus('idle'), 2000);
        } catch (error) {
            setProcessStatus('error');
            setStatusMessage("Failed to save batch: " + (error.response?.data?.error || error.message));
            setTimeout(() => setProcessStatus('idle'), 3000);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "overview": {
                const m = calculateMetrics(unitLogs);
                return (
                    <div>
                        {/* Search Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-0">Production Intel</h3>
                                <p className="text-muted small mb-0">Live Manufacturing Lifecycle Monitoring</p>
                            </div>
                            <div className="d-flex gap-3 align-items-center">
                                <div className="position-relative" style={{width: '180px'}}>
                                    <i className="bi bi-qr-code-scan position-absolute start-0 ms-3 top-50 translate-middle-y text-primary"></i>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-pill" 
                                        placeholder="Scan QR..." 
                                        value={qrValue} 
                                        onChange={(e) => handleQrInput(e.target.value)}
                                        style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div className="position-relative" style={{width: '280px'}}>
                                    <i className="bi bi-search position-absolute start-0 ms-3 top-50 translate-middle-y text-muted"></i>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-pill" 
                                        placeholder="Manual Search..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                                            {searchResults.map(unit => (
                                                <div 
                                                    key={unit.id} 
                                                    className="p-3 border-bottom" 
                                                    style={{cursor:'pointer'}} 
                                                    onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}
                                                >
                                                    <div className="fw-bold text-dark d-flex justify-content-between">
                                                        <span>{unit.assembly_no}</span>
                                                        <i className="bi bi-chevron-right small text-muted"></i>
                                                    </div>
                                                    <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                                        {unit.model} • <span className={`fw-bold ${unit.status?.toLowerCase().includes('no good') ? 'text-danger' : 'text-primary'}`}>{unit.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="icon-bg-box me-3" style={{ backgroundColor: '#f8fafc', color: '#334155', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-cpu" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <span className="text-muted fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Scanned Units</span>
                                            <h2 className="fw-bold mb-0">{m.totalTracked}</h2>
                                        </div>
                                    </div>
                                    <div className="badge bg-dark text-white p-2 d-inline-block" style={{ fontSize: '0.7rem', width: 'fit-content' }}>100.0% Share</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="icon-bg-box me-3" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-qr-code-scan" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <span className="text-info fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>For Scanning Queue</span>
                                            <h2 className="fw-bold mb-0">{m.forScanning}</h2>
                                        </div>
                                    </div>
                                    <div className="badge bg-info bg-opacity-10 text-info p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctForScanning}% Pending</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="icon-bg-box me-3" style={{ backgroundColor: '#fffbeb', color: '#d97706', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-clock-history" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <span className="text-warning fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>In Progress (WIP)</span>
                                            <h2 className="fw-bold mb-0">{m.inProgress}</h2>
                                        </div>
                                    </div>
                                    <div className="badge bg-warning bg-opacity-10 text-warning p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctInProgress}% Capacity</div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="icon-bg-box me-3" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-check-circle" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <span className="text-success fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Completed (Yield)</span>
                                            <h2 className="fw-bold mb-0">{m.completed}</h2>
                                        </div>
                                    </div>
                                    <div className="badge bg-success bg-opacity-10 text-success p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctCompleted}% Rate</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="icon-bg-box me-3" style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-exclamation-octagon" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <span className="text-danger fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Defects (NG)</span>
                                            <h2 className="fw-bold mb-0">{m.noGood}</h2>
                                        </div>
                                    </div>
                                    <div className="badge bg-danger bg-opacity-10 text-danger p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctNoGood}% Failure</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm p-3 bg-white h-100">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="icon-bg-box me-3" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="bi bi-shield-check" style={{ fontSize: '1.5rem' }}></i>
                                            </div>
                                            <div>
                                                <span className="text-primary fw-bold uppercase d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Pending QA Approval</span>
                                                <h2 className="fw-bold mb-0">{m.pendingApproval}</h2>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" style={{ fontSize: '0.7rem' }} onClick={() => setActiveTab('approvals')}>GO <i className="bi bi-chevron-right ms-1"></i></button>
                                    </div>
                                    <div className="badge bg-primary bg-opacity-10 text-primary p-2" style={{ fontSize: '0.7rem', width: 'fit-content' }}>{m.pctPending}% Units</div>
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

                        {/* Unit Tracker Modal */}
                        {selectedUnit && (
                            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <div className="bg-white rounded-4 shadow-2xl overflow-hidden border-0" style={{ width: '90%', maxWidth: '950px' }}>
                                    <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
                                        <div>
                                            <h6 className="mb-0 fw-bold">Unit Process Tracker</h6>
                                            <p className="mb-0" style={{fontSize: '0.7rem', opacity: 0.8}}>{selectedUnit.assembly_no} • {selectedUnit.model}</p>
                                        </div>
                                        <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                                    </div>
                                    <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 mb-4 border-0 shadow-sm">
                                            <div>
                                                <div className="text-uppercase fw-bold mb-1" style={{fontSize: '0.6rem', color: '#64748b'}}>Current Status</div>
                                                <span className={`badge rounded-pill px-3 py-2 ${selectedUnit.status?.toLowerCase().includes('no good') ? 'bg-danger' : selectedUnit.status?.toLowerCase().includes('completed') ? 'bg-success' : 'bg-primary'}`}>
                                                    {selectedUnit.status}
                                                </span>
                                            </div>
                                            <div className="text-end">
                                                <div className="text-uppercase fw-bold mb-1" style={{fontSize: '0.6rem', color: '#64748b'}}>Last Station</div>
                                                <div className="fw-bold text-primary small">{selectedUnit.station || 'Pending'}</div>
                                            </div>
                                        </div>
                                        <div className="position-relative">
                                            <button 
                                                className="btn btn-sm btn-light position-absolute start-0 top-50 translate-middle-y" 
                                                style={{zIndex: 10}}
                                                onClick={() => scrollStepper('left')}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                            <div 
                                                ref={stepperRef}
                                                className="d-flex gap-3 overflow-auto pb-3" 
                                                style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}
                                            >
                                                {PROCESS_STATIONS.map((station, idx) => {
                                                    const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
                                                    const unitStatus = selectedUnit.status?.toLowerCase() || '';
                                                    const isNG = unitStatus.includes('no good') || unitStatus.includes('ng');
                                                    const isDone = idx < currentStationIdx || (idx === currentStationIdx && (unitStatus.includes('completed') || unitStatus.includes('finished')));
                                                    const isCurrent = idx === currentStationIdx;
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`card border-0 shadow-sm p-3 ${isDone ? 'bg-success bg-opacity-10' : isCurrent ? (isNG ? 'bg-danger bg-opacity-10' : 'bg-primary bg-opacity-10') : ''}`}
                                                            style={{ minWidth: '200px' }}
                                                        >
                                                            <div className={`fw-bold mb-2 ${isDone ? 'text-success' : isCurrent ? (isNG ? 'text-danger' : 'text-primary') : 'text-muted'}`}>
                                                                {isDone ? <i className="bi bi-check-circle-fill me-2"></i> : `${idx + 1}.`} {station}
                                                            </div>
                                                            <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                                {isDone ? 'Completed' : isCurrent ? 'Current Station' : 'Pending'}
                                                            </small>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button 
                                                className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y" 
                                                style={{zIndex: 10}}
                                                onClick={() => scrollStepper('right')}
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-light border-top d-flex gap-2">
                                        <button className="btn btn-outline-dark w-100 rounded-pill fw-bold py-2" style={{fontSize: '0.8rem'}} onClick={() => setSelectedUnit(null)}>DISMISS</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case "qr_generator":
                return (
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold text-dark">QR Code Batch Generator</h6>
                            <small className="text-muted">Generate QR codes for new units</small>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleGenerateQR}>
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold text-muted">Batch Quantity</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={qrFormData.quantity} 
                                            onChange={(e) => setQrFormData({...qrFormData, quantity: e.target.value})} 
                                            required 
                                            min="1"
                                            max={MAX_QR_COUNT}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-muted">Model</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={qrFormData.model} 
                                            onChange={(e) => setQrFormData({...qrFormData, model: e.target.value})} 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-muted">Revision</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={qrFormData.revision} 
                                            onChange={(e) => setQrFormData({...qrFormData, revision: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary mt-4 fw-bold px-4"
                                    disabled={processStatus === 'loading'}
                                >
                                    {processStatus === 'loading' ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-qr-code me-2"></i>
                                            Generate QR Batch
                                        </>
                                    )}
                                </button>
                            </form>
                            <GeneratedQRList 
                                list={generatedQRList} 
                                onSave={handleSaveToDB} 
                                onDiscard={() => setGeneratedQRList([])} 
                                isSaving={processStatus === 'loading'} 
                            />
                        </div>
                    </div>
                );
            case "station_monitor": {
                return (
                    <div className="container-fluid px-0">
                        <div className="row g-3">
                            {stations.map(s => {
                                const stationUnits = unitLogs.filter(u => u.station?.toString().replace(/\s+/g, '') === s.id);
                                const m = calculateStationMetrics(stationUnits);
                                
                                // Calculate target time metrics
                                const thresholdMinutes = dynamicDelayThresholds[s.id] || 10;
                                const inProgressLogs = stationUnits.filter(log => {
                                    const statusText = (log.status || '').toLowerCase();
                                    return log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                                });
                                
                                const avgActualTime = inProgressLogs.length > 0 ? 
                                    inProgressLogs.reduce((sum, log) => {
                                        const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
                                        const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
                                        return sum + minutesInStation;
                                    }, 0) / inProgressLogs.length : 0;
                                
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
                                                
                                                {/* Target Time */}
                                                <div className="bg-light p-2 mb-3 border">
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <span>TARGET TIME</span>
                                                        <b>{thresholdMinutes}m</b>
                                                    </div>
                                                    <div className="d-flex justify-content-between small">
                                                        <span>AVG ACTUAL</span>
                                                        <b className={avgActualTime > thresholdMinutes ? 'text-danger' : 'text-success'}>
                                                            {avgActualTime.toFixed(1)}m
                                                        </b>
                                                    </div>
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
            }
            case "station_details": {
                console.log('Station Details - stationId:', activeMonitorStationId);
                console.log('Station Details - units count:', unitLogs.length);
                console.log('Station Details - sample unit stations:', unitLogs.slice(0, 3).map(u => u.station));
                return <LiveMonitoringTable stationId={activeMonitorStationId} units={unitLogs} onBack={() => { setActiveMonitorStationId(null); setActiveTab('station_monitor'); }} calculateStationMetrics={calculateStationMetrics} />;
            }
            case "approvals":
                return (
                    <>
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white py-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0 fw-bold text-dark">Approvals Queue</h6>
                                        <small className="text-muted">Units pending quality assurance approval</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                                        {unitLogs.filter(u => u.status === 'Pending Approval').length} Units
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 px-4 fw-bold text-muted">MODEL</th>
                                                <th className="py-3 px-4 fw-bold text-muted">REVISION</th>
                                                <th className="py-3 px-4 fw-bold text-muted">BASE UNIT</th>
                                                <th className="py-3 px-4 fw-bold text-muted">ASSEMBLY</th>
                                                <th className="py-3 px-4 fw-bold text-muted">DEVICE SERIAL</th>
                                                <th className="py-3 px-4 fw-bold text-muted">STATUS</th>
                                                <th className="py-3 px-4 fw-bold text-muted">REMARKS</th>
                                                <th className="py-3 px-4 fw-bold text-muted">TIMESTAMP</th>
                                                <th className="py-3 px-4 fw-bold text-muted text-center">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unitLogs.filter(u => u.status === 'Pending Approval').length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-5 text-muted">
                                                        <i className="bi bi-inbox display-6 d-block mb-3 opacity-25"></i>
                                                        <div style={{ fontSize: '0.9rem' }}>No units pending approval</div>
                                                        <small className="text-muted">All units are currently in production or completed</small>
                                                    </td>
                                                </tr>
                                            ) : (
                                                unitLogs.filter(u => u.status === 'Pending Approval').map(u => (
                                                    <tr key={u.id} className="align-middle border-bottom">
                                                        <td className="px-4 py-3">{u.model}</td>
                                                        <td className="px-4 py-3">{u.revision}</td>
                                                        <td className="px-4 py-3">{u.base_unit_kitting_no}</td>
                                                        <td className="px-4 py-3">
                                                            <code className="bg-light px-2 py-1 rounded text-dark fw-bold">{u.assembly_no}</code>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted">{u.device_serial_no || 'N/A'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                                {u.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted">{u.remarks || '---'}</td>
                                                        <td className="px-4 py-3 text-muted" style={{ fontSize: '0.75rem' }}>{u.created_at}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button 
                                                                className="btn btn-dark btn-sm px-3 py-2 fw-bold"
                                                                onClick={() => handleApproveButtonClick(u)} 
                                                                style={{ fontSize: '0.7rem', letterSpacing: '0.3px' }}
                                                            >
                                                                <i className="bi bi-check-lg me-1"></i> APPROVE
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
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
            case "inventory": {
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
                                    <h6 className="fw-bold mb-0 text-dark">Unit Inventory</h6>
                                    <small className="text-muted">All generated units with generation history</small>
                                </div>
                                <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
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
                                    <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 px-4 fw-bold text-muted">MODEL</th>
                                                <th className="py-3 px-4 fw-bold text-muted">ASSEMBLY NO</th>
                                                <th className="py-3 px-4 fw-bold text-muted">REVISION</th>
                                                <th className="py-3 px-4 fw-bold text-muted">BASE UNIT KIT</th>
                                                <th className="py-3 px-4 fw-bold text-muted">ACCESSORY KIT</th>
                                                <th className="py-3 px-4 fw-bold text-muted">GENERATION DATE & TIME</th>
                                                <th className="py-3 px-4 fw-bold text-muted">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedInventory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-5 text-muted">
                                                        <i className="bi bi-inbox display-6 d-block mb-3 opacity-25"></i>
                                                        <div>{inventorySearch ? 'No units found matching your search.' : 'No units in inventory.'}</div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedInventory.map(u => (
                                                    <tr key={u.id}>
                                                        <td className="px-4 py-3">{u.model || 'N/A'}</td>
                                                        <td className="px-4 py-3">
                                                            <code className="bg-light px-2 py-1 rounded text-primary fw-bold">{u.assembly_no || 'N/A'}</code>
                                                        </td>
                                                        <td className="px-4 py-3">{u.revision || 'N/A'}</td>
                                                        <td className="px-4 py-3">{u.base_unit_kitting_no || 'N/A'}</td>
                                                        <td className="px-4 py-3">{u.accessory_kitting_no || 'N/A'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="small text-muted">{formatDateTime(u.created_at)}</div>
                                                        </td>
                                                        <td className="px-4 py-3">{getHistoryStatus(u.status)}</td>
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
            }
            case "reports": {
                const calculateYieldRate = (report) => {
                    const total = report.total_units_processed || 0;
                    const ng = report.total_ng || 0;
                    return total > 0 ? ((total - ng) / total * 100).toFixed(1) : '0.0';
                };

                const getTodayDate = () => {
                    return new Intl.DateTimeFormat('en-CA', {
                        timeZone: 'Asia/Manila',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).format(new Date());
                };

                const enhancedFilterStations = [
                    { id: 'All', name: 'ALL STATIONS' }, 
                    { id: 'overall', name: 'OVERALL REPORTS' },
                    ...stations.map(s => ({ ...s, name: s.name.toUpperCase() }))
                ];

                const handleViewReport = (report) => {
                    setSelectedReport(report);
                };

                return (
                    <div className="container-fluid px-0 py-2">
                        <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">Reports Archive</h3>
                                <p className="text-muted small mb-0 fw-bold">Manufacturing quality analytics and performance metrics</p>
                            </div>
                            <button className="btn btn-dark fw-bold px-4 rounded-pill" onClick={() => setShowReportModal(true)}>
                                <i className="bi bi-plus-circle me-2"></i>
                                CREATE ENTRY
                            </button>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h6 className="mb-0 fw-bold text-dark">Filter Reports</h6>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold text-muted" style={{fontSize: '0.75rem'}}>Target Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={reportDate}
                                            onChange={(e) => setReportDate(e.target.value)}
                                            max={getTodayDate()} 
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-muted" style={{fontSize: '0.75rem'}}>Station Source</label>
                                        <select
                                            className="form-select"
                                            value={reportFilterStationId}
                                            onChange={(e) => setReportFilterStationId(e.target.value)}
                                        >
                                            {enhancedFilterStations.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col text-end">
                                        <span className="badge bg-primary rounded-pill px-3 py-2" style={{fontSize: '0.75rem'}}>
                                            {filteredReports.length} RECORDS
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-3 px-4 fw-bold text-muted">SOURCE STATION</th>
                                                <th className="py-3 px-4 fw-bold text-muted text-center">UNITS PROCESSED</th>
                                                <th className="py-3 px-4 fw-bold text-muted text-center">TOTAL NG</th>
                                                <th className="py-3 px-4 fw-bold text-muted text-center">YIELD RATE</th>
                                                <th className="py-3 px-4 fw-bold text-muted">DATE & TIME</th>
                                                <th className="py-3 px-4 fw-bold text-muted text-center">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReports.length > 0 ? filteredReports.map(report => {
                                                const yieldRate = calculateYieldRate(report);
                                                const isYieldGood = parseFloat(yieldRate) >= 95;
                                                
                                                return (
                                                    <tr key={report.id}>
                                                        <td className="px-4 py-3 fw-bold text-uppercase">
                                                            {report.station === 'overall' ? 'SYSTEM OVERALL' : 
                                                             stations.find(s => s.id === report.station)?.name || report.station}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="badge bg-light text-dark border px-3 py-2">
                                                                {report.total_units_processed || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {(report.total_ng || 0) > 0 ? (
                                                                <span className="badge bg-danger px-3 py-2">
                                                                    {report.total_ng} NG
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">0</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`fw-bold ${isYieldGood ? 'text-success' : 'text-danger'}`}>
                                                                {yieldRate}%
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>
                                                                {new Date(report.created_at).toLocaleDateString('en-GB')}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button 
                                                                className="btn btn-primary btn-sm fw-bold px-3"
                                                                onClick={() => handleViewReport(report)}
                                                            >
                                                                VIEW
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-5 text-muted">
                                                        <i className="bi bi-inbox display-6 d-block mb-3 opacity-25"></i>
                                                        <div>No reports found for selected filters</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case "announcements": {
                const today = new Date().toISOString().split('T')[0];

                const filteredAnnouncements = announcements.filter(announcement => {
                    const announcementDate = new Date(announcement.created_at).toISOString().split('T')[0];
                    return announcementDate === announcementSelectedDate;
                });

                const numericLastReadId = parseInt(lastReadAnnouncementId) || 0;

                return (
                    <div className="container-fluid px-0 py-2">
                        <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                            <div>
                                <h4 className="fw-bold text-dark mb-0">Bulletin Board</h4>
                                <p className="text-muted small mb-0 fw-medium">Operational updates and system announcements</p>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold text-muted" style={{fontSize: '0.75rem'}}>FILTER DATE</span>
                                <input
                                    type="date"
                                    className="form-control"
                                    style={{width: '180px'}}
                                    value={announcementSelectedDate}
                                    onChange={(e) => setAnnouncementSelectedDate(e.target.value)}
                                    max={today}
                                />
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold text-dark">
                                    Archive Feed: {announcementSelectedDate === today ? 'TODAY' : announcementSelectedDate}
                                </h6>
                                <span className="badge bg-dark rounded-pill px-3 py-2" style={{fontSize: '0.7rem'}}>
                                    {filteredAnnouncements.length} MESSAGES
                                </span>
                            </div>

                            <div className="card-body p-0">
                                {filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements.map((announcement) => {
                                        const isUnread = parseInt(announcement.id) > numericLastReadId;
                                        const postTime = new Date(announcement.created_at).toLocaleString('en-US', { 
                                            hour: '2-digit', minute: '2-digit', hour12: true 
                                        });
                                        
                                        const posterAvatar = announcement.poster_avatar 
                                            ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` 
                                            : DEFAULT_AVATAR_PATH;

                                        return (
                                            <div key={announcement.id} className={`border-bottom p-4 ${isUnread ? 'bg-light bg-opacity-50' : ''}`}>
                                                <div className="d-flex align-items-start">
                                                    <div className="flex-shrink-0 me-3 position-relative">
                                                        <img
                                                            src={posterAvatar}
                                                            className="rounded-circle"
                                                            style={{width: '42px', height: '42px', objectFit: 'cover', border: '2px solid #fff', outline: '1px solid #e2e8f0'}}
                                                            alt="User"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                        />
                                                        {isUnread && (
                                                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-primary border border-white rounded-circle"></span>
                                                        )}
                                                    </div>

                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <div>
                                                                <span className="fw-bold text-dark me-2" style={{fontSize: '0.9rem'}}>{announcement.poster_name}</span>
                                                                <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2" style={{fontSize: '0.65rem', fontWeight: '700'}}>
                                                                    {announcement.poster_role.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center text-muted">
                                                                {!isUnread && <i className="bi bi-check2-all text-primary me-2"></i>}
                                                                <span className="fw-bold" style={{fontSize: '0.7rem'}}>{postTime}</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-light border rounded p-3" style={{fontSize: '0.95rem', color: '#334155', lineHeight: '1.6'}}>
                                                            {announcement.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-5 my-4">
                                        <i className="bi bi-chat-left-dots text-muted display-1 opacity-25"></i>
                                        <h6 className="fw-bold text-dark mt-3">No Records Found</h6>
                                        <p className="text-muted small">There are no announcements for the selected date.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
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
                    <button className={`sidebar-link ${activeTab === 'overview' ? 'active-glass' : ''}`} onClick={() => setActiveTab('overview')}>
                        <i className="bi bi-grid-1x2"></i> 
                        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Overview</span>
                    </button>
                    <button className={`sidebar-link ${activeTab === 'qr_generator' ? 'active-glass' : ''}`} onClick={() => setActiveTab('qr_generator')}>
                        <i className="bi bi-qr-code-scan"></i> 
                        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>QR Generator</span>
                    </button>
                    <button className={`sidebar-link ${activeTab.includes('station') ? 'active-glass' : ''}`} onClick={() => setActiveTab('station_monitor')}>
                        <i className="bi bi-layers-half"></i> 
                        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Station Monitor</span>
                    </button>
                    <button className={`sidebar-link ${activeTab === 'inventory' ? 'active-glass' : ''}`} onClick={() => setActiveTab('inventory')}>
                        <i className="bi bi-box-seam"></i> 
                        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Inventory</span>
                    </button>
                    
                    <hr className="border-secondary my-2 opacity-25" />
                    
                    <button className={`sidebar-link ${activeTab === 'approvals' ? 'active-glass' : ''}`} onClick={() => setActiveTab('approvals')} style={{ justifyContent: 'space-between' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-check-circle"></i> 
                            <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Approvals</span>
                        </div>
                        {pendingApprovalsCount > 0 && (
                            <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>
                                {pendingApprovalsCount}
                            </span>
                        )}
                    </button>
                    <button className={`sidebar-link ${activeTab === 'reports' ? 'active-glass' : ''}`} onClick={() => setActiveTab('reports')} style={{ justifyContent: 'space-between' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-file-earmark-text"></i> 
                            <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Reports</span>
                        </div>
                        {todayReportsCount > 0 && (
                            <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>
                                {todayReportsCount}
                            </span>
                        )}
                    </button>
                    <button className={`sidebar-link ${activeTab === 'announcements' ? 'active-glass' : ''}`} onClick={() => setActiveTab('announcements')} style={{ justifyContent: 'space-between' }}>
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-megaphone"></i> 
                            <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Announcements</span>
                        </div>
                        {unreadAnnouncementsCount > 0 && (
                            <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>
                                {unreadAnnouncementsCount}
                            </span>
                        )}
                    </button>
                    
                    <hr className="border-secondary my-2 opacity-25" />
                    
                    <button onClick={onLogout} className="sidebar-link" style={{ color: '#ef4444' }}>
                        <i className="bi bi-power"></i> 
                        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Logout Session</span>
                    </button>
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

                {showReportModal && (
                    <SubmitReportModal 
                        user={user}
                        stations={stations}
                        onClose={() => setShowReportModal(false)}
                        onSave={() => {
                            fetchReports();
                            setShowReportModal(false);
                        }}
                        REPORTS_ENDPOINT={REPORTS_ENDPOINT}
                    />
                )}

                {selectedReport && (
                    <ReportDetailModal 
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                        API_BASE_URL={API_BASE_URL}
                    />
                )}

                <LoadingOverlay status={processStatus} message={statusMessage} />
                {showModal && <CustomMessageModal title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} onClose={() => setShowModal(false)} />}
                {activeHistoryStation && <StationHistoryModal stationId={activeHistoryStation} onClose={() => setActiveHistoryStation(null)} user={user} />}
            </div>
        </div>
    );
}