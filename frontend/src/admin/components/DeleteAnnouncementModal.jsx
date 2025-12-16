import React from 'react';

export function DeleteAnnouncementModal({ announcementToDelete, onClose, executeDelete }) {
    // 1. Ensure the object exists before rendering
    if (!announcementToDelete) return null;

    // Get the first 50 characters of the content for display context
    const contentPreview = announcementToDelete.content 
        ? announcementToDelete.content.substring(0, 50) + (announcementToDelete.content.length > 50 ? '...' : '') 
        : 'this announcement';
        
    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-danger d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i> Confirm Deletion
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close"
                            onClick={onClose} 
                            aria-label="Close"
                        ></button>
                    </div>
                    
                    <div className="modal-body pt-2 pb-4">
                        {/* 💡 FIX: Removed 'announcementToDelete.id' and replaced with simplified confirmation. */}
                        <p className="text-dark fw-medium fs-5">
                            Are you sure you want to delete this announcement?
                        </p>
                        
                        {/* Optional: Show a preview of the content for better confirmation */}
                         <p className="text-muted small mb-3 p-2 border-start border-3 border-secondary-subtle bg-light rounded">
                            <span className="fw-bold me-1">Content Preview:</span> "{contentPreview}"
                        </p>
                        
                        <p className="text-danger small mb-0 fw-bold">
                            Warning: This action is permanent and cannot be reversed.
                        </p>
                    </div>
                    
                    <div className="modal-footer border-0 pt-0">
                        <button 
                            type="button" 
                            className="btn btn-secondary rounded-pill px-4"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-danger rounded-pill px-4 fw-bold"
                            onClick={executeDelete} 
                        >
                            <i className="bi bi-trash-fill me-2"></i> Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}