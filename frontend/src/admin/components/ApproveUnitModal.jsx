import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Make sure this is imported if not globally available

export function ApproveUnitModal({ selectedLogToApprove, onClose, onApprove }) {
    if (!selectedLogToApprove) return null;

    return (
        // Consistent backdrop and fade-in effect
        <div className="modal show d-block fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                {/* Consistent styling: Rounded-4, Shadow-lg */}
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Header (Optional, but helps with consistency) - Removed to keep it simple and focused */}
                    <div className="modal-body p-5 text-center bg-white">
                        
                        {/* ICON: Success Green for Approval/Release */}
                        <div className="mb-4">
                            <div 
                                className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center p-3" 
                                style={{ width: 90, height: 90, border: '3px solid rgba(25, 135, 84, 0.1)' }}
                            >
                                {/* Changed icon to bi-arrow-clockwise for 'set to In Progress' (cycle) */}
                                <i className="bi bi-arrow-clockwise display-5"></i> 
                            </div>
                        </div>
                        
                        {/* Title & Description */}
                        <h4 className="fw-bolder text-dark mb-3">Confirm Release and Resume Production</h4>
                        
                        <p className="text-muted fs-6 mx-auto" style={{maxWidth: '350px'}}>
                            Are you sure you want to **approve** and **re-queue** the following unit?
                        </p>
                        
                        {/* Item Details Card */}
                        <div className="card bg-light border-0 shadow-sm p-3 mb-4 mx-auto" style={{maxWidth: '80%'}}>
                            <div className="small text-uppercase text-muted">Unit ID:</div>
                            <h5 className="mb-0 fw-bold text-dark">
                                {selectedLogToApprove.model}
                            </h5>
                            <div className="font-monospace text-primary fw-bold mt-1">
                                S/N: {selectedLogToApprove.device_serial_no}
                            </div>
                        </div>

                        <p className="small text-secondary mb-4">
                            This action will update the unit status from QA Hold to 
                            <strong className="text-success ms-1">"In Progress"</strong>, allowing it to proceed to the next stage.
                        </p>
                        
                        {/* Buttons */}
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-outline-secondary px-4 rounded-pill fw-bold hover-scale"
                                onClick={onClose}
                            >
                                <i className="bi bi-x me-1"></i> Cancel
                            </button>
                            <button
                                className="btn btn-success px-4 rounded-pill fw-bold shadow-sm hover-scale"
                                onClick={onApprove}
                            >
                                <i className="bi bi-check-circle-fill me-1"></i> Approve & Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             <style jsx>{`
                .hover-scale:hover { transform: translateY(-2px); transition: transform 0.2s; }
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}