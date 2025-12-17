import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const StationHistoryModal = ({ stationId, onClose, HISTORY_ENDPOINT }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // PINALITAN: Sinunod ang format na MODEL | ASSEMBLY | TYPE | STATION | STATUS AFTER | ACTION BY | TIMESTAMP
    const TABLE_HEADERS = [
        "MODEL", "ASSEMBLY", "TYPE", "STATION", "STATUS AFTER", "ACTION BY", "TIMESTAMP"
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            if (!stationId) return;
            setLoading(true);
            setError(null);
            
            const withSpace = stationId.replace(/Station(\d+)/i, 'Station $1'); 
            const noSpace = stationId.replace(/\s+/g, ''); 

            try {
                const res = await axios.get(HISTORY_ENDPOINT, {
                    params: { station: withSpace }
                });
                
                let data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                
                if (data.length === 0) {
                    const retryRes = await axios.get(HISTORY_ENDPOINT, {
                        params: { station: noSpace }
                    });
                    data = Array.isArray(retryRes.data) ? retryRes.data : (retryRes.data.data || []);
                }

                // I-sort mula pinaka-bago (Latest) pababa
                const sortedData = data.sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
                setHistoryLogs(sortedData);
                
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(`Server Error: Hindi ma-access ang records ng ${stationId}`);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [stationId, HISTORY_ENDPOINT]);

    const filteredLogs = useMemo(() => {
        return historyLogs.filter(log => {
            const assembly = (log.assembly_no || '').toLowerCase();
            const model = (log.model || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            const matchesSearch = assembly.includes(search) || model.includes(search);

            let matchesDate = true;
            const logTimestamp = log.timestamp || log.created_at;
            if (logTimestamp) {
                const logDate = new Date(logTimestamp);
                logDate.setHours(0, 0, 0, 0);

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (logDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(0, 0, 0, 0);
                    if (logDate > end) matchesDate = false;
                }
            }
            return matchesSearch && matchesDate;
        });
    }, [historyLogs, searchTerm, startDate, endDate]);

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1055, backdropFilter: 'blur(10px)' }}>
            <div className="modal-dialog modal-fullscreen p-4">
                <div className="modal-content border-0 rounded-4 overflow-hidden shadow-none">
                    
                    <div className="modal-header border-bottom bg-white py-3 px-4">
                        <div>
                            <h4 className="fw-black text-dark mb-0 tracking-tighter">
                                <i className="bi bi-clock-history me-2 text-primary"></i>
                                STATION BACKTRACK
                            </h4>
                            <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="badge bg-primary rounded-pill px-3">{stationId.toUpperCase()}</span>
                                <span className="text-muted small fw-bold">HISTORY LOGS: {filteredLogs.length}</span>
                            </div>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-0 bg-white d-flex flex-column">
                        <div className="bg-light border-bottom p-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                        <input type="text" className="form-control border-start-0 shadow-none bg-white" placeholder="Search Model or Assembly..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-5 d-flex align-items-center gap-2">
                                    <input type="date" className="form-control shadow-none bg-white" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    <span className="fw-bold text-muted small">TO</span>
                                    <input type="date" className="form-control shadow-none bg-white" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                                <div className="col-md-3 text-end">
                                    <button className="btn btn-outline-danger btn-sm fw-bold border-2 px-4 rounded-pill" onClick={() => {setSearchTerm(''); setStartDate(''); setEndDate('');}}>
                                        RESET
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow-1 overflow-auto">
                            {loading ? (
                                <div className="text-center py-5 mt-5">
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <h6 className="fw-bold text-muted">Loading station backtrack...</h6>
                                </div>
                            ) : (
                                <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>
                                    <thead className="bg-dark text-white sticky-top">
                                        <tr>
                                            {TABLE_HEADERS.map(h => <th key={h} className="py-3 px-3 fw-bold small text-uppercase">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                                            <tr key={i} className="border-bottom">
                                                {/* MODEL */}
                                                <td className="ps-3 fw-bold">{log.model}</td>
                                                
                                                {/* ASSEMBLY */}
                                                <td><code className="text-primary fw-bold">{log.assembly_no}</code></td>
                                                
                                                {/* TYPE (Action Type) */}
                                                <td>
                                                    <span className="text-muted small fw-bold">
                                                        {log.action_type || 'UPDATE'}
                                                    </span>
                                                </td>
                                                
                                                {/* STATION */}
                                                <td>{log.station_name || log.station}</td>
                                                
                                                {/* STATUS AFTER */}
                                                <td>
                                                    <span className={`badge rounded-pill px-3 py-1 ${log.status_after?.includes('Completed') || log.status?.includes('Completed') ? 'bg-success-subtle text-success border border-success' : log.status_after?.includes('NG') || log.status?.includes('NG') ? 'bg-danger-subtle text-danger border border-danger' : 'bg-warning-subtle text-warning border border-warning'}`}>
                                                        {log.status_after || log.status}
                                                    </span>
                                                </td>
                                                
                                                {/* ACTION BY */}
                                                <td className="small fw-bold">{log.action_by || log.username || 'SYSTEM'}</td>
                                                
                                                {/* TIMESTAMP */}
                                                <td className="text-muted small">
                                                    <div className="fw-bold text-dark">
                                                        {new Date(log.timestamp || log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div>
                                                        {new Date(log.timestamp || log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5">
                                                    <h6 className="text-muted fw-bold opacity-50">NO HISTORY FOUND</h6>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer bg-light border-top py-2 px-4">
                        <button className="btn btn-dark btn-sm fw-bold px-5 rounded-pill" onClick={onClose}>CLOSE BACKTRACK</button>
                    </div>
                </div>
            </div>
        </div>
    );
};