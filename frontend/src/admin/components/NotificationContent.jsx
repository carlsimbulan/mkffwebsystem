import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const NotificationContent = ({ notifications, onDismissAll, onClearReports, onClearDelayed, onNotificationClick }) => {
    
    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const newReports = notifications.filter(n => n.type === 'NewReport');
    const totalCount = notifications.length;

    // Helper to render individual notification item
    const notificationItem = (n) => {
        const isUrgent = n.type === 'DelayedUnit';
        // Consistent colors: Danger for urgent, Primary for general info
        const color = isUrgent ? 'danger' : 'primary';
        const icon = isUrgent ? 'bi-clock-history' : 'bi-file-earmark-bar-graph';
        const titleColor = isUrgent ? 'text-danger' : 'text-dark';

        return (
            <li 
                key={n.id} 
                // Removed extra hover styles for cleaner look
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
                        {isUrgent ? 'URGENT ALERT' : 'NEW REPORT'}
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
                    {/* Primary color for general notification icon */}
                    <i className="bi bi-bell-fill me-2 text-primary"></i>
                    System Alerts & Notifications
                </h3>
                {/* Clear All button is less aggressive (secondary) but functional */}
                <button 
                    className="btn btn-outline-secondary px-4 rounded-pill fw-bold" 
                    onClick={onDismissAll} 
                    disabled={totalCount === 0}
                >
                    <i className="bi bi-trash-fill me-1"></i> Clear All ({totalCount})
                </button>
            </div>

            {/* --- EMPTY STATE --- */}
            {totalCount === 0 && (
                <div className="card shadow-lg border-success bg-white rounded-4">
                    <div className="text-center py-5">
                        <i className="bi bi-check-circle display-4 text-success opacity-50"></i>
                        <h4 className="mt-3 fw-bold text-dark">All Clear!</h4>
                        <p className="text-muted">Walang active system alerts o pending new reports.</p>
                    </div>
                </div>
            )}

            {/* --- CONTENT LAYOUT (2 Columns) --- */}
            {totalCount > 0 && (
                <div className="row g-4">
                    
                    {/* LEFT COLUMN: DELAYED UNITS (URGENT - RED) */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden h-100">
                            {/* Header: Danger/Red */}
                            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center py-3">
                                <h5 className="mb-0 fw-bold"><i className="bi bi-clock-fill me-2"></i> Delayed Units ({delayedUnits.length})</h5>
                                {delayedUnits.length > 0 && (
                                    <button 
                                        className="btn btn-sm btn-outline-light py-1 px-3 rounded-pill fw-bold" 
                                        // Action color changed to Danger to mark resolution
                                        onClick={onClearDelayed}
                                    >
                                        Mark Checked
                                    </button>
                                )}
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
                    
                    {/* RIGHT COLUMN: NEW REPORTS (INFO - PRIMARY) */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden h-100">
                            {/* Header: Primary/Blue */}
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                                <h5 className="mb-0 fw-bold"><i className="bi bi-file-earmark-text-fill me-2"></i> New Daily Reports ({newReports.length})</h5>
                                {newReports.length > 0 && (
                                    <button 
                                        className="btn btn-sm btn-outline-light py-1 px-3 rounded-pill fw-bold" 
                                        // Action color changed to Success to mark reading/processing
                                        onClick={onClearReports}
                                    >
                                        Mark Read
                                    </button>
                                )}
                            </div>
                            <ul className="list-group list-group-flush border-0">
                                {newReports.length > 0 ? (
                                    newReports.map(notificationItem)
                                ) : (
                                    <li className="list-group-item text-center py-4 text-muted small fst-italic">
                                        No new reports submitted since last check.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                </div>
            )}
            
            <style jsx>{`
                .hover-shadow-sm:hover {
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
                }
            `}</style>
        </div>
    );
};