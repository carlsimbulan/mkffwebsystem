import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL_PLACEHOLDER = "http://localhost/mkffwebsystem/backend/api"; 

export const ReportDetailModal = ({ report, onClose, API_BASE_URL = API_BASE_URL_PLACEHOLDER }) => {
    if (!report) return null;

    const attachmentUrl = report.attachment_filename
        ? `${API_BASE_URL}/uploads/${report.attachment_filename}`
        : null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060, backdropFilter: 'blur(5px)' }}>
            <style>{`
                .fw-black { font-weight: 900; }
                .print-only { display: none; }

                @media print {
                    @page { size: portrait; margin: 15mm; }
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { 
                        position: absolute; left: 0; top: 0; width: 100%; 
                        background: white !important; color: black !important;
                    }
                    .no-print { display: none !important; }
                    
                    /* Print Layout Header */
                    .print-meta {
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 25px;
                        display: block !important;
                    }
                    .print-meta-item {
                        font-size: 1.1rem;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    /* Summary Body */
                    .print-summary-content {
                        font-size: 1.2rem;
                        line-height: 1.6;
                        white-space: pre-wrap;
                        text-align: justify;
                    }
                    .print-label {
                        font-weight: 900;
                        text-decoration: underline;
                        margin-bottom: 15px;
                        display: block;
                        font-size: 1.3rem;
                    }
                }

                .ui-metric-card { border-left: 5px solid #0d6efd; background: #fff; padding: 15px; border-radius: 8px; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee; }
            `}</style>

            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 rounded-4 overflow-hidden shadow-none print-area">
                    
                    {/* --- UI HEADER (Blue Background, Hidden on Print) --- */}
                    <div className="modal-header border-0 py-4 px-5 no-print" style={{ backgroundColor: '#0d6efd' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-white p-2 rounded-3 me-3 text-primary"><i className="bi bi-file-earmark-text fs-4"></i></div>
                            <div>
                                <h4 className="modal-title fw-black text-white mb-0 uppercase">Production Report Details</h4>
                                <small className="text-white-50 fw-bold">REF ID: #{report.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 p-md-5 bg-white">
                        
                        {/* --- PRINT ONLY META DATA --- */}
                        <div className="print-only print-meta">
                            <div className="print-meta-item"><strong>NAME:</strong> {report.submitted_by_name || 'N/A'}</div>
                            <div className="print-meta-item"><strong>STATION:</strong> {report.station}</div>
                            <div className="print-meta-item"><strong>DATE:</strong> {report.report_date}</div>
                        </div>

                        {/* --- UI ONLY METRICS --- */}
                        <div className="row g-3 mb-4 no-print">
                            <div className="col-md-4">
                                <div className="ui-metric-card">
                                    <small className="text-muted fw-bold uppercase">Submitted By</small>
                                    <div className="fw-bold fs-5">{report.submitted_by_name}</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="ui-metric-card" style={{borderColor: '#107c55', borderLeftColor: '#107c55'}}>
                                    <small className="text-muted fw-bold uppercase">Station</small>
                                    <div className="fw-bold fs-5 text-success">{report.station}</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="ui-metric-card" style={{borderColor: '#0d6efd', borderLeftColor: '#0d6efd'}}>
                                    <small className="text-muted fw-bold uppercase">Output / NG</small>
                                    <div className="fw-bold fs-5">{report.total_units_processed} Units / {report.total_ng} NG</div>
                                </div>
                            </div>
                        </div>

                        {/* --- SUMMARY (Universal for UI and Print) --- */}
                        <div className="report-body mt-2">
                            <span className="print-only print-label">PRODUCTION SUMMARY & LOGS:</span>
                            <div className="print-summary-content text-dark">
                                {report.summary || "No technical documentation provided."}
                            </div>
                        </div>

                        {/* Attachment Button (UI Only) */}
                        {attachmentUrl && (
                            <div className="mt-5 pt-3 border-top no-print text-center">
                                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-5 rounded-pill fw-bold">
                                    <i className="bi bi-eye-fill me-2"></i>VIEW ATTACHMENT
                                </a>
                            </div>
                        )}
                    </div>

                    {/* FOOTER (UI Only) */}
                    <div className="modal-footer bg-light border-top px-5 py-3 no-print">
                        <button className="btn btn-outline-primary border-2 fw-bold px-4 rounded-pill" onClick={() => window.print()}>
                            <i className="bi bi-printer-fill me-2"></i>PRINT REPORT
                        </button>
                        <button className="btn btn-dark fw-bold px-5 rounded-pill border-0" onClick={onClose} style={{ background: '#0f172a' }}>
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};