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
            <h6 className="mb-3 fw-bold text-dark text-uppercase border-bottom pb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                <i className="bi bi-cpu-fill me-2 text-primary"></i>PCBA Inventory Traceability List
            </h6>
            
            {pcbaLogs.length > 0 ? pcbaLogs.map((item, idx) => (
                <div key={idx} className="inventory-item-container mb-3">
                    {/* Visible Main Box */}
                    <div 
                        className={`border rounded-top p-3 d-flex justify-content-between align-items-center ${expandedId === idx ? 'bg-primary text-white border-primary' : 'bg-white text-dark border-secondary-subtle'}`}
                        style={{ cursor: 'pointer', transition: 'none' }}
                        onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    >
                        <div className="d-flex align-items-center">
                            <span className="fw-bold font-monospace fs-5">{item.assembly_no}</span>
                            <span className={`ms-3 px-2 py-1 rounded small fw-bold ${expandedId === idx ? 'bg-white text-primary' : 'bg-light text-muted border'}`} style={{ fontSize: '0.65rem' }}>
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="small opacity-75 d-none d-md-inline">Click to view boards</span>
                            <i className={`bi ${expandedId === idx ? 'bi-dash-square' : 'bi-plus-square'}`}></i>
                        </div>
                    </div>

                    {/* Visible Detail Box (No animations) */}
                    {expandedId === idx && (
                        <div className="border border-top-0 rounded-bottom bg-white overflow-hidden" style={{ borderColor: '#dee2e6' }}>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0 text-center" style={{ fontSize: '0.75rem' }}>
                                    <thead className="table-light text-secondary">
                                        <tr>
                                            <th className="py-2">PCBA MODEL</th>
                                            <th className="py-2">PARTS CODE</th>
                                            <th className="py-2 bg-primary-subtle text-primary">PAIRED BOARD SERIAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pcbaMapping.map((map, i) => (
                                            <tr key={i}>
                                                <td className="py-2 fw-semibold text-start ps-3">{map.model}</td>
                                                <td className="py-2 text-muted font-monospace">{map.code}</td>
                                                <td className="py-2 fw-bold font-monospace bg-light-subtle">
                                                    <span className="text-secondary opacity-50">{map.prefix}</span>
                                                    <span className="text-primary">{item[map.key] || '------'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Summary Footer for the Box */}
                            <div className="p-2 bg-light d-flex justify-content-between align-items-center border-top">
                                <small className="text-muted ps-2">System Record ID: {item.id}</small>
                                <button className="btn btn-sm btn-secondary py-0 px-3 fw-bold" style={{ fontSize: '0.65rem' }} onClick={() => setExpandedId(null)}>
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )) : (
                <div className="text-center p-5 border border-secondary-subtle rounded bg-light text-muted">
                    <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
                    <span className="fw-bold">No Records Found</span>
                </div>
            )}

            <style>{`
                .font-monospace { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace !important; }
                .inventory-item-container { filter: none !important; }
                .bg-light-subtle { background-color: #f8f9fa; }
                .table-bordered td, .table-bordered th { border-color: #e9ecef !important; }
            `}</style>
        </div>
    );
};