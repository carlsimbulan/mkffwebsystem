import React from 'react';

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
    scannedUnitId
}) {
    const essentialFields = [formData.model, formData.revision, formData.assemblyNo];
    const progressPercent = Math.min((essentialFields.filter(val => val && val.trim() !== "").length / essentialFields.length) * 100, 100).toFixed(0);

    return (
        <div className="row g-4 animate-in fade-in">
            <div className="col-12">
                <div className="card shadow-sm p-4 border-primary">
                    <label className="form-label fw-bold text-primary small"><i className="bi bi-upc-scan me-2"></i>SCAN QR / 2D BARCODE</label>
                    <form onSubmit={handleScan} className="d-flex gap-3">
                        <input
                            ref={scannerInputRef}
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Scan here..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            disabled={processStatus !== 'idle'}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" disabled={processStatus !== 'idle'}>Process</button>
                    </form>
                    {statusMessage && processStatus !== 'loading' && <p className={`mt-2 small ${processStatus === 'error' ? 'text-danger' : 'text-success'}`}>{statusMessage}</p>}
                </div>
            </div>
            <div className="col-12">
                <form onSubmit={handleSubmit} className="card shadow-sm p-4 border-top border-secondary">
                    <div className="border-bottom pb-3 mb-4"><h5 className="card-title fw-bold text-dark">Unit Data Entry</h5></div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">COMPLETION</label>
                        <div className="progress" style={{ height: '15px' }}>
                            <div className={`progress-bar ${progressPercent < 100 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${progressPercent}%` }}>{progressPercent}%</div>
                        </div>
                    </div>
                    <div className="row g-3">
                        <div className="col-md-6"><label className="form-label small text-muted">Model</label><input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.model} readOnly /></div>
                        <div className="col-md-6"><label className="form-label small text-muted">Revision</label><input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.revision} readOnly /></div>
                        <div className="col-12"><label className="form-label fw-bold">Assembly No. *</label><input type="text" className="form-control" value={formData.assemblyNo} onChange={(e) => setFormData({ ...formData, assemblyNo: e.target.value })} required disabled={processStatus !== 'idle'} /></div>
                        <div className="col-12"><label className="form-label fw-bold">Device Serial No. (Opt)</label><input type="text" className="form-control" value={formData.deviceSerialNo} onChange={(e) => setFormData({ ...formData, deviceSerialNo: e.target.value })} disabled={processStatus !== 'idle'} /></div>
                        <div className="col-12"><label className="form-label fw-bold">Accessory Kitting No. (Opt)</label><input type="text" className="form-control" value={formData.accessoryKittingNo} onChange={(e) => setFormData({ ...formData, accessoryKittingNo: e.target.value })} disabled={processStatus !== 'idle'} /></div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Status *</label>
                            <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} disabled={processStatus !== 'idle'}>
                                <option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="No Good (NG)">No Good (NG)</option><option value="Pending Approval">Pending Approval</option>
                            </select>
                        </div>
                        <div className="col-12"><label className="form-label fw-bold">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} disabled={processStatus !== 'idle'}></textarea></div>
                        <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={processStatus !== 'idle'}>Clear</button>
                            <button type="submit" className="btn btn-success" disabled={processStatus !== 'idle' || !formData.assemblyNo}>Save Unit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}