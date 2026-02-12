import React, { useState } from 'react';

export const SettingsView = ({ user, onTargetTimeManagement }) => {
    // PIN Management States
    const [showChangePinModal, setShowChangePinModal] = useState(false);
    const [showViewPinModal, setShowViewPinModal] = useState(false);
    
    // Change PIN states
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isUpdatingPin, setIsUpdatingPin] = useState(false);
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmNewPin, setShowConfirmNewPin] = useState(false);
    
    // View PIN states
    const [adminPassword, setAdminPassword] = useState('');
    const [revealedPin, setRevealedPin] = useState('');
    const [viewPinError, setViewPinError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChangePin = async () => {
        if (!currentPin || !newPin || !confirmNewPin) {
            setPinError('All fields are required');
            return;
        }
        
        if (newPin !== confirmNewPin) {
            setPinError('New PIN and confirmation do not match');
            return;
        }
        
        if (newPin.length < 4) {
            setPinError('PIN must be at least 4 digits');
            return;
        }
        
        setIsUpdatingPin(true);
        setPinError('');
        
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/units.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_release_pin',
                    current_pin: currentPin,
                    new_pin: newPin
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('✅ PIN updated successfully!');
                setShowChangePinModal(false);
                setCurrentPin('');
                setNewPin('');
                setConfirmNewPin('');
                setPinError('');
            } else {
                setPinError(result.message || 'Failed to update PIN');
            }
        } catch (error) {
            console.error('Error updating PIN:', error);
            setPinError('Connection error. Please try again.');
        } finally {
            setIsUpdatingPin(false);
        }
    };

    const handleViewReleasePin = async () => {
        if (!adminPassword) {
            setViewPinError('Password is required');
            return;
        }
        
        setIsVerifying(true);
        setViewPinError('');
        
        try {
            const verifyResponse = await fetch('http://localhost/mkffwebsystem/backend/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    password: adminPassword
                })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.status === 'ok') {
                const pinResponse = await fetch('http://localhost/mkffwebsystem/backend/api/units.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'get_release_pin'
                    })
                });
                
                const pinResult = await pinResponse.json();
                
                if (pinResult.status === 'success') {
                    setRevealedPin(pinResult.pin);
                    setViewPinError('');
                } else {
                    setViewPinError('Failed to retrieve PIN');
                }
            } else {
                setViewPinError('Invalid password');
            }
        } catch (error) {
            console.error('Error:', error);
            setViewPinError('Connection error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCloseViewPinModal = () => {
        setShowViewPinModal(false);
        setAdminPassword('');
        setRevealedPin('');
        setViewPinError('');
    };

    const handleCloseChangePinModal = () => {
        setShowChangePinModal(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmNewPin('');
        setPinError('');
    };

    return (
        <div className="pb-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-gear-fill me-2 text-primary"></i>
                        System Settings
                    </h4>
                    <p className="text-muted small mb-0 mt-1">Configure system parameters and security settings</p>
                </div>
            </div>

            {/* Settings Cards Grid */}
            <div className="row g-4">
                {/* Station Thresholds Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-clock-history fs-4"></i>
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">Station Thresholds</h5>
                                    <p className="text-muted small mb-0">Configure target processing times</p>
                                </div>
                            </div>
                            <p className="text-muted small mb-3">
                                Set the maximum allowed processing time for each station. Units exceeding these thresholds will trigger delay alerts.
                            </p>
                            <button 
                                className="btn btn-primary w-100 fw-bold"
                                onClick={onTargetTimeManagement}
                            >
                                <i className="bi bi-sliders me-2"></i>
                                Configure Thresholds
                            </button>
                        </div>
                    </div>
                </div>

                {/* Release PIN Management Card */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                    <i className="bi bi-key-fill fs-4"></i>
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">Release PIN</h5>
                                    <p className="text-muted small mb-0">Shipment authorization security</p>
                                </div>
                            </div>
                            <p className="text-muted small mb-3">
                                Manage the PIN required to authorize shipment releases. View current PIN or update to a new one.
                            </p>
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-outline-primary flex-fill fw-bold"
                                    onClick={() => setShowViewPinModal(true)}
                                >
                                    <i className="bi bi-eye me-2"></i>
                                    View PIN
                                </button>
                                <button 
                                    className="btn btn-primary flex-fill fw-bold"
                                    onClick={() => setShowChangePinModal(true)}
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Reset PIN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change PIN Modal */}
            {showChangePinModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '450px' }}>
                        <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">Reset Release PIN</h5>
                                <small className="opacity-75">Update authorization PIN</small>
                            </div>
                            <button 
                                className="btn-close btn-close-white shadow-none" 
                                onClick={handleCloseChangePinModal}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-key me-1"></i>
                                    Current PIN
                                </label>
                                <div className="position-relative">
                                    <input 
                                        type={showCurrentPin ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Enter current PIN"
                                        value={currentPin}
                                        maxLength="10"
                                        onChange={(e) => {
                                            setCurrentPin(e.target.value);
                                            setPinError('');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                                        style={{ background: 'none', border: 'none', padding: '0.25rem 0.5rem' }}
                                    >
                                        <i className={`bi ${showCurrentPin ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-key-fill me-1"></i>
                                    New PIN
                                </label>
                                <div className="position-relative">
                                    <input 
                                        type={showNewPin ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Enter new PIN (min 4 digits)"
                                        value={newPin}
                                        maxLength="10"
                                        onChange={(e) => {
                                            setNewPin(e.target.value);
                                            setPinError('');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                                        onClick={() => setShowNewPin(!showNewPin)}
                                        style={{ background: 'none', border: 'none', padding: '0.25rem 0.5rem' }}
                                    >
                                        <i className={`bi ${showNewPin ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold text-muted small">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Confirm New PIN
                                </label>
                                <div className="position-relative">
                                    <input 
                                        type={showConfirmNewPin ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Re-enter new PIN"
                                        value={confirmNewPin}
                                        maxLength="10"
                                        onChange={(e) => {
                                            setConfirmNewPin(e.target.value);
                                            setPinError('');
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && currentPin && newPin && confirmNewPin) {
                                                handleChangePin();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                                        onClick={() => setShowConfirmNewPin(!showConfirmNewPin)}
                                        style={{ background: 'none', border: 'none', padding: '0.25rem 0.5rem' }}
                                    >
                                        <i className={`bi ${showConfirmNewPin ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                    </button>
                                </div>
                            </div>
                            
                            {pinError && (
                                <div className="alert alert-danger py-2 px-3 small">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    {pinError}
                                </div>
                            )}
                            
                            <div className="d-flex gap-2 justify-content-end mt-4">
                                <button 
                                    className="btn btn-light px-4 fw-bold" 
                                    onClick={handleCloseChangePinModal}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary px-4 fw-bold shadow-sm" 
                                    onClick={handleChangePin}
                                    disabled={!currentPin || !newPin || !confirmNewPin || isUpdatingPin}
                                >
                                    {isUpdatingPin ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-1"></i>
                                            Update PIN
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View PIN Modal */}
            {showViewPinModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '450px' }}>
                        <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">View Release PIN</h5>
                                <small className="opacity-75">Admin verification required</small>
                            </div>
                            <button 
                                className="btn-close btn-close-white shadow-none" 
                                onClick={handleCloseViewPinModal}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            {!revealedPin ? (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-shield-lock fs-2"></i>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-2">Security Verification</h6>
                                        <p className="text-muted small mb-0">Enter your admin password to view the release PIN</p>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-muted small">
                                            <i className="bi bi-lock me-1"></i>
                                            Admin Password
                                        </label>
                                        <input 
                                            type="password" 
                                            className={`form-control ${viewPinError ? 'is-invalid' : ''}`}
                                            placeholder="Enter your password"
                                            value={adminPassword}
                                            onChange={(e) => {
                                                setAdminPassword(e.target.value);
                                                setViewPinError('');
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && adminPassword) {
                                                    handleViewReleasePin();
                                                }
                                            }}
                                            autoFocus
                                        />
                                        {viewPinError && (
                                            <div className="invalid-feedback d-block">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {viewPinError}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button 
                                            className="btn btn-light px-4 fw-bold" 
                                            onClick={handleCloseViewPinModal}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-primary px-4 fw-bold shadow-sm" 
                                            onClick={handleViewReleasePin}
                                            disabled={!adminPassword || isVerifying}
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-unlock me-1"></i>
                                                    Verify
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-check-circle fs-2"></i>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-2">Current Release PIN</h6>
                                        <p className="text-muted small mb-0">Keep this PIN secure and confidential</p>
                                    </div>
                                    
                                    <div className="alert alert-primary d-flex align-items-center justify-content-center py-4 mb-4" style={{ fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                        {revealedPin}
                                    </div>
                                    
                                    <div className="alert alert-warning py-2 px-3 small mb-3">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        This PIN is used to authorize shipment releases. Do not share with unauthorized personnel.
                                    </div>
                                    
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button 
                                            className="btn btn-primary px-4 fw-bold" 
                                            onClick={handleCloseViewPinModal}
                                        >
                                            <i className="bi bi-check-lg me-1"></i>
                                            Close
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
