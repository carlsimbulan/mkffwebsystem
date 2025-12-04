import React from 'react';

export function ApproveUnitModal({ selectedLogToApprove, onClose, onApprove }) {
    if (!selectedLogToApprove) return null;

    return (
        <div className="modal show d-block fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-body p-4 text-center">
                        <div className="mb-3">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                <i className="bi bi-arrow-repeat display-4"></i>
                            </div>
                        </div>
                        <h4 className="fw-bold text-dark">Approve & Resume?</h4>
                        <p className="text-muted">
                            Are you sure you want to approve <br />
                            <span className="fw-bold text-dark">{selectedLogToApprove.model}</span> - <span className="font-monospace text-dark bg-light px-2 rounded">{selectedLogToApprove.device_serial_no}</span>?
                        </p>
                        <p className="small text-muted mb-4">
                            This action will release the unit from QA Hold and return its status to <strong>"In Progress"</strong>.
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                className="btn btn-light border px-4 rounded-pill fw-bold"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success px-4 rounded-pill fw-bold shadow-sm"
                                onClick={onApprove}
                            >
                                <i className="bi bi-check-circle me-1"></i> Yes, Set to In Progress
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}