import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function ApproveUnitModal({ selectedLogToApprove, onClose, onApprove }) {
    if (!selectedLogToApprove) return null;

    return (
        <div 
            className="modal show d-block" 
            tabIndex="-1" 
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Plain dark overlay
                zIndex: 1060
            }}
        >
            <div className="modal-dialog modal-dialog-centered">
                {/* Inalis ang shadow-lg at ginawang plain border lang */}
                <div className="modal-content border rounded-1 overflow-hidden">
                    
                    <div className="modal-body p-4 bg-white text-start">
                        {/* Header: Simple text lang */}
                        <div className="mb-3">
                            <h5 className="fw-bold text-dark mb-1">Approval Confirmation</h5>
                            <div className="text-muted small">Production Workflow Release</div>
                        </div>
                        
                        <div className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
                            Confirm approval to release this unit back to the production queue.
                        </div>
                        
                        {/* Highlights: Simple Boxes, No shadows */}
                        <div className="border rounded-1 p-3 mb-4 bg-light">
                            <div className="row g-0">
                                <div className="col-6">
                                    <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Assembly No.</div>
                                    <div className="fw-bold text-dark">{selectedLogToApprove.assembly_no}</div>
                                </div>
                                <div className="col-6 border-start ps-3">
                                    <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Model Name</div>
                                    <div className="fw-bold text-dark">{selectedLogToApprove.model}</div>
                                </div>
                            </div>
                        </div>

                        {/* Plain Information Text */}
                        <div className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-info-circle me-2"></i>
                            Unit status will be set to In Progress.
                        </div>
                        
                        {/* Footer Buttons: Plain Box-Style */}
                        <div className="d-flex gap-2 justify-content-end border-top pt-3">
                            <button
                                className="btn btn-outline-secondary px-4 rounded-1"
                                onClick={onClose}
                                style={{ fontSize: '0.9rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success px-4 rounded-1"
                                onClick={onApprove}
                                style={{ fontSize: '0.9rem' }}
                            >
                                Confirm & Release
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}