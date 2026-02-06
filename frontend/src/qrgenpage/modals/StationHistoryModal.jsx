import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
 
const HISTORY_ENDPOINT = "http://localhost/mkffwebsystem/backend/api/unit_history.php";

// Fallback utility function for operator name lookup
const getOperatorDisplayName = (actionBy, userFullName) => {
    // Prioritize the user_full_name from the JOIN query
    if (userFullName && userFullName.trim() !== '') {
        return userFullName;
    }
    
    if (!actionBy) return 'System';
    if (actionBy.toLowerCase() === 'system') return 'System';
    
    // Try to use global function
    if (window.getOperatorDisplayName) {
        return window.getOperatorDisplayName(actionBy);
    }
    
    // Fallback: try to use cached data directly
    const users = window.cachedUsersData || [];
    const operatorMap = {};
    users.forEach(user => {
        if (user.username && user.full_name) {
            operatorMap[user.username] = user.full_name;
        }
        if (user.email && user.full_name) {
            operatorMap[user.email] = user.full_name;
        }
        if (user.id && user.full_name) {
            operatorMap[user.id.toString()] = user.full_name;
        }
    });
    
    return operatorMap[actionBy] || actionBy;
};
 
const getTodayDate = () => new Date().toISOString().split('T')[0];
 
const StationHistoryModal = ({ stationId, onClose, user, highlightedUnitId }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    const [filterAssemblyNo, setFilterAssemblyNo] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState(getTodayDate());
 
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            // Try with space first (e.g., "Station 1")
            const withSpace = stationId.replace(/Station(\d+)/i, 'Station $1');
            const noSpace = stationId.replace(/\s+/g, ''); // e.g., "Station1"
            
            let response = await axios.get(HISTORY_ENDPOINT, { params: { station: withSpace } });
            let data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            
            // Retry without space if no data found
            if (data.length === 0) {
                response = await axios.get(HISTORY_ENDPOINT, { params: { station: noSpace } });
                data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            }
            
            // Sort by timestamp descending (newest first)
            const sortedLogs = data.sort((a, b) => 
                new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
            );
            
            setHistoryLogs(sortedLogs);
        } catch (err) {
            setHistoryError(`Failed to fetch history: ${err.message}.`);
        } finally {
            setHistoryLoading(false);
        }
    }, [stationId]);
 
    useEffect(() => { fetchHistory(); }, [fetchHistory]);
 
    const filteredLogs = useMemo(() => {
        let logs = historyLogs;
        if (filterAssemblyNo) {
            const search = filterAssemblyNo.toLowerCase();
            logs = logs.filter(log => log.assembly_no?.toLowerCase().includes(search));
        }
        if (filterStartDate || filterEndDate) {
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp || log.created_at);
                logDate.setHours(0, 0, 0, 0);
                let matchesDate = true;
                if (filterStartDate) {
                    const start = new Date(filterStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (logDate < start) matchesDate = false;
                }
                if (filterEndDate) {
                    const end = new Date(filterEndDate);
                    end.setHours(0, 0, 0, 0);
                    end.setDate(end.getDate() + 1); 
                    if (logDate >= end) matchesDate = false;
                }
                return matchesDate;
            });
        }
        return logs;
    }, [historyLogs, filterAssemblyNo, filterStartDate, filterEndDate]);
 
    const getStatusClass = (status) => {
        if (status?.includes('Completed') || status?.includes('OK')) return 'bg-success bg-opacity-10 text-success';
        if (status?.includes('No Good') || status?.includes('Error') || status?.includes('Failed')) return 'bg-danger bg-opacity-10 text-danger';
        if (status?.includes('Progress') || status?.includes('Pending')) return 'bg-warning bg-opacity-10 text-warning text-dark';
        return 'bg-secondary bg-opacity-10 text-secondary';
    };
 
    return (
        <div className="modal d-block animate-in fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <style>{`
                .highlight-pulse { 
                    animation: highlightPulse 2s ease-in-out infinite;
                    background-color: #ffebee !important;
                    border-left: 4px solid #ef4444 !important;
                }
                @keyframes highlightPulse {
                    0% { background-color: #ffebee; }
                    50% { background-color: #ffcdd2; }
                    100% { background-color: #ffebee; }
                }
            `}</style>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                    <div className="modal-header bg-dark text-white border-0">
                        <h5 className="modal-title fw-bold"><i className="bi bi-clock-history me-2"></i> History Logs for: {stationId}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="card mb-4 p-3 border-0 bg-light">
                            <div className="row g-3 align-items-center small">
                                <div className="col-md-4">
                                    <label className="form-label mb-0 fw-bold">Assembly No. Search:</label>
                                    <input type="text" className="form-control form-control-sm" value={filterAssemblyNo} onChange={(e) => setFilterAssemblyNo(e.target.value)} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label mb-0 fw-bold">Date From:</label>
                                    <input type="date" className="form-control form-control-sm" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label mb-0 fw-bold">Date To:</label>
                                    <input type="date" className="form-control form-control-sm" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} max={getTodayDate()} />
                                </div>
                                <div className="col-md-2 d-flex justify-content-end">
                                    <button className="btn btn-sm btn-outline-secondary w-100 mt-3" onClick={() => { setFilterAssemblyNo(''); setFilterStartDate(''); setFilterEndDate(getTodayDate()); }}>Clear Filters</button>
                                </div>
                            </div>
                        </div>
                        {historyLoading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : (
                            <div className="table-responsive border rounded-3 overflow-hidden" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover table-striped mb-0 align-middle small">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            <th>Unit / Model</th><th>Assembly No.</th><th>Action Type</th><th>Station</th><th className="text-center">Status After</th><th>User</th><th className="text-end pe-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map(log => (
                                            <tr key={log.history_id || log.id} className={log.unit_id === highlightedUnitId ? "highlight-pulse" : ""}>
                                                <td className="ps-3 fw-bold">{log.model || 'N/A'}</td>
                                                <td className="text-primary fw-bold">{log.assembly_no}</td>
                                                <td>{log.action_type || 'UPDATE'}</td>
                                                <td className="fw-bold">{log.station_name || log.station || 'N/A'}</td>
                                                <td className="text-center"><span className={`badge rounded-pill px-3 py-2 ${getStatusClass(log.status_after)}`}>{log.status_after}</span></td>
                                                <td>
                                                    {getOperatorDisplayName(log.action_by, log.user_full_name)}
                                                </td>
                                                <td className="text-end pe-3 small">{new Date(log.timestamp || log.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer border-0">
                        <button className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default StationHistoryModal;