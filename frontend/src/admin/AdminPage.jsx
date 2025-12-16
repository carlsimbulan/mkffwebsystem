import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. CHART IMPORTS & REGISTRATION (Keep for global chart setup)
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import logo from '../logo.png';

// 2. IMPORT SEPARATED COMPONENTS (Updated List)
// Existing Modals and Utilities
import { EditUnitModal } from './components/EditUnitModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ManageUserModal } from './components/ManageUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { SubmitReportModal } from './components/SubmitReportModal';
import { StationHistoryModal } from './components/StationHistoryModal';
import { NotificationBell } from './components/NotificationBell';
import { NotificationContent } from './components/NotificationContent';
import { ViewUserModal } from './components/ViewUserModal';
import { AnnouncementModal } from './components/AnnouncementModal';
// NEW VIEW COMPONENTS
import { Dashboard } from './components/Dashboard';
import { StationsOverview } from './components/StationsOverview';
import { ReportsView } from './components/ReportsView';
import { AnnouncementsView } from './components/AnnouncementsView'; 
import { ApprovalQueue } from './components/ApprovalQueue';
import { UserManagement } from './components/UserManagement';
// NEW EMBEDDED MODALS
import { ApproveUnitModal } from './components/ApproveUnitModal';
import { DeleteAnnouncementModal } from './components/DeleteAnnouncementModal';

import { Shipment } from './components/Shipment';

import NoGoodUnits from './components/NoGoodUnits';

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
    'Station8': 0, 'Station 8': 0,
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

// --- LOCAL PATHS ---
const AVATAR_UPLOAD_PATH = `${API_BASE_URL}/uploads/avatars/`;
const DEFAULT_AVATAR_PATH = `${API_BASE_URL}/uploads/avatars/default_avatar.png`;

// Helper function to format date as YYYY-MM-DD
const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

