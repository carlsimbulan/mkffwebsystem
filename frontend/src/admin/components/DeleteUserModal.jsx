import React from 'react';

export const DeleteUserModal = ({ user, onClose, onDelete }) => {
    if (!user) return null;
    const isProtected = user.id === 1;

    return (
        <div 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(4px)', // Ang "background blur" na gusto mo
                display: 'flex',
                alignItems: 'center',    // Vertical center
                justifyContent: 'center',  // Horizontal center
                zIndex: 1070,
                padding: '1rem'
            }}
        >
            <div 
                style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}
            >
                {/* Header: Malinis at Simple */}
                <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-semibold text-dark" style={{ fontSize: '1.2rem' }}>
                        Delete User?
                    </h5>
                    <button 
                        type="button" 
                        className="btn-close shadow-none" 
                        style={{ fontSize: '0.8rem' }}
                        onClick={onClose}
                    ></button>
                </div>

                {/* Body */}
                <div className="px-4 pb-3 text-center">
                    <p className="text-secondary mb-3 text-start" style={{ fontSize: '0.95rem' }}>
                        You are about to permanently remove this account. This action cannot be undone.
                    </p>
                    
                    {/* User Info Box */}
                    <div 
                        className="p-3 mb-2 rounded-3 border text-start" 
                        style={{ backgroundColor: '#f8f9fa' }}
                    >
                        <p className="fw-bold text-danger mb-0 text-truncate">
                            {user.full_name || 'N/A'} 
                            <span className="text-muted fw-normal ms-1">(@{user.username})</span>
                        </p>
                        <p className="small text-muted mb-0">Role: {user.role}</p>
                    </div>

                    {isProtected && (
                        <div className="alert alert-warning py-2 small fw-bold mt-2 mb-0">
                            🔒 System Admin cannot be deleted.
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 pt-2 d-flex gap-2">
                    <button 
                        type="button" 
                        className="btn btn-light border flex-grow-1 fw-medium text-secondary"
                        style={{ borderRadius: '8px', padding: '10px' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-danger flex-grow-1 fw-medium"
                        style={{ 
                            borderRadius: '8px', 
                            padding: '10px',
                            backgroundColor: isProtected ? '#ea868f' : '#dc3545',
                            border: 'none'
                        }}
                        onClick={() => onDelete(user.id)}
                        disabled={isProtected}
                    >
                        Delete User
                    </button>
                </div>
            </div>
        </div>
    );
};