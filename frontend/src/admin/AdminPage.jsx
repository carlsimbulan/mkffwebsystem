import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTargetTimes, targetTimeService } from '../utils/targetTimeService';

// 1. CHART IMPORTS & REGISTRATION (Keep for global chart setup)
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import logo from '../logo.png';

// 2. IMPORT SEPARATED COMPONENTS (Updated List)
// Import all components from organized index files
import {
    EditUnitModal,
    ReportDetailModal,
    ManageUserModal,
    DeleteUserModal,
    SubmitReportModal,
    StationHistoryModal,
    ViewUserModal,
    AnnouncementModal,
    ApproveUnitModal,
    DeleteAnnouncementModal,
    TargetTimeModal
} from './modals';

import {
    Dashboard,
    StationsOverview,
    ReportsView,
    AnnouncementsView,
    ApprovalQueue,
    UserManagement,
    InventoryView,
    Shipment,
    NoGoodUnits,
    StationBarChart,
    UnitPieChart,
    NotificationBell,
    NotificationContent
} from './components';

// Palitan ang lumang import ng:
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// REGISTER CHART COMPONENTS GLOBALLY
ChartJS.register(
    ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend
);

// --- CONFIGURATION CONSTANT: DELAY THRESHOLDS ---
const DELAY_THRESHOLDS_MINUTES = {
    // ... (keep original DELAY_THRESHOLDS_MINUTES object) ...
    'Station1': 6, 'Station 1': 6,
    'Station2': 8, 'Station 2': 8,
    'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12,
    'Station5': 15, 'Station 5': 15,
    'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3,
    'Station8': 15, 'Station 8': 15,
    'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8,
    'Station11': 22, 'Station 11': 22,
    'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10,
    'Station14': 8, 'Station 14': 8,
    'Station15': 5, 'Station 15': 5,
};

