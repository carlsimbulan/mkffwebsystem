import React from 'react';

const ApprovalConfirmationModal = ({ unit, onClose, onConfirm, isProcessing }) => {
    if (!unit) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white border-0 py-3">
                        <h6 className="modal-title fw-bold mb-0">
                            <i className="bi bi-check-circle me-2"></i>
                            Approval Confirmation
                        </h6>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isProcessing}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="text-center mb-4">
                            <i className="bi bi-shield-check text-primary opacity-50" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <p className="text-center mb-3" style={{ fontSize: '1rem' }}>
                            Are you sure you want to approve this unit?
                        </p>
                        <div className="bg-light p-3 rounded mb-3">
                            <div className="small text-muted mb-1">Assembly Number</div>
                            <div className="h5 fw-bold text-dark mb-0">{unit.assembly_no}</div>
                        </div>
                        <p className="small text-muted text-center mb-0">
                            This unit will be marked as approved and returned to production.
                        </p>
                    </div>
                    <div className="modal-footer border-0 p-3">
                        <button 
                            type="button" 
                            className="btn btn-light text-muted fw-bold" 
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary fw-bold"
                            onClick={() => onConfirm(unit)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Approve
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalConfirmationModal;