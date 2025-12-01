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
                    <div className="modal-header bg-danger text-white border-0 rounded-top-4">
                        <h5 className="modal-title fw-bold"><i className="bi bi-bullhorn me-2"></i> Post New Announcement</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <div className="d-flex align-items-start mb-3 bg-light p-3 rounded-3">
                                <img
                                    src={headerAvatarSrc}
                                    alt="Admin Avatar"
                                    className="rounded-circle me-3 border border-danger border-2"
                                    style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                />
                                <div>
                                    <h6 className="fw-bold text-dark mb-0">{user.full_name || user.username}</h6>
                                    <span className="badge bg-danger">Administrator</span>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label fw-bold text-secondary small" htmlFor="announcement-content">Announcement Content (Required)</label>
                                <textarea
                                    id="announcement-content" // ✅ FIX: Added ID for accessibility
                                    className="form-control"
                                    rows="5"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter your important announcement here..."
                                    required
                                    style={{ resize: 'none' }}
                                    name="content" // ✅ FIX: Added name attribute
                                ></textarea>
                            </div>
                            
                            <div className="alert alert-info small py-2 px-3 m-0">
                                <i className="bi bi-info-circle-fill me-2"></i> Only **Administrators** can post here. The post will instantly appear to all users.
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                            <button type="button" className="btn btn-light border px-4 rounded-pill fw-bold" onClick={onClose}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-danger px-4 rounded-pill fw-bold shadow-sm" 
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