// Base URL for the API
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const REPORTS_ENDPOINT = `${API_BASE_URL}/daily_reports.php`;
const USER_MANAGEMENT_ENDPOINT = `${API_BASE_URL}/user_management.php`;
const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`; 
const ANNOUNCEMENTS_ENDPOINT = `${API_BASE_URL}/announcements.php`;
const INVENTORY_ENDPOINT = `${API_BASE_URL}/inventory.php`; // Gagawa tayo nito mamaya

// --- LOCAL PATHS ---
const AVATAR_UPLOAD_PATH = `${API_BASE_URL}/uploads/avatars/`;
const DEFAULT_AVATAR_PATH = `${API_BASE_URL}/uploads/avatars/default_avatar.png`;

// Helper function to format date as YYYY-MM-DD
// 🔑 PINALITAN: Siguradong Philippine Time (Asia/Manila)
const getTodayDate = () => {
    return new Intl.DateTimeFormat('en-CA', { // format: YYYY-MM-DD
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
};
export default function AdminPage({ user, onLogout }) {
    const navigate = useNavigate();
const location = useLocation();

// Use dynamic target times from centralized service
const { thresholds: dynamicDelayThresholds } = useTargetTimes();

// Kinukuha ang huling part ng URL (e.g., /admin/dashboard -> "dashboard")
const activeTab = location.pathname.split('/').pop() || "dashboard";

// Function para sa paglipat ng tab gamit ang URL
const handleTabChange = (tabName) => {
    navigate(`/admin/${tabName}`);
};
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showQualityDropdown, setShowQualityDropdown] = useState(false);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState(getTodayDate());
    const [logs, setLogs] = useState([]); // Unit logs (Current State)
    const [unitHistoryLogs, setUnitHistoryLogs] = useState([]); // HISTORY LOGS
    const [dailyReportsList, setDailyReportsList] = useState([]); 
    const [userList, setUserList] = useState([]); 
    const [stations, setStations] = useState([]); 
    const [stationMonitorId, setStationMonitorId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [inventoryList, setInventoryList] = useState([]);
  
    const [successMessage, setSuccessMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Kalkulahin ang bilang para sa No Good List at Shipment
    const noGoodCount = logs.filter(l => l.status === 'No Good (NG)').length;
    const shipmentCount = logs.filter(l => 
    l.status === 'Completed' && 
    (l.station === 'Station15' || l.station === 'Station 15')
).length;

    // STATES for Reports and Editing
    const [reportDate, setReportDate] = useState(getTodayDate());
    const [reportFilterStationId, setReportFilterStationId] = useState('All');
    const [selectedUnitToEdit, setSelectedUnitToEdit] = useState(null);
    const [selectedReportToView, setSelectedReportToView] = useState(null);
    const [selectedUserToManage, setSelectedUserToManage] = useState(null);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [stationHistoryId, setStationHistoryId] = useState(null);

    // --- NOTIFICATION STATES ---
    const [notifications, setNotifications] = useState([]);
    // FIX: Initialize with useState(new Set())
    const [lastSeenReportIds, setLastSeenReportIds] = useState(new Set()); 
    const [highlightedUnitId, setHighlightedUnitId] = useState(null);
    // NEW STATE: For New Reports Today Count
    const [newReportsToday, setNewReportsToday] = useState(0); 

    const [announcements, setAnnouncements] = useState([]); 
    const [showPostModal, setShowPostModal] = useState(false); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [showPasswordInModal, setShowPasswordInModal] = useState(false); 

    // --- NEW APPROVAL MODAL STATES ---
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedLogToApprove, setSelectedLogToApprove] = useState(null);
    
    // --- TARGET TIME MANAGEMENT STATES ---
    const [showTargetTimeModal, setShowTargetTimeModal] = useState(false);
    
    // --- DASHBOARD CHART STATES ---
    const [dashboardView, setDashboardView] = useState('bar');
    const chartViews = ['bar', 'pie'];


    // Define the initial structure for a new user object
    const initialNewUserData = {
        id: null,
        username: '',
        password: '',
        role: 'Operator',
        full_name: '',
        station: '',
        avatar_url: '',
        avatar_file: null,
    };

    // --- CHECK DELAYED UNITS AND REPORTS (UPDATED TO USE DYNAMIC THRESHOLDS) ---
    // 🔑 FIX: Gamitin ang updated_at para sa station-specific timing
const checkDelayedUnitsAndReports = useCallback((allUnits) => {
    const now = new Date();
    const newDelayedNotifications = [];
    const currentDelayedUnitIds = new Set();

    // 🔑 PINALITAN: Isama ang 'In Progress' AT 'No Good (NG)' sa delay monitoring
    const validDelayedUnits = allUnits.filter(l => {
        const status = (l.status || '').trim();
        // Tatanggapin ang 'In Progress' o kahit anong status na may 'No Good' o 'NG'
        return status === 'In Progress' || 
               status.toLowerCase().includes('no good') || 
               status.toLowerCase() === 'ng';
    });

    validDelayedUnits.forEach(unit => {
        const stationId = unit.station;
        // Use dynamic thresholds instead of static ones
        const thresholdMinutes = dynamicDelayThresholds[stationId] || dynamicDelayThresholds[stationId.replace(' ', '')] || 0;

        if (thresholdMinutes > 0) {
            const startTime = new Date(unit.updated_at || unit.created_at); 
            const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

            if (elapsedMinutes > thresholdMinutes) {
                currentDelayedUnitIds.add(unit.id);
                
                // Tukuyin kung NG ba o normal delay para sa title
                const isNG = unit.status.toLowerCase().includes('ng') || unit.status.toLowerCase().includes('no good');
                const alertTitle = isNG ? `🚨 Quality Alert (NG) at ${stationId}` : `⚠️ Unit Delay Alert at ${stationId}`;

                newDelayedNotifications.push({
                    id: `delayed-${unit.id}`,
                    type: 'DelayedUnit',
                    title: alertTitle,
                    message: `Unit ${unit.assembly_no} (${unit.status}) stayed for ${elapsedMinutes} mins (Limit: ${thresholdMinutes} mins).`,
                    timestamp: now.toISOString(),
                    unitId: unit.id,
                    stationId: stationId,
                });
            }
        }
    });

    setNotifications(newDelayedNotifications);
}, [dynamicDelayThresholds]); // Add dynamicDelayThresholds to dependency array


    // --- FETCH DATA (UPDATED TO INCLUDE HISTORY LOGS AND NEW REPORT COUNT) ---
const fetchData = async () => {
    // 1. Mag-loading spinner lang kung ito ang kauna-unahang load at wala pang data
    const isFirstLoad = logs.length === 0 && loading;

    if (isFirstLoad) {
        setLoading(true);
    }

    setError(null);
    try {
        // 1. Fetch Units/Logs
        const unitsRes = await axios.get(UNITS_ENDPOINT);
        const fetchedUnits = unitsRes.data || [];
        if (JSON.stringify(fetchedUnits) !== JSON.stringify(logs)) {
            setLogs(fetchedUnits);
        }

        // 1.5 Fetch Unit History Logs
        const historyRes = await axios.get(HISTORY_ENDPOINT);
        const fetchedHistory = Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data.data || []);
        if (JSON.stringify(fetchedHistory) !== JSON.stringify(unitHistoryLogs)) {
            setUnitHistoryLogs(fetchedHistory);
        }

        // 2. Fetch Daily Reports
        const reportsRes = await axios.get(REPORTS_ENDPOINT);
        const fetchedReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
        if (JSON.stringify(fetchedReports) !== JSON.stringify(dailyReportsList)) {
            setDailyReportsList(fetchedReports);
        }

        // Calculate New Reports Today
        const today = getTodayDate();
        const reportsToday = fetchedReports.filter(report => {
            const reportDatePart = report.report_date ? report.report_date.split(' ')[0] : null;
            return reportDatePart === today;
        }).length;
        setNewReportsToday(reportsToday);

        // 3. Fetch User List
        const usersRes = await axios.get(USER_MANAGEMENT_ENDPOINT);
        const fetchedUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        if (JSON.stringify(fetchedUsers) !== JSON.stringify(userList)) {
            setUserList(fetchedUsers);
        }

        const inventoryRes = await axios.get(INVENTORY_ENDPOINT);
        setInventoryList(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);

        const loggedInUserData = fetchedUsers.find(u => u.id === user.id);
        if (loggedInUserData) {
            user.full_name = loggedInUserData.full_name;
            user.avatar_url = loggedInUserData.avatar_url;
        }

        // Fetch Announcements
        const announcementsRes = await axios.get(ANNOUNCEMENTS_ENDPOINT);
        const fetchedAnnouncements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
        if (JSON.stringify(fetchedAnnouncements) !== JSON.stringify(announcements)) {
            setAnnouncements(fetchedAnnouncements);
        }

        // 4. Mock Station Data
        const mockStations = Array.from({ length: 15 }, (_, i) => ({
            id: `Station${i + 1}`,
            name: `Station ${i + 1}`,
            operator: `Operator-${100 + i}`
        }));
        setStations(mockStations);

        // 5. Run Notification Logic
        checkDelayedUnitsAndReports(fetchedUnits);

    } catch (err) {
        console.error("Error fetching data:", err);
        // Ipakita lang ang error message sa screen kung talagang walang ma-display na data
        if (logs.length === 0) {
            setError(`Failed to fetch data. ${err.message}`);
        }
    } finally {
        // Palaging i-set sa false ang loading pagkatapos ng unang attempt
        setLoading(false);
    }
};

    const refreshAndCloseReport = () => {
        // Resetting lastSeenReportIds is not strictly necessary for this logic
        // setLastSeenReportIds(new Set()); 
        fetchData();
        setShowReportModal(false);
    };

    // UseEffect for Polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000);
        
        // Listen for real-time updates from operator dashboard
        const handleMessage = (event) => {
            if (event.data.type === 'UNIT_UPDATED') {
                console.log('Received unit update notification:', event.data);
                fetchData(); // Refresh data immediately
            }
        };
        
        window.addEventListener('message', handleMessage);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('message', handleMessage);
        };
    }, [checkDelayedUnitsAndReports]); // Added checkDelayedUnitsAndReports to dependency array to satisfy ESLint, though the polling interval keeps it running.

    // --- TARGET TIME MANAGEMENT HANDLERS ---
    const handleTargetTimeManagement = () => {
        setShowTargetTimeModal(true);
    };

    const handleSaveTargetTimes = async (newTargetTimes) => {
        try {
            await targetTimeService.updateTargetTimes(newTargetTimes);
            setSuccessMessage("Target times updated successfully! New thresholds are now active across all systems.");
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (error) {
            console.error('Failed to save target times:', error);
            alert('Failed to save target times. Please try again.');
        }
    };

    // --- DASHBOARD CHART HANDLERS (KEPT AS IS) ---
    const nextChart = () => {
        setDashboardView(prev => {
            const currentIndex = chartViews.indexOf(prev);
            const nextIndex = (currentIndex + 1) % chartViews.length;
            return chartViews[nextIndex];
        });
    };

    const prevChart = () => {
        setDashboardView(prev => {
            const currentIndex = chartViews.indexOf(prev);
            const prevIndex = (currentIndex - 1 + chartViews.length) % chartViews.length;
            return chartViews[prevIndex];
        });
    };

    // --- NOTIFICATION HANDLERS (KEPT AS IS) ---
    const handleBellClick = () => { handleTabChange('notifications'); };
    const handleDismissAllNotifications = () => { setNotifications([]); handleTabChange('dashboard'); };
    const handleClearNewReports = () => { setNotifications(prev => prev.filter(n => n.type !== 'NewReport')); };
    const handleClearDelayedUnits = () => { setNotifications(prev => prev.filter(n => n.type !== 'DelayedUnit')); };

    const handleNotificationClick = (notification) => {
    if (notification.type === 'NewReport') {
        setHighlightedUnitId(null);
        handleTabChange('reports');
        const report = dailyReportsList.find(r => r.id === notification.reportId);
        if (report) {
            setReportDate(report.report_date.split(' ')[0]);
            setReportFilterStationId(report.station); 
            setSelectedReportToView(report);
        }
        // Alisin ang notification sa listahan matapos i-click
        setNotifications(prev => prev.filter(n => n.id !== notification.id));

    } else if (notification.type === 'DelayedUnit') {
        // 1. I-save muna ang Unit ID para sa highlighting
        setHighlightedUnitId(notification.unitId);

        // 2. Hanapin at i-set ang tamang Station ID
        const targetStation = stations.find(s => 
            s.id.replace(/\s/g, '').toLowerCase() === notification.stationId.replace(/\s/g, '').toLowerCase()
        );

        if (targetStation) {
            setStationMonitorId(targetStation.id);
        } else {
            // Fallback kung hindi mahanap ang exact match
            setStationMonitorId(notification.stationId);
        }

        // 3. Lumipat sa monitor view
        handleTabChange('station_monitor');
    }
};

    // --- UNIT HANDLERS (KEPT AS IS) ---
    const handleMonitorStation = (stationId) => {
        setStationMonitorId(stationId);
        handleTabChange('station_monitor');
        setHighlightedUnitId(null);
    };
    const handleEditClick = (log) => { setSelectedUnitToEdit(log); };
    const handleViewReport = (report) => { setSelectedReportToView(report); };
    const handleViewHistory = (stationId) => {
        setStationHistoryId(stationId);
    };

    // --- ACTION HANDLERS (KEPT AS IS) ---
const handleApproveUnit = async (unitId, unitData) => {
    // Walang binawas sa fields, dinagdagan lang ng pagsiguro na buo ang unitData
    const dataToSend = { ...unitData, id: unitId, status: 'In Progress' };
    setIsProcessing(true); // START LOADING
    try {
        await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { 
            headers: { 'Content-Type': 'application/json' } 
        });
        setSuccessMessage("Unit successfully approved and set to In Progress.");
        setTimeout(() => setSuccessMessage(null), 4000); 
        fetchData();
    } catch (error) {
        console.error(`Error approving unit ${unitId}:`, error);
        alert(`Failed to approve unit: ${error.message}`);
    } finally {
        setIsProcessing(false); // STOP LOADING
    }
};

    const executeApproval = () => {
        if (selectedLogToApprove) {
            handleApproveUnit(selectedLogToApprove.id, selectedLogToApprove);
            setShowApproveModal(false);
            setSelectedLogToApprove(null);
        }
    };


const handleSaveEdit = async (id, updatedData) => {
    setSelectedUnitToEdit(null);
    
    // Hanapin ang current record sa local logs para makuha ang mga existing values
    const currentRecord = logs.find(l => l.id === id) || {};

    const dataToSend = {
        id: id,
        model: updatedData.model,
        revision: updatedData.revision,
        assembly_no: updatedData.assemblyNo || updatedData.assembly_no,
        status: updatedData.status,
        remarks: updatedData.remarks,
        station: updatedData.station,

        // 🔑 LOGIC: Gamitin ang updatedData (bago), 
        // kung null, gamitin ang currentRecord (mula sa DB/Logs), 
        // kung null pa rin, default to empty.
        device_serial_no: updatedData.deviceSerialNo || updatedData.device_serial_no || currentRecord.device_serial_no || null,
        accessory_kitting_no: updatedData.accessoryKittingNo || updatedData.accessory_kitting_no || currentRecord.accessory_kitting_no || null,
        base_unit_kitting_no: updatedData.baseUnitKittingNo || updatedData.base_unit_kitting_no || currentRecord.base_unit_kitting_no || null,

        // PCB serials
        mnbd_no: updatedData.mnbd_no || currentRecord.mnbd_board_no,
        cmbd_no: updatedData.cmbd_no || currentRecord.cmbd_board_no,
        lrbd_no: updatedData.lrbd_no || currentRecord.lrbd_board_no,
        pqbd_no: updatedData.pqbd_no || currentRecord.pqbd_board_no,
        bkbd_no: updatedData.bkbd_no || currentRecord.bkbd_board_no
    };

    setIsProcessing(true); 
    try {
        await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { 
            headers: { 'Content-Type': 'application/json' } 
        });
        setSuccessMessage(`Unit updated. Data preserved.`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchData(); 
    } catch (error) {
        alert("Save failed. Check console.");
    } finally {
        setIsProcessing(false); 
    }
};

// --- SHIPMENT DISPATCH HANDLER ---
const handleMarkAsShipped = async (unitId) => {
    const unitToShip = logs.find(l => l.id === unitId);
    if (!unitToShip) return;

    setIsProcessing(true);
    try {
        // PINALITAN: Nagdagdag ng station: 'N/A' sa payload
        const payload = { 
            ...unitToShip, 
            status: 'Dispatched', 
            station: 'N/A' 
        };
        
        await axios.post(`${UNITS_ENDPOINT}?method=PUT`, payload);
        
        setSuccessMessage(`Unit ${unitToShip.assembly_no} successfully Dispatched and cleared from Station.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        
        // I-refresh ang data para mawala na siya sa Station15 list
        fetchData(); 
    } catch (error) {
        console.error("Dispatch Error:", error);
        alert("Failed to authorize dispatch.");
    } finally {
        setIsProcessing(false);
    }
};

    // --- USER MANAGEMENT HANDLERS (KEPT AS IS) ---
    const handleAddUser = () => { setSelectedUserToManage(initialNewUserData); };
    const handleEditUser = (user) => { setSelectedUserToManage(user); };
    const handleConfirmDeleteUser = (user) => { setSelectedUserToDelete(user); };

    const handleViewUser = (user) => {
        setViewUser(user);
        setShowPasswordInModal(false);
        setShowViewModal(true);
    };

