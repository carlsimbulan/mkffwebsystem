import React from 'react';

// --- UPDATED: Delete User Modal (Adjusted Size for Better UX) ---
export const DeleteUserModal = ({ user, onClose, onDelete }) => {
    const isProtected = user.id === 1; // Assume ID 1 is the main admin

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1070, backdropFilter: 'blur(3px)' }}>
            {/* REMOVED: modal-sm to use default/medium size */}
            <div className="modal-dialog modal-dialog-centered"> 
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Header: Warning Accent */}
                    <div className="modal-header bg-danger text-white border-0 py-3">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> PERMANENT DELETION
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    {/* Body: Confirmation Details */}
                    <div className="modal-body p-4 text-center">
                        <div className="mb-3">
                            {/* Icon for visual impact */}
                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
                                <i className="bi bi-trash-fill display-5"></i>
                            </div>
                        </div>

                        <p className="fw-bold fs-5 text-dark mb-1">
                            Are you sure you want to delete?
                        </p>
                        <p className="text-muted small">
                            You are about to remove the account:
                        </p>

                        <div className="bg-light p-3 rounded-3 mb-3 border"> {/* Increased padding slightly here for better look */}
                            <p className="fw-bold text-danger mb-0 text-truncate">{user.full_name || 'N/A'} <span className="text-muted fw-normal">(@{user.username})</span></p>
                            <p className="small text-muted mb-0">Role: {user.role}</p>
                        </div>
                        
                        {isProtected && (
                            <div className="alert alert-warning small fw-bold mt-3">
                                🔒 Cannot delete System Administrator (ID 1).
                            </div>
                        )}
                    </div>
                    
                    {/* Footer: Action Buttons */}
                    <div className="modal-footer justify-content-center border-top-0 pt-0">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary px-4 rounded-pill fw-bold" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger px-4 rounded-pill fw-bold shadow-sm"
                            onClick={() => onDelete(user.id)}
                            disabled={isProtected} // Disable if protected
                        >
                            <i className="bi bi-trash me-2"></i> Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
            {/* Custom Styles for Animation */}
            <style jsx>{`
                .fade-in { animation: fadeIn 0.2s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};