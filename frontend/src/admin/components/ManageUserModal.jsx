import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Ensure icons are available

const AVATAR_UPLOAD_PATH_PLACEHOLDER = `http://localhost/mkffwebsystem/backend/api/uploads/avatars/`;
const DEFAULT_AVATAR_PATH_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTE2IDguNWExLjUgMS41IDAgMSAxIDAgLTVhMS41IDEuNSAwIDAgMSAwIDVaTTkgMTMuNGM2LjUgMCA3IDUuMyA3IDV2Mi41aC0xNGwtLjItLjJjLS4xLS4xLS40LS41LS43LS45LS40LS41LS43LTEuMS0uNy0xLjhjMC0uNi40LTEuMS44LTEuNS41LS41IDEuMy0uNyAyLjItLjcgMS4yIDAgMi4xLjMgMyAxLjEgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjkgLS41IDEuNi0xLjMgMi4zLS41LjUtMS4xLjgtMS44LjhoLTJjLS45IDAtMS42LS4zLTIuMS0uN2wxLjgtLjIgLjMtLjNjLS41LS41LS45LS44LTEuNC0xLjIgMS0uOSAxLjctMi40IDEuNy00LjUgMC0xLS40LTEuOS0xLjEtMi42LS42LS43LTEuNS0xLjEtMi41LTEuMi0xLjIgMC0yLjQuNS0zLjUgMS41LS41LjItLjkuNS0xLjQgLjcgLjIuNS40LjkuNSAxLjQgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjggLS41IDEuNi0xLjQgMi4zLS4zLjItLjYuNS0uOS43bC0xLjguMi0uMi0uMmMtLjQtLjQtLjctLjgtLjctMS40IDAtLjggLjUtMS41IDEuMS0yLjIgLjUtLjUgMS4xLS44IDEuOC0uOC45IDAgMS43LjMgMi40LjkgLjQtLjIuOC0uNCAxLjItLjcgMC0uNy0uMy0xLjQtLjktMi4xLS41LS42LTEuMi0xLS43LTEuNyAwLS42LjUtMS4xIDEtMS41LjQtLjQgLjctLjUgMS4yLS42LjYtLjIgMS41LS4yIDIuMiAwIDAgLjUgLjQgLjcgLjggMS4xLjMtLjIuNi0uNCAxLS42LjktLjUgMi0uNyAyLjgtLjcgc20uMy0uNWMuOCAwIDEuNC41IDEuNSAxLjEuMS43LS41IDEuMy0xLjQgMS40LS44IDAtMS41LS42LTEuNS0xLjIgMC0uNS40LS45LjgtMS4zLjUtLjQgMS4yLS42IDEuNi0uNnptMi44IDYuOC40LjRjLjIgLjEuNC4yLjYgLjUgMCAuNy0uMyAxLjQtLjggMi4xLS40LjYtMSAxLjEtMS44IDEuNC0uMS4xLS4zLjEtLjQuM2wtLjMtLjNjLS41LS41LS44LTEuMS0uOC0xLjggMC0uOC40LTEuNSAxLjItMi4xem0tMS41LS40Yy0uMi0uMS0uMy0uMi0uNC0uMy0uMi0uMi0uMy0uNC0uNS0uNi0uMy0uMy0uNi0uNS0uOC0uNy0uMy0uMy0uNS0uNi0uNy0uOS0uNS0uNi0uOC0xLjQtLjgtMi40IDAtLjkuMy0xLjcgLjktMi40LjUtLjUgMS4zLS44IDIuMy0uOCAxLjIgMCAyLjEuMyAzIC45LjQuMi43LjUgMS4xLjcuNC4zLjcuNi44LjkgLjMgLjUgLjYgMSAuOCAxLjYgLjMgLjYgLjUgMS4yLjUgMS44IDAgLjgtLjIgMS41LS42IDIuMS0uNC43LS45IDEuMy0xLjUgMS43em0tMS4zLTYuM2h-MS4zLjRjLS4xLjQtLjIuOS0uMyAxLjItLjQuNy0uNSAxLjQtLjUgMi4yIDAgLjcuMyAxLjMuOSAxLjguNC0uMi43LS41IDEtLjkuNS0uNS43LTEuMS43LTEuOCAwLS45IDAtMS43LS41LTIuNC0uNS0uNi0xLjMtMS0xLjgtMS4yLS4xLjMtLjIuNi0uNCAxeiIvPjwvc3ZnPg==';

