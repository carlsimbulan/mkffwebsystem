import React, { useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NoGoodUnits = ({ logs, handleEditClick }) => {
    // Filter lahat ng logs na "No Good" o "NG"
    const allNoGoodLogs = useMemo(() => {
        return logs.filter(log => {
            const status = log.status?.toLowerCase() || '';
            return status.includes('no good') || status === 'ng';
        });
    }, [logs]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="container-fluid px-0 py-3 animate-in fade-in">
            <style>
                {`
                .ng-container {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                .table-ng { font-size: 0.8rem; width: 100%; border-collapse: separate; border-spacing: 0; }
                .table-ng thead th {
                    background: #f1f5f9;
                    color: #475569;
                    font-weight: 800;
                    text-transform: uppercase;
                    font-size: 0.65rem;
                    letter-spacing: 0.05em;
                    padding: 14px 10px;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                }
                .table-ng tbody td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    color: #334155;
                }
                .table-ng tbody tr:hover { background-color: #f8fafc; }
                
                .mono-box {
                    font-family: 'JetBrains Mono', monospace;
                    background: #f8fafc;
                    padding: 2px 5px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                }

                .btn-manage {
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-weight: 700;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    transition: all 0.2s;
                }
                .btn-manage:hover { background: #334155; }

                .summary-header {
                    padding: 20px;
                    background: #fff;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                `}
            </style>

            <div className="ng-container">
                {/* Header Section */}
                <div className="summary-header">
                    <div>
                        <h5 className="fw-bold mb-0 text-danger">
                            <i className="bi bi-Exclamation-triangle-fill me-2"></i>
                            NO GOOD (NG) LOGS REGISTRY
                        </h5>
                        <small className="text-muted">Master list of all non-conforming units across stations</small>
                    </div>
                    <div className="text-end">
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                            Total Units: {allNoGoodLogs.length}
                        </span>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-ng">
                        <thead>
                            <tr>
                                <th>MODEL</th>
                                <th>REVISION</th>
                                <th>BASE UNIT</th>
                                <th>ASSEMBLY</th>
                                <th>DEVICE SERIAL</th>
                                <th>ACCESSORY</th>
                                <th>STATUS</th>
                                <th>REMARKS</th>
                                <th>TIMESTAMP</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allNoGoodLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-5 text-muted">
                                        <i className="bi bi-shield-check fs-2 d-block mb-2 opacity-25"></i>
                                        No NG units found in the records.
                                    </td>
                                </tr>
                            ) : (
                                allNoGoodLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="fw-bold">{log.model}</td>
                                        <td className="text-muted">{log.revision || '---'}</td>
                                        <td><span className="mono-box">{log.base_unit_kitting_no || '---'}</span></td>
                                        <td><span className="mono-box">{log.assembly_no}</span></td>
                                        <td><span className="mono-box text-primary fw-bold">{log.device_serial_no}</span></td>
                                        <td><span className="mono-box">{log.accessory_kitting_no || '---'}</span></td>
                                        <td>
                                            <span className="text-danger fw-bold small">
                                                <i className="bi bi-x-circle-fill me-1"></i>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="small text-muted" style={{ maxWidth: '150px' }}>
                                            <div className="text-truncate" title={log.remarks}>
                                                {log.remarks || 'No remarks'}
                                            </div>
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {formatTimestamp(log.updated_at || log.created_at)}
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn-manage"
                                                onClick={() => handleEditClick(log)}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NoGoodUnits;