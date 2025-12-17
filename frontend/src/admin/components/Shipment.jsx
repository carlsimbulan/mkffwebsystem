import React, { useState } from 'react';

const TARGET_STATION = 'Station15'; 

export const Shipment = ({ liveUnitLogs, onMarkAsShipped }) => {
    const [activeTab, setActiveTab] = useState('pending');

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // --- FILTER LOGIC ---
    const readyUnits = liveUnitLogs.filter(log => 
        log.status === 'Completed' && 
        log.station.replace(/\s/g, '').toLowerCase() === TARGET_STATION.toLowerCase()
    );

    const shippedUnits = liveUnitLogs.filter(log => 
        log.status === 'Shipped' || log.status === 'Dispatched'
    );

    const handleDispatch = (unitId) => {
        if (window.confirm("Authorize final dispatch for this unit?")) {
            onMarkAsShipped(unitId);
        }
    };

    return (
        <div className="container-fluid px-0 py-3 animate-in fade-in">
            <style>
                {`
                .logistics-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                .nav-logistics {
                    display: flex;
                    background: #f8fafc;
                    padding: 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .nav-logistics button {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    background: transparent;
                    font-weight: 700;
                    font-size: 0.8rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.2s;
                    position: relative;
                }
                .nav-logistics button.active {
                    color: #0f172a;
                    background: white;
                }
                .nav-logistics button.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 3px; background: #107c55;
                }
                .badge-logistics {
                    font-size: 0.7rem;
                    padding: 2px 10px;
                    border-radius: 20px;
                    margin-left: 8px;
                    background: #e2e8f0;
                    color: #475569;
                }
                .active .badge-logistics {
                    background: #107c55;
                    color: white;
                }
                .table-logistics thead th {
                    background: #f1f5f9;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #475569;
                    padding: 15px 20px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .table-logistics tbody td {
                    padding: 14px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    color: #334155;
                }
                .mono-code {
                    font-family: 'JetBrains Mono', monospace;
                    background: #f8fafc;
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    font-size: 0.8rem;
                    color: #1e293b;
                    font-weight: 700;
                }
                .btn-dispatch-auth {
                    background: #107c55;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    transition: all 0.2s;
                }
                .btn-dispatch-auth:hover { 
                    background: #0d6646; 
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(16, 124, 85, 0.2);
                }
                .status-released {
                    color: #107c55;
                    font-weight: 800;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    background: #ecfdf5;
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1px solid #d1fae5;
                }
                .summary-header {
                    background: #fff;
                    padding: 24px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                `}
            </style>

            {/* TOP SUMMARY BAR */}
            <div className="summary-header mb-4">
                <div>
                    <h4 className="fw-bold text-slate-800 mb-1">Outbound Logistics Terminal</h4>
                    <p className="text-muted small mb-0">Authorized station completion and final dispatch registry.</p>
                </div>
                <div className="text-end">
                    <span className="text-muted small fw-bold text-uppercase tracking-wider">Queue for Loading</span>
                    <h2 className="text-success fw-black mb-0" style={{ lineHeight: 1 }}>{readyUnits.length}</h2>
                </div>
            </div>

            <div className="logistics-card">
                {/* TAB NAVIGATION */}
                <div className="nav-logistics">
                    <button 
                        className={activeTab === 'pending' ? 'active' : ''}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Dispatch
                        <span className="badge-logistics">{readyUnits.length}</span>
                    </button>
                    <button 
                        className={activeTab === 'shipped' ? 'active' : ''}
                        onClick={() => setActiveTab('shipped')}
                    >
                        Dispatch History
                        <span className="badge-logistics">{shippedUnits.length}</span>
                    </button>
                </div>

                {/* TABLE AREA */}
                <div className="table-responsive">
                    <table className="table table-logistics mb-0 table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Unit Model & Rev</th>
                                <th>Device Serial</th>
                                <th>Kitting ID</th>
                                <th>{activeTab === 'pending' ? 'Completion Date' : 'Release Date'}</th>
                                <th className="text-center">Authorization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'pending' ? readyUnits : shippedUnits).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="py-4 opacity-50">
                                            <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
                                            <span className="fw-bold">No unit records found in this category.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === 'pending' ? readyUnits : shippedUnits).map(unit => (
                                    <tr key={unit.id}>
                                        <td>
                                            <div className="fw-bold text-slate-800">{unit.model}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>REVISION: {unit.revision}</div>
                                        </td>
                                        <td><span className="mono-code">{unit.device_serial_no}</span></td>
                                        <td><span className="text-muted small fw-bold">{unit.base_unit_kitting_no}</span></td>
                                        <td className="small text-slate-500 font-monospace">{formatDateTime(unit.created_at)}</td>
                                        <td className="text-center">
                                            {activeTab === 'pending' ? (
                                                <button 
                                                    className="btn-dispatch-auth"
                                                    onClick={() => handleDispatch(unit.id)}
                                                >
                                                    <i className="bi bi-truck me-2"></i>Authorize Dispatch
                                                </button>
                                            ) : (
                                                <span className="status-released">
                                                    <i className="bi bi-patch-check-fill me-1"></i> Released to Client
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER INFO */}
            <div className="mt-4 px-2 d-flex justify-content-between align-items-center opacity-50">
                <div className="small fw-bold text-uppercase" style={{fontSize: '0.6rem', letterSpacing: '0.1em'}}>
                    Security: <span className="text-success">Admin Authorization Required</span>
                </div>
                <div className="small fw-bold text-uppercase" style={{fontSize: '0.6rem', letterSpacing: '0.1em'}}>
                    MKFF Logistics Handshake v2.5
                </div>
            </div>
        </div>
    );
};