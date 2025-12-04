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
import { AnnouncementsView } from './components/AnnouncementsView'; // Assuming this is the old 'case "announcements"'
import { ApprovalQueue } from './components/ApprovalQueue';
import { UserManagement } from './components/UserManagement';
// NEW EMBEDDED MODALS
import { ApproveUnitModal } from './components/ApproveUnitModal';
import { DeleteAnnouncementModal } from './components/DeleteAnnouncementModal';


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
    const [logs, setLogs] = useState([]); // Unit logs
    const [dailyReportsList, setDailyReportsList] = useState([]); // Reports
    const [userList, setUserList] = useState([]); // User list
    const [stations, setStations] = useState([]); // State for station list
    const [stationMonitorId, setStationMonitorId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // FOR ANNOUNCEMENT DELETE
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [posterIdOfAnnouncement, setPosterIdOfAnnouncement] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
    const [lastSeenReportIds, setLastSeenReportIds] = useState(new Set());
    const [highlightedUnitId, setHighlightedUnitId] = useState(null);

    const [announcements, setAnnouncements] = useState([]); // Announcements/Forum data
    const [showPostModal, setShowPostModal] = useState(false); // For Admin to post

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [showPasswordInModal, setShowPasswordInModal] = useState(false); // (Unused but kept in original)

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
    const checkDelayedUnitsAndReports = useCallback((allUnits, allReports) => {
        const now = new Date();
        const newDelayedNotifications = [];
        const currentDelayedUnitIds = new Set();

        // 1. Delayed Units Check
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

        // 2. New Reports Check
        const allFetchedReportIds = new Set(allReports.map(r => r.id));
        const newReportNotifications = [];

        allReports.forEach(report => {
            if (!lastSeenReportIds.has(report.id)) {
                newReportNotifications.push({
                    id: `report-${report.id}`,
                    type: 'NewReport',
                    title: `📄 New Report from ${report.station} (${report.shift})`,
                    message: `Processed: ${report.total_units_processed}, NG: ${report.total_ng}. Submitted by: ${report.submitted_by}.`,
                    timestamp: new Date(report.created_at).toISOString(),
                    reportId: report.id,
                });
            }
        });

        // 3. Merge Notifications
        const existingNotifications = notifications.filter(n => {
            if (n.type === 'DelayedUnit') {
                return currentDelayedUnitIds.has(n.unitId);
            }
            return n.type === 'NewReport';
        });

        const updatedDelayedNotifications = newDelayedNotifications.filter(newN =>
            !existingNotifications.some(existingN => existingN.id === newN.id)
        );

        setNotifications([
            ...existingNotifications.filter(n => n.type === 'DelayedUnit'),
            ...updatedDelayedNotifications,
            ...existingNotifications.filter(n => n.type === 'NewReport'),
            ...newReportNotifications,
        ]);

        setLastSeenReportIds(allFetchedReportIds);

    }, [notifications, lastSeenReportIds]);


    // --- FETCH DATA (KEPT AS IS) ---
    const fetchData = async () => {
        const isBackgroundUpdate = logs.length > 0;

        if (!isBackgroundUpdate) {
            setLoading(true);
        }

        setError(null);
        try {
            // 1. Fetch Units/Logs
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            const fetchedUnits = unitsRes.data;
            if (JSON.stringify(fetchedUnits) !== JSON.stringify(logs)) {
                setLogs(fetchedUnits);
            }

            // 2. Fetch Daily Reports
            const reportsRes = await axios.get(REPORTS_ENDPOINT);
            const fetchedReports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
            if (JSON.stringify(fetchedReports) !== JSON.stringify(dailyReportsList)) {
                setDailyReportsList(fetchedReports);
            }

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
        setLastSeenReportIds(new Set());
        fetchData();
        setShowReportModal(false);
    };

    // UseEffect for Polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

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
                setReportFilterStationId(report.station); // Check if this needs normalization
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

    // --- ACTION HANDLERS ---
    const handleApproveUnit = async (unitId, unitData) => {
        const dataToSend = { ...unitData, id: unitId, status: 'In Progress' };
        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { headers: { 'Content-Type': 'application/json' } });
            fetchData();
        } catch (error) {
            console.error(`Error approving unit ${unitId}:`, error);
        }
    };

    // Wrapper function to execute approval for the modal
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
        try {
            await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, { headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error(`Error saving unit ${id}:`, error);
        } finally {
            fetchData(); // This refreshes the logs
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
        try {
            await axios.post(USER_MANAGEMENT_ENDPOINT + urlQuery, payload, { headers });
            await fetchData();
        } catch (error) {
            console.error(`Error saving user:`, error);
            throw new Error(error.response?.data?.message || "Failed to save changes.");
        }
    };

    const handleDeleteUser = async (userId) => {
        setSelectedUserToDelete(null);
        try {
            await axios.post(`${USER_MANAGEMENT_ENDPOINT}?method=DELETE`, { id: userId }, { headers: { 'Content-Type': 'application/json' } });
            fetchData();
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
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
        try {
            await axios.post(ANNOUNCEMENTS_ENDPOINT, payload, { headers: { 'Content-Type': 'application/json' } });
            fetchData();
        } catch (error) {
            console.error("Error posting announcement:", error);
            throw new Error(error.response?.data?.message || "Failed to post announcement. Check console for API error.");
        }
    };

    // 1. FUNCTION NA TATAWAGIN NG TRASH BUTTON SA LISTAHAN
    const handleConfirmDelete = (announcementId, posterUserId) => {
        if (user.role !== 'Administrator' && user.id !== posterUserId) {
            alert("You do not have permission to delete this announcement.");
            return;
        }

        setAnnouncementToDelete(announcementId);
        setPosterIdOfAnnouncement(posterUserId);
        setShowDeleteModal(true); // <--- ITO ANG NAGPAPALABAS NG MODAL
    };

    // 2. FUNCTION NA TATAWAGIN NG DELETE BUTTON SA LOOB NG MODAL
    const executeDeleteAnnouncement = async () => {
        if (!announcementToDelete) return;

        setShowDeleteModal(false);

        try {
            const response = await axios.delete(`${ANNOUNCEMENTS_ENDPOINT}`, {
                data: {
                    id: announcementToDelete,
                    user_id: user.id
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            alert(response.data.message || "Announcement deleted successfully.");
            fetchData();

        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert(`Failed to delete announcement: ${error.response?.data?.message || error.message}`);
        } finally {
            setAnnouncementToDelete(null);
            setPosterIdOfAnnouncement(null);
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

    // --- RENDER CONTENT (Simplified Switch) ---
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
                    />
                );

            case "stations":
            case "station_monitor":
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
                        handleConfirmDelete={handleConfirmDelete}
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


            case "analytics":
            case "guide":
                return (<div className="text-center py-5 text-muted"><i className="bi bi-cone-striped display-1"></i><h3 className="mt-3">Under Construction</h3><p>The module **{activeTab}** is currently being developed.</p></div>);

            default:
                return (<div className="alert alert-info text-center"><i className="bi bi-info-circle-fill me-2"></i>The module **{activeTab}** is under development.</div>);
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light overflow-hidden">

            {/* --- SIDEBAR (KEPT AS IS) --- */}
            <div
                className="d-flex flex-column flex-shrink-0 p-3 text-white transition-all position-fixed"
                style={{
                    width: isSidebarOpen ? "260px" : "80px",
                    transition: "width 0.3s",
                    backgroundColor: "#111827",
                    height: "100vh",
                    zIndex: 1000,
                    top: 0,
                    left: 0
                }}
            >
                {/* TOP LOGO */}
                <div className="d-flex align-items-center mb-3 text-white overflow-hidden">
                    <img
                        src={logo}
                        alt="MKFF Admin Logo"
                        style={{ height: "3rem" }}
                        className={isSidebarOpen ? "me-3" : ""}
                    />
                    {isSidebarOpen && <span className="fs-5 fw-bold">MKFF Admin</span>}
                </div>

                <hr className="border-secondary" />

                {/* MENU */}
                <ul className="nav nav-pills flex-column mb-3">
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
                            {isSidebarOpen && "Dashboard"}
                        </button>
                    </li>

                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${
                                (activeTab === "stations" || activeTab === "station_monitor") ? "active bg-danger" : ""
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
                            {isSidebarOpen && "Stations"}
                        </button>
                    </li>

                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "reports" ? "active bg-danger" : ""
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
                            {isSidebarOpen && "Reports"}
                        </button>
                    </li>

                    {/* --- ANNOUNCEMENT BOARD --- */}
                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "announcements" ? "active bg-danger" : ""
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
                            {isSidebarOpen && "Announcement Board"}
                        </button>
                    </li>
                    {/* ------------------------------------- */}

                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "approval" ? "active bg-danger" : ""
                                }`}
                            onClick={() => {
                                setActiveTab("approval");
                                setStationHistoryId(null);
                                setHighlightedUnitId(null);
                            }}
                        >
                            <i className="bi bi-check-circle"></i>
                            {isSidebarOpen && "Approvals"}
                        </button>
                    </li>

                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "manage_account" ? "active bg-danger" : ""
                                }`}
                            onClick={() => {
                                setActiveTab("manage_account");
                                setStationHistoryId(null);
                                setHighlightedUnitId(null);
                            }}
                        >
                            <i className="bi bi-person-gear"></i>
                            {isSidebarOpen && "Manage Account"}
                        </button>
                    </li>

                    <li>
                        <button
                            className={`nav-link text-white w-100 d-flex align-items-center gap-4 ${activeTab === "analytics" ? "active bg-danger" : ""
                                }`}
                            onClick={() => {
                                setActiveTab("analytics");
                                setStationHistoryId(null);
                                setHighlightedUnitId(null);
                            }}
                        >
                            <i className="bi bi-graph-up"></i>
                            {isSidebarOpen && "Analytics"}
                        </button>
                    </li>


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
                        {isSidebarOpen && "Logout"}
                    </button>

                    {/* COPYRIGHT TEXT (Now Below Logout with Separator) */}
                    <div className="text-center text-white-50 small pt-2 mt-2 border-top border-secondary">
                        {isSidebarOpen && <small>©2025 MKFF Laser Technique</small>}
                    </div>
                </div>
            </div>

                        {/* --- MAIN CONTENT CONTAINER (UPDATED FOR FIXED HEADER) --- */}
            <div
                className="flex-grow-1 d-flex flex-column"
                style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: isSidebarOpen ? "260px" : "80px",
                    transition: "left 0.3s",
                    // TINANGGAL: overflowY: 'auto' sa buong container
                    overflowX: 'hidden',
                    backgroundColor: '#eeeeeeff',
                    zIndex: 999,
                }}
            >
                {/* 1. HEADER (Fixed/Sticky at the Top) */}
                <header 
                    className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center"
                    style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }} // Ensure it stays on top visually
                >
                    <div className="d-flex align-items-center">
                        <button className="btn btn-light border me-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <i className="bi bi-list"></i>
                        </button>
                        <h5 className="mb-0 fw-bold text-secondary text-uppercase">
                            {activeTab === 'station_monitor' ? `${stations.find(s => s.id === stationMonitorId)?.name || 'Monitor'} Details` : activeTab.replace('_', ' ')}
                        </h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <NotificationBell notifications={notifications} onClick={handleBellClick} />
                        <div className="text-end me-2 d-none d-md-block">
                            <div className="fw-bold small">{headerFullName}</div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Administrator</div>
                        </div>
                        <img
                            src={headerAvatarSrc}
                            alt="User Avatar"
                            className="rounded-circle border border-danger"
                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                        />
                    </div>
                </header>

                {/* 2. CONTENT AREA (Scrollable Part) */}
                {/* Dito natin ilalagay ang scroll bar para HINDI kasama ang header */}
                <div 
                    className="container-fluid px-4 pt-4 pb-5 flex-grow-1"
                    style={{ overflowY: 'auto' }} // Ibinaba ang overflowY: 'auto' dito
                >
                    {renderContent()}
                </div>
            </div>
            {/* --- GLOBAL MODAL RENDERING (Maaaring mas madali na lang sa huli ng component) --- */}
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
            
            {/* --- NEW/MOVED MODALS (Pwedeng i-render dito) --- */}
            {showDeleteModal && (
                <DeleteAnnouncementModal
                    announcementToDelete={announcementToDelete}
                    onClose={() => setShowDeleteModal(false)}
                    executeDelete={executeDeleteAnnouncement}
                />
            )}
            
            {/* Note: Ang ApproveUnitModal ay ni-render na sa loob ng ApprovalQueue.jsx */}
            
        </div>
    );
}
