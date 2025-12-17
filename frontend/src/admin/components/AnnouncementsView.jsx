import React from 'react';
import { DeleteAnnouncementModal } from './DeleteAnnouncementModal';

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
    getTodayDate: getTodayDateProp,
    setShowPostModal,
    handleConfirmDelete,
    executeDeleteAnnouncement, 
    showDeleteModal,
    announcementToDelete,
    setShowDeleteModal,
    AVATAR_UPLOAD_PATH,
    DEFAULT_AVATAR_PATH
}) {

    const todayDateString = getTodayDateProp ? getTodayDateProp() : getTodayDate();

    const announcementsToDisplay = announcements.filter(announcement => {
        const postDateString = announcement.created_at.split(' ')[0] || announcement.created_at.split('T')[0];
        const startFilter = filterStartDate || '2000-01-01';
        const endFilter = filterEndDate || todayDateString;

        return postDateString >= startFilter && postDateString <= endFilter;
    });
    
    const isAdministrator = user.role === 'Administrator';
    const isManager = user.role === 'Manager';

    const handleResetFilter = () => {
        setFilterStartDate(''); 
        setFilterEndDate(todayDateString);
    };

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                .announcement-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .filter-section {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 15px 25px;
                }
                .post-item {
                    border-bottom: 1px solid #f1f5f9;
                    padding: 20px 25px;
                    transition: background 0.2s;
                }
                .post-item:hover {
                    background: #fcfcfc;
                }
                .post-content-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 15px;
                    position: relative;
                }
                .post-content-box::before {
                    content: "";
                    position: absolute;
                    left: -1px;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: #107c55; /* MKFF Green to match your system */
                    border-radius: 8px 0 0 8px;
                }
                .avatar-img {
                    width: 42px;
                    height: 42px;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px; /* Squared-circle style for modern look */
                }
                .btn-create-post {
                    background: #107c55;
                    border: none;
                    font-weight: 600;
                    font-size: 0.85rem;
                    border-radius: 6px;
                }
                .btn-create-post:hover { background: #0d6646; }
                
                /* Custom Scrollbar */
                .scroll-area::-webkit-scrollbar { width: 6px; }
                .scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            {/* HEADER SECTION */}
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-0 tracking-tight">System Announcements</h4>
                    <p className="text-muted small mb-0">Broadcast updates and notices to the assembly unit</p>
                </div>
                {(isAdministrator || isManager) && (
                    <button
                        className="btn btn-primary btn-create-post px-4 py-2 d-flex align-items-center"
                        onClick={() => setShowPostModal(true)}
                    >
                        <i className="bi bi-plus-lg me-2"></i> CREATE POST
                    </button>
                )}
            </div>

            <div className="announcement-card">
                {/* FLAT FILTER BAR */}
                <div className="filter-section">
                    <div className="row align-items-center g-3">
                        <div className="col-auto">
                            <span className="small fw-bold text-muted text-uppercase tracking-wider">
                                <i className="bi bi-funnel me-1"></i> Filter Date:
                            </span>
                        </div>
                        <div className="col-auto d-flex align-items-center gap-2">
                            <input
                                type="date"
                                className="form-control form-control-sm border-0 bg-white shadow-none fw-bold"
                                style={{ border: '1px solid #e2e8f0 !important', width: '150px' }}
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                            <span className="text-muted small">to</span>
                            <input
                                type="date"
                                className="form-control form-control-sm border-0 bg-white shadow-none fw-bold"
                                style={{ border: '1px solid #e2e8f0 !important', width: '150px' }}
                                value={filterEndDate || todayDateString}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                max={todayDateString}
                            />
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-link btn-sm text-decoration-none text-muted p-0" onClick={handleResetFilter}>
                                <i className="bi bi-arrow-counterclockwise"></i> Reset
                            </button>
                        </div>
                        <div className="col text-end text-muted small">
                            Found: <strong>{announcementsToDisplay.length}</strong> posts
                        </div>
                    </div>
                </div>

                {/* FEED AREA */}
                <div className="scroll-area" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                    {announcementsToDisplay.length > 0 ? (
                        announcementsToDisplay.map((announcement) => {
                            const postDateTime = new Date(announcement.created_at);
                            const postDate = postDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const postTime = postDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                            const posterAvatar = announcement.poster_avatar ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` : DEFAULT_AVATAR_PATH;
                            const canDelete = isAdministrator || (user.id === announcement.user_id); 

                            return (
                                <div key={announcement.id} className="post-item d-flex gap-3">
                                    <img
                                        src={posterAvatar}
                                        className="avatar-img shadow-none"
                                        alt="User"
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <span className="fw-bold text-dark me-2">{announcement.poster_name || 'System User'}</span>
                                                <span className="badge bg-light text-muted border fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                                                    {announcement.poster_role}
                                                </span>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                <i className="bi bi-calendar3 me-1"></i> {postDate} • {postTime}
                                            </div>
                                        </div>
                                        
                                        <div className="post-content-box shadow-none">
                                            <p className="mb-0 text-dark small" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                                {announcement.content}
                                            </p>
                                            
                                            {canDelete && (
                                                <button
                                                    className="btn btn-sm text-danger opacity-50 hover-opacity-100 position-absolute top-0 end-0 m-2"
                                                    onClick={() => handleConfirmDelete(announcement)}
                                                    title="Delete Announcement"
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-chat-left-dots text-light display-1"></i>
                            <h6 className="text-secondary mt-3 fw-bold">No announcements found</h6>
                            <p className="text-muted small">Try adjusting the date range filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showDeleteModal && (
                <DeleteAnnouncementModal
                    show={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => executeDeleteAnnouncement(announcementToDelete.id, announcementToDelete.user_id)}
                    announcementId={announcementToDelete?.id}
                />
            )}
        </div>
    );
}