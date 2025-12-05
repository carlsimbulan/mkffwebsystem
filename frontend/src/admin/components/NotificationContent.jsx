import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// New function to check if a timestamp is from today
const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);
    // Note: The current date is December 5, 2025. This function correctly checks against the user's current date.
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

// New function to format date for grouping (e.g., "December 5, 2025")
const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Removed unused props: onDismissAll, onClearReports, onClearDelayed
export const NotificationContent = ({ notifications, onNotificationClick }) => {
    
    // Original filters
    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const newReports = notifications.filter(n => n.type === 'NewReport');
    const totalCount = notifications.length;

    // --- NEW REPORT FILTERS ---
    const todayReports = newReports.filter(n => isToday(n.timestamp));
    const previousReports = newReports.filter(n => !isToday(n.timestamp));
    
    // Group previous reports by date
    const groupedPreviousReports = previousReports.reduce((groups, report) => {
        const date = formatDate(report.timestamp);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(report);
        return groups;
    }, {});
    
    // Get unique sorted dates for display (latest date first)
    const sortedDates = Object.keys(groupedPreviousReports).sort((a, b) => new Date(b) - new Date(a));
    // --- END NEW REPORT FILTERS ---

    // Helper to render individual notification item (No functional change)
    const notificationItem = (n) => {
        const isUrgent = n.type === 'DelayedUnit';
        const color = isUrgent ? 'danger' : 'primary';
        const icon = isUrgent ? 'bi-clock-history' : 'bi-file-earmark-bar-graph';
        const titleColor = isUrgent ? 'text-danger' : 'text-dark';

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
                        {isUrgent ? 'URGENT ALERT' : 'NEW REPORT'}
                    </span>
                </div>
            </li>
        );
    };

    return (
        <div className="animate-in fade-in pb-5">
            
            {/* --- TOP HEADER (CLEARED OF BUTTONS) --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h3 className="fw-bold text-dark d-flex align-items-center mb-0">
                    <i className="bi bi-bell-fill me-2 text-primary"></i>
                    System Alerts & Notifications ({totalCount})
                </h3>
                {/* Removed Clear All button */}
            </div>

            {/* --- EMPTY STATE (NO CHANGE) --- */}
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
                            {/* Header: Danger/Red (Removed Mark Checked button) */}
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
                    
                    {/* RIGHT COLUMN: NEW REPORTS (INFO - PRIMARY) */}
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden h-100">
                            {/* Header: Primary/Blue (Removed Mark All Read button) */}
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                                <h5 className="mb-0 fw-bold"><i className="bi bi-file-earmark-text-fill me-2"></i> New Daily Reports ({newReports.length})</h5>
                            </div>
                            <div className="card-body p-0">
                                {newReports.length === 0 ? (
                                    <div className="list-group-item text-center py-4 text-muted small fst-italic">
                                        No new reports submitted since last check.
                                    </div>
                                ) : (
                                    <div className="p-0">
                                        
                                        {/* 1. TODAY'S REPORTS SECTION */}
                                        <div className="bg-light p-3 border-bottom">
                                            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                                <i className="bi bi-calendar-check me-2 text-primary"></i> 
                                                Reports Today ({todayReports.length})
                                            </h6>
                                        </div>
                                        <ul className="list-group list-group-flush border-0">
                                            {todayReports.length > 0 ? (
                                                todayReports.map(notificationItem)
                                            ) : (
                                                <li className="list-group-item text-center py-3 text-muted small fst-italic">
                                                    No reports submitted today.
                                                </li>
                                            )}
                                        </ul>
                                        
                                        {/* 2. PREVIOUS REPORTS SECTION (Grouped by Date) */}
                                        {sortedDates.length > 0 && (
                                            <>
                                                <div className="bg-light p-3 border-top border-bottom mt-3">
                                                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                                        <i className="bi bi-folder me-2 text-secondary"></i> 
                                                        Previous Reports
                                                    </h6>
                                                </div>
                                                <div className="accordion accordion-flush" id="previousReportsAccordion">
                                                    {sortedDates.map((date) => (
                                                        <div className="accordion-item" key={date}>
                                                            {/* Accordion Header (The date button) */}
                                                            <h2 className="accordion-header" id={`heading-${date.replace(/[^a-zA-Z0-9]/g, '-')}`}>
                                                                <button 
                                                                    className="accordion-button collapsed fw-bold py-3 text-dark shadow-none" 
                                                                    type="button" 
                                                                    data-bs-toggle="collapse" 
                                                                    data-bs-target={`#collapse-${date.replace(/[^a-zA-Z0-9]/g, '-')}`} 
                                                                    aria-expanded="false" 
                                                                    aria-controls={`collapse-${date.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                                                >
                                                                    {date} ({groupedPreviousReports[date].length} reports)
                                                                </button>
                                                            </h2>
                                                            {/* Accordion Body (The list of reports for that date) */}
                                                            <div 
                                                                id={`collapse-${date.replace(/[^a-zA-Z0-9]/g, '-')}`} 
                                                                className="accordion-collapse collapse" 
                                                                aria-labelledby={`heading-${date.replace(/[^a-zA-Z0-9]/g, '-')}`} 
                                                                data-bs-parent="#previousReportsAccordion"
                                                            >
                                                                <ul className="list-group list-group-flush border-0">
                                                                    {groupedPreviousReports[date].map(notificationItem)}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
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