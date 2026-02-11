import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const NotificationBell = ({ notifications = [], onClick }) => {
    const totalCount = notifications.length;

    return (
        <div className="notification-bell">
            {/* Standard CSS injection to handle keyframes without external CSS files */}
            <style>
                {`
                @keyframes bell-swing {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-15deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-10deg); }
                    50% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }

                @keyframes pulse-opacity {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 1; }
                }

                .swing-animation {
                    animation: bell-swing 3s infinite ease-in-out;
                    transform-origin: top center;
                }

                .bell-active {
                    border-color: #ef4444 !important; 
                    transition: border-color 0.3s ease;
                }

                .notification-btn:active {
                    transform: scale(0.95);
                    transition: transform 0.1s;
                }
                `}
            </style>

            <button
                className={`btn btn-light border position-relative notification-btn ${totalCount > 0 ? 'bell-active' : ''}`}
                type="button"
                onClick={onClick}
                title="View Notifications"
                style={{ zIndex: 10 }}
            >
                <i className={`bi bi-bell fs-4 text-secondary d-inline-block ${totalCount > 0 ? 'swing-animation' : ''}`}></i>
                
                {/* Badge Counter */}
                {totalCount > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        style={{ 
                            fontSize: '0.65rem',
                            animation: 'pulse-opacity 2s infinite' 
                        }}
                    >
                        {totalCount > 9 ? '9+' : totalCount}
                        <span className="visually-hidden">unread notifications</span>
                    </span>
                )}
            </button>
        </div>
    );
};
