import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// The helper functions are no longer needed since reports logic is removed,
// but they are kept here for completeness, in case they are used elsewhere.
const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
};

const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const NotificationContent = ({ notifications, onNotificationClick }) => {
    
    // Filter only Delayed Units
    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const totalCount = delayedUnits.length; // Now only counts delayed units

    // Helper to render individual notification item (No functional change)
    const notificationItem = (n) => {
        const isUrgent = n.type === 'DelayedUnit';
        // Reports are excluded, so all rendered items are Urgent/Danger
        const color = 'danger'; 
        const icon = 'bi-clock-history';
        const titleColor = 'text-danger';

        return (
            <li 
                key={n.id} 
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-bottom`}
                style={{cursor: 'pointer', transition: 'background-color 0.2s ease'}}
                onClick={() => onNotificationClick(n)}
            >
                {/* Icon */}
                <div className={`bg-${color} bg-opacity-10 text-${color} rounded-3 p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                    <i className={`bi ${icon} fs-5`}></i>
                </div>
                
                {/* Content */}
                <div className="flex-grow-1 text-start">
                    <h6 className={`mb-1 fw-bold ${titleColor}`}>{n.title}</h6>
                    <p className="mb-0 text-muted small text-truncate" style={{maxWidth: '90%'}}>{n.message}</p>
                </div>
                
                {/* Timestamp & Tag */}
                <div className="text-end ms-3 flex-shrink-0">
                    <small className="d-block text-secondary" style={{fontSize: '0.7rem'}}>
                        {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                    <span className={`badge bg-${color} rounded-pill fw-normal mt-1`} style={{fontSize: '0.65rem'}}>
                        URGENT ALERT
                    </span>
                </div>
            </li>
        );
    };

    return (
        <div className="animate-in fade-in pb-5">
            
            {/* --- TOP HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h3 className="fw-bold text-dark d-flex align-items-center mb-0">
                    {/* The count is now only for Delayed Units */}
                    <i className="bi bi-bell-fill me-2 text-primary"></i>
                    System Alerts (Delayed Units: {totalCount})
                </h3>
            </div>

            {/* --- EMPTY STATE --- */}
            {totalCount === 0 && (
                // Removed 'shadow-lg' from the card
                <div className="card border-success bg-white rounded-4">
                    <div className="text-center py-5">
                        <i className="bi bi-check-circle display-4 text-success opacity-50"></i>
                        <h4 className="mt-3 fw-bold text-dark">All Clear!</h4>
                        
                    </div>
                </div>
            )}

            {/* --- CONTENT LAYOUT (Now a single column) --- */}
            {totalCount > 0 && (
                <div className="row g-4">
                    
                    {/* The single column now takes the full width on large screens */}
                    <div className="col-lg-12"> 
                        {/* Removed 'shadow-lg' from the card */}
                        <div className="card border-0 rounded-4 overflow-hidden h-100">
                            {/* Header: Danger/Red */}
                            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center py-3">
                                <h5 className="mb-0 fw-bold"><i className="bi bi-clock-fill me-2"></i> Delayed Units ({delayedUnits.length})</h5>
                            </div>
                            <ul className="list-group list-group-flush border-0">
                                {delayedUnits.length > 0 ? (
                                    delayedUnits.map(notificationItem)
                                ) : (
                                    <li className="list-group-item text-center py-4 text-muted small fst-italic">
                                        No active unit delays detected.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN (New Daily Reports) has been REMOVED */}

                </div>
            )}
            
            {/* 💡 REMOVED custom CSS for hover-shadow-sm */}
            
        </div>
    );
};