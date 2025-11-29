import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const NotificationContent = ({ notifications, onDismissAll, onClearReports, onClearDelayed, onNotificationClick }) => {
    
    const delayedUnits = notifications.filter(n => n.type === 'DelayedUnit');
    const newReports = notifications.filter(n => n.type === 'NewReport');
    const totalCount = notifications.length;

    const notificationItem = (n) => (
        <li 
            key={n.id} 
            className={`list-group-item d-flex justify-content-between align-items-start border-bottom py-3 ${n.type === 'DelayedUnit' ? 'list-group-item-danger' : 'list-group-item-info'}`}
            style={{cursor: 'pointer'}}
            onClick={() => onNotificationClick(n)}
        >
            <div className="d-flex align-items-center">
                {n.type === 'NewReport' ? (
                    <i className="bi bi-file-earmark-text-fill fs-3 text-primary me-3 flex-shrink-0"></i>
                ) : (
                    <i className="bi bi-clock-history fs-3 text-danger me-3 flex-shrink-0"></i>
                )}
                <div>
                    <h5 className="mb-1 fw-bold">{n.title}</h5>
                    <p className="mb-0 text-muted small">{n.message}</p>
                    <small className="text-secondary">{new Date(n.timestamp).toLocaleString()}</small>
                </div>
            </div>
            <span className={`badge ${n.type === 'DelayedUnit' ? 'bg-danger' : 'bg-primary'} rounded-pill mt-1`}>
                {n.type === 'DelayedUnit' ? 'URGENT' : 'NEW'}
            </span>
        </li>
    );

    return (
        <div>
            <h3 className="mb-4 d-flex align-items-center">
                <i className="bi bi-bell-fill me-2 text-danger"></i>
                System Notifications & Alerts
                <button className="btn btn-sm btn-outline-danger ms-auto" onClick={onDismissAll} disabled={totalCount === 0}>
                    <i className="bi bi-trash me-1"></i> Clear All Alerts
                </button>
            </h3>

            {totalCount === 0 && (
                <div className="alert alert-success text-center py-5">
                    <i className="bi bi-check-circle display-4"></i>
                    <h4 className="mt-3">All Clear!</h4>
                    <p>Walang active system alerts or pending new reports.</p>
                </div>
            )}

            {delayedUnits.length > 0 && (
                <div className="card shadow-sm mb-4 border-danger">
                    <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="bi bi-clock-fill me-2"></i> Delayed Units ({delayedUnits.length})</h5>
                        <button className="btn btn-sm btn-outline-light py-0" onClick={onClearDelayed}>
                            Mark All Delayed as Checked
                        </button>
                    </div>
                    <ul className="list-group list-group-flush">
                        {delayedUnits.map(notificationItem)}
                    </ul>
                </div>
            )}
            
            {newReports.length > 0 && (
                <div className="card shadow-sm mb-4 border-primary">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="bi bi-file-earmark-text-fill me-2"></i> New Daily Reports ({newReports.length})</h5>
                         <button className="btn btn-sm btn-outline-light py-0" onClick={onClearReports}>
                            Mark All Reports as Read
                        </button>
                    </div>
                    <ul className="list-group list-group-flush">
                        {newReports.map(notificationItem)}
                    </ul>
                </div>
            )}
        </div>
    );
};