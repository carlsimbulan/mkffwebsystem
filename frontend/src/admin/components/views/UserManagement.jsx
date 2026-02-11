import React, { useMemo, useState } from 'react';
import { ViewUserModal } from '../../modals';

const getStationNumber = (station) => {
    if (!station || station.toLowerCase().includes('not assigned')) return 999; 
    const match = station.match(/(\d+)$/); 
    return match ? parseInt(match[1], 10) : 999; 
};

export function UserManagement({
    user,
    userList,
    AVATAR_UPLOAD_PATH,
    DEFAULT_AVATAR_PATH,
    handleAddUser,
    handleViewUser,
    handleConfirmDeleteUser,
    showViewModal,
    viewUser,
    setShowViewModal,
    handleEditUser
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [revealedPin, setRevealedPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Compute metrics for summary cards
    const metrics = useMemo(() => {
        if (!userList || userList.length === 0) {
            return {
                totalUsers: 0,
                activeOperators: 0,
                admins: 0,
                itAssistants: 0
            };
        }
        
        return {
            totalUsers: userList.length,
            activeOperators: userList.filter(u => u.role === 'Operator' && u.station && !u.station.toLowerCase().includes('not assigned')).length,
            admins: userList.filter(u => u.role === 'Administrator').length,
            itAssistants: userList.filter(u => u.role === 'IT Assistant').length
        };
    }, [userList]);

    const sortedUserList = useMemo(() => {
        if (!userList || userList.length === 0) return [];
        const listCopy = [...userList];
        
        // Apply search filter
        let filteredList = listCopy;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredList = listCopy.filter(u => 
                (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
                (u.username && u.username.toLowerCase().includes(searchLower)) ||
                (u.station && u.station.toLowerCase().includes(searchLower))
            );
        }
        
        return filteredList.sort((a, b) => {
            const getRolePriority = (role) => {
                if (role === 'Administrator') return 1;
                if (role === 'IT Assistant') return 2;
                if (role === 'Operator') return 3;
                return 4;
            };
            const priorityA = getRolePriority(a.role);
            const priorityB = getRolePriority(b.role);
            if (priorityA !== priorityB) return priorityA - priorityB;
            const stationNumA = getStationNumber(a.station);
            const stationNumB = getStationNumber(b.station);
            if (stationNumA !== stationNumB) return stationNumA - stationNumB;
            return a.id - b.id; 
        });
    }, [userList, user.id, searchTerm]);

    const handleViewReleasePin = async () => {
        if (!adminPassword) {
            setPinError('Password is required');
            return;
        }
        
        setIsVerifying(true);
        setPinError('');
        
        try {
            // Verify admin password
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
                // Get the release PIN
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
                    setPinError('');
                } else {
                    setPinError('Failed to retrieve PIN');
                }
            } else {
                setPinError('Invalid password');
            }
        } catch (error) {
            console.error('Error:', error);
            setPinError('Connection error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClosePinModal = () => {
        setShowPinModal(false);
        setAdminPassword('');
        setRevealedPin('');
        setPinError('');
    };

    return (
        <div className="pb-5">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-people-fill me-2 text-primary"></i>
                        User Management
                    </h4>
                    <p className="text-muted small mb-0 mt-1">Personnel registry and access level administration</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                    <button 
                        className="btn btn-outline-secondary rounded p-2 px-3 shadow-sm transition-all" 
                        onClick={() => setShowPinModal(true)}
                        title="View Release PIN"
                    >
                        <i className="bi bi-key me-2"></i>
                        View Release PIN
                    </button>
                    <div className="search-container">
                        <i className="bi bi-search search-icon"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary rounded p-2 px-3 shadow-sm transition-all" onClick={handleAddUser}>
                        <i className="bi bi-person-plus me-2"></i>
                        Add User
                    </button>
                </div>
            </div>

            {/* --- MAIN TABLE --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-dark text-white">
                            <tr>
                                <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>USER PROFILE</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>ACCESS LEVEL</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>FLOOR ASSIGNMENT</th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>REGISTRY DATE</th>
                                <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUserList.length > 0 ? sortedUserList.map(u => {
                                const isMe = u.id === user.id; 
                                const isAssigned = u.station && !u.station.toLowerCase().includes('not assigned');
                                
                                let badgeClass = "badge-operator";
                                let badgeIcon = null;
                                if (u.role === 'Administrator') {
                                    badgeClass = "badge-admin";
                                    badgeIcon = <i className="bi bi-shield-lock"></i>;
                                }
                                else if (u.role === 'IT Assistant') {
                                    badgeClass = "badge-it";
                                    badgeIcon = <i className="bi bi-gear"></i>;
                                }
                                else if (u.role === 'Operator') {
                                    badgeIcon = <i className="bi bi-gear"></i>;
                                }

                                return (
                                    <tr key={u.id} className="border-bottom hover-bg-light transition-all">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                    className="avatar-circle me-3 rounded-circle"
                                                    style={{ width: '40px', height: '40px' }}
                                                    alt="Avatar"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                />
                                                <div>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {u.full_name || 'No Name'} {isMe && <span className="ms-1 text-success fw-bold" style={{ fontSize: '0.65rem' }}>(ME)</span>}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`badge rounded-pill fw-normal ${
                                                u.role === 'Administrator' ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' :
                                                u.role === 'IT Assistant' ? 'bg-info bg-opacity-10 text-info border border-info border-opacity-25' :
                                                'bg-success bg-opacity-10 text-success border border-success border-opacity-25'
                                            }`} style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            {!isAssigned ? (
                                                <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-normal" style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                    Not Assigned
                                                </span>
                                            ) : (
                                                <div className="text-dark" style={{ fontSize: '0.8rem' }}>
                                                    <i className="bi bi-geo-alt text-muted me-1" style={{ fontSize: '0.75rem' }}></i>
                                                    {u.station}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-muted fw-semibold">
                                                <i className="bi bi-calendar me-1"></i>
                                                {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="d-flex gap-2 justify-content-center">
                                                <button className="btn btn-sm btn-primary rounded p-2 px-3 transition-all" onClick={() => handleViewUser(u)} title="View Details">
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger rounded p-2 px-3 transition-all" 
                                                    onClick={() => handleConfirmDeleteUser(u)}
                                                    disabled={u.id === 1 || isMe}
                                                    title="Remove User"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <i className="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                                        <h6 className="fw-bold text-dark">No Users Found</h6>
                                        <p className="text-muted small mb-0">No matching user records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showViewModal && (
                <ViewUserModal
                    viewUser={viewUser}
                    onClose={() => setShowViewModal(false)}
                    onEdit={handleEditUser}
                    AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                    DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                />
            )}

            {/* --- VIEW RELEASE PIN MODAL --- */}
            {showPinModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '450px' }}>
                        <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 className="mb-0 fw-bold">View Release PIN</h5>
                                <small className="opacity-75">Admin verification required</small>
                            </div>
                            <button 
                                className="btn-close btn-close-white shadow-none" 
                                onClick={handleClosePinModal}
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
                                            className={`form-control ${pinError ? 'is-invalid' : ''}`}
                                            placeholder="Enter your password"
                                            value={adminPassword}
                                            onChange={(e) => {
                                                setAdminPassword(e.target.value);
                                                setPinError('');
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && adminPassword) {
                                                    handleViewReleasePin();
                                                }
                                            }}
                                            autoFocus
                                        />
                                        {pinError && (
                                            <div className="invalid-feedback d-block">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {pinError}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button 
                                            className="btn btn-light px-4 fw-bold" 
                                            onClick={handleClosePinModal}
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
                                            onClick={handleClosePinModal}
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

// Add custom styles
const customStyles = `
<style>
.hover-bg-light:hover {
    background-color: rgba(248, 250, 252, 0.8) !important;
}

.transition-all {
    transition: all 0.15s ease;
}

.border-bottom {
    border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
}

.badge {
    font-weight: 500;
    letter-spacing: 0.2px;
}

.table {
    border-collapse: separate;
    border-spacing: 0;
}

.shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.shadow-lg {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Search Bar Styles */
.search-container {
    position: relative;
    width: 280px;
}

.search-input {
    width: 100%;
    padding: 10px 16px 10px 42px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    background: #f8fafc;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #64748b;
    background: white;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 1rem;
    pointer-events: none;
}
</style>
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement.firstElementChild);
}