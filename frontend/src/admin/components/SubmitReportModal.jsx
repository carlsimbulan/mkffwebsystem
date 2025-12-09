import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Helper function to format date as YYYY-MM-DD
const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

// --- Submit Report Modal ---
export const SubmitReportModal = ({ user, stations, onClose, onSave, REPORTS_ENDPOINT }) => {
    const defaultStationId = user.station || (stations.length > 0 ? stations[0].id : '');
    
    const [formData, setFormData] = useState({
        station: defaultStationId,
        shift: 'Day',
        total_units_processed: '',
        total_ng: '',
        downtime_minutes: '',
        summary: '',
        attachment_file: null,
    });
    const [filePreview, setFilePreview] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 

    const shiftOptions = ["Day", "Night"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, attachment_file: file });
        setFilePreview(file ? file.name : null);
    };

    const handleSave = async () => {
        if (!formData.station || !formData.shift || formData.total_units_processed === '') {
            setError('Station, Shift, and Units Processed are required fields.');
            return;
        }

        setIsSubmitting(true);
        const dataToSend = new FormData();
        
        // Add metadata
        dataToSend.append('submitted_by', user.full_name || user.username || 'Unknown');
        dataToSend.append('report_date', getTodayDate());
        
        // Add form data
        dataToSend.append('shift', formData.shift);
        dataToSend.append('station', formData.station);
        dataToSend.append('total_units_processed', formData.total_units_processed);
        dataToSend.append('total_ng', formData.total_ng || 0);
        dataToSend.append('downtime_minutes', formData.downtime_minutes || 0);
        dataToSend.append('summary', formData.summary);

        if (formData.attachment_file) {
            dataToSend.append('attachment', formData.attachment_file, formData.attachment_file.name);
        }

        try {
            await axios.post(REPORTS_ENDPOINT, dataToSend);
            onSave();
            onClose();
        } catch (err) {
            console.error("Report submission failed:", err);
            setError(err.response?.data?.message || "Failed to submit report. Please check the network connection and server endpoint.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="modal show d-block fade-in" 
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '16px' }}>

                    {/* --- HEADER: SOLID PRIMARY BLUE (No Gradient) --- */}
                    <div className="modal-header bg-primary text-white border-0 py-4">
                        <div className="px-2">
                            <h5 className="modal-title fw-bold d-flex align-items-center">
                                <i className="bi bi-file-earmark-plus-fill me-2 bg-white text-primary rounded p-1 fs-6 shadow-sm"></i>
                                Submit Daily Production Report
                            </h5>
                            <div className="text-white-50 small mt-1">
                                <i className="bi bi-person-circle me-1"></i> Submitting as: **{user.full_name || user.username}** | <i className="bi bi-calendar3 me-1"></i> Date: **{getTodayDate()}**
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white align-self-start" onClick={onClose}></button>
                    </div>

                    {/* Modal Body: Form */}
                    <div className="modal-body p-4 bg-light">
                        {error && <div className="alert alert-danger small shadow-sm"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

                        <form className="bg-white p-4 rounded-3 shadow-sm border">
                            <h6 className="fw-bold text-primary mb-3">Key Metrics</h6>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-medium small">Station <span className="text-danger">*</span></label>
                                    <select className="form-select" name="station" value={formData.station} onChange={handleChange} required>
                                        <option value="">Select Station</option>
                                        {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-medium small">Shift <span className="text-danger">*</span></label>
                                    <select className="form-select" name="shift" value={formData.shift} onChange={handleChange} required>
                                        {shiftOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="row border-top pt-3 mt-1">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label fw-medium small">Units Processed (Completed) <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" name="total_units_processed" value={formData.total_units_processed} onChange={handleChange} min="0" required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label fw-medium small">No Good (NG) Units</label>
                                    <input type="number" className="form-control" name="total_ng" value={formData.total_ng} onChange={handleChange} min="0" placeholder="0" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label fw-medium small">Downtime (Minutes)</label>
                                    <input type="number" className="form-control" name="downtime_minutes" value={formData.downtime_minutes} onChange={handleChange} min="0" placeholder="0" />
                                                                </div>
                            </div>

                            <h6 className="fw-bold text-primary mb-3 mt-4 pt-2 border-top">Summary & Attachments</h6>
                            
                            <div className="mb-3">
                                <label className="form-label fw-medium small">Shift Summary / Issues Encountered</label>
                                <textarea className="form-control" name="summary" value={formData.summary} onChange={handleChange} rows="3" placeholder="Briefly describe the shift highlights, issues, or important notes..."></textarea>
                            </div>

                            <div className="mb-0">
                                <label className="form-label fw-medium small">Attachment (Optional: Image, PDF, Excel)</label>
                                <input type="file" className="form-control" name="attachment" onChange={handleFileChange} accept="image/*,.pdf,.xlsx,.csv" />
                                {filePreview && <p className="form-text text-success fw-bold small mt-2 d-flex align-items-center"><i className="bi bi-check-circle-fill me-1"></i> File ready: {filePreview}</p>}
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer border-top-0 bg-light px-4 pb-4 pt-2">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary border rounded-pill px-4 hover-scale" 
                            onClick={onClose}
                        >
                            <i className="bi bi-x me-1"></i> Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm hover-scale" 
                            onClick={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send-fill me-1"></i> Submit Report
                                </>
                            )}
                        </button>
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