import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. CHART IMPORTS & REGISTRATION
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import logo from '../logo.png'; 

// IMPORT SEPARATED COMPONENTS
import { EditUnitModal } from './components/EditUnitModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ManageUserModal } from './components/ManageUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { SubmitReportModal } from './components/SubmitReportModal';
import { StationHistoryModal } from './components/StationHistoryModal';
import { UnitPieChart } from './components/UnitPieChart';
import { StationBarChart } from './components/StationBarChart';
import { NotificationBell } from './components/NotificationBell';
import { NotificationContent } from './components/NotificationContent';
import { ViewUserModal } from './components/ViewUserModal';

// REGISTER CHART COMPONENTS GLOBALLY
ChartJS.register(
    ArcElement, // For Doughnut/Pie charts
    CategoryScale, // For Bar charts (X-axis)
    LinearScale, // For Bar charts (Y-axis)
    BarElement, // For Bar charts
    Tooltip,
    Legend
);

// --- CONFIGURATION CONSTANT: DELAY THRESHOLDS ---
// Support both formats just in case
const DELAY_THRESHOLDS_MINUTES = {
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
    const [logs, setLogs] = useState([]); // Unit logs
    const [dailyReportsList, setDailyReportsList] = useState([]); // Reports
    const [userList, setUserList] = useState([]); // User list
    const [stations, setStations] = useState([]); // State for station list
    const [stationMonitorId, setStationMonitorId] = useState(null);

    // STATES for Reports and Editing
    const [reportDate, setReportDate] = useState(getTodayDate());
    const [reportFilterStationId, setReportFilterStationId] = useState('All');
    const [selectedUnitToEdit, setSelectedUnitToEdit] = useState(null);
    const [selectedReportToView, setSelectedReportToView] = useState(null); 
    const [selectedUserToManage, setSelectedUserToManage] = useState(null);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [stationHistoryId, setStationHistoryId] = useState(null);
    
    // --- NEW NOTIFICATION STATES ---
    const [notifications, setNotifications] = useState([]);
    const [lastSeenReportIds, setLastSeenReportIds] = useState(new Set());
    const [highlightedUnitId, setHighlightedUnitId] = useState(null);
    
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewUser, setViewUser] = useState(null);
    const [showPasswordInModal, setShowPasswordInModal] = useState(false);

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

    // --- CHECK DELAYED UNITS AND REPORTS ---
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


    // --- FETCH DATA ---
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

    // --- NOTIFICATION HANDLERS ---
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
            if(targetStation) {
                setStationMonitorId(targetStation.id);
            }
            setHighlightedUnitId(notification.unitId);
        }
        if (notification.type === 'NewReport') {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }
    };

    // --- UNIT HANDLERS ---
    const handleMonitorStation = (stationId) => {
        setStationMonitorId(stationId);
        setActiveTab('station_monitor');
        setHighlightedUnitId(null); 
    };
    const handleEditClick = (log) => { setSelectedUnitToEdit(log); };
    const handleViewReport = (report) => { setSelectedReportToView(report); };
    const handleViewHistory = (stationId) => { 
        // stationId here is "Station1" (from mockStations)
        // This should match what the backend expects.
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

    // --- USER MANAGEMENT HANDLERS ---
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

    // --- CALCULATE METRICS ---
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
    const totalOutput = overallMetrics.completedUnits;
    const systemAlerts = overallMetrics.ngUnits;
    
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

    

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (loading && logs.length === 0) {
            return ( <div className="text-center py-5"><div className="spinner-border text-danger" role="status"></div><p className="mt-3 text-muted">Loading real-time production data...</p></div> );
        }
        if (error) {
            return ( <div className="alert alert-danger text-center py-5"><i className="bi bi-x-octagon-fill me-2"></i> {error}</div> );
        }

        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="animate-in fade-in pb-4">
                        {/* --- Header Section --- */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Production Overview</h3>
                                <p className="text-muted small mb-0">Real-time data stream from all active stations.</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-white border px-3 py-2 rounded shadow-sm d-flex align-items-center">
                                    <span className="position-relative d-flex h-2 w-2 me-2">
                                      <span className="animate-ping position-absolute d-inline-flex h-100 w-100 rounded-circle bg-success opacity-75"></span>
                                      <span className="position-relative d-inline-flex rounded-circle h-2 w-2 bg-success" style={{width:'10px', height:'10px'}}></span>
                                    </span>
                                    <span className="fw-bold text-dark small" style={{fontSize: '0.8rem'}}>System Live</span>
                                </div>
                                <div className="bg-white border px-3 py-2 rounded shadow-sm text-secondary fw-bold small">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* --- Stats Cards (Modern Accent Style) --- */}
                        <div className="row g-4 mb-5">
                            {/* Completed Units */}
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                <i className="bi bi-box-seam-fill fs-4"></i>
                                            </div>
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-normal">
                                                <i className="bi bi-arrow-up-short"></i>On Track
                                            </span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0 display-6">{totalOutput}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed Units</span>
                                    </div>
                                </div>
                            </div>

                            {/* Yield Rate */}
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                <i className="bi bi-activity fs-4"></i>
                                            </div>
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 small fw-normal">
                                                Target: 98%
                                            </span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0 display-6">{overallMetrics.yieldRate}%</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Yield Rate</span>
                                    </div>
                                </div>
                            </div>

                            {/* In Progress */}
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                <i className="bi bi-hourglass-split fs-4"></i>
                                            </div>
                                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small fw-normal">
                                                Active
                                            </span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0 display-6">{overallMetrics.pendingUnits}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress</span>
                                    </div>
                                </div>
                            </div>

                            {/* Defects (NG) */}
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                                                <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                                            </div>
                                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small fw-normal">
                                                Alert
                                            </span>
                                        </div>
                                        <h2 className="fw-bold text-danger mb-0 display-6">{systemAlerts}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total Defects (NG)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Approvals Alert (Modern Strip) --- */}
                        {overallMetrics.pendingApprovalUnits > 0 && (
                            <div className="card border-0 shadow-sm mb-4 border-start border-4 border-danger bg-white">
                                <div className="card-body d-flex align-items-center justify-content-between p-3">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-bell-fill text-danger fs-4 me-3 ms-2"></i>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">Action Required</h6>
                                            <small className="text-secondary">There are <span className="fw-bold text-danger">{overallMetrics.pendingApprovalUnits} units</span> waiting for QA validation.</small>
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-danger px-4 rounded-pill" onClick={() => setActiveTab('approval')}>
                                        Review Queue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- Charts Section --- */}
                        <div className="row g-4">
                            {/* Bar Chart Container */}
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                                    <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-0">Station Output</h6>
                                            <small className="text-muted" style={{fontSize: '0.75rem'}}>Live production count per station</small>
                                        </div>
                                        <button className="btn btn-light btn-sm border rounded-circle" onClick={fetchData}><i className="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                    <div className="card-body">
                                        <StationBarChart logs={logs} stations={stations} calculateMetrics={calculateStationMetrics} />
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart Container */}
                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                                    <div className="card-header bg-white py-3 border-0">
                                        <h6 className="fw-bold text-dark mb-0">Status Distribution</h6>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>Overall yield ratio</small>
                                    </div>
                                    <div className="card-body d-flex align-items-center justify-content-center">
                                        <div style={{width: '100%', maxWidth: '320px'}}>
                                            <UnitPieChart metrics={overallMetrics} title="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pulsing Animation for Live Indicator */}
                        <style jsx>{`
                            .animate-ping {
                                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                            }
                            @keyframes ping {
                                75%, 100% { transform: scale(2); opacity: 0; }
                            }
                        `}</style>
                    </div>
                );

            case "stations":
                return (
                    <div className="animate-in fade-in">
                        {/* Title Header */}
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">Station Management</h3>
                                <p className="text-muted small mb-0">Overview of all {stations.length} production stations.</p>
                            </div>
                            {/* Legend */}
                            <div className="d-none d-md-flex gap-3 small text-muted">
                                <span className="d-flex align-items-center"><span className="rounded-circle bg-primary me-2" style={{width:8, height:8}}></span>Running</span>
                                <span className="d-flex align-items-center"><span className="rounded-circle bg-danger me-2" style={{width:8, height:8}}></span>Attention</span>
                                <span className="d-flex align-items-center"><span className="rounded-circle bg-secondary me-2" style={{width:8, height:8}}></span>Idle</span>
                            </div>
                        </div>

                        <div className="row g-4">
                            {stations.map((station) => {
                                const metrics = calculateStationMetrics(station.id);
                                const hasActivity = metrics.pendingUnits > 0;
                                const hasError = metrics.ngUnits > 0 && metrics.completedUnits === 0;
                                
                                let statusColor = "secondary";
                                let statusLabel = "Idle";
                                let borderColor = "border-secondary";

                                if (hasActivity) {
                                    statusColor = "primary";
                                    statusLabel = "Running";
                                    borderColor = "border-primary";
                                }
                                if (hasError) {
                                    statusColor = "danger";
                                    statusLabel = "Attention";
                                    borderColor = "border-danger";
                                }

                                return (
                                    <div key={station.id} className="col-xl-3 col-lg-4 col-md-6">
                                        <div className={`card h-100 border-0 shadow-sm station-card hover-up border-top border-4 ${borderColor}`} style={{borderRadius: '12px'}}>
                                            <div className="card-body p-4 d-flex flex-column">
                                                
                                                {/* Card Header: Station Name & Status Badge ONLY */}
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h6 className="fw-bold text-dark mb-0 fs-5">{station.name}</h6>
                                                    <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} px-2 py-1 rounded-pill small fw-bold`}>
                                                        {hasActivity && <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true" style={{width: '0.5rem', height: '0.5rem'}}></span>}
                                                        {statusLabel}
                                                    </span>
                                                </div>

                                                {/* Mini Stats Summary */}
                                                <div className="row g-2 mb-4 bg-light rounded p-2 mx-0">
                                                    <div className="col-6 text-center border-end">
                                                        <small className="text-muted text-uppercase" style={{fontSize: '0.65rem'}}>Output</small>
                                                        <div className="fw-bold text-dark fs-5">{metrics.completedUnits}</div>
                                                    </div>
                                                    <div className="col-6 text-center">
                                                        <small className="text-muted text-uppercase" style={{fontSize: '0.65rem'}}>Defects</small>
                                                        <div className={`fw-bold fs-5 ${metrics.ngUnits > 0 ? 'text-danger' : 'text-dark'}`}>{metrics.ngUnits}</div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-auto d-flex gap-2">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold" 
                                                        style={{borderRadius: '8px'}}
                                                        onClick={() => handleMonitorStation(station.id)}
                                                    >
                                                        Monitor
                                                    </button>
                                                    <button 
                                                        className="btn btn-light text-secondary btn-sm border" 
                                                        style={{borderRadius: '8px'}}
                                                        onClick={() => handleViewHistory(station.id)}
                                                        title="View Logs"
                                                    >
                                                        <i className="bi bi-clock-history"></i>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <style jsx>{`
                            .hover-up { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                            .hover-up:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                        `}</style>
                    </div>
                );

            case "station_monitor":
                if (!stationMonitorId) { setActiveTab('stations'); return null; }
                const station = stations.find(s => s.id === stationMonitorId);
                const monitorMetrics = calculateStationMetrics(stationMonitorId);

                return (
                    <div className="animate-in fade-in pb-5">
                        {/* --- Header Section --- */}
                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">{station?.name || stationMonitorId}</h3>
                                <p className="text-muted small mb-0">Real-time production feed</p>
                            </div>
                            <button 
                                className="btn btn-light border btn-sm px-3 fw-bold text-muted hover-lift" 
                                onClick={() => { setActiveTab('stations'); setHighlightedUnitId(null); }}
                            >
                                <i className="bi bi-arrow-left me-2"></i>Back to Overview
                            </button>
                        </div>

                        {/* --- Stats Cards (Modern Style) --- */}
                        <div className="row g-4 mb-4">
                            {/* Completed */}
                            <div className="col-md-6 col-xl-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                                                <i className="bi bi-check-circle-fill fs-4"></i>
                                            </div>
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-normal">Output</span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0">{monitorMetrics.completedUnits}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Completed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Yield Rate */}
                            <div className="col-md-6 col-xl-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                                                <i className="bi bi-graph-up-arrow fs-4"></i>
                                            </div>
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 small fw-normal">Efficiency</span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0">{monitorMetrics.yieldRate}%</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Yield Rate</span>
                                    </div>
                                </div>
                            </div>

                            {/* In Progress */}
                            <div className="col-md-6 col-xl-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                                                <i className="bi bi-hourglass-split fs-4"></i>
                                            </div>
                                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small fw-normal">Active</span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0">{monitorMetrics.pendingUnits}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>In Progress</span>
                                    </div>
                                </div>
                            </div>

                            {/* Defects (NG) */}
                            <div className="col-md-6 col-xl-3">
                                <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
                                                <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                                            </div>
                                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small fw-normal">Defects</span>
                                        </div>
                                        <h2 className="fw-bold text-dark mb-0">{monitorMetrics.ngUnits}</h2>
                                        <span className="text-muted text-uppercase small fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>Total NG</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Live Logs Table (Kept Original Structure) --- */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                            <div className="card-header bg-white py-3 px-4 border-0 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold text-dark mb-0">Production Feed</h6>
                                <button className="btn btn-sm btn-light text-primary fw-bold border rounded-pill px-3" onClick={fetchData}>
                                    <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small text-center align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>MODEL</th>
                                            <th>REVISION</th>
                                            <th>BASE UNIT</th>
                                            <th>ASSEMBLY</th>
                                            <th>DEVICE SERIAL</th>
                                            <th>ACCESSORY</th>
                                            <th>STATUS</th>
                                            <th>REMARKS</th>
                                            <th>TIME DATE</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monitorMetrics.stationLogs.length > 0 ? monitorMetrics.stationLogs.map(log => {
                                            const isHighlighted = highlightedUnitId === log.id;
                                            return (
                                                <tr key={log.id} className={isHighlighted ? 'table-danger fw-bold' : ''}>
                                                    <td>{log.model}</td>
                                                    <td>{log.revision}</td>
                                                    <td className="font-monospace">{log.base_unit_kitting_no}</td>
                                                    <td className="font-monospace text-primary fw-bold">{log.assembly_no}</td>
                                                    <td className="fw-bold">{log.device_serial_no}</td>
                                                    <td>{log.accessory_kitting_no}</td>
                                                    <td><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                                    <td>{log.remarks}</td>
                                                    <td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                                    <td><button className="btn btn-sm btn-outline-danger py-0" onClick={() => handleEditClick(log)}><i className="bi bi-pencil"></i> Edit</button></td>
                                                </tr>
                                            );
                                        }) : ( <tr><td colSpan="10" className="text-center py-4">No live logs found for this station.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case "reports":
                return (
                    <div className="animate-in fade-in pb-5">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">Production Reports</h3>
                                <p className="text-muted small mb-0">Daily performance records from all stations.</p>
                            </div>
                            <button 
                                className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold hover-scale"
                                onClick={() => setShowReportModal(true)}
                            >
                                <i className="bi bi-plus-lg me-2"></i>New Report
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '12px'}}>
                            <div className="card-body p-3 d-flex flex-wrap align-items-center gap-3">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-calendar-event text-secondary me-2 fs-5"></i>
                                    <input 
                                        type="date" 
                                        className="form-control border-0 bg-light fw-bold text-secondary" 
                                        style={{maxWidth: '160px'}}
                                        value={reportDate} 
                                        onChange={(e) => setReportDate(e.target.value)} 
                                        max={getTodayDate()} 
                                    />
                                </div>
                                <div className="vr text-secondary opacity-25 mx-2"></div>
                                <div className="d-flex align-items-center flex-grow-1">
                                    <i className="bi bi-funnel text-secondary me-2 fs-5"></i>
                                    <select 
                                        className="form-select border-0 bg-light fw-bold text-secondary" 
                                        style={{maxWidth: '200px'}}
                                        value={reportFilterStationId} 
                                        onChange={(e) => setReportFilterStationId(e.target.value)}
                                    >
                                        <option value="All">All Stations</option>
                                        {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                    </select>
                                </div>
                                <div className="text-muted small ms-auto">
                                    Showing <strong className="text-dark">{filteredReports.length}</strong> records
                                </div>
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="bg-light text-secondary text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                                        <tr>
                                            <th className="border-0 py-3 ps-4">Station & Shift</th>
                                            <th className="border-0 py-3 text-center">Output</th>
                                            <th className="border-0 py-3 text-center">Defects / Downtime</th>
                                            <th className="border-0 py-3">Submitted By</th>
                                            <th className="border-0 py-3 text-end pe-4">Timestamp</th>
                                            <th className="border-0 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {filteredReports.length > 0 ? filteredReports.map(report => (
                                            <tr key={report.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3">
                                                            <i className="bi bi-layers-fill"></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{report.station}</div>
                                                            <div className="small text-muted">{report.shift}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-normal fs-6">
                                                        {report.total_units_processed}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                                        <span className="text-danger fw-bold">{report.total_ng} NG</span>
                                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{report.downtime_minutes} min down</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center text-secondary">
                                                        <i className="bi bi-person-circle me-2"></i>
                                                        {report.submitted_by}
                                                    </div>
                                                </td>
                                                <td className="text-end pe-4 text-muted font-monospace small">
                                                    {new Date(report.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    <div style={{fontSize: '0.7rem'}}>{new Date(report.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-sm btn-light border text-primary hover-primary rounded-pill px-3" 
                                                        onClick={() => handleViewReport(report)}
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="py-5 text-center text-muted">
                                                    <div className="mb-3"><i className="bi bi-file-earmark-x fs-1 opacity-25"></i></div>
                                                    <p className="mb-0">No reports found for the selected date or station.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <style jsx>{`
                            .hover-scale:hover { transform: scale(1.02); }
                            .hover-primary:hover { background-color: #0d6efd; color: white !important; border-color: #0d6efd !important; }
                        `}</style>
                    </div>
                );
            case "approval":
                const approvalQueueLogs = logs.filter(l => l.status === 'Pending Approval');
                return (
                    <div className="animate-in fade-in pb-5">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">Approval Queue</h3>
                                <p className="text-muted small mb-0">Review flagged units requiring QA validation or status rollback.</p>
                            </div>
                            {approvalQueueLogs.length > 0 && (
                                <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm d-flex align-items-center">
                                    <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                                    {approvalQueueLogs.length} Pending
                                </span>
                            )}
                        </div>

                        {/* Main Card */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="bg-light text-secondary text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                                        <tr>
                                            <th className="border-0 py-3 ps-4">Unit Details</th>
                                            <th className="border-0 py-3">Origin Station</th>
                                            <th className="border-0 py-3 text-center">Status</th>
                                            <th className="border-0 py-3" style={{width: '25%'}}>Remarks</th>
                                            <th className="border-0 py-3 text-end">Timestamp</th>
                                            <th className="border-0 py-3 text-center pe-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {approvalQueueLogs.length > 0 ? approvalQueueLogs.map(log => (
                                            <tr key={log.id}>
                                                {/* Unit Details */}
                                                <td className="ps-4">
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark">{log.model} <span className="fw-normal text-muted">({log.revision})</span></span>
                                                        <span className="small text-muted font-monospace">{log.device_serial_no}</span>
                                                    </div>
                                                </td>

                                                {/* Station */}
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light border rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{width: '28px', height: '28px'}}>
                                                            <i className="bi bi-geo-alt-fill text-secondary" style={{fontSize: '0.7rem'}}></i>
                                                        </div>
                                                        <span className="fw-medium text-dark">{log.station}</span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="text-center">
                                                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2 fw-normal">
                                                        Pending QA
                                                    </span>
                                                </td>

                                                {/* Remarks */}
                                                <td>
                                                    <div className="d-flex align-items-start text-muted small fst-italic">
                                                        <i className="bi bi-chat-quote-fill me-2 opacity-50"></i>
                                                        "{log.remarks || 'No remarks provided'}"
                                                    </div>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="text-end font-monospace small text-muted">
                                                    <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                                    <div style={{fontSize: '0.75rem'}}>{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>

                                                {/* Action */}
                                                <td className="text-center pe-4">
                                                    <button 
                                                        className="btn btn-sm btn-success text-white fw-bold px-4 rounded-pill shadow-sm hover-scale"
                                                        onClick={() => handleApproveUnit(log.id, log)}
                                                        style={{transition: 'transform 0.2s'}}
                                                    >
                                                        <i className="bi bi-check-circle me-1"></i> Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="py-5 text-center text-muted">
                                                    <div className="mb-3">
                                                        <i className="bi bi-clipboard-check fs-1 text-success opacity-25"></i>
                                                    </div>
                                                    <h6 className="fw-bold text-dark">All Clear!</h6>
                                                    <p className="small mb-0">No units currently require approval.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <style jsx>{`
                            .hover-scale:hover { transform: scale(1.05); }
                        `}</style>
                    </div>
                );
           case "manage_account": 
                return (
                    <div className="animate-in fade-in pb-5">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">User Management</h3>
                                <p className="text-muted small mb-0">Control access and manage system accounts.</p>
                            </div>
                            <button 
                                className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold hover-scale d-flex align-items-center" 
                                onClick={handleAddUser}
                            >
                                <i className="bi bi-person-plus-fill me-2"></i> Add User
                            </button>
                        </div>

                        {/* User List Card */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                            {/* Card Header / Toolbar */}
                            <div className="bg-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                                <span className="text-uppercase small fw-bold text-muted ls-1">All Users</span>
                                <span className="badge bg-light text-dark border">Total: {userList.length}</span>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="bg-light text-secondary text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                                        <tr>
                                            <th className="border-0 py-3 ps-4">User Profile</th>
                                            <th className="border-0 py-3">Role</th>
                                            <th className="border-0 py-3">Assigned Station</th>
                                            <th className="border-0 py-3 text-end pe-4">Date Added</th>
                                            <th className="border-0 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {userList.length > 0 ? userList.map(u => {
                                            const isMe = u.id === user.id; // Assuming 'user' is the logged-in admin
                                            const roleColor = u.role === 'Administrator' ? 'danger' : 'primary';
                                            const roleIcon = u.role === 'Administrator' ? 'bi-shield-lock-fill' : 'bi-person-badge-fill';

                                            return (
                                                <tr key={u.id}>
                                                    {/* Profile Column */}
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="position-relative me-3">
                                                                <img 
                                                                    src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH} 
                                                                    alt="Avatar" 
                                                                    className="rounded-circle border border-2 border-white shadow-sm" 
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }} 
                                                                />
                                                                {isMe && <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{width: '10px', height: '10px'}}></span>}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">{u.full_name || 'No Name'}</div>
                                                                <div className="small text-muted">@{u.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role Column */}
                                                    <td>
                                                        <span className={`badge bg-${roleColor} bg-opacity-10 text-${roleColor} border border-${roleColor} border-opacity-10 rounded-pill px-3 py-2 fw-normal`}>
                                                            <i className={`bi ${roleIcon} me-2`}></i>{u.role}
                                                        </span>
                                                    </td>

                                                    {/* Station Column */}
                                                    <td>
                                                        {u.station ? (
                                                            <div className="d-flex align-items-center text-dark">
                                                                <i className="bi bi-geo-alt text-secondary me-2"></i>
                                                                {u.station}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small fst-italic">Not Assigned</span>
                                                        )}
                                                    </td>

                                                    {/* Date Column */}
                                                    <td className="text-end pe-4 text-muted font-monospace small">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>

                                                    {/* Actions Column */}
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button 
                                                                className="btn btn-sm btn-light border text-primary hover-primary rounded-circle" 
                                                                style={{width: '32px', height: '32px', padding: 0}}
                                                                onClick={() => handleViewUser(u)}
                                                                title="View Details"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                            
                                                            <button 
                                                                className="btn btn-sm btn-light border text-danger hover-danger rounded-circle" 
                                                                style={{width: '32px', height: '32px', padding: 0}}
                                                                onClick={() => handleConfirmDeleteUser(u)} 
                                                                disabled={u.id === 1 || isMe}
                                                                title="Delete User"
                                                            >
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="py-5 text-center text-muted">
                                                    <div className="mb-3"><i className="bi bi-people fs-1 opacity-25"></i></div>
                                                    <p className="mb-0">No users found in the system.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modals */}
                        {showViewModal && (
                            <ViewUserModal 
                                viewUser={viewUser} 
                                onClose={() => setShowViewModal(false)} 
                                onEdit={handleEditUser}
                                AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                                DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                            />
                        )} 

                        <style jsx>{`
                            .hover-scale:hover { transform: scale(1.02); }
                            .hover-primary:hover { background-color: #0d6efd; color: white !important; border-color: #0d6efd !important; }
                            .hover-danger:hover { background-color: #dc3545; color: white !important; border-color: #dc3545 !important; }
                            .ls-1 { letter-spacing: 1px; }
                        `}</style>
                    </div>
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
                return ( <div className="text-center py-5 text-muted"><i className="bi bi-cone-striped display-1"></i><h3 className="mt-3">Under Construction</h3><p>The module **{activeTab}** is currently being developed.</p></div> );

            default:
                return ( <div className="alert alert-info text-center"><i className="bi bi-info-circle-fill me-2"></i>The module **{activeTab}** is under development.</div> );
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light overflow-hidden">
            {/* --- SIDEBAR --- */}
            <div className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark transition-all`} style={{ width: isSidebarOpen ? "260px" : "80px", transition: "width 0.3s", backgroundColor: "#111827" }}>
                <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none overflow-hidden">
                    <img src={logo} alt="MKFF Admin Logo" style={{ height: '3rem', marginRight: '1rem' }} className="logo-class" />
                    {isSidebarOpen && <span className="fs-5 fw-bold text-nowrap">MKFF Admin</span>}
                </div>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'dashboard' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('dashboard'); setStationMonitorId(null); setReportFilterStationId('All'); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-speedometer2 me-3"></i>{isSidebarOpen && "Dashboard"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'stations' || activeTab === 'station_monitor' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('stations'); setStationMonitorId(null); setReportFilterStationId('All'); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-grid-3x3-gap me-3"></i>{isSidebarOpen && "Stations"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'reports' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('reports'); setStationMonitorId(null); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-file-text me-3"></i>{isSidebarOpen && "Reports"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'approval' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('approval'); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-check-circle me-3"></i>{isSidebarOpen && "Approvals"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'manage_account' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('manage_account'); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-person-gear me-3"></i>{isSidebarOpen && "Manage Account"}</button></li>
                    <li><button className={`nav-link text-white w-100 text-start ${activeTab === 'analytics' ? 'active bg-danger' : ''}`} onClick={() => { setActiveTab('analytics'); setStationHistoryId(null); setHighlightedUnitId(null);}}><i className="bi bi-graph-up me-3"></i>{isSidebarOpen && "Analytics"}</button></li>
                </ul >
                <button className="btn btn-outline-light mt-auto w-100" onClick={onLogout}><i className="bi bi-box-arrow-left me-2"></i>{isSidebarOpen && "Logout"}</button>
            </div >

            {/* --- MAIN --- */}
            <div className="flex-grow-1 d-flex flex-column" style={{maxHeight: '100vh', overflowY: 'auto'}}>
                <header className="bg-white shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center sticky-top">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-light border me-3" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><i className="bi bi-list"></i></button>
                        <h5 className="mb-0 fw-bold text-secondary text-uppercase">{activeTab === 'station_monitor' ? `${stations.find(s => s.id === stationMonitorId)?.name || 'Monitor'} Details` : activeTab.replace('_', ' ')}</h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <NotificationBell notifications={notifications} onClick={handleBellClick} />
                        <div className="text-end me-2 d-none d-md-block"><div className="fw-bold small">{headerFullName}</div><div className="text-muted small" style={{fontSize: '0.75rem'}}>Administrator</div></div>
                        <img src={headerAvatarSrc} alt="User Avatar" className="rounded-circle border border-danger" style={{width: '35px', height: '35px', objectFit: 'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }} />
                    </div>
                </header>

                <div className="container-fluid px-4 pb-5">
                    {renderContent()}
                </div>
            </div>

            {/* --- MODAL RENDERING --- */}
            {selectedUnitToEdit && ( <EditUnitModal unit={selectedUnitToEdit} onClose={() => setSelectedUnitToEdit(null)} onSave={handleSaveEdit} /> )}
            {selectedReportToView && ( <ReportDetailModal report={selectedReportToView} onClose={() => setSelectedReportToView(null)} API_BASE_URL={API_BASE_URL} /> )}
            {showReportModal && ( <SubmitReportModal user={user} stations={stations} onClose={() => setShowReportModal(false)} onSave={refreshAndCloseReport} REPORTS_ENDPOINT={REPORTS_ENDPOINT} /> )}
            {stationHistoryId && ( <StationHistoryModal stationId={stationHistoryId} onClose={() => setStationHistoryId(null)} HISTORY_ENDPOINT={HISTORY_ENDPOINT} /> )}
            {selectedUserToManage && ( <ManageUserModal userToEdit={selectedUserToManage.id ? selectedUserToManage : initialNewUserData} stations={stations} onClose={() => setSelectedUserToManage(null)} onSave={handleSaveUser} AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH} DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH} /> )}
            {selectedUserToDelete && ( <DeleteUserModal user={selectedUserToDelete} onClose={() => setSelectedUserToDelete(null)} onDelete={handleDeleteUser} /> )}
        </div>
    );
}