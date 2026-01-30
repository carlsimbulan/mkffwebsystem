// File: src/admin/components/AnnouncementModal.jsx

import React, { useState } from 'react';

const AnnouncementModal = ({ user, onClose, onPost, API_BASE_URL, DEFAULT_AVATAR_PATH }) => {
    const [content, setContent] = useState(''); 
    const [isPosting, setIsPosting] = useState(false);
    
    // Define path internally since it relies on props
    const AVATAR_UPLOAD_PATH = `${API_BASE_URL}/uploads/avatars/`;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (content.trim() === '') return;
        setIsPosting(true);
        try {
            // onPost is called with content, AdminPage handles the user ID
            await onPost(content.trim());
            setContent('');
            // Only close modal upon successful POST
            onClose(); 
        } catch (error) {
            // Show alert if PHP returns 403 (Not Admin) or 500 (DB/SQL Error)
            alert('Failed to post announcement: ' + error.message);
        } finally {
            setIsPosting(false);
        }
    };

    const headerAvatarSrc = user.avatar_url ? `${AVATAR_UPLOAD_PATH}${user.avatar_url}` : DEFAULT_AVATAR_PATH;

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    {/* BLUE HEADER */}
                    <div className="modal-header bg-primary text-white border-0 rounded-top-4">
                        <h5 className="modal-title fw-bold fs-4"><i className="bi bi-bullhorn me-2"></i> Create New Announcement</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            {/* Poster Info (Now with subtle styling) */}
                            <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                                <img
                                    src={headerAvatarSrc}
                                    alt="Admin Avatar"
                                    // Removed border-danger/border-2. Added a subtle shadow/border.
                                    className="rounded-circle me-3 border border-1 border-light shadow-sm"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                />
                                <div>
                                    <h6 className="fw-bold text-dark mb-0">{user.full_name || user.username}</h6>
                                    {/* Changed badge color to primary (blue) */}
                                    <span className="badge bg-primary fw-bold">Administrator</span>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label fw-bold text-dark small" htmlFor="announcement-content">Announcement Content (Required)</label>
                                <textarea
                                    id="announcement-content"
                                    className="form-control"
                                    rows="6" // Increased rows for better usability
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter your important announcement here..."
                                    required
                                    style={{ resize: 'none' }}
                                    name="content"
                                ></textarea>
                                <small className="form-text text-muted">Use line breaks to separate paragraphs.</small>
                            </div>
                            
                            <div className="alert alert-info small py-2 px-3 m-0">
                                <i className="bi bi-info-circle-fill me-2"></i> **Note:** Only Administrators can post here. The announcement will be instantly visible to all users.
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                            <button type="button" className="btn btn-light border px-4 rounded-pill fw-bold" onClick={onClose}>
                                Cancel
                            </button>
                            {/* Changed button color to primary (blue) */}
                            <button 
                                type="submit" 
                                className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" 
                                disabled={isPosting || content.trim() === ''}
                            >
                                {isPosting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-send-fill me-2"></i> Post Announcement
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export { AnnouncementModal };