export const ManageUserModal = ({ userToEdit, stations, onClose, onSave, AVATAR_UPLOAD_PATH = AVATAR_UPLOAD_PATH_PLACEHOLDER, DEFAULT_AVATAR_PATH = DEFAULT_AVATAR_PATH_PLACEHOLDER }) => {
    const isEditMode = userToEdit && userToEdit.id !== null;

    const [showPassword, setShowPassword] = useState(false);

    const initialFormData = isEditMode ? {
        id: userToEdit.id,
        username: userToEdit.username,
        password: userToEdit.password || '',
        role: userToEdit.role,
        full_name: userToEdit.full_name,
        station: userToEdit.station || '',
        avatar_url: userToEdit.avatar_url || '', 
        avatar_file: null, 
    } : {
        id: null,
        username: '',
        password: '',
        role: 'Operator',
        full_name: '',
        station: '',
        avatar_url: '',
        avatar_file: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [avatarPreview, setAvatarPreview] = useState(
        (isEditMode && userToEdit.avatar_url)
        ? `${AVATAR_UPLOAD_PATH}${userToEdit.avatar_url}`
        : DEFAULT_AVATAR_PATH
    );

    const roleOptions = ["Administrator", "IT Assistant", "Operator"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData({
                ...formData,
                avatar_file: file,
                avatar_url: file.name
            });
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setFormData({
                ...formData,
                avatar_file: null,
                avatar_url: isEditMode ? initialFormData.avatar_url : ''
            });
            setAvatarPreview(isEditMode && initialFormData.avatar_url ? `${AVATAR_UPLOAD_PATH}${initialFormData.avatar_url}` : DEFAULT_AVATAR_PATH);
        }
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        if (!formData.username || !formData.password || !formData.role || !formData.full_name) {
            setError('All required fields are needed.');
            return;
        }

        const isFileUpdate = formData.avatar_file instanceof File;

        let payload;
        let headers = { };
        let url;
        const methodOverride = formData.id ? 'PUT' : 'POST';

        if (isFileUpdate) {
            // SCENARIO 1: FILE UPLOAD (multipart/form-data)
            payload = new FormData();

            payload.append('avatar', formData.avatar_file, formData.avatar_file.name);
            payload.append('id', formData.id || '');
            payload.append('username', formData.username);
            payload.append('password', formData.password);
            payload.append('role', formData.role);
            payload.append('full_name', formData.full_name);
            payload.append('station', formData.station || '');
            payload.append('avatar_url', formData.avatar_url);

            url = `?method=${methodOverride}`; 

        } else {
            // SCENARIO 2: TEXT/URL ONLY UPDATE (JSON)
            payload = {
                id: formData.id,
                username: formData.username,
                password: formData.password,
                role: formData.role,
                full_name: formData.full_name,
                station: formData.station,
                avatar_url: formData.avatar_url, 
            };
            headers['Content-Type'] = 'application/json';
            url = `?method=${methodOverride}`;
        }

        try {
            await onSave(payload, headers, url);

            setSuccess(`User ${isEditMode ? 'updated' : 'added'} successfully!`);
            setTimeout(onClose, 1000);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, error);
            setError(error.message || `Failed to ${isEditMode ? 'update' : 'add'} user.`);
        }
    };

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Header: Professional Primary Color */}
                    <div className="modal-header text-white border-0 py-3 px-4" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className={`bi bi-person-circle me-2`}></i> {isEditMode ? `Edit User: ${userToEdit.username}` : 'Add New User'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {/* Status Feedback */}
                        {(error || success) && (
                            <div className={`alert ${error ? 'alert-danger' : 'alert-success'} d-flex align-items-center small mb-3`} role="alert">
                                <i className={`bi ${error ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2`}></i>
                                <div>{error || success}</div>
                            </div>
                        )}
                        
                        {/* Meta Data */}
                        {isEditMode && <p className="text-muted small mb-4">ID: {userToEdit.id} | Created: {userToEdit.created_at}</p>}

                        <form>
                            <div className="row g-4">
                                
                                {/* LEFT COLUMN: Avatar and Profile Setup */}
                                <div className="col-md-4">
                                    <h6 className="fw-bold text-uppercase small text-muted mb-3" style={{letterSpacing: '1px'}}>Profile Setup</h6>
                                    <div className="card shadow-sm border-0 rounded-3 bg-white p-4 text-center h-100">
                                        
                                        {/* Avatar Preview */}
                                        <div className="mb-3">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="img-fluid rounded-circle mb-2 border border-secondary shadow-sm"
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                            />
                                        </div>
                                        
                                        {/* File Input */}
                                        <div className="mb-3">
                                            <input 
                                                type="file" 
                                                className="form-control form-control-sm" 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                            />
                                        </div>
                                        
                                        {/* File Status */}
                                        {formData.avatar_url &&
                                            <div className="form-text small text-primary">
                                                {formData.avatar_file ? <i className="bi bi-upload me-1"></i> : <i className="bi bi-file-earmark-image me-1"></i>}
                                                {formData.avatar_file ? 'New file selected' : `Current: ${formData.avatar_url}`}
                                            </div>
                                        }
                                        {!formData.avatar_url &&
                                            <div className="form-text small text-muted">
                                                No avatar set. Click to upload.
                                            </div>
                                        }
                                    </div>
                                </div>
                                
                                {/* RIGHT COLUMN: Credentials and Access */}
                                <div className="col-md-8">
                                    <div className="card shadow-sm border-0 rounded-3 bg-white p-4">
                                        
                                        {/* Identity Group */}
                                        <h6 className="fw-bold text-uppercase small text-muted mb-3 pb-2 border-bottom">Identity & Credentials</h6>
                                        
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small">Full Name</label>
                                            <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                        </div>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold small">Username</label>
                                                <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold small">Password</label>
                                                <div className="input-group">
                                                    <input 
                                                        type={showPassword ? "text" : "password"} // Dynamic Type
                                                        className="form-control" 
                                                        name="password" 
                                                        value={formData.password} 
                                                        onChange={handleChange} 
                                                        required 
                                                    />
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button" 
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        title={showPassword ? "Hide Password" : "Show Password"}
                                                    >
                                                        {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                                    </button>
                                                </div>
                                                <div className="form-text text-muted">
                                                    {isEditMode ? "Enter a new password to change it." : "Set a secure password."}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Access Group */}
                                        <h6 className="fw-bold text-uppercase small text-muted mb-3 pb-2 border-bottom mt-4">Access & Station Assignment</h6>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold small">Role</label>
                                                <select className="form-select" name="role" value={formData.role} onChange={handleChange} required>
                                                    {roleOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-bold small">Station (Operator only)</label>
                                                <select 
                                                    className="form-select" 
                                                    name="station" 
                                                    value={formData.station} 
                                                    onChange={handleChange}
                                                    disabled={formData.role !== 'Operator'}
                                                >
                                                    <option value="">N/A (Admin/IT)</option>
                                                    {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    {/* Footer */}
                    <div className="modal-footer bg-light border-top-0 p-4">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={onClose}>
                            Close
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" 
                            onClick={handleSave} 
                            disabled={!!success}
                        >
                            <i className="bi bi-save me-2"></i> {isEditMode ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};