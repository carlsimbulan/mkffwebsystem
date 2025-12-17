import React, { useRef, useEffect, useState, useMemo } from 'react'; 
import { UnitPieChart } from './UnitPieChart'; 
import { StationBarChart } from './StationBarChart'; 
import html2canvas from 'html2canvas'; 

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success-subtle text-success border border-success-subtle';
    if (statusText.includes('no good')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (statusText.includes('pending approval')) return 'bg-primary-subtle text-primary border border-primary-subtle'; 
    if (statusText.includes('in progress')) return 'bg-yellow-subtle text-warning border border-yellow-subtle'; 
    if (statusText.includes('scanning')) return 'bg-info-subtle text-info border border-info-subtle';
    return 'bg-light text-secondary border';
};

export function Dashboard({
    logs = [],
    stations = [],
    calculateMetrics,
    overallMetrics, 
    setActiveTab,
    dashboardView,
    nextChart,
    prevChart,
    handleMonitorStation,
    newReportsToday,
    setHighlightedUnitId
}) {
    
    const chartRef = useRef(null); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUnit, setSelectedUnit] = useState(null);

    // 1. MEMOIZED LOGS FILTERING
    const forScanningLogs = useMemo(() => 
        logs.filter(l => l.status === 'For Scanning'), 
    [logs]);

    const forScanningUnitsCount = forScanningLogs.length;

    // Search Logic para sa Global Search Results
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return logs.filter(l => 
            l.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 8);
    }, [logs, searchTerm]);

    // 2. MEMOIZED METRICS CALCULATION (WITH PERCENTAGES)
    const stats = useMemo(() => {
        const coreProductionUnits = 
            overallMetrics.completedUnits + 
            overallMetrics.pendingUnits + 
            overallMetrics.ngUnits + 
            overallMetrics.pendingApprovalUnits; 

        const total = coreProductionUnits + forScanningUnitsCount;

        const getPct = (value) => {
            if (total === 0) return '0.0%';
            return ((value / total) * 100).toFixed(1) + '%';
        };

        return {
            coreProductionUnits,
            totalUnits: total,
            pct: {
                scanned: getPct(coreProductionUnits),
                forScanning: getPct(forScanningUnitsCount),
                wip: getPct(overallMetrics.pendingUnits),
                completed: getPct(overallMetrics.completedUnits),
                ng: getPct(overallMetrics.ngUnits),
                approval: getPct(overallMetrics.pendingApprovalUnits)
            }
        };
    }, [overallMetrics, forScanningUnitsCount]);

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

    const handleGoToStation = (unit) => {
        if (!unit.station) return;
        setHighlightedUnitId?.(unit.id); 
        handleMonitorStation(unit.station); 
        setSelectedUnit(null);
    };

    const currentChartTitle = dashboardView === 'bar' ? 'STATION OUTPUT' : 'STATUS DISTRIBUTION';

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                .stat-card-pro {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 22px; height: 100%; border-left: 5px solid #334155;
                }
                .label-caps {
                    font-size: 0.65rem; font-weight: 800; color: #64748b;
                    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block;
                }
                .value-bold {
                    font-size: 2rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1;
                }
                .badge-pct {
                    font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;
                }
                .search-container { position: relative; width: 320px; }
                .search-icon-inside { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
                .search-input-pro { 
                    padding-left: 38px !important; background-color: #f1f5f9; border: 1px solid transparent; 
                    transition: all 0.2s; 
                }
                .search-input-pro:focus { background-color: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                .search-item-result { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: background 0.1s; }
                .search-item-result:hover { background-color: #f8fafc; }
                .fixed-scanning-table { height: 320px; overflow-y: auto; border-radius: 0 0 16px 16px; }
                .process-step { padding: 12px 15px; border-left: 3px solid #e2e8f0; position: relative; margin-left: 15px; }
                .process-step.done { border-left-color: #10b981; }
                .process-step.current-progressing { border-left-color: #fbbf24; }
                .process-step.current-ready { border-left-color: #10b981; }
                .process-step.ng { border-left-color: #ef4444; }
                .step-dot { position: absolute; left: -9px; top: 18px; width: 15px; height: 15px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; }
                .done .step-dot, .current-ready .step-dot { background: #10b981; }
                .current-progressing .step-dot { background: #fbbf24; }
                .ng .step-dot { background: #ef4444; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Overview</h3>
                    <p className="text-muted small mb-0">MKFF Dashboard • Full System Monitoring</p>
                </div>
                
                <div className="d-flex gap-3 align-items-center">
                    <div className="search-container">
                        <i className="bi bi-search search-icon-inside"></i>
                        <input 
                            type="text" 
                            className="form-control form-control-sm rounded-pill search-input-pro shadow-sm" 
                            placeholder="Search Assembly Number..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                                {searchResults.map(unit => (
                                    <div 
                                        key={unit.id} 
                                        className="search-item-result"
                                        onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}
                                    >
                                        <div className="fw-bold text-dark">{unit.assembly_no}</div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>Model: {unit.model} • <span className="text-primary">{unit.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="btn-ui-flat d-flex align-items-center text-dark fw-bold small">
                        <i className="bi bi-broadcast text-success me-2"></i> SYSTEM LIVE
                    </div>
                </div>
            </div>

            {/* --- CARDS GRID WITH PERCENTAGES --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0f172a' }}>
                        <span className="label-caps">Total Scanned Units</span>
                        <h3 className="value-bold">{stats.coreProductionUnits}</h3>
                        <div className="badge-pct bg-dark text-white">{stats.pct.scanned} Share</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0ea5e9' }}>
                        <span className="label-caps text-info">For Scanning Queue</span>
                        <h3 className="value-bold">{forScanningUnitsCount}</h3>
                        <div className="badge-pct bg-info bg-opacity-10 text-info">{stats.pct.forScanning} Pending</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#fbbf24' }}>
                        <span className="label-caps text-warning">In Progress (WIP)</span>
                        <h3 className="value-bold">{overallMetrics.pendingUnits}</h3>
                        <div className="badge-pct bg-warning bg-opacity-10 text-warning">{stats.pct.wip} Capacity</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#10b981' }}>
                        <span className="label-caps text-success">Completed (Yield)</span>
                        <h3 className="value-bold">{overallMetrics.completedUnits}</h3>
                        <div className="badge-pct bg-success bg-opacity-10 text-success">{stats.pct.completed} Rate</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#ef4444' }}>
                        <span className="label-caps text-danger">Total Defects (NG)</span>
                        <h3 className="value-bold text-danger">{overallMetrics.ngUnits}</h3>
                        <div className="badge-pct bg-danger bg-opacity-10 text-danger">{stats.pct.ng} Failure</div>
                    </div>
                </div>
                <div className="col-md-4" onClick={() => setActiveTab('approval')} style={{ cursor: 'pointer' }}>
                    <div className="stat-card-pro" style={{ borderLeftColor: '#8b5cf6' }}>
                        <span className="label-caps" style={{ color: '#8b5cf6' }}>Pending QA Approval</span>
                        <h3 className="value-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.pendingApprovalUnits}</h3>
                        <div className="badge-pct" style={{backgroundColor: '#f5f3ff', color: '#7c3aed'}}>{stats.pct.approval} Validation</div>
                    </div>
                </div>
            </div>

            {/* --- CHART SECTION --- */}
            <div className="bg-white border rounded-4 overflow-hidden mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <span className="label-caps m-0">{currentChartTitle}</span>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={exportChartAsImage}><i className="bi bi-download me-1"></i> EXPORT</button>
                        <div className="btn-group">
                            <button className="btn btn-sm btn-outline-secondary" onClick={prevChart}><i className="bi bi-chevron-left"></i></button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={nextChart}><i className="bi bi-chevron-right"></i></button>
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

            {/* --- TABLE: PENDING SCANNING --- */}
            <div className="bg-white border rounded-4 overflow-hidden shadow-sm mb-5">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <span className="label-caps m-0">Units Pending Scanning</span>
                    <span className="badge bg-info text-dark rounded-pill">{forScanningUnitsCount} Units Total</span>
                </div>
                <div className="table-responsive fixed-scanning-table">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light sticky-top">
                            <tr>
                                <th className="py-3 ps-4">MODEL</th>
                                <th>ASSEMBLY NO.</th>
                                <th>STATUS</th>
                                <th className="pe-4">TIME DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forScanningLogs.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No pending units for scanning.</td></tr>
                            ) : (
                                forScanningLogs.map(log => ( 
                                    <tr key={log.id}>
                                        <td className="fw-bold ps-4">{log.model}</td>
                                        <td className="text-primary fw-bold"><code>{log.assembly_no}</code></td>
                                        <td><span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span></td>
                                        <td className="text-muted small pe-4">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- UNIT TRACKER MODAL --- */}
            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(15, 23, 42, 0.7)', zIndex: 1200 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden" style={{ width: '95%', maxWidth: '500px' }}>
                        <div className="bg-dark p-3 d-flex justify-content-between align-items-center">
                            <h6 className="text-white mb-0 fw-bold"><i className="bi bi-cpu me-2"></i>TRACKING: {selectedUnit.assembly_no}</h6>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            <div className="bg-light p-3 rounded-3 mb-4 border small">
                                <div className="row g-2">
                                    <div className="col-6"><b>MODEL:</b> {selectedUnit.model}</div>
                                    <div className="col-6"><b>STATUS:</b> <span className={`badge ${getStatusBadgeClass(selectedUnit.status)}`}>{selectedUnit.status}</span></div>
                                </div>
                            </div>

                            {processStations.map((station, idx) => {
                                const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
                                const isDoneBefore = idx < currentStationIdx;
                                const isCurrent = idx === currentStationIdx;
                                const unitStatus = selectedUnit.status?.toLowerCase() || '';
                                const isNG = isCurrent && unitStatus.includes('no good');
                                const isCompletedHere = isCurrent && unitStatus.includes('completed');
                                
                                let stepClass = "";
                                let subText = "Pending Station";
                                let textColor = "text-muted";

                                if (isDoneBefore) { stepClass = "done"; subText = "STATION COMPLETED"; textColor = "text-success"; }
                                else if (isNG) { stepClass = "ng"; subText = "DEFECT DETECTED (NG)"; textColor = "text-danger"; }
                                else if (isCompletedHere) { stepClass = "current-ready"; subText = "READY TO NEXT STATION"; textColor = "text-success"; }
                                else if (isCurrent) { stepClass = "current-progressing"; subText = "IN PROGRESS"; textColor = "text-warning"; }

                                return (
                                    <div key={idx} className={`process-step ${stepClass}`}>
                                        <div className="step-dot"></div>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className={`fw-bold mb-0 ${isCurrent || isDoneBefore ? 'text-dark' : 'text-muted opacity-50'}`} style={{fontSize: '0.85rem'}}>
                                                    {idx + 1}. {station}
                                                </div>
                                                <div className={`fw-bold small ${textColor}`} style={{fontSize: '0.65rem'}}>
                                                    {subText}
                                                </div>
                                            </div>
                                            {isCurrent && <span className="badge bg-dark rounded-pill" style={{fontSize: '0.55rem'}}>CURRENT</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 bg-light border-top d-flex gap-2">
                            <button className="btn btn-primary w-100 rounded-pill fw-bold" onClick={() => handleGoToStation(selectedUnit)}>GO TO UNIT LOCATION</button>
                            <button className="btn btn-outline-dark w-100 rounded-pill fw-bold" onClick={() => setSelectedUnit(null)}>CLOSE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}