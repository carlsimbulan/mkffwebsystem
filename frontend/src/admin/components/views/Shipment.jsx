import React, { useState } from 'react';

const TARGET_STATION = 'Station15';

export const Shipment = ({ liveUnitLogs = [], onMarkAsShipped }) => {
    const [confirmModal, setConfirmModal] = useState({ show: false, unitId: null, assemblyNo: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showChangePinModal, setShowChangePinModal] = useState(false);
    const [authPin, setAuthPin] = useState('');
    const [authError, setAuthError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Change PIN states
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isUpdatingPin, setIsUpdatingPin] = useState(false);
    
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
        setAuthPin('');
        setAuthError('');
    };

    const handleExecuteDispatch = async () => {
        if (!authPin) {
            setAuthError('PIN is required');
            return;
        }
        
        setIsVerifying(true);
        setAuthError('');
        
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/units.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_release_pin',
                    pin: authPin
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success' && result.verified === true) {
                // PIN is correct, proceed with release
                if (typeof onMarkAsShipped === 'function') {
                    onMarkAsShipped(confirmModal.unitId);
                }
                setConfirmModal({ show: false, unitId: null, assemblyNo: '' });
                setAuthPin('');
                setAuthError('');
            } else {
                setAuthError('Invalid PIN. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying PIN:', error);
            setAuthError('Connection error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleChangePin = async () => {
        // Validation
        if (!currentPin || !newPin || !confirmNewPin) {
            setPinError('All fields are required');
            return;
        }
        
        if (newPin !== confirmNewPin) {
            setPinError('New PIN and confirmation do not match');
            return;
        }
        
        if (newPin.length < 4) {
            setPinError('PIN must be at least 4 digits');
            return;
        }
        
        setIsUpdatingPin(true);
        setPinError('');
        
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/units.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_release_pin',
                    current_pin: currentPin,
                    new_pin: newPin
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('✅ PIN updated successfully!');
                setShowChangePinModal(false);
                setCurrentPin('');
                setNewPin('');
                setConfirmNewPin('');
                setPinError('');
            } else {
                setPinError(result.message || 'Failed to update PIN');
            }
        } catch (error) {
            console.error('Error updating PIN:', error);
            setPinError('Connection error. Please try again.');
        } finally {
            setIsUpdatingPin(false);
        }
    };

    return (
        <div className="pb-5">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-truck me-2 text-primary"></i>
                        Shipping & Logistics
                    </h4>
                    <p className="text-muted small mb-0 mt-1">Verified units awaiting outbound release.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button 
                        className="btn btn-outline-secondary rounded p-2 px-3 shadow-sm transition-all" 
                        onClick={() => setShowChangePinModal(true)} 
                        title="Change Release PIN"
                    >
                        <i className="bi bi-key me-1"></i>
                        Change PIN
                    </button>
                    <button 
                        className="btn btn-outline-primary rounded p-2 shadow-sm transition-all" 
                        onClick={() => setShowHistoryModal(true)} 
                        title="History"
                    >
                        <i className="bi bi-clock-history"></i>
                    </button>
                    <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal" style={{fontSize: '0.7rem', padding: '6px 14px'}}>
                        <i className="bi bi-box-seam me-1"></i>
                        {readyUnits.length} Pending
                    </div>
                </div>
            </div>

            {/* --- MAIN TABLE --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>ASSEMBLY</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>MODEL</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>REVISION</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>COMPLETION</th>
                                <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>ACTIONS</th>
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
                                    <tr key={unit.id} className="border-bottom hover-bg-primary hover-bg-opacity-5 transition-all">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                    {unit.assembly_no}
                                                </code>
                                            </div>
                                            <div className="text-muted small mt-1">{unit.station}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="fw-bold text-dark">{unit.model}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                {unit.revision || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="fw-semibold text-dark">{formatDateTime(unit.updated_at)}</div>
                                            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-normal mt-1" style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                VERIFIED
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                className="btn btn-sm btn-primary rounded p-2 px-3 transition-all" 
                                                onClick={() => handleOpenConfirm(unit)} 
                                                title="Release"
                                            >
                                                <i className="bi bi-box-arrow-right"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- RELEASE CONFIRMATION MODAL --- */}
            {confirmModal.show && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '400px' }}>
                        <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">Final Authorization</h5>
                                <small className="opacity-75">Confirm unit release</small>
                            </div>
                            <button 
                                className="btn-close btn-close-white shadow-none" 
                                onClick={() => {
                                    setConfirmModal({ show: false, unitId: null, assemblyNo: '' });
                                    setAuthPin('');
                                    setAuthError('');
                                }}
                            ></button>
                        </div>
                        <div className="modal-body p-4 text-center">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '60px', height: '60px' }}>
                                <i className="bi bi-shield-check fs-2"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-2">Confirm Release</h6>
                            <p className="text-muted small mb-3">Unit: <strong className="text-primary">{confirmModal.assemblyNo}</strong></p>
                            
                            {/* PIN Input */}
                            <div className="mb-4">
                                <label className="form-label text-start d-block fw-bold text-muted small mb-2">
                                    <i className="bi bi-key me-1"></i>
                                    Release PIN
                                </label>
                                <input 
                                    type="password" 
                                    className={`form-control text-center ${authError ? 'is-invalid' : ''}`}
                                    placeholder="Enter PIN"
                                    value={authPin}
                                    maxLength="10"
                                    onChange={(e) => {
                                        setAuthPin(e.target.value);
                                        setAuthError('');
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && authPin) {
                                            handleExecuteDispatch();
                                        }
                                    }}
                                    autoFocus
                                />
                                {authError && (
                                    <div className="invalid-feedback text-center d-block">
                                        <i className="bi bi-exclamation-circle me-1"></i>
                                        {authError}
                                    </div>
                                )}
                            </div>
                            
                            <div className="d-flex gap-2 justify-content-center">
                                <button 
                                    className="btn btn-light px-4 fw-bold text-muted" 
                                    onClick={() => {
                                        setConfirmModal({ show: false, unitId: null, assemblyNo: '' });
                                        setAuthPin('');
                                        setAuthError('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary px-4 fw-bold shadow-sm" 
                                    onClick={handleExecuteDispatch}
                                    disabled={!authPin || isVerifying}
                                >
                                    {isVerifying ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-unlock me-1"></i>
                                            Release
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CHANGE PIN MODAL --- */}
            {showChangePinModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '450px' }}>
                        <div className="modal-header bg-secondary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">Change Release PIN</h5>
                                <small className="opacity-75">Update authorization PIN</small>
                            </div>
                            <button 
                                className="btn-close btn-close-white shadow-none" 
                                onClick={() => {
                                    setShowChangePinModal(false);
                                    setCurrentPin('');
                                    setNewPin('');
                                    setConfirmNewPin('');
                                    setPinError('');
                                }}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-key me-1"></i>
                                    Current PIN
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    placeholder="Enter current PIN"
                                    value={currentPin}
                                    maxLength="10"
                                    onChange={(e) => {
                                        setCurrentPin(e.target.value);
                                        setPinError('');
                                    }}
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-key-fill me-1"></i>
                                    New PIN
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    placeholder="Enter new PIN (min 4 digits)"
                                    value={newPin}
                                    maxLength="10"
                                    onChange={(e) => {
                                        setNewPin(e.target.value);
                                        setPinError('');
                                    }}
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Confirm New PIN
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    placeholder="Re-enter new PIN"
                                    value={confirmNewPin}
                                    maxLength="10"
                                    onChange={(e) => {
                                        setConfirmNewPin(e.target.value);
                                        setPinError('');
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && currentPin && newPin && confirmNewPin) {
                                            handleChangePin();
                                        }
                                    }}
                                />
                            </div>
                            
                            {pinError && (
                                <div className="alert alert-danger py-2 px-3 small">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    {pinError}
                                </div>
                            )}
                            
                            <div className="d-flex gap-2 justify-content-end mt-4">
                                <button 
                                    className="btn btn-light px-4 fw-bold" 
                                    onClick={() => {
                                        setShowChangePinModal(false);
                                        setCurrentPin('');
                                        setNewPin('');
                                        setConfirmNewPin('');
                                        setPinError('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-secondary px-4 fw-bold shadow-sm" 
                                    onClick={handleChangePin}
                                    disabled={!currentPin || !newPin || !confirmNewPin || isUpdatingPin}
                                >
                                    {isUpdatingPin ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-1"></i>
                                            Update PIN
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HISTORY MODAL --- */}
            {showHistoryModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">Dispatch Registry</h5>
                                <small className="opacity-75">History of released units</small>
                            </div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => { setShowHistoryModal(false); setCurrentPage(1); }}></button>
                        </div>
                        <div className="modal-body p-0 overflow-auto" style={{ maxHeight: '60vh' }}>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="bg-primary text-white sticky-top">
                                        <tr>
                                            <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>ASSEMBLY</th>
                                            <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>MODEL</th>
                                            <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>DISPATCH TIME</th>
                                            <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentDispatched.length > 0 ? currentDispatched.map(unit => (
                                            <tr key={unit.id} className="border-bottom hover-bg-primary hover-bg-opacity-5 transition-all">
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                            {unit.assembly_no}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="fw-bold text-dark">{unit.model}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-muted small">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {formatDateTime(unit.updated_at)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-normal" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
                                                        RELEASED
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <i className="bi bi-archive text-muted fs-1 mb-3 d-block"></i>
                                                    <h6 className="fw-bold text-dark">No Records Available</h6>
                                                    <p className="text-muted small mb-0">No dispatch history found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer border-top bg-light flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div className="small text-muted fw-bold">
                                Entry {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, dispatchedUnits.length)}
                            </div>
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-sm btn-outline-primary rounded px-3 fw-bold" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <i className="bi bi-chevron-left me-1"></i>PREV
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-primary rounded px-3 fw-bold" 
                                    disabled={currentPage === totalPages || totalPages === 0} 
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    NEXT<i className="bi bi-chevron-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add custom styles
const customStyles = `
<style>
.hover-bg-primary:hover {
    background-color: rgba(13, 110, 253, 0.03) !important;
}

.transition-all {
    transition: all 0.15s ease;
}

.border-bottom {
    border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
}

.badge {
    font-weight: 500;
    letter-spacing: 0.2px;
}

.table {
    border-collapse: separate;
    border-spacing: 0;
}

.shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.shadow-lg {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement.firstElementChild);
}
