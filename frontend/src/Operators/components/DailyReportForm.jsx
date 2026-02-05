import React, { useState, useEffect } from 'react';

export function DailyReportForm({ currentStation, dailyReportData, setDailyReportData, handleReportSubmit, selectedFile, setSelectedFile }) {
    
    // State for mode switching and report viewing
    const [mode, setMode] = useState('new'); // 'new' or 'view'
    const [existingReports, setExistingReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportsError, setReportsError] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // --- Define Industrial Green Theme Colors ---
    const PRIMARY_GREEN = "#15803d"; 
    const LIGHT_GREEN_BG = "#f0fdf4";
    const BORDER_COLOR = "#d1d5db";
    const PRIMARY_TEXT = "#111827";
    const MUTED_TEXT = "#4b5563";

    // Fetch existing reports for the selected date
    const fetchReports = async () => {
        setLoadingReports(true);
        setReportsError('');
        
        try {
            const response = await fetch(`http://localhost/mkffwebsystem/backend/api/daily_reports.php`);
            if (!response.ok) throw new Error('Failed to fetch reports');
            
            const reports = await response.json();
            
            // Filter reports by selected date and current station
            const filteredReports = reports.filter(report => 
                report.report_date === dailyReportData.date && 
                report.station === currentStation
            );
            
            setExistingReports(filteredReports);
        } catch (error) {
            setReportsError(error.message);
        } finally {
            setLoadingReports(false);
        }
    };

    // Fetch reports when date changes or when switching to view mode
    useEffect(() => {
        if (mode === 'view' && dailyReportData.date) {
            fetchReports();
        }
    }, [mode, dailyReportData.date, currentStation]);

    // Handle viewing report details
    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowReportModal(true);
    };

    return (
        <div className="col-lg-12 col-xl-12 p-0 animate-in fade-in"> 
            <div className="d-flex flex-column">
                
                {/* Main Container */}
                <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: BORDER_COLOR }}>

                    {/* Header: Compact */}
                    <div className="card-header bg-white py-2 px-3 border-bottom" style={{ borderLeft: `4px solid ${PRIMARY_GREEN}` }}>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div>
                                <h6 className="mb-0 fw-bold" style={{ color: PRIMARY_TEXT, fontSize: '0.9rem' }}>
                                    <i className="bi bi-file-earmark-text-fill me-2 text-success"></i>
                                    DAILY PRODUCTION REPORT
                                </h6>
                                <small className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>
                                    STATION: <span className="text-success">{currentStation?.toUpperCase()}</span>
                                </small>
                            </div>
                            <div className="d-flex gap-1">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${mode === 'new' ? 'btn-success' : 'btn-outline-secondary'}`}
                                    onClick={() => setMode('new')}
                                    style={{ fontSize: '0.7rem', borderRadius: '4px' }}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>New Report
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${mode === 'view' ? 'btn-success' : 'btn-outline-secondary'}`}
                                    onClick={() => setMode('view')}
                                    style={{ fontSize: '0.7rem', borderRadius: '4px' }}
                                >
                                    <i className="bi bi-eye me-1"></i>View Reports
                                </button>
                            </div>
                        </div>
                    </div>

                    {mode === 'new' ? (
                        <form onSubmit={handleReportSubmit} className="card-body p-3">

                            {/* Date Input */}
                            <div className="mb-2">
                                <label className="form-label fw-bold mb-1" style={{ color: MUTED_TEXT, fontSize: '0.75rem' }}>Entry Date</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm shadow-none border"
                                    style={{ fontSize: '0.85rem' }}
                                    value={dailyReportData.date}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, date: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Metrics Grid */}
                            <div className="row g-2 mb-3">
                                <div className="col-4">
                                    <div className="p-1 border rounded bg-light text-center">
                                        <label className="d-block fw-bold text-muted mb-0" style={{ fontSize: '0.6rem' }}>PROCESSED</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold shadow-none p-0"
                                            style={{ color: PRIMARY_TEXT, fontSize: '1rem' }} 
                                            value={dailyReportData.totalUnitsProcessed}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-1 border rounded text-center border-danger border-opacity-25" style={{ backgroundColor: "#fff5f5" }}>
                                        <label className="d-block fw-bold text-danger mb-0" style={{ fontSize: '0.6rem' }}>DEFECTS</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold shadow-none p-0"
                                            style={{ color: "#dc3545", fontSize: '1rem' }}
                                            value={dailyReportData.totalNG}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, totalNG: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-1 border rounded text-center border-success border-opacity-25" style={{ backgroundColor: LIGHT_GREEN_BG }}>
                                        <label className="d-block fw-bold text-success mb-0" style={{ fontSize: '0.6rem' }}>DOWNTIME</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold shadow-none p-0"
                                            style={{ color: PRIMARY_GREEN, fontSize: '1rem' }}
                                            value={dailyReportData.downtimeMinutes}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="mb-3">
                                <label className="form-label fw-bold mb-1" style={{ color: MUTED_TEXT, fontSize: '0.75rem' }}>Remarks</label>
                                <textarea
                                    className="form-control border shadow-none"
                                    style={{ fontSize: '0.8rem', borderRadius: '4px', minHeight: '80px' }}
                                    value={dailyReportData.summary}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, summary: e.target.value })}
                                    required
                                    placeholder="Summary of shift events..."
                                ></textarea>
                            </div>

                            {/* File Upload */}
                            <div className="mb-3">
                                <input
                                    type="file"
                                    className="form-control form-control-sm border shadow-none bg-light"
                                    style={{ fontSize: '0.75rem' }}
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="text-end border-top pt-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-sm fw-bold text-white px-4"
                                    style={{ backgroundColor: PRIMARY_GREEN, borderRadius: '4px', fontSize: '0.75rem' }}
                                >
                                    <i className="bi bi-send-fill me-2"></i>
                                    SUBMIT REPORT
                                </button>
                            </div>

                        </form>
                    ) : (
                        <div className="card-body p-3">
                            {/* Date Input for viewing */}
                            <div className="mb-3">
                                <label className="form-label fw-bold mb-1" style={{ color: MUTED_TEXT, fontSize: '0.75rem' }}>Select Date to View Reports</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm shadow-none border"
                                    style={{ fontSize: '0.85rem' }}
                                    value={dailyReportData.date}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, date: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Reports Display */}
                            {loadingReports ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                                    <p className="mt-2 text-muted small fw-bold">Loading reports...</p>
                                </div>
                            ) : reportsError ? (
                                <div className="alert border-danger bg-white text-danger small fw-bold">
                                    <i className="bi bi-exclamation-octagon-fill me-2"></i>
                                    Error: {reportsError}
                                </div>
                            ) : existingReports.length === 0 ? (
                                <div className="text-center py-4 bg-light border border-dashed rounded-3 text-muted small fw-bold">
                                    <i className="bi bi-inbox fs-4 mb-2 d-block"></i>
                                    No reports found for {dailyReportData.date}
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <h6 className="fw-bold text-success mb-3">
                                        <i className="bi bi-clipboard-data me-2"></i>
                                        Reports for {dailyReportData.date} ({existingReports.length} found)
                                    </h6>
                                    
                                    {/* Table Header */}
                                    <div className="d-none d-md-grid mb-2" style={{ 
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr', 
                                        padding: '12px 25px', 
                                        background: '#f1f5f9', 
                                        borderRadius: '8px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: '800', 
                                        color: '#475569', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.5px' 
                                    }}>
                                        <div>Source Station</div>
                                        <div className="text-center">Units Processed</div>
                                        <div className="text-center">Total NG</div>
                                        <div className="text-center">Yield Rate</div>
                                        <div>Date & Time</div>
                                        <div className="text-end">Operations</div>
                                    </div>

                                    {/* Report Rows */}
                                    {existingReports.map((report, index) => {
                                        const yieldRate = report.total_units_processed > 0 
                                            ? ((report.total_units_processed - report.total_ng) / report.total_units_processed * 100).toFixed(1)
                                            : '0.0';
                                        const isQualityBreach = report.total_units_processed > 0 && (report.total_ng / report.total_units_processed * 100) > 10;
                                        const isYieldGood = parseFloat(yieldRate) >= 95;
                                        
                                        return (
                                            <div key={report.id} className={`border rounded mb-2 ${isQualityBreach ? 'border-left-5 border-danger bg-light' : 'bg-white'}`} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                                                <div className="d-none d-md-grid align-items-center p-3" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr' }}>
                                                    <div className="fw-bold text-uppercase" style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                                                        {report.station}
                                                    </div>
                                                    
                                                    <div className="text-center">
                                                        <span className="badge bg-light text-dark" style={{ fontSize: '0.85rem', padding: '5px 12px', borderRadius: '6px' }}>
                                                            {report.total_units_processed}
                                                        </span>
                                                    </div>

                                                    <div className="text-center">
                                                        {report.total_ng > 0 ? (
                                                            <span className="badge bg-danger text-white" style={{ fontSize: '0.85rem', padding: '5px 12px', borderRadius: '6px' }}>
                                                                {report.total_ng} NG
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted opacity-25 fw-bold">0</span>
                                                        )}
                                                    </div>

                                                    <div className="text-center">
                                                        <span className={`fw-bold ${isYieldGood ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.85rem' }}>
                                                            {yieldRate}%
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                                                            {new Date(report.created_at).toLocaleDateString('en-GB')}
                                                        </div>
                                                        <div className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>
                                                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>

                                                    <div className="text-end">
                                                        <button
                                                            className="btn btn-sm text-white px-3 py-1"
                                                            style={{ 
                                                                backgroundColor: '#2563eb', 
                                                                fontSize: '0.75rem', 
                                                                fontWeight: '800', 
                                                                textTransform: 'uppercase',
                                                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                                                                borderRadius: '6px'
                                                            }}
                                                            onClick={() => handleViewReport(report)}
                                                        >
                                                            View Data
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Mobile View */}
                                                <div className="d-md-none p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="fw-bold text-primary text-uppercase">
                                                            {report.station}
                                                        </div>
                                                        <span className="badge bg-success text-white" style={{ fontSize: '0.7rem' }}>
                                                            {report.shift}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="row g-2 mb-2">
                                                        <div className="col-4 text-center">
                                                            <div className="bg-light rounded p-2">
                                                                <div className="fw-bold">{report.total_units_processed}</div>
                                                                <small className="text-muted" style={{ fontSize: '0.6rem' }}>Processed</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <div className="bg-light rounded p-2">
                                                                <div className="fw-bold text-danger">{report.total_ng}</div>
                                                                <small className="text-muted" style={{ fontSize: '0.6rem' }}>NG</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <div className="bg-light rounded p-2">
                                                                <div className="fw-bold text-success">{yieldRate}%</div>
                                                                <small className="text-muted" style={{ fontSize: '0.6rem' }}>Yield</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="small text-muted mb-2">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {new Date(report.created_at).toLocaleString('en-GB', { 
                                                            day: '2-digit', 
                                                            month: 'short', 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                    
                                                    <div className="text-center">
                                                        <button
                                                            className="btn btn-sm text-white px-3 py-1"
                                                            style={{ 
                                                                backgroundColor: '#2563eb', 
                                                                fontSize: '0.75rem', 
                                                                fontWeight: '800', 
                                                                textTransform: 'uppercase',
                                                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                                                                borderRadius: '6px'
                                                            }}
                                                            onClick={() => handleViewReport(report)}
                                                        >
                                                            View Data
                                                        </button>
                                                    </div>
                                                    
                                                    {report.summary && (
                                                        <div className="mt-2">
                                                            <small className="fw-bold text-muted">Remarks:</small>
                                                            <p className="mb-0 small text-muted">{report.summary}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {report.attachment_filename && (
                                                        <div className="mt-2">
                                                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                                                                <i className="bi bi-paperclip me-1"></i>
                                                                {report.attachment_filename}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Detail Modal */}
            {showReportModal && selectedReport && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-clipboard-data me-2"></i>
                                    Report Details - {selectedReport.station}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowReportModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                            <div className="row mb-3 g-2">
                                <div className="col-md-3 col-6">
                                    <div className="card border-0 bg-light text-center h-100">
                                        <div className="card-body p-2">
                                            <h5 className="fw-bold mb-0">{selectedReport.total_units_processed}</h5>
                                            <small className="text-muted">Units Processed</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="card border-0 bg-light text-center h-100">
                                        <div className="card-body p-2">
                                            <h5 className="fw-bold mb-0">{selectedReport.total_ng}</h5>
                                            <small className="text-muted">Total NG</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="card border-0 bg-light text-center h-100">
                                        <div className="card-body p-2">
                                            <h5 className="fw-bold mb-0">{selectedReport.downtime_minutes}</h5>
                                            <small className="text-muted">Downtime (min)</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6">
                                    <div className="card border-0 bg-light text-center h-100">
                                        <div className="card-body p-2">
                                            <h5 className="fw-bold mb-0">
                                                {selectedReport.total_units_processed > 0 
                                                    ? ((selectedReport.total_units_processed - selectedReport.total_ng) / selectedReport.total_units_processed * 100).toFixed(1)
                                                    : '0.0'}%
                                            </h5>
                                            <small className="text-muted">Yield Rate</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedReport.summary && (
                                <div className="card border-0 bg-light mb-3">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold mb-2">
                                            <i className="bi bi-chat-left-text-fill me-2"></i>
                                            Remarks
                                        </h6>
                                        <p className="card-text mb-0">{selectedReport.summary}</p>
                                    </div>
                                </div>
                            )}

                            {selectedReport.attachment_filename && (
                                <div className="card border-0 bg-light mb-3">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold mb-2">
                                            <i className="bi bi-paperclip me-2"></i>
                                            Attachment
                                        </h6>
                                        <p className="card-text mb-0">
                                            <span className="badge bg-secondary text-white">
                                                {selectedReport.attachment_filename}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 bg-light">
                                <div className="card-body">
                                    <h6 className="card-title fw-bold mb-2">
                                        <i className="bi bi-clock-fill me-2"></i>
                                        Timestamp Information
                                    </h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Report Date:</strong> {selectedReport.report_date}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Created At:</strong> {new Date(selectedReport.created_at).toLocaleString('en-GB')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowReportModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
