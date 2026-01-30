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
                    <span className="badge bg-light rounded-pill px-3 py-2 shadow-sm d-flex align-items-center border">
                        <span className="spinner-grow spinner-grow-sm text-danger me-2" role="status" aria-hidden="true"></span>
                        <span className="text-dark fw-medium">{approvalQueueLogs.length} Pending</span>
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
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <span className="fw-bold text-primary font-monospace">{log.assembly_no}</span>
                                                    {isOverdue && (
                                                        <span className="ms-2 badge bg-light rounded-pill px-2 py-1 border border-danger-subtle" style={{ fontSize: '0.7rem' }}>
                                                            <i className="bi bi-clock-fill text-danger me-1"></i>
                                                            <span className="text-danger fw-medium">Overdue</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Origin Station */}
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className={`status-icon-wrapper me-2 ${isOverdue ? 'bg-danger-subtle' : 'bg-light border'}`}>
                                                        <i className={`bi ${isOverdue ? 'bi-clock-fill text-danger' : 'bi-geo-alt-fill text-muted'}`}></i>
                                                    </div>
                                                    <div>
                                                        <span className={`fw-medium ${isOverdue ? 'text-danger' : 'text-dark'}`}>{log.station}</span>
                                                        {isOverdue && <div className="small text-danger fw-medium">Extended wait time</div>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-2 fw-normal ${
                                                    isOverdue 
                                                        ? 'bg-danger-subtle text-danger border border-danger-subtle' 
                                                        : 'bg-light text-muted border'
                                                }`}>
                                                    {isOverdue ? 'Overdue' : 'Pending QA'}
                                                </span>
                                            </td>

                                            {/* Remarks */}
                                            <td>
                                                <div className="remarks-container text-muted small fst-italic">
                                                    <i className={`bi ${isOverdue ? 'bi-clock-fill text-danger' : 'bi-chat-quote-fill text-muted'} me-2`}></i>
                                                    <div className="d-inline">
                                                        "{log.remarks || 'No remarks provided'}"
                                                        {isOverdue && (
                                                            <div className="text-danger small mt-1 fw-medium">
                                                                <i className="bi bi-clock-fill me-1"></i>Extended wait time
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
                                                    className={`btn btn-sm fw-medium px-3 py-2 rounded-2 shadow-sm action-btn ${
                                                        isOverdue ? 'btn-outline-danger' : 'btn-primary'
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedLogToApprove(log);
                                                        setShowApproveModal(true);
                                                    }}
                                                >
                                                    <i className={`bi ${isOverdue ? 'bi-clock' : 'bi-check2-square'} me-2`}></i> 
                                                    <span className="fw-medium">{isOverdue ? 'Review' : 'Approve'}</span>
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
                .status-icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bg-danger-subtle { background-color: rgba(220, 53, 69, 0.05); }
                .border-danger-subtle { border-color: rgba(220, 53, 69, 0.2) !important; }
                
                .action-btn {
                    min-width: 110px;
                    transition: all 0.2s ease;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    letter-spacing: 0.01em;
                }
                .action-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .approval-queue-container {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                .approval-queue-container h3 {
                    font-weight: 600;
                    letter-spacing: -0.02em;
                }
                .approval-queue-container .small {
                    font-size: 0.875rem;
                    letter-spacing: 0.01em;
                }
                .approval-queue-container .font-monospace {
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    font-weight: 500;
                }
                .approval-queue-container .badge {
                    font-weight: 500;
                    letter-spacing: 0.01em;
                }
                .animate-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .border-secondary-subtle { border-color: rgba(108, 117, 125, 0.2) !important; }
                .remarks-container {
                    display: flex;
                    align-items: flex-start;
                    max-width: 300px;
                }
            `}</style>
        </div>
    );
}