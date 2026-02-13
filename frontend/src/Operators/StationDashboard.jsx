import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTargetTimes } from '../utils/targetTimeService';

// Import local assets
import logo from '../icon.ico'; 

// --- IMPORT SEPARATED VIEW/MODAL COMPONENTS ---
import { StationHomeDashboard } from './components/StationHomeDashboard';
import { UnitEntryForm } from './components/UnitEntryForm';
import { DailyReportForm } from './components/DailyReportForm';
import { UnitHistoryLog } from './components/UnitHistoryLog';
import { UnitListTable } from './components/UnitListTable';
import { EditUnitModal } from './modals/EditUnitModal';
import { AnnouncementView } from './components/AnnouncementView';
import { UserProfileModal } from './modals/UserProfileModal'; // <--- DAGDAG
import { NotificationBell } from './components/notifications/NotificationBell';
import { NotificationContent } from './components/notifications/NotificationContent';
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

// PROCESS STATION NAMES (Maps station number to process name)
const PROCESS_STATIONS = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
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

// Update page title based on active tab
useEffect(() => {
    const tabTitles = {
        'home': 'Home',
        'input_unit': 'Unit Entry',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'no_good': 'No Good',
        'pending': 'Pending',
        'daily_reports': 'Daily Report',
        'account_history': 'Unit History',
        'announcements': 'Announcements',
        'notifications': 'Notifications'
    };
    const tabTitle = tabTitles[activeTab] || 'Dashboard';
    const stationName = user?.station_assigned ? ` - ${user.station_assigned}` : '';
    document.title = `MKFF - Operator${stationName} - ${tabTitle}`;
}, [activeTab, user?.station_assigned]); 
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
    const [unitList, setUnitList] = useState([]); // For tab-specific content
    const [globalUnitList, setGlobalUnitList] = useState([]); // For sidebar badges - never cleared
    const [allUnitsForPcba, setAllUnitsForPcba] = useState([]); // For PCBA auto-population - ALL units
    const [historyList, setHistoryList] = useState([]); 
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [unitToEdit, setUnitToEdit] = useState(null); 
    const [scannedUnitId, setScannedUnitId] = useState(null); 
    const [highlightedUnitId, setHighlightedUnitId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // 🔑 REF for Previous Unit List (used for status change detection)
    const prevUnitListRef = useRef([]);
    const prevGlobalUnitListRef = useRef([]); // For global data comparison

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

// Get process name for display (e.g., "Station2" -> "Integrated Board Test")
const getProcessName = useCallback(() => {
    const stationNum = currentStation.replace(/\D/g, ''); // Extract number
    const index = parseInt(stationNum) - 1; // Convert to 0-based index
    return PROCESS_STATIONS[index] || currentStation; // Fallback to station name if not found
}, [currentStation]);

const processName = getProcessName();

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
    
    // --- HOOKED FUNCTIONS: FETCH UNIT LIST (Refactored for universal polling) ---
    const fetchUnits = useCallback(async (status, isBackgroundPoll = false) => { 
    // Only show loading state for initial loads, not background polling
    if (!isBackgroundPoll && activeTab !== 'home') {
        setListLoading(true); 
        setListError(null);
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

        // 🔑 SILENT FETCHING: Only update state if data actually changed during background poll
        if (isBackgroundPoll) {
            // Check if data has changed by comparing with previous state
            const currentData = JSON.stringify(prevUnitListRef.current);
            const newData = JSON.stringify(newUnitList);
            
            if (currentData !== newData) {
                // Only update if data is different
                setUnitList(newUnitList);
                prevUnitListRef.current = newUnitList;
            }
        } else {
            // Always update for non-background polls
            setUnitList(newUnitList);
            prevUnitListRef.current = newUnitList;
        }

    } catch (err) {
        setListError(`Failed to load data: ${err.message}`);
    } finally {
        if (!isBackgroundPoll && activeTab !== 'home') setListLoading(false);
    }
}, [currentStation, activeTab]); 

    // --- 🔑 HOOKED FUNCTIONS: FETCH GLOBAL UNITS FOR SIDEBAR (Never cleared) ---
    const fetchGlobalUnits = useCallback(async (isBackgroundPoll = false) => {
        try {
            const res = await axios.get(UNITS_ENDPOINT, {
                params: {
                    station: currentStation,
                    status: '' // Get all units for sidebar counts
                }
            });
            
            const rawData = Array.isArray(res.data) ? res.data : [];
            const newGlobalUnitList = rawData.map(unit => ({
                ...unit,
                deviceSerialNo: unit.device_serial_no,
                accessoryKittingNo: unit.accessory_kitting_no,
                baseUnitKittingNo: unit.base_unit_kitting_no,
                assemblyNo: unit.assembly_no
            }));

            // 🔑 SILENT FETCHING: Only update if data actually changed during background poll
            if (isBackgroundPoll) {
                const currentData = JSON.stringify(prevGlobalUnitListRef.current);
                const newData = JSON.stringify(newGlobalUnitList);
                
                if (currentData !== newData) {
                    setGlobalUnitList(newGlobalUnitList);
                    prevGlobalUnitListRef.current = newGlobalUnitList;
                }
            } else {
                setGlobalUnitList(newGlobalUnitList);
                prevGlobalUnitListRef.current = newGlobalUnitList;
            }

        } catch (err) {
            console.error("Failed to fetch global units:", err);
        }
    }, [currentStation]); 
    
    // --- 🔑 HOOKED FUNCTIONS: FETCH ALL UNITS FOR PCBA AUTO-POPULATION ---
    const fetchAllUnitsForPcba = useCallback(async () => {
        try {
            const res = await axios.get(UNITS_ENDPOINT, {
                params: {
                    station: '', // Get ALL units regardless of station
                    status: ''   // Get ALL units regardless of status
                }
            });
            
            const rawData = Array.isArray(res.data) ? res.data : [];
            const newAllUnitsList = rawData.map(unit => ({
                ...unit,
                deviceSerialNo: unit.device_serial_no,
                accessoryKittingNo: unit.accessory_kitting_no,
                baseUnitKittingNo: unit.base_unit_kitting_no,
                assemblyNo: unit.assembly_no
            }));
            
            setAllUnitsForPcba(newAllUnitsList);
            console.log("Fetched ALL units for PCBA:", newAllUnitsList.length, "units");
        } catch (err) {
            console.error("Failed to fetch all units for PCBA:", err);
        }
    }, []); // No dependencies - fetches all units regardless
    
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

    // --- NOTIFICATION HANDLERS ---
    const handleBellClick = () => { setActiveTab('notifications'); };
    const handleNotificationClick = (notification) => {
        if (notification.type === 'DelayedUnit') {
            // Highlight unit in current view
            setHighlightedUnitId(notification.unitId);
            
            // Navigate to appropriate tab based on unit status
            const status = (notification.status || '').toLowerCase();
            if (status.includes('no good') || status.includes('ng')) {
                setActiveTab('no_good');
            } else if (status.includes('in progress')) {
                setActiveTab('in_progress');
            } else if (status.includes('completed')) {
                setActiveTab('completed');
            } else {
                setActiveTab('in_progress'); // Default fallback
            }
            
            // Clear highlight after 5 seconds
            setTimeout(() => {
                setHighlightedUnitId(null);
            }, 5000);
        }
    };

    // --- CHECK DELAYED UNITS FOR NOTIFICATIONS ---
    const checkDelayedUnitsForNotifications = useCallback((allUnits) => {
        const now = new Date();
        const newDelayedNotifications = [];

        // Check for delayed units and NG units at current station ONLY
        const validDelayedUnits = allUnits.filter(unit => {
            const status = (unit.status || '').trim();
            // Only check units at current station that are In Progress or No Good
            return unit.station === currentStation && (
                status === 'In Progress' || 
                status.toLowerCase().includes('no good') || 
                status.toLowerCase() === 'ng'
            );
        });

        validDelayedUnits.forEach(unit => {
            // Use dynamic thresholds for delay calculation
            // Try both with and without space in station name
            const thresholdMinutes = dynamicTargetTimes[currentStation] || 
                                    dynamicTargetTimes[currentStation.replace(' ', '')] || 
                                    dynamicTargetTimes[currentStation.replace(/(\d+)/, ' $1')] || 
                                    10;
            
            // Only check if threshold is greater than 0
            if (thresholdMinutes > 0) {
                const startTime = new Date(unit.updated_at || unit.created_at);
                const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

                // Only create notification if actually delayed (>= to trigger immediately at threshold)
                if (elapsedMinutes >= thresholdMinutes) {
                    // Determine if NG or normal delay for title
                    const isNG = unit.status.toLowerCase().includes('ng') || unit.status.toLowerCase().includes('no good');
                    const alertTitle = isNG ? `🚨 Quality Alert (NG)` : `⚠️ Unit Delay Alert`;

                    newDelayedNotifications.push({
                        id: `delayed-${unit.id}`,
                        type: 'DelayedUnit',
                        unitId: unit.id,
                        title: alertTitle,
                        message: `Unit ${unit.assembly_no || unit.device_serial_no} (${unit.status}) - ${elapsedMinutes} mins (Limit: ${thresholdMinutes} mins).`,
                        timestamp: now.toISOString(),
                        stationId: currentStation,
                        assemblyNo: unit.assembly_no,
                        deviceSerialNo: unit.device_serial_no,
                        status: unit.status,
                        elapsedMinutes,
                        thresholdMinutes
                    });
                }
            }
        });

        // Only update notifications if there's a change to prevent unnecessary re-renders
        setNotifications(prev => {
            const prevIds = prev.map(n => n.id).sort().join(',');
            const newIds = newDelayedNotifications.map(n => n.id).sort().join(',');
            
            // If notification IDs are the same, don't update
            if (prevIds === newIds) return prev;
            
            return newDelayedNotifications;
        });
    }, [currentStation, dynamicTargetTimes]);

    // --- POLLING EFFECT FOR ANNOUNCEMENTS (1 second) ---
    useEffect(() => {
        fetchAnnouncements(); 
        const intervalId = setInterval(fetchAnnouncements, 1000); 

        return () => clearInterval(intervalId);
    }, [fetchAnnouncements]);
    // --- END ANNOUNCEMENT POLLING EFFECT ---

    // --- GLOBAL POLLING EFFECT FOR SIDEBAR COUNTERS (2 seconds) ---
    useEffect(() => {
        // Initial fetch for sidebar
        fetchGlobalUnits(false);
        
        // This effect runs regardless of activeTab to keep sidebar badges updated
        const intervalId = setInterval(() => {
            fetchGlobalUnits(true); // Fetch all units for sidebar, mark as background poll
        }, 2000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchGlobalUnits]); // Only depends on fetchGlobalUnits

    // --- REAL-TIME NOTIFICATION CHECK EFFECT (Every 1 second) ---
    useEffect(() => {
        // Initial check
        if (globalUnitList.length > 0) {
            console.log('🔄 [INITIAL] Notification check triggered');
            checkDelayedUnitsForNotifications(globalUnitList);
        }

        // Set up interval for real-time checking every 1 second
        const notificationInterval = setInterval(() => {
            if (globalUnitList.length > 0) {
                console.log('⏰ [REAL-TIME] Notification check triggered by interval');
                checkDelayedUnitsForNotifications(globalUnitList);
            }
        }, 1000); // Check every 1 second for real-time updates

        return () => clearInterval(notificationInterval);
    }, [globalUnitList, checkDelayedUnitsForNotifications]); // Re-run when data or function changes

    // --- IMMEDIATE THRESHOLD CHANGE EFFECT ---
    useEffect(() => {
        // Immediately re-check notifications when thresholds change
        console.log('🎯 [THRESHOLD CHANGE] Thresholds updated, re-checking notifications immediately');
        console.log('🎯 [THRESHOLD CHANGE] New thresholds:', dynamicTargetTimes);
        if (globalUnitList.length > 0) {
            checkDelayedUnitsForNotifications(globalUnitList);
        }
    }, [dynamicTargetTimes, checkDelayedUnitsForNotifications]); // Trigger on threshold changes

    // --- EFFECT: FETCH ALL UNITS FOR PCBA AUTO-POPULATION ---
    useEffect(() => {
        fetchAllUnitsForPcba(); // Initial fetch
        // Optional: Refresh every 30 seconds to keep data fresh
        const intervalId = setInterval(fetchAllUnitsForPcba, 30000);
        return () => clearInterval(intervalId);
    }, [fetchAllUnitsForPcba]);

    // --- UNIVERSAL POLLING EFFECT FOR UNIT STATUS CHECK (1 second) ---
    useEffect(() => {
        let intervalId;
        
        // Define monitoring tabs that need real-time updates
        const monitoringTabs = ['home', 'in_progress', 'completed', 'no_good', 'pending'];
        
        if (monitoringTabs.includes(activeTab)) {
            // Initial fetch for current tab
            fetchUnits(activeTab === 'home' ? '' : activeTab, false);
            
            // Start polling every 1 second for real-time updates
            intervalId = setInterval(() => {
                fetchUnits(activeTab === 'home' ? '' : activeTab, true); // Mark as background poll
            }, 1000);
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

        // QR Format: MODEL|REV|BASE|ASSEMBLY|MNBD|CMBD|LRBD|PQBD|BKBD|ACC
        // Actual format from ITAssistantPage: MODEL|REV|BASE|ASSEMBLY|MNBD|CMBD|LRBD|PQBD|BKBD|ACC (10 parts)
        const scannedAssembly = parts[3].trim();
        const scannedDeviceSerial = ''; // Device serial is NOT in QR code - will be auto-generated at Station 6
        const scannedAccessory = parts.length >= 10 ? parts[9].trim() : ''; // ACC is at index 9
        const hasBoardNumbers = parts.length >= 10; // Check if board numbers are present (10 parts means boards included)
        
        // Debug logging to understand QR format
        console.log('QR Debug:', {
            partsLength: parts.length,
            parts: parts,
            scannedAssembly,
            scannedDeviceSerial,
            scannedAccessory,
            hasBoardNumbers
        });
        
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
            // 1. SEARCH LOGIC: Hanapin ang unit by Accessory or Assembly
            let response;
            if (scannedAccessory) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_serial: scannedAccessory } });
            } else if (scannedAssembly) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_assembly: scannedAssembly } });
            } else {
                throw new Error("Invalid QR: No Accessory or Assembly Number found.");
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
            deviceSerialNo: '', // Device serial not in QR - will be auto-generated at Station 6
            accessoryKittingNo: scannedAccessory || '', // Use actual accessory from QR (index 9)
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
    deviceSerialNo: dbUnit?.device_serial_no || '', // Device serial not in QR - will be auto-generated at Station 6
    accessoryKittingNo: dbUnit?.accessory_kitting_no || (parts.length >= 10 ? parts[9]?.trim() : '') || '',
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

    // --- HANDLE UNIT SUBMISSION / UPDATE ---
const handleSubmit = async (e, checklist_data = null) => {
        e.preventDefault();
        if (!formData.assemblyNo) {
            setProcessStatus('error'); 
            setStatusMessage("Assembly No. is required."); 
            setTimeout(() => setProcessStatus('idle'), 3000); 
            return;
        }
        
        // Prevent duplicate submissions
        if (processStatus === 'loading') {
            return;
        }
        
        // Check if this is a duplicate submission (same data within 2 seconds)
        const submissionKey = `${formData.assemblyNo}-${currentStation}-${formData.status}`;
        const now = Date.now();
        if (window.lastSubmission && 
            window.lastSubmission.key === submissionKey && 
            (now - window.lastSubmission.time) < 2000) {
            setProcessStatus('error');
            setStatusMessage("⚠️ Duplicate submission detected. Please wait...");
            setTimeout(() => setProcessStatus('idle'), 2000);
            return;
        }
        
        // Store submission tracking
        window.lastSubmission = {
            key: submissionKey,
            time: now
        };
        
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
        // 🔑 REMOVED: setUnitList([]) to prevent sidebar flickering
    }, [activeTab, fetchUnits, fetchHistory, fetchAnnouncements, announcements.length, handleMarkAsRead]);

    // --- USEEFFECT FOR DROPDOWN CLICK OUTSIDE ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserDropdown]);

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
    
    // 🔑 Calculate real-time counts for sidebar badges with fallback using global data
    const sidebarCounts = {
        inProgress: (globalUnitList || []).filter(u => u.status === 'In Progress').length,
        completed: (globalUnitList || []).filter(u => u.status === 'Completed').length,
        noGood: (globalUnitList || []).filter(u => u.status === 'No Good (NG)').length,
        pending: (globalUnitList || []).filter(u => u.status === 'Pending Approval').length,
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
                        allUnits={allUnitsForPcba} // Use ALL units for PCBA auto-population
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
                        dynamicTargetTimes={dynamicTargetTimes}
                        highlightedUnitId={highlightedUnitId}
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
                        onMarkAsRead={handleMarkAsRead} // 🔑 Pass mark as read handler
                    />
                );
            case "notifications":
                return (
                    <NotificationContent
                        notifications={notifications}
                        onNotificationClick={handleNotificationClick}
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

            .user-dropdown-toggle:hover {
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .dropdown-menu-item {
                transition: all 0.2s ease;
                border-left: 3px solid transparent;
            }

            .dropdown-menu-item:hover {
                background: #f8f9fa;
                border-left-color: #0d6efd;
                transform: translateX(2px);
            }

            .dropdown-menu-item i {
                transition: transform 0.2s ease;
            }

            .dropdown-menu-item:hover i {
                transform: scale(1.1);
            }
        `}
    </style>

    {/* PROFILE SECTION */}
    <div className="d-flex align-items-center mb-3 mt-1 px-1">
        <div className="position-relative flex-shrink-0" style={{ cursor: 'default' }}>
            <img 
                src={headerAvatarSrc} 
                alt="User" 
                className="rounded-circle"
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
        <div className="ms-3 flex-grow-1 user-dropdown-container position-relative">
            <div className="text-white text-truncate position-relative user-dropdown-toggle px-2 py-1 rounded" style={{ fontSize: '0.85rem', fontWeight: '400', cursor: 'pointer' }} onClick={() => setShowUserDropdown(!showUserDropdown)}>
                {currentFullName}
                <i className={`bi bi-chevron-${showUserDropdown ? 'up' : 'down'} ms-1`} style={{ fontSize: '0.7rem' }}></i>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px', letterSpacing: '0.3px' }}>
                Authorized Operator
            </div>
            
            {/* User Dropdown Menu */}
            {showUserDropdown && (
                <div className="position-absolute top-100 start-0 mt-2 w-100 bg-white rounded shadow-lg" style={{ zIndex: 1000, minWidth: '220px', border: '1px solid #e9ecef' }}>
                    <div className="py-1">
                        <button 
                            className="dropdown-menu-item btn btn-sm w-100 text-start d-flex align-items-center px-3 py-2 text-dark"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => {
                                setShowProfileModal(true);
                                setShowUserDropdown(false);
                            }}
                        >
                            <i className="bi bi-person-gear me-2 text-primary"></i>
                            <span>Edit Profile</span>
                        </button>
                        <button 
                            className="dropdown-menu-item btn btn-sm w-100 text-start d-flex align-items-center px-3 py-2 text-dark"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => {
                                onLogout();
                                setShowUserDropdown(false);
                            }}
                        >
                            <i className="bi bi-box-arrow-right me-2 text-danger"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
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
                { k: 'in_progress', i: 'bi-gear-wide-connected', l: 'In Progress', countKey: 'inProgress', color: 'warning' }, 
                { k: 'completed', i: 'bi-check-circle', l: 'Completed', countKey: 'completed', color: 'success' }, 
                { k: 'no_good', i: 'bi-x-octagon', l: 'No Good (NG)', countKey: 'noGood', color: 'danger' }, 
                { k: 'pending', i: 'bi-clock-history', l: 'Pending', countKey: 'pending', color: 'primary' }
            ].map(({ k, i, l, countKey, color }) => {
                const count = sidebarCounts[countKey];
                
                return (
                    <li key={k} className="nav-item">
                        <button 
                            className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 nav-custom-btn ${activeTab === k ? 'active-glass' : ''}`} 
                            onClick={() => setActiveTab(k)}
                        >
                            <div className="d-flex align-items-center">
                                <i className={`bi ${i} me-3`}></i> 
                                <span>{l}</span>
                            </div>
                            {count > 0 && (
                                <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}

            <hr className="border-secondary my-2 opacity-25" />
            <li className="text-uppercase small text-secondary mb-1 px-3" style={{fontSize: '0.6rem', letterSpacing: '1px', fontWeight: '500'}}>Reports & Logs</li>
            
            {[
                { k: 'daily_reports', i: 'bi-file-text', l: 'Daily Report' },
                { k: 'account_history', i: 'bi-journals', l: 'History Logs' },
                { k: 'announcements', i: 'bi-megaphone', l: 'Announcements' }
            ].map(({ k, i, l }) => (
                <li key={k} className="nav-item">
                    <button 
                        className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 nav-custom-btn ${activeTab === k ? 'active-glass' : ''}`} 
                        onClick={() => setActiveTab(k)}
                    >
                        <div className="d-flex align-items-center">
                            <i className={`bi ${i} me-3`}></i> 
                            <span>{l}</span>
                        </div>
                        {k === 'announcements' && todayAnnouncementsCount > 0 && (
                            <span className="text-white fw-bold" style={{ fontSize: '0.8rem' }}>
                                {todayAnnouncementsCount}
                            </span>
                        )}
                    </button>
                </li>
            ))}
        </ul>
    </nav>

    {/* Sidebar Footer */}
    <div className="mt-auto pt-3 border-top border-secondary text-center text-white-50 opacity-25" style={{ fontSize: '0.65rem' }}>
        
        <span>@2025 MKFF Laser Technique</span>
    </div>
</div>

{/* --- MAIN CONTENT AREA --- */}
<div className="d-flex flex-column flex-grow-1" style={{ marginLeft: '260px', backgroundColor: '#EEEEEE' }}> 
    
    {/* --- HEADER: WHITE BACKGROUND --- */}
    <header className="bg-white d-flex justify-content-between align-items-center px-4 shadow-sm sticky-top z-2" 
        style={{ 
            height: '80px', 
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            flexShrink: 0
        }}>
        
        <div className="d-flex align-items-center">
            <img 
                src={logo} 
                alt="MKFF Logo" 
                style={{ 
                    height: '42px', 
                    width: 'auto',
                    objectFit: 'contain',
                    marginRight: '20px'
                }} 
            />
            <div className="d-flex flex-column">
                <h4 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                    {currentStation} - {processName}
                </h4>
                <span className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Production Floor
                </span>
            </div>
        </div>

        <div className="d-flex align-items-center">
            <NotificationBell notifications={notifications} onClick={handleBellClick} />
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