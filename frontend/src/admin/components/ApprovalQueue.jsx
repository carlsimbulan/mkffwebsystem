import React from 'react';
import { ApproveUnitModal } from './ApproveUnitModal'; // New Modal Import

export function ApprovalQueue({
    logs,
    setSelectedLogToApprove,
    setShowApproveModal,
    showApproveModal,
    selectedLogToApprove,
    executeApproval
}) {
    const approvalQueueLogs = logs.filter(l => l.status === 'Pending Approval');

    return (
        <div className="animate-in fade-in pb-5">
            {/* Header */}
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

            {/* Main Card */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        {/* --- UPDATED: DARK BLUE HEADER (MATCHED TO IMAGE) --- */}
                        <thead 
                            style={{ 
                                backgroundColor: '#1e293b', 
                                color: '#ffffff',
                                letterSpacing: '0.5px' 
                            }} 
                            className="text-uppercase small"
                        >
                            <tr>
                                <th className="border-0 py-3 ps-4 text-white" style={{ backgroundColor: 'inherit' }}>Assembly No.</th>
                                <th className="border-0 py-3 text-white" style={{ backgroundColor: 'inherit' }}>Unit Details</th>
                                <th className="border-0 py-3 text-white" style={{ backgroundColor: 'inherit' }}>Origin Station</th>
                                <th className="border-0 py-3 text-center text-white" style={{ backgroundColor: 'inherit' }}>Status</th>
                                <th className="border-0 py-3 text-white" style={{ backgroundColor: 'inherit', width: '20%' }}>Remarks</th>
                                <th className="border-0 py-3 text-end text-white" style={{ backgroundColor: 'inherit' }}>Timestamp</th>
                                <th className="border-0 py-3 text-center pe-4 text-white" style={{ backgroundColor: 'inherit' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {approvalQueueLogs.length > 0 ? approvalQueueLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="ps-4">
                                        <span className="fw-bold text-primary font-monospace">{log.assembly_no}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark">{log.model} <span className="fw-normal text-muted">({log.revision})</span></span>
                                            <span className="small text-muted font-monospace">{log.device_serial_no || '(No Serial)'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light border rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                                <i className="bi bi-geo-alt-fill text-secondary" style={{ fontSize: '0.7rem' }}></i>
                                            </div>
                                            <span className="fw-medium text-dark">{log.station}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2 fw-normal">
                                            Pending QA
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-start text-muted small fst-italic">
                                            <i className="bi bi-chat-quote-fill me-2 opacity-50"></i>
                                            "{log.remarks || 'No remarks provided'}"
                                        </div>
                                    </td>
                                    <td className="text-end font-monospace small text-muted">
                                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="text-center pe-4">
                                        {/* --- UPDATED: BOX STYLE BUTTON --- */}
                                        <button
                                            className="btn btn-sm btn-success text-white fw-bold px-3 py-2 rounded-1 shadow-sm hover-scale d-inline-flex align-items-center"
                                            onClick={() => {
                                                setSelectedLogToApprove(log);
                                                setShowApproveModal(true);
                                            }}
                                            style={{ transition: 'all 0.2s', minWidth: '100px', justifyContent: 'center' }}
                                        >
                                            <i className="bi bi-check2-square me-2"></i> Approve
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-5 text-center text-muted">
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

            <style jsx>{`
                .hover-scale:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
                }
                .fade-in { animation: fadeIn 0.2s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}