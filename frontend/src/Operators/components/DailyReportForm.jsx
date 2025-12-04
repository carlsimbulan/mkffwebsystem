import React from 'react';

export function DailyReportForm({ currentStation, dailyReportData, setDailyReportData, handleReportSubmit, selectedFile, setSelectedFile }) {
    return (
        <div className="row justify-content-center mt-4 animate-in fade-in">
            <div className="col-lg-10 col-xl-8">

                {/* Clean Card */}
                <div className="card border-light rounded-4 shadow-lg" style={{ backgroundColor: "#ffffff" }}>

                    {/* Header */}
                    <div className="card-header bg-primary text-white py-3 rounded-top-4">
                        <h4 className="mb-0 fw-semibold">
                            <i className="bi bi-file-earmark-bar-graph me-2"></i>
                            Daily Production Report - {currentStation}
                        </h4>
                    </div>

                    <form onSubmit={handleReportSubmit} className="card-body p-4">

                        {/* General Details */}
                        <h6 className="text-primary fw-bold mb-3">General Details</h6>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dailyReportData.date}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Shift</label>
                                <select
                                    className="form-select"
                                    value={dailyReportData.shift}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, shift: e.target.value })}
                                >
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                </select>
                            </div>
                        </div>

                        {/* Metrics */}
                        <h6 className="text-primary fw-bold mb-3">Production Metrics</h6>
                        <div className="row g-4 mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Total Units Processed <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={dailyReportData.totalUnitsProcessed}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Total NG (No Good)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={dailyReportData.totalNG}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, totalNG: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Downtime (in Minutes)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    value={dailyReportData.downtimeMinutes}
                                    onChange={(e) => setDailyReportData({ ...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <h6 className="text-primary fw-bold mb-3">Summary & Attachments</h6>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">
                                Shift Summary/Notes <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={dailyReportData.summary}
                                onChange={(e) => setDailyReportData({ ...dailyReportData, summary: e.target.value })}
                                required
                                placeholder="Enter summary of activities, issues, and resolutions."
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold">Attach Supporting File (Optional)</label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                        </div>

                        {/* Submit */}
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg fw-semibold">
                                <i className="bi bi-check-circle me-2"></i>
                                Submit Daily Report
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}