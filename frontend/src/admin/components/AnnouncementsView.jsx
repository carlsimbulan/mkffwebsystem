import React from 'react';
import { DeleteAnnouncementModal } from '../modals/DeleteAnnouncementModal';

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
                .announcements-wrapper {
                    padding: 10px;
                }

                .archive-filter-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
                    margin-bottom: 25px;
                }

                /* Individual Announcement Card */
                .post-row-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    padding: 20px 25px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                    transition: all 0.2s ease;
                }

                .post-row-card:hover {
                    background-color: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(8px);
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                .post-content-inner {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 10px;
                    padding: 18px;
                    margin-top: 12px;
                    position: relative;
                }

                .avatar-circle {
                    width: 44px;
                    height: 44px;
                    object-fit: cover;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .role-tag {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 3px 10px;
                    border-radius: 6px;
                    background: #f1f5f9;
                    color: #475569;
                    text-transform: uppercase;
                    border: 1px solid #e2e8f0;
                }

                .btn-create-announcement {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    outline: none;
                }
                .btn-create-announcement:active {
                    transform: scale(0.97);
                    opacity: 0.9;
                }

                .btn-trash-action {
                    background: transparent;
                    color: #94a3b8;
                    border: none;
                    transition: color 0.2s;
                    outline: none;
                }
                .btn-trash-action:hover { color: #ef4444; }
                .btn-trash-action:active { transform: scale(0.9); }

                .form-input-pro {
                    border: 1px solid #cbd5e1;
                    font-weight: 700;
                    font-size: 0.9rem;
                    height: 42px;
                    border-radius: 8px;
                }

                .label-pro {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    display: block;
                }

                .timestamp-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #94a3b8;
                }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1 tracking-tight">System Announcements</h3>
                    <p className="text-muted small mb-0 fw-bold">Broadcast updates and operational notices</p>
                </div>
                {(isAdministrator || isManager) && (
                    <button className="btn-create-announcement shadow-sm" onClick={() => setShowPostModal(true)}>
                        <i className="bi bi-megaphone-fill me-2"></i>CREATE POST
                    </button>
                )}
            </div>

            <div className="announcements-wrapper">
                {/* FILTER SECTION */}
                <div className="archive-filter-card">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="label-pro">Start Date</label>
                            <input
                                type="date"
                                className="form-control form-input-pro"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="label-pro">End Date</label>
                            <input
                                type="date"
                                className="form-control form-input-pro"
                                value={filterEndDate || todayDateString}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                max={todayDateString}
                            />
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-link btn-sm text-decoration-none text-muted fw-bold p-0 mb-2" onClick={handleResetFilter}>
                                <i className="bi bi-arrow-counterclockwise"></i> RESET
                            </button>
                        </div>
                        <div className="col text-end">
                            <span className="label-pro">Total Broadcasts</span>
                            <span className="h4 fw-bold mb-0 text-dark">{announcementsToDisplay.length}</span>
                        </div>
                    </div>
                </div>

                {/* ANNOUNCEMENT LIST */}
                <div className="scroll-area custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {announcementsToDisplay.length > 0 ? (
                        announcementsToDisplay.map((announcement) => {
                            const postDateTime = new Date(announcement.created_at);
                            const postDate = postDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                            const postTime = postDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const posterAvatar = announcement.poster_avatar ? `${AVATAR_UPLOAD_PATH}${announcement.poster_avatar}` : DEFAULT_AVATAR_PATH;
                            const canDelete = isAdministrator || (user.id === announcement.user_id); 

                            return (
                                <div key={announcement.id} className="post-row-card">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={posterAvatar}
                                                className="avatar-circle me-3"
                                                alt="Avatar"
                                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                            />
                                            <div>
                                                <div className="fw-bold text-dark" style={{fontSize: '0.95rem'}}>
                                                    {announcement.poster_name || 'System User'}
                                                </div>
                                                <span className="role-tag">{announcement.poster_role}</span>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="timestamp-text">
                                                <i className="bi bi-calendar3 me-1"></i> {postDate}
                                            </div>
                                            <div className="timestamp-text opacity-75">
                                                <i className="bi bi-clock me-1"></i> {postTime}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="post-content-inner">
                                        <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                            {announcement.content}
                                        </p>
                                        
                                        {canDelete && (
                                            <button
                                                className="btn-trash-action position-absolute top-0 end-0 m-2"
                                                onClick={() => handleConfirmDelete(announcement)}
                                                title="Remove Post"
                                            >
                                                <i className="bi bi-trash3-fill"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-5 border rounded-4 bg-light">
                            <i className="bi bi-chat-square-dots text-muted opacity-25" style={{fontSize: '3rem'}}></i>
                            <p className="mt-3 fw-bold text-muted opacity-50 uppercase tracking-widest">No active announcements</p>
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