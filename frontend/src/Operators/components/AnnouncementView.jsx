import React, { useState, useEffect } from 'react';

export function AnnouncementView({ 
    announcements = [], 
    loading = false, 
    error = null, 
    AVATAR_UPLOAD_PATH, 
    DEFAULT_AVATAR_PATH,
    onMarkAsRead, 
    lastReadId 
}) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    useEffect(() => {
        if (announcements.length > 0 && onMarkAsRead) {
            onMarkAsRead(announcements[0].id);
        }
    }, [announcements, onMarkAsRead]);

    const numericLastReadId = parseInt(lastReadId) || 0;

    const filteredAnnouncements = announcements.filter(announcement => {
        const announcementDate = new Date(announcement.created_at).toISOString().split('T')[0];
        return announcementDate === selectedDate;
    });

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                <p className="text-muted small mt-2 fw-bold uppercase tracking-wider">Synchronizing Feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert border-danger bg-white text-danger small fw-bold rounded-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                SYSTEM ERROR: {error}
            </div>
        );
    }

    return (
        <div className="container-fluid px-0 py-2 animate-in fade-in">
            <style>{`
                .announcement-container {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .feed-header {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 20px 25px;
                }
                .announcement-item {
                    border-bottom: 1px solid #f1f5f9;
                    padding: 20px 25px;
                    transition: background 0.2s;
                }
                .announcement-item:last-child { border-bottom: none; }
                .announcement-item.is-unread {
                    background: #f0f9ff;
                }
                .avatar-frame {
                    width: 42px;
                    height: 42px;
                    object-fit: cover;
                    border: 2px solid #fff;
                    outline: 1px solid #e2e8f0;
                    border-radius: 10px;
                }
                .content-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 15px;
                    font-size: 0.95rem;
                    color: #334155;
                    line-height: 1.6;
                }
                .unread-indicator {
                    width: 8px;
                    height: 8px;
                    background: #0ea5e9;
                    border-radius: 50%;
                    display: inline-block;
                }
                .date-filter-input {
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-weight: 700;
                    font-size: 0.8rem;
                    border-radius: 6px;
                    padding: 5px 10px;
                }
                .label-caps {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}</style>
            
            {/* --- TOP HEADER --- */}
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-0 tracking-tight text-uppercase" style={{fontSize: '1.25rem'}}>Bulletin Board</h4>
                    <p className="text-muted small mb-0 fw-medium">Operational updates and system announcements</p>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <span className="label-caps">Filter Date</span>
                    <input
                        type="date"
                        className="date-filter-input shadow-none"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={today}
                    />
                </div>
            </div>

            <div className="announcement-container">
                <div className="feed-header d-flex justify-content-between align-items-center">
                    <span className="label-caps">Archive Feed: {selectedDate === today ? 'TODAY' : selectedDate}</span>
                    <span className="badge bg-dark rounded-pill px-3 py-2" style={{fontSize: '0.65rem'}}>
                        {filteredAnnouncements.length} MESSAGES
                    </span>
                </div>

                <div className="announcement-list">
                    {filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((announcement, index) => {
                            const isUnread = parseInt(announcement.id) > numericLastReadId;
                            const postTime = new Date(announcement.created_at).toLocaleString('en-US', { 
                                hour: '2-digit', minute: '2-digit', hour12: true 
                            });
                            
                            const posterAvatar = announcement.poster_avatar 
                                ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` 
                                : DEFAULT_AVATAR_PATH;

                            return (
                                <div key={announcement.id} className={`announcement-item ${isUnread ? 'is-unread' : ''}`}>
                                    <div className="d-flex align-items-start">
                                        {/* Avatar Section */}
                                        <div className="flex-shrink-0 me-3 position-relative">
                                            <img
                                                src={posterAvatar}
                                                className="avatar-frame"
                                                alt="User"
                                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                            />
                                            {isUnread && (
                                                <span className="position-absolute top-0 start-100 translate-middle unread-indicator border border-white"></span>
                                            )}
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <span className="fw-bold text-dark me-2" style={{fontSize: '0.9rem'}}>{announcement.poster_name}</span>
                                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary border-opacity-10 px-2" style={{fontSize: '0.65rem', fontWeight: '700'}}>
                                                        {announcement.poster_role.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center text-muted">
                                                    {!isUnread && <i className="bi bi-check2-all text-primary me-2"></i>}
                                                    <span className="fw-bold" style={{fontSize: '0.7rem'}}>{postTime}</span>
                                                </div>
                                            </div>

                                            <div className="content-box">
                                                {announcement.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-5 my-4">
                            <i className="bi bi-chat-left-dots text-light display-1"></i>
                            <h6 className="fw-bold text-dark mt-3 uppercase tracking-wider">No Records Found</h6>
                            <p className="text-muted small">There are no announcements for the selected date.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}