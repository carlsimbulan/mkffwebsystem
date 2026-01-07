import React, { useMemo } from 'react';
import { ViewUserModal } from './ViewUserModal';

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
    const sortedUserList = useMemo(() => {
        if (!userList || userList.length === 0) return [];
        const listCopy = [...userList];
        return listCopy.sort((a, b) => {
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
    }, [userList]);

    return (
        <div className="container-fluid px-0 py-2 animate-in fade-in">
            <style>{`
                .um-container {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .um-header {
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    padding: 18px 24px;
                }
                .um-table thead th {
                    background: #f8fafc;
                    color: #64748b;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    font-weight: 700;
                    padding: 14px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .um-table tbody td {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }
                .avatar-frame {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                
                /* CLEAN PLAIN TEXT ROLE STYLES */
                .role-text {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                }
                .role-admin { color: #dc2626; } 
                .role-it { color: #2563eb; }    
                
                /* UPDATED: GREEN ADD USER BUTTON */
                .btn-add-user {
                    background: #198754;
                    color: white;
                    border: none;
                    font-weight: 700;
                    font-size: 0.8rem;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .btn-add-user:hover { 
                    background: #157347; 
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.2);
                }
                
                /* VISIBLE ACTION BUTTONS */
                .btn-action {
                    padding: 7px 18px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: 4px;
                    border: none;
                    transition: all 0.2s;
                    min-width: 85px;
                }
                .btn-view {
                    background: #0d6efd;
                    color: white;
                }
                .btn-view:hover {
                    background: #0b5ed7;
                    transform: translateY(-1px);
                }
                .btn-delete {
                    background: #dc3545;
                    color: white;
                }
                .btn-delete:hover:not(:disabled) {
                    background: #bb2d3b;
                    transform: translateY(-1px);
                }
                .btn-delete:disabled {
                    background: #f1f5f9;
                    color: #cbd5e1;
                    cursor: not-allowed;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-1 tracking-tight">User Management</h4>
                    <p className="text-muted small mb-0">System access control and registry</p>
                </div>
                {/* --- GREEN BUTTON --- */}
                <button
                    className="btn btn-add-user d-flex align-items-center shadow-sm"
                    onClick={handleAddUser}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> ADD SYSTEM USER
                </button>
            </div>

            <div className="um-container shadow-sm">
                <div className="um-header d-flex justify-content-between align-items-center">
                    <span className="small fw-bold text-secondary text-uppercase tracking-wider">System Registry</span>
                    <span className="text-muted small">Total Accounts: <b>{userList.length}</b></span>
                </div>

                <div className="table-responsive">
                    <table className="table um-table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Account Profile</th>
                                <th>Access Role</th>
                                <th>Station</th>
                                <th className="text-end">Registered</th>
                                <th className="text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUserList.length > 0 ? sortedUserList.map(u => {
                                const isMe = u.id === user.id; 
                                const isAssigned = u.station && !u.station.toLowerCase().includes('not assigned');
                                
                                let roleColorClass = "";
                                if (u.role === 'Administrator') roleColorClass = "role-admin";
                                else if (u.role === 'IT Assistant') roleColorClass = "role-it";

                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                    className="avatar-frame me-3"
                                                    alt="User"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                />
                                                <div>
                                                    <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>
                                                        {u.full_name || 'No Name'} {isMe && <span className="ms-1 text-success fw-bold" style={{fontSize: '0.7rem'}}>(ME)</span>}
                                                    </div>
                                                    <div className="text-muted" style={{fontSize: '0.75rem'}}>@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-text ${roleColorClass}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-muted small fw-bold">
                                                <i className={`bi ${isAssigned ? 'bi-geo-alt-fill text-primary' : 'bi-dash-circle'} me-2`}></i>
                                                {u.station || 'Not Assigned'}
                                            </span>
                                        </td>
                                        <td className="text-end text-muted small fw-medium">
                                            {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn-action btn-view shadow-sm" onClick={() => handleViewUser(u)}>
                                                    VIEW
                                                </button>
                                                <button 
                                                    className="btn-action btn-delete shadow-sm" 
                                                    onClick={() => handleConfirmDeleteUser(u)}
                                                    disabled={u.id === 1 || isMe}
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted">No records found.</td>
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
        </div>
    );
}