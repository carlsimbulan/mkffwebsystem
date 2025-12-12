import React, { useMemo } from 'react';
import { ViewUserModal } from './ViewUserModal'; // Existing Modal

// Helper function to extract the station number for correct numerical sorting
const getStationNumber = (station) => {
    // 999 is used as a high number to push 'Not Assigned' to the end of a group
    if (!station || station.toLowerCase().includes('not assigned')) return 999; 
    
    // Extract the number from strings like "Station1" or "Station 1"
    const match = station.match(/(\d+)$/); 
    // Return the number, or 999 if extraction fails
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
    // Implement Custom Sorting Logic (Unchanged)
    const sortedUserList = useMemo(() => {
        if (!userList || userList.length === 0) {
            return [];
        }

        const listCopy = [...userList];

        return listCopy.sort((a, b) => {
            // Helper function for assigning custom sort priority based on role
            const getRolePriority = (role) => {
                if (role === 'Administrator') return 1;
                if (role === 'IT Assistant') return 2;
                if (role === 'Operator') return 3;
                return 4; // Other roles go last
            };

            const priorityA = getRolePriority(a.role);
            const priorityB = getRolePriority(b.role);

            // 1. Sort by Role Priority (Admin -> IT Assistant -> Operator -> Other)
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // 2. If roles are the same, sort by Station Number (numerical ascending, 'Not Assigned' last)
            const stationNumA = getStationNumber(a.station);
            const stationNumB = getStationNumber(b.station);

            if (stationNumA !== stationNumB) {
                return stationNumA - stationNumB;
            }
            
            // 3. Fallback: Sort by user ID if all previous criteria are identical (ensures stable sort)
            return a.id - b.id; 
        });
    }, [userList]);

    // The rest of the component remains the same, only using sortedUserList for rendering
    return (
        <div className="animate-in fade-in pb-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">User Management</h3>
                    <p className="text-muted small mb-0">Control access and manage system accounts.</p>
                </div>
                <button
                    // ❌ Removed: shadow-sm
                    className="btn btn-primary px-4 py-2 rounded-pill fw-bold hover-scale d-flex align-items-center"
                    onClick={handleAddUser}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> Add User
                </button>
            </div>

            {/* User List Card */}
            {/* ❌ Removed: shadow-lg */}
            <div className="card border-0 rounded-3 overflow-hidden"> 
                {/* Card Header / Toolbar */}
                <div className="bg-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="text-uppercase small fw-bold text-muted ls-1">All Users</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 py-2 px-3">Total: {userList.length}</span>
                </div>

                <div className="table-responsive">
                    {/* Add sticky-top to the thead for better scrolling UX */}
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        <thead className="bg-light text-secondary text-uppercase small sticky-top" style={{ letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="border-bottom py-3 ps-4">User Profile</th>
                                <th className="border-bottom py-3">Role</th>
                                <th className="border-bottom py-3">Assigned Station</th>
                                <th className="border-bottom py-3 text-end pe-4">Date Added</th>
                                <th className="border-bottom py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {/* Use sortedUserList for rendering */}
                            {sortedUserList.length > 0 ? sortedUserList.map(u => {
                                const isMe = u.id === user.id; 
                                const isAssigned = u.station && !u.station.toLowerCase().includes('not assigned');
                                
                                // Dynamic styling based on the roles observed in your data
                                let roleColor;
                                let roleIcon;
                                
                                switch (u.role) {
                                    case 'Administrator':
                                        roleColor = 'danger';
                                        roleIcon = 'bi-shield-lock-fill';
                                        break;
                                    case 'IT Assistant':
                                        roleColor = 'info';
                                        roleIcon = 'bi-person-gear-fill';
                                        break;
                                    case 'Operator':
                                    default:
                                        roleColor = 'primary';
                                        roleIcon = 'bi-person-badge-fill';
                                        break;
                                }

                                return (
                                    <tr key={u.id} className={isMe ? 'table-primary bg-opacity-10' : ''}> {/* Highlight current user */}
                                        {/* Profile Column */}
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="position-relative me-3">
                                                    <img
                                                        src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                        alt="Avatar"
                                                        // ❌ Removed: shadow-sm from image
                                                        className="rounded-circle border border-2 border-white"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                    />
                                                    {/* Active Status Indicator */}
                                                    {isMe && <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: '10px', height: '10px' }}></span>}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{u.full_name || 'No Name'} {isMe && <span className="badge bg-secondary ms-1">You</span>}</div>
                                                    <div className="small text-muted">@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Column */}
                                        <td>
                                            <span className={`badge bg-${roleColor} bg-opacity-10 text-${roleColor} border border-${roleColor} border-opacity-10 rounded-pill px-3 py-2 fw-medium`}>
                                                <i className={`bi ${roleIcon} me-2`}></i>{u.role}
                                            </span>
                                        </td>

                                        {/* Station Column (Enhanced Visuals) */}
                                        <td>
                                            <span 
                                                className={`badge rounded-pill px-3 py-2 fw-medium ${isAssigned ? 'bg-primary-subtle text-primary border border-primary' : 'bg-warning-subtle text-warning border border-warning'}`}
                                            >
                                                <i className={`bi ${isAssigned ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-2`}></i>
                                                {u.station || 'Not Assigned'}
                                            </span>
                                        </td>

                                        {/* Date Column */}
                                        <td className="text-end pe-4 text-muted font-monospace small">
                                            {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>

                                        {/* Actions Column */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {/* View Button (Primary Outline - Unchanged style) */}
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleViewUser(u)}
                                                    title="View Details"
                                                >
                                                    View
                                                </button>

                                                {/* Delete Button (Danger Outline - Unchanged style) */}
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleConfirmDeleteUser(u)}
                                                    disabled={u.id === 1 || isMe}
                                                    title={u.id === 1 || isMe ? "Cannot delete primary or current user" : "Delete User"}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted bg-light">
                                        <div className="mb-3"><i className="bi bi-person-x-fill fs-1 opacity-50"></i></div>
                                        <p className="mb-0 fw-bold text-dark">No users found in the system.</p>
                                        <p className="mb-0 small text-muted">Click "Add User" to create a new account.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals (Unchanged) */}
            {showViewModal && (
                <ViewUserModal
                    viewUser={viewUser}
                    onClose={() => setShowViewModal(false)}
                    onEdit={handleEditUser}
                    AVATAR_UPLOAD_PATH={AVATAR_UPLOAD_PATH}
                    DEFAULT_AVATAR_PATH={DEFAULT_AVATAR_PATH}
                />
            )}

            <style jsx>{`
                .hover-scale:hover { transform: scale(1.02); }
                /* Ensure custom hover styles are defined to override default Bootstrap behavior if needed */
                .btn-outline-primary:hover {
                    background-color: #0d6efd !important;
                    color: white !important;
                    border-color: #0d6efd !important;
                }
                .btn-outline-danger:hover {
                    background-color: #dc3545 !important;
                    color: white !important;
                    border-color: #dc3545 !important;
                }
                .ls-1 { letter-spacing: 1px; }
                /* ❌ Removed: .shadow-sm-sm custom CSS definition */
                .bg-primary-subtle { background-color: #cfe2ff !important; }
                .bg-warning-subtle { background-color: #fff3cd !important; }
            `}</style>
        </div>
    );
}