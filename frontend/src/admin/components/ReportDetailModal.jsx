import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Base URL for the API must be passed as a prop for file access
// Fallback: Using a placeholder for API_BASE_URL, you must ensure it's passed or defined.
const API_BASE_URL_PLACEHOLDER = "http://localhost/mkffwebsystem/backend/api"; 

// Report Detail Viewer Modal
export const ReportDetailModal = ({ report, onClose, API_BASE_URL = API_BASE_URL_PLACEHOLDER }) => {
    if (!report) return null;

    // Use the passed API_BASE_URL
    const attachmentUrl = report.attachment_filename
        ? `${API_BASE_URL}/uploads/${report.attachment_filename}`
        : null;

    const getMetricsCard = (label, value, className = "text-primary") => (
        <div className="card shadow-sm p-3 h-100">
            <div className="small text-muted">{label}</div>
            <h5 className={`fw-bold mb-0 ${className}`}>{value}</h5>
        </div>
    );

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Daily Report Details: {report.station} - {report.report_date}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row g-3 mb-4">
                            {/* Dito in-update: Gumagamit na ng 'report.submitted_by_name' at nag-fall back sa 'report.submitted_by' (username) kung walang name */}
                            <div className="col-md-3">{getMetricsCard(
                                "Submitted By", 
                                report.submitted_by_name || report.submitted_by || 'N/A', 
                                "text-dark"
                            )}</div>
                            <div className="col-md-3">{getMetricsCard("Shift", report.shift)}</div>
                            <div className="col-md-3">{getMetricsCard("Units Processed", report.total_units_processed, "text-success")}</div>
                            <div className="col-md-3">{getMetricsCard("NG Units", report.total_ng, "text-danger")}</div>
                        </div>

                        <h6>Shift Summary & Issues</h6>
                        <div className="p-3 border rounded bg-light small whitespace-pre-wrap">{report.summary || "No detailed summary provided."}</div>

                        <h6>Attachment</h6>
                        {attachmentUrl ? (
                            <div className="border p-3 bg-light text-center">
                                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                    <i className="bi bi-paperclip me-2"></i> View Attached File: {report.attachment_filename}
                                </a>
                            </div>
                        ) : (
                            <div className="text-muted small">No file was attached to this report.</div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => { window.print(); }}>
                            <i className="bi bi-printer"></i> Print Summary
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};