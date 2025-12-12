import React from 'react';

// Helper function para makuha ang kasalukuyang petsa sa format na 'YYYY-MM-DD'.
// Tiyakin nito na laging ngayon ang default na petsa.
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function ReportsView({
    // Ipinapalagay na ang reports ay pre-filtered na (filteredReports) at ang state ay controlled ng Parent.
    filteredReports,
    stations,
    reportDate, // State ng petsa galing sa Parent
    setReportDate, // Setter ng petsa galing sa Parent
    reportFilterStationId,
    setReportFilterStationId,
    setShowReportModal,
    handleViewReport,
}) {
    
    // 1. Prepare Stations array, adding the 'Overall Report' option for filtering (best practice)
    const enhancedFilterStations = [
        { id: 'All', name: 'All Stations' }, 
        { id: 'overall', name: 'Overall Reports Only' }, // Added filter for overall reports
        ...stations
    ];

    // Helper to find station name or display custom tag (for overall reports)
    const getStationDisplay = (reportId) => {
        if (reportId === 'overall') {
            return (
                <span className="badge bg-warning text-dark px-2 py-1 rounded-pill fw-bold">
                    <i className="bi bi-gear-fill me-1"></i> OVERALL
                </span>
            );
        }
        const station = stations.find(s => s.id === reportId);
        return station ? station.name : `Station ${reportId}`;
    };

    return (
        <div className="animate-in fade-in pb-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Production Reports</h3>
                    <p className="text-muted small mb-0">Daily performance records from all stations.</p>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold hover-scale"
                    onClick={() => setShowReportModal(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i>New Report
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-3 d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-calendar-event text-secondary me-2 fs-5"></i>
                        <input
                            type="date"
                            className="form-control border-0 bg-light fw-bold text-secondary"
                            style={{ maxWidth: '160px' }}
                            // FIX 1: Gumagamit na ng reportDate galing sa Parent
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            // FIX 2: Tiyak na ngayon ang max date
                            max={getTodayDate()} 
                        />
                    </div>
                    <div className="vr text-secondary opacity-25 mx-2"></div>
                    <div className="d-flex align-items-center flex-grow-1">
                        <i className="bi bi-funnel text-secondary me-2 fs-5"></i>
                        <select
                            className="form-select border-0 bg-light fw-bold text-secondary"
                            style={{ maxWidth: '250px' }}
                            value={reportFilterStationId}
                            onChange={(e) => setReportFilterStationId(e.target.value)}
                        >
                            {enhancedFilterStations.map(s => (
                                <option 
                                    key={s.id} 
                                    value={s.id}
                                    className={s.id === 'overall' ? 'fw-bold text-primary' : ''}
                                >
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-muted small ms-auto">
                        Showing <strong className="text-dark">{filteredReports.length}</strong> records
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                        <thead className="bg-light text-secondary text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="border-0 py-3 ps-4">Station & Shift</th>
                                <th className="border-0 py-3 text-center">Output</th>
                                <th className="border-0 py-3 text-center">Defects / Downtime</th>
                                <th className="border-0 py-3 text-end pe-4">Timestamp</th>
                                <th className="border-0 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {filteredReports && filteredReports.length > 0 ? filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded p-2 me-3 ${report.station === 'overall' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                <i className={`bi ${report.station === 'overall' ? 'bi-journals' : 'bi-layers-fill'}`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{getStationDisplay(report.station)}</div>
                                                <div className="small text-muted">{report.shift}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-normal fs-6">
                                            {report.total_units_processed}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <span className="text-danger fw-bold">{report.total_ng} NG</span>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>{report.downtime_minutes} min down</small>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4 text-muted font-monospace small">
                                        {/* Improved Timestamp Display */}
                                        <div className="text-dark fw-bold">{new Date(report.created_at).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.75rem' }}>
                                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-light border text-primary hover-primary rounded-pill px-3"
                                            onClick={() => handleViewReport(report)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted">
                                        <div className="mb-3"><i className="bi bi-file-earmark-x fs-1 opacity-25"></i></div>
                                        <p className="mb-0">No reports found for the selected date or station.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CSS styles */}
            <style>{`
                .hover-scale:hover { transform: scale(1.02); transition: transform 0.2s; }
                .hover-primary:hover { background-color: #0d6efd; color: white !important; border-color: #0d6efd !important; }
            `}</style>
        </div>
    );
}