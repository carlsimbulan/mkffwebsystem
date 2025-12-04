import React from 'react';

export function DeleteAnnouncementModal({ announcementToDelete, onClose, executeDelete }) {
    if (!announcementToDelete) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-danger d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i> Confirm Deletion
                        </h5>
                        <button type="button" className="btn-close"
                            onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body pt-2 pb-4">
                        <p className="text-dark fw-medium">
                            Are you absolutely sure you want to delete announcement ID <span className="fw-bold text-primary">{announcementToDelete}</span>?
                        </p>
                        <p className="text-muted small mb-0">
                            This action is permanent and cannot be reversed. Please ensure this is the correct item before proceeding.
                        </p>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button type="button" className="btn btn-secondary rounded-pill px-4"
                            onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold"
                            onClick={executeDelete}>
                            <i className="bi bi-trash-fill me-2"></i> Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}