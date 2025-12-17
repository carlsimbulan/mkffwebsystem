import React, { useRef } from 'react';
import { UnitPieChart } from './UnitPieChart'; 
import { StationBarChart } from './StationBarChart'; 
import html2canvas from 'html2canvas'; 

export function Dashboard({
    logs,
    stations,
    calculateMetrics,
    overallMetrics, 
    setActiveTab,
    dashboardView,
    nextChart,
    prevChart,
    handleMonitorStation,
    newReportsToday, 
}) {
    
    const chartRef = useRef(null); 

    const exportChartAsImage = () => {
        const chartElement = chartRef.current;
        if (!chartElement) return;

        html2canvas(chartElement, {
            allowTaint: true,
            useCORS: true,
            backgroundColor: "#ffffff",
            scale: 2 
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `MKFF_Report_${new Date().getTime()}.png`;
            link.click();
        });
    };
    
    const forScanningLogs = logs.filter(l => l.status === 'For Scanning');
    const forScanningUnitsCount = forScanningLogs.length;

    const coreProductionUnits = 
        overallMetrics.completedUnits + 
        overallMetrics.pendingUnits + 
        overallMetrics.ngUnits + 
        overallMetrics.pendingApprovalUnits; 

    const totalUnits = coreProductionUnits + forScanningUnitsCount; 

    const calculatePercentage = (value) => {
        if (totalUnits === 0) return '0.0%';
        return ((value / totalUnits) * 100).toFixed(1) + '%';
    };

    const currentChartTitle = dashboardView === 'bar' ? 'STATION OUTPUT' : 'STATUS DISTRIBUTION';

    return (
        <div className="container-fluid px-0 py-2 animate-in fade-in">
            <style>{`
                .stat-card-pro {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 22px;
                    height: 100%;
                    border-left: 5px solid #334155;
                }
                .label-caps {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: block;
                }
                .value-bold {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    line-height: 1;
                }
                .badge-flat {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 6px;
                    margin-top: 10px;
                    display: inline-block;
                }
                .chart-wrapper-flat {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .chart-header-flat {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 18px 24px;
                }
                .btn-ui-flat {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 6px 14px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .btn-ui-flat:hover { background: #f1f5f9; border-color: #cbd5e1; }
                
                .pulse-indicator {
                    width: 10px; height: 10px;
                    background: #107c55;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 10px;
                    animation: pulse-ring 2s infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 124, 85, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 124, 85, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 124, 85, 0); }
                }

                .text-violet { color: #8b5cf6 !important; }
                .bg-violet-subtle { background-color: #f5f3ff !important; color: #7c3aed !important; border: 1px solid #ddd6fe; }
                .border-violet { border-left-color: #8b5cf6 !important; }
                .bg-yellow-subtle { background-color: #fffbeb !important; color: #d97706 !important; border: 1px solid #fef3c7; }
                
                .scan-table { font-size: 0.8rem; }
                .scan-table thead th {
                    background: #f8fafc;
                    color: #475569;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.65rem;
                    letter-spacing: 1px;
                    padding: 12px 10px;
                    border-bottom: 2px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .serial-text {
                    font-family: 'Monaco', 'Consolas', monospace;
                    background: #f1f5f9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                }
                .table-scroll {
                    max-height: 500px;
                    overflow-y: auto;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Overview</h3>
                    <p className="text-muted small mb-0">MKFF Dashboard • Full System Monitoring</p>
                </div>
                <div className="btn-ui-flat d-flex align-items-center">
                    <span className="pulse-indicator"></span> SYSTEM LIVE
                </div>
            </div>

            {/* --- 3x2 CARDS GRID (REORDERED) --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0f172a' }}>
                        <span className="label-caps">Total Scanned Units</span>
                        <h3 className="value-bold">{coreProductionUnits}</h3>
                        <span className="badge-flat bg-dark text-white">{calculatePercentage(coreProductionUnits)} Share</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0ea5e9' }}>
                        <span className="label-caps text-info">For Scanning Queue</span>
                        <h3 className="value-bold">{forScanningUnitsCount}</h3>
                        <span className="badge-flat bg-info bg-opacity-10 text-info">{calculatePercentage(forScanningUnitsCount)} Pending</span>
                    </div>
                </div>
                {/* --- IN PROGRESS (NILIPAT SA TAAS / 3rd Position) --- */}
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#fbbf24' }}>
                        <span className="label-caps text-warning">In Progress (WIP)</span>
                        <h3 className="value-bold">{overallMetrics.pendingUnits}</h3>
                        <span className="badge-flat bg-yellow-subtle">{calculatePercentage(overallMetrics.pendingUnits)} Capacity</span>
                    </div>
                </div>
                {/* --- COMPLETED (NILIPAT SA BABA / 4th Position) --- */}
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#10b981' }}>
                        <span className="label-caps text-success">Completed (Yield)</span>
                        <h3 className="value-bold">{overallMetrics.completedUnits}</h3>
                        <span className="badge-flat bg-success bg-opacity-10 text-success">{calculatePercentage(overallMetrics.completedUnits)} Rate</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#ef4444' }}>
                        <span className="label-caps text-danger">Total Defects (NG)</span>
                        <h3 className="value-bold text-danger">{overallMetrics.ngUnits}</h3>
                        <span className="badge-flat bg-danger bg-opacity-10 text-danger">{calculatePercentage(overallMetrics.ngUnits)} Failure</span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro border-violet" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('approval')}>
                        <span className="label-caps text-violet">Pending QA Approval</span>
                        <h3 className="value-bold text-violet">{overallMetrics.pendingApprovalUnits}</h3>
                        <span className="badge-flat bg-violet-subtle">Needs Validation</span>
                    </div>
                </div>
            </div>

            {/* --- CHART SECTION --- */}
            <div className="chart-wrapper-flat mb-4">
                <div className="chart-header-flat d-flex justify-content-between align-items-center">
                    <span className="label-caps m-0">{currentChartTitle}</span>
                    <div className="d-flex gap-2">
                        <button className="btn-ui-flat" onClick={exportChartAsImage}><i className="bi bi-download me-2"></i>EXPORT</button>
                        <div className="btn-group">
                            <button className="btn-ui-flat border-end-0" onClick={prevChart}>PREV</button>
                            <button className="btn-ui-flat" onClick={nextChart}>NEXT</button>
                        </div>
                    </div>
                </div>
                <div className="p-4" ref={chartRef}>
                    <div style={{ minHeight: '400px' }}>
                        {dashboardView === 'bar' ? (
                            <StationBarChart logs={logs} stations={stations} calculateMetrics={calculateMetrics} />
                        ) : (
                            <UnitPieChart metrics={overallMetrics} title="" />
                        )}
                    </div>
                </div>
            </div>

            {/* --- FULL LIST: FOR SCANNING UNITS --- */}
            <div className="chart-wrapper-flat">
                <div className="chart-header-flat d-flex justify-content-between align-items-center">
                    <span className="label-caps m-0">Units Pending Scanning (Full Registry)</span>
                    <span className="badge bg-info text-dark fw-bold px-3">{forScanningUnitsCount} Units Found</span>
                </div>
                <div className="table-responsive table-scroll">
                    <table className="table table-hover align-middle mb-0 scan-table">
                        <thead>
                            <tr>
                                <th>MODEL</th>
                                <th>REVISION</th>
                                <th>BASE UNIT</th>
                                <th>ASSEMBLY</th>
                                <th>DEVICE SERIAL</th>
                                <th>ACCESSORY</th>
                                <th>STATUS</th>
                                <th>REMARKS</th>
                                <th>TIME DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forScanningLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                                        No units are currently pending for scanning.
                                    </td>
                                </tr>
                            ) : (
                                forScanningLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="fw-bold">{log.model || 'N/A'}</td>
                                        <td>{log.revision || 'N/A'}</td>
                                        <td>{log.base_unit_kitting_no || 'N/A'}</td>
                                        <td>{log.assembly_no || 'N/A'}</td>
                                        <td><span className="serial-text">{log.device_serial_no}</span></td>
                                        <td>{log.accessory_kitting_no || 'N/A'}</td>
                                        <td>
                                            <span className="badge bg-info-subtle text-info border border-info border-opacity-25 px-3 py-1 rounded-pill">
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="text-muted small italic">{log.remarks || '---'}</td>
                                        <td className="text-muted small">
                                            {new Date(log.created_at).toLocaleDateString()} | {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}