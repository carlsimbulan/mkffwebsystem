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
                .report-label { 
                    font-size: 0.7rem; 
                    font-weight: 800; 
                    color: #64748b; 
                    text-transform: uppercase; 
                    letter-spacing: 1px; 
                }
                .report-value { 
                    font-size: 1.1rem; 
                    font-weight: 700; 
                    color: #0f172a; 
                }
                .summary-box { 
                    background: #f8fafc; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 20px; 
                    min-height: 150px; 
                }
                .print-only { display: none; }
                
                @media print {
                    @page { size: portrait; margin: 10mm; }
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        background: white !important; 
                        color: black !important;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                    .print-meta { 
                        border-bottom: 2px solid #000; 
                        padding-bottom: 10px; 
                        margin-bottom: 20px; 
                        display: block !important; 
                    }
                    .print-meta-item { 
                        font-size: 1rem; 
                        margin-bottom: 2px; 
                        text-transform: uppercase; 
                        font-weight: bold; 
                    }
                    .print-summary-content { 
                        font-size: 1.1rem; 
                        line-height: 1.4; 
                        white-space: pre-wrap; 
                        text-align: justify;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        background: none !important;
                    }
                    .print-label { 
                        font-weight: 900; 
                        text-decoration: underline; 
                        margin-bottom: 10px; 
                        display: block; 
                        font-size: 1.2rem; 
                    }
                    .summary-box { 
                        padding: 0 !important; 
                        border: none !important; 
                        background: none !important;
                    }
                }
            `}</style>
            
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 shadow-lg print-area">
                    {/* UI HEADER (Hidden on Print) */}
                    <div className="modal-header border-bottom py-3 px-4 no-print bg-white">
                        <h5 className="modal-title fw-bold text-dark">
                            <i className="bi bi-file-text me-2 text-primary"></i>
                            REPORT DETAILS #{report.id}
                        </h5>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body p-4 bg-white">
                        {/* PRINT ONLY HEADER (Plain Text) */}
                        <div className="print-only print-meta">
                            <div className="print-meta-item">NAME: {report.submitted_by_name || 'N/A'}</div>
                            <div className="print-meta-item">STATION: {report.station}</div>
                            <div className="print-meta-item">DATE: {report.report_date}</div>
                            <div className="print-meta-item">OUTPUT/NG: {report.total_units_processed} / {report.total_ng}</div>
                        </div>
                        
                        {/* QUICK INFO GRID (UI ONLY) */}
                        <div className="row g-4 mb-4 no-print">
                            <div className="col-md-4">
                                <label className="report-label">Submitted By</label>
                                <div className="report-value">{report.submitted_by_name}</div>
                            </div>
                            <div className="col-md-4">
                                <label className="report-label">Station</label>
                                <div className="report-value text-primary">{report.station}</div>
                            </div>
                            <div className="col-md-4">
                                <label className="report-label">Output / NG</label>
                                <div className="report-value">
                                    {report.total_units_processed} / <span className="text-danger">{report.total_ng}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* SUMMARY CONTENT */}
                        <div className="no-print mb-2 mt-4">
                            <label className="report-label">Production Summary & Technical Logs</label>
                        </div>
                        <div className="summary-box">
                            <span className="print-only print-label">PRODUCTION SUMMARY & LOGS:</span>
                            <div className="print-summary-content text-dark">
                                {report.summary || "No technical documentation provided."}
                            </div>
                        </div>
                        
                        {/* ATTACHMENT LINK (UI ONLY) */}
                        {attachmentUrl && (
                            <div className="mt-4 no-print">
                                <a 
                                    href={attachmentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-sm btn-outline-primary fw-bold"
                                >
                                    <i className="bi bi-paperclip me-1"></i> View Attached File
                                </a>
                            </div>
                        )}
                    </div>
                    
                    {/* FOOTER (Hidden on Print) */}
                    <div className="modal-footer border-top bg-light px-4 py-3 no-print">
                        <button 
                            className="btn btn-outline-dark fw-bold px-4" 
                            onClick={() => window.print()}
                        >
                            <i className="bi bi-printer me-2"></i> Print PDF
                        </button>
                        <button 
                            className="btn btn-primary fw-bold px-4" 
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
