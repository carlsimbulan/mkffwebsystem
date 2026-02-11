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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-clipboard-check me-2 text-primary"></i>
                    Approval Queue
                </h4>
                <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal" style={{fontSize: '0.7rem', padding: '6px 14px'}}>
                    <i className="bi bi-hash me-1"></i>
                    {approvalQueueLogs.length} Units
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ASSEMBLY
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    STATION
                                </th>
                                <th className="border-0 px-3 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    STATUS
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    REMARKS
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    TIMESTAMP
                                </th>
                                <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ACTION
                                </th>
                            </tr>
                        </thead>
                    <tbody>
                        {approvalQueueLogs.length > 0 ? (
                            approvalQueueLogs.map(log => {
                                const isOverdue = checkOverdue(log.updated_at);
                                
                                return (
                                    <tr key={log.id} className={`border-bottom ${isOverdue ? 'bg-danger bg-opacity-5' : 'hover-bg-primary hover-bg-opacity-5'} transition-all`}>
                                        {/* Assembly No */}
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                    {log.assembly_no}
                                                </code>
                                                {isOverdue && (
                                                    <span className="ms-2 badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 fw-normal" style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                        <i className="bi bi-clock-fill me-1"></i>
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Station */}
                                        <td className="px-3 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                                    <i className="bi bi-geo-alt text-primary" style={{ fontSize: '0.7rem' }}></i>
                                                </div>
                                                <span className="fw-semibold text-dark">{log.station}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-3 text-center">
                                            <span className={`badge px-3 py-2 rounded-1 fw-semibold ${
                                                isOverdue ? 'bg-danger' : 'bg-warning text-dark'
                                            }`} style={{ fontSize: '0.75rem' }}>
                                                {isOverdue ? 'OVERDUE' : 'PENDING QA'}
                                            </span>
                                        </td>

                                        {/* Remarks */}
                                        <td className="px-3 py-3">
                                            <div className="text-muted small fst-italic" 
                                                 style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                                                 title={log.remarks || 'No remarks'}>
                                                {log.remarks || '---'}
                                            </div>
                                        </td>

                                        {/* Timestamp */}
                                        <td className="px-3 py-3">
                                            <div className="text-muted small">
                                                <i className="bi bi-clock me-1"></i>
                                                {new Date(log.updated_at || log.created_at).toLocaleString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                className={`btn btn-sm rounded p-2 transition-all fw-bold px-3 ${
                                                    isOverdue ? 'btn-danger' : 'btn-primary'
                                                }`}
                                                onClick={() => {
                                                    setSelectedLogToApprove(log);
                                                    setShowApproveModal(true);
                                                }}
                                                title={isOverdue ? 'Review Overdue Unit' : 'Approve Unit'}
                                            >
                                                <i className={`bi ${isOverdue ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-1`}></i>
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
                .hover-bg-primary:hover {
                    background-color: rgba(13, 110, 253, 0.03) !important;
                }
                
                .transition-all {
                    transition: all 0.15s ease;
                }
                
                .border-bottom {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
                }
                
                .bg-danger.bg-opacity-5 {
                    background-color: rgba(220, 53, 69, 0.03) !important;
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
            `}</style>
        </div>
    );
}