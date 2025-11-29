import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Ito ang simpleng Bell component. 
// Wala na itong dropdown logic. Ipapasa lang nito ang click event sa AdminPage.
export const NotificationBell = ({ notifications, onClick }) => {
    
    const totalCount = notifications.length;

    return (
        <div className="notification-bell"> 
            <button
                className="btn btn-light border position-relative"
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
        </div>
    );
};