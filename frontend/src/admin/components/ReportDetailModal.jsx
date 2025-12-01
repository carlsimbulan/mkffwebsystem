import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL_PLACEHOLDER = "http://localhost/mkffwebsystem/backend/api"; 

export const ReportDetailModal = ({ report, onClose, API_BASE_URL = API_BASE_URL_PLACEHOLDER }) => {
    if (!report) return null;

    const attachmentUrl = report.attachment_filename
        ? `${API_BASE_URL}/uploads/${report.attachment_filename}`
        : null;

    // Helper for cards with Icons
    const MetricCard = ({ label, value, icon, colorClass, bgClass }) => (
        <div className={`card border-0 shadow-sm h-100 ${bgClass}`} style={{borderRadius: '12px'}}>
            <div className="card-body d-flex align-items-center p-3">
                <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center me-3 ${colorClass} bg-white bg-opacity-75`} style={{width: 50, height: 50}}>
                    <i className={`bi ${icon} fs-4`}></i>
                </div>
                <div>
                    <div className="text-muted text-uppercase small fw-bold" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>{label}</div>
                    <div className={`h5 fw-bold mb-0 text-dark`}>{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{borderRadius: '16px'}}>
                    
                    {/* Header with Gradient */}
                    <div className="modal-header text-white border-0 py-4" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <div className="px-2">
                            <h5 className="modal-title fw-bold d-flex align-items-center">
                                <i className="bi bi-file-earmark-text-fill me-2 bg-white text-primary rounded p-1 fs-6"></i>
                                Production Report Details
                            </h5>
                            <div className="text-white-50 small mt-1">
                                <i className="bi bi-calendar3 me-1"></i> Date: <span className="text-white fw-bold">{report.report_date}</span> 
                                <span className="mx-2">|</span> 
                                <i className="bi bi-geo-alt me-1"></i> Station: <span className="text-white fw-bold">{report.station}</span>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white align-self-start" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {/* Metrics Grid */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6 col-lg-3">
                                <MetricCard 
                                    label="Submitted By" 
                                    value={report.submitted_by_name || report.submitted_by || 'N/A'} 
                                    icon="bi-person-fill"
                                    bgClass="bg-white"
                                    colorClass="text-primary"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <MetricCard 
                                    label="Shift Schedule" 
                                    value={report.shift} 
                                    icon="bi-clock-history"
                                    bgClass="bg-white"
                                    colorClass="text-secondary"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <MetricCard 
                                    label="Total Output" 
                                    value={report.total_units_processed} 
                                    icon="bi-box-seam-fill"
                                    bgClass="bg-success bg-opacity-10"
                                    colorClass="text-success"
                                />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <MetricCard 
                                    label="Defects (NG)" 
                                    value={report.total_ng} 
                                    icon="bi-exclamation-triangle-fill"
                                    bgClass="bg-danger bg-opacity-10"
                                    colorClass="text-danger"
                                />
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Summary Section */}
                            <div className="col-md-8">
                                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                                    <i className="bi bi-card-text me-2 text-primary"></i> Shift Summary & Issues
                                </h6>
                                <div className="p-4 border-0 shadow-sm rounded-3 bg-white h-100 position-relative">
                                    {/* Decoration Line */}
                                    <div className="position-absolute top-0 start-0 bottom-0 bg-primary rounded-start" style={{width: '4px'}}></div>
                                    <p className="mb-0 text-secondary whitespace-pre-wrap" style={{lineHeight: '1.6'}}>
                                        {report.summary || <span className="fst-italic text-muted">No detailed summary provided for this shift.</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="col-md-4">
                                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                                    <i className="bi bi-paperclip me-2 text-primary"></i> Attachments
                                </h6>
                                <div className="card border-0 shadow-sm rounded-3 bg-white h-100">
                                    <div className="card-body text-center d-flex flex-column justify-content-center p-4">
                                        {attachmentUrl ? (
                                            <>
                                                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: 60, height: 60}}>
                                                    <i className="bi bi-file-earmark-image fs-2 text-primary"></i>
                                                </div>
                                                <div className="small text-muted mb-3 text-truncate w-100 fw-bold" title={report.attachment_filename}>
                                                    {report.attachment_filename}
                                                </div>
                                                <a 
                                                    href={attachmentUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="btn btn-outline-primary btn-sm rounded-pill fw-bold w-100"
                                                >
                                                    <i className="bi bi-eye me-1"></i> View File
                                                </a>
                                            </>
                                        ) : (
                                            <div className="py-3">
                                                <i className="bi bi-file-earmark-x fs-1 text-muted opacity-25 mb-2 d-block"></i>
                                                <small className="text-muted">No file attached</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 bg-light px-4 pb-4 pt-2">
                        <div className="d-flex w-100 justify-content-between">
                            <button 
                                type="button" 
                                className="btn btn-light text-muted border hover-scale" 
                                onClick={() => window.print()}
                                title="Print this report"
                            >
                                <i className="bi bi-printer me-2"></i> Print
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-dark px-4 rounded-pill fw-bold shadow-sm hover-scale" 
                                onClick={onClose}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .hover-scale:hover { transform: translateY(-2px); transition: transform 0.2s; }
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};