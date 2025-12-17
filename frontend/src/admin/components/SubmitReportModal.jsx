import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

export const SubmitReportModal = ({ user, stations, onClose, onSave, REPORTS_ENDPOINT }) => {
    
    const defaultStationId = user.station || (stations.length > 0 ? stations[0].id : 'overall');
    
    const [formData, setFormData] = useState({
        station: defaultStationId,
        total_units_processed: '',
        total_ng: '',
        downtime_minutes: '',
        summary: '',
        attachment_file: null,
    });
    const [filePreview, setFilePreview] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 

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
        if (!formData.station || formData.total_units_processed === '') {
            setError('Station and Units Processed are required fields.');
            return;
        }

        setIsSubmitting(true);
        const dataToSend = new FormData();
        
        dataToSend.append('username', user.username || 'Unknown');
        dataToSend.append('date', getTodayDate()); 
        dataToSend.append('station', formData.station);
        dataToSend.append('total_units_processed', formData.total_units_processed);
        dataToSend.append('total_ng', formData.total_ng || 0);
        dataToSend.append('downtime_minutes', formData.downtime_minutes || 0);
        dataToSend.append('summary', formData.summary);

        if (formData.attachment_file) {
            dataToSend.append('file', formData.attachment_file, formData.attachment_file.name);
        }

        try {
            await axios.post(REPORTS_ENDPOINT, dataToSend);
            onSave();
            onClose();
        } catch (err) {
            console.error("Report submission failed:", err);
            setError(err.response?.data?.message || "Failed to submit report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        /* REMOVED: animate-in class and transitions */
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060, backdropFilter: 'blur(5px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 overflow-hidden shadow-none">

                    {/* HEADER: SOLID BLUE */}
                    <div className="modal-header border-0 py-4 px-4" style={{ backgroundColor: '#0d6efd' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-white p-2 rounded-3 me-3 shadow-sm text-primary">
                                <i className="bi bi-file-earmark-plus-fill fs-5"></i>
                            </div>
                            <div>
                                <h5 className="modal-title fw-black text-white tracking-tighter mb-0 uppercase">SUBMIT PRODUCTION REPORT</h5>
                                <div className="text-white-50 small fw-bold uppercase">
                                    <i className="bi bi-person-circle me-1"></i> {user.full_name || user.username} 
                                    <span className="mx-2">|</span> 
                                    <i className="bi bi-calendar3 me-1"></i> {getTodayDate()}
                                </div>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light bg-opacity-50">
                        {error && <div className="alert alert-danger border-0 rounded-3 small fw-bold uppercase mb-4"><i className="bi bi-exclamation-octagon-fill me-2"></i>{error}</div>}

                        <div className="bg-white border rounded-4 p-4 shadow-sm">
                            
                            <div className="mb-4">
                                <label className="label-caps mb-2 text-primary">Target Production Point</label>
                                <select className="form-select border-2 shadow-none fw-bold text-dark" name="station" value={formData.station} onChange={handleChange} style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}>
                                    <option value="overall">[ GLOBAL / OVERALL REPORT ]</option>
                                    {stations.map(s => (<option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>))}
                                </select>
                            </div>

                            <label className="label-caps mb-2 text-primary">Performance Data</label>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <div className="bg-light p-3 rounded-3 border border-primary border-opacity-10">
                                        <label className="small fw-black text-muted uppercase mb-1 d-block" style={{ fontSize: '0.6rem' }}>Units Processed</label>
                                        <input type="number" className="form-control form-control-lg border-0 bg-transparent fw-black p-0 shadow-none text-primary" name="total_units_processed" value={formData.total_units_processed} onChange={handleChange} placeholder="0" required />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="bg-light p-3 rounded-3 border border-danger border-opacity-10">
                                        <label className="small fw-black text-muted uppercase mb-1 d-block" style={{ fontSize: '0.6rem' }}>NG Units</label>
                                        <input type="number" className="form-control form-control-lg border-0 bg-transparent fw-black p-0 shadow-none text-danger" name="total_ng" value={formData.total_ng} onChange={handleChange} placeholder="0" />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="bg-light p-3 rounded-3 border">
                                        <label className="small fw-black text-muted uppercase mb-1 d-block" style={{ fontSize: '0.6rem' }}>Downtime (Min)</label>
                                        <input type="number" className="form-control form-control-lg border-0 bg-transparent fw-black p-0 shadow-none text-dark" name="downtime_minutes" value={formData.downtime_minutes} onChange={handleChange} placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="label-caps mb-2 text-primary">Shift Summary & Notes</label>
                                <textarea className="form-control border-2 shadow-none" name="summary" value={formData.summary} onChange={handleChange} rows="4" style={{ borderRadius: '8px', fontSize: '0.9rem', borderColor: '#e2e8f0' }} placeholder="Provide technical details, machine issues, or part shortages..."></textarea>
                            </div>

                            <div>
                                <label className="label-caps mb-2 text-primary">Supporting Evidence</label>
                                <div className="p-3 border-2 border-dashed rounded-3 bg-light text-center" style={{ borderColor: '#cbd5e1' }}>
                                    <input type="file" className="form-control form-control-sm border-0 bg-transparent shadow-none" onChange={handleFileChange} accept="image/*,.pdf,.xlsx,.csv" />
                                    {filePreview && <p className="text-primary fw-bold small mt-2 mb-0 uppercase"><i className="bi bi-check-circle-fill me-1"></i> File ready: {filePreview}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer bg-white border-top py-3 px-4">
                        <button type="button" className="btn btn-light border btn-sm fw-bold px-4 rounded-pill me-auto shadow-none" onClick={onClose}>DISCARD</button>
                        <button 
                            type="button" 
                            className="btn btn-primary fw-bold px-5 rounded-pill shadow-none d-flex align-items-center border-0" 
                            onClick={handleSave} 
                            disabled={isSubmitting}
                            style={{ backgroundColor: '#0d6efd' }}
                        >
                            {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>SENDING...</>
                            ) : (
                                <><i className="bi bi-send-check-fill me-2"></i>SUBMIT REPORT</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .fw-black { font-weight: 900; }
                .tracking-tighter { letter-spacing: -1px; }
                .label-caps { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: block; }
                /* REMOVED: @keyframes and .animate-in definitions */
            `}</style>
        </div>
    );
};