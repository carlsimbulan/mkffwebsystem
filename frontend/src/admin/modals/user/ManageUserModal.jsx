import React, { useState } from 'react';

const AVATAR_UPLOAD_PATH_PLACEHOLDER = `http://localhost/mkffwebsystem/backend/api/uploads/avatars/`;
const DEFAULT_AVATAR_PATH_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTE2IDguNWExLjUgMS41IDAgMSAxIDAgLTVhMS41IDEuNSAwIDAgMSAwIDVaTTkgMTMuNGM2LjUgMCA3IDUuMyA3IDV2Mi41aC0xNGwtLjItLjJjLS4xLS4xLS40LS41LS43LS45LS40LS41LS43LTEuMS0uNy0xLjhjMC0uNi40LTEuMS44LTEuNS41LS41IDEuMy0uNyAyLjItLjcgMS4yIDAgMi4xLjMgMyAxLjEgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjkgLS41IDEuNi0xLjMgMi4zLS41LjUtMS4xLjgtMS44LjhoLTJjLS45IDAtMS42LS4zLTIuMS0uN2wxLjgtLjIgLjMtLjNjLS41LS41LS45LS44LTEuNC0xLjIgMS0uOSAxLjctMi40IDEuNy00LjUgMC0xLS40LTEuOS0xLjEtMi42LS42LS43LTEuNS0xLjEtMi41LTEuMi0xLjIgMC0yLjQuNS0zLjUgMS41LS41LjItLjkuNS0xLjQgLjcgLjIuNS40LjkuNSAxLjQgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjggLS41IDEuNi0xLjQtMi4zLS4zLjItLjYuNS0uOS43bC0xLjguMi0uMi0uMmMtLjQtLjQtLjctLjgtLjctMS40IDAtLjggLjUtMS41IDEuMS0yLjIgLjUtLjbwMS4xLS44IDEuOC0uOC45IDAgMS43LjMgMi40LjkgLjQtLjIuOC0uNCAxLjItLjcgMC0uNy0uMy0xLjQtLjktMi4xLS41LS42LTEuMi0xLS43LTEuNyAwLS42LjUtMS4xIDEtMS41LjQtLjQgLjctLjUgMS4yLS42LjYtLjIgMS41LS4yIDIuMiAwIDAgLjUgLjQgLjcgLjggMS4xLjMtLjIuNi0uNCAxLS42LjktLjUgMi0uNyAyLjgtLjcgc20uMy0uNWMuOCAwIDEuNC41IDEuNSAxLjEuMS43LS41IDEuMy0xLjQgMS40LS44IDAtMS41LS42LTEuNS0xLjIgMC0uNS40LS45LjgtMS4zLjUtLjQgMS4yLS42IDEuNi0uNnptMi44IDYuOC40LjRjLjIgLjEuNC4yLjYgLjUgMCAuNy0uMyAxLjQtLjggMi4xLS40LjYtMSAxLjEtMS44IDEuNC0uMS4xLS4zLjEtLjQuM2wtLjMtLjNjLS41LS41LS44LTEuMS0uOC0xLjggMC0uOC40LTEuNSAxLjEtMi4xem0tMS41LS40Yy0uMi0uMS0uMy0uMi0uNC0uMy0uMi0uMi0uMy0uNC0uNS0uNi0uMy0uMy0uNi0uNS0uOC0uNy0uMy0uMy0uNS0uNi0uNy0uOS0uNS0uNi0uOC0xLjQtLjgtMi40IDAtLjkuMy0xLjcgLjktMi40LjUtLjUgMS4zLS44IDIuMy0uOCAxLjIgMCAyLjEuMyAz .OS40LjIuNy41IDEuMS43LjQuMy43LjYuOC45LjMgLjUgLjYgMSAuOCAxLjYgLjMgLjYgLjUgMS4yLjUgMS44IDAgLjgtLjIgMS41LS42IDIuMS0uNC43LS45IDEuMy0xLjUgMS43em0tMS4zLTYuM2h-MS4zLjRjLS4xLjQtLjIuOS0uMyAxLjItLjQuNy0uNSAxLjQtLjUgMi4yIDAgLjcuMyAxLjMuOSAxLjguNC0uMi43LS41IDEtLjkuNS0uNS43LTEuMS43LTEuOCAwLS45IDAtMS43LS41LTIuNC0uNS0uNi0xLjMtMS0xLjgtMS4yLS4xLjMtLjIuNi0uNCAxeiIvPjwvc3ZnPg==';

