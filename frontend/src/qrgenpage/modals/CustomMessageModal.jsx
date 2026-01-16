import React from 'react';

const CustomMessageModal = ({ title, message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-info'; 
    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-x-octagon-fill' : 'bi-info-circle-fill';

    return (
        <div className="modal d-block animate-in fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                    <div className={`modal-header ${bgColor} text-white border-0 rounded-top-2`}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className={`${icon} me-2`}></i> {title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <p className="mb-0 text-dark fw-medium">{message}</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomMessageModal;