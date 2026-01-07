import React from 'react';

const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
        { id: 'overall', name: 'OVERALL REPORTS' },
        ...stations.map(s => ({ ...s, name: s.name.toUpperCase() }))
    ];

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                .reports-container {
                    background: #ffffff;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .filter-strip {
                    background: #ffffff;
                    border-bottom: 2px solid #f1f5f9;
                    padding: 20px 25px;
                }
                /* Table Styling */
                .reports-table thead th {
                    background: #f8fafc;
                    color: #334155;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 15px 20px;
                    border: none;
                }
                .reports-table tbody td {
                    padding: 18px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                    font-size: 0.95rem;
                    font-weight: 700; /* Makapal na text para sa readability */
                }
                /* View Button - Solid Blue Box */
                .btn-view-data {
                    background: #0d6efd;
                    color: white;
                    border: none;
                    font-weight: 700;
                    font-size: 0.75rem;
                    padding: 8px 20px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    transition: background 0.2s;
                }
                .btn-view-data:hover {
                    background: #0b5ed7;
                    color: white;
                }
                .btn-create-main {
                    background: #0f172a;
                    color: white;
                    border: none;
                    font-weight: 700;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                }
                .form-input-pro {
                    border: 1px solid #cbd5e1;
                    font-weight: 700;
                    font-size: 0.9rem;
                    border-radius: 6px;
                }
                .label-pro {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    display: block;
                }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Production Archives</h4>
                    <p className="text-muted small mb-0 fw-bold">Daily station throughput and technical report registry</p>
                </div>
                <button className="btn-create-main shadow-sm" onClick={() => setShowReportModal(true)}>
                    + CREATE REPORT
                </button>
            </div>

            <div className="reports-container">
                {/* FILTER BAR */}
                <div className="filter-strip">
                    <div className="row g-3 align-items-end">
                        <div className="col-auto">
                            <label className="label-pro">Target Date</label>
                            <input
                                type="date"
                                className="form-control form-input-pro shadow-none"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                max={getTodayDate()} 
                            />
                        </div>
                        <div className="col-auto">
                            <label className="label-pro">Source Station</label>
                            <select
                                className="form-select form-input-pro shadow-none"
                                style={{ minWidth: '220px' }}
                                value={reportFilterStationId}
                                onChange={(e) => setReportFilterStationId(e.target.value)}
                            >
                                {enhancedFilterStations.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col text-end">
                            <span className="text-muted small fw-bold uppercase">Records: </span>
                            <span className="h5 fw-bold mb-0 text-dark ms-2">{filteredReports.length}</span>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table table-hover reports-table mb-0">
                        <thead>
                            <tr>
                                <th>Source Station</th>
                                <th className="text-center">Units Processed</th>
                                <th className="text-center">Total NG</th>
                                <th className="text-end">Date & Time</th>
                                <th className="text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td className="text-dark">
                                        {report.station === 'overall' ? 'SYSTEM OVERALL' : 
                                         stations.find(s => s.id === report.station)?.name || report.station}
                                    </td>
                                    <td className="text-center">
                                        {report.total_units_processed}
                                    </td>
                                    <td className="text-center">
                                        {report.total_ng > 0 ? (
                                            <span className="text-danger">{report.total_ng}</span>
                                        ) : (
                                            <span className="text-muted opacity-50">0</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <div className="text-dark">{new Date(report.created_at).toLocaleDateString('en-GB')}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn-view-data"
                                            onClick={() => handleViewReport(report)}
                                        >
                                            View Data
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-5 text-center text-muted fw-bold">
                                        No reports found for the selected filter.
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