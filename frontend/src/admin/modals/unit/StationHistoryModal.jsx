import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Fallback utility function for operator name lookup
const getOperatorDisplayName = (actionBy, userFullName) => {
    // Prioritize the user_full_name from the JOIN query
    if (userFullName && userFullName.trim() !== '') {
        return userFullName;
    }
    
    if (!actionBy) return 'SYSTEM';
    if (actionBy.toLowerCase() === 'system') return 'SYSTEM';
    
    // Try to use global function first
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

export const StationHistoryModal = ({ stationId, onClose, HISTORY_ENDPOINT, highlightedUnitId }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // PERFORMANCE FIX: TABLE_HEADERS as constant outside render
    const TABLE_HEADERS = ["MODEL", "ASSEMBLY", "TYPE", "STATION", "STATUS AFTER", "ACTION BY", "TIMESTAMP"];

    useEffect(() => {
        const fetchHistory = async () => {
            if (!stationId) return;
            setLoading(true);
            
            const withSpace = stationId.replace(/Station(\d+)/i, 'Station $1'); 
            const noSpace = stationId.replace(/\s+/g, ''); 

            try {
                const res = await axios.get(HISTORY_ENDPOINT, { params: { station: withSpace } });
                let data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                
                if (data.length === 0) {
                    const retryRes = await axios.get(HISTORY_ENDPOINT, { params: { station: noSpace } });
                    data = Array.isArray(retryRes.data) ? retryRes.data : (retryRes.data.data || []);
                }

                // PERFORMANCE FIX: Sort once upon fetch, not during render
                const sortedData = data.sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
                setHistoryLogs(sortedData);
                
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [stationId, HISTORY_ENDPOINT]);

    // PERFORMANCE FIX: Optimized Filter with Slice
    const filteredLogs = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
        const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null;

        const filtered = historyLogs.filter(log => {
            const assembly = (log.assembly_no || '').toLowerCase();
            const model = (log.model || '').toLowerCase();
            const matchesSearch = assembly.includes(term) || model.includes(term);

            if (!matchesSearch) return false;

            if (start || end) {
                const logTime = new Date(log.timestamp || log.created_at).getTime();
                if (start && logTime < start) return false;
                if (end && logTime > end) return false;
            }
            return true;
        });

        // PERFORMANCE FIX: Limit rendered rows to 100 for immediate responsiveness
        return filtered.slice(0, 100); 
    }, [historyLogs, searchTerm, startDate, endDate]);

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 1055 }}>
            <div className="modal-dialog modal-fullscreen p-2"> {/* Reduced padding */}
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    
                    <div className="modal-header border-bottom py-2 px-4 bg-white">
                        <div>
                            <h5 className="fw-bold text-dark mb-0">STATION BACKTRACK</h5>
                            <small className="text-muted">{stationId} • Showing latest {filteredLogs.length} records</small>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-0 d-flex flex-column bg-white">
                        {/* Filters Container */}
                        <div className="bg-light border-bottom p-3">
                            <div className="row g-2 align-items-center">
                                <div className="col-md-4">
                                    <input type="text" className="form-control form-control-sm shadow-none" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="col-md-5 d-flex align-items-center gap-2">
                                    <input type="date" className="form-control form-control-sm shadow-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    <input type="date" className="form-control form-control-sm shadow-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                                <div className="col-md-3 text-end">
                                    <button className="btn btn-sm btn-link text-danger fw-bold text-decoration-none" onClick={() => {setSearchTerm(''); setStartDate(''); setEndDate('');}}>RESET</button>
                                </div>
                            </div>
                        </div>

                        {/* Table Container - PERFORMANCE FIX: will-change for GPU acceleration */}
                        <div className="flex-grow-1 overflow-auto" style={{ willChange: 'transform' }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-border-sm"></div>
                                </div>
                            ) : (
                                <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                                    <thead className="bg-dark text-white sticky-top">
                                        <tr>
                                            {TABLE_HEADERS.map(h => <th key={h} className="py-2 px-3 border-0">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log, i) => (
                                            <tr key={i}>
                                                <td className="ps-3 fw-bold">{log.model}</td>
                                                <td><code className="text-primary">{log.assembly_no}</code></td>
                                                <td className="small">{log.action_type || 'UPDATE'}</td>
                                                <td>{log.station_name || log.station}</td>
                                                <td>
                                                    <span className={`badge rounded-pill fw-normal ${
                                                        log.status_after?.includes('Completed') || log.status?.includes('Completed') 
                                                            ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' 
                                                            : log.status_after?.includes('NG') || log.status?.includes('NG') 
                                                            ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' 
                                                            : log.status_after?.includes('In Progress') || log.status?.includes('In Progress')
                                                            ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
                                                            : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                                                    }`} style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                        {log.status_after || log.status}
                                                    </span>
                                                </td>
                                                <td className="small fw-bold">
                                                    {getOperatorDisplayName(log.action_by, log.user_full_name)}
                                                </td>
                                                <td className="small">
                                                    {new Date(log.timestamp || log.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer bg-light py-2">
                        <button className="btn btn-dark btn-sm px-4 rounded-pill" onClick={onClose}>CLOSE</button>
                    </div>
                </div>
            </div>
        </div>
    );
};