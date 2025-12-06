import React from 'react';

export function DailyReportForm({ currentStation, dailyReportData, setDailyReportData, handleReportSubmit, selectedFile, setSelectedFile }) {
    
    // --- Define Dark Theme Colors ---
    const PRIMARY_COLOR = "#343a40"; // Dark Gray / Black
    const ACCENT_COLOR = "#007bff"; // Blue (used sparingly for metrics/text emphasis)
    const LIGHT_BACKGROUND = "#f8f9fa"; // Very light grey background for fields/sections

    return (
        // Nagpalit mula sa row justify-content-center tungo sa isang fixed width container (col-lg-6)
        // para maging 'Report Form' side lang ito.
        <div className="col-lg-12 col-xl-12 p-0"> 
            <div className="d-flex flex-column h-100">
                
                {/* Clean Card: Removed outer shadow for a flat, modern look */}
                <div className="card border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: "#ffffff" }}>

                    {/* Header: Dark Theme Primary Color */}
                    <div className="card-header text-white py-3 px-4 rounded-top-4" style={{ backgroundColor: PRIMARY_COLOR }}>
                        <h5 className="mb-0 fw-bold fs-5">
                            <i className="bi bi-file-earmark-bar-graph me-2"></i>
                            Daily Report Submission
                        </h5>
                        <p className="mb-0 small text-light fw-light">Station: {currentStation}</p>
                    </div>

                    <form onSubmit={handleReportSubmit} className="card-body p-4 overflow-auto">

                        {/* 1. Identification */}
                        <h6 className="fw-bolder mb-3 border-bottom pb-1" style={{ color: PRIMARY_COLOR }}>1. Report Identification</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold text-muted small">Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control border-0"
                                    style={{ backgroundColor: LIGHT_BACKGROUND }}
                                    value={dailyReportData.date}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold text-muted small">Shift</label>
                                <select
                                    className="form-select border-0"
                                    style={{ backgroundColor: LIGHT_BACKGROUND }}
                                    value={dailyReportData.shift}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, shift: e.target.value })}
                                >
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                </select>
                            </div>
                        </div>

                        {/* 2. Metrics */}
                        <h6 className="fw-bolder mb-3 border-bottom pb-1" style={{ color: PRIMARY_COLOR }}>2. Production Metrics</h6>
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted small">Units Processed <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    className="form-control border-0 fw-bold"
                                    style={{ backgroundColor: LIGHT_BACKGROUND, color: ACCENT_COLOR }} 
                                    min="0"
                                    value={dailyReportData.totalUnitsProcessed}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted small">Total NG (Defects)</label>
                                <input
                                    type="number"
                                    className="form-control border-0 fw-bold text-danger"
                                    style={{ backgroundColor: LIGHT_BACKGROUND }}
                                    min="0"
                                    value={dailyReportData.totalNG}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, totalNG: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted small">Downtime (Min)</label>
                                <input
                                    type="number"
                                    className="form-control border-0 fw-bold"
                                    style={{ backgroundColor: LIGHT_BACKGROUND }}
                                    min="0"
                                    value={dailyReportData.downtimeMinutes}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* 3. Summary */}
                        <h6 className="fw-bolder mb-3 border-bottom pb-1" style={{ color: PRIMARY_COLOR }}>3. Summary & Attachments</h6>
                        <div className="mb-4">
                            <label className="form-label fw-semibold text-muted small">Shift Summary/Notes <span className="text-danger">*</span></label>
                            <textarea
                                className="form-control border-0"
                                style={{ backgroundColor: LIGHT_BACKGROUND }}
                                rows="4"
                                value={dailyReportData.summary}
                                onChange={(e) => setDailyReportData({ ...dailyReportData, summary: e.target.value })}
                                required
                                placeholder="Enter summary of activities, detailed breakdown of NG units, and issues."
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold text-muted small">Attach Supporting File (Optional)</label>
                            <input
                                type="file"
                                className="form-control border-0"
                                style={{ backgroundColor: LIGHT_BACKGROUND }}
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            {selectedFile && (
                                <p className="small mt-2 mb-0" style={{ color: PRIMARY_COLOR }}>File ready: {selectedFile.name}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="d-grid mt-4">
                            <button 
                                type="submit" 
                                className="btn btn-lg fw-bold rounded-pill shadow-sm"
                                style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
                            >
                                <i className="bi bi-send-fill me-2"></i>
                                Submit Daily Report
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}