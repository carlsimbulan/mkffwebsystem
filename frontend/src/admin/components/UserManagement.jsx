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
                    border-radius: 12px;
                    overflow: hidden;
                }
                .um-header {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 20px 25px;
                }
                .um-table thead th {
                    background: #f8fafc;
                    color: #64748b;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    font-weight: 700;
                    padding: 15px 20px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .um-table tbody td {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }
                .avatar-frame {
                    width: 42px;
                    height: 42px;
                    object-fit: cover;
                    border: 2px solid #fff;
                    outline: 1px solid #e2e8f0;
                    border-radius: 10px;
                }
                .role-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 5px 12px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .station-badge {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 4px 10px;
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                }
                .btn-add-user {
                    background: #107c55;
                    border: none;
                    font-weight: 700;
                    font-size: 0.85rem;
                    padding: 10px 20px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .btn-add-user:hover { background: #0d6646; }
                
                .btn-action {
                    padding: 6px 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    transition: all 0.2s;
                }
                .btn-view:hover { border-color: #107c55; color: #107c55; background: #f0fdf4; }
                .btn-delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
            `}</style>

            {/* HEADER SECTION */}
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-0 tracking-tight">User Management</h4>
                    <p className="text-muted small mb-0">Manage employee access, roles, and station assignments</p>
                </div>
                <button
                    className="btn btn-primary btn-add-user d-flex align-items-center"
                    onClick={handleAddUser}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> ADD SYSTEM USER
                </button>
            </div>

            <div className="um-container">
                {/* TOOLBAR */}
                <div className="um-header d-flex justify-content-between align-items-center">
                    <span className="small fw-bold text-muted text-uppercase tracking-wider">Registry List</span>
                    <span className="badge bg-dark rounded-pill px-3 py-2" style={{fontSize: '0.7rem'}}>
                        TOTAL ACCOUNTS: {userList.length}
                    </span>
                </div>

                <div className="table-responsive">
                    <table className="table um-table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Account Profile</th>
                                <th>Access Role</th>
                                <th>Assignment</th>
                                <th className="text-end">Registered On</th>
                                <th className="text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUserList.length > 0 ? sortedUserList.map(u => {
                                const isMe = u.id === user.id; 
                                const isAssigned = u.station && !u.station.toLowerCase().includes('not assigned');
                                
                                let roleClass = u.role === 'Administrator' ? 'bg-danger-subtle text-danger border-danger' : 
                                                u.role === 'IT Assistant' ? 'bg-info-subtle text-info border-info' : 
                                                'bg-primary-subtle text-primary border-primary';

                                return (
                                    <tr key={u.id} className={isMe ? 'bg-light bg-opacity-50' : ''}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                    className="avatar-frame me-3"
                                                    alt="User"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                />
                                                <div>
                                                    <div className="fw-bold text-dark small">
                                                        {u.full_name || 'No Name'} {isMe && <span className="ms-1 text-success fw-bold" style={{fontSize: '0.65rem'}}>(YOU)</span>}
                                                    </div>
                                                    <div className="text-muted" style={{fontSize: '0.7rem'}}>@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge border ${roleClass}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="station-badge">
                                                <i className={`bi ${isAssigned ? 'bi-geo-alt-fill text-primary' : 'bi-dash-circle'} me-1`}></i>
                                                {u.station || 'Not Assigned'}
                                            </span>
                                        </td>
                                        <td className="text-end text-muted small fw-medium">
                                            {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn-action btn-view" onClick={() => handleViewUser(u)}>
                                                    VIEW
                                                </button>
                                                <button 
                                                    className="btn-action btn-delete" 
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
                                    <td colSpan="5" className="py-5 text-center text-muted">
                                        <i className="bi bi-people text-light display-1"></i>
                                        <h6 className="fw-bold mt-3">No user records found</h6>
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
        </div>
    );
}