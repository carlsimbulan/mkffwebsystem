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

    // Password strength validation function
    const validatePasswordStrength = (password) => {
        if (!password) return { isValid: true, errors: [] }; // Empty password is allowed (optional)

        const errors = [];
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNoSpaces = !/\s/.test(password);

        // Common weak patterns to avoid
        const weakPatterns = [
            /^(1234|password|admin|qwerty|abc123|123456)/i,
            /^(.)\1{3,}/, // Repeated characters like "aaaa"
            /^(012|123|234|345|456|567|678|789|890){2,}/, // Sequential numbers
        ];

        if (password.length < minLength) {
            errors.push(`At least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('At least one uppercase letter (A-Z)');
        }
        if (!hasLowerCase) {
            errors.push('At least one lowercase letter (a-z)');
        }
        if (!hasNumbers) {
            errors.push('At least one number (0-9)');
        }
        if (!hasSpecialChar) {
            errors.push('At least one special character (!@#$%^&*...)');
        }
        if (!hasNoSpaces) {
            errors.push('No spaces allowed');
        }

        // Check for weak patterns
        const hasWeakPattern = weakPatterns.some(pattern => pattern.test(password));
        if (hasWeakPattern) {
            errors.push('Avoid common patterns like "1234", "password", or repeated characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    // Validation checks
    const passwordValidation = validatePasswordStrength(editData.newPassword);
    const isMismatch = editData.confirmPassword !== '' && editData.newPassword !== editData.confirmPassword;
    const isPasswordWeak = editData.newPassword && !passwordValidation.isValid;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Verification Logic
        if (editData.newPassword && !editData.oldPassword) {
            alert("Please enter your Current (Old) Password to verify identity.");
            return;
        }

        // 2. Password strength validation
        if (isPasswordWeak) {
            alert("Password is too weak. Please follow the password requirements:\n\n" + 
                  passwordValidation.errors.join('\n'));
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
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
                            <div className="row">
                                <div className="col-md-4 text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        <img 
                                            src={previewUrl || currentAvatar} 
                                            className="rounded-circle border border-4 border-light shadow" 
                                            style={{ width: '140px', height: '140px', objectFit: 'cover' }} 
                                            alt="Profile Preview"
                                        />
                                        <label htmlFor="avatarUpload" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow p-2" style={{ cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-camera-fill"></i>
                                        </label>
                                        <input type="file" id="avatarUpload" className="d-none" onChange={handleFileChange} accept="image/*" />
                                    </div>
                                    <h5 className="mt-3 mb-0 fw-bold text-dark">{currentFullName}</h5>
                                    <p className="text-muted small mb-0">{user.station || "Authorized User"}</p>
                                </div>

                                <div className="col-md-8">
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

                                    <hr className="my-3 opacity-25" />
                                    <h6 className="fw-bold mb-2 small text-primary text-uppercase">Security Verification</h6>

                                    {/* Old Password Section (Mandatory) */}
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
                                </div>
                            </div>

                            {/* Password Requirements Info */}
                            <div className="alert alert-info py-2 px-3 mb-3" style={{fontSize: '0.85rem'}}>
                                <i className="bi bi-info-circle-fill me-2"></i>
                                <strong>Strong Password Requirements:</strong>
                                <ul className="mb-0 mt-1 ps-3">
                                    <li>At least 8 characters long</li>
                                    <li>Include uppercase (A-Z) and lowercase (a-z) letters</li>
                                    <li>Include at least one number (0-9)</li>
                                    <li>Include at least one special character (!@#$%^&*...)</li>
                                    <li>Avoid common patterns like "1234" or "password"</li>
                                </ul>
                            </div>

                            <div className="row g-2">
                                {/* New Password */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-dark">New Password</label>
                                    <div className="input-group">
                                        <input 
                                            type={showNewPass ? "text" : "password"} 
                                            className={`form-control ${isMismatch || isPasswordWeak ? 'border-danger shadow-none' : ''}`}
                                            placeholder="Optional"
                                            value={editData.newPassword}
                                            onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                                        />
                                        <button className="btn btn-outline-secondary" type="button" onClick={() => setShowNewPass(!showNewPass)}>
                                            <i className={`bi ${showNewPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    {/* Password strength requirements */}
                                    {editData.newPassword && (
                                        <div className="mt-2">
                                            <div className="small text-muted mb-1">Password Requirements:</div>
                                            <div className="small">
                                                {passwordValidation.errors.map((error, index) => (
                                                    <div key={index} className="text-danger">
                                                        <i className="bi bi-x-circle-fill me-1"></i>{error}
                                                    </div>
                                                ))}
                                                {passwordValidation.isValid && (
                                                    <div className="text-success">
                                                        <i className="bi bi-check-circle-fill me-1"></i>Strong password!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password with Red Border Validation */}
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