const handleSaveUser = async (payload, headers, urlQuery) => {
        if (!payload) throw new Error("Invalid user data received. Cannot save.");
        setIsProcessing(true); // START LOADING
        try {
            const response = await axios.post(USER_MANAGEMENT_ENDPOINT + urlQuery, payload, { headers });
            setSuccessMessage(`User successfully saved/updated: ${payload.full_name}.`);
            setTimeout(() => setSuccessMessage(null), 4000); 
            await fetchData();
        } catch (error) {
            console.error(`Error saving user:`, error);
            throw new Error(error.response?.data?.message || "Failed to save changes.");
        } finally {
            setIsProcessing(false); // STOP LOADING
        }
    };

 const handleDeleteUser = async (userId) => {
        setSelectedUserToDelete(null);
        setIsProcessing(true); // START LOADING
        try {
            await axios.post(`${USER_MANAGEMENT_ENDPOINT}?method=DELETE`, { id: userId }, { headers: { 'Content-Type': 'application/json' } });
            setSuccessMessage(`User ID ${userId} successfully deleted.`);
            setTimeout(() => setSuccessMessage(null), 4000); 
            fetchData();
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            alert(`Failed to delete user: ${error.message}`);
        } finally {
            setIsProcessing(false); // STOP LOADING
        }
    };

    // --- ANNOUNCEMENT HANDLERS (KEPT AS IS) ---
