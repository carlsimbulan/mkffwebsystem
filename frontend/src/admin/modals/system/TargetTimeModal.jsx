import React, { useState, useEffect } from 'react';
import axios from 'axios';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const TargetTimeModal = ({ onClose, onSave, API_BASE_URL }) => {
    const [targetTimes, setTargetTimes] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const TARGET_TIMES_ENDPOINT = `${API_BASE_URL}/target_times.php`;

    useEffect(() => {
        fetchTargetTimes();
    }, []);

    const fetchTargetTimes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(TARGET_TIMES_ENDPOINT);
            setTargetTimes(response.data);
        } catch (err) {
            console.error('Error fetching target times:', err);
            setError('Failed to load target times');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (stationId, value) => {
        const minutes = parseInt(value) || 0;
        setTargetTimes(prev => ({
            ...prev,
            [stationId]: minutes
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            await axios.post(TARGET_TIMES_ENDPOINT, targetTimes, {
                headers: { 'Content-Type': 'application/json' }
            });

            onSave(targetTimes);
            onClose();
        } catch (err) {
            console.error('Error saving target times:', err);
            setError(err.response?.data?.error || 'Failed to save target times');
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1400px', width: '95vw' }}>
                    <div className="modal-content" style={{ maxHeight: '90vh' }}>
                        <div className="modal-body text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3">Loading target times...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="modal fade show d-block" 
            style={{ 
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1050
            }}
            onClick={(e) => {
                // Only close if clicking the backdrop, not the modal content
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className="modal-dialog modal-dialog-centered" 
                style={{ 
                    maxWidth: '1400px', 
                    width: '95vw',
                    pointerEvents: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content" 
                    style={{ 
                        maxHeight: '90vh', 
                        display: 'flex', 
                        flexDirection: 'column',
                        pointerEvents: 'auto',
                        userSelect: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="bi bi-clock-history me-2"></i>
                            Target Time Management
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body" style={{ overflowY: 'auto', flex: '1' }}>
                        {error && (
                            <div className="alert alert-danger">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <p className="text-muted">
                                Configure target processing times for each station. Units exceeding these times will trigger delay alerts.
                            </p>
                        </div>

                        <div className="row g-3">
                            {Array.from({ length: 15 }, (_, i) => {
                                const stationNum = i + 1;
                                const stationId = `Station${stationNum}`;
                                const stationIdWithSpace = `Station ${stationNum}`;
                                const processName = processStations[i] || `Process ${stationNum}`;
                                const currentTime = targetTimes[stationId] || targetTimes[stationIdWithSpace] || 0;

                                return (
                                    <div key={stationId} className="col-md-6 col-lg-4">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="card-title mb-0 text-primary">
                                                        Station {stationNum}
                                                    </h6>
                                                    <span className="badge bg-light text-dark">
                                                        {formatTime(currentTime)}
                                                    </span>
                                                </div>
                                                <p className="card-text small text-muted mb-3">
                                                    {processName}
                                                </p>
                                                <div className="input-group">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={currentTime}
                                                        onChange={(e) => handleTimeChange(stationId, e.target.value)}
                                                        min="1"
                                                        max="1440"
                                                        placeholder="Minutes"
                                                    />
                                                    <span className="input-group-text">min</span>
                                                </div>
                                                {stationNum === 9 && (
                                                    <small className="text-info">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        Burn-in station (8 hours typical)
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetTimeModal;