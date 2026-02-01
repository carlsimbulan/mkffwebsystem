import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTargetTimes } from '../utils/targetTimeService';

// Import local assets
import logo from '../logo.png'; 

// --- IMPORT SEPARATED VIEW/MODAL COMPONENTS ---
import { StationHomeDashboard } from './components/StationHomeDashboard';
import { UnitEntryForm } from './components/UnitEntryForm';
import { DailyReportForm } from './components/DailyReportForm';
import { UnitHistoryLog } from './components/UnitHistoryLog';
import { UnitListTable } from './components/UnitListTable';
import { EditUnitModal } from './modals/EditUnitModal';
import { AnnouncementView } from './components/AnnouncementView';
import { UserProfileModal } from './modals/UserProfileModal'; // <--- DAGDAG
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';


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
const ANNOUNCEMENT_ENDPOINT = `${API_BASE_URL}/announcements.php`; 

// DEFINE THE STRICT STATION ORDER (Kept here as global constant)
const STATION_ORDER = [
    "Station1", "Station2", "Station3", "Station4", "Station5",
    "Station6", "Station7", "Station8", "Station9", "Station10",
    "Station11", "Station12", "Station13", "Station14", "Station15"
];

// --- UTILITY COMPONENTS ---

// 1. LOADING OVERLAY (Unchanged)
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

// 2. Unit Status Change Notification Toast (Retained for unit approval notification)
const StatusChangeToast = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div 
            className="toast show align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3 shadow-lg" 
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
            style={{ zIndex: 1070 }}
        >
            <div className="d-flex">
                <div className="toast-body d-flex align-items-center">
                    <i className="bi bi-patch-check-fill me-2 fs-5"></i>
                    <strong className="me-auto">{message}</strong>
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onClick={onClose}></button>
            </div>
        </div>
    );
};


// 3. ❌ Removed: NewAnnouncementPopup component (Gagamitin na lang ang Alert Banner sa Dashboard)


// --- MAIN OPERATOR COMPONENT (Controller) ---
export default function StationDashboard({ user, onLogout }) { 

    // Use dynamic target times
    const { thresholds: dynamicTargetTimes } = useTargetTimes();

    // --- STATE FOR AVATAR & NAME ---
    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || null);
    const [currentFullName, setCurrentFullName] = useState(user?.full_name || user?.username);

    // --- LOCAL STORAGE KEY (UNIQUE PER USER) ---
    const ANNOUNCEMENT_READ_KEY = `lastReadAnnouncementId_${user.username}`;
    
    // --- HOOKS DEFINITIONS ---
    const navigate = useNavigate();
const location = useLocation();

// This extracts the last part of the URL (e.g., /operator/input_unit -> input_unit)
const activeTab = location.pathname.split('/').pop() || "dashboard";

// Helper function to change tabs
const setActiveTab = (tab) => {
    navigate(`/operator/${tab}`);
}; 
    const [announcements, setAnnouncements] = useState([]); 
    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [announcementError, setAnnouncementError] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false); // <--- DAGDAG
    
    const [lastReadId, setLastReadId] = useState(() => {
        // Initialize state from Local Storage on mount
        return parseInt(localStorage.getItem(ANNOUNCEMENT_READ_KEY) || 0);
    });
    
    // 🔑 State for Unit Status Change Notification
    const [unitStatusNotification, setUnitStatusNotification] = useState(null);
    // ❌ Removed: [showAnnouncementPopup] state
    
    const [scanInput, setScanInput] = useState("");
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");
    const [unitList, setUnitList] = useState([]);
    const [historyList, setHistoryList] = useState([]); 
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [unitToEdit, setUnitToEdit] = useState(null); 
    const [scannedUnitId, setScannedUnitId] = useState(null); 

    // 🔑 REF for Previous Unit List (used for status change detection)
    const prevUnitListRef = useRef([]);

    const [formData, setFormData] = useState({
        model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "",
        deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: "",

        mnbd_no: "",
    cmbd_no: "",
    lrbd_no: "",
    pqbd_no: "",
    bkbd_no: ""
    });
    
    const [dailyReportData, setDailyReportData] = useState({
        shift: 'Day Shift', totalUnitsProcessed: 0, totalNG: 0,
        downtimeMinutes: 0, summary: '', date: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const scannerInputRef = useRef(null); 


    // --- HELPER FUNCTION: GET STATION NAME (Unchanged) ---
// HANAPIN AT PALITAN ITONG BLOCK NA ITO:
const getStationName = useCallback(() => {
    // Kumuha ng station string mula sa user object
    const rawName = (user?.station || "").trim();
    
    // 1. Kung ang station ay may format na "Station 1", gagawin itong "Station1"
    // 2. Kung ito ay "station1", gagawin itong "Station1"
    if (rawName.toLowerCase().includes('station')) {
        const num = rawName.match(/\d+/); // Kunin ang number
        if (num) return `Station${num[0]}`; 
    }
    
    // Fallback: Siguraduhin ang tamang capitalization kung iba ang format
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}, [user]);

const currentStation = getStationName();

    // 🌟 CHART METRICS FUNCTION DEFINITION (Unchanged) 🌟
    const calculateMetrics = useCallback((stationId, logs) => {
        // This function calculates metrics needed by the chart based on the passed logs (unitList)
        const completedUnits = logs.filter(log => log.status === 'Completed').length;
        const ngUnits = logs.filter(log => log.status === 'No Good (NG)').length;
        
        return { completedUnits, ngUnits };
    }, []); 
    
    // --- HELPER FUNCTION: RESET FORM (Unchanged) ---
const resetForm = () => {
    setFormData({ 
        model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "", 
        deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: "",
        // 🔑 DAGDAGAN MO NITO PARA MA-CLEAR PAGKATAPOS MAG-SAVE:
        mnbd_no: "", cmbd_no: "", lrbd_no: "", pqbd_no: "", bkbd_no: "" 
    });
    setScanInput(""); setStatusMessage(""); setProcessStatus('idle'); setScannedUnitId(null);
};

    // --- HOOKED FUNCTIONS: FETCH USER DATA / AVATAR (Unchanged) ---
// HANAPIN ANG useEffect NG fetchUserData AT PALITAN NG GANITO:
useEffect(() => {
    const fetchUserData = async () => {
        try {
            const res = await axios.get(USER_ENDPOINT);
            if (Array.isArray(res.data)) {
                // I-match gamit ang username (email) para makuha ang avatar_url at full_name
                const currentUser = res.data.find(u => u.username === user.username);
                if (currentUser) {
                    // I-update ang state base sa data mula sa database
                    setCurrentAvatar(currentUser.avatar_url);
                    setCurrentFullName(currentUser.full_name);
                }
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };
    fetchUserData();
}, [user.username]); // Dependency sa username
    
    // --- HOOKED FUNCTIONS: FETCH UNIT LIST (Retained polling and ref update logic) ---
    const fetchUnits = useCallback(async (status) => { 
    if (activeTab !== 'home') {
        setListLoading(true); setListError(null);
    }
    
    let dbStatus = status.replace(/_/g, ' ').replace(' unit', '');
    if (dbStatus === 'in progress') dbStatus = 'In Progress';
    if (dbStatus === 'completed') dbStatus = 'Completed';
    if (dbStatus === 'no good') dbStatus = 'No Good (NG)';
    if (dbStatus === 'pending') dbStatus = 'Pending Approval'; 
    
    if (['daily reports', 'account history', 'guide', 'home'].includes(dbStatus.toLowerCase())) {
        dbStatus = ''; 
    }
    
    try {
        const res = await axios.get(UNITS_ENDPOINT, {
            params: {
                station: currentStation, 
                status: dbStatus
            }
        });
        
        // 🔑 IMPORTANTE: Siguraduhin na ang mapping dito ay tugma sa Database columns
        const rawData = Array.isArray(res.data) ? res.data : [];

        const newUnitList = rawData.map(unit => ({
            ...unit,
            // I-map ang database underscore names sa camelCase names ng React state mo
            deviceSerialNo: unit.device_serial_no,
            accessoryKittingNo: unit.accessory_kitting_no,
            baseUnitKittingNo: unit.base_unit_kitting_no,
            assemblyNo: unit.assembly_no
        }));

        setUnitList(newUnitList);
        prevUnitListRef.current = newUnitList;

    } catch (err) {
        setListError(`Failed to load data: ${err.message}`);
    } finally {
        if (activeTab !== 'home') setListLoading(false);
    }
}, [currentStation, activeTab]); 
    
    // --- HOOKED FUNCTIONS: FETCH HISTORY (Unchanged) ---
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

    // --- HOOKED FUNCTIONS: FETCH ANNOUNCEMENTS (Modified: Removed popup trigger) ---
    const fetchAnnouncements = useCallback(async () => {
        const isInitialLoad = announcements.length === 0;
        if (isInitialLoad && activeTab === 'announcements') setAnnouncementLoading(true); 
        setAnnouncementError(null);
        try {
            const res = await axios.get(ANNOUNCEMENT_ENDPOINT);
            // 🔑 NOTE: The unread count calculation is now the only way to notify the user.
            setAnnouncements(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setAnnouncementError(`Failed to load announcements: ${err.message}`);
        } finally {
            if (isInitialLoad && activeTab === 'announcements') setAnnouncementLoading(false);
        }
    }, [announcements.length, activeTab]);

    // 🔑 FUNCTION: Handles updating the last read announcement ID in Local Storage
    const handleMarkAsRead = useCallback((newestId) => {
        const numericNewestId = parseInt(newestId);
        const numericLastReadId = parseInt(lastReadId);
        
        if (numericNewestId > numericLastReadId) {
            setLastReadId(numericNewestId); // Update state
            localStorage.setItem(ANNOUNCEMENT_READ_KEY, numericNewestId); // Update Local Storage
        }
    }, [lastReadId, ANNOUNCEMENT_READ_KEY]);

    // 🔑 Profile Update logic (New)
    const handleUpdateProfile = async (formData) => {
        setProcessStatus('loading');
        setStatusMessage("Validating and Updating Profile...");
        try {
            const res = await axios.post(USER_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage("Profile updated! Refreshing...");
                setShowProfileModal(false);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setProcessStatus('error');
                setStatusMessage(res.data.message || "Update Failed");
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`Error: ${err.message}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };

    // --- 🔑 POLLING EFFECT FOR ANNOUNCEMENTS (1 second) ---
    useEffect(() => {
        fetchAnnouncements(); 
        const intervalId = setInterval(fetchAnnouncements, 1000); 

        return () => clearInterval(intervalId);
    }, [fetchAnnouncements]);
    // --- END ANNOUNCEMENT POLLING EFFECT ---

    // --- 🔑 POLLING EFFECT FOR UNIT STATUS CHECK (1 second) ---
    useEffect(() => {
        let intervalId;
        if (activeTab === 'home') {
             fetchUnits(activeTab);
             intervalId = setInterval(() => fetchUnits(activeTab), 1000); 
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [activeTab, fetchUnits]);
    // --- END UNIT POLLING EFFECT ---

    // --- HANDLE SCAN LOGIC (Omitted for brevity, unchanged) ---
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
            // [CASE B] EXISTING UNIT
else {
    const unitStationName = dbUnit.station; // Station info galing sa DB
    const unitStationIndex = STATION_ORDER.indexOf(unitStationName);
    const dbStatus = dbUnit.status.toLowerCase().trim(); 
    
    // Kunin natin ang kasalukuyang station name at linisin (walang space)
    const myStationClean = currentStation.replace(/\s+/g, ''); 

    console.log("Debug Scan:", { myStation: myStationClean, dbStatus: dbStatus });

    // 1. 🌟 THE OVERRIDE: Tanggapin ang 'For Scanning' basta Station 1
    if (myStationClean === "Station1" && dbStatus === "for scanning") {
        setScannedUnitId(dbUnit.id);
        setStatusMessage("✅ New Unit Recognized. Starting process at Station 1...");
        // I-populate na ang form
        setFormData(prev => ({
            ...prev,
            model: parts[0].trim(),
            revision: parts[1].trim(),
            baseUnitKittingNo: parts[2].trim(),
            assemblyNo: parts[3].trim(),
            deviceSerialNo: parts[4].trim(),
            accessoryKittingNo: parts[5]?.trim() || "",
            status: "In Progress"
        }));
        setProcessStatus('idle');
        return; // STOP DITO. Huwag nang ituloy sa handover checks.
    }

    // 2. RE-SCAN CHECK (Huwag i-scan kung andyan na sa station mo)
    if (unitStationIndex === myStationIndex) {
        throw new Error(`🛑 Unit is already at your station as ${dbUnit.status}.`);
    }

    // 3. HANDOVER CHECK (Para sa Station 2-15)
    if (unitStationIndex === myStationIndex - 1) {
        if (dbStatus !== 'completed') {
            throw new Error(`🛑 Handover Failed: Unit is '${dbUnit.status}' at ${unitStationName}. It must be 'Completed' first.`);
        }
        setScannedUnitId(dbUnit.id);
        setStatusMessage(`✅ Handover accepted from ${unitStationName}.`);
    } 
    
    // 4. SEQUENCE ERROR
    else {
        const requiredPrev = STATION_ORDER[myStationIndex - 1];
        throw new Error(`🚫 Sequence Violation: Unit is from ${unitStationName}. It must pass ${requiredPrev} first.`);
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
    model: parts[0]?.trim() || dbUnit?.model || "",
    revision: parts[1]?.trim() || dbUnit?.revision || "",
    // 🔑 HILAHIN ANG DATA MULA SA DATABASE (dbUnit) PARA HINDI MAG-NULL
    baseUnitKittingNo: dbUnit?.base_unit_kitting_no || parts[2]?.trim() || "",
    assemblyNo: dbUnit?.assembly_no || parts[3]?.trim() || "",
    deviceSerialNo: dbUnit?.device_serial_no || parts[4]?.trim() || "", 
    accessoryKittingNo: dbUnit?.accessory_kitting_no || parts[5]?.trim() || "",
    status: "In Progress", 
    remarks: dbUnit?.remarks || ""
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

    // --- HANDLE UNIT SUBMISSION / UPDATE (Omitted for brevity, unchanged) ---
const handleSubmit = async (e, checklist_data = null) => {
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
                // Ensure names match what units.php expects
                device_serial_no: formData.deviceSerialNo,
                accessory_kitting_no: formData.accessoryKittingNo,
                base_unit_kitting_no: formData.baseUnitKittingNo,
                station: currentStation, 
                full_name: user.full_name,
                username: user.username,
                checklist_data: checklist_data
            };

            // Always use POST - let PHP determine if it's update or create based on assembly_no
            const res = await axios.post(UNITS_ENDPOINT, commonData);

            if (res.data.status === 'success' || res.data.success === true) {
                setProcessStatus('success');
                setStatusMessage(`Unit saved successfully!`);
                setTimeout(() => {
                    setProcessStatus('idle'); 
                    resetForm(); 
                    scannerInputRef.current?.focus(); 
                    if (['home', 'in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) fetchUnits(activeTab === 'home' ? '' : activeTab);
                }, 2000);
            } else {
                // Handle cases where status is not success even if request technically passed
                const errorMsg = res.data.error || res.data.message || "Unknown Server Error";
                setProcessStatus('error');
                setStatusMessage(errorMsg); 
                setTimeout(() => setProcessStatus('idle'), 5000);
            }
        } catch (err) {
            // Handle error response from PHP backend
            setProcessStatus('error');
            
            // Extract error message from response
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            
            // Display the specific message directly so the operator sees the conflict details
            setStatusMessage(errMsg); 
            
            // Set a longer timeout (6 seconds) so the operator has time to read the full error
            setTimeout(() => setProcessStatus('idle'), 6000);
        }
    };
    
    // --- HANDLE REPORT SUBMISSION (Omitted for brevity, unchanged) ---
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

    // --- HANDLE UNIT EDIT (FROM LIST) (Omitted for brevity, unchanged) ---
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
                
                // Notify parent window (admin panel) to refresh data immediately
                if (window.parent !== window) {
                    window.parent.postMessage({ type: 'UNIT_UPDATED', data: res.data }, '*');
                }
                
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

    // --- USEEFFECT FOR DATA REFRESH (Handles fetch on tab switch) ---
    useEffect(() => { 
        if (activeTab === 'account_history') {
            fetchHistory();
        } 
        else if (activeTab === 'announcements') {
            fetchAnnouncements(); 
            // 🔑 IMPORTANT: Mark the newest visible announcement as read instantly
            if (announcements.length > 0) {
                 handleMarkAsRead(announcements[0].id);
            }
        }
        else if (['in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) {
            fetchUnits(activeTab);
        }
        else if (activeTab === 'home') {
            // Initial fetch handled by the unit polling effect above
        }
        else { 
            setUnitList([]); 
            setHistoryList([]); 
        }
    }, [activeTab, fetchUnits, fetchHistory, fetchAnnouncements, announcements.length, handleMarkAsRead]);

    // --- USEEFFECT FOR SCANNER FOCUS (Unchanged) ---
    useEffect(() => { 
        if (activeTab === "input_unit" && scannerInputRef.current && processStatus === 'idle') scannerInputRef.current.focus();
    }, [activeTab, processStatus]);

    if (!user) return <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">Initializing session...</div>;
    
    
    // 2. Calculate Stats for Dashboard Tab
    const homeStats = {
        completed: unitList.filter(u => u.status === 'Completed').length,
        inProgress: unitList.filter(u => u.status === 'In Progress').length,
        ng: unitList.filter(u => u.status === 'No Good (NG)').length,
    };
    
    // 🔑 CALCULATE UNREAD COUNT based on lastReadId from Local Storage
    const todayStr = new Date().toISOString().split('T')[0];

const todayAnnouncementsCount = announcements.filter(a => {
    // Siguraduhin na may created_at ang announcement object
    if (!a.created_at) return false;
    const announcementDate = new Date(a.created_at).toISOString().split('T')[0];
    return announcementDate === todayStr;
}).length


    // --- CONTENT RENDERER (Unchanged) ---
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <StationHomeDashboard
                        currentStation={currentStation}
                        homeStats={homeStats}
                        setActiveTab={setActiveTab}
                        announcementCount={todayAnnouncementsCount} 
                        logs={unitList} 
                        calculateMetrics={calculateMetrics} 
                        // Pass minimal station info, required by the chart component's original design
                        stations={[{ id: currentStation, name: currentStation }]} 
                        dynamicTargetTimes={dynamicTargetTimes} // Pass dynamic target times
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
                        currentStation={currentStation}
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

            case "announcements":
                return (
                    <AnnouncementView
                        announcements={announcements}
                        loading={announcementLoading}
                        error={announcementError}
                        AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                        DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                        onMarkAsRead={handleMarkAsRead} // 🔑 Pass the mark as read handler
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
            
            {/* PROFILE MODAL (New) */}
            {showProfileModal && (
                <UserProfileModal 
                    user={user} 
                    currentAvatar={headerAvatarSrc}
                    currentFullName={currentFullName}
                    onClose={() => setShowProfileModal(false)}
                    onSave={handleUpdateProfile}
                />
            )}

            {/* 🔑 Unit Status Change Toast (Still active) */}
            <StatusChangeToast 
                message={unitStatusNotification} 
                onClose={() => setUnitStatusNotification(null)} 
            />

            {/* ❌ Removed: New Announcement Pop-up Modal rendering block */}
            
            <div className="d-flex flex-row min-vh-100 bg-light font-sans"> 
                
{/* --- SIDEBAR: BLUE BACKGROUND (GLASS DESIGN) --- */}
<div className="d-flex flex-column flex-shrink-0 p-3 text-white shadow-lg" 
    style={{ 
        width: '260px', 
        position: 'fixed', // Ginawang fixed para hindi sumasama sa scroll ng content
        top: 0, 
        left: 0,
        height: '100vh', 
        backgroundColor: '#0f172a', 
        zIndex: 1000,
        borderRight: "1px solid rgba(255,255,255,0.05)"
    }}>
    
    <style>
        {`
            .nav-custom-btn {
                transition: all 0.2s ease;
                border-radius: 8px !important;
                border: 1px solid transparent !important;
                outline: none !important;
                color: #94a3b8 !important; /* Muted text */
                font-weight: 400 !important;
                font-size: 0.85rem !important;
            }
            
            /* Glassmorphism Effect para sa Active Tab */
            .active-glass {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
                color: white !important;
            }

            .nav-custom-btn:hover:not(.active-glass) {
                background-color: rgba(255, 255, 255, 0.03) !important;
                color: white !important;
            }

            .active-glass i {
                color: white !important;
                opacity: 1 !important;
            }

            .avatar-clickable:hover {
                transform: scale(1.05);
                transition: 0.2s;
                filter: brightness(1.1);
            }
        `}
    </style>

    {/* PROFILE SECTION */}
    <div className="d-flex align-items-center mb-3 mt-1 px-1">
        <div className="position-relative flex-shrink-0" style={{ cursor: 'pointer' }} onClick={() => setShowProfileModal(true)}>
            <img 
                src={headerAvatarSrc} 
                alt="User" 
                className="rounded-circle avatar-clickable"
                style={{ 
                    width: '42px', 
                    height: '42px', 
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)'
                }} 
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = DEFAULT_AVATAR_PATH; 
                }} 
            />
            <span className="position-absolute bottom-0 end-0 bg-success border border-dark rounded-circle" style={{width: '10px', height: '10px'}}></span>
        </div>
        <div className="ms-3 overflow-hidden">
            <div className="text-white text-truncate" style={{ fontSize: '0.85rem', fontWeight: '400' }}>
                {currentFullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px', letterSpacing: '0.3px' }}>
                Authorized Operator
            </div>
        </div>
    </div>

    <hr className="border-secondary opacity-25 mt-2" />

    {/* Navigation */}
    <nav className="flex-grow-1 overflow-auto custom-scrollbar pt-2">
        <ul className="nav nav-pills flex-column mb-auto gap-1">
            
            {/* DASHBOARD */}
            <li className="nav-item">
                <button 
                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 nav-custom-btn ${activeTab === 'home' ? 'active-glass' : ''}`} 
                    onClick={() => setActiveTab('home')}
                >
                    <i className="bi bi-grid-1x2 me-3"></i> Dashboard
                </button>
            </li>
            
            {/* UNIT ENTRY */}
            <li className="nav-item">
                <button 
                    className={`btn w-100 text-start d-flex align-items-center px-3 py-2 nav-custom-btn ${activeTab === 'input_unit' ? 'active-glass' : ''}`} 
                    onClick={() => setActiveTab('input_unit')}
                >
                    <i className="bi bi-qr-code-scan me-3"></i> Unit Entry
                </button>
            </li>

            <hr className="border-secondary my-2 opacity-25" />
            <li className="text-uppercase small text-secondary mb-1 px-3" style={{fontSize: '0.6rem', letterSpacing: '1px', fontWeight: '500'}}>Monitoring</li>
            
            {[
                { k: 'in_progress', i: 'bi-gear-wide-connected', l: 'In Progress' }, 
                { k: 'completed', i: 'bi-check-circle', l: 'Completed' }, 
                { k: 'no_good', i: 'bi-x-octagon', l: 'No Good (NG)' }, 
                { k: 'pending', i: 'bi-clock-history', l: 'Pending' }
            ].map(({ k, i, l }) => (
                <li key={k} className="nav-item">
                    <button 
                        className={`btn w-100 text-start d-flex align-items-center px-3 py-2 nav-custom-btn ${activeTab === k ? 'active-glass' : ''}`} 
                        onClick={() => setActiveTab(k)}
                    >
                        <i className={`bi ${i} me-3`}></i> {l}
                    </button>
                </li>
            ))}

            <hr className="border-secondary my-2 opacity-25" />
            <li className="text-uppercase small text-secondary mb-1 px-3" style={{fontSize: '0.6rem', letterSpacing: '1px', fontWeight: '500'}}>Reports & Logs</li>
            
            {[
                { k: 'daily_reports', i: 'bi-file-text', l: 'Daily Report' },
                { k: 'account_history', i: 'bi-journals', l: 'History Logs' },
                { k: 'announcements', i: 'bi-megaphone', l: 'Announcements' }
            ].map(({ k, i, l }) => (
                <li key={k} className="nav-item">
                    <button 
                        className={`btn w-100 text-start d-flex align-items-center px-3 py-2 nav-custom-btn ${activeTab === k ? 'active-glass' : ''}`} 
                        onClick={() => setActiveTab(k)}
                    >
                        <i className={`bi ${i} me-3`}></i> {l}
                    </button>
                </li>
            ))}
        </ul>
    </nav>

    {/* Sidebar Footer */}
    <div className="mt-auto pt-3 border-top border-secondary text-center text-white-50 opacity-25" style={{ fontSize: '0.65rem' }}>
        <span>©2025 MKFF Laser Technique</span>
    </div>
</div>

{/* --- MAIN CONTENT AREA --- */}
<div className="d-flex flex-column flex-grow-1" style={{ marginLeft: '260px', backgroundColor: '#EEEEEE' }}> 
    
    {/* --- HEADER: WHITE BACKGROUND --- */}
    <header className="bg-white d-flex justify-content-between align-items-center px-4 shadow-sm sticky-top z-2" 
        style={{ height: '70px', borderBottom: '1px solid #e5e7eb' }}>
        
        <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3 d-flex align-items-center justify-content-center" style={{width: '38px', height: '38px'}}>
                <i className="bi bi-layers-half fs-5"></i>
            </div>
            <div>
                <h6 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.3px' }}>{currentStation}</h6>
                <small style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Production Floor</small>
            </div>
        </div>

        <div className="d-flex align-items-center">
            <button 
                className="btn btn-sm d-flex align-items-center px-3 rounded-pill" 
                style={{ border: '1px solid #fecaca', color: '#ef4444', fontSize: '0.8rem', fontWeight: '500' }}
                onClick={onLogout}
            >
                <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
        </div>
    </header>

    {/* --- DYNAMIC CONTENT --- */}
    <div className="container-fluid p-4 flex-grow-1">
        <div className="fade-in-up">
            {renderContent()}
        </div>
    </div>
</div>

<style jsx>{`
    .fade-in-up { animation: fadeInUp 0.4s ease-out; }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* 🚨 ULTRA-THIN SCROLLBAR OVERRIDE */
    .custom-scrollbar::-webkit-scrollbar {
        width: 1px !important; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1) !important; 
    }
    .custom-scrollbar {
        scrollbar-width: thin; 
        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
`}</style>
            </div>
        </>
    );
}