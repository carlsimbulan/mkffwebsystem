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
const DELAY_THRESHOLDS_MINUTES = {
    'Station1': 6,
    'Station2': 8,
    'Station3': 3,
    'Station4': 12,
    'Station5': 15,
    'Station6': 15,
    'Station7': 3,
    'Station8': 0, 
    'Station9': 480, // 8 hours
    'Station10': 8,
    'Station11': 22,
    'Station12': 5,
    'Station13': 10,
    'Station14': 8,
    'Station15': 5,
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

    // --- MISSING STATES ADDED HERE ---
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

    // --- UPDATED: LOGIC TO CHECK FOR DELAYED UNITS AND REPORTS ---
    const checkDelayedUnitsAndReports = useCallback((allUnits, allReports) => {
        const now = new Date();
        const newDelayedNotifications = [];
        const currentDelayedUnitIds = new Set(); 

        // 1. Delayed Units Check 
        const inProgressUnits = allUnits.filter(l => l.status === 'In Progress');
        
        inProgressUnits.forEach(unit => {
            const stationId = unit.station;
            const thresholdMinutes = DELAY_THRESHOLDS_MINUTES[stationId] || 0; 

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
            if (JSON.stringify(fetchedUsers) !== JSON.stringify(userList)) {
                setUserList(fetchedUsers);
            }

            const loggedInUserData = fetchedUsers.find(u => u.id === user.id);
            if (loggedInUserData) {
                user.full_name = loggedInUserData.full_name;
                user.avatar_url = loggedInUserData.avatar_url;
            }

            // 4. Mock Station Data
            const mockStations = Array.from({ length: 15 }, (_, i) => ({
                id: `Station${i + 1}`,
                name: `Station ${i + 1}`,
                operator: `Operator-${100 + i}`
            }));
            setStations(mockStations);
            
            // 5. Run Notification Logic
            checkDelayedUnitsAndReports(fetchedUnits, fetchedReports);

        } catch (err) {
            console.error("Error fetching data:", err);
            if (!isBackgroundUpdate) {
                setError(`Failed to fetch data from the server. Error: ${err.message}`);
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
                setReportFilterStationId(report.station);
                setSelectedReportToView(report);
            }
        } else if (notification.type === 'DelayedUnit') {
            setActiveTab('station_monitor');
            setStationMonitorId(notification.stationId);
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
    const handleViewHistory = (stationId) => { setStationHistoryId(stationId); };

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
            fetchData();
        }
    };

    // --- USER MANAGEMENT HANDLERS ---
    const handleAddUser = () => { setSelectedUserToManage(initialNewUserData); };
    const handleEditUser = (user) => { setSelectedUserToManage(user); };
    const handleConfirmDeleteUser = (user) => { setSelectedUserToDelete(user); };

    // --- MISSING HANDLER ADDED HERE: HANDLE VIEW USER ---
    const handleViewUser = (user) => {
        setViewUser(user);
        setShowPasswordInModal(false); // Reset to hidden
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
        const stationLogs = stationId ? liveLogs.filter(l => l.station === stationId) : liveLogs; 

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
            pendingApprovalUnits: stationId ? currentLogs.filter(l => l.station === stationId && l.status === 'Pending Approval').length : pendingApprovalUnits,
            yieldRate: yieldRate.toFixed(2),
        };
    };

    const overallMetrics = calculateStationMetrics(null, logs);
    const totalOutput = overallMetrics.completedUnits;
    const systemAlerts = overallMetrics.ngUnits;
    
    // Filter reports
    const filteredReports = dailyReportsList.filter(report => {
        const reportDbDate = report.report_date ? report.report_date.split(' ')[0] : null;
        return (reportDbDate === reportDate) && (reportFilterStationId === 'All' || report.station === reportFilterStationId);
    });

    const headerAvatarSrc = user.avatar_url ? `${AVATAR_UPLOAD_PATH}${user.avatar_url}` : DEFAULT_AVATAR_PATH;
    const headerFullName = user.full_name || user.username || 'Admin';

    // --- MISSING COMPONENT DEFINITION ADDED HERE ---
    const ViewUserModal = () => {
        if (!viewUser) return null;

        return (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title"><i className="bi bi-person-badge me-2"></i> User Details</h5>
                            <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center mb-4">
                                <img
                                    src={viewUser.avatar_url ? `${AVATAR_UPLOAD_PATH}${viewUser.avatar_url}` : DEFAULT_AVATAR_PATH}
                                    alt="Profile"
                                    className="rounded-circle shadow-sm"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                />
                                <h4 className="mt-2">{viewUser.full_name}</h4>
                                <span className="badge bg-secondary">{viewUser.role}</span>
                            </div>

                            <div className="mb-3">
                                <label className="fw-bold text-muted small">Username</label>
                                <div className="form-control bg-light">{viewUser.username}</div>
                            </div>

                            <div className="mb-3">
                                <label className="fw-bold text-muted small">Password</label>
                                <div className="input-group">
                                    <input 
                                        type={showPasswordInModal ? "text" : "password"} 
                                        className="form-control bg-light" 
                                        value={viewUser.password} 
                                        readOnly 
                                    />
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="button" 
                                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                                    >
                                        {showPasswordInModal ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                    </button>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label className="fw-bold text-muted small">Station</label>
                                    <div className="form-control bg-light">{viewUser.station || 'N/A'}</div>
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="fw-bold text-muted small">User ID</label>
                                    <div className="form-control bg-light">{viewUser.id}</div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={() => {
                                    setShowViewModal(false); 
                                    handleEditUser(viewUser); // Switches to edit logic
                                }}
                            >
                                <i className="bi bi-pencil me-2"></i> Edit User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                    <>
                        <h3 className="mb-4 d-flex align-items-center"><i className="bi bi-speedometer2 me-2 text-danger"></i>Overall Manufacturing Dashboard</h3>
                        <div className="row g-4 mb-4">
                            <div className="col-md-3"><div className="card text-white bg-success shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Total Completed (Live)</h6><h2 className="display-6 fw-bold">{totalOutput}</h2><p className="card-text small">Units successfully completed</p></div></div></div>
                            <div className="col-md-3"><div className="card text-white bg-primary shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Overall Yield</h6><h2 className="display-6 fw-bold">{overallMetrics.yieldRate}%</h2><p className="card-text small">Good Units / Total Units Checked</p></div></div></div>
                            <div className="col-md-3"><div className="card bg-warning text-dark shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Pending Units (In Progress)</h6><h2 className="display-6 fw-bold">{overallMetrics.pendingUnits}</h2><p className="card-text small">Units currently in progress (Live)</p></div></div></div>
                            <div className="col-md-3"><div className="card text-white bg-danger shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">No Good (NG) (Live)</h6><h2 className="display-6 fw-bold">{systemAlerts}</h2><p className="card-text small">Defective units recorded</p></div></div></div>
                        </div>
                        <div className="alert alert-danger d-flex align-items-center mb-4 border border-danger"><i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i><span className="fw-bold me-2">{overallMetrics.pendingApprovalUnits}</span> units are awaiting QA approval. Please check the **Approvals** tab for review.</div>
                        <div className="row g-4">
                            <div className="col-lg-4"><UnitPieChart metrics={overallMetrics} title="Overall Live Unit Status Distribution" /></div>
                            <div className="col-lg-8"><StationBarChart logs={logs} stations={stations} calculateMetrics={calculateStationMetrics} /></div>
                        </div>
                    </>
                );

            case "stations":
                return (
                    <div className="row g-3">
                        <div className="col-12 mb-3"><h4><i className="bi bi-grid-3x3-gap-fill me-2"></i>Stations Overview (1-15)</h4><p className="text-muted small">Shows live unit activity based on current metrics. Click **Monitor** for details or **History** for all recorded activity.</p></div>
                        {stations.map((station) => {
                            const metrics = calculateStationMetrics(station.id);
                            const hasActivity = metrics.pendingUnits > 0 || metrics.completedUnits > 0 || metrics.ngUnits > 0;
                            let statusText = "IDLE";
                            let statusClass = "bg-secondary";
                            if (metrics.pendingUnits > 0) { statusText = `${metrics.pendingUnits} IN PROGRESS`; statusClass = "bg-primary"; } 
                            else if (metrics.yieldTotal > 0 && metrics.ngUnits > 0 && metrics.completedUnits === 0) { statusText = "NG ALERT"; statusClass = "bg-danger"; }

                            return (
                                <div key={station.id} className="col-md-4 col-lg-3 col-xl-2">
                                    <div className={`card h-100 shadow-sm border-top-4 ${statusClass === 'bg-danger' ? 'border-danger' : statusClass === 'bg-primary' ? 'border-primary' : 'border-secondary'}`}>
                                        <div className="card-body text-center p-2">
                                            <h6 className="fw-bold mb-1">{station.name}</h6>
                                            <span className={`badge mb-2 ${statusClass}`}>{statusText}</span>
                                            <p className="small text-muted mb-0">{station.operator}</p>
                                        </div>
                                        <div className="card-footer bg-white p-1 d-flex justify-content-between">
                                            <button className="btn btn-primary btn-sm py-0 flex-grow-1 me-1" style={{fontSize: '0.7rem'}} onClick={() => handleMonitorStation(station.id)} disabled={!hasActivity}><i className="bi bi-eye me-1"></i>Monitor</button>
                                            <button className="btn btn-secondary btn-sm py-0" style={{fontSize: '0.7rem'}} onClick={() => handleViewHistory(station.id)}><i className="bi bi-clock-history me-1"></i>History</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            case "station_monitor":
                if (!stationMonitorId) { setActiveTab('stations'); return null; }
                const station = stations.find(s => s.id === stationMonitorId);
                const monitorMetrics = calculateStationMetrics(stationMonitorId);

                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center"><i className="bi bi-activity me-2 text-danger"></i>Real-time Monitoring for <span className="text-primary ms-2">{station?.name || stationMonitorId}</span><button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => { setActiveTab('stations'); setHighlightedUnitId(null);}}><i className="bi bi-arrow-left me-1"></i> Back to Stations</button></h3>
                        <hr />
                        <div className="row g-4 mb-4">
                            <div className="col-lg-6"> 
                                <div className="row g-4">
                                    <div className="col-md-6"><div className="card bg-success text-white shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Completed Units</h6><h2 className="display-6 fw-bold">{monitorMetrics.completedUnits}</h2><p className="card-text small">Total units successfully processed.</p></div></div></div>
                                    <div className="col-md-6"><div className="card bg-info text-dark shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">Overall Yield</h6><h2 className="display-6 fw-bold">{monitorMetrics.yieldRate}%</h2><p className="card-text small">Good Units / Total Units Checked ({monitorMetrics.yieldTotal})</p></div></div></div>
                                    <div className="col-md-6"><div className="card bg-warning text-dark shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">In Progress</h6><h2 className="display-6 fw-bold">{monitorMetrics.pendingUnits}</h2><p className="card-text small">Units currently being processed.</p></div></div></div>
                                    <div className="col-md-6"><div className="card bg-danger text-white shadow-sm h-100"><div className="card-body"><h6 className="card-title text-uppercase mb-2">No Good (NG)</h6><h2 className="display-6 fw-bold">{monitorMetrics.ngUnits}</h2><p className="card-text small">Total defective units recorded.</p></div></div></div>
                                </div>
                            </div>
                            <div className="col-lg-6"><UnitPieChart metrics={monitorMetrics} title={`${station?.name || 'Station'} Status (Live)`} /></div>
                        </div>
                        <div className="card shadow-sm">
                            <div className="card-header bg-white"><h5 className="mb-0">Live Logs (Excluding Pending Approval) for {station?.name || stationMonitorId}</h5></div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark"><tr><th>ID</th><th>Station</th><th>Model</th><th>Revision</th><th>Base Unit No.</th><th>Assembly No.</th><th>Serial No.</th><th>Accessory No.</th><th>Status</th><th>Remarks</th><th>Timestamp</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {monitorMetrics.stationLogs.length > 0 ? monitorMetrics.stationLogs.map(log => {
                                            const isHighlighted = highlightedUnitId === log.id;
                                            return (
                                                <tr key={log.id} className={isHighlighted ? 'table-danger fw-bold' : ''}>
                                                    <td>{log.id}</td><td><span className="badge bg-secondary">{log.station}</span></td><td>{log.model}</td><td>{log.revision}</td><td>{log.base_unit_kitting_no}</td><td>{log.assembly_no}</td><td className="fw-bold">{log.device_serial_no}</td><td>{log.accessory_kitting_no}</td>
                                                    <td><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                                    <td>{log.remarks}</td><td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                                    <td><button className="btn btn-sm btn-outline-danger py-0" onClick={() => handleEditClick(log)}><i className="bi bi-pencil"></i> Edit</button></td>
                                                </tr>
                                            );
                                        }) : ( <tr><td colSpan="12" className="text-center py-4">No live logs found for this station.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "reports":
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center"><i className="bi bi-clipboard-data me-2 text-danger"></i>Submitted Daily Reports</h3>
                        <p className="text-muted">View production reports submitted by all stations, filtered by date and station.</p>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex gap-3 align-items-center">
                                <label className="form-label mb-0 fw-bold">Filter Date:</label>
                                <input type="date" className="form-control w-auto" value={reportDate} onChange={(e) => setReportDate(e.target.value)} max={getTodayDate()} />
                                <label className="form-label mb-0 fw-bold ms-3">Filter Station:</label>
                                <select className="form-select w-auto" value={reportFilterStationId} onChange={(e) => setReportFilterStationId(e.target.value)}>
                                    <option value="All">All Stations</option>
                                    {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                </select>
                            </div>
                            <button className="btn btn-sm btn-success" onClick={() => setShowReportModal(true)}><i className="bi bi-file-earmark-plus me-1"></i> Submit New Report</button>
                        </div>
                        <div className="card shadow-sm">
                            <div className="card-header bg-white fw-bold">Reports for {reportDate} ({filteredReports.length} found)</div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark"><tr><th>ID</th><th>Station</th><th>Shift</th><th>Units Processed</th><th>NG/Downtime</th><th>Submitted By</th><th>Timestamp</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredReports.length > 0 ? filteredReports.map(report => (
                                            <tr key={report.id}>
                                                <td>{report.id}</td><td><span className="badge bg-primary">{report.station}</span></td><td>{report.shift}</td><td className="fw-bold text-success">{report.total_units_processed}</td><td><span className="text-danger">{report.total_ng} NG</span> / {report.downtime_minutes} min</td><td>{report.submitted_by}</td><td className="small">{new Date(report.created_at).toLocaleString()}</td>
                                                <td><button className="btn btn-sm btn-outline-info py-0" onClick={() => handleViewReport(report)}><i className="bi bi-eye me-1"></i> View Details</button></td>
                                            </tr>
                                        )) : ( <tr><td colSpan="8" className="text-center py-4">No reports found for the selected criteria.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "approval":
                const approvalQueueLogs = logs.filter(l => l.status === 'Pending Approval');
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center"><i className="bi bi-check-circle-fill me-2 text-danger"></i>Units Awaiting QA Approval<span className="badge bg-danger ms-3">{approvalQueueLogs.length}</span></h3>
                        <p className="text-muted">These units require review, typically because they were manually flagged for inspection or reopened from a final status (Completed/No Good).</p>
                        <div className="card shadow-sm mt-4">
                            <div className="card-header bg-warning text-dark fw-bold">Approval Queue</div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark"><tr><th>ID</th><th>Station</th><th>Serial No.</th><th>Model/Rev</th><th>Status</th><th>Remarks</th><th>Timestamp</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {approvalQueueLogs.length > 0 ? approvalQueueLogs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.id}</td><td><span className="badge bg-secondary">{log.station}</span></td><td className="fw-bold">{log.device_serial_no}</td><td>{log.model} (Rev: {log.revision})</td><td><span className="badge bg-info text-dark">{log.status}</span></td><td>{log.remarks || 'No remarks.'}</td><td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                                <td><button className="btn btn-sm btn-success py-0" onClick={() => handleApproveUnit(log.id, log)}><i className="bi bi-check"></i> Approve (In Progress)</button></td>
                                            </tr>
                                        )) : ( <tr><td colSpan="8" className="text-center py-4">No units currently require approval.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case "manage_account": 
                return (
                    <div>
                        <h3 className="mb-4 d-flex align-items-center"><i className="bi bi-person-gear me-2 text-danger"></i>Manage Users</h3>
                        <p className="text-muted">Create, edit, and view system users.</p>
                        <div className="d-flex justify-content-end mb-3"><button className="btn btn-danger" onClick={handleAddUser}><i className="bi bi-person-plus me-2"></i> Add New User</button></div>
                        <div className="card shadow-sm">
                            <div className="card-header bg-white fw-bold">System User List ({userList.length} total)</div>
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 small">
                                    <thead className="table-dark"><tr><th>ID</th><th>User / Avatar</th><th>Full Name</th><th>Role</th><th>Station</th><th>Created At</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {userList.length > 0 ? userList.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td className="d-flex align-items-center">
                                                    <img src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH} alt={`${u.username} avatar`} className="rounded-circle me-2" style={{ width: '30px', height: '30px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }} />
                                                    <strong>{u.username}</strong>
                                                </td>
                                                <td>{u.full_name}</td>
                                                <td><span className={`badge ${u.role === 'Administrator' ? 'bg-danger' : u.role === 'Operator' ? 'bg-primary' : 'bg-warning text-dark'}`}>{u.role}</span></td>
                                                <td>{u.station || 'N/A'}</td>
                                                <td className="small">{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary py-0 me-1" onClick={() => handleViewUser(u)}><i className="bi bi-eye"></i> View</button>
                                                    <button className="btn btn-sm btn-outline-secondary py-0" onClick={() => handleConfirmDeleteUser(u)} disabled={u.id === 1}><i className="bi bi-trash"></i> Delete</button>
                                                </td>
                                            </tr>
                                        )) : ( <tr><td colSpan="7" className="text-center py-4">No users found.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* RENDER THE VIEW MODAL HERE IF IT IS OPEN */}
                        {showViewModal && <ViewUserModal />} 
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