import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Fallback utility function for operator name lookup
const getOperatorDisplayName = (actionBy) => {
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

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Completed': return 'bg-success-subtle text-success border border-success-subtle';
        case 'No Good (NG)': return 'bg-danger-subtle text-danger border border-danger-subtle';
        case 'In Progress': return 'bg-primary-subtle text-primary border border-primary-subtle';
        case 'Pending Approval': return 'bg-warning-subtle text-warning border border-warning-subtle';
        default: return 'bg-light text-secondary border';
    }
};

const UnitHistoryTable = ({ historyLogs, loading, error }) => {
    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <p className="mt-2 text-muted small fw-bold">RETRIEVING ARCHIVES...</p>
        </div>
    );
    
    if (error) return (
        <div className="alert border-danger bg-white text-danger small fw-bold mt-3">
            <i className="bi bi-exclamation-octagon-fill me-2"></i>ERROR: {error}
        </div>
    );

    if (historyLogs.length === 0) return (
        <div className="text-center py-5 bg-light border border-dashed rounded-3 text-muted small fw-bold uppercase tracking-wider">
            No historical records found matching the criteria.
        </div>
    );

    return (
        <div className="border rounded-3 overflow-hidden">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="bg-light">
                        <tr>
                            <th className="py-3 ps-4 text-muted fw-bold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Model</th>
                            <th className="py-3 text-muted fw-bold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Assembly No</th>
                            <th className="py-3 text-muted fw-bold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Action</th>
                            <th className="py-3 text-muted fw-bold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Station</th>
                            <th className="py-3 text-muted fw-bold uppercase tracking-wider text-center" style={{ fontSize: '0.7rem' }}>Status</th>
                            <th className="py-3 text-muted fw-bold uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>User</th>
                            <th className="py-3 pe-4 text-muted fw-bold uppercase tracking-wider text-end" style={{ fontSize: '0.7rem' }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="border-top-0">
                        {historyLogs.map((log) => (
                            <tr key={log.history_id}>
                                <td className="ps-4 fw-bold text-dark">{log.model || '-'}</td>
                                <td><code className="text-primary fw-bold" style={{ fontSize: '0.85rem' }}>{log.assembly_no || '-'}</code></td>
                                <td className="text-muted fw-medium small text-uppercase">{log.action_type}</td>
                                <td className="fw-bold">{log.station_name}</td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(log.status_after)}`} style={{ fontSize: '0.65rem' }}>
                                        {log.status_after}
                                    </span>
                                </td>
                                <td className="small fw-bold">
                                    {getOperatorDisplayName(log.action_by)}
                                </td>
                                <td className="pe-4 text-end text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                    {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export function UnitHistoryLog({ currentStation, historyList, listLoading, listError }) {
    const [searchAssembly, setSearchAssembly] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const filteredHistory = useMemo(() => {
        if (!historyList) return [];
        return historyList.filter(log => {
            const matchesAssembly = log.assembly_no 
                ? log.assembly_no.toLowerCase().includes(searchAssembly.toLowerCase())
                : false;
            const matchesDate = filterDate
                ? new Date(log.timestamp).toISOString().split('T')[0] === filterDate
                : true;
            return matchesAssembly && matchesDate;
        });
    }, [historyList, searchAssembly, filterDate]);

    return (
        <div className="container-fluid px-0 py-2 animate-in fade-in">
            <style>{`
                .filter-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.25rem;
                }
                .label-caps {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .input-flat {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    font-size: 0.85rem;
                    border-radius: 6px;
                }
                .input-flat:focus {
                    background: #ffffff;
                    border-color: #3b82f6;
                    box-shadow: none;
                }
                .btn-reset {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 8px 16px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-0 tracking-tight">Processing History</h4>
                    <p className="text-muted small mb-0 fw-medium">
                        Auditing trail for <span className="text-primary fw-bold">{currentStation || 'All Stations'}</span>
                    </p>
                </div>
                <span className="badge bg-dark rounded-pill px-3 py-2" style={{ fontSize: '0.7rem' }}>
                    {filteredHistory.length} ENTRIES FOUND
                </span>
            </div>

            {/* FILTER BAR */}
            <div className="filter-card mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                        <label className="label-caps">Search Assembly ID</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control input-flat border-start-0 ps-0"
                                placeholder="Enter serial number..."
                                value={searchAssembly}
                                onChange={(e) => setSearchAssembly(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-3">
                        <label className="label-caps">Filter by Date</label>
                        <input
                            type="date"
                            className="form-control form-control-sm input-flat"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    
                    <div className="col-md-4 text-end">
                        <button 
                            className="btn btn-sm btn-light border btn-reset text-muted" 
                            onClick={() => { setSearchAssembly(''); setFilterDate(''); }}
                            disabled={!searchAssembly && !filterDate}
                        >
                            <i className="bi bi-eraser-fill me-1"></i> Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <UnitHistoryTable 
                historyLogs={filteredHistory} 
                loading={listLoading} 
                error={listError} 
            />
        </div>
    );
}