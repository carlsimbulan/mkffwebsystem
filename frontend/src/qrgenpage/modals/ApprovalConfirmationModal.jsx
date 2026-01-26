import React from 'react';

const ApprovalConfirmationModal = ({ unit, onClose, onConfirm, isProcessing }) => {
    if (!unit) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-danger text-white border-0 py-3">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Final Approval Confirmation
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isProcessing}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        <div className="mb-3">
                            <i className="bi bi-shield-check text-danger opacity-25" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <p className="fs-5 text-dark mb-1">Are you sure you want to approve this unit?</p>
                        <div className="bg-light p-3 rounded-3 mb-3 border">
                            <div className="small text-muted text-uppercase fw-bold mb-1">Assembly Number</div>
                            <div className="fs-4 fw-bold text-primary">{unit.assembly_no}</div>
                        </div>
                        <p className="small text-muted">
                            By approving, the status of this unit will be updated to <span className="badge bg-success">Completed</span>. This action will be logged under your account.
                        </p>
                    </div>
                    <div className="modal-footer bg-light border-0 p-3">
                        <button 
                            type="button" 
                            className="btn btn-link text-muted fw-bold text-decoration-none px-4" 
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            CANCEL
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-danger px-4 rounded-pill fw-bold shadow-sm"
                            onClick={() => onConfirm(unit)}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : <i className="bi bi-check-lg me-2"></i>}
                            CONFIRM APPROVAL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalConfirmationModal;