import React from 'react';
import { DeleteAnnouncementModal } from './DeleteAnnouncementModal'; // Import the new modal

// Tiyakin na ang getTodayDate() ay nasa Parent Component at ibinibigay bilang prop
// OR, ilipat ang function dito kung wala itong external dependencies.
// Para mas madaling gamitin, i-define natin dito (assuming it returns 'YYYY-MM-DD').
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function AnnouncementsView({
    user,
    announcements,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    // Tinanggal ang getTodayDate sa props dahil ginawa na nating local helper,
    // pero ibinalik ko na lang para consistent sa iyong props structure.
    getTodayDate: getTodayDateProp, // I-rename to avoid conflict kung meron ka nang local getTodayDate
    setShowPostModal,
    handleConfirmDelete,
    executeDeleteAnnouncement, 
    showDeleteModal,
    announcementToDelete,
    setShowDeleteModal,
    AVATAR_UPLOAD_PATH,
    DEFAULT_AVATAR_PATH
}) {

    // Gumamit ng prop version o local version. Para safe, gamitin natin ang prop if available.
    const todayDateString = getTodayDateProp ? getTodayDateProp() : getTodayDate();

    // 1. FILTERING LOGIC (Optimized for date string comparison)
    const announcementsToDisplay = announcements.filter(announcement => {
        // Kukunin ang petsa lang (YYYY-MM-DD)
        const postDateString = announcement.created_at.split(' ')[0] || announcement.created_at.split('T')[0];

        // START DATE: Kung walang filterStartDate, simulan sa simula ng oras.
        const startFilter = filterStartDate || '2000-01-01'; // Default to a very old date

        // END DATE: FIX: Kung walang filterEndDate, simulan sa current day (todayDateString).
        const endFilter = filterEndDate || todayDateString;

        return (
            postDateString >= startFilter &&
            postDateString <= endFilter
        );
    });
    
    const isAdministrator = user.role === 'Administrator';
    const isManager = user.role === 'Manager';

    // Handler para i-reset ang filter
    const handleResetFilter = () => {
        setFilterStartDate(''); 
        setFilterEndDate(todayDateString); // FIX: Laging i-set sa ngayon ang End Date pag nag-reset.
    };

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
                        // 💡 INALIS: ang 'shadow' class
                        className="btn btn-primary px-4 py-2 rounded-pill fw-bold d-flex align-items-center hover-scale"
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
                                value={filterEndDate || todayDateString} // FIX: Default value to show is TODAY
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                max={todayDateString} // FIX: Use todayDateString
                            />
                        </div>

                        {/* Clear Filter Button */}
                        <button
                            className="btn btn-sm btn-outline-secondary ms-auto"
                            onClick={handleResetFilter}
                        >
                            <i className="bi bi-x-circle me-1"></i> Reset Filter
                        </button>
                    </div>
                </div>
                {/* --- END FILTER BAR --- */}


                {/* --- Announcement Feed: Timeline List --- */}
                <div className="announcement-feed-container bg-white p-4 rounded-3 shadow-lg">
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

                                            {/* Announcement Content Box */}
                                            <div className="p-3 rounded-3 mt-1 shadow-sm position-relative" style={{ borderLeft: '4px solid #0d6efd', backgroundColor: '#f8f8f8' }}>
                                                <p className="mb-0 text-secondary fw-medium" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.4', paddingRight: canDelete ? '50px' : '0' }}>
                                                    {announcement.content}
                                                </p>
                                                
                                                {/* DELETE BUTTON */}
                                                {canDelete && (
                                                    <button
                                                        className="btn btn-sm btn-link text-danger p-0 fw-bold position-absolute top-0 end-0 m-2"
                                                        onClick={() => handleConfirmDelete(announcement)} // Passed the whole object for DeleteModal prop
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

                {/* MODAL IS RENDERED GLOBALLY IN PARENT */}
                {showDeleteModal && (
                    <DeleteAnnouncementModal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        // Tiyakin na ipinapasa ang tamang ID/UserID sa execute function
                        onConfirm={() => executeDeleteAnnouncement(announcementToDelete.id, announcementToDelete.user_id)}
                        announcementId={announcementToDelete?.id}
                    />
                )}
            </div>

            {/* FIX: Replaced <style jsx> with standard <style> */}
            <style>{`
                .hover-scale:hover { transform: scale(1.02); }
                
                /* Custom Scrollbar Padding/Margin */
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