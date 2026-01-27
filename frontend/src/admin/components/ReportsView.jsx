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
                .reports-wrapper {
                    padding: 10px;
                }
                
                .archive-filter-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
                    margin-bottom: 25px;
                }
                
                /* Glass Effect Row Card */
                .report-row-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
                    transition: background-color 0.2s ease; /* Smooth glass tint */
                }

                /* Minimalist Glass Hover - Subtle white tint & blur */
                .report-row-card:hover {
                    background-color: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(4px); /* Glass blur */
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .table-header-custom {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
                    padding: 12px 25px;
                    background: #f1f5f9;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .report-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
                    align-items: center;
                    padding: 18px 25px;
                }

                .station-name-box {
                    font-weight: 800;
                    color: #0f172a;
                    font-size: 0.95rem;
                }

                .unit-count-badge {
                    background: #f8fafc;
                    color: #475569;
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    border: 1px solid #e2e8f0;
                }

                .ng-badge-critical {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .btn-view-action {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                    outline: none;
                    transition: transform 0.1s;
                }

                .btn-view-action:active {
                    transform: scale(0.96);
                    background: #1d4ed8;
                }

                .create-btn-pro {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    outline: none;
                }

                .create-btn-pro:active {
                    transform: scale(0.97);
                    opacity: 0.9;
                }

                .form-input-pro {
                    border: 1px solid #cbd5e1;
                    font-weight: 700;
                    font-size: 0.9rem;
                    height: 42px;
                    border-radius: 8px;
                    background: #ffffff;
                }

                .label-pro {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    display: block;
                }
            `}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Production Archives</h3>
                    <p className="text-muted small mb-0 fw-bold">Station throughput records and daily technical registry</p>
                </div>
                <button className="create-btn-pro" onClick={() => setShowReportModal(true)}>
                    + CREATE ENTRY
                </button>
            </div>

            <div className="reports-wrapper">
                {/* FILTER CARD */}
                <div className="archive-filter-card">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="label-pro">Target Date</label>
                            <input
                                type="date"
                                className="form-control form-input-pro"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                max={getTodayDate()} 
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="label-pro">Station Source</label>
                            <select
                                className="form-select form-input-pro"
                                value={reportFilterStationId}
                                onChange={(e) => setReportFilterStationId(e.target.value)}
                            >
                                {enhancedFilterStations.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col text-end">
                            <span className="label-pro">Summary Count</span>
                            <span className="h4 fw-bold mb-0 text-dark">{filteredReports.length}</span>
                            <span className="text-muted small fw-bold ms-2">RECORDS</span>
                        </div>
                    </div>
                </div>

                {/* GRID HEADER */}
                <div className="table-header-custom d-none d-md-grid">
                    <div>Source Station</div>
                    <div className="text-center">Units Processed</div>
                    <div className="text-center">Total NG</div>
                    <div>Date & Time</div>
                    <div className="text-end">Operations</div>
                </div>

                {/* DATA LIST */}
                <div className="report-list">
                    {filteredReports.length > 0 ? filteredReports.map(report => (
                        <div key={report.id} className="report-row-card">
                            <div className="report-item">
                                <div className="station-name-box text-uppercase">
                                    {report.station === 'overall' ? 'SYSTEM OVERALL' : 
                                     stations.find(s => s.id === report.station)?.name || report.station}
                                </div>
                                
                                <div className="text-center">
                                    <span className="unit-count-badge">
                                        {report.total_units_processed}
                                    </span>
                                </div>

                                <div className="text-center">
                                    {report.total_ng > 0 ? (
                                        <span className="ng-badge-critical">
                                            {report.total_ng} NG
                                        </span>
                                    ) : (
                                        <span className="text-muted opacity-25 fw-bold">0</span>
                                    )}
                                </div>

                                <div>
                                    <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>
                                        {new Date(report.created_at).toLocaleDateString('en-GB')}
                                    </div>
                                    <div className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>
                                        {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="text-end">
                                    <button
                                        className="btn-view-action"
                                        onClick={() => handleViewReport(report)}
                                    >
                                        View Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5 border rounded-4 bg-light">
                            <p className="mb-0 fw-bold text-muted opacity-50">NO ARCHIVE RECORDS FOUND</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}