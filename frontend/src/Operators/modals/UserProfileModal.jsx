import React, { useState } from 'react';

export const UserProfileModal = ({ user, currentAvatar, currentFullName, onClose, onSave }) => {
    // State para sa form inputs
    const [editData, setEditData] = useState({
        email: user?.username || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // States para sa Show/Hide Password toggles
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Validation check: Magiging true ito kung may laman ang Confirm Password pero hindi match sa New Password
    const isMismatch = editData.confirmPassword !== '' && editData.newPassword !== editData.confirmPassword;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Inside UserProfileModal.jsx

const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Verification Logic
    if (editData.newPassword && !editData.oldPassword) {
        alert("Please enter your Current (Old) Password to verify identity.");
        return;
    }

    if (isMismatch) {
        alert("New passwords do not match!");
        return;
    }

const formData = new FormData();
formData.append('action', 'update_profile');
formData.append('username', user.username);
formData.append('email', editData.email);
formData.append('old_password', editData.oldPassword);

    // ✅ FIXED: Changed 'oldPassword' to 'old_password' to match PHP
    formData.append('old_password', editData.oldPassword); 
    
    if (editData.newPassword) {
        // ✅ FIXED: Changed 'password' to match PHP expectation if necessary
        formData.append('password', editData.newPassword);
    }

    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    onSave(formData);
};

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    
                    {/* Header */}
                    <div className="modal-header bg-primary text-white border-0">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-person-badge-fill me-2"></i>Edit My Profile
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            
                            {/* Avatar Section */}
                            <div className="text-center mb-4">
                                <div className="position-relative d-inline-block">
                                    <img 
                                        src={previewUrl || currentAvatar} 
                                        className="rounded-circle border border-4 border-light shadow" 
                                        style={{ width: '110px', height: '110px', objectFit: 'cover' }} 
                                        alt="Profile Preview"
                                    />
                                    <label htmlFor="avatarUpload" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow p-2" style={{ cursor: 'pointer', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-camera-fill small"></i>
                                    </label>
                                    <input type="file" id="avatarUpload" className="d-none" onChange={handleFileChange} accept="image/*" />
                                </div>
                                <h5 className="mt-3 mb-0 fw-bold text-dark">{currentFullName}</h5>
                                <p className="text-muted small mb-0">{user.station || "No Station Assigned"}</p>
                            </div>

                            {/* Email Section */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-dark">Email / Username</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                    required 
                                />
                            </div>

                            <hr className="my-4 opacity-25" />
                            <h6 className="fw-bold mb-3 small text-primary text-uppercase">Security Verification</h6>

                            {/* Old Password with Show/Hide */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-danger">Current (Old) Password *</label>
                                <div className="input-group">
                                    <input 
                                        type={showOldPass ? "text" : "password"} 
                                        className="form-control"
                                        placeholder="Required to save changes"
                                        value={editData.oldPassword}
                                        onChange={(e) => setEditData({...editData, oldPassword: e.target.value})}
                                        required
                                    />
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => setShowOldPass(!showOldPass)}>
                                        <i className={`bi ${showOldPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="row g-2">
                                {/* New Password with Show/Hide */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-dark">New Password</label>
                                    <div className="input-group">
                                        <input 
                                            type={showNewPass ? "text" : "password"} 
                                            className={`form-control ${isMismatch ? 'border-danger shadow-none' : ''}`}
                                            placeholder="Optional"
                                            value={editData.newPassword}
                                            onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                                        />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowNewPass(!showNewPass)}>
                                            <i className={`bi ${showNewPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password with Show/Hide and Red Border Validation */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-dark">Confirm Password</label>
                                    <div className="input-group">
                                        <input 
                                            type={showConfirmPass ? "text" : "password"} 
                                            className={`form-control ${isMismatch ? 'border-danger is-invalid shadow-none' : ''}`}
                                            value={editData.confirmPassword}
                                            onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})}
                                        />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                            <i className={`bi ${showConfirmPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    {isMismatch && <div className="text-danger" style={{fontSize: '0.75rem'}}>Passwords do not match</div>}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer bg-light border-0 px-4 py-3">
                            <button type="button" className="btn btn-outline-secondary px-4 rounded-pill" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">
                                <i className="bi bi-save2-fill me-2"></i>Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};