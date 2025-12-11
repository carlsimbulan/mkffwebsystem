import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Ito ang simpleng Bell component. 
// Wala na itong dropdown logic. Ipapasa lang nito ang click event sa AdminPage.
export const NotificationBell = ({ notifications, onClick }) => {
    
    const totalCount = notifications.length;

    return (
        <div className="notification-bell"> 
            <button
                className={`btn btn-light border position-relative ${totalCount > 0 ? 'shaking-alert-bell' : ''}`}
                type="button"
                // Mahalaga: Ito ang tatawag sa function na magpapalit ng tab sa AdminPage
                onClick={onClick} 
                title="View Notifications"
            >
                <i className="bi bi-bell fs-4 text-secondary"></i>
                
                {/* Badge Counter */}
                {totalCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {totalCount > 9 ? '9+' : totalCount}
                        <span className="visually-hidden">unread notifications</span>
                    </span>
                )}
            </button>
            
            {/* Custom Style for Bell Animation */}
            <style jsx>{`
                /* Keyframes for Bell Pulse/Shake Effect (Similar to Approvals, but applied to the button itself) */
                @keyframes pulse-danger-bell {
                    0% {
                        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 0 6px rgba(220, 53, 69, 0);
                        transform: scale(1.05); /* Slightly bigger pulse */
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
                        transform: scale(1);
                    }
                }

                /* Apply stronger pulse effect when notifications are present */
                .shaking-alert-bell {
                    animation: pulse-danger-bell 2s infinite;
                }
            `}</style>
        </div>
    );
};