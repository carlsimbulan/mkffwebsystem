import React from 'react';
import { DeleteAnnouncementModal } from './DeleteAnnouncementModal'; // Import the new modal

export function AnnouncementsView({
    user,
    announcements,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    getTodayDate, // Utility function to get today's date string
    setShowPostModal,
    handleConfirmDelete,
    executeDeleteAnnouncement, 
    showDeleteModal,
    announcementToDelete,
    setShowDeleteModal,
    AVATAR_UPLOAD_PATH,
    DEFAULT_AVATAR_PATH
}) {

    // 1. FILTERING LOGIC (Ensures compatibility with date inputs)
    const announcementsToDisplay = announcements.filter(announcement => {
        const postDate = new Date(announcement.created_at.split(' ')[0]);

        // Use new Date(filterDate) for accurate comparison
        let start = filterStartDate ? new Date(filterStartDate) : new Date('2000-01-01');
        let end = filterEndDate ? new Date(filterEndDate) : new Date(getTodayDate());

        // Normalize end date to cover the entire day
        end.setHours(23, 59, 59, 999);

        const normalizedPostDate = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());

        return (
            normalizedPostDate.getTime() >= start.getTime() &&
            normalizedPostDate.getTime() <= end.getTime()
        );
    });
    
    const isAdministrator = user.role === 'Administrator';
    const isManager = user.role === 'Manager'; // Assuming Manager might also use this view

    return (
        <>
            <div className="animate-in fade-in pb-5">
                
                {/* --- Header & Create Post Button --- */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary-subtle">
                    <div>
                        <h3 className="fw-bolder text-dark mb-1 fs-3" style={{ letterSpacing: '-0.5px' }}>
                            System Announcements
                        </h3>
                        <p className="text-muted small mb-0">
                            {announcementsToDisplay.length} active notices. Use filters below to review history.
                        </p>
                    </div>
                    {(isAdministrator || isManager) && ( // Only show Create button for Admins/Managers
                        <button
                            className="btn btn-primary px-4 py-2 rounded-pill shadow fw-bold d-flex align-items-center hover-scale"
                            onClick={() => setShowPostModal(true)}
                        >
                            <i className="bi bi-send-fill me-2"></i> Create New Post
                        </button>
                    )}
                </div>

                {/* --- FILTER BAR (Clean Card) --- */}
                <div className="bg-white p-3 rounded-3 shadow-sm mb-4">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <i className="bi bi-calendar-range text-primary fs-5 me-2"></i>
                        <span className="text-dark small fw-bold">Filter By Date Range:</span>

                        {/* Start Date Filter */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="text-muted small fw-medium mb-0">From:</label>
                            <input
                                type="date"
                                className="form-control form-control-sm bg-light fw-bold"
                                style={{ maxWidth: '140px' }}
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>

                        {/* End Date Filter */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="text-muted small fw-medium mb-0">To:</label>
                            <input
                                type="date"
                                className="form-control form-control-sm bg-light fw-bold"
                                style={{ maxWidth: '140px' }}
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                max={getTodayDate()}
                            />
                        </div>

                        {/* Clear Filter Button */}
                        <button
                            className="btn btn-sm btn-outline-secondary ms-auto"
                            onClick={() => { setFilterStartDate(''); setFilterEndDate(getTodayDate()); }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Reset Filter
                        </button>
                    </div>
                </div>
                {/* --- END FILTER BAR --- */}


                {/* --- Announcement Feed: Timeline List --- */}
                <div className="announcement-feed-container bg-white p-4 rounded-3 shadow-lg">
                    {/* 🔑 Applied custom scrollbar padding/margin here */}
                    <div className="announcement-list custom-scroll-margin" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                        {announcementsToDisplay.length > 0 ? (
                            announcementsToDisplay.map((announcement, index) => {
                                const postDateTime = new Date(announcement.created_at);
                                
                                // Format date and time separately for better presentation
                                const postDate = postDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                const postTime = postDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                                const posterAvatar = announcement.poster_avatar ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` : DEFAULT_AVATAR_PATH;
                                
                                // Admin/Manager can delete any; other users can delete their own
                                const canDelete = isAdministrator || (user.id === announcement.user_id); 

                                return (
                                    <div
                                        key={announcement.id}
                                        className={`d-flex align-items-start py-3 announcement-item ${index < announcementsToDisplay.length - 1 ? 'border-bottom border-light' : ''}`}
                                    >
                                        
                                        {/* --- 1. Avatar/Status Icon Column --- */}
                                        <div className="flex-shrink-0 me-3 mt-1">
                                            <img
                                                src={posterAvatar}
                                                alt="Poster Avatar"
                                                className="rounded-circle border border-1 border-light shadow-sm"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                            />
                                        </div>

                                        {/* --- 2. Content Column --- */}
                                        <div className="flex-grow-1">
                                            
                                            {/* Meta Header */}
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="d-flex align-items-center gap-2">
                                                    {/* Poster Name & Role */}
                                                    <span className="fw-bold text-dark">{announcement.poster_name || announcement.poster_role}</span>
                                                    <span className="badge bg-primary-subtle text-primary fw-bold py-1 px-2" style={{ fontSize: '0.7rem' }}>
                                                        {announcement.poster_role}
                                                    </span>
                                                </div>

                                                {/* Date and Time */}
                                                <div className="d-flex align-items-center text-muted small" style={{ fontSize: '0.75rem' }}>
                                                    <span className="me-2 fw-medium">{postDate}</span>
                                                    <i className="bi bi-clock me-1"></i> {postTime}
                                                </div>
                                            </div>

                                            {/* Announcement Content Box (Made position relative to position delete button) */}
                                            <div className="p-3 rounded-3 mt-1 shadow-sm position-relative" style={{ borderLeft: '4px solid #0d6efd', backgroundColor: '#f8f8f8' }}>
                                                <p className="mb-0 text-secondary fw-medium" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.4', paddingRight: canDelete ? '50px' : '0' }}>
                                                    {announcement.content}
                                                </p>
                                                
                                                {/* 🔑 RELOCATED DELETE BUTTON (Always positioned at top-right corner of the content box) */}
                                                {canDelete && (
                                                    <button
                                                        className="btn btn-sm btn-link text-danger p-0 fw-bold position-absolute top-0 end-0 m-2"
                                                        onClick={() => handleConfirmDelete(announcement.id, announcement.user_id)}
                                                        style={{ fontSize: '0.8rem', opacity: 0.7 }}
                                                        title="Delete Post"
                                                    >
                                                        <i className="bi bi-trash-fill me-1"></i>
                                                    </button>
                                                )}
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
                                <p className="text-muted mb-0">No posts match the current date range.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* --- END Announcement Feed Container --- */}

                {/* MODAL IS RENDERED GLOBALLY IN PARENT (Assuming it's not rendered here) */}
                {showDeleteModal && (
                    <DeleteAnnouncementModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={() => executeDeleteAnnouncement(announcementToDelete.id, announcementToDelete.user_id)}
                        announcementId={announcementToDelete?.id}
                    />
                )}
            </div>

            <style jsx>{`
                .hover-scale:hover { transform: scale(1.02); }
                
                /* 🔑 Custom Scrollbar Padding/Margin */
                .custom-scroll-margin {
                    padding-right: 15px; /* Adds space inside the scrollable area */
                }
                
                /* Optional: Style the scrollbar itself for a modern look (Requires vendor prefixes) */
                .custom-scroll-margin::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scroll-margin::-webkit-scrollbar-thumb {
                    background-color: #cccccc;
                    border-radius: 10px;
                    border: 3px solid #ffffff; /* Gives space inside the thumb */
                }
                .custom-scroll-margin::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>
        </>
    );
}