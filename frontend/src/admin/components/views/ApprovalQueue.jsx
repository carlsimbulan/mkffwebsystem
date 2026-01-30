import React, { useMemo } from 'react';
import { ApproveUnitModal } from '../../modals';

/**
 * ApprovalQueue Component
 * Nagpapakita ng listahan ng mga unit na nangangailangan ng QA validation.
 * May kasamang "Overdue" logic para sa mga unit na lampas 30 mins na sa queue.
 */
export function ApprovalQueue({
    logs = [],
    setSelectedLogToApprove,
    setShowApproveModal,
    showApproveModal,
    selectedLogToApprove,
    executeApproval
}) {
    // 1. Filter logs to show only those pending approval
    // Ginagamit ang useMemo para hindi mag-recompute kung walang nagbago sa logs
    const approvalQueueLogs = useMemo(() => 
        logs.filter(l => l.status === 'Pending Approval'), 
    [logs]);

    // 2. Helper function para macheck kung overdue (30-minute threshold)
    const checkOverdue = (updatedAt) => {
        if (!updatedAt) return false;
        const now = Date.now();
        const updated = new Date(updatedAt).getTime();
        const diffInMinutes = (now - updated) / (1000 * 60);
        return diffInMinutes > 30;
    };

    return (
        <div className="approval-queue-container animate-in fade-in pb-5">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Approval Queue</h3>
                    <p className="text-muted small mb-0">Review flagged units requiring QA validation.</p>
                </div>
                {approvalQueueLogs.length > 0 && (
                    <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm d-flex align-items-center">
                        <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                        {approvalQueueLogs.length} Pending
                    </span>
                )}
            </div>

            {/* --- TABLE CARD SECTION --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="approval-table-header text-uppercase small">
                            <tr>
                                <th className="ps-4">Assembly No.</th>
                                <th>Origin Station</th>
                                <th className="text-center">Status</th>
                                <th style={{ width: '25%' }}>Remarks</th>
                                <th className="text-end">Timestamp</th>
                                <th className="text-center pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {approvalQueueLogs.length > 0 ? (
                                approvalQueueLogs.map(log => {
                                    const isOverdue = checkOverdue(log.updated_at);
                                    
                                    return (
                                        <tr key={log.id} className={isOverdue ? 'overdue-row' : ''}>
                                            {/* Overdue Left Border Indicator */}
                                            <td className="ps-4 position-relative">
                                                {isOverdue && <div className="overdue-indicator"></div>}
                                                <div className="d-flex align-items-center">
                                                    <span className="fw-bold text-primary font-monospace">{log.assembly_no}</span>
                                                    {isOverdue && (
                                                        <span className="ms-2 badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-1"></i>Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Origin Station */}
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className={`status-icon-wrapper me-2 ${isOverdue ? 'bg-danger-light' : 'bg-light border'}`}>
                                                        <i className={`bi ${isOverdue ? 'bi-exclamation-triangle-fill text-danger' : 'bi-geo-alt-fill text-secondary'}`}></i>
                                                    </div>
                                                    <div>
                                                        <span className={`fw-medium ${isOverdue ? 'text-danger' : 'text-dark'}`}>{log.station}</span>
                                                        {isOverdue && <div className="small text-danger">Needs immediate action</div>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-2 fw-normal ${
                                                    isOverdue 
                                                        ? 'bg-danger-soft text-danger border-danger-subtle' 
                                                        : 'bg-warning-soft text-warning border-warning-subtle'
                                                } border`}>
                                                    {isOverdue ? 'Critical' : 'Pending QA'}
                                                </span>
                                            </td>

                                            {/* Remarks */}
                                            <td>
                                                <div className="remarks-container text-muted small fst-italic">
                                                    <i className={`bi ${isOverdue ? 'bi-exclamation-circle-fill text-danger' : 'bi-chat-quote-fill'} me-2`}></i>
                                                    <div className="d-inline">
                                                        "{log.remarks || 'No remarks provided'}"
                                                        {isOverdue && (
                                                            <div className="text-danger small mt-1 fw-bold">
                                                                <i className="bi bi-clock-fill me-1"></i>Unit has been waiting too long
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="text-end font-monospace small text-muted">
                                                <div className="fw-bold">{new Date(log.updated_at || log.created_at).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '0.75rem' }}>
                                                    {new Date(log.updated_at || log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Action Button */}
                                            <td className="text-center pe-4">
                                                <button
                                                    className={`btn btn-sm fw-bold px-3 py-2 rounded-2 shadow-sm action-btn ${
                                                        isOverdue ? 'btn-danger' : 'btn-success'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedLogToApprove(log);
                                                        setShowApproveModal(true);
                                                    }}
                                                >
                                                    <i className={`bi ${isOverdue ? 'bi-exclamation-triangle' : 'bi-check2-square'} me-2`}></i> 
                                                    {isOverdue ? 'Urgent' : 'Approve'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                /* Empty State */
                                <tr>
                                    <td colSpan="6" className="py-5 text-center text-muted">
                                        <div className="mb-3">
                                            <i className="bi bi-clipboard-check fs-1 text-success opacity-25"></i>
                                        </div>
                                        <h6 className="fw-bold text-dark">All Clear!</h6>
                                        <p className="small mb-0">No units currently require approval.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL RENDERING --- */}
            {showApproveModal && selectedLogToApprove && (
                <ApproveUnitModal
                    selectedLogToApprove={selectedLogToApprove}
                    onClose={() => setShowApproveModal(false)}
                    onApprove={executeApproval}
                />
            )}

            {/* --- STYLES --- */}
            <style jsx>{`
                .approval-table-header {
                    background-color: #1e293b;
                    color: #ffffff;
                    letter-spacing: 0.5px;
                }
                .approval-table-header th {
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    border: none;
                }
                .overdue-indicator {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background-color: #dc3545;
                    animation: pulse-red 2s infinite;
                }
                .status-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bg-danger-light { background-color: rgba(220, 53, 69, 0.1); }
                .bg-danger-soft { background-color: rgba(220, 53, 69, 0.05); }
                .bg-warning-soft { background-color: rgba(255, 193, 7, 0.05); }
                .border-danger-subtle { border-color: rgba(220, 53, 69, 0.2) !important; }
                .border-warning-subtle { border-color: rgba(255, 193, 7, 0.2) !important; }
                
                .action-btn {
                    min-width: 110px;
                    transition: all 0.2s ease;
                }
                .action-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .animate-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-red {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .remarks-container {
                    display: flex;
                    align-items: flex-start;
                    max-width: 300px;
                }
            `}</style>
        </div>
    );
}