export default function AdminPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  
    const [successMessage, setSuccessMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

    // --- CHECK DELAYED UNITS AND REPORTS (KEPT AS IS) ---
    const checkDelayedUnitsAndReports = useCallback((allUnits) => {
    // TANGGALIN ang allReports dependency at parameter.
    const now = new Date();
    const newDelayedNotifications = [];
    const currentDelayedUnitIds = new Set();

    // 1. Delayed Units Check (NO CHANGE)
    const inProgressUnits = allUnits.filter(l => l.status === 'In Progress');

    inProgressUnits.forEach(unit => {
        const stationId = unit.station;
        // Flexible check for threshold
        const thresholdMinutes = DELAY_THRESHOLDS_MINUTES[stationId] || DELAY_THRESHOLDS_MINUTES[stationId.replace(' ', '')] || 0;

        if (thresholdMinutes > 0) {
            const createdAt = new Date(unit.created_at);
            const elapsedMilliseconds = now.getTime() - createdAt.getTime();
            const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));

            if (elapsedMinutes > thresholdMinutes) {
                currentDelayedUnitIds.add(unit.id);
                newDelayedNotifications.push({
                    id: `delayed-${unit.id}`,
                    type: 'DelayedUnit',
                    title: `⚠️ Unit Delay Alert at ${stationId}`,
                    message: `Unit ${unit.device_serial_no} has been In Progress for ${elapsedMinutes} mins (Limit: ${thresholdMinutes} mins).`,
                    timestamp: now.toISOString(),
                    unitId: unit.id,
                    stationId: stationId,
                });
            }
        }
    });

    

        // 3. Merge Notifications
       const existingDelayedNotifications = notifications.filter(n => {
        // Tanging DelayedUnit notifications lang ang i-check
        return n.type === 'DelayedUnit' && currentDelayedUnitIds.has(n.unitId);
    });

    const updatedDelayedNotifications = newDelayedNotifications.filter(newN =>
        !existingDelayedNotifications.some(existingN => existingN.id === newN.id)
    );
    
    // Ang final notifications array ay naglalaman lang ng Delayed Units
    setNotifications([
        ...existingDelayedNotifications,
        ...updatedDelayedNotifications,
    ]);

    // TANGGALIN: lastSeenReportIds logic ay hindi na kailangan
    // TANGGALIN: setLastSeenReportIds logic ay hindi na kailangan

// TANGGALIN: Ang 'lastSeenReportIds' mula sa dependency array
}, [notifications]);


    // --- FETCH DATA (UPDATED TO INCLUDE HISTORY LOGS AND NEW REPORT COUNT) ---
    const fetchData = async () => {
        const isBackgroundUpdate = logs.length > 0;

        if (!isBackgroundUpdate) {
            setLoading(true);
        }

        setError(null);
        try {
            // 1. Fetch Units/Logs (Current State)
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            const fetchedUnits = unitsRes.data;
            if (JSON.stringify(fetchedUnits) !== JSON.stringify(logs)) {
                setLogs(fetchedUnits);
            }

            // 1.5 Fetch Unit History Logs (The full trail)
            const historyRes = await axios.get(HISTORY_ENDPOINT);
            // Ensure we handle different possible API response structures
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

            // --- NEW: Calculate New Reports Today ---
            const today = getTodayDate();
            const reportsToday = fetchedReports.filter(report => {
                const reportDatePart = report.report_date ? report.report_date.split(' ')[0] : null;
                return reportDatePart === today;
            }).length;
            setNewReportsToday(reportsToday);
            // ---------------------------------------

            // 3. Fetch User List
            const usersRes = await axios.get(USER_MANAGEMENT_ENDPOINT);
            const fetchedUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
            if (JSON.stringify(usersRes.data) !== JSON.stringify(userList)) {
                setUserList(fetchedUsers);
            }

            const loggedInUserData = fetchedUsers.find(u => u.id === user.id);
            if (loggedInUserData) {
                user.full_name = loggedInUserData.full_name;
                user.avatar_url = loggedInUserData.avatar_url;
            }

            // --- Fetch Announcements ---
            const announcementsRes = await axios.get(ANNOUNCEMENTS_ENDPOINT);
            const fetchedAnnouncements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
            if (JSON.stringify(fetchedAnnouncements) !== JSON.stringify(announcements)) {
                setAnnouncements(fetchedAnnouncements);
            }

            // 4. Mock Station Data - FIXED: ID matches DB (No space), Name has space (UI)
            const mockStations = Array.from({ length: 15 }, (_, i) => ({
                id: `Station${i + 1}`, // NO SPACE: Matches Database "Station1"
                name: `Station ${i + 1}`, // WITH SPACE: For Display "Station 1"
                operator: `Operator-${100 + i}`
            }));
            setStations(mockStations);

            // 5. Run Notification Logic
            checkDelayedUnitsAndReports(fetchedUnits, fetchedReports);

        } catch (err) {
            console.error("Error fetching data:", err);
            if (!isBackgroundUpdate) {
                // setError(`Failed to fetch data. ${err.message}`);
            }
        } finally {
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
        return () => clearInterval(interval);
    }, [checkDelayedUnitsAndReports]); // Added checkDelayedUnitsAndReports to dependency array to satisfy ESLint, though the polling interval keeps it running.

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
    const handleBellClick = () => { setActiveTab('notifications'); };
    const handleDismissAllNotifications = () => { setNotifications([]); setActiveTab('dashboard'); };
    const handleClearNewReports = () => { setNotifications(prev => prev.filter(n => n.type !== 'NewReport')); };
    const handleClearDelayedUnits = () => { setNotifications(prev => prev.filter(n => n.type !== 'DelayedUnit')); };

    const handleNotificationClick = (notification) => {
        if (notification.type === 'NewReport') {
            setHighlightedUnitId(null);
            setActiveTab('reports');
            const report = dailyReportsList.find(r => r.id === notification.reportId);
            if (report) {
                setReportDate(report.report_date.split(' ')[0]);
                setReportFilterStationId(report.station); 
                setSelectedReportToView(report);
            }
        } else if (notification.type === 'DelayedUnit') {
            setActiveTab('station_monitor');
            // Normalize station ID match for notification click
            const targetStation = stations.find(s => s.id.replace(/\s/g, '') === notification.stationId.replace(/\s/g, ''));
            if (targetStation) {
                setStationMonitorId(targetStation.id);
            }
            setHighlightedUnitId(notification.unitId);
        }
        if (notification.type === 'NewReport') {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }
    };

    // --- UNIT HANDLERS (KEPT AS IS) ---
    const handleMonitorStation = (stationId) => {
        setStationMonitorId(stationId);
        setActiveTab('station_monitor');
        setHighlightedUnitId(null);
    };
    const handleEditClick = (log) => { setSelectedUnitToEdit(log); };
    const handleViewReport = (report) => { setSelectedReportToView(report); };
    const handleViewHistory = (stationId) => {
        setStationHistoryId(stationId);
    };

    // --- ACTION HANDLERS (KEPT AS IS) ---
