import React, { useState } from 'react';

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    // Logic: If unit is Completed/NG, it can only be re-opened to 'Pending Approval' for QA to review.
    const isReopening = unit.status === 'Completed' || unit.status === 'No Good (NG)';
    const initialStatus = isReopening ? 'Pending Approval' : unit.status;
    
    // State management for modal form fields
    const [status, setStatus] = useState(initialStatus);
    const [remarks, setRemarks] = useState(unit.remarks);

    const handleSave = () => {
        onSave(unit.id, { 
            // Pass back original unit details + updated fields
            ...unit, 
            status: status, 
            remarks: remarks,
        });
    };

    // Define allowed status options
    const statusOptions = isReopening 
        ? ["Pending Approval"] 
        : ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        // The d-block and style makes the modal visible when the state is true
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Edit Unit: {unit.device_serial_no || unit.assembly_no}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {isReopening && (
                             <div className="alert alert-warning small py-2 mb-3">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                                This unit is being re-opened for processing. Status must be set to **Pending Approval** for QA validation.
                            </div>
                        )}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Change Status</label>
                            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isReopening}>
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Remarks</label>
                            <textarea className="form-control" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};