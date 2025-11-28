import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

// --- NEW: Station History Modal Component ---
export const StationHistoryModal = ({ stationId, onClose, HISTORY_ENDPOINT }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch history logs for the given station
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch logs, passing the station ID as a query parameter
                const response = await axios.get(HISTORY_ENDPOINT, {
                    params: { station: stationId }
                });
                if (Array.isArray(response.data)) {
                    // Sort logs by timestamp descending (newest first)
                    setHistoryLogs(response.data);
                } else {
                    setHistoryLogs([]);
                    setError("Received non-array response from history endpoint. Please check PHP output.");
                }
            } catch (err) {
                console.error("Error fetching station history:", err);
                setError(err.response?.data?.message || "Failed to fetch unit history. Check backend (unit_history.php).");
            } finally {
                setLoading(false);
            }
        };

        if (stationId) {
            fetchHistory();
        }
    }, [stationId, HISTORY_ENDPOINT]);

    if (!stationId) return null;

    // Helper function to render status badges
    const getStatusBadge = (status) => {
        let className = 'bg-secondary';
        if (status === 'Completed') className = 'bg-success';
        else if (status === 'No Good (NG)') className = 'bg-danger';
        else if (status === 'In Progress') className = 'bg-primary';
        else if (status === 'Pending Approval') className = 'bg-warning text-dark';
        
        return <span className={`badge ${className}`}>{status}</span>;
    };
    
    // Helper function to render Action Type badges
    const getActionTypeBadge = (action) => {
        let className = 'bg-info text-dark';
        if (action === 'COMPLETED_AT_STATION') className = 'bg-success';
        else if (action === 'APPROVAL_REQUESTED') className = 'bg-warning text-dark';
        else if (action === 'STATUS_UPDATED') className = 'bg-primary';
        
        return <span className={`badge ${className}`}>{action.replace(/_/g, ' ')}</span>;
    };


    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title"><i className="bi bi-clock-history me-2"></i> Unit History for: {stationId}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0">
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status"></div>
                                <p className="mt-3 text-muted">Loading history...</p>
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-danger m-3">{error}</div>
                        )}
                        
                        {!loading && !error && (
                            <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover table-striped mb-0 small">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            <th>H. ID</th>
                                            <th>Unit ID</th>
                                            <th>Action Type</th>
                                            <th>Status After</th>
                                            <th>Action By</th>
                                            <th>Remarks</th>
                                            <th>Timestamp</th>
                                            <th>Station</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyLogs.length > 0 ? historyLogs.map(log => (
                                            <tr key={log.history_id}> 
                                                <td>{log.history_id}</td>
                                                <td>{log.unit_id}</td> 
                                                <td>{getActionTypeBadge(log.action_type)}</td> 
                                                <td>{getStatusBadge(log.status_after)}</td>
                                                <td>{log.action_by || 'System'}</td>
                                                <td>{log.remarks || 'N/A'}</td>
                                                <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td>{log.station_name || stationId}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-4">No historical records found for **{stationId}**.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};