const handlePostAnnouncement = async (content) => {
        if (user.role !== 'Administrator') {
            throw new Error("Only Administrators can post announcements.");
        }
        const payload = {
            user_id: user.id,
            content: content,
        };
        setIsProcessing(true); // START LOADING
        try {
            await axios.post(ANNOUNCEMENTS_ENDPOINT, payload, { headers: { 'Content-Type': 'application/json' } });
            setSuccessMessage("Announcement successfully posted!");
            setTimeout(() => setSuccessMessage(null), 4000); 
            fetchData();
        } catch (error) {
            console.error("Error posting announcement:", error);
            throw new Error(error.response?.data?.message || "Failed to post announcement. Check console for API error.");
        } finally {
            setIsProcessing(false); // STOP LOADING
        }
    };

        const handleConfirmDelete = (announcement) => {
            // Ensure the user has permission (Admin or owner)
            if (user.role !== 'Administrator' && user.id !== announcement.user_id) {
                alert("You do not have permission to delete this announcement.");
                return;
            }

            // 💡 FIX 2: Set the entire object (or just the ID and user_id)
            // We will set the entire object, as the DeleteAnnouncementModal might use the content.
            setAnnouncementToDelete(announcement); // <-- Store the whole object
            setShowDeleteModal(true); 
        };
