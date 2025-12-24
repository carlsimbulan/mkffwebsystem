import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NoGoodUnits = ({ logs, handleEditClick }) => {
    const [activeId, setActiveId] = useState(null);

    // Configuration for categories mapped to production stations
    const actionButtons = [
        { id: 'VI_PROCEDURE', label: 'VI Process Flow', color: '#e11d48', icon: 'bi-cpu', match: 'Station 1' },
        { id: 'CUSTOMER_VERIFICATION', label: 'Customer Hold', color: '#f59e0b', icon: 'bi-pause-circle', match: 'Station 2' },
        { id: 'UNIT_TEST_FLOW', label: 'Unit Test Flow', color: '#2563eb', icon: 'bi-gear-wide-connected', match: 'Station 6' },
        { id: 'HI_POT_TEST', label: 'Hi-Pot Test Flow', color: '#7c3aed', icon: 'bi-lightning-charge', match: 'Station 7' },
        { id: 'BURN_IN_TEST', label: 'Burn-In Test Flow', color: '#db2777', icon: 'bi-thermometer-half', match: 'Station 8' },
        { id: 'FINAL_FUNC_TEST', label: 'Final Function Test', color: '#059669', icon: 'bi-check2-all', match: 'Station 11' },
        { id: 'REJECTED_REWORK', label: 'Rework Procedure', color: '#4b5563', icon: 'bi-tools', match: ['Station 9', 'Station 12', 'Station 13'] },
        { id: 'BATCH_SHIPMENT_HOLD', label: 'Shipment Hold', color: '#0f172a', icon: 'bi-truck-flatbed', match: 'Station 15' },
    ];

    // Filter logs for "No Good" status (normalized for case sensitivity)
    const initialNoGoodLogs = useMemo(() => {
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

    const toggleSection = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    return (
        <div className="container-fluid px-0 py-3 animate-in fade-in">
            <style>
                {`
                .ng-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    overflow: hidden;
                    margin-bottom: 12px;
                    transition: all 0.2s ease;
                }
                .ng-card.active {
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                .ng-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 24px;
                    cursor: pointer;
                    user-select: none;
                    background: #fff;
                }
                .ng-header:hover { background: #f8fafc; }
                
                .ng-icon-box {
                    width: 48px; height: 48px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 10px; margin-right: 20px;
                    font-size: 1.4rem;
                }
                .ng-title { 
                    font-weight: 700; color: #334155; margin: 0; font-size: 1.05rem; 
                    letter-spacing: -0.01em;
                }
                .ng-badge {
                    margin-left: auto; font-weight: 700; font-size: 0.8rem;
                    padding: 4px 12px; border-radius: 20px;
                }

                .table-ng { font-size: 0.82rem; width: 100%; border-collapse: separate; border-spacing: 0; }
                .table-ng thead th {
                    background: #f1f5f9;
                    color: #475569;
                    font-weight: 800;
                    text-transform: uppercase;
                    font-size: 0.68rem;
                    letter-spacing: 0.05em;
                    padding: 14px 12px;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                }
                .table-ng tbody td {
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    color: #334155;
                }
                .table-ng tbody tr:hover { background-color: #f8fafc; }
                
                .mono-box {
                    font-family: 'JetBrains Mono', monospace;
                    background: #f1f5f9;
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                }

                .btn-action-rework {
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .btn-action-rework:hover {
                    background: #334155;
                    transform: translateY(-1px);
                }
                .summary-box {
                    background: #fff;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                `}
            </style>

            {/* Header Summary Section */}
            <div className="summary-box mb-4">
                <div>
                    <h4 className="fw-bold text-slate-800 mb-1">NG Action Registry</h4>
                    <p className="text-muted small mb-0">Centralized tracking for non-conforming units across all stations.</p>
                </div>
                <div className="text-end">
                    <span className="text-muted small fw-bold text-uppercase tracking-wider">Total NG Units</span>
                    <h2 className="text-danger fw-black mb-0" style={{ lineHeight: 1 }}>{initialNoGoodLogs.length}</h2>
                </div>
            </div>

            {/* Categorized NG Sections */}
            <div className="row g-0">
                {actionButtons.map((action) => {
                    // Normalize station matching to handle spaces and casing
                    const logsForStation = initialNoGoodLogs.filter(log => {
                        const logStation = log.station?.replace(/\s+/g, '').toLowerCase() || '';
                        
                        if (Array.isArray(action.match)) {
                            return action.match.some(m => 
                                logStation.includes(m.replace(/\s+/g, '').toLowerCase())
                            );
                        }
                        return logStation.includes(action.match.replace(/\s+/g, '').toLowerCase());
                    });

                    const isOpen = activeId === action.id;

                    return (
                        <div key={action.id} className={`ng-card ${isOpen ? 'active' : ''}`}>
                            <div className="ng-header" onClick={() => toggleSection(action.id)}>
                                <div className="ng-icon-box" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                                    <i className={`bi ${action.icon}`}></i>
                                </div>
                                <div>
                                    <p className="ng-title">{action.label}</p>
                                    <span className="text-muted small">Process Category Tracking</span>
                                </div>
                                
                                <div className={`ng-badge ${logsForStation.length > 0 ? 'bg-danger text-white' : 'bg-light text-muted'}`}>
                                    {logsForStation.length} Units
                                </div>
                                
                                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} ms-4 text-slate-400`}></i>
                            </div>

                            {isOpen && (
                                <div className="bg-white border-top animate-in slide-in-from-top-2">
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
                                                {logsForStation.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="10" className="text-center py-5 text-muted">
                                                            <div className="py-3">
                                                                <i className="bi bi-shield-check fs-2 opacity-25 d-block mb-2"></i>
                                                                No units requiring attention in this category.
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    logsForStation.map(log => (
                                                        <tr key={log.id}>
                                                            <td className="fw-bold">{log.model}</td>
                                                            <td className="text-muted">{log.revision || '---'}</td>
                                                            <td><span className="mono-box">{log.base_unit_kitting_no || '---'}</span></td>
                                                            <td><span className="mono-box">{log.assembly_no}</span></td>
                                                            <td><span className="mono-box text-primary">{log.device_serial_no}</span></td>
                                                            <td><span className="mono-box">{log.accessory_kitting_no || '---'}</span></td>
                                                            <td>
                                                                <span className="text-danger fw-bold small">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> {log.status}
                                                                </span>
                                                            </td>
                                                            <td className="small text-muted" style={{ maxWidth: '180px' }}>
                                                                {log.remarks || 'No remarks provided'}
                                                            </td>
                                                            <td className="small text-muted">
                                                                {formatTimestamp(log.updated_at || log.created_at)}
                                                            </td>
                                                            <td className="text-center">
                                                                <button 
                                                                    className="btn-action-rework"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(log);
                                                                    }}
                                                                >
                                                                    Manage Unit
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NoGoodUnits;