import React from 'react';

export function DailyReportForm({ currentStation, dailyReportData, setDailyReportData, handleReportSubmit, selectedFile, setSelectedFile }) {
    
    // --- Define Industrial Green Theme Colors ---
    const PRIMARY_GREEN = "#15803d"; 
    const LIGHT_GREEN_BG = "#f0fdf4";
    const BORDER_COLOR = "#d1d5db";
    const PRIMARY_TEXT = "#111827";
    const MUTED_TEXT = "#4b5563";

    return (
        <div className="col-lg-12 col-xl-12 p-0 animate-in fade-in"> 
            <div className="d-flex flex-column">
                
                {/* Main Container */}
                <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: BORDER_COLOR }}>

                    {/* Header: Compact */}
                    <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderLeft: `4px solid ${PRIMARY_GREEN}` }}>
                        <div>
                            <h6 className="mb-0 fw-bold" style={{ color: PRIMARY_TEXT, fontSize: '0.9rem' }}>
                                <i className="bi bi-file-earmark-text-fill me-2 text-success"></i>
                                DAILY PRODUCTION REPORT
                            </h6>
                            <small className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>
                                STATION: <span className="text-success">{currentStation?.toUpperCase()}</span>
                            </small>
                        </div>
                        <i className="bi bi-check-circle-fill text-success opacity-75 fs-6"></i>
                    </div>

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

                        {/* Maliit na Submit Button */}
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
                </div>
            </div>
        </div>
    );
}