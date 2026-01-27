import React, { useState } from 'react';

const TARGET_STATION = 'Station15';

export const Shipment = ({ liveUnitLogs = [], onMarkAsShipped }) => {
    const [confirmModal, setConfirmModal] = useState({ show: false, unitId: null, assemblyNo: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // --- FILTER LOGIC ---
    const readyUnits = liveUnitLogs.filter(log =>
        log.status === 'Completed' &&
        log.station?.replace(/\s/g, '').toLowerCase() === TARGET_STATION.toLowerCase()
    );

    const dispatchedUnits = liveUnitLogs.filter(log =>
        log.status === 'Dispatched'
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // --- PAGINATION ---
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentDispatched = dispatchedUnits.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(dispatchedUnits.length / recordsPerPage);

    const handleOpenConfirm = (unit) => {
        setConfirmModal({ show: true, unitId: unit.id, assemblyNo: unit.assembly_no });
    };

    const handleExecuteDispatch = () => {
        if (typeof onMarkAsShipped === 'function') {
            onMarkAsShipped(confirmModal.unitId);
        }
        setConfirmModal({ show: false, unitId: null, assemblyNo: '' });
    };

    return (
        <div className="container-fluid px-0 py-3 animate-in fade-in">
            <style>
                {`
                /* GLASSMORPHISM DESIGN: Professional Row Separation */
                .table-glass-style {
                    border-collapse: separate !important;
                    border-spacing: 0 12px !important;
                    margin-top: -12px;
                }
                
                .table-glass-style tbody tr {
                    background: rgba(255, 255, 255, 0.7) !important;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                /* 🔑 GLASS EFFECT: Lalabo ang background pag na-hover */
                .table-glass-style tbody tr:hover {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(12px); /* Eto 'yung nagpapalabo */
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.5); /* Inner white shadow */
                }

                .table-glass-style td {
                    border: none !important;
                    padding: 20px 25px !important;
                }

                .table-glass-style td:first-child {
                    border-radius: 12px 0 0 12px;
                }

                .table-glass-style td:last-child {
                    border-radius: 0 12px 12px 0;
                }

                .assembly-code { 
                    font-family: 'SFMono-Regular', Consolas, monospace; 
                    font-weight: 800; 
                    font-size: 1.1rem; 
                    color: #0f172a;
                    letter-spacing: -0.5px;
                }

                .summary-glass-header {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    padding: 25px 30px; 
                    border-radius: 16px; 
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
                }

                .btn-dispatch-glass {
                    background: #1e293b; 
                    color: white; 
                    border: none; 
                    padding: 10px 22px;
                    border-radius: 10px; 
                    font-weight: 700; 
                    font-size: 0.7rem; 
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }

                .modal-blur-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.4); 
                    backdrop-filter: blur(8px); /* Blur effect para sa background ng modal */
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                }
                `}
            </style>

            {/* TOP SUMMARY BAR */}
            <div className="summary-glass-header mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Shipping & Logistics</h4>
                    <p className="text-muted small mb-0 fw-bold">Verified units awaiting outbound release.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-white border fw-bold small py-2 px-3 shadow-sm" style={{fontSize: '0.75rem', borderRadius: '10px'}} onClick={() => setShowHistoryModal(true)}>
                        <i className="bi bi-clock-history me-2"></i>HISTORY
                    </button>
                    <div className="border-start ps-4 text-center">
                        <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>PENDING RELEASE</div>
                        <div className="h4 fw-black text-primary mb-0">{readyUnits.length}</div>
                    </div>
                </div>
            </div>

            <div className="table-responsive px-1">
                <table className="table table-glass-style mb-0">
                    <thead>
                        <tr className="text-muted small fw-bold">
                            <th className="ps-4 border-0">ASSEMBLY IDENTIFIER</th>
                            <th className="border-0">SPECIFICATIONS</th>
                            <th className="border-0">QA COMPLETION</th>
                            <th className="text-end pe-5 border-0">OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readyUnits.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-5 bg-white shadow-sm" style={{borderRadius: '16px'}}>
                                    <i className="bi bi-check2-all text-success fs-1 mb-3 d-block"></i>
                                    <h6 className="fw-bold text-dark">Logistics Queue Empty</h6>
                                    <p className="text-muted small mb-0">All verified units have been successfully dispatched from Station 15.</p>
                                </td>
                            </tr>
                        ) : (
                            readyUnits.map(unit => (
                                <tr key={unit.id}>
                                    <td>
                                        <div className="assembly-code">{unit.assembly_no}</div>
                                        <div className="text-muted small fw-bold" style={{fontSize: '0.65rem'}}>STATION REF: {unit.station}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark small">{unit.model}</div>
                                        <div className="text-muted fw-medium" style={{fontSize: '0.7rem'}}>REV: {unit.revision || '01'}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark small">{formatDateTime(unit.updated_at)}</div>
                                        <div className="text-success small fw-bold" style={{fontSize: '0.65rem'}}>STATUS: VERIFIED</div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn-dispatch-glass shadow-sm" onClick={() => handleOpenConfirm(unit)}>
                                            Authorize Release
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal.show && (
                <div className="modal-blur-overlay">
                    <div className="bg-white p-5 rounded-4 shadow-2xl text-center border-0" style={{ width: '400px' }}>
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-shield-check fs-2"></i>
                        </div>
                        <h5 className="fw-bold text-dark mb-2">Final Authorization</h5>
                        <p className="text-muted small mb-4">Confirming outbound release for unit:<br/><strong className="text-primary">{confirmModal.assemblyNo}</strong></p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light px-4 fw-bold text-muted rounded-3" onClick={() => setConfirmModal({ show: false, unitId: null, assemblyNo: '' })}>Cancel</button>
                            <button className="btn btn-primary px-4 fw-bold shadow-sm rounded-3" onClick={handleExecuteDispatch}>Release Unit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISPATCH HISTORY MODAL */}
            {showHistoryModal && (
                <div className="modal-blur-overlay">
                    <div className="bg-white rounded-4 shadow-2xl border-0 overflow-hidden" style={{ width: '800px', maxHeight: '80vh' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <h6 className="fw-bold mb-0 text-dark uppercase tracking-wider">Dispatch Registry</h6>
                            <button className="btn-close" onClick={() => { setShowHistoryModal(false); setCurrentPage(1); }}></button>
                        </div>
                        <div className="p-0 overflow-auto" style={{ maxHeight: '55vh' }}>
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light sticky-top">
                                    <tr className="small text-muted fw-bold">
                                        <th className="ps-4 py-3">ASSEMBLY NO.</th>
                                        <th>MODEL INFO</th>
                                        <th>DISPATCH TIMESTAMP</th>
                                        <th className="text-center pe-4">VERDICT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDispatched.length > 0 ? currentDispatched.map(unit => (
                                        <tr key={unit.id}>
                                            <td className="ps-4 fw-bold text-dark py-3">{unit.assembly_no}</td>
                                            <td className="small text-muted fw-bold">{unit.model}</td>
                                            <td className="small text-muted">{formatDateTime(unit.updated_at)}</td>
                                            <td className="text-center pe-4">
                                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold" style={{fontSize: '0.6rem'}}>RELEASED</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted fw-bold">No records available in history.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-top bg-light d-flex justify-content-between align-items-center">
                            <div className="small text-muted fw-bold">Entry {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, dispatchedUnits.length)}</div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-white border fw-bold px-3 shadow-sm rounded-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>PREV</button>
                                <button className="btn btn-sm btn-white border fw-bold px-3 shadow-sm rounded-2" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>NEXT</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};