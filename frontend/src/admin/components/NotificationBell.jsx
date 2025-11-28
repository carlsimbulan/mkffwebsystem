import React, { useRef, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// --------------------------------------------------------------------------------
// --- NOTIFICATION COMPONENT ---
// --------------------------------------------------------------------------------

export const NotificationBell = ({ notifications, isOpen, toggleDropdown, onDismissAll, onClearReports, onClearDelayed, onNotificationClick }) => {
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isOpen) {
                    toggleDropdown();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, toggleDropdown]);

    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const newReports = notifications.filter(n => n.type === 'NewReport');
    const totalCount = notifications.length;

    // --- UPDATED: Make item clickable ---
    const notificationItem = (n, index) => (
        <a 
            key={n.id || index} 
            href="#" 
            className={`d-flex align-items-center p-2 border-bottom small list-group-item list-group-item-action ${n.type === 'NewReport' ? 'bg-light' : 'bg-white'}`}
            onClick={(e) => {
                e.preventDefault();
                onNotificationClick(n);
            }}
        >
            {n.type === 'NewReport' ? (
                <i className="bi bi-file-earmark-text-fill text-primary me-2 flex-shrink-0"></i>
            ) : (
                <i className="bi bi-clock-history text-danger me-2 flex-shrink-0"></i>
            )}
            <div className="flex-grow-1">
                <div className="fw-bold">{n.title}</div>
                <div className="text-muted text-wrap" style={{ fontSize: '0.75rem' }}>{n.message}</div>
            </div>
        </a>
    );

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                className="btn btn-light border"
                type="button"
                onClick={toggleDropdown}
            >
                <i className="bi bi-bell fs-4 text-secondary position-relative">
                    {totalCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1" style={{ fontSize: '0.5rem' }}>
                            {totalCount > 9 ? '9+' : totalCount}
                        </span>
                    )}
                </i>
            </button>

            <div
                className={`dropdown-menu dropdown-menu-end shadow-lg ${isOpen ? 'show' : ''}`}
                style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto' }}
            >
                <h6 className="dropdown-header d-flex justify-content-between align-items-center text-dark bg-light">
                    Notifications ({totalCount})
                    <button className="btn btn-sm btn-outline-danger py-0" onClick={onDismissAll} disabled={totalCount === 0}>
                        Clear All
                    </button>
                </h6>
                
                {totalCount === 0 && <p className="dropdown-item text-center text-muted py-3 small">No new notifications.</p>}

                {/* New Reports Section */}
                {newReports.length > 0 && (
                    <div className="pt-2">
                        <h6 className="dropdown-header d-flex justify-content-between align-items-center text-primary border-top pt-2">
                            New Daily Reports ({newReports.length})
                            <button className="btn btn-sm btn-outline-secondary py-0" onClick={onClearReports}>
                                Clear
                            </button>
                        </h6>
                        <div className="list-group list-group-flush">
                            {newReports.map(notificationItem)}
                        </div>
                    </div>
                )}
                
                {/* Delayed Units Section */}
                {delayedUnits.length > 0 && (
                    <div className="pt-2">
                        <h6 className="dropdown-header d-flex justify-content-between align-items-center text-danger border-top pt-2">
                            Delayed Units ({delayedUnits.length})
                            <button className="btn btn-sm btn-outline-secondary py-0" onClick={onClearDelayed}>
                                Clear
                            </button>
                        </h6>
                       <div className="list-group list-group-flush">
                           {delayedUnits.map(notificationItem)}
                       </div>
                    </div>
                )}
            </div>
        </div>
    );
};