const handleApproveUnit = async (unitId, unitData) => {
        const dataToSend = { ...unitData, id: unitId, status: 'In Progress' };
        setIsProcessing(true); // START LOADING
        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { headers: { 'Content-Type': 'application/json' } });
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
        const dataToSend = {
            // ... dataToSend payload ...
            id: id,
            model: updatedData.model,
            revision: updatedData.revision,
            base_unit_kitting_no: updatedData.base_unit_kitting_no,
            assembly_no: updatedData.assembly_no,
            device_serial_no: updatedData.device_serial_no,
            accessory_kitting_no: updatedData.accessory_kitting_no,
            status: updatedData.status,
            remarks: updatedData.remarks,
            station: updatedData.station,
        };
        setIsProcessing(true); // START LOADING
        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { headers: { 'Content-Type': 'application/json' } });
            setSuccessMessage(`Unit ${id} successfully updated.`);
            setTimeout(() => setSuccessMessage(null), 4000); 
        } catch (error) {
            console.error(`Error saving unit ${id}:`, error);
            alert(`Failed to save unit: ${error.message}`);
        } finally {
            fetchData(); // This refreshes the logs
            setIsProcessing(false); // STOP LOADING
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
        if (loading && logs.length === 0) {
            return (<div className="text-center py-5"><div className="spinner-border text-danger" role="status"></div><p className="mt-3 text-muted">Loading real-time production data...</p></div>);
        }
        if (error) {
            return (<div className="alert alert-danger text-center py-5"><i className="bi bi-x-octagon-fill me-2"></i> {error}</div>);
        }

        switch (activeTab) {
            case "dashboard":
                return (
                    <Dashboard
                        logs={logs}
                        stations={stations}
                        calculateMetrics={calculateStationMetrics}
                        overallMetrics={overallMetrics}
                        setActiveTab={setActiveTab}
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
                        highlightedUnitId={highlightedUnitId}
                        setActiveTab={setActiveTab}
                        handleMonitorStation={handleMonitorStation}
                        handleViewHistory={handleViewHistory}
                        handleEditClick={handleEditClick}
                        fetchData={fetchData}
                        allLogs={unitHistoryLogs} 
                        liveUnitLogs={logs} // Pass current logs for model name lookup
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
                        onDismissAll={() => { handleDismissAllNotifications(); setActiveTab('dashboard'); }}
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
            
                case "shipment": // <<< NEW CASE
                return (
                    <Shipment 
                        liveUnitLogs={logs} // Pass the main unit logs
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

        {/* --- SIDEBAR (GINAWANG FIXED WIDTH: 260px) --- */}
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white position-fixed"
            style={{
                // 💡 BINAGO: Fixed width, inalis ang isSidebarOpen condition at transition
                width: "260px", 
                backgroundColor: "#111827",
                height: "100vh",
                zIndex: 1000,
                top: 0,
                left: 0
            }}
        >

            {/* TOP LOGO */}
            {/* 💡 BINAGO: Inalis ang conditional rendering ({isSidebarOpen && ...}) at inalis ang className={isSidebarOpen ? "me-3" : ""} */}
            <div className="d-flex align-items-center mb-3 text-white overflow-hidden">
                <img
                    src={logo}
                    alt="MKFF Admin Logo"
                    style={{ height: "3rem" }}
                    className="me-3" // Laging may margin dahil laging bukas
                />
                <span className="fs-5 fw-bold">MKFF Admin</span> {/* Laging visible */}
            </div>

            <hr className="border-secondary" />

            {/* MENU: Naka-ayos at pinaganda ang pagkakasunod-sunod */}
            <ul className="nav nav-pills flex-column mb-3">
                {/* 1. Dashboard (Overview) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "dashboard" ? "active bg-danger" : ""
                            }`}
                        onClick={() => {
                            setActiveTab("dashboard");
                            setStationMonitorId(null);
                            setReportFilterStationId("All");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-speedometer2"></i>
                        Dashboard {/* Laging visible */}
                    </button>
                </li>

                {/* 2. Stations (Live Monitoring) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${
                            (activeTab === "stations" || activeTab === "station_monitor" || activeTab === "overall_history") ? "active bg-danger" : "" 
                            }`}
                        onClick={() => {
                            setActiveTab("stations");
                            setStationMonitorId(null);
                            setReportFilterStationId("All");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-grid-3x3-gap"></i>
                        Stations {/* Laging visible */}
                    </button>
                </li>



                <hr className="border-secondary my-2" /> {/* Separator para sa Workflow/Management */}

                {/* 5. Approvals (Workflow) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "approval" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("approval");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-check-circle"></i>
                        Approvals {/* Laging visible */}
                    </button>
                </li>

                {/* 6. No Good List (Quality/Rework) */}
                <li> 
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "no_good_list" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("no_good_list");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-x-octagon-fill"></i>
                        No Good List {/* Laging visible */}
                    </button>
                </li>

                                {/* 3. Shipment (Operational Output) */}
                <li> 
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "shipment" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("shipment");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                            setReportFilterStationId("All");
                        }}
                    >
                        <i className="bi bi-truck-flatbed"></i>
                        Shipment {/* Laging visible */}
                    </button>
                </li>
                
                <hr className="border-secondary my-2" /> {/* Separator para sa System/User */}

                {/* 4. Reports (Historical Data) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "reports" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("reports");
                            setStationMonitorId(null);
                            setReportFilterStationId("All");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-file-text"></i>
                        Reports {/* Laging visible */}
                    </button>
                </li>

                {/* 7. Announcement Board (Communication) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "announcements" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("announcements");
                            setStationMonitorId(null);
                            setReportFilterStationId("All");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-megaphone-fill"></i>
                        Announcement Board {/* Laging visible */}
                    </button>
                </li>
                    

                {/* 8. Manage Account (System Management) */}
                <li>
                    <button
                        className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "manage_account" ? "active bg-danger"
                            : ""
                            }`}
                        onClick={() => {
                            setActiveTab("manage_account");
                            setStationHistoryId(null);
                            setHighlightedUnitId(null);
                        }}
                    >
                        <i className="bi bi-person-gear"></i>
                        Manage Account {/* Laging visible */}
                    </button>
                </li>


{/* --- SIDEBAR MENU END --- */}

                {/* ------------------------------------- */}
            </ul>

            {/* PUSH COPYRIGHT + LOGOUT TO BOTTOM */}
            <div className="mt-auto">
                {/* LOGOUT BUTTON */}
                <button
                    className="btn btn-outline-light w-100"
                    onClick={onLogout}
                >
                    <i className="bi bi-box-arrow-left me-2"></i>
                    Logout {/* Laging visible */}
                </button>

                {/* COPYRIGHT TEXT (Now Below Logout with Separator) */}
                <div className="text-center text-white-50 small pt-2 mt-2 border-top border-secondary">
                    <small>©2025 MKFF Laser Technique</small> {/* Laging visible */}
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT CONTAINER (UPDATED FOR FIXED SIDEBAR) --- */}
        <div
            className="flex-grow-1 d-flex flex-column"
            style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                right: 0,
                // 💡 BINAGO: Fixed left margin, inalis ang isSidebarOpen condition at transition
                left: "260px", 
                overflowX: 'hidden',
                backgroundColor: '#eeeeeeff',
                zIndex: 999,
            }}
        >
            {/* 1. HEADER (Fixed/Sticky at the Top) */}
            <header 
                className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center"
                style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }} 
            >
                <div className="d-flex align-items-center">
                    {/* ❌ TINANGGAL: Sidebar Toggle Button */}
                    <h5 className="mb-0 fw-bold text-dark text-uppercase" style={{ fontSize: '1rem' }}>
                        {activeTab === 'station_monitor' ? `${stations.find(s => s.id === stationMonitorId)?.name || 'Monitor'} Details` : activeTab.replace(/_/g, ' ')}
                    </h5>
                </div>
                
                {/* --- RIGHT SIDE: NOTIFICATIONS & USER PROFILE --- */}
                <div className="d-flex align-items-center gap-3">
                    
                    {/* Notification Bell */}
                    <NotificationBell notifications={notifications} onClick={handleBellClick} />
                    
                    {/* User Info and Avatar (Professional Look) */}
                    <div className="d-flex align-items-center">
                        
                        {/* Text Info */}
                        <div className="text-end me-3 d-none d-md-block">
                            {/* Use text-dark for full name */}
                            <div className="fw-bold text-dark" style={{ lineHeight: 1.2 }}>{headerFullName}</div>
                            {/* Highlight Admin role */}
                            <div className="fw-medium text-danger small" style={{ fontSize: '0.75rem' }}>ADMINISTRATOR</div> 
                        </div>
                        
                        {/* Avatar (Increased size to 45px) */}
                        <img
                            src={headerAvatarSrc}
                            alt="User Avatar"
                            // 💡 BINAGO: Inalis ang 'border-danger' at pinalitan ng 'border-secondary'
                            className="rounded-circle border border-secondary" 
                            style={{ 
                                width: '45px', 
                                height: '45px', 
                                objectFit: 'cover' 
                            }}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                        />
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
    </div>
)};