export const ManageUserModal = ({ 
    userToEdit, 
    stations, 
    onClose, 
    onSave, 
    AVATAR_UPLOAD_PATH = AVATAR_UPLOAD_PATH_PLACEHOLDER, 
    DEFAULT_AVATAR_PATH = DEFAULT_AVATAR_PATH_PLACEHOLDER 
}) => {
    const isEditMode = userToEdit && userToEdit.id !== null;
    const DOMAIN = "@mkff.com";

    // --- STATES ---
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        username: DOMAIN,
        password: '',
        role: 'Operator',
        full_name: '',
        station: '',
        avatar_url: '',
        avatar_file: null,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [avatarPreview, setAvatarPreview] = useState(
        (isEditMode && userToEdit.avatar_url)
        ? `${AVATAR_UPLOAD_PATH}${userToEdit.avatar_url}`
        : DEFAULT_AVATAR_PATH
    );

    const roleOptions = ["Administrator", "IT Assistant", "Operator"];

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
    const passwordValidation = validatePasswordStrength(formData.password);
    const isPasswordWeak = formData.password && !passwordValidation.isValid;

    // --- NAVIGATION LOGIC WITH VALIDATION ---
    const validateStep = () => {
        setError('');
        if (currentStep === 1) {
            if (!formData.full_name.trim()) return "Full Name is required.";
            if (!formData.username || formData.username === DOMAIN) return "Username is required.";
            if (!passwordValidation.isValid) {
                return "Password requirements not met:\n" + passwordValidation.errors.join('\n');
            }
        }
        if (currentStep === 2) {
            if (formData.role === 'Operator' && !formData.station) return "Please assign a station for Operator role.";
        }
        return null;
    };

    const nextStep = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setCurrentStep(prev => prev + 1);
    };
    
    const prevStep = () => {
        setError('');
        setCurrentStep(prev => prev - 1);
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'username' && !value.endsWith(DOMAIN)) {
            const prefix = value.split('@')[0];
            value = prefix + DOMAIN;
        }
        setFormData({ ...formData, [name]: value });
        if (error) setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar_file: file, avatar_url: file.name });
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        const isFileUpdate = formData.avatar_file instanceof File;
        let payload;
        let headers = {};
        let url = `?method=${formData.id ? 'PUT' : 'POST'}`;

        if (isFileUpdate) {
            payload = new FormData();
            Object.keys(formData).forEach(key => {
                if(key === 'avatar_file' && formData[key]) {
                    payload.append('avatar', formData[key], formData[key].name);
                } else {
                    payload.append(key, formData[key] || '');
                }
            });
        } else {
            payload = formData;
            headers['Content-Type'] = 'application/json';
        }

        try {
            await onSave(payload, headers, url);
            setSuccess(`User ${isEditMode ? 'updated' : 'added'} successfully!`);
            setTimeout(onClose, 1000);
        } catch (err) {
            setError(err.message || "An error occurred.");
        }
    };

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    
                    {/* Header */}
                    <div className="modal-header text-white border-0 py-3 px-4" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <h5 className="modal-title fw-bold">
                            <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>
                            {isEditMode ? 'Edit User Profile' : 'Create New User'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {/* --- STEP PROGRESS BAR --- */}
                        <div className="d-flex justify-content-between align-items-center mb-5 position-relative px-4">
                            <div className="position-absolute top-50 start-50 translate-middle" style={{height: '2px', width: '70%', backgroundColor: '#dee2e6', zIndex: 0}}>
                                <div style={{height: '100%', width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%', backgroundColor: '#0d6efd', transition: '0.4s ease'}}></div>
                            </div>
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="position-relative" style={{zIndex: 1}}>
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all ${currentStep >= s ? 'bg-primary text-white scale-up' : 'bg-white text-muted border'}`} 
                                         style={{width: '40px', height: '40px', fontWeight: 'bold', transition: '0.3s'}}>
                                        {currentStep > s ? <i className="bi bi-check-lg"></i> : s}
                                    </div>
                                    <small className={`position-absolute start-50 translate-middle-x mt-2 fw-bold ${currentStep === s ? 'text-primary' : 'text-muted'}`} style={{fontSize: '11px', whiteSpace: 'nowrap'}}>
                                        {s === 1 ? 'DETAILS' : s === 2 ? 'ACCESS' : 'PROFILE'}
                                    </small>
                                </div>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center fade-in shadow-sm">
                                <i className="bi bi-exclamation-circle-fill me-2"></i>
                                <span className="small fw-bold">{error}</span>
                            </div>
                        )}

                        <form>
                            {/* STEP 1: Details (Strictly Required) */}
                            {currentStep === 1 && (
                                <div className="fade-in">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Full Name <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control shadow-sm ${error.includes('Full Name') ? 'is-invalid' : ''}`} name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Username / Email <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control shadow-sm ${error.includes('Username') ? 'is-invalid' : ''}`} name="username" value={formData.username} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Password <span className="text-danger">*</span></label>
                                        <div className="input-group shadow-sm">
                                            <input type={showPassword ? "text" : "password"} className={`form-control ${error.includes('Password') ? 'is-invalid' : ''}`} name="password" value={formData.password} onChange={handleChange} placeholder="•••••" />
                                            <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                            </button>
                                        </div>
                                        {/* Password strength requirements */}
                                        {formData.password && (
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
                                </div>
                            )}

                            {/* STEP 2: Access */}
                            {currentStep === 2 && (
                                <div className="fade-in">
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-secondary">Select User Role</label>
                                        <div className="row g-2">
                                            {roleOptions.map(role => (
                                                <div className="col-4" key={role}>
                                                    <button type="button" 
                                                        className={`btn w-100 py-3 small fw-bold border shadow-sm ${formData.role === role ? 'btn-primary border-primary' : 'btn-white'}`}
                                                        onClick={() => setFormData({...formData, role})}>
                                                        {role}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Station Assignment {formData.role === 'Operator' && <span className="text-danger">*</span>}</label>
                                        <select className={`form-select shadow-sm ${error.includes('station') ? 'is-invalid' : ''}`} name="station" value={formData.station} onChange={handleChange} disabled={formData.role !== 'Operator'}>
                                            <option value="">{formData.role === 'Operator' ? 'Select a Station...' : 'Not Applicable'}</option>
                                            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Avatar (Optional - Can be skipped) */}
                            {currentStep === 3 && (
                                <div className="text-center fade-in py-2">
                                    <div className="position-relative d-inline-block mb-3">
                                        <img src={avatarPreview} alt="Preview" className="img-fluid rounded-circle border border-4 border-white shadow" style={{ width: '140px', height: '140px', objectFit: 'cover' }} />
                                        <label htmlFor="avatar-input" className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle shadow">
                                            <i className="bi bi-camera-fill"></i>
                                        </label>
                                    </div>
                                    <input id="avatar-input" type="file" className="d-none" accept="image/*" onChange={handleFileChange} />
                                    <h6 className="fw-bold mb-1">Profile Photo</h6>
                                    <p className="text-muted small">This step is optional. You can click finish to continue.</p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer / Navigation */}
                    <div className="modal-footer bg-light border-top-0 p-4">
                        {currentStep > 1 && (
                            <button type="button" className="btn btn-link text-decoration-none text-muted fw-bold me-auto" onClick={prevStep}>
                                <i className="bi bi-arrow-left me-1"></i> Previous Step
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button type="button" className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm ms-auto" onClick={nextStep}>
                                Continue <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        ) : (
                            <button type="button" className="btn btn-success px-5 rounded-pill fw-bold shadow-sm ms-auto" onClick={handleSave} disabled={!!success}>
                                <i className="bi bi-check-circle me-2"></i> {isEditMode ? 'Save Changes' : 'Finish & Create'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};