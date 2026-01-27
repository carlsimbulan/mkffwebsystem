import React, { useState } from 'react';

export const InventoryView = ({ pcbaLogs }) => {
    const [expandedId, setExpandedId] = useState(null);

    const pcbaMapping = [
        { model: 'EE-405-MNBD-PCBA-A3', code: '001-00-000034', prefix: 'MK001034-2450-', key: 'mnbd_board_no' },
        { model: 'EE-405-CMBD-PCBA-A3', code: '001-00-000031', prefix: 'MK001031-2448-', key: 'cmbd_board_no' },
        { model: 'EE-405-LRBD-PCBA-A3', code: '001-00-000030', prefix: 'MK001030-2440-', key: 'lrbd_board_no' },
        { model: 'EE-405-PQBD-PCBA-A3', code: '001-00-000033', prefix: 'MK001033-2445-', key: 'pqbd_board_no' },
        { model: 'EE-405-BKBD-PCBA-A4', code: '001-00-000041', prefix: 'MK001034-2502-', key: 'bkbd_board_no' }
    ];

    return (
        <div className="p-2">
            <style>{`
                .inventory-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                }

                .inventory-card-header {
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    background: #ffffff;
                }

                .inventory-card-header:hover {
                    background-color: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(8px);
                }

                .status-circle {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #10b981;
                    margin-right: 12px;
                    display: inline-block;
                }

                .assembly-text {
                    font-weight: 800;
                    color: #0f172a;
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    letter-spacing: -0.5px;
                }

                .date-badge {
                    background: #f1f5f9;
                    color: #64748b;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .detail-panel {
                    border-top: 1px solid #f1f5f9;
                    background: #f8fafc;
                    padding: 15px;
                }

                .pcba-table {
                    width: 100%;
                    background: #ffffff;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    border-collapse: separate;
                    border-spacing: 0;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .pcba-table th {
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 10px 15px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .pcba-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.8rem;
                }

                .pcba-table tr:last-child td {
                    border-bottom: none;
                }

                .serial-text {
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    font-weight: 700;
                }

                .prefix-muted {
                    color: #94a3b8;
                    font-weight: 400;
                }

                .btn-close-panel {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 6px 16px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    outline: none;
                }
                .btn-close-panel:active {
                    transform: scale(0.95);
                }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4 px-1">
                <div>
                    <h5 className="fw-bold text-dark mb-0">Component Traceability</h5>
                    <p className="text-muted small mb-0 fw-bold">PCBA Serialization & Inventory Linkage</p>
                </div>
                <div className="text-end">
                    <span className="text-muted small fw-bold text-uppercase">Total Units: </span>
                    <span className="h5 fw-bold text-primary mb-0">{pcbaLogs.length}</span>
                </div>
            </div>
            
            {pcbaLogs.length > 0 ? pcbaLogs.map((item, idx) => (
                <div key={idx} className="inventory-card">
                    {/* Header Row */}
                    <div 
                        className="inventory-card-header"
                        onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    >
                        <div className="d-flex align-items-center">
                            <div className="status-circle"></div>
                            <span className="assembly-text fs-5">{item.assembly_no}</span>
                            <span className="ms-3 date-badge">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(item.created_at).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-muted small fw-bold d-none d-md-inline" style={{ fontSize: '0.65rem' }}>
                                {expandedId === idx ? 'HIDE DETAILS' : 'VIEW COMPONENTS'}
                            </span>
                            <i className={`bi ${expandedId === idx ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary fw-bold`}></i>
                        </div>
                    </div>

                    {/* Expandable Panel */}
                    {expandedId === idx && (
                        <div className="detail-panel">
                            <table className="pcba-table">
                                <thead>
                                    <tr>
                                        <th className="text-start">PCBA Model</th>
                                        <th className="text-center">Parts Code</th>
                                        <th className="text-end">Assigned Serial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pcbaMapping.map((map, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold text-dark">{map.model}</td>
                                            <td className="text-center text-muted small serial-text">{map.code}</td>
                                            <td className="text-end">
                                                <div className="serial-text">
                                                    <span className="prefix-muted">{map.prefix}</span>
                                                    <span className="text-primary">{item[map.key] || '------'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="mt-3 d-flex justify-content-between align-items-center">
                                <small className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>
                                    UID: {item.id} | SYSTEM DATA VALIDATED
                                </small>
                                <button className="btn-close-panel" onClick={() => setExpandedId(null)}>
                                    CLOSE PANEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )) : (
                <div className="text-center py-5 border rounded-4 bg-light shadow-sm" style={{ borderStyle: 'dashed' }}>
                    <i className="bi bi-cpu text-muted opacity-25" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-2 fw-bold text-muted uppercase tracking-widest">No Inventory Records Found</p>
                </div>
            )}
        </div>
    );
};