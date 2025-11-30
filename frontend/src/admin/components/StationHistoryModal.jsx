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
            // 1. Search by Assembly No (Case Insensitive)
            const assembly = log.assembly_no ? log.assembly_no.toLowerCase() : '';
            const search = searchTerm.toLowerCase();
            const matchesSearch = assembly.includes(search);

            // 2. Filter by Date Range
            let matchesDate = true;
            if (startDate || endDate) {
                // Create Date object from log timestamp (ignoring time for comparison)
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

    // Helper to reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title d-flex align-items-center">
                            <i className="bi bi-clock-history me-2"></i> 
                            History Logs: <span className="text-warning ms-2">{formatStationName(stationId)}</span>
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* --- FILTER CONTROLS --- */}
                    <div className="modal-body p-0">
                        <div className="bg-light p-3 border-bottom">
                            <div className="row g-2 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted mb-1">Search Assembly No.</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Ex. ASSY-001..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted mb-1">From Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control form-control-sm" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted mb-1">To Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control form-control-sm" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button 
                                        className="btn btn-outline-secondary btn-sm w-100" 
                                        onClick={resetFilters}
                                        title="Clear all filters"
                                    >
                                        <i className="bi bi-x-circle me-1"></i> Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- TABLE CONTENT --- */}
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Syncing real-time logs...</p>
                            </div>
                        )}
                        
                        {error && <div className="alert alert-danger m-3"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}
                        
                        {!loading && !error && (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover mb-0 small text-center align-middle">
                                    <thead className="table-secondary sticky-top">
                                        <tr>
                                            <th>ID</th>
                                            <th>MODEL</th>
                                            <th>ASSEMBLY</th>
                                            <th>ACTION</th>
                                            <th>STATION</th>
                                            <th>STATUS</th>
                                            <th>USER</th>
                                            <th>TIME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map((log, index) => (
                                                <tr key={index}>
                                                    <td className="fw-bold text-muted">{log.unit_id || log.id}</td>
                                                    <td className="fw-bold">{log.model}</td>
                                                    <td className="font-monospace text-primary bg-light px-2 rounded">
                                                        {log.assembly_no}
                                                    </td>
                                                    <td className="text-uppercase fw-bold text-secondary">{log.action_type || 'UPDATE'}</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {log.station_name || log.station}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            (log.status_after || log.status) === 'Completed' ? 'bg-success' : 
                                                            (log.status_after || log.status) === 'No Good (NG)' ? 'bg-danger' : 
                                                            'bg-warning text-dark'
                                                        }`}>
                                                            {log.status_after || log.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted fst-italic">{log.action_by || log.username || 'System'}</td>
                                                    <td>{new Date(log.timestamp || log.created_at).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-5 text-muted">
                                                    <i className="bi bi-search fs-1 d-block mb-2 text-secondary"></i>
                                                    No history found matching your filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer bg-light d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Showing <strong>{filteredLogs.length}</strong> of <strong>{historyLogs.length}</strong> records
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};