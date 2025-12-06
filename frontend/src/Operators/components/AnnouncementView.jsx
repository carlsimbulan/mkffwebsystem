import React, { useState, useEffect } from 'react';

// Mag-a-assume tayo na ang parent component (StationDashboard) ay magpasa ng 'announcements'
// at ang 'loading' at 'error' state para maipakita kung may problema.
export function AnnouncementView({ 
    announcements = [], 
    loading = false, 
    error = null, 
    AVATAR_UPLOAD_PATH, 
    DEFAULT_AVATAR_PATH,
    onMarkAsRead, 
    lastReadId 
}) {
    // 🔑 NEW STATE: Tracks the date the user wants to view. Defaults to today's date (YYYY-MM-DD format).
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // --- Automatic Mark as Read Trigger ---
    // This runs whenever announcements data changes (like when the component first loads or polls).
    // It updates the lastReadId to the newest available ID silently.
    useEffect(() => {
        if (announcements.length > 0 && onMarkAsRead) {
            // Mark the newest announcement (first item since they are sorted newest first) as read.
            onMarkAsRead(announcements[0].id);
        }
    }, [announcements, onMarkAsRead]);

    // --- Filtering Logic ---
    const numericLastReadId = parseInt(lastReadId) || 0;

    const filteredAnnouncements = announcements.filter(announcement => {
        const announcementDate = new Date(announcement.created_at).toISOString().split('T')[0];
        return announcementDate === selectedDate;
    });

    // --- Loading & Error Display ---
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Fetching announcements...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">🚨 Error loading announcements: {error}</div>;
    }

    // --- Component Render ---
    return (
        <div className="animate-in fade-in pb-4">
            
            {/* --- HEADER & DATE PICKER (Clean and Simple) --- */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom border-secondary-subtle">
                <div>
                    <h3 className="fw-bolder text-dark mb-1 fs-3">
                        Production Alerts & Announcements
                    </h3>
                    <p className="text-muted mb-0 small fw-medium">
                        Showing messages for: <span className='fw-bold text-primary'>{selectedDate === today ? 'Today' : selectedDate}</span>
                    </p>
                </div>

                {/* DATE PICKER (Only date filtering remains) */}
                <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm border">
                    <label htmlFor="announcementDate" className="form-label mb-0 text-muted small fw-medium">Filter Date:</label>
                    <input
                        type="date"
                        id="announcementDate"
                        className="form-control form-control-sm border-0 fw-bold bg-light"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={today} // Prevents selecting future dates
                        style={{ width: '150px' }}
                    />
                </div>
            </div>

            {/* --- Announcement Feed: Timeline-like List --- */}
            <div className="announcement-feed-container bg-white p-4 rounded-3 shadow-lg" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="announcement-list">
                    
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((announcement, index) => {
                            // isLatest check is only relevant if selectedDate === today
                            const isLatest = index === 0 && selectedDate === today; 
                            // Unread means the announcement ID is newer than the highest ID the user last saw.
                            const isUnread = parseInt(announcement.id) > numericLastReadId;
                            
                            // Format time only
                            const postTime = new Date(announcement.created_at).toLocaleString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                            });
                            
                            // Avatar paths
                            const posterAvatar = announcement.poster_avatar 
                                ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` 
                                : DEFAULT_AVATAR_PATH;

                            return (
                                <div
                                    key={announcement.id}
                                    // 🔑 CLEANER LIST ITEM STYLING
                                    className={`d-flex align-items-start py-3 announcement-item ${index < filteredAnnouncements.length - 1 ? 'border-bottom border-light' : ''}`}
                                >
                                    
                                    {/* --- 1. Avatar/Status Icon Column (Simplified) --- */}
                                    <div className="flex-shrink-0 position-relative me-3 mt-1">
                                        <img
                                            src={posterAvatar}
                                            alt="Poster Avatar"
                                            className="rounded-circle border border-1 border-light shadow-sm"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                        />
                                        {/* Unread dot */}
                                        {isUnread && (
                                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle animate-pulse-fast">
                                                <span className="visually-hidden">New Alert</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* --- 2. Content Column --- */}
                                    <div className="flex-grow-1">
                                        
                                        {/* Meta Header */}
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="d-flex align-items-center gap-2">
                                                {/* Poster Name & Role */}
                                                <span className={`fw-bold ${isUnread ? 'text-primary' : 'text-dark'}`}>{announcement.poster_name || announcement.poster_role}</span>
                                                <span className="badge bg-secondary-subtle text-secondary fw-bold py-1 px-2" style={{ fontSize: '0.7rem' }}>
                                                    {announcement.poster_role}
                                                </span>
                                            </div>

                                            {/* Time & Read Status (Simplified) */}
                                            <span className={`small fw-medium text-end ${isUnread ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                
                                                {/* Display checkmark if read */}
                                                {!isUnread && <i className="bi bi-check-all me-1"></i>}
                                                
                                                {postTime}
                                            </span>
                                        </div>

                                        {/* Announcement Content Box */}
                                        <div className="p-3 rounded-3 mt-1 shadow-sm" style={{ borderLeft: `4px solid ${isUnread ? '#0d6efd' : '#cccccc'}`, backgroundColor: isUnread ? '#f0faff' : '#f8f8f8' }}>
                                            <p className={`mb-0 ${isUnread ? 'text-dark fw-semibold' : 'text-secondary fw-medium'}`} style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                                {announcement.content}
                                            </p>
                                            
                                            {/* Removed Individual Mark as Read Button */}
                                            
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* --- Empty State --- */
                        <div className="text-center py-5 my-5">
                            <i className="bi bi-search display-2 text-secondary opacity-50 mb-4"></i>
                            <h5 className="fw-bold text-dark">No Announcements Found</h5>
                            <p className="text-muted mb-0">No notices were posted on **{selectedDate}**. Please check another date.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* In-sync CSS styles */}
            <style jsx>{`
                .animate-pulse-fast { animation: pulse-fast 1.5s infinite; }
                @keyframes pulse-fast {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}