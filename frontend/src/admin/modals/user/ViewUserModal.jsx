import React, { useState } from 'react';

// Default constants (pwede ring ipasa as props)
const AVATAR_UPLOAD_PATH_PLACEHOLDER = `http://localhost/mkffwebsystem/backend/api/uploads/avatars/`;
const DEFAULT_AVATAR_PATH_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTE2IDguNWExLjUgMS41IDAgMSAxIDAgLTVhMS41IDEuNSAwIDAgMSAwIDVaTTkgMTMuNGM2LjUgMCA3IDUuMyA3IDV2Mi41aC0xNGwtLjItLjJjLS4xLS4xLS40LS41LS43LS45LS40LS41LS43LTEuMS0uNy0xLjhjMC0uNi40LTEuMS44LTEuNS41LS41IDEuMy0uNyAyLjItLjcgMS4yIDAgMi4xLjMgMyAxLjEgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjkgLS41IDEuNi0xLjMgMi4zLS41LjUtMS4xLjgtMS44LjhoLTJjLS45IDAtMS42LS4zLTIuMS0uN2wxLjgtLjIgLjMtLjNjLS41LS41LS45LS44LTEuNC0xLjIgMS0uOSAxLjctMi40IDEuNy00LjUgMC0xLS40LTEuOS0xLjEtMi42LS42LS43LTEuNS0xLjEtMi41LTEuMi0xLjIgMC0yLjQuNS0zLjUgMS41LS41LjItLjkuNS0xLjQgLjcgLjIuNS40LjkuNSAxLjQgLjIgLjQgLjQgLjggLjQgMS4yIDAgLjggLS41IDEuNi0xLjQgMi4zLS4zLjItLjYuNS0uOS43bC0xLjguMi0uMi0uMmMtLjQtLjQtLjctLjgtLjctMS40IDAtLjggLjUtMS41IDEuMS0yLjIgLjUtLjUgMS4xLS44IDEuOC0uOC45IDAgMS43LjMgMi40LjkgLjQtLjIuOC0uNCAxLjItLjcgMC0uNy0uMy0xLjQtLjktMi4xLS41LS42LTEuMi0xLS43LTEuNyAwLS42LjUtMS4xIDEtMS41LjQtLjQgLjctLjUgMS4yLS42LjYtLjIgMS41LS4yIDIuMiAwIDAgLjUgLjQgLjcgLjggMS4xLjMtLjIuNi0uNCAxLS42LjktLjUgMi0uNyAyLjgtLjcgc20uMy0uNWMuOCAwIDEuNC41IDEuNSAxLjEuMS43LS41IDEuMy0xLjQgMS40LS44IDAtMS41LS42LTEuNS0xLjIgMC0uNS40LS45LjgtMS4zLjUtLjQgMS4yLS42IDEuNi0uNnptMi44IDYuOC40LjRjLjIgLjEuNC4yLjYgLjUgMCAuNy0uMyAxLjQtLjggMi4xLS40LjYtMSAxLjEtMS44IDEuNC0uMS4xLS4zLjEtLjQuM2wtLjMtLjNjLS41LS41LS44LTEuMS0uOC0xLjggMC0uOC40LTEuNSAxLjItMi4xem0tMS41LS40Yy0uMi0uMS0uMy0uMi0uNC0uMy0uMi0uMi0uMy0uNC0uNS0uNi0uMy0uMy0uNi0uNS0uOC0uNy0uMy0uMy0uNS0uNi0uNy0uOS0uNS0uNi0uOC0xLjQtLjgtMi40IDAtLjkuMy0xLjcgLjktMi40LjUtLjUgMS4zLS44IDIuMy0uOCAxLjIgMCAyLjEuMyAzIC45LjQuMi43LjUgMS4xLjcuNC4zLjcgLjYgLjggLjkgLjMgLjUgLjYgMSAuOCAxLjYgLjMgLjYgLjUgMS4yLjUgMS44IDAgLjgtLjIgMS41LS42IDIuMS0uNC43LS45IDEuMy0xLjUgMS43em0tMS4zLTYuM2h-MS4zLjRjLS4xLjQtLjIuOS0uMyAxLjItLjQuNy0uNSAxLjQtLjUgMi4yIDAgLjcuMyAxLjMuOSAxLjguNC0uMi43LS41IDEtLjkuNS0uNS43LTEuMS43LTEuOCAwLS45IDAtMS43LS41LTIuNC0uNS0uNi0xLjMtMS0xLjgtMS4yLS4xLjMtLjIuNi0uNCAxeiIvPjwvc3ZnPg==';

export const ViewUserModal = ({ 
    viewUser, 
    onClose, 
    onEdit, 
    AVATAR_UPLOAD_PATH = AVATAR_UPLOAD_PATH_PLACEHOLDER, 
    DEFAULT_AVATAR_PATH = DEFAULT_AVATAR_PATH_PLACEHOLDER 
}) => {
    const [showPasswordInModal, setShowPasswordInModal] = useState(false);

    if (!viewUser) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"><i className="bi bi-person-badge me-2"></i> User Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-center mb-4">
                            <img
                                src={viewUser.avatar_url ? `${AVATAR_UPLOAD_PATH}${viewUser.avatar_url}` : DEFAULT_AVATAR_PATH}
                                alt="Profile"
                                className="rounded-circle shadow-sm"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                            />
                            <h4 className="mt-2">{viewUser.full_name}</h4>
                            <span className="badge bg-secondary">{viewUser.role}</span>
                        </div>

                        <div className="mb-3">
                            <label className="fw-bold text-muted small">Username</label>
                            <div className="form-control bg-light">{viewUser.username}</div>
                        </div>

                        <div className="mb-3">
                            <label className="fw-bold text-muted small">Password</label>
                            <div className="input-group">
                                <input 
                                    type={showPasswordInModal ? "text" : "password"} 
                                    className="form-control bg-light" 
                                    value={viewUser.password} 
                                    readOnly 
                                />
                                {/* FIX: Pinalitan ang btn-outline-secondary ng btn-light border para hindi mag-flash ng black */}
                                <button 
                                    className="btn btn-light border" 
                                    type="button" 
                                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                                >
                                    {showPasswordInModal ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="fw-bold text-muted small">Station</label>
                                <div className="form-control bg-light">{viewUser.station || 'N/A'}</div>
                            </div>
                            <div className="col-6 mb-3">
                                <label className="fw-bold text-muted small">User ID</label>
                                <div className="form-control bg-light">{viewUser.id}</div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={() => {
                                onClose(); 
                                onEdit(viewUser); 
                            }}
                        >
                            <i className="bi bi-pencil me-2"></i> Edit User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};