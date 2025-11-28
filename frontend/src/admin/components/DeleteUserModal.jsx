import React from 'react';

// --- NEW: Delete User Modal ---
export const DeleteUserModal = ({ user, onClose, onDelete }) => {
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title">Confirm Deletion</h5>
                        <button type="button" className="btn-close btn-close-dark" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to **permanently delete** the user:</p>
                        <p className="fw-bold text-danger mb-0">{user.full_name} ({user.username})?</p>
                        <p className="small text-muted">ID: {user.id} | Role: {user.role}</p>
                        {user.id === 1 && <div className="alert alert-danger small mt-2">Cannot delete the primary system admin (ID 1).</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => onDelete(user.id)}
                            disabled={user.id === 1} // Disable deletion for ID 1
                        >
                            <i className="bi bi-trash"></i> Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};