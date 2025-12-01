import React, { useState } from 'react';
// Ang import ng LogOut, LayoutGrid, Factory ay hindi na kailangan dito

// --- Sub-Component for consistent styling of read-only fields ---
// INILAGAY ITO SA UNAHAN AT IISANG BESES LANG
const DetailField = ({ label, value, icon, monospace }) => (
    <div className="d-flex align-items-center py-2 border-bottom border-light">
        <i className={`bi ${icon} me-3 text-primary opacity-75`}></i>
        <div>
            <div className="small text-muted mb-0 lh-1" style={{fontSize: '0.7rem'}}>{label}</div>
            <div className={`fw-bold text-dark ${monospace ? 'font-monospace small' : 'fs-6'}`}>
                {value}
            </div>
        </div>
    </div>
);


// --- Edit Unit Modal Component (Enhanced UI) ---
export const EditUnitModal = ({ unit, onClose, onSave }) => {

    const [formData, setFormData] = useState(unit ? { 
        status: unit.status,
        remarks: unit.remarks,
        model: unit.model,
        revision: unit.revision,
        base_unit_kitting_no: unit.base_unit_kitting_no,
        assembly_no: unit.assembly_no,
        device_serial_no: unit.device_serial_no,
        accessory_kitting_no: unit.accessory_kitting_no,
        station: unit.station,
    } : {});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Ipadala ang buong updated form data
        onSave(unit.id, formData);
    };

    if (!unit) return null;

    // Available statuses 
    const statusOptions = ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    // Check ulit kung Completed/NG para lang sa WARNING MESSAGE
    const isCompletedOrNGForWarning = unit.status.includes('Completed') || unit.status.includes('No Good');


    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Header: Professional Primary Color */}
                    <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className="bi bi-pencil-square me-2"></i> Unit Edit: {unit.model}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        
                        {/* Unit Identifier */}
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                            <h6 className="fw-bold text-dark mb-0">
                                <span className="text-secondary me-2">Serial:</span> 
                                <span className="font-monospace bg-light p-1 rounded border">{unit.device_serial_no || 'N/A'}</span>
                            </h6>
                            <div className="small text-muted">
                                <i className="bi bi-geo-alt-fill me-1"></i> Current Station: <span className="fw-bold text-primary">{unit.station}</span>
                            </div>
                        </div>

                        <div className="row g-4">
                            
                            {/* LEFT COLUMN: Core Read-Only Details (Technical Specs) */}
                            <div className="col-lg-5">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Technical Details</h6>
                                <div className="card shadow-sm border-0 rounded-3 bg-white p-3">
                                    <DetailField label="Model / Revision" value={`${unit.model} (${unit.revision})`} icon="bi-tag-fill" />
                                    <DetailField label="Assembly No." value={unit.assembly_no} icon="bi-puzzle-fill" monospace />
                                    <DetailField label="Base Unit Kitting" value={unit.base_unit_kitting_no || 'N/A'} icon="bi-box-seam" monospace />
                                    <DetailField label="Accessory Kitting" value={unit.accessory_kitting_no || 'N/A'} icon="bi-plus-square" monospace />
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Editable Status & Remarks */}
                            <div className="col-lg-7">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Action & Status Update</h6>
                                <form>
                                    {/* Status Selector */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold d-flex align-items-center text-dark">
                                            <i className="bi bi-toggles me-2 text-primary"></i> Current Status
                                        </label>
                                        <select 
                                            className="form-select form-select-lg" 
                                            name="status" 
                                            value={formData.status} 
                                            onChange={handleChange}
                                            // Status is now fully editable (as requested)
                                        >
                                            {statusOptions.map(opt => (
                                                <option 
                                                    key={opt} 
                                                    value={opt}
                                                    className={opt.includes('Completed') ? 'text-success' : opt.includes('NG') ? 'text-danger' : opt.includes('Progress') ? 'text-warning' : 'text-info'}
                                                >
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                        {isCompletedOrNGForWarning && 
                                            <small className="text-warning fw-bold mt-2 d-block">
                                                <i className="bi bi-info-circle me-1"></i> Warning: Changing status from Completed/NG requires careful review.
                                            </small>
                                        }
                                    </div>

                                    {/* Remarks Textarea */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold d-flex align-items-center text-dark">
                                            <i className="bi bi-chat-left-text me-2 text-primary"></i> Remarks / Notes
                                        </label>
                                        <textarea 
                                            className="form-control" 
                                            name="remarks" 
                                            rows="4" 
                                            value={formData.remarks || ''} 
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                    
                    {/* Footer */}
                    <div className="modal-footer bg-white border-top-0 justify-content-end p-4">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={onClose}>
                            Close
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" 
                            onClick={handleSave}
                        >
                            <i className="bi bi-save me-2"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};