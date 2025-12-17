import React from 'react';

export function DailyReportForm({ currentStation, dailyReportData, setDailyReportData, handleReportSubmit, selectedFile, setSelectedFile }) {
    
    // --- Define Industrial Theme Colors ---
    const BORDER_COLOR = "#e2e8f0";
    const PRIMARY_TEXT = "#0f172a";
    const MUTED_TEXT = "#64748b";
    const INPUT_BG = "#f8fafc";

    return (
        <div className="col-lg-12 col-xl-12 p-0 animate-in fade-in"> 
            <div className="d-flex flex-column h-100">
                
                {/* Main Container: Flat Industrial Style */}
                <div className="card border rounded-3 overflow-hidden h-100" style={{ borderColor: BORDER_COLOR, backgroundColor: "#ffffff" }}>

                    {/* Header: Minimalist with Bottom Border */}
                    <div className="card-header bg-white py-3 px-4 border-bottom" style={{ borderColor: BORDER_COLOR }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold tracking-tight" style={{ color: PRIMARY_TEXT }}>
                                    <i className="bi bi-clipboard-data me-2"></i>
                                    DAILY PRODUCTION REPORT
                                </h5>
                                <span className="badge bg-light text-dark border mt-1" style={{ fontSize: '0.75rem' }}>
                                    STATION: {currentStation?.toUpperCase()}
                                </span>
                            </div>
                            <i className="bi bi-shield-check fs-4 text-muted opacity-50"></i>
                        </div>
                    </div>

                    <form onSubmit={handleReportSubmit} className="card-body p-4 overflow-auto">

                        {/* SECTION 1: Identification (Shift Removed) */}
                        <div className="mb-4">
                            <label className="text-uppercase small fw-bold mb-3 d-block tracking-wider" style={{ color: MUTED_TEXT }}>
                                01. Report Identification
                            </label>
                            <div className="p-3 rounded-3 border bg-light bg-opacity-50">
                                <label className="form-label fw-bold small">Entry Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control border shadow-none"
                                    style={{ backgroundColor: "#ffffff", fontSize: '1rem', fontWeight: '600' }}
                                    value={dailyReportData.date}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* SECTION 2: Metrics */}
                        <div className="mb-4">
                            <label className="text-uppercase small fw-bold mb-3 d-block tracking-wider" style={{ color: MUTED_TEXT }}>
                                02. Performance Metrics
                            </label>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="p-3 border rounded-3 text-center" style={{ backgroundColor: INPUT_BG }}>
                                        <label className="form-label fw-bold small text-muted d-block">PROCESSED</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold fs-4 shadow-none p-0"
                                            style={{ color: PRIMARY_TEXT }} 
                                            min="0"
                                            value={dailyReportData.totalUnitsProcessed}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="p-3 border rounded-3 text-center border-danger border-opacity-25" style={{ backgroundColor: "#fff5f5" }}>
                                        <label className="form-label fw-bold small text-danger d-block">DEFECTS (NG)</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold fs-4 shadow-none p-0"
                                            style={{ color: "#dc3545" }}
                                            min="0"
                                            value={dailyReportData.totalNG}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, totalNG: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="p-3 border rounded-3 text-center" style={{ backgroundColor: INPUT_BG }}>
                                        <label className="form-label fw-bold small text-muted d-block">DOWNTIME (MIN)</label>
                                        <input
                                            type="number"
                                            className="form-control border-0 bg-transparent text-center fw-bold fs-4 shadow-none p-0"
                                            min="0"
                                            value={dailyReportData.downtimeMinutes}
                                            onChange={(e) => setDailyReportData({ ...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Summary */}
                        <div className="mb-4">
                            <label className="text-uppercase small fw-bold mb-3 d-block tracking-wider" style={{ color: MUTED_TEXT }}>
                                03. Documentation Summary
                            </label>
                            <textarea
                                className="form-control border shadow-none"
                                style={{ backgroundColor: INPUT_BG, fontSize: '0.9rem', borderRadius: '8px' }}
                                rows="6"
                                value={dailyReportData.summary}
                                onChange={(e) => setDailyReportData({ ...dailyReportData, summary: e.target.value })}
                                required
                                placeholder="Enter shift notes, technical observations, and a detailed breakdown of issues..."
                            ></textarea>
                        </div>

                        {/* File Upload: Industrial Flat */}
                        <div className="mb-4">
                            <div className="p-3 border rounded-3 border-dashed bg-light text-center">
                                <label className="form-label fw-bold small d-block mb-2">Technical Attachments</label>
                                <input
                                    type="file"
                                    className="form-control form-control-sm border-0 bg-transparent shadow-none"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                                {selectedFile && (
                                    <div className="mt-2 small text-success fw-bold">
                                        <i className="bi bi-file-earmark-check me-1"></i> {selectedFile.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid mt-2">
                            <button 
                                type="submit" 
                                className="btn btn-lg fw-bold text-white border-0 py-3"
                                style={{ backgroundColor: PRIMARY_TEXT, borderRadius: '8px', fontSize: '0.95rem' }}
                            >
                                <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                                FINALIZE & SUBMIT REPORT
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}