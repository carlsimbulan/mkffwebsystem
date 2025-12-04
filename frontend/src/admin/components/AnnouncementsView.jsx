import React from 'react';
import { DeleteAnnouncementModal } from './DeleteAnnouncementModal'; // Import the new modal

export function AnnouncementsView({
    user,
    announcements,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    getTodayDate,
    setShowPostModal,
    handleConfirmDelete,
    executeDeleteAnnouncement, // Added this in case the modal is rendered here
    showDeleteModal,
    announcementToDelete,
    setShowDeleteModal,
    AVATAR_UPLOAD_PATH,
    DEFAULT_AVATAR_PATH
}) {

    // 1. FILTERING LOGIC (Copied from AdminPage)
    const announcementsToDisplay = announcements.filter(announcement => {
        const postDate = new Date(announcement.created_at.split(' ')[0]);

        let start = filterStartDate ? new Date(filterStartDate) : new Date('2000-01-01');
        let end = filterEndDate ? new Date(filterEndDate) : new Date();

        if (filterEndDate) {
            end.setHours(23, 59, 59, 999);
        }

        const normalizedPostDate = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());

        return (
            normalizedPostDate.getTime() >= start.getTime() &&
            normalizedPostDate.getTime() <= end.getTime()
        );
    });

    return (
        <div className="animate-in fade-in pb-5">
            {/* --- Header Section --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h3 className="fw-bold text-dark mb-1 fs-3" style={{ letterSpacing: '-0.5px' }}>
                        Announcements
                    </h3>
                    <p className="text-muted small mb-0">
                        {announcementsToDisplay.length} notices shown. Filtered by date range.
                    </p>
                </div>
                {user.role === 'Administrator' && (
                    <button
                        className="btn btn-primary px-4 py-2 rounded-pill shadow fw-bold hover-scale d-flex align-items-center"
                        onClick={() => setShowPostModal(true)}
                    >
                        <i className="bi bi-send-fill me-2"></i> Create New Post
                    </button>
                )}
            </div>

            {/* --- FILTER BAR (Compact Card) --- */}
            <div className="card border-0 shadow-sm mb-4 p-3" style={{ borderRadius: '12px' }}>
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <i className="bi bi-calendar-range text-primary fs-5 me-2"></i>

                    {/* Start Date Filter */}
                    <div className="d-flex align-items-center gap-2">
                        <label className="text-muted small fw-bold mb-0">From:</label>
                        <input
                            type="date"
                            className="form-control form-control-sm border-0 bg-light fw-bold"
                            style={{ maxWidth: '140px' }}
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>

                    {/* End Date Filter */}
                    <div className="d-flex align-items-center gap-2">
                        <label className="text-muted small fw-bold mb-0">To:</label>
                        <input
                            type="date"
                            className="form-control form-control-sm border-0 bg-light fw-bold"
                            style={{ maxWidth: '140px' }}
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            max={getTodayDate()}
                        />
                    </div>

                    <button
                        className="btn btn-sm btn-outline-secondary ms-auto"
                        onClick={() => { setFilterStartDate(''); setFilterEndDate(getTodayDate()); }}
                    >
                        Clear Filter
                    </button>
                </div>
            </div>
            {/* --- END FILTER BAR --- */}


            {/* --- Announcement Feed Container (Central Focus) --- */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                    <div className="announcement-feed" style={{ maxWidth: '800px', maxHeight: '70vh', overflowY: 'auto' }}>

                        {announcementsToDisplay.length > 0 ? (
                            announcementsToDisplay.map((announcement, index) => {
                                const isLatest = index === 0;

                                const postTime = new Date(announcement.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
                                const posterAvatar = announcement.poster_avatar ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` : DEFAULT_AVATAR_PATH;

                                const canDelete = user.role === 'Administrator' || (user.id === announcement.user_id);

                                return (
                                    <div
                                        key={announcement.id}
                                        className={`d-flex align-items-start ${index < announcementsToDisplay.length - 1 ? 'border-bottom' : ''} pb-3 mb-3 announcement-item ${isLatest ? 'bg-light p-3 rounded-3 border border-primary border-opacity-25' : ''}`}
                                    >
                                        {/* Avatar Column */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={posterAvatar}
                                                alt="Avatar"
                                                className="rounded-circle me-3 border border-1 border-light shadow-sm"
                                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                            />
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="d-flex align-items-center">
                                                    <h6 className="fw-bold text-dark mb-0 me-3">{announcement.poster_name || announcement.poster_role}</h6>
                                                    <span className="badge bg-primary rounded-pill fw-bold py-1 px-2" style={{ fontSize: '0.7rem' }}>
                                                        {announcement.poster_role}
                                                    </span>
                                                    {isLatest && <span className="badge bg-warning ms-2 rounded-pill fw-bold py-1 px-2 animate-pulse" style={{ fontSize: '0.7rem' }}>NEW!</span>}
                                                </div>

                                                {/* TIME AND DELETE BUTTON */}
                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="text-muted small fw-medium text-end" style={{ fontSize: '0.75rem' }}>
                                                        <i className="bi bi-clock me-1"></i> {postTime}
                                                    </span>

                                                    {canDelete && (
                                                        <button
                                                            className="btn btn-sm btn-light text-danger border-0 p-1 rounded-circle hover-scale"
                                                            title="Delete Announcement"
                                                            onClick={() => handleConfirmDelete(announcement.id, announcement.user_id)}
                                                            style={{ width: '26px', height: '26px', padding: 0 }}
                                                        >
                                                            <i className="bi bi-trash-fill small"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                {/* END TIME AND DELETE BUTTON */}

                                            </div>

                                            {/* Announcement Content Box (light blue background) */}
                                            <div className="p-3 rounded" style={{ borderLeft: '4px solid #0d6efd', backgroundColor: isLatest ? '#e3f2fd !important' : '#f8f9fa !important' }}>
                                                <p className="mb-0 text-dark fw-medium" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                                    {announcement.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* --- Empty State --- */
                            <div className="text-center py-5 my-5">
                                <i className="bi bi-calendar-x display-2 text-secondary opacity-25 mb-4"></i>
                                <h5 className="fw-bold text-dark">No Announcements Found</h5>
                                <p className="text-muted mb-0">No posts match the selected date range.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hover-scale:hover { transform: scale(1.02); }
                .announcement-item { transition: background-color 0.2s ease; }
                /* Custom animation for NEW! badge */
                .animate-pulse {
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}