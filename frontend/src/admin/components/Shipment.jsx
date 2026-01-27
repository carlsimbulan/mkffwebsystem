import React, { useState } from 'react';

const TARGET_STATION = 'Station15';

export const Shipment = ({ liveUnitLogs = [], onMarkAsShipped }) => {
    const [confirmModal, setConfirmModal] = useState({ show: false, unitId: null, assemblyNo: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    // Pagination State
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
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Latest first

    // --- PAGINATION CALCULATION ---
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentDispatched = dispatchedUnits.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(dispatchedUnits.length / recordsPerPage);

    // --- HANDLERS ---
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
        <div className="container-fluid px-0 py-3">
            <style>
                {`
                .logistics-card {
                    background: white; border: 1px solid #edf2f7; border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;
                }
                .table-logistics thead th {
                    background: #f8fafc; font-size: 0.7rem; text-transform: uppercase;
                    letter-spacing: 0.05em; color: #64748b; padding: 15px 25px; border-bottom: 1px solid #edf2f7;
                }
                .table-logistics tbody td { padding: 20px 25px; border-bottom: 1px solid #f8fbfc; vertical-align: middle; }
                .assembly-code { font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 800; font-size: 1.1rem; color: #0f172a; }
                
                .btn-dispatch-auth {
                    background: #0f172a; color: white; border: none; padding: 10px 24px;
                    border-radius: 10px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase;
                }
                .btn-history-trigger {
                    background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 10px 20px;
                    border-radius: 10px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase;
                }
                .btn-dispatch-auth:active, .btn-history-trigger:active { transform: scale(0.95); }

                /* MODAL STYLES */
                .modal-overlay-custom {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center; z-index: 2000;
                }
                .modal-content-custom {
                    background: white; padding: 35px; border-radius: 24px; width: 420px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; border: 1px solid #edf2f7;
                }
                .history-modal-content {
                    background: white; border-radius: 24px; width: 850px; max-height: 90vh;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #edf2f7;
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .btn-confirm-yes { background: #2563eb; color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 0.8rem; margin-left: 10px; }
                .btn-confirm-no { background: #f1f5f9; color: #475569; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 0.8rem; }
                
                .pagination-btn {
                    padding: 5px 15px; border-radius: 8px; border: 1px solid #e2e8f0; 
                    background: white; font-weight: 700; font-size: 0.75rem; transition: 0.2s;
                }
                .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .pagination-btn:not(:disabled):hover { background: #f8fafc; }

                .summary-header {
                    background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #edf2f7;
                    display: flex; justify-content: space-between; align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                `}
            </style>

            {/* TOP SUMMARY BAR */}
            <div className="summary-header mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Outbound Logistics</h3>
                    <p className="text-muted small mb-0 fw-bold">Items waiting for final authorization.</p>
                </div>
                <div className="d-flex align-items-center gap-4">
                    <button className="btn-history-trigger" onClick={() => setShowHistoryModal(true)}>
                        <i className="bi bi-clock-history me-2"></i>Dispatch History
                    </button>
                    <div className="text-end border-start ps-4">
                        <span className="label-caps mb-0" style={{ fontSize: '0.65rem' }}>Ready for Dispatch</span>
                        <h2 className="text-primary fw-black mb-0" style={{ lineHeight: 1 }}>{readyUnits.length}</h2>
                    </div>
                </div>
            </div>

            <div className="logistics-card">
                <div className="table-responsive">
                    <table className="table table-logistics mb-0 table-hover align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Assembly Tracking</th>
                                <th style={{ width: '20%' }}>Status</th>
                                <th style={{ width: '20%' }}>Completion Date</th>
                                <th className="text-end px-5">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readyUnits.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted fw-bold">
                                        <i className="bi bi-check-circle-fill text-success me-2"></i> All units dispatched.
                                    </td>
                                </tr>
                            ) : (
                                readyUnits.map(unit => (
                                    <tr key={unit.id}>
                                        <td>
                                            <div className="assembly-code">{unit.assembly_no}</div>
                                            <div className="text-muted small fw-bold" style={{ fontSize: '0.65rem' }}>MODEL: {unit.model}</div>
                                        </td>
                                        <td>
                                            <span className="badge bg-primary-subtle text-primary border-0 px-3 py-2 fw-bold">
                                                {unit.station}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{formatDateTime(unit.updated_at)}</div>
                                        </td>
                                        <td className="text-end px-4">
                                            <button className="btn-dispatch-auth shadow-sm" onClick={() => handleOpenConfirm(unit)}>
                                                <i className="bi bi-truck me-2"></i>Authorize Release
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DISPATCH HISTORY MODAL */}
            {showHistoryModal && (
                <div className="modal-overlay-custom">
                    <div className="history-modal-content">
                        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark">
                                <i className="bi bi-journal-check me-2 text-primary"></i>Dispatch History Registry
                            </h5>
                            <button className="btn-close" onClick={() => { setShowHistoryModal(false); setCurrentPage(1); }}></button>
                        </div>
                        <div className="p-0 overflow-auto">
                            <table className="table table-logistics mb-0">
                                <thead>
                                    <tr>
                                        <th>Assembly Number</th>
                                        <th>Model Info</th>
                                        <th>Dispatched Date</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDispatched.length > 0 ? currentDispatched.map(unit => (
                                        <tr key={unit.id}>
                                            <td className="assembly-code" style={{ fontSize: '0.95rem' }}>{unit.assembly_no}</td>
                                            <td className="small fw-bold text-muted">{unit.model}</td>
                                            <td className="small font-monospace">{formatDateTime(unit.updated_at)}</td>
                                            <td className="text-center">
                                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">DISPATCHED</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted">No history found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Footer */}
                        <div className="p-3 border-top bg-light d-flex justify-content-between align-items-center">
                            <div className="small fw-bold text-muted">
                                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, dispatchedUnits.length)} of {dispatchedUnits.length}
                            </div>
                            <div className="d-flex gap-2">
                                <button 
                                    className="pagination-btn" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <i className="bi bi-chevron-left me-1"></i> Prev
                                </button>
                                <button 
                                    className="pagination-btn"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next <i className="bi bi-chevron-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            {confirmModal.show && (
                <div className="modal-overlay-custom">
                    <div className="modal-content-custom">
                        <div className="mb-3">
                            <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-box-arrow-right fs-2"></i>
                            </div>
                            <h4 className="fw-bold text-dark">Confirm Release?</h4>
                            <p className="text-muted small px-2 mt-3">
                                Authorization for unit: <br />
                                <span className="d-block mt-2 py-2 bg-light rounded-3 fw-bold text-primary font-monospace">{confirmModal.assemblyNo}</span>
                            </p>
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                            <button className="btn-confirm-no" onClick={() => setConfirmModal({ show: false, unitId: null, assemblyNo: '' })}>Cancel</button>
                            <button className="btn-confirm-yes shadow-sm" onClick={handleExecuteDispatch}>Authorize Release</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};