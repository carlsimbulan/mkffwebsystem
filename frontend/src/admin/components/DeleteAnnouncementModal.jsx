import React from 'react';

export function DeleteAnnouncementModal({ announcementToDelete, onClose, executeDelete }) {
    if (!announcementToDelete) return null;

    return (
        <div 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // Neutral grey-dark overlay with background blur
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',    // Vertical center
                justifyContent: 'center',  // Horizontal center
                zIndex: 9999,
                padding: '1rem'
            }}
        >
            <div 
                style={{ 
                    width: '100%', 
                    maxWidth: '380px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',           // Flat style radius
                    border: '1px solid #dee2e6',   // Clean solid border
                    boxShadow: 'none',             // Removed all shadow/glow
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                        Delete Announcement?
                    </h5>
                    <button 
                        type="button" 
                        className="btn-close shadow-none" 
                        style={{ fontSize: '0.8rem' }}
                        onClick={onClose}
                    ></button>
                </div>

                {/* Body */}
                <div className="px-4 pb-3">
                    <p className="text-secondary m-0" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Are you sure you want to remove this? This action is permanent and cannot be undone.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 pt-2 d-flex gap-2">
                    <button 
                        type="button" 
                        className="btn btn-light border flex-grow-1 fw-medium text-secondary shadow-none"
                        style={{ 
                            borderRadius: '4px', 
                            padding: '10px',
                            boxShadow: 'none' 
                        }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-danger flex-grow-1 fw-medium shadow-none"
                        style={{ 
                            borderRadius: '4px', 
                            padding: '10px',
                            backgroundColor: '#dc3545',
                            border: 'none',
                            boxShadow: 'none'
                        }}
                        onClick={executeDelete} 
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}