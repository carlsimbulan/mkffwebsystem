import React, { useState } from 'react';

// List of station names with their corresponding IDs for the database
const processStations = [
    { id: "Station1", name: "PCB Pairing" },
    { id: "Station2", name: "Integrated Board Test" },
    { id: "Station3", name: "Main Board Conformal Coating" },
    { id: "Station4", name: "RTV Application" },
    { id: "Station5", name: "Casing/Harnessing" },
    { id: "Station6", name: "Complete Unit Test/Calibration" },
    { id: "Station7", name: "Pre BI Hi-Pot Test" },
    { id: "Station8", name: "Burn-in Testing" },
    { id: "Station9", name: "Sealing" },
    { id: "Station10", name: "Post BI Hi-Pot Test" },
    { id: "Station11", name: "Final Functional/Connectivity Test" },
    { id: "Station12", name: "Label Sticker Attachment" },
    { id: "Station13", name: "FVI" },
    { id: "Station14", name: "Packing" },
    { id: "Station15", name: "QC Stamping" }
];

const DetailField = ({ label, value, icon, monospace }) => (
    <div className="d-flex align-items-center py-2 border-bottom border-light">
        <i className={`bi ${icon} me-3 text-primary opacity-75`} style={{ fontSize: '1.1rem' }}></i>
        <div className="overflow-hidden">
            <div className="small text-muted mb-0 lh-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{label}</div>
            <div className={`fw-bold text-dark text-truncate ${monospace ? 'font-monospace small' : 'fs-6'}`}>
                {value || 'N/A'}
            </div>
        </div>
    </div>
);

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        status: unit?.status || '',
        remarks: unit?.remarks || '',
        model: unit?.model || '',
        revision: unit?.revision || '',
        base_unit_kitting_no: unit?.base_unit_kitting_no || '',
        assembly_no: unit?.assembly_no || '',
        device_serial_no: unit?.device_serial_no || '',
        accessory_kitting_no: unit?.accessory_kitting_no || '',
        station: unit?.station || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Logic: If status is set to "For Scanning", automatically set station to "N/A"
        if (name === 'status' && value === 'For Scanning') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                station: 'N/A' 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        onSave(unit.id, formData);
    };

    if (!unit) return null;

    // Added "For Scanning" to the status options
    const statusOptions = ["In Progress", "Completed", "No Good (NG)", "Pending Approval", "For Scanning"];

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Compact Header */}
                    <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className="bi bi-pencil-square me-2"></i> 
                            Override Unit Details
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        <div className="row g-4">
                            
                            {/* Left Column: Technical Details */}
                            <div className="col-lg-5">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Technical Details</h6>
                                <div className="card shadow-sm border-0 rounded-3 bg-white p-3 h-100">
                                    <DetailField label="Model" value={unit.model} icon="bi-cpu" />
                                    <DetailField label="Revision" value={unit.revision} icon="bi-info-circle" />
                                    <DetailField label="Device Serial No." value={unit.device_serial_no} icon="bi-hash" monospace />
                                    <DetailField label="Assembly No." value={unit.assembly_no} icon="bi-clipboard-data" monospace />
                                    <DetailField label="Base Unit Kitting" value={unit.base_unit_kitting_no} icon="bi-box-seam" monospace />
                                    <DetailField label="Accessory Kitting" value={unit.accessory_kitting_no} icon="bi-tools" monospace />
                                </div>
                            </div>

                            {/* Right Column: Admin Override Inputs */}
                            <div className="col-lg-7">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Admin Override</h6>
                                
                                <div className="card shadow-sm border-0 rounded-3 bg-white p-3">
                                    {/* Station Dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark d-flex align-items-center">
                                            <i className="bi bi-geo-alt-fill me-2 text-primary"></i> Current Station: <span className="ms-2 badge bg-primary-subtle text-primary border border-primary-subtle">{unit.station}</span>
                                        </label>
                                        <select 
                                            className="form-select form-select-lg border-primary-subtle shadow-sm fs-6" 
                                            name="station" 
                                            value={formData.station} 
                                            onChange={handleChange}
                                            disabled={formData.status === 'For Scanning'} // Disable selection if "For Scanning" is active
                                        >
                                            <option value="">Transfer to Station...</option>
                                            <option value="N/A">N/A - No Station</option>
                                            {processStations.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.id} - {st.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Dropdown */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-dark">
                                            <i className="bi bi-activity me-2 text-primary"></i> Update Status
                                        </label>
                                        <select 
                                            className="form-select form-select-lg fs-6" 
                                            name="status" 
                                            value={formData.status} 
                                            onChange={handleChange}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Remarks Textarea */}
                                    <div className="mb-0">
                                        <label className="form-label fw-bold small text-dark">
                                            <i className="bi bi-chat-dots me-2 text-primary"></i> Admin Remarks
                                        </label>
                                        <textarea 
                                            className="form-control border-light-subtle" 
                                            name="remarks" 
                                            rows="3" 
                                            value={formData.remarks || ''} 
                                            onChange={handleChange} 
                                            placeholder="Indicate reason for override..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="modal-footer bg-white border-top-0 justify-content-end p-4">
                        <button type="button" className="btn btn-light px-4 rounded-pill fw-bold text-muted" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" 
                            onClick={handleSave}
                        >
                            <i className="bi bi-cloud-arrow-up-fill me-2"></i>Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};