import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Helper function to format date as YYYY-MM-DD (must be defined in this file or imported)
const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

// --- NEW: Submit Report Modal ---
export const SubmitReportModal = ({ user, stations, onClose, onSave, REPORTS_ENDPOINT }) => {
    const [formData, setFormData] = useState({
        station: user.station || (stations.length > 0 ? stations[0].id : ''),
        shift: 'Day',
        total_units_processed: '',
        total_ng: '',
        downtime_minutes: '',
        summary: '',
        attachment_file: null,
    });
    const [filePreview, setFilePreview] = useState(null);
    const [error, setError] = useState('');
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
        if (!formData.station || !formData.shift || !formData.total_units_processed) {
            setError('Station, Shift, and Units Processed are required.');
            return;
        }

        const dataToSend = new FormData();

        dataToSend.append('submitted_by', user.full_name || user.username || 'Unknown');
        dataToSend.append('report_date', getTodayDate());
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
            onSave(); // Parent function refresh
            onClose();
        } catch (err) {
            console.error("Report submission failed:", err);
            setError(err.response?.data?.message || "Failed to submit report. Check backend (daily_reports.php) POST method.");
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Submit Daily Production Report</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger small">{error}</div>}
                        <p className="text-muted small">Reporting for: **{user.full_name || user.username}** | Date: **{getTodayDate()}**</p>

                        <form>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Station</label>
                                    <select className="form-select" name="station" value={formData.station} onChange={handleChange} required>
                                        <option value="">Select Station</option>
                                        {stations.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Shift</label>
                                    <select className="form-select" name="shift" value={formData.shift} onChange={handleChange} required>
                                        {shiftOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Units Processed (Completed)</label>
                                    <input type="number" className="form-control" name="total_units_processed" value={formData.total_units_processed} onChange={handleChange} min="0" required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">No Good (NG) Units</label>
                                    <input type="number" className="form-control" name="total_ng" value={formData.total_ng} onChange={handleChange} min="0" />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Downtime (Minutes)</label>
                                    <input type="number" className="form-control" name="downtime_minutes" value={formData.downtime_minutes} onChange={handleChange} min="0" />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Shift Summary / Issues Encountered</label>
                                <textarea className="form-control" name="summary" value={formData.summary} onChange={handleChange} rows="3"></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Attachment (Optional)</label>
                                <input type="file" className="form-control" name="attachment" onChange={handleFileChange} accept="image/*,.pdf,.xlsx,.csv" />
                                {filePreview && <p className="form-text text-muted">File selected: {filePreview}</p>}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={handleSave}>Submit Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};