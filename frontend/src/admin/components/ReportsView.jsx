import React from 'react';

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function ReportsView({
    filteredReports,
    stations,
    reportDate,
    setReportDate,
    reportFilterStationId,
    setReportFilterStationId,
    setShowReportModal,
    handleViewReport,
}) {
    
    const enhancedFilterStations = [
        { id: 'All', name: 'ALL STATIONS' }, 
        { id: 'overall', name: 'OVERALL REPORTS ONLY' },
        ...stations.map(s => ({ ...s, name: s.name.toUpperCase() }))
    ];

    const getStationDisplay = (reportId) => {
        if (reportId === 'overall') {
            return (
                <span className="badge border border-warning text-warning rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.65rem', background: '#fffbeb' }}>
                    <i className="bi bi-gear-fill me-1"></i> OVERALL
                </span>
            );
        }
        const station = stations.find(s => s.id === reportId);
        return <span className="fw-bold text-dark">{station ? station.name : `Station ${reportId}`}</span>;
    };

    return (
        <div className="container-fluid px-0 py-2 animate-in fade-in">
            <style>{`
                .reports-container {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .filter-strip {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 15px 25px;
                }
                .reports-table thead th {
                    background: #f8fafc;
                    color: #64748b;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 1px;
                    font-weight: 700;
                    padding: 15px 20px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .reports-table tbody td {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }
                .btn-new-report {
                    background: #107c55;
                    border: none;
                    font-weight: 700;
                    font-size: 0.85rem;
                    padding: 10px 20px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .btn-new-report:hover { background: #0d6646; }
                
                .filter-input-flat {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border-radius: 6px;
                    padding: 6px 12px;
                }
                .metric-badge {
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 6px 12px;
                    border-radius: 6px;
                }
                .label-caps {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-0 tracking-tight">Production Archives</h4>
                    <p className="text-muted small mb-0 fw-medium">Registry of daily station throughput and technical reports</p>
                </div>
                <button
                    className="btn btn-primary btn-new-report d-flex align-items-center"
                    onClick={() => setShowReportModal(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i> CREATE REPORT
                </button>
            </div>

            <div className="reports-container">
                {/* FILTER BAR */}
                <div className="filter-strip">
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <label className="label-caps d-block mb-1">Target Date</label>
                            <input
                                type="date"
                                className="form-control filter-input-flat shadow-none"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                max={getTodayDate()} 
                            />
                        </div>
                        <div className="col-auto">
                            <label className="label-caps d-block mb-1">Source Station</label>
                            <select
                                className="form-select filter-input-flat shadow-none"
                                style={{ minWidth: '220px' }}
                                value={reportFilterStationId}
                                onChange={(e) => setReportFilterStationId(e.target.value)}
                            >
                                {enhancedFilterStations.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col text-end pt-3">
                            <span className="label-caps">Records Found:</span>
                            <span className="ms-2 fw-bold text-dark h6 mb-0">{filteredReports.length}</span>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table table-hover reports-table mb-0">
                        <thead>
                            <tr>
                                <th>Source Details</th>
                                <th className="text-center">Net Output</th>
                                <th className="text-center">Technical Metrics</th>
                                <th className="text-end">Submission Time</th>
                                <th className="text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports && filteredReports.length > 0 ? filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className={`rounded-3 p-2 me-3 d-flex align-items-center justify-content-center border ${report.station === 'overall' ? 'border-warning text-warning bg-warning bg-opacity-10' : 'border-primary text-primary bg-primary bg-opacity-10'}`} style={{ width: '38px', height: '38px' }}>
                                                <i className={`bi ${report.station === 'overall' ? 'bi-journals' : 'bi-layers-half'} fs-5`}></i>
                                            </div>
                                            <div>
                                                <div className="small">{getStationDisplay(report.station)}</div>
                                                <div className="label-caps mt-1" style={{ fontSize: '0.6rem' }}>{report.shift?.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="metric-badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                            {report.total_units_processed} <small className="fw-normal">UNITS</small>
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex flex-column align-items-center">
                                            <span className="text-danger fw-bold small uppercase">{report.total_ng} DEFECTS</span>
                                            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: '600' }}>{report.downtime_minutes}M DOWNTIME</span>
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <div className="fw-bold text-dark small">{new Date(report.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                                        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-light border fw-bold px-3 py-1 shadow-none"
                                            style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                                            onClick={() => handleViewReport(report)}
                                        >
                                            VIEW DATA
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted">
                                        <i className="bi bi-file-earmark-x display-4 opacity-10"></i>
                                        <p className="mt-3 fw-bold uppercase tracking-wider small">No data entries matched the criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}