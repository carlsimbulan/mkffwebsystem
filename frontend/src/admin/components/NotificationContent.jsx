import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const NotificationContent = ({ notifications, onNotificationClick }) => {
    
    // Filter only Delayed Units
    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const totalCount = delayedUnits.length;

    const notificationItem = (n) => {
        return (
            <li 
                key={n.id} 
                className="list-group-item d-flex align-items-center py-3 px-4 border-bottom notification-item-pro"
                style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
                onClick={() => onNotificationClick(n)}
            >
                {/* Professional Minimalist Icon */}
                <div className="icon-box-minimal me-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                    <i className="bi bi-exclamation-circle-fill"></i>
                </div>
                
                {/* Content Area */}
                <div className="flex-grow-1 text-start">
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-dark fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{n.title}</span>
                        <span className="status-tag">STATION DELAY</span>
                    </div>
                    <p className="mb-0 text-muted small" style={{ fontSize: '0.8rem', opacity: 0.8 }}>{n.message}</p>
                </div>
                
                {/* Meta Information */}
                <div className="text-end ms-3 flex-shrink-0">
                    <div className="time-label">
                        {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <i className="bi bi-chevron-right ms-2 text-muted small" style={{ fontSize: '0.7rem' }}></i>
                </div>
            </li>
        );
    };

    return (
        <div className="pb-5">
            <style>{`
                /* Professional Typography & Layout */
                .section-header { border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .header-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; letter-spacing: -0.2px; }
                
                /* Minimalist Hover (Background Tint only) */
                .notification-item-pro { background: transparent; border-left: 3px solid transparent; }
                .notification-item-pro:hover { 
                    background-color: #f8fafc; 
                    border-left-color: #ef4444;
                }

                .icon-box-minimal { 
                    color: #ef4444; 
                    font-size: 1.1rem;
                }

                .status-tag {
                    font-size: 0.6rem;
                    font-weight: 700;
                    padding: 1px 6px;
                    border-radius: 3px;
                    background: #fef2f2;
                    color: #b91c1c;
                    text-transform: uppercase;
                }

                .time-label { 
                    font-weight: 500; 
                    color: #64748b; 
                    font-size: 0.75rem; 
                }

                /* Empty State Professional */
                .empty-state-pro {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }
            `}</style>
            
            {/* --- TOP HEADER --- */}
            <div className="section-header d-flex justify-content-between align-items-center">
                <div className="header-title">
                    <i className="bi bi-bell me-2"></i>
                    System Notifications
                    <span className="ms-2 badge rounded-pill bg-dark fw-normal" style={{ fontSize: '0.7rem' }}>{totalCount}</span>
                </div>
            </div>

            {/* --- EMPTY STATE --- */}
            {totalCount === 0 && (
                <div className="empty-state-pro text-center py-5">
                    <i className="bi bi-shield-check text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6 className="text-dark fw-bold mb-1">Operational Status: Normal</h6>
                    <p className="text-muted small mb-0">No production delays currently recorded.</p>
                </div>
            )}

            {/* --- NOTIFICATION LIST --- */}
            {totalCount > 0 && (
                <div className="card border-0 bg-white rounded-3 overflow-hidden shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Active Production Alerts</span>
                    </div>
                    <ul className="list-group list-group-flush">
                        {delayedUnits.map(notificationItem)}
                    </ul>
                </div>
            )}
        </div>
    );
};