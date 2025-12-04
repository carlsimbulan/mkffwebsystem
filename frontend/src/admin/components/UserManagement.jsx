import React from 'react';
import { ViewUserModal } from './ViewUserModal'; // Existing Modal

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
    return (
        <div className="animate-in fade-in pb-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">User Management</h3>
                    <p className="text-muted small mb-0">Control access and manage system accounts.</p>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold hover-scale d-flex align-items-center"
                    onClick={handleAddUser}
                >
                    <i className="bi bi-person-plus-fill me-2"></i> Add User
                </button>
            </div>

            {/* User List Card */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                {/* Card Header / Toolbar */}
                <div className="bg-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="text-uppercase small fw-bold text-muted ls-1">All Users</span>
                    <span className="badge bg-light text-dark border">Total: {userList.length}</span>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        <thead className="bg-light text-secondary text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4">User Profile</th>
                                <th className="border-0 py-3">Role</th>
                                <th className="border-0 py-3">Assigned Station</th>
                                <th className="border-0 py-3 text-end pe-4">Date Added</th>
                                <th className="border-0 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {userList.length > 0 ? userList.map(u => {
                                const isMe = u.id === user.id; // Assuming 'user' is the logged-in admin
                                const roleColor = u.role === 'Administrator' ? 'danger' : 'primary';
                                const roleIcon = u.role === 'Administrator' ? 'bi-shield-lock-fill' : 'bi-person-badge-fill';

                                return (
                                    <tr key={u.id}>
                                        {/* Profile Column */}
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="position-relative me-3">
                                                    <img
                                                        src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                                        alt="Avatar"
                                                        className="rounded-circle border border-2 border-white shadow-sm"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                                    />
                                                    {isMe && <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: '10px', height: '10px' }}></span>}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{u.full_name || 'No Name'}</div>
                                                    <div className="small text-muted">@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Column */}
                                        <td>
                                            <span className={`badge bg-${roleColor} bg-opacity-10 text-${roleColor} border border-${roleColor} border-opacity-10 rounded-pill px-3 py-2 fw-normal`}>
                                                <i className={`bi ${roleIcon} me-2`}></i>{u.role}
                                            </span>
                                        </td>

                                        {/* Station Column */}
                                        <td>
                                            {u.station ? (
                                                <div className="d-flex align-items-center text-dark">
                                                    <i className="bi bi-geo-alt text-secondary me-2"></i>
                                                    {u.station}
                                                </div>
                                            ) : (
                                                <span className="text-muted small fst-italic">Not Assigned</span>
                                            )}
                                        </td>

                                        {/* Date Column */}
                                        <td className="text-end pe-4 text-muted font-monospace small">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Actions Column */}
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-sm btn-light border text-primary hover-primary rounded-circle"
                                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                                    onClick={() => handleViewUser(u)}
                                                    title="View Details"
                                                >
                                                    <i className="bi bi-eye-fill"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-light border text-danger hover-danger rounded-circle"
                                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                                    onClick={() => handleConfirmDeleteUser(u)}
                                                    disabled={u.id === 1 || isMe}
                                                    title="Delete User"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted">
                                        <div className="mb-3"><i className="bi bi-people fs-1 opacity-25"></i></div>
                                        <p className="mb-0">No users found in the system.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
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
                .hover-primary:hover { background-color: #0d6efd; color: white !important; border-color: #0d6efd !important; }
                .hover-danger:hover { background-color: #dc3545; color: white !important; border-color: #dc3545 !important; }
                .ls-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
}