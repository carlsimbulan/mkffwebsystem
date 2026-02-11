import React from 'react';

// 🔑 PINALITAN: Siguradong Philippine Time (Asia/Manila)
const getTodayDate = () => {
    return new Intl.DateTimeFormat('en-CA', { // format: YYYY-MM-DD
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
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

    // Calculate executive summary metrics
    const calculateMetrics = () => {
        const dailyThroughput = filteredReports.reduce((sum, report) => sum + (report.total_units_processed || 0), 0);
        
        const yields = filteredReports.map(report => {
            const total = report.total_units_processed || 0;
            const ng = report.total_ng || 0;
            return total > 0 ? ((total - ng) / total * 100) : 0;
        });
        
        const averageLineYield = yields.length > 0 
            ? (yields.reduce((sum, yieldValue) => sum + yieldValue, 0) / yields.length).toFixed(1)
            : '0.0';
        
        const criticalHotspot = filteredReports.reduce((max, report) => {
            return (!max || (report.total_ng || 0) > (max.total_ng || 0)) ? report : max;
        }, null);
        
        return {
            dailyThroughput,
            averageLineYield,
            criticalHotspot: criticalHotspot ? 
                (criticalHotspot.station === 'overall' ? 'SYSTEM OVERALL' : 
                 stations.find(s => s.id === criticalHotspot.station)?.name || criticalHotspot.station) : 'N/A'
        };
    };

    const metrics = calculateMetrics();

    // Calculate yield rate for individual report
    const calculateYieldRate = (report) => {
        const total = report.total_units_processed || 0;
        const ng = report.total_ng || 0;
        return total > 0 ? ((total - ng) / total * 100).toFixed(1) : '0.0';
    };

    // Check if report has quality breach (>10% NG)
    const hasQualityBreach = (report) => {
        const total = report.total_units_processed || 0;
        const ng = report.total_ng || 0;
        return total > 0 && (ng / total * 100) > 10;
    };

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
                
                /* Executive Summary Cards */
                .executive-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 25px;
                }

                .metric-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                }

                .metric-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .metric-value {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .metric-unit {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                }

                /* Glass Effect Row Card */
                .report-row-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
                }

                /* Quality Breach Red Flag */
                .report-row-card.quality-breach {
                    border-left: 5px solid #dc2626;
                    background-color: #fef2f2;
                }


                .table-header-custom {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1fr;
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
                    grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1fr;
                    align-items: center;
                    padding: 18px 25px;
                }

                .yield-rate-good {
                    color: #16a34a;
                    font-weight: 700;
                }

                .yield-rate-critical {
                    color: #dc2626;
                    font-weight: 800;
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

                .export-btn-pro {
                    background: #059669;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
                    outline: none;
                    transition: all 0.2s ease;
                }

                .export-btn-pro:hover {
                    background: #047857;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 8px rgba(5, 150, 105, 0.3);
                }

                .export-btn-pro:active {
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
                    <h3 className="fw-bold text-dark mb-1">Advanced Audit Dashboard</h3>
                    <p className="text-muted small mb-0 fw-bold">Manufacturing quality analytics and performance metrics</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="export-btn-pro" onClick={() => {
                        // Export functionality with proper date and time
                        const exportData = filteredReports.map(report => {
                            const reportDate = new Date(report.created_at);
                            return {
                                station: report.station === 'overall' ? 'SYSTEM OVERALL' : 
                                       stations.find(s => s.id === report.station)?.name || report.station,
                                unitsProcessed: report.total_units_processed || 0,
                                totalNG: report.total_ng || 0,
                                yieldRate: calculateYieldRate(report),
                                date: reportDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: '2-digit', 
                                    day: '2-digit' 
                                }),
                                time: reportDate.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    second: '2-digit',
                                    hour12: false 
                                }),
                                dateTime: reportDate.toISOString()
                            };
                        });
                        
                        const csvContent = [
                            ['Station', 'Units Processed', 'Total NG', 'Yield Rate %', 'Date', 'Time', 'DateTime'],
                            ...exportData.map(row => [
                                `"${row.station}"`,
                                row.unitsProcessed,
                                row.totalNG,
                                row.yieldRate,
                                `"${row.date}"`,
                                `"${row.time}"`,
                                `"${row.dateTime}"`
                            ])
                        ].map(row => row.join(',')).join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `audit-report-${new Date().toISOString().split('T')[0]}-${new Date().toLocaleTimeString('en-US', {hour12: false}).replace(/:/g, '-')}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }}>
                        <i className="bi bi-download me-2"></i>
                        EXPORT ARCHIVE
                    </button>
                    <button className="create-btn-pro" onClick={() => setShowReportModal(true)}>
                        + CREATE ENTRY
                    </button>
                </div>
            </div>

            <div className="reports-wrapper">
                {/* EXECUTIVE SUMMARY CARDS */}
                <div className="executive-summary">
                    <div className="metric-card">
                        <div className="metric-label">Daily Throughput</div>
                        <div className="metric-value">{metrics.dailyThroughput.toLocaleString()}</div>
                        <div className="metric-unit">Units Processed</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Average Line Yield</div>
                        <div className="metric-value">{metrics.averageLineYield}%</div>
                        <div className="metric-unit">Quality Performance</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-label">Critical Hotspot</div>
                        <div className="metric-value" style={{fontSize: '1.2rem'}}>{metrics.criticalHotspot}</div>
                        <div className="metric-unit">Highest NG Count</div>
                    </div>
                </div>

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
                    <div className="text-center">Yield Rate</div>
                    <div>Date & Time</div>
                    <div className="text-end">Operations</div>
                </div>

                {/* DATA LIST */}
                <div className="report-list">
                    {filteredReports.length > 0 ? filteredReports.map(report => {
                        const yieldRate = calculateYieldRate(report);
                        const isQualityBreach = hasQualityBreach(report);
                        const isYieldGood = parseFloat(yieldRate) >= 95;
                        
                        return (
                        <div key={report.id} className={`report-row-card ${isQualityBreach ? 'quality-breach' : ''}`}>
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

                                <div className="text-center">
                                    <span className={isYieldGood ? 'yield-rate-good' : 'yield-rate-critical'}>
                                        {yieldRate}%
                                    </span>
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
                        );
                    }) : (
                        <div className="text-center py-5 border rounded-4 bg-light">
                            <p className="mb-0 fw-bold text-muted opacity-50">NO ARCHIVE RECORDS FOUND</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
