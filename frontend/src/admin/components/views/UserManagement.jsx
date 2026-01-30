import React, { useMemo } from 'react';
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
    }, [userList, user.id]);

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                .um-wrapper {
                    padding: 10px;
                }
                
                .um-registry-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.2fr 1fr 1fr;
                    padding: 15px 25px;
                    background: #f1f5f9;
                    border-radius: 12px;
                    margin-bottom: 15px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .user-row-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.2fr 1fr 1fr;
                    align-items: center;
                    padding: 15px 25px;
                    transition: all 0.2s ease;
                }

                .user-row-card:hover {
                    background-color: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(8px);
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                /* Perfect Circle Avatar */
                .avatar-circle {
                    width: 44px;
                    height: 44px;
                    object-fit: cover;
                    border-radius: 50%; /* Ginawang bilog */
                    border: 2px solid #fff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.12);
                    background: #f1f5f9;
                }

                .role-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    display: inline-block;
                }
                .badge-admin { background: #fef2f2; color: #dc2626; }
                .badge-it { background: #eff6ff; color: #2563eb; }
                .badge-operator { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }

                .btn-view-action {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                    outline: none;
                }
                .btn-view-action:active { transform: scale(0.95); background: #1d4ed8; }

                .btn-delete-action {
                    background: #ffffff;
                    color: #dc2626;
                    border: 1px solid #fee2e2;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    outline: none;
                }
                .btn-delete-action:active:not(:disabled) { transform: scale(0.95); background: #fef2f2; }
                .btn-delete-action:disabled { opacity: 0.15; cursor: not-allowed; }

                .add-user-btn {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    outline: none;
                }
                .add-user-btn:active { transform: scale(0.97); opacity: 0.9; }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1 tracking-tight">User Management</h3>
                    <p className="text-muted small mb-0 fw-bold">Personnel registry and access level administration</p>
                </div>
                <button className="add-user-btn shadow-sm" onClick={handleAddUser}>
                    <i className="bi bi-person-plus-fill me-2"></i>ADD SYSTEM USER
                </button>
            </div>

            <div className="um-wrapper">
                {/* GRID HEADER */}
                <div className="um-registry-header d-none d-md-grid">
                    <div>User Profile</div>
                    <div>Access Level</div>
                    <div>Floor Assignment</div>
                    <div className="text-end">Registry Date</div>
                    <div className="text-end">Operations</div>
                </div>

                {/* USER LIST (CARDS) */}
                <div className="user-list">
                    {sortedUserList.length > 0 ? sortedUserList.map(u => {
                        const isMe = u.id === user.id; 
                        const isAssigned = u.station && !u.station.toLowerCase().includes('not assigned');
                        
                        let badgeClass = "badge-operator";
                        if (u.role === 'Administrator') badgeClass = "badge-admin";
                        else if (u.role === 'IT Assistant') badgeClass = "badge-it";

                        return (
                            <div key={u.id} className="user-row-card">
                                {/* Circular Avatar & Profile */}
                                <div className="d-flex align-items-center">
                                    <img
                                        src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                        className="avatar-circle me-3"
                                        alt="Avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                    />
                                    <div>
                                        <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>
                                            {u.full_name || 'No Name'} {isMe && <span className="ms-1 text-success fw-bold" style={{fontSize: '0.65rem'}}>(ME)</span>}
                                        </div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>@{u.username}</div>
                                    </div>
                                </div>

                                {/* Access Level Column */}
                                <div>
                                    <span className={`role-badge ${badgeClass}`}>
                                        {u.role}
                                    </span>
                                </div>

                                {/* Station Column */}
                                <div>
                                    <div className="small fw-bold text-dark">
                                        <i className={`bi ${isAssigned ? 'bi-geo-alt-fill text-primary' : 'bi-dash-circle text-muted'} me-2`}></i>
                                        {u.station || 'Not Assigned'}
                                    </div>
                                </div>

                                {/* Registry Date Column */}
                                <div className="text-end text-muted fw-bold" style={{fontSize: '0.8rem'}}>
                                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>

                                {/* Actions Column */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button className="btn-view-action shadow-sm" onClick={() => handleViewUser(u)}>
                                        Details
                                    </button>
                                    <button 
                                        className="btn-delete-action" 
                                        onClick={() => handleConfirmDeleteUser(u)}
                                        disabled={u.id === 1 || isMe}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-5 border rounded-4 bg-light">
                            <p className="mb-0 fw-bold text-muted opacity-50 uppercase tracking-widest">No matching user records</p>
                        </div>
                    )}
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