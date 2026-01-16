import React, { useState } from 'react';

export const UserProfileModal = ({ user, currentAvatar, currentFullName, onClose, onSave }) => {
    // Local state para sa form inputs
    const [editData, setEditData] = useState({
        email: user?.username || '', 
        old_password: '', // Kinakailangan para sa verification
        newPassword: '', 
        confirmPassword: ''
    });

    // States para sa Show/Hide Password toggles
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Validation: True kung hindi match ang New at Confirm Password
    const isMismatch = editData.confirmPassword !== '' && editData.newPassword !== editData.confirmPassword;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Live preview ng bagong avatar
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Verification: Dapat may Old Password kung magpapalit ng profile
        if (!editData.old_password) {
            alert("Please enter your Current (Old) Password to verify identity.");
            return;
        }

        if (isMismatch) {
            alert("New passwords do not match!");
            return;
        }

        // Paggamit ng FormData dahil may file upload
        const formData = new FormData();
        formData.append('action', 'update_profile');
        formData.append('username', user.username);
        formData.append('old_password', editData.old_password); // Tugma sa inaasahan ng PHP
        formData.append('email', editData.email);
        
        if (editData.newPassword) {
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
                                    <label htmlFor="avatarUpload" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow p-2" style={{ cursor: 'pointer' }}>
                                        <i className="bi bi-camera-fill"></i>
                                    </label>
                                    <input type="file" id="avatarUpload" className="d-none" onChange={handleFileChange} accept="image/*" />
                                </div>
                                <h5 className="mt-3 mb-0 fw-bold text-dark">{currentFullName}</h5>
                                <p className="text-muted small mb-0">{user.station || "Authorized User"}</p>
                            </div>

                            {/* Email Field */}
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

                            {/* Old Password Section (Mandatory) */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-danger">Current (Old) Password *</label>
                                <div className="input-group">
                                    <input 
                                        type={showOldPass ? "text" : "password"} 
                                        className="form-control"
                                        placeholder="Enter password to save changes"
                                        value={editData.old_password}
                                        onChange={(e) => setEditData({...editData, old_password: e.target.value})}
                                        required
                                    />
                                    <button className="btn btn-outline-secondary" type="button" onClick={() => setShowOldPass(!showOldPass)}>
                                        <i className={`bi ${showOldPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="row g-2">
                                {/* New Password */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-dark">New Password (Optional)</label>
                                    <div className="input-group">
                                        <input 
                                            type={showNewPass ? "text" : "password"} 
                                            className={`form-control ${isMismatch ? 'border-danger' : ''}`}
                                            value={editData.newPassword}
                                            onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                                        />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowNewPass(!showNewPass)}>
                                            <i className={`bi ${showNewPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password with Red Border Validation */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-dark">Confirm New Password</label>
                                    <div className="input-group">
                                        <input 
                                            type={showConfirmPass ? "text" : "password"} 
                                            className={`form-control ${isMismatch ? 'border-danger' : ''}`}
                                            value={editData.confirmPassword}
                                            onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})}
                                        />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                            <i className={`bi ${showConfirmPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    {isMismatch && <small className="text-danger">Passwords do not match</small>}
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