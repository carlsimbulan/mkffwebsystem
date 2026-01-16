import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../logo.png';

// Import separated components and modals
import LoadingOverlay from './components/LoadingOverlay';
import CustomMessageModal from './modals/CustomMessageModal';
import StationHistoryModal from './modals/StationHistoryModal';
import UnscannedUnitsTable from './components/UnscannedUnitsTable';
import LiveMonitoringTable from './components/LiveMonitoringTable';
import GeneratedQRList from './components/GeneratedQRList';
import { UserProfileModal } from './modals/UserProfileModal';

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

// Utility Helper Functions
const formatSerial = (num) => String(num).padStart(5, '0');
const safeParseSerial = (serialStr, prefix) => {
    const numStr = serialStr?.replace(prefix, '') || '0';
    return parseInt(numStr, 10) || 0;
};

export default function ITAssistantPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || null);
    const [currentFullName, setCurrentFullName] = useState(user?.full_name || user?.username);

    // --- DATA & UI STATES ---
    const [qrFormData, setQrFormData] = useState({ model: "MKFF-X1", revision: "REV-01", baseKit: "", accKit: "", quantity: 9 });
    const [generatedQRList, setGeneratedQRList] = useState([]);
    const [unitLogs, setUnitLogs] = useState([]);
    const [stations, setStations] = useState([]);
    const [nextAssemblyNo, setNextAssemblyNo] = useState(1);
    
    // Process Status for the "Ganda" Success Animation
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [activeMonitorStationId, setActiveMonitorStationId] = useState(null);
    const [activeHistoryStation, setActiveHistoryStation] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

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

    // 🔑 Magandang Success Animation Logic for Profile Update
    const handleUpdateProfile = async (formData) => {
        setProcessStatus('loading');
        setStatusMessage("Updating your account details...");
        try {
            const res = await axios.post(USER_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status === 'success') {
                // 🌟 SHOW GREEN SUCCESS SCREEN
                setProcessStatus('success');
                setStatusMessage("Profile updated successfully!");
                setShowProfileModal(false);

                // Wait for user to see the success before reload
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

    const calculateMetrics = (logs) => {
        const counts = { forScanning: 0, completed: 0, inProgress: 0, noGood: 0, totalTracked: 0, pendingApproval: 0 };
        logs.forEach(log => {
            counts.totalTracked++;
            const s = log.status?.trim();
            if (s === 'For Scanning') counts.forScanning++;
            else if (s === 'Completed') counts.completed++;
            else if (s === 'In Progress') counts.inProgress++;
            else if (s === 'No Good (NG)') counts.noGood++;
            else if (s === 'Pending Approval') counts.pendingApproval++;
        });
        const calcPct = (val) => logs.length > 0 ? ((val / logs.length) * 100).toFixed(1) : 0;
        return { 
            ...counts, 
            total: logs.length,
            pctForScanning: calcPct(counts.forScanning),
            pctInProgress: calcPct(counts.inProgress),
            pctCompleted: calcPct(counts.completed),
            pctNoGood: calcPct(counts.noGood),
            pctPending: calcPct(counts.pendingApproval)
        };
    };

    const calculateStationMetrics = (stationLogs) => {
        const completed = stationLogs.filter(u => u.status === 'Completed').length;
        const inProgress = stationLogs.filter(u => u.status === 'In Progress').length;
        const noGood = stationLogs.filter(u => u.status === 'No Good (NG)').length;
        return { completed, inProgress, noGood };
    };

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
                    <div className="card border">
                        <div className="card-header bg-danger text-white fw-bold">APPROVALS QUEUE</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0 uppercase" style={{ fontSize: '0.75rem' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th>MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th><th>DEVICE SERIAL</th><th>ACCESSORY</th><th>STATUS</th><th>REMARKS</th><th>TIMESTAMP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unitLogs.filter(u => u.status === 'Pending Approval').map(u => (
                                            <tr key={u.id}>
                                                <td>{u.model}</td><td>{u.revision}</td><td>{u.base_unit_kitting_no}</td><td>{u.assembly_no}</td><td>{u.device_serial_no}</td><td>{u.accessory_kitting_no}</td><td>{u.status}</td><td>{u.remarks}</td><td>{u.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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

            {/* SIDEBAR */}
            <div className="d-flex flex-column text-white" style={{ width: "260px", backgroundColor: "#111827", height: '100vh', position: 'fixed', zIndex: 1000 }}>
                <div className="p-4 border-bottom border-secondary d-flex align-items-center mb-2">
                    <img src={logo} alt="Logo" style={{ width: '30px', marginRight: '12px' }} />
                    <span className="fs-6 fw-bold letter-spacing-1">IT Assistant</span>
                </div>
                <div className="nav flex-column">
                    <div className="sidebar-label">MAIN NAVIGATION</div>
                    <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><i className="bi bi-grid-fill"></i> OVERVIEW</button>
                    <button className={`sidebar-link ${activeTab === 'qr_generator' ? 'active' : ''}`} onClick={() => setActiveTab('qr_generator')}><i className="bi bi-qr-code-scan"></i> QR GENERATOR</button>
                    <button className={`sidebar-link ${activeTab.includes('station') ? 'active' : ''}`} onClick={() => setActiveTab('station_monitor')}><i className="bi bi-cpu-fill"></i> STATION MONITOR</button>
                    <button className={`sidebar-link ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}><i className="bi bi-check-circle-fill"></i> APPROVALS</button>
                    <div className="sidebar-label">SYSTEM</div>
                    <button onClick={onLogout} className="sidebar-link text-danger"><i className="bi bi-power"></i> LOGOUT SESSION</button>
                </div>
                <div className="mt-auto p-3 border-top border-secondary bg-dark bg-opacity-25">
                    <span className="text-white fw-bold" style={{ fontSize: '0.65rem' }}>©2025 MKFF LASER TECHNIQUE</span>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-grow-1" style={{ marginLeft: "260px", backgroundColor: "#eeeeeeff", height: '100vh', overflow: 'hidden' }}>
                <header className="bg-white p-3 d-flex justify-content-between align-items-center border-bottom sticky-top" style={{ height: '70px' }}>
                    <h5 className="fw-bold mb-0 text-dark uppercase">{activeTab.replace('_', ' ')}</h5>
                    <div className="d-flex align-items-center gap-3 pe-2">
                        <div className="text-end d-none d-md-block">
                            <div className="fw-bold text-dark small">{currentFullName}</div>
                            <div className="text-muted uppercase" style={{ fontSize: '0.6rem' }}>Authorized IT Assistant</div>
                        </div>
                        <img 
                            src={currentAvatar ? `${AVATAR_UPLOAD_PATH}${currentAvatar}` : DEFAULT_AVATAR_PATH} 
                            alt="Profile" className="rounded-circle border avatar-clickable"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            onClick={() => setShowProfileModal(true)}
                        />
                    </div>
                </header>
                <div className="p-4" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
                    {renderContent()}
                </div>
            </div>

            {/* 🔑 USER PROFILE MODAL */}
            {showProfileModal && (
                <UserProfileModal 
                    user={user} 
                    currentAvatar={currentAvatar ? `${AVATAR_UPLOAD_PATH}${currentAvatar}` : DEFAULT_AVATAR_PATH}
                    currentFullName={currentFullName}
                    onClose={() => setShowProfileModal(false)}
                    onSave={handleUpdateProfile}
                />
            )}

            {/* 🔑 MAGANDANG OVERLAY (Loading, Success, Error) */}
            <LoadingOverlay status={processStatus} message={statusMessage} />

            {showModal && <CustomMessageModal title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} onClose={() => setShowModal(false)} />}
            {activeHistoryStation && <StationHistoryModal stationId={activeHistoryStation} onClose={() => setActiveHistoryStation(null)} user={user} />}
        </div>
    );
}