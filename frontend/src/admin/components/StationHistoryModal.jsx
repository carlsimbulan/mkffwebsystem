import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const StationHistoryModal = ({ stationId, onClose, HISTORY_ENDPOINT }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- NEW STATES FOR FILTERING ---
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // FIX: Helper function to ensure format is "Station X"
    const formatStationName = (rawName) => {
        if (!rawName) return '';
        return rawName.replace(/\s+/g, '').replace(/Station/i, 'Station ');
    };

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            
            const apiStationName = formatStationName(stationId);
            console.log(`Fetching history for: ${apiStationName} (Original: ${stationId})`);

            try {
                const res = await axios.get(HISTORY_ENDPOINT, {
                    params: { station: apiStationName }
                });
                
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setHistoryLogs(data);
                
            } catch (err) {
                console.error("History fetch error:", err);
                setError("Failed to load history.");
            } finally {
                setLoading(false);
            }
        };

        if (stationId) {
            fetchHistory();
        }
    }, [stationId, HISTORY_ENDPOINT]);

    

    // --- FILTERING LOGIC ---
    const filteredLogs = useMemo(() => {
        return historyLogs.filter(log => {
            const assembly = log.assembly_no ? log.assembly_no.toLowerCase() : '';
            const search = searchTerm.toLowerCase();
            const matchesSearch = assembly.includes(search);

            let matchesDate = true;
            if (startDate || endDate) {
                const logDate = new Date(log.timestamp || log.created_at);
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

    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055, backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{borderRadius: '16px'}}>
                    
                    {/* --- HEADER --- */}
                    <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <div>
                            <h5 className="modal-title fw-bold d-flex align-items-center">
                                <i className="bi bi-clock-history me-2 bg-white text-primary rounded-circle p-1" style={{fontSize: '1rem'}}></i> 
                                Station History
                            </h5>
                            <div className="text-white-50 small mt-1">
                                Viewing logs for <span className="text-white fw-bold">{formatStationName(stationId)}</span>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* --- FILTER CONTROLS --- */}
                    <div className="modal-body p-0 bg-light">
                        <div className="bg-white p-3 m-3 rounded shadow-sm border">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted mb-1" style={{fontSize: '0.7rem'}}>Search Assembly</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light border-start-0 ps-0" 
                                            placeholder="e.g. ASSY-001..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-uppercase text-muted mb-1" style={{fontSize: '0.7rem'}}>Date Range</label>
                                    <div className="input-group">
                                        <input type="date" className="form-control bg-light" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        <span className="input-group-text bg-light text-muted border-start-0 border-end-0">-</span>
                                        <input type="date" className="form-control bg-light" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-5 d-flex justify-content-end align-items-center gap-2">
                                     {/* Summary Badge */}
                                     <div className="d-none d-lg-block text-muted small me-2">
                                        Found <span className="fw-bold text-dark">{filteredLogs.length}</span> records
                                     </div>
                                    <button 
                                        className="btn btn-light border text-muted hover-danger" 
                                        onClick={resetFilters}
                                        title="Reset Filters"
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- TABLE CONTENT --- */}
                        <div className="px-3 pb-3">
                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                                {loading && (
                                    <div className="text-center py-5 bg-white">
                                        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
                                        <p className="mt-3 text-muted fw-bold">Loading records...</p>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="alert alert-danger m-4 border-0 shadow-sm d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                                        <div>
                                            <div className="fw-bold">Error Loading Data</div>
                                            <div className="small">{error}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {!loading && !error && (
                                    <div className="table-responsive" style={{maxHeight: '500px'}}>
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="bg-light sticky-top" style={{zIndex: 5}}>
                                                <tr>
                                                    <th className="py-3 ps-4 text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>ID / Model</th>
                                                    <th className="py-3 text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>Assembly No.</th>
                                                    <th className="py-3 text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>Action</th>
                                                    <th className="py-3 text-center text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>Status</th>
                                                    <th className="py-3 text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>User</th>
                                                    <th className="py-3 text-end pe-4 text-uppercase text-secondary small" style={{letterSpacing: '0.5px'}}>Timestamp</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLogs.length > 0 ? (
                                                    filteredLogs.map((log, index) => {
                                                        const status = log.status_after || log.status;
                                                        const isSuccess = status === 'Completed' || status === 'OK';
                                                        const isError = status === 'No Good (NG)' || status === 'Error';
                                                        
                                                        return (
                                                            <tr key={index}>
                                                                <td className="ps-4">
                                                                    <div className="fw-bold text-dark">{log.model}</div>
                                                                    <div className="text-muted small" style={{fontSize: '0.75rem'}}>ID: #{log.unit_id || log.id}</div>
                                                                </td>
                                                                <td>
                                                                    <span className="font-monospace bg-light border px-2 py-1 rounded text-dark fw-bold" style={{fontSize: '0.85rem'}}>
                                                                        {log.assembly_no}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 px-2 py-1 fw-normal text-uppercase" style={{fontSize: '0.7rem'}}>
                                                                        {log.action_type || 'UPDATE'}
                                                                    </span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className={`badge rounded-pill px-3 py-2 fw-bold ${
                                                                        isSuccess ? 'bg-success bg-opacity-10 text-success' : 
                                                                        isError ? 'bg-danger bg-opacity-10 text-danger' : 
                                                                        'bg-warning bg-opacity-10 text-warning text-dark'
                                                                    }`}>
                                                                        {isSuccess && <i className="bi bi-check-circle-fill me-1"></i>}
                                                                        {isError && <i className="bi bi-x-circle-fill me-1"></i>}
                                                                        {!isSuccess && !isError && <i className="bi bi-hourglass-split me-1"></i>}
                                                                        {status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-2" style={{width: 32, height: 32}}>
                                                                            <i className="bi bi-person-fill"></i>
                                                                        </div>
                                                                        <span className="text-dark small fw-bold">{log.action_by || log.username || 'System'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    <div className="fw-bold text-dark small">
                                                                        {new Date(log.timestamp || log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </div>
                                                                    <div className="text-muted" style={{fontSize: '0.7rem'}}>
                                                                        {new Date(log.timestamp || log.created_at).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-5">
                                                            <div className="opacity-25 mb-3">
                                                                <i className="bi bi-clipboard-x fs-1"></i>
                                                            </div>
                                                            <h6 className="text-muted fw-bold">No logs found</h6>
                                                            <p className="text-muted small mb-0">Try adjusting your filters or search term.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="modal-footer border-top-0 bg-light">
                        <button 
                            type="button" 
                            className="btn btn-secondary px-4 fw-bold rounded-pill" 
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hover-danger:hover {
                    background-color: #dc3545 !important;
                    color: white !important;
                    border-color: #dc3545 !important;
                }
                .sticky-top { top: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                /* Custom Scrollbar for the table */
                .table-responsive::-webkit-scrollbar { width: 6px; height: 6px; }
                .table-responsive::-webkit-scrollbar-track { background: #f1f1f1; }
                .table-responsive::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                .table-responsive::-webkit-scrollbar-thumb:hover { background: #bbb; }
            `}</style>
        </div>
    );
};