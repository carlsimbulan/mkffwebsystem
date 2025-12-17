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
        <i className={`bi ${icon} me-3 text-primary opacity-75`}></i>
        <div>
            <div className="small text-muted mb-0 lh-1" style={{fontSize: '0.7rem'}}>{label}</div>
            <div className={`fw-bold text-dark ${monospace ? 'font-monospace small' : 'fs-6'}`}>
                {value}
            </div>
        </div>
    </div>
);

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    // Kinukuha natin ang initial station ID mula sa unit data
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
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleSave = () => {
        // Ipinapasa ang formData kung saan ang 'station' field ay naglalaman na ng ID (e.g., "Station1")
        onSave(unit.id, formData);
    };

    if (!unit) return null;

    const statusOptions = ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];
    const isCompletedOrNGForWarning = unit.status.includes('Completed') || unit.status.includes('No Good');

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className="bi bi-pencil-square me-2"></i> 
                            Unit Edit: {unit.assembly_no}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                            <h6 className="fw-bold text-dark mb-0">
                                <span className="text-secondary me-2">Serial:</span> 
                                <span className="font-monospace bg-white p-1 rounded border">{unit.device_serial_no || 'N/A'}</span>
                            </h6>
                            <div className="small text-muted">
                                <i className="bi bi-geo-alt-fill me-1 text-primary"></i> 
                                Current DB ID: <span className="fw-bold text-primary">{unit.station}</span>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-lg-5">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Technical Details</h6>
                                <div className="card shadow-sm border-0 rounded-3 bg-white p-3">
                                    <DetailField label="Model / Revision" value={`${unit.model} (${unit.revision})`} icon="bi-tag-fill" />
                                    <DetailField label="Assembly No." value={unit.assembly_no} icon="bi-puzzle-fill" monospace />
                                    <DetailField label="Base Unit Kitting" value={unit.base_unit_kitting_no || 'N/A'} icon="bi-box-seam" monospace />
                                    <DetailField label="Accessory Kitting" value={unit.accessory_kitting_no || 'N/A'} icon="bi-plus-square" monospace />
                                </div>
                            </div>

                            <div className="col-lg-7">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Admin Override</h6>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold d-flex align-items-center text-dark">
                                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i> Change Station
                                    </label>
                                    <select 
                                        className="form-select form-select-lg border-primary-subtle shadow-sm" 
                                        name="station" 
                                        value={formData.station} 
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Station</option>
                                        {processStations.map((st) => (
                                            /* Ang 'value' ay ang ID (Station1) at ang display text ay ang Name (PCB Pairing) */
                                            <option key={st.id} value={st.id}>
                                                {st.id} - {st.name}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted mt-1 d-block" style={{fontSize: '0.65rem'}}>
                                        Updating this will save the Station ID (e.g., Station1) to the database.
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold d-flex align-items-center text-dark">
                                        <i className="bi bi-toggles me-2 text-primary"></i> Update Status
                                    </label>
                                    <select 
                                        className="form-select form-select-lg" 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange}
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-0">
                                    <label className="form-label fw-bold d-flex align-items-center text-dark">
                                        <i className="bi bi-chat-left-text me-2 text-primary"></i> Remarks
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        name="remarks" 
                                        rows="3" 
                                        value={formData.remarks || ''} 
                                        onChange={handleChange}
                                        placeholder="Reason for station transfer..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer bg-white border-top-0 justify-content-end p-4">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={onClose}>
                            Close
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" 
                            onClick={handleSave}
                        >
                            <i className="bi bi-save me-2"></i> Save & Update DB
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};