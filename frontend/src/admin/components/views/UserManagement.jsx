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

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                .um-wrapper {
                    padding: 10px;
                }
                
                /* Summary Cards */
                .summary-cards-container {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }
                
                .summary-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                    border: 1px solid #f1f5f9;
                    flex: 1;
                    min-width: 200px;
                }
                
                .summary-card.total-users {
                    border-left: 4px solid #3b82f6;
                }
                
                .summary-card.active-operators {
                    border-left: 4px solid #10b981;
                }
                
                .summary-card.admins {
                    border-left: 4px solid #f59e0b;
                }
                
                .summary-card.it-assistants {
                    border-left: 4px solid #8b5cf6;
                }
                
                .summary-value {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #1e293b;
                    line-height: 1;
                    margin-bottom: 8px;
                }
                
                .summary-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
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
                    display: flex;
                    align-items: center;
                    padding: 15px 25px;
                    gap: 20px;
                }
                
                .user-row-card > div:first-child {
                    flex: 2;
                }
                
                .user-row-card > div:nth-child(2) {
                    flex: 1;
                }
                
                .user-row-card > div:nth-child(3) {
                    flex: 1.2;
                }
                
                .user-row-card > div:nth-child(4) {
                    flex: 1;
                    text-align: right;
                }
                
                .user-row-card > div:nth-child(5) {
                    flex: 1;
                    text-align: right;
                }

                /* Enhanced Avatar Styles */
                .avatar-circle {
                    width: 44px;
                    height: 44px;
                    object-fit: cover;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.12);
                    background: #f1f5f9;
                    position: relative;
                }
                
                .avatar-circle.me {
                    animation: pulse 2s infinite;
                    border-color: #10b981;
                }
                
                .avatar-circle.me::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #10b981;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: pulse-dot 2s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }
                
                @keyframes pulse-dot {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                /* Enhanced Role Badges */
                .role-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .role-badge i {
                    font-size: 0.7rem;
                }
                
                .badge-admin { 
                    background: #fef2f2; 
                    color: #dc2626; 
                    border: 1px solid #fecaca;
                }
                
                .badge-it { 
                    background: #eff6ff; 
                    color: #2563eb; 
                    border: 1px solid #dbeafe;
                }
                
                .badge-operator { 
                    background: #f8fafc; 
                    color: #475569; 
                    border: 1px solid #e2e8f0;
                }
                
                /* Pending Deployment Badge */
                .pending-deployment-badge {
                    background: #fef3c7;
                    color: #d97706;
                    border: 1px solid #fde68a;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 12px;
                    display: inline-block;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
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
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

            {/* SUMMARY CARDS */}
            <div className="summary-cards-container px-3 mb-4">
                <div className="summary-card total-users">
                    <div className="summary-value">{metrics.totalUsers}</div>
                    <div className="summary-label">Total Users</div>
                </div>
                <div className="summary-card active-operators">
                    <div className="summary-value">{metrics.activeOperators}</div>
                    <div className="summary-label">Active Operators</div>
                </div>
                <div className="summary-card admins">
                    <div className="summary-value">{metrics.admins}</div>
                    <div className="summary-label">Admins</div>
                </div>
                <div className="summary-card it-assistants">
                    <div className="summary-value">{metrics.itAssistants}</div>
                    <div className="summary-label">IT Assistants</div>
                </div>
            </div>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1 tracking-tight">User Management</h3>
                    <p className="text-muted small mb-0 fw-bold">Personnel registry and access level administration</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
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
                    <button className="add-user-btn shadow-sm" onClick={handleAddUser}>
                        <i className="bi bi-person-plus-fill me-2"></i>ADD SYSTEM USER
                    </button>
                </div>
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
                            <div key={u.id} className="user-row-card">
                                {/* Circular Avatar & Profile */}
                                <div className="d-flex align-items-center">
                                    <img
                                        src={u.avatar_url ? `${AVATAR_UPLOAD_PATH}${u.avatar_url}` : DEFAULT_AVATAR_PATH}
                                        className={`avatar-circle me-3 ${isMe ? 'me' : ''}`}
                                        alt="Avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_PATH; }}
                                    />
                                    <div>
                                        <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>
                                            {u.full_name || 'No Name'} {isMe && <span className="ms-1 text-success fw-bold" style={{fontSize: '0.65rem'}}>(ME)</span>}
                                        </div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{u.username}</div>
                                    </div>
                                </div>

                                {/* Access Level Column */}
                                <div>
                                    <span className={`role-badge ${badgeClass}`}>
                                        {badgeIcon}
                                        {u.role}
                                    </span>
                                </div>

                                {/* Station Column */}
                                <div>
                                    {!isAssigned ? (
                                        <span className="pending-deployment-badge">
                                            <i className="bi bi-clock me-1"></i>
                                            PENDING DEPLOYMENT
                                        </span>
                                    ) : (
                                        <div className="small fw-bold text-dark">
                                            <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                                            {u.station}
                                        </div>
                                    )}
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