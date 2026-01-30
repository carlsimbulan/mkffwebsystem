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
        <div className="pb-5">
            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0">Approval Queue</h3>
                    <p className="text-muted small mb-0">Review flagged units requiring QA validation.</p>
                </div>
                {approvalQueueLogs.length > 0 && (
                    <span className="badge bg-light rounded-pill px-3 py-2 shadow-sm d-flex align-items-center border">
                        <span className="spinner-grow spinner-grow-sm text-danger me-2" role="status" aria-hidden="true"></span>
                        <span className="text-dark fw-medium">{approvalQueueLogs.length} Pending</span>
                    </span>
                )}
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white border rounded-2 overflow-hidden shadow-sm mx-2">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-dark">
                        <tr>
                            <th className="ps-4">ASSEMBLY</th>
                            <th>STATION</th>
                            <th className="text-center">STATUS</th>
                            <th>REMARKS</th>
                            <th className="text-end pe-4">TIMESTAMP</th>
                            <th className="text-center pe-4">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvalQueueLogs.length > 0 ? (
                            approvalQueueLogs.map(log => {
                                const isOverdue = checkOverdue(log.updated_at);
                                
                                return (
                                    <tr key={log.id} className={isOverdue ? 'delay-row' : ''}>
                                        {/* Assembly No */}
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <code className="text-primary fw-bold">{log.assembly_no}</code>
                                                {isOverdue && (
                                                    <span className="ms-2 badge bg-danger text-white rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-clock-fill me-1"></i>
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Station */}
                                        <td className="fw-semibold">{log.station}</td>

                                        {/* Status */}
                                        <td className="text-center">
                                            <span className={`badge rounded-1 px-3 ${
                                                isOverdue 
                                                    ? 'bg-danger text-white' 
                                                    : 'bg-warning text-dark'
                                            }`}>
                                                {isOverdue ? 'OVERDUE' : 'PENDING QA'}
                                            </span>
                                        </td>

                                        {/* Remarks */}
                                        <td className="text-muted small">
                                            {log.remarks || '---'}
                                        </td>

                                        {/* Timestamp */}
                                        <td className="text-end small text-muted">
                                            <strong>{new Date(log.updated_at || log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                                            <br />
                                            {new Date(log.updated_at || log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </td>

                                        {/* Action */}
                                        <td className="text-center pe-4">
                                            <button
                                                className={`btn btn-sm fw-bold px-3 shadow-sm ${
                                                    isOverdue ? 'btn-danger' : 'btn-primary'
                                                }`}
                                                onClick={() => {
                                                    setSelectedLogToApprove(log);
                                                    setShowApproveModal(true);
                                                }}
                                            >
                                                {isOverdue ? 'REVIEW' : 'APPROVE'}
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

            {/* --- MODAL RENDERING --- */}
            {showApproveModal && selectedLogToApprove && (
                <ApproveUnitModal
                    selectedLogToApprove={selectedLogToApprove}
                    onClose={() => setShowApproveModal(false)}
                    onApprove={executeApproval}
                />
            )}

            {/* --- STYLES --- */}
            <style>{`
                .delay-row { background-color: #fff5f5 !important; }
                .table thead th { 
                    background-color: #000000de !important;
                    color: #ffffff !important; 
                    font-weight: 600; 
                    padding: 12px 15px; 
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>
    );
}