import React, { useState, useEffect } from 'react';

export function UnitEntryForm({
    scanInput,
    setScanInput,
    handleScan,
    scannerInputRef,
    processStatus,
    statusMessage,
    handleSubmit,
    formData,
    setFormData,
    resetForm,
    currentStation
}) {
    const [isScannerEnabled, setIsScannerEnabled] = useState(true);

    const formattedStationForDB = currentStation ? currentStation.replace(/\s+/g, '') : '';

    useEffect(() => {
        if (isScannerEnabled && processStatus === 'idle') {
            const focusInput = () => {
                if (scannerInputRef.current) scannerInputRef.current.focus();
            };
            focusInput();
            window.addEventListener('click', focusInput);
            return () => window.removeEventListener('click', focusInput);
        }
    }, [isScannerEnabled, processStatus, scannerInputRef]);

    const essentialFields = [formData.model, formData.revision, formData.assemblyNo];
    const progressPercent = Math.min(
        (essentialFields.filter(val => val && val.trim() !== "").length / essentialFields.length) * 100, 
        100
    ).toFixed(0);

    return (
        <div className="row g-3 animate-in fade-in" style={{ fontFamily: "'Inter', sans-serif", color: '#212529' }}>
            {/* SCANNER STATUS BAR */}
            <div className="col-12">
                <div className={`card border-0 shadow-sm ${isScannerEnabled ? 'bg-white' : 'bg-light'}`} 
                     style={{ borderRadius: '8px', borderLeft: isScannerEnabled ? '4px solid #198754' : '4px solid #6c757d' }}>
                    <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className={`${isScannerEnabled ? 'bg-success' : 'bg-secondary'} rounded-circle me-3`} 
                                 style={{ width: '10px', height: '10px', animation: isScannerEnabled ? 'pulse 2s infinite' : 'none' }}>
                            </div>
                            <div>
                                <small className="text-muted d-block fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.05rem' }}>SCANNER STATUS</small>
                                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>
                                    {isScannerEnabled ? 'READY TO SCAN' : 'SCANNER OFF'}
                                </span>
                            </div>
                            <div className="ms-4 ps-4 border-start d-none d-md-block">
                                <small className="text-muted d-block fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.05rem' }}>STATION ID</small>
                                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{formattedStationForDB}</span>
                            </div>
                        </div>
                        <div className="form-check form-switch">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch"
                                checked={isScannerEnabled}
                                onChange={(e) => setIsScannerEnabled(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    {/* Hidden input to catch scanner data */}
                    <form onSubmit={handleScan} className="visually-hidden">
                        <input
                            ref={scannerInputRef}
                            type="text"
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            disabled={!isScannerEnabled || processStatus !== 'idle'}
                        />
                    </form>
                </div>
            </div>

            {/* MAIN FORM */}
            <div className="col-12">
                <form onSubmit={handleSubmit} className="card border-0 shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Unit Data Entry</h6>
                            <div className="text-end" style={{ width: '120px' }}>
                                <div className="d-flex justify-content-between mb-1">
                                    <small className="fw-bold text-muted" style={{ fontSize: '0.6rem' }}>PROGRESS</small>
                                    <small className="fw-bold" style={{ fontSize: '0.6rem' }}>{progressPercent}%</small>
                                </div>
                                <div className="progress" style={{ height: '4px', borderRadius: '0', backgroundColor: '#e9ecef' }}>
                                    <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4 bg-light-subtle">
                        {/* READ-ONLY FIELDS (All inputs are readOnly to prevent manual typing) */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Model</label>
                                <input type="text" className="form-control form-control-sm border-0 bg-light fw-semibold" value={formData.model} readOnly placeholder="Wait for scan..." />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Revision</label>
                                <input type="text" className="form-control form-control-sm border-0 bg-light fw-semibold" value={formData.revision} readOnly placeholder="Wait for scan..." />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Base Kitting No.</label>
                                <input type="text" className="form-control form-control-sm border-0 bg-light fw-semibold" value={formData.baseUnitKittingNo || '-'} readOnly />
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label fw-bold small mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>Assembly No. (Auto-filled)</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm bg-white border-secondary-subtle fw-bold" 
                                    value={formData.assemblyNo} 
                                    readOnly 
                                    placeholder="SCAN QR CODE TO POPULATE"
                                    style={{ padding: '0.5rem', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label text-muted fw-bold small mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>Device Serial No.</label>
                                <input type="text" className="form-control form-control-sm bg-light" value={formData.deviceSerialNo} readOnly />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label text-muted fw-bold small mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>Accessory Kitting No.</label>
                                <input type="text" className="form-control form-control-sm bg-light" value={formData.accessoryKittingNo} readOnly />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold small mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>Status <span className="text-danger">*</span></label>
                                <select className="form-select form-select-sm border-secondary-subtle" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '0.5rem' }}>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="No Good (NG)">No Good (NG)</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold small mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>Remarks</label>
                                <textarea className="form-control form-control-sm border-secondary-subtle" rows="2" placeholder="Auto-populated or optional notes" value={formData.remarks} readOnly></textarea>
                            </div>
                        </div>

                        {statusMessage && (
                            <div className={`mt-3 p-2 border-start border-4 small fw-bold ${processStatus === 'error' ? 'border-danger text-danger' : 'border-success text-success'}`}>
                                {statusMessage.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary px-4 fw-bold" onClick={resetForm} style={{ fontSize: '0.7rem' }}>
                            CLEAR FORM
                        </button>
                        <button type="submit" className="btn btn-sm btn-success px-5 fw-bold shadow-sm" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                            SAVE UNIT
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
                input[readonly] {
                    background-color: #f8f9fa !important;
                    color: #495057;
                    cursor: not-allowed;
                    border: 1px solid #dee2e6 !important;
                }
                .form-select:focus {
                    border-color: #198754 !important;
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
}