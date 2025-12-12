import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Helper function to render status badges
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Completed':
            return 'bg-success';
        case 'No Good (NG)':
            return 'bg-danger';
        case 'In Progress':
            return 'bg-primary';
        case 'Pending Approval':
            return 'bg-warning text-dark';
        default:
            return 'bg-secondary';
    }
};


// --- UnitHistoryTable Component (Unit ID Removed) ---
const UnitHistoryTable = ({ historyLogs, loading, error }) => {
    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Loading history...</p></div>;
    if (error) return <div className="alert alert-danger shadow-sm mt-3">Error: {error}</div>;
    if (historyLogs.length === 0) return <div className="text-center py-5 bg-light border rounded-3 border-dashed text-muted fw-bold">No History Logs Found Matching Current Filters.</div>;

    return (
        <div className="table-responsive shadow-sm rounded border">
            <table className="table table-hover table-striped mb-0 small">
                <thead className="table-primary sticky-top">
                    <tr>
                        {/* ❌ REMOVED: <th className="py-2">Unit ID</th> */}
                        <th className="py-2">Model</th>
                        <th className="py-2">Assembly No</th>
                        <th className="py-2">Action</th>
                        <th className="py-2">Station</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">User</th>
                        <th className="py-2">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {historyLogs.map((log) => (
                        <tr key={log.history_id}>
                            {/* ❌ REMOVED: <td className="text-muted">{log.unit_id}</td> */}
                            <td className="fw-bold text-dark">{log.model || '-'}</td>
                            <td className="font-monospace text-primary">{log.assembly_no || '-'}</td>
                            <td className="text-capitalize">{log.action_type}</td>
                            <td>{log.station_name}</td>
                            <td><span className={`badge ${getStatusBadgeClass(log.status_after)} fw-bold`}>{log.status_after}</span></td>
                            <td>{log.action_by}</td>
                            <td className="text-nowrap" style={{fontSize: '0.75rem'}}>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- UnitHistoryLog Component (With Search and Filter) ---
export function UnitHistoryLog({ currentStation, historyList, listLoading, listError }) {
    const [searchAssembly, setSearchAssembly] = useState('');
    const [filterDate, setFilterDate] = useState(''); // Stores the selected date string

    // 1. Filter the history list based on search and date criteria
    const filteredHistory = useMemo(() => {
        if (!historyList) return [];

        return historyList.filter(log => {
            const matchesAssembly = log.assembly_no 
                ? log.assembly_no.toLowerCase().includes(searchAssembly.toLowerCase())
                : false;
            
            const matchesDate = filterDate
                ? new Date(log.timestamp).toISOString().split('T')[0] === filterDate
                : true; // If no filterDate is set, it always matches

            return matchesAssembly && matchesDate;
        });
    }, [historyList, searchAssembly, filterDate]);

    return (
        <div className="animate-in fade-in pb-4">
            <h4 className="mb-4 fw-bold text-dark border-bottom pb-2">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Processing History for <span className="text-primary">{currentStation || 'All Stations'}</span>
            </h4>

            {/* --- Filter Bar --- */}
            <div className="card shadow-sm mb-4 border-0">
                <div className="card-body py-3 d-flex align-items-center gap-3">
                    
                    {/* Assembly No Search */}
                    <div className="flex-grow-1">
                        <label htmlFor="assemblySearch" className="form-label small fw-bold text-muted mb-1">Search Assembly No.</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text"><i className="bi bi-search"></i></span>
                            <input
                                id="assemblySearch"
                                type="text"
                                className="form-control"
                                placeholder="Enter assembly number..."
                                value={searchAssembly}
                                onChange={(e) => setSearchAssembly(e.target.value)}
                            />
                            {searchAssembly && (
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchAssembly('')}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div>
                        <label htmlFor="dateFilter" className="form-label small fw-bold text-muted mb-1">Filter by Date</label>
                        <input
                            id="dateFilter"
                            type="date"
                            className="form-control form-control-sm"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    
                    {/* Clear Filters Button */}
                    <div className="pt-3">
                        <button 
                            className="btn btn-sm btn-outline-secondary" 
                            onClick={() => {
                                setSearchAssembly('');
                                setFilterDate('');
                            }}
                            disabled={!searchAssembly && !filterDate}
                        >
                            <i className="bi bi-eraser me-1"></i> Clear Filters
                        </button>
                    </div>

                </div>
            </div>
            {/* --- End Filter Bar --- */}

            <h5 className="mb-3 fw-bold">
                History ({filteredHistory.length} records)
            </h5>

            <UnitHistoryTable 
                historyLogs={filteredHistory} 
                loading={listLoading} 
                error={listError} 
            />
        </div>
    );
}