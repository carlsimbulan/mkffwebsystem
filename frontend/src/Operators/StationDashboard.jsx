import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

// Import local assets
import logo from '../logo.png'; 

// --- IMPORT SEPARATED VIEW/MODAL COMPONENTS ---
import { StationHomeDashboard } from './components/StationHomeDashboard';
import { UnitEntryForm } from './components/UnitEntryForm';
import { DailyReportForm } from './components/DailyReportForm';
import { UnitHistoryLog } from './components/UnitHistoryLog';
import { UnitListTable } from './components/UnitListTable';
import { EditUnitModal } from './components/EditUnitModal'; // Imported the separated Modal


// REGISTER CHART COMPONENTS (Kept here for global chart setup)
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// --- CONFIGURATION CONSTANTS ---
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const AVATAR_UPLOAD_PATH = `${API_BASE_URL}/uploads/avatars/`;
const DEFAULT_AVATAR_PATH = `${API_BASE_URL}/uploads/avatars/default_avatar.png`;
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`;
const REPORT_ENDPOINT = `${API_BASE_URL}/daily_reports.php`;
const USER_ENDPOINT = `${API_BASE_URL}/user_management.php`;

// DEFINE THE STRICT STATION ORDER (Kept here as global constant)
const STATION_ORDER = [
    "Station 1", "Station 2", "Station 3", "Station 4", "Station 5",
    "Station 6", "Station 7", "Station 8", "Station 9", "Station 10",
    "Station 11", "Station 12", "Station 13", "Station 14", "Station 15"
];

// --- UTILITY COMPONENT: LOADING OVERLAY (Kept here or moved to a central utility file) ---
const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;
    let iconClass, spinnerVisible = false, bgColor, statusText;
    if (status === 'loading') {
        spinnerVisible = true; bgColor = "bg-dark opacity-75"; statusText = "PROCESSING DATA...";
    } else if (status === 'success') {
        iconClass = "bi bi-check-circle-fill text-success"; bgColor = "bg-success opacity-75"; statusText = "SUCCESS";
    } else if (status === 'error') {
        iconClass = "bi bi-x-octagon-fill text-danger"; bgColor = "bg-danger opacity-75"; statusText = "FAILED";
    }
    return (
        <div className={`position-fixed w-100 h-100 top-0 start-0 ${bgColor} d-flex justify-content-center align-items-center z-3`} style={{ zIndex: 1060 }}>
            <div className="bg-white p-5 rounded shadow-lg text-center" style={{ minWidth: '300px' }}>
                <div className="mb-3">
                    {spinnerVisible ? <div className="spinner-border text-primary" role="status"></div> : <i className={`${iconClass} fs-1`}></i>}
                </div>
                <h4 className="fw-bold text-dark mb-1">{statusText}</h4>
                <p className="text-muted small">{message}</p>
            </div>
        </div>
    );
};


// --- MAIN OPERATOR COMPONENT (Controller) ---
export default function StationDashboard({ user, onLogout }) { 

    // --- STATE FOR AVATAR & NAME ---
    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || null);
    const [currentFullName, setCurrentFullName] = useState(user?.full_name || user?.username);

    // --- HOOKS DEFINITIONS ---
    const [activeTab, setActiveTab] = useState("home"); 
    const [scanInput, setScanInput] = useState("");
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");
    const [unitList, setUnitList] = useState([]);
    const [historyList, setHistoryList] = useState([]); 
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [unitToEdit, setUnitToEdit] = useState(null); 
    const [scannedUnitId, setScannedUnitId] = useState(null); 

    const [formData, setFormData] = useState({
        model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "",
        deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: ""
    });
    
    const [dailyReportData, setDailyReportData] = useState({
        shift: 'Day Shift', totalUnitsProcessed: 0, totalNG: 0,
        downtimeMinutes: 0, summary: '', date: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const scannerInputRef = useRef(null); 

    // --- HELPER FUNCTION: GET STATION NAME ---
    const getStationName = () => {
        const rawName = (user?.station || user?.username || "").toLowerCase();
        if (rawName.includes('station')) {
            const num = rawName.replace(/\D/g, ''); 
            if (num) return `Station ${num}`;
        }
        return rawName.charAt(0).toUpperCase() + rawName.slice(1);
    };

    const currentStation = getStationName();

    // --- HELPER FUNCTION: RESET FORM ---
    const resetForm = () => {
        setFormData({ model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "", deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: "" });
        setScanInput(""); setStatusMessage(""); setProcessStatus('idle'); setScannedUnitId(null);
    };

    // --- HOOKED FUNCTIONS: FETCH USER DATA / AVATAR ---
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(USER_ENDPOINT);
                if (Array.isArray(res.data)) {
                    const currentUser = res.data.find(u => u.id === user.id || u.username === user.username);
                    if (currentUser) {
                        if (currentUser.avatar_url) setCurrentAvatar(currentUser.avatar_url);
                        if (currentUser.full_name) setCurrentFullName(currentUser.full_name);
                    }
                }
            } catch (err) {
                console.error("Error fetching user avatar:", err);
            }
        };
        fetchUserData();
    }, [user]);
    
    // --- HOOKED FUNCTIONS: FETCH UNIT LIST ---
    const fetchUnits = useCallback(async (status) => { 
        setListLoading(true); setListError(null); setUnitList([]); 
        
        let dbStatus = status.replace(/_/g, ' ').replace(' unit', '');
        if (dbStatus === 'in progress') dbStatus = 'In Progress';
        if (dbStatus === 'completed') dbStatus = 'Completed';
        if (dbStatus === 'no good') dbStatus = 'No Good (NG)';
        if (dbStatus === 'pending') dbStatus = 'Pending Approval'; 
        
        if (['daily reports', 'account history', 'guide', 'home'].includes(dbStatus.toLowerCase())) {
            // 'home' maps to '' status, which fetches all units.
            dbStatus = ''; 
        }
        
        try {
            const res = await axios.get(UNITS_ENDPOINT, {
                params: {
                    station: currentStation, 
                    status: dbStatus
                }
            });
            setUnitList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setListError(`Failed to load data: ${err.message}`);
        } finally {
            setListLoading(false);
        }
    }, [currentStation]); 
    
    // --- HOOKED FUNCTIONS: FETCH HISTORY ---
    const fetchHistory = useCallback(async () => {
        setListLoading(true); setListError(null); setHistoryList([]);
        try {
            const res = await axios.get(HISTORY_ENDPOINT, {
                params: { station: currentStation }
            });
            setHistoryList(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            setListError(`Failed to load history: ${err.message}`);
        } finally {
            setListLoading(false);
        }
    }, [currentStation]);

    // --- HANDLE SCAN LOGIC ---
    const handleScan = async (e) => { 
        e.preventDefault();
        setProcessStatus('loading'); 
        setStatusMessage("Validating process flow...");
        setScannedUnitId(null); 

        const scannedData = scanInput.trim();
        if (!scannedData) { setProcessStatus('idle'); return; }

        const parts = scannedData.split('|');
        if (parts.length < 5) {
            setProcessStatus('error');
            setStatusMessage("⚠️ Invalid QR Format! Data parts missing.");
            setTimeout(() => setProcessStatus('idle'), 3000);
            setScanInput(""); 
            return;
        }

        // QR Format: MODEL|REV|BASE|ASSEMBLY|SERIAL|ACC
        const scannedAssembly = parts[3].trim();
        const scannedSerial = parts[4].trim();
        
        const myStationName = currentStation; 
        const myStationIndex = STATION_ORDER.indexOf(myStationName);

        // [SECURITY CHECK] 
        if (myStationIndex === -1 && myStationName !== "Station 1") {
            setProcessStatus('error');
            setStatusMessage(`⛔ ACCESS DENIED: You are logged in as "${myStationName}". Only authorized Stations (1-15) can scan.`);
            setTimeout(() => setProcessStatus('idle'), 5000);
            setScanInput("");
            return;
        }

        try {
            // 1. SEARCH LOGIC: Hanapin ang unit by Serial or Assembly
            let response;
            if (scannedSerial) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_serial: scannedSerial } });
            } else if (scannedAssembly) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_assembly: scannedAssembly } });
            } else {
                throw new Error("Invalid QR: No Serial or Assembly Number found.");
            }

            const dbUnit = response.data && response.data.length > 0 ? response.data[0] : null;

            // [CASE A] NEW UNIT (Only allowed at Station 1)
            if (!dbUnit) {
                if (myStationName !== "Station 1") {
                    throw new Error("Unit not found in database. Process MUST start at Station 1.");
                }
                setStatusMessage("✅ New Unit. Starting Process at Station 1...");
            } 
            
            // [CASE B] EXISTING UNIT
            else {
                const unitStationName = dbUnit.station;
                const unitStationIndex = STATION_ORDER.indexOf(unitStationName);
                const dbStatus = dbUnit.status.toLowerCase(); 
                
                // 1. CHECK FOR CURRENT STATION (STRICTLY NO RE-SCAN)
                if (unitStationIndex === myStationIndex) {
                    let statusMessage = `🛑 Unit is currently logged as **${dbUnit.status}** at your station.`;
                    if (dbUnit.status.toLowerCase() === "in progress") {
                        statusMessage += " Please use the form's 'Save Unit' button or the 'Edit' button in the table to update status.";
                    } else {
                        statusMessage += " It must be transferred to the next station or reopened via the 'Edit' button.";
                    }
                    throw new Error(statusMessage);
                }

                // 2. Check for Unit in Future Station (Prevent Backtracking/Skipping)
                if (unitStationIndex > myStationIndex) {
                    throw new Error(`🚫 Sequence Error: Unit is already processed at **${unitStationName}**. Cannot backtrack.`);
                }

                // 3. Check for Unit in Previous Station (Handover)
                if (unitStationIndex === myStationIndex - 1) {
                    if (dbStatus !== 'completed') {
                        throw new Error(`🛑 Handover Failed: Unit is '${dbUnit.status}' at ${unitStationName}. It must be 'Completed' first.`);
                    }

                    // SUCCESSFUL HANDOVER
                    setScannedUnitId(dbUnit.id);
                    setStatusMessage(`✅ Handover accepted from **${unitStationName}**. Unit is ready to start at ${myStationName}.`);
                } else {
                    // Catches skipped stations (e.g., S1 to S3, bypassing S2)
                    const requiredPrev = STATION_ORDER[myStationIndex - 1];
                    throw new Error(`🚫 Sequence Violation: Unit is from **${unitStationName}**. It must pass **${requiredPrev}** first.`);
                }
            }
            
            // SUCCESS: Populate Form 
            setFormData(prev => ({
                ...prev,
                model: parts[0].trim() || "",
                revision: parts[1].trim() || "",
                baseUnitKittingNo: parts[2].trim() || "",
                assemblyNo: parts[3].trim() || "",
                deviceSerialNo: scannedSerial, 
                accessoryKittingNo: parts[5]?.trim() || "",
                status: "In Progress", // Default status upon successful scan/handover
                remarks: ""
            }));
            
            setProcessStatus('idle'); 

        } catch (err) {
            setProcessStatus('error');
            const errMsg = err.message.includes('Error') ? err.message : err.message;
            setStatusMessage(`⛔ ${errMsg}`);
            
            setFormData({
                model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "",
                deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: ""
            });
            
            setTimeout(() => {
                setProcessStatus('idle');
                setStatusMessage("");
            }, 5000); 
        }

        setScanInput(""); 
    };

    // --- HANDLE UNIT SUBMISSION / UPDATE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.assemblyNo) {
            setProcessStatus('error'); 
            setStatusMessage("Assembly No. is required."); 
            setTimeout(() => setProcessStatus('idle'), 3000); 
            return;
        }
        
        setProcessStatus('loading');
        setStatusMessage("Saving unit...");

        try {
            const commonData = {
                ...formData,
                station: currentStation, 
                full_name: user.full_name,
                username: user.username,
            };

            let res;
            let finalId = scannedUnitId;

            // SAFETY NET: Check for existing unit ID (especially for Station 1 new entries)
            if (!finalId && currentStation === "Station 1") {
                const checkRes = await axios.get(UNITS_ENDPOINT, { params: { search_assembly: formData.assemblyNo } });
                if (checkRes.data && checkRes.data.length > 0) {
                    finalId = checkRes.data[0].id;
                }
            }

            if (finalId) {
                // UPDATE / HANDOVER
                res = await axios.post(UNITS_ENDPOINT, { ...commonData, id: finalId, action: 'update' });
            } else {
                // CREATE NEW
                res = await axios.post(UNITS_ENDPOINT, { ...commonData, action: 'create' });
            }

            if (res.data.status === 'success' || res.data.success === true) {
                setProcessStatus('success');
                setStatusMessage(`Unit saved successfully!`);
                setTimeout(() => {
                    setProcessStatus('idle'); 
                    resetForm(); 
                    scannerInputRef.current?.focus(); 
                    // Refresh current tab data
                    if (['home', 'in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) fetchUnits(activeTab === 'home' ? '' : activeTab);
                }, 2000);
            } else {
                const errorMsg = res.data.error || res.data.message || JSON.stringify(res.data);
                setProcessStatus('error');
                setStatusMessage(`Server Error: ${errorMsg}`);
                setTimeout(() => setProcessStatus('idle'), 5000);
            }
        } catch (err) {
            setProcessStatus('error');
            const errMsg = err.response?.data?.message || err.message;
            setStatusMessage(`Submission Error: ${errMsg}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    // --- HANDLE REPORT SUBMISSION ---
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        const reportData = new FormData();
        reportData.append('station', currentStation);
        reportData.append('username', user.username);
        reportData.append('date', dailyReportData.date);
        reportData.append('shift', dailyReportData.shift);
        reportData.append('total_units_processed', String(dailyReportData.totalUnitsProcessed));
        reportData.append('total_ng', String(dailyReportData.totalNG));
        reportData.append('downtime_minutes', String(dailyReportData.downtimeMinutes));
        reportData.append('summary', dailyReportData.summary);
        if (selectedFile) reportData.append('file', selectedFile);

        setProcessStatus('loading');
        setStatusMessage("Submitting daily report...");

        try {
            const res = await axios.post(REPORT_ENDPOINT, reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(`Daily Report submitted successfully!`);
                setTimeout(() => {
                    setProcessStatus('idle');
                    setDailyReportData(prev => ({ ...prev, totalUnitsProcessed: 0, totalNG: 0, downtimeMinutes: 0, summary: '' }));
                    setSelectedFile(null);
                }, 3000);
            } else {
                setProcessStatus('error');
                setStatusMessage(res.data.message || 'Submission failed');
                setTimeout(() => setProcessStatus('idle'), 5000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`Error: ${err.message}`);
            setTimeout(() => setProcessStatus('idle'), 6000);
        }
    };

    // --- HANDLE UNIT EDIT (FROM LIST) ---
    const handleSaveEdit = async (id, updatedData) => {
        setUnitToEdit(null); 
        setProcessStatus('loading');
        
        try {
            const dataToSend = {
                ...updatedData,
                station: currentStation, 
                full_name: user.full_name, 
                username: user.username,
            };

            const res = await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend);
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(res.data.message); 
                setTimeout(() => {
                    setProcessStatus('idle');
                    if (['home', 'in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) fetchUnits(activeTab === 'home' ? '' : activeTab); 
                }, 2000);
            } else {
                setProcessStatus('error');
                setStatusMessage(`Update Failed: ${res.data.error}`);
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`API Error: ${err.message}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    const handleEditClick = (unit) => setUnitToEdit(unit);

    // --- USEEFFECT FOR DATA REFRESH ---
    useEffect(() => { 
        if (activeTab === 'account_history') {
            fetchHistory();
        } 
        else if (['home', 'in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) {
            fetchUnits(activeTab === 'home' ? '' : activeTab);
        }
        else { 
            setUnitList([]); 
            setHistoryList([]); 
        }
    }, [activeTab, fetchUnits, fetchHistory]);

    // --- USEEFFECT FOR SCANNER FOCUS ---
    useEffect(() => { 
        if (activeTab === "input_unit" && scannerInputRef.current && processStatus === 'idle') scannerInputRef.current.focus();
    }, [activeTab, processStatus]);

    if (!user) return <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">Initializing session...</div>;
    
    // 1. Calculate Stats for Dashboard Tab
    const homeStats = {
        completed: unitList.filter(u => u.status === 'Completed').length,
        inProgress: unitList.filter(u => u.status === 'In Progress').length,
        ng: unitList.filter(u => u.status === 'No Good (NG)').length,
    };

    // --- CONTENT RENDERER (Cleaned up Switch) ---
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <StationHomeDashboard
                        currentStation={currentStation}
                        homeStats={homeStats}
                        setActiveTab={setActiveTab}
                    />
                );

            case "input_unit":
                return (
                    <UnitEntryForm
                        scanInput={scanInput}
                        setScanInput={setScanInput}
                        handleScan={handleScan}
                        scannerInputRef={scannerInputRef}
                        processStatus={processStatus}
                        statusMessage={statusMessage}
                        handleSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        resetForm={resetForm}
                        scannedUnitId={scannedUnitId}
                    />
                );

            case "daily_reports":
                return (
                    <DailyReportForm
                        currentStation={currentStation}
                        dailyReportData={dailyReportData}
                        setDailyReportData={setDailyReportData}
                        handleReportSubmit={handleReportSubmit}
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                    />
                );

            case "in_progress":
            case "completed":
            case "no_good":
            case "pending":
                return (
                    <UnitListTable
                        units={unitList}
                        listStatus={activeTab.replace(/_/g, ' ')}
                        loading={listLoading}
                        error={listError}
                        onEdit={handleEditClick}
                    />
                );

            case "account_history":
                return (
                    <UnitHistoryLog
                        currentStation={currentStation}
                        historyList={historyList}
                        listLoading={listLoading}
                        listError={listError}
                    />
                );
            default:
                return <div className="alert alert-info text-center">Under development.</div>;
        }
    };

    const headerAvatarSrc = currentAvatar 
        ? `${AVATAR_UPLOAD_PATH}${currentAvatar}` 
        : DEFAULT_AVATAR_PATH;
        
    // --- LAYOUT RENDER ---
    return (
        <>
            <LoadingOverlay status={processStatus} message={statusMessage} />
            {/* Render Modal globally */}
            {unitToEdit && <EditUnitModal unit={unitToEdit} onClose={() => setUnitToEdit(null)} onSave={handleSaveEdit} />}
            
            <div className="d-flex flex-row min-vh-100 bg-light font-sans"> 
                
                {/* --- SIDEBAR: BLUE BACKGROUND --- */}
                <div className="d-flex flex-column flex-shrink-0 p-3 text-white shadow-lg" 
                    style={{ width: '260px', position: 'sticky', top: 0, height: '100vh', backgroundColor: '#0f172a', zIndex: 1000 }}>
                    
                    {/* Brand / Logo */}
                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-secondary pt-2 px-2">
                        <img 
                            src={logo} 
                            alt="MKFF Logo" 
                            className="me-2" 
                            style={{ height: '45px', width: 'auto', objectFit: 'contain' }} 
                        />
                        
                        {/* Text Description */}
                        <div>
                            <span className="fs-5 fw-bold d-block lh-1">OPERATOR PANEL</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow-1 overflow-auto custom-scrollbar">
                        <ul className="nav nav-pills flex-column mb-auto gap-2">
                            <li className="nav-item">
                                <button 
                                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 ${activeTab === 'home' ? 'btn-primary shadow' : 'text-white-50 hover-white'}`} 
                                    onClick={() => setActiveTab('home')}
                                    style={activeTab !== 'home' ? {background: 'transparent', border: 'none'} : {}}
                                >
                                    <i className="bi bi-grid-fill me-3"></i> Dashboard
                                </button>
                            </li>
                            
                            <li className="nav-item mt-2">
                                <button 
                                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 ${activeTab === 'input_unit' ? 'btn-primary shadow' : 'text-white-50 hover-white'}`} 
                                    onClick={() => setActiveTab('input_unit')}
                                    style={activeTab !== 'input_unit' ? {background: 'transparent', border: 'none'} : {}}
                                >
                                    <i className="bi bi-qr-code-scan me-3"></i> Unit Entry
                                </button>
                            </li>

                            <li className="text-uppercase small fw-bold text-secondary mt-4 mb-2 px-3" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Monitoring</li>
                            
                            {[
                                { k: 'in_progress', i: 'bi-gear-wide-connected', l: 'In Progress', c: 'text-warning' }, 
                                { k: 'completed', i: 'bi-check-circle-fill', l: 'Completed', c: 'text-success' }, 
                                { k: 'no_good', i: 'bi-x-octagon-fill', l: 'No Good (NG)', c: 'text-danger' }, 
                                { k: 'pending', i: 'bi-clock-history', l: 'Pending', c: 'text-info' }
                            ].map(({ k, i, l, c }) => (
                                <li key={k} className="nav-item">
                                    <button 
                                        className={`btn w-100 text-start d-flex align-items-center px-3 py-2 ${activeTab === k ? 'bg-white text-dark fw-bold shadow' : 'text-white-50'}`} 
                                        onClick={() => setActiveTab(k)}
                                        style={activeTab !== k ? {background: 'transparent', border: 'none'} : {}}
                                    >
                                        <i className={`bi ${i} me-3 ${activeTab === k ? c : ''}`}></i> {l}
                                    </button>
                                </li>
                            ))}

                            <li className="text-uppercase small fw-bold text-secondary mt-4 mb-2 px-3" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Reports & Logs</li>
                            
                            <li className="nav-item">
                                <button 
                                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 ${activeTab === 'daily_reports' ? 'bg-white text-dark fw-bold' : 'text-white-50'}`} 
                                    onClick={() => setActiveTab('daily_reports')}
                                    style={activeTab !== 'daily_reports' ? {background: 'transparent', border: 'none'} : {}}
                                >
                                    <i className="bi bi-file-earmark-bar-graph me-3"></i> Daily Report
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 ${activeTab === 'account_history' ? 'bg-white text-dark fw-bold' : 'text-white-50'}`} 
                                    onClick={() => setActiveTab('account_history')}
                                    style={activeTab !== 'account_history' ? {background: 'transparent', border: 'none'} : {}}
                                >
                                    <i className="bi bi-journals me-3"></i> History Logs
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Sidebar Footer (Version) */}
                    <div className="mt-auto pt-3 border-top border-secondary text-center text-white-50 small">
                        <small>@2025 MKFF Laser Technique</small>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="d-flex flex-column flex-grow-1" style={{ backgroundColor: '#eeeeeeff' }}> 
                    
                    {/* --- HEADER: WHITE BACKGROUND --- */}
                    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3 sticky-top z-2">
                        <div className="container-fluid p-0">
                            {/* Left: Station Name */}
                            <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded p-2 me-3 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                    <i className="bi bi-layers-fill fs-5"></i>
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold text-dark">{currentStation}</h5>
                                    <small className="text-muted">Production Floor</small>
                                </div>
                            </div>

                            {/* Right: User Profile & Logout */}
                            <div className="d-flex align-items-center gap-3">
                                {/* Divider */}
                                <div className="border-start mx-2" style={{height: '30px'}}></div>

                                {/* User Info */}
                                <div className="text-end d-none d-md-block">
                                    <div className="fw-bold text-dark small">{currentFullName}</div>
                                    <div className="text-muted" style={{fontSize: '0.7rem'}}>Authorized Operator</div>
                                </div>

                                {/* Avatar */}
                                <div className="position-relative">
                                    <img 
                                        src={headerAvatarSrc} 
                                        alt="User" 
                                        className="rounded-circle border border-gray-300"
                                        style={{ width: '42px', height: '42px', objectFit: 'cover' }} 
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = DEFAULT_AVATAR_PATH; 
                                        }} 
                                    />
                                    {/* Online Status Dot */}
                                    <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{width: '12px', height: '12px'}}></span>
                                </div>

                                {/* Logout Button */}
                                <button 
                                    className="btn btn-outline-danger btn-sm ms-2 d-flex align-items-center px-3 rounded-pill" 
                                    onClick={onLogout}
                                    title="Sign Out"
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* --- DYNAMIC CONTENT --- */}
                    <div className="container-fluid p-4 flex-grow-1 overflow-auto">
                        <div className="fade-in-up">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS Helper para sa Hover effects ng Sidebar */}
            <style jsx>{`
                .hover-white:hover { color: white !important; background: rgba(255,255,255,0.1) !important; }
                .fade-in-up { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    )
};