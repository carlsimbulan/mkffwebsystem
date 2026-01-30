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
        <div className="pb-5">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Shipping & Logistics</h3>
                    <p className="text-muted small mb-0">Verified units awaiting outbound release.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setShowHistoryModal(true)}>
                        <i className="bi bi-clock-history me-2"></i>HISTORY
                    </button>
                    <div className="border-start ps-4 text-center">
                        <div className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>PENDING RELEASE</div>
                        <div className="h4 fw-black text-primary mb-0">{readyUnits.length}</div>
                    </div>
                </div>
            </div>

            {/* --- MAIN TABLE --- */}
            <div className="bg-white border rounded-2 overflow-hidden shadow-sm mx-2">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-dark">
                        <tr>
                            <th className="ps-4">ASSEMBLY</th>
                            <th>MODEL</th>
                            <th>REVISION</th>
                            <th>COMPLETION</th>
                            <th className="text-center pe-4">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {readyUnits.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-5">
                                    <i className="bi bi-check2-all text-success fs-1 mb-3 d-block"></i>
                                    <h6 className="fw-bold text-dark">Logistics Queue Empty</h6>
                                    <p className="text-muted small mb-0">All verified units have been successfully dispatched from Station 15.</p>
                                </td>
                            </tr>
                        ) : (
                            readyUnits.map(unit => (
                                <tr key={unit.id}>
                                    <td className="ps-4">
                                        <code className="text-primary fw-bold">{unit.assembly_no}</code>
                                        <div className="text-muted small">{unit.station}</div>
                                    </td>
                                    <td className="fw-semibold">{unit.model}</td>
                                    <td className="text-muted">{unit.revision || '---'}</td>
                                    <td>
                                        <div className="fw-semibold">{formatDateTime(unit.updated_at)}</div>
                                        <div className="text-success small fw-bold">VERIFIED</div>
                                    </td>
                                    <td className="text-center pe-4">
                                        <button className="btn btn-primary btn-sm fw-bold px-3" onClick={() => handleOpenConfirm(unit)}>
                                            RELEASE
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- CONFIRMATION MODAL --- */}
            {confirmModal.show && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '400px' }}>
                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-primary shadow-sm">
                            <div><h5 className="mb-0 fw-bold">Final Authorization</h5></div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => setConfirmModal({ show: false, unitId: null, assemblyNo: '' })}></button>
                        </div>
                        <div className="p-4 text-center">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-shield-check fs-2"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-2">Confirm Release</h6>
                            <p className="text-muted small mb-4">Unit: <strong className="text-primary">{confirmModal.assemblyNo}</strong></p>
                            <div className="d-flex gap-2 justify-content-center">
                                <button className="btn btn-light px-4 fw-bold text-muted" onClick={() => setConfirmModal({ show: false, unitId: null, assemblyNo: '' })}>Cancel</button>
                                <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleExecuteDispatch}>Release</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HISTORY MODAL --- */}
            {showHistoryModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '800px', maxHeight: '80vh' }}>
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <h6 className="fw-bold mb-0 text-dark">Dispatch Registry</h6>
                            <button className="btn-close" onClick={() => { setShowHistoryModal(false); setCurrentPage(1); }}></button>
                        </div>
                        <div className="p-0 overflow-auto" style={{ maxHeight: '55vh' }}>
                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead className="table-dark sticky-top">
                                    <tr>
                                        <th className="ps-4">ASSEMBLY</th>
                                        <th>MODEL</th>
                                        <th>DISPATCH TIME</th>
                                        <th className="text-center pe-4">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDispatched.length > 0 ? currentDispatched.map(unit => (
                                        <tr key={unit.id}>
                                            <td className="ps-4">
                                                <code className="text-primary fw-bold">{unit.assembly_no}</code>
                                            </td>
                                            <td className="fw-semibold">{unit.model}</td>
                                            <td className="text-muted small">{formatDateTime(unit.updated_at)}</td>
                                            <td className="text-center pe-4">
                                                <span className="badge bg-success text-white rounded-1 px-3 fw-bold">RELEASED</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted fw-bold">No records available in history.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-top bg-light d-flex justify-content-between align-items-center">
                            <div className="small text-muted fw-bold">Entry {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, dispatchedUnits.length)}</div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-white border fw-bold px-3 shadow-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>PREV</button>
                                <button className="btn btn-sm btn-white border fw-bold px-3 shadow-sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>NEXT</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};