// --- ANNOUNCEMENT HANDLERS (UPDATED for 404 fix) ---

    const executeDeleteAnnouncement = async () => {
        if (!announcementToDelete || !announcementToDelete.id) return;
        
        const announcementId = announcementToDelete.id;
        const deleterUserId = user.id;

        setShowDeleteModal(false);
        setIsProcessing(true); // START LOADING

        try {
            const response = await axios.delete(ANNOUNCEMENTS_ENDPOINT, { 
                data: { 
                    id: announcementId,
                    user_id: deleterUserId
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // 💡 SUCCESS LOGIC
            setSuccessMessage(response.data.message || "Announcement deleted successfully.");
            setTimeout(() => setSuccessMessage(null), 4000); 
            fetchData();

        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert(`Failed to delete announcement: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsProcessing(false); // STOP LOADING
            setAnnouncementToDelete(null);
        }
    };

    // --- CALCULATE METRICS (KEPT AS IS) ---
    const calculateStationMetrics = (stationId, currentLogs = logs) => {
        const liveLogs = currentLogs.filter(l => l.status !== 'Pending Approval');

        // Flexible matching (Handles "Station 1" vs "Station1")
        const stationLogs = stationId
            ? liveLogs.filter(l => l.station.replace(/\s+/g, '').toLowerCase() === stationId.replace(/\s+/g, '').toLowerCase())
            : liveLogs;

        const pendingApprovalUnits = currentLogs.filter(l => l.status === 'Pending Approval').length;
        const completedUnits = stationLogs.filter(l => l.status === 'Completed').length;
        const ngUnits = stationLogs.filter(l => l.status === 'No Good (NG)').length;
        const totalUnitsForYield = completedUnits + ngUnits;
        const pendingUnits = stationLogs.filter(l => l.status === 'In Progress').length;

        const yieldRate = totalUnitsForYield > 0 ? (completedUnits / totalUnitsForYield) * 100 : 0;

        return {
            stationLogs,
            completedUnits,
            ngUnits,
            totalUnits: stationLogs.length,
            yieldTotal: totalUnitsForYield,
            pendingUnits,
            pendingApprovalUnits: stationId ? currentLogs.filter(l => l.station.replace(/\s+/g, '') === stationId.replace(/\s+/g, '') && l.status === 'Pending Approval').length : pendingApprovalUnits,
            yieldRate: yieldRate.toFixed(2),
        };
    };

    const overallMetrics = calculateStationMetrics(null, logs);

    // Filter reports (Flexible filtering)
    const filteredReports = dailyReportsList.filter(report => {
        const reportDbDate = report.report_date ? report.report_date.split(' ')[0] : null;
        // Normalize report station check
        const reportStationNorm = report.station.replace(/\s+/g, '').toLowerCase();
        const filterStationNorm = reportFilterStationId.replace(/\s+/g, '').toLowerCase();

        return (reportDbDate === reportDate) && (reportFilterStationId === 'All' || reportStationNorm === filterStationNorm);
    });

    const headerAvatarSrc = user.avatar_url ? `${AVATAR_UPLOAD_PATH}${user.avatar_url}` : DEFAULT_AVATAR_PATH;
    const headerFullName = user.full_name || user.username || 'Admin';

    // --- RENDER CONTENT (UPDATED to pass newReportsToday) ---
const renderContent = () => {
    // LALABAS LANG ITO SA PINAKA-UNANG LOAD (Initial mount)
    // Kapag empty ang database (logs.length === 0) pero tapos na ang loading, 
    // itutuloy na nito ang pag-render sa Dashboard sa halip na mag-spinner.
    if (loading && logs.length === 0) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
                <p className="mt-3 text-muted">Connecting to server...</p>
            </div>
        );
    }

    // Tanggalin ang error flickering kung may data na
    if (error && logs.length === 0) {
        return (<div className="alert alert-danger text-center py-5"><i className="bi bi-x-octagon-fill me-2"></i> {error}</div>);
    }

    switch (activeTab) {
        // ... (keep the rest of your cases exactly as they are)
            case "dashboard":
                return (
                    <Dashboard
                        logs={logs}
                        stations={stations}
                        calculateMetrics={calculateStationMetrics}
                        overallMetrics={overallMetrics}
                        setActiveTab={handleTabChange}
                        handleTabChange={handleTabChange}
                        dashboardView={dashboardView}
                        nextChart={nextChart}
                        prevChart={prevChart}
                        handleMonitorStation={handleMonitorStation}
                        newReportsToday={newReportsToday} // <-- NEW PROP: Passed the calculated count
                    />
                );

            case "stations":
            case "station_monitor":
            case "overall_history": 
                return (
                    <StationsOverview
                        activeTab={activeTab}
                        stations={stations}
                        calculateMetrics={calculateStationMetrics}
                        stationMonitorId={stationMonitorId}
                        setActiveTab={handleTabChange}
                        highlightedUnitId={highlightedUnitId}
                        handleTabChange={handleTabChange}
                        handleMonitorStation={handleMonitorStation}
                        handleViewHistory={handleViewHistory}
                        handleEditClick={handleEditClick}
                        fetchData={fetchData}
                        allLogs={unitHistoryLogs} 
                        liveUnitLogs={logs} // Pass current logs for model name lookup
                        dynamicDelayThresholds={dynamicDelayThresholds} // Pass dynamic thresholds
                        onTargetTimeManagement={handleTargetTimeManagement} // Pass handler for target time management
                    />
                );

            case "reports":
                return (
                    <ReportsView
                        filteredReports={filteredReports}
                        stations={stations}
                        reportDate={reportDate}
                        setReportDate={setReportDate}
                        reportFilterStationId={reportFilterStationId}
                        setReportFilterStationId={setReportFilterStationId}
                        setShowReportModal={setShowReportModal}
                        handleViewReport={handleViewReport}
                        getTodayDate={getTodayDate}
                    />
                );

case "announcements":
                return (
                    <AnnouncementsView
                        user={user}
                        announcements={announcements}
                        filterStartDate={filterStartDate}
                        setFilterStartDate={setFilterStartDate}
                        filterEndDate={filterEndDate}
                        setFilterEndDate={setFilterEndDate}
                        getTodayDate={getTodayDate}
                        setShowPostModal={setShowPostModal}
                        
                        // NOTE: This handler (handleConfirmDelete) must be updated 
                        // in AdminPage.jsx to accept the full announcement object.
                        handleConfirmDelete={handleConfirmDelete} 
                        
                        // NOTE: These props were removed from AnnouncementsView because the modal
                        // is rendered globally in AdminPage.jsx. You should ensure 
                        // the AnnouncementsView component does *not* try to receive them 
                        // if you don't intend to pass them.

                        AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                        DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                    />
                );
                case "inventory":
    return (
        <InventoryView pcbaLogs={inventoryList} />
    );

            case "approval":
                return (
                    <ApprovalQueue
                        logs={logs}
                        setSelectedLogToApprove={setSelectedLogToApprove}
                        setShowApproveModal={setShowApproveModal}
                        showApproveModal={showApproveModal}
                        selectedLogToApprove={selectedLogToApprove}
                        executeApproval={executeApproval}
                    />
                );

            case "manage_account":
                return (
                    <UserManagement
                        user={user}
                        userList={userList}
                        AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                        DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                        handleAddUser={handleAddUser}
                        handleViewUser={handleViewUser}
                        handleConfirmDeleteUser={handleConfirmDeleteUser}
                        showViewModal={showViewModal}
                        viewUser={viewUser}
                        setShowViewModal={setShowViewModal}
                        handleEditUser={handleEditUser}
                    />
                );


            case "notifications":
                return (
                    <NotificationContent
                        notifications={notifications}
                        onDismissAll={() => { handleDismissAllNotifications(); handleTabChange('dashboard'); }}
                        onClearReports={handleClearNewReports}
                        onClearDelayed={handleClearDelayedUnits}
                        onNotificationClick={(n) => { handleNotificationClick(n); }}
                    />
                );


            case "no_good_list":
                return (
                    <NoGoodUnits
                        logs={logs} // Pass the main logs data
                        userList={userList}
                        handleEditClick={handleEditClick} // Pass the edit handler for potential rework/update
                    />
                );
            
case "shipment":
    return (
        <Shipment 
            liveUnitLogs={logs} 
            onMarkAsShipped={handleMarkAsShipped} // <--- Siguraduhin na naipasa ito
        />
    );

            default:
                return (<div className="alert alert-info text-center"><i className="bi bi-info-circle-fill me-2"></i>The module **{activeTab}** is under development.</div>);
        }
    };

    // Assume isSidebarOpen and setIsSidebarOpen are no longer needed/used for toggling
// isSidebarOpen is now effectively and permanently TRUE
// Note: If 'isSidebarOpen' is still used in other places like rendering elements inside the sidebar, 
// you may need to ensure it is set to 'true' or simply remove the conditional rendering if not needed.

return (
    // Tinanggal ang overflow-hidden sa root container, baka maging sanhi ng scrolling issue sa fixed elements
    <div className="d-flex min-vh-100 bg-light"> 

{/* --- SIDEBAR (FIXED WIDTH: 260px) --- */}
{/* --- SIDEBAR (FIXED WIDTH: 260px) --- */}
<div
    className="d-flex flex-column flex-shrink-0 p-3 text-white position-fixed"
    style={{
        width: "260px",
        backgroundColor: "#0f172a", 
        height: "100vh",
        zIndex: 1000,
        top: 0,
        left: 0,
        borderRight: "1px solid rgba(255,255,255,0.05)"
    }}
>
    {/* COMPACT PROFILE SECTION */}
    <div className="d-flex align-items-center mb-3 mt-1 px-1">
        <div className="position-relative flex-shrink-0">
            <img
                src={headerAvatarSrc}
                alt="User Avatar"
                className="rounded-circle"
                style={{ 
                    width: '42px', 
                    height: '42px', 
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
            />
        </div>
        <div className="ms-3 overflow-hidden">
            <div 
                className="text-white text-truncate" 
                style={{ fontSize: '0.85rem', fontWeight: '400' }}
            >
                {headerFullName}
            </div>
            <div 
                style={{ 
                    fontSize: '0.7rem', 
                    color: '#94a3b8', 
                    marginTop: '1px',
                    letterSpacing: '0.3px'
                }}
            >
                Administrator
            </div> 
        </div>
    </div>

    <hr className="border-secondary opacity-25 mt-2" />

    {/* MENU SECTION */}
    <ul className="nav nav-pills flex-column mb-auto gap-1">
        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${activeTab === "dashboard" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("dashboard")}
            >
                <i className="bi bi-grid-1x2"></i>
                <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Dashboard</span>
            </button>
        </li>

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${(activeTab === "stations" || activeTab === "station_monitor" || activeTab === "overall_history") ? "active-glass" : ""}`}
                onClick={() => handleTabChange("stations")}
            >
                <i className="bi bi-grid-3x3-gap"></i>
                <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Stations</span>
            </button>
        </li>

        <hr className="border-secondary my-2 opacity-25" />

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center justify-content-between py-2 px-3 sidebar-btn ${activeTab === "approval" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("approval")}
            >
                <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-check-circle"></i>
                    <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Approvals</span>
                </div>
                {logs.filter(l => l.status === 'Pending Approval').length > 0 && (
                    <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.7rem', minWidth: '20px' }}>
                        {logs.filter(l => l.status === 'Pending Approval').length}
                    </span>
                )}
            </button>
        </li>

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center justify-content-between py-2 px-3 sidebar-btn ${activeTab === "no_good_list" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("no_good_list")}
            >
                <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-x-octagon"></i>
                    <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>No Good List</span>
                </div>
                {noGoodCount > 0 && (
                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                        {noGoodCount}
                    </span>
                )}
            </button>
        </li>

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center justify-content-between py-2 px-3 sidebar-btn ${activeTab === "shipment" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("shipment")}
            >
                <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-truck-flatbed"></i>
                    <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Shipment</span>
                </div>
                {shipmentCount > 0 && (
                    <span className="badge bg-success rounded-pill" style={{ fontSize: '0.65rem' }}>
                        {shipmentCount}
                    </span>
                )}
            </button>
        </li>
        
        <li className="nav-item">
    <button
        className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${activeTab === "inventory" ? "active-glass" : ""}`}
        onClick={() => handleTabChange("inventory")}
    >
        <i className="bi bi-box-seam"></i>
        <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Inventory</span>
    </button>
</li>

        <hr className="border-secondary my-2 opacity-25" />

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${activeTab === "reports" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("reports")}
            >
                <i className="bi bi-file-text"></i>
                <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Reports</span>
            </button>
        </li>

        


        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${activeTab === "announcements" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("announcements")}
            >
                <i className="bi bi-megaphone"></i>
                <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Announcements</span>
            </button>
        </li>

        <li className="nav-item">
            <button
                className={`nav-link text-white w-100 d-flex align-items-center gap-3 py-2 px-3 sidebar-btn ${activeTab === "manage_account" ? "active-glass" : ""}`}
                onClick={() => handleTabChange("manage_account")}
            >
                <i className="bi bi-person-gear"></i>
                <span style={{ fontSize: '0.85rem', fontWeight: '400' }}>Manage Account</span>
            </button>
        </li>
    </ul>

    {/* BOTTOM SECTION */}
    <div className="mt-auto">
        <button 
            className="btn text-white-50 btn-sm w-100 logout-btn d-flex align-items-center justify-content-center gap-2 py-2" 
            onClick={onLogout}
            style={{ fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}
        >
            <i className="bi bi-box-arrow-left"></i>
            Logout
        </button>
        <div className="text-center text-white-50 small pt-3 mt-2 border-top border-secondary opacity-25" style={{ fontSize: '0.65rem' }}>
            <span>©2025 MKFF Laser Technique</span>
        </div>
    </div>

    <style>{`
        .active-glass {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            color: white !important;
        }

        .sidebar-btn {
            border: 1px solid transparent;
            background: transparent;
            transition: all 0.2s ease;
            color: #94a3b8 !important;
            border-radius: 8px;
        }

        .sidebar-btn:hover:not(.active-glass) {
            background-color: rgba(255, 255, 255, 0.03) !important;
            color: white !important;
        }

        .active-glass i, .active-glass span {
            color: white !important;
        }

        .logout-btn:hover {
            background-color: rgba(239, 68, 68, 0.1) !important;
            color: #ef4444 !important;
            border-color: rgba(239, 68, 68, 0.2) !important;
        }
    `}</style>
</div>

{/* --- MAIN CONTENT CONTAINER --- */}
<div
    className="flex-grow-1 d-flex flex-column"
    style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        left: "260px", 
        overflowX: 'hidden',
        backgroundColor: '#EEEEEE',
        zIndex: 999,
    }}
>
    {/* --- HEADER --- */}
{/* --- PINATABA NA HEADER (80px height) --- */}
    <header 
        className="bg-white d-flex justify-content-between align-items-center px-5"
        style={{ 
            flexShrink: 0, 
            position: 'sticky', 
            top: 0, 
            zIndex: 10,
            height: '80px', // Pinataba mula 60px
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', // Mas ramdam na shadow
            borderBottom: '1px solid #e5e7eb'
        }} 
    >
        <div className="d-flex align-items-center">
            <div className="d-flex flex-column">
                <span className="text-danger fw-bold mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    Management System
                </span>
                <h4 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                    {activeTab === 'station_monitor' 
                        ? `${stations.find(s => s.id === stationMonitorId)?.name || 'Monitor'} Details` 
                        : activeTab.replace(/_/g, ' ').toUpperCase()}
                </h4>
            </div>
        </div>
        
<div className="d-flex align-items-center">
            <div className="header-icon-wrapper">
                <NotificationBell notifications={notifications} onClick={handleBellClick} />
            </div>
        </div>

    </header>



            {/* 2. CONTENT AREA (Scrollable Part) */}
            <div 
                className="container-fluid px-4 pt-4 pb-5 flex-grow-1"
                style={{ overflowY: 'auto' }} 
            >
                {renderContent()}
            </div>
        </div>
        
        {/* ======================================================= */}
        {/* === START: GLOBAL MESSAGING AND LOADING OVERLAYS (NEW) == */}
        {/* ======================================================= */}
        
        {/* Global Success Banner */}
        {successMessage && (
            <div 
                className="alert alert-success alert-dismissible fade show fixed-top mt-3 mx-auto"
                role="alert"
                style={{ width: 'auto', maxWidth: '400px', zIndex: 1050, transform: 'translateY(10px)' }}
            >
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMessage}
                <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} aria-label="Close"></button>
            </div>
        )}

        {/* Global Processing/Loading Overlay */}
        {isProcessing && (
            <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <div className="text-center">
                    <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Processing...</span>
                    </div>
                    <p className="text-danger fw-bold mt-2">Processing Request...</p>
                </div>
            </div>
        )}
        
        {/* ======================================================= */}
        {/* === END: GLOBAL MESSAGING AND LOADING OVERLAYS ========== */}
        {/* ======================================================= */}

        {/* --- GLOBAL MODAL RENDERING (KEPT AS IS) --- */}
        {selectedUnitToEdit && (<EditUnitModal unit={selectedUnitToEdit} onClose={() => setSelectedUnitToEdit(null)} onSave={handleSaveEdit} />)}
        {selectedReportToView && (<ReportDetailModal report={selectedReportToView} onClose={() => setSelectedReportToView(null)} API_BASE_URL={API_BASE_URL} />)}
        {showReportModal && (<SubmitReportModal user={user} stations={stations} onClose={() => setShowReportModal(false)} onSave={refreshAndCloseReport} REPORTS_ENDPOINT={REPORTS_ENDPOINT} />)}
        {stationHistoryId && (<StationHistoryModal stationId={stationHistoryId} onClose={() => setStationHistoryId(null)} HISTORY_ENDPOINT={HISTORY_ENDPOINT} />)}
        {selectedUserToManage && (<ManageUserModal userToEdit={selectedUserToManage.id ? selectedUserToManage : initialNewUserData} stations={stations} onClose={() => setSelectedUserToManage(null)} onSave={handleSaveUser} AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH} DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH} />)}
        {selectedUserToDelete && (<DeleteUserModal user={selectedUserToDelete} onClose={() => setSelectedUserToDelete(null)} onDelete={handleDeleteUser} />)}
        {showPostModal && (
            <AnnouncementModal
                user={user}
                onClose={() => setShowPostModal(false)}
                onPost={handlePostAnnouncement}
                API_BASE_URL={API_BASE_URL}
                DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
            />
        )}
        
        {showDeleteModal && (
            <DeleteAnnouncementModal
                announcementToDelete={announcementToDelete}
                onClose={() => setShowDeleteModal(false)}
                executeDelete={executeDeleteAnnouncement}
            />
        )}
        {/* The Approval Modal must also be rendered here if the `ApprovalQueue` is not rendered/used */}
        {showApproveModal && selectedLogToApprove && (
            <ApproveUnitModal
                selectedLogToApprove={selectedLogToApprove}
                onClose={() => setShowApproveModal(false)}
                onApprove={executeApproval}
            />
        )}
        
        {/* Target Time Management Modal */}
        {showTargetTimeModal && (
            <TargetTimeModal
                onClose={() => setShowTargetTimeModal(false)}
                onSave={handleSaveTargetTimes}
                API_BASE_URL={API_BASE_URL}
            />
        )}
    </div>
)};