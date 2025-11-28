import React, { useState } from 'react';

// --- Edit Unit Modal Component ---
// This component assumes you've passed necessary props and constants (API_BASE_URL is not needed here)
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
        onSave(unit.id, formData);
    };

    if (!unit) return null;

    const statusOptions = ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Edit Unit: {unit.device_serial_no}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted small">ID: {unit.id} | Station: {unit.station}</p>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Model</label>
                                <input type="text" className="form-control" name="model" value={formData.model || ''} onChange={handleChange} readOnly />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Remarks</label>
                                <textarea className="form-control" name="remarks" value={formData.remarks || ''} onChange={handleChange}></textarea>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-danger" onClick={handleSave}>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};