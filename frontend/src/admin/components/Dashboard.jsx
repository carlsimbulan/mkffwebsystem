import React, { useRef, useEffect, useState, useMemo } from 'react'; 
import { UnitPieChart } from './UnitPieChart'; 
import { StationBarChart } from './StationBarChart'; 
import html2canvas from 'html2canvas'; 

// --- CONFIGURATION: Time thresholds per station (in minutes) ---
const DELAY_THRESHOLDS_MINUTES = {
    'Station1': 6, 'Station 1': 6,
    'Station2': 8, 'Station 2': 8,
    'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12,
    'Station5': 15, 'Station 5': 15,
    'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3,
    'Station8': 0, 'Station 8': 0,
    'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8,
    'Station11': 22, 'Station 11': 22,
    'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10,
    'Station14': 8, 'Station 14': 8,
    'Station15': 5, 'Station 15': 5
};

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

// 1. Helper para sa oras at petsa
const formatTimestamp = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(isoString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
};

// 2. Helper para sa kulay ng status badges
const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success-subtle text-success border border-success-subtle';
    if (statusText.includes('no good')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (statusText.includes('pending approval')) return 'bg-primary-subtle text-primary border border-primary-subtle'; 
    if (statusText.includes('in progress')) return 'bg-yellow-subtle text-warning border border-yellow-subtle'; 
    if (statusText.includes('scanning')) return 'bg-info-subtle text-info border border-info-subtle';
    return 'bg-light text-secondary border';
};

const getSearchHighlightStyle = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return { borderLeft: '8px solid #10b981', backgroundColor: '#f0fdf4' };
    if (statusText.includes('no good')) return { borderLeft: '8px solid #ef4444', backgroundColor: '#fef2f2' };
    if (statusText.includes('in progress')) return { borderLeft: '8px solid #f59e0b', backgroundColor: '#fffbeb' };
    return {};
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

    // --- BOTTLENECK AGGREGATION ---
    const bottleneckData = useMemo(() => {
        const activeUnits = logs.filter(l => 
            l.status?.toLowerCase().includes('in progress') || 
            l.status?.toLowerCase().includes('scanning') ||
            l.status?.toLowerCase().includes('for scanning')
        );

        const groups = activeUnits.reduce((acc, unit) => {
            let sName = unit.station;
            if (unit.status === 'For Scanning' || !unit.station || unit.station === 'For Scanning') {
                sName = 'FOR SCANNING UNITS';
            }

            if (!acc[sName]) {
                acc[sName] = { name: sName, count: 0, maxAging: 0, isSlow: false };
            }

            const lastUpdate = new Date(unit.updated_at || unit.created_at).getTime();
            const now = new Date().getTime();
            const minutesInStation = Math.max(0, (now - lastUpdate) / (1000 * 60));
            const threshold = DELAY_THRESHOLDS_MINUTES[sName] || 10;

            acc[sName].count += 1;
            if (minutesInStation > acc[sName].maxAging) {
                acc[sName].maxAging = minutesInStation;
            }

            if (sName === 'FOR SCANNING UNITS') {
                if (acc[sName].count > 8) acc[sName].isSlow = true;
            } else {
                if (minutesInStation > threshold || acc[sName].count > 8) {
                    acc[sName].isSlow = true;
                }
            }

            return acc;
        }, {});

        return Object.values(groups).sort((a, b) => {
            if (a.isSlow !== b.isSlow) return a.isSlow ? -1 : 1;
            return b.count - a.count;
        });
    }, [logs]);

    const forScanningUnitsCount = useMemo(() => 
        logs.filter(l => l.status === 'For Scanning').length, 
    [logs]);

    // --- PRODUCTION FLOW DATA: Includes In Progress, NG, and Completed units at each station ---
    const productionFlow = useMemo(() => {
        const flow = [{ name: 'FOR SCANNING', count: forScanningUnitsCount }];
        
        processStations.forEach((stationName, idx) => {
            const stationKey = `Station${idx + 1}`;
            const stationKeySpaced = `Station ${idx + 1}`;
            
            // Count every unit currently sitting at this station
            const unitsAtStation = logs.filter(l => 
                (l.station === stationKey || l.station === stationKeySpaced) && 
                l.status !== 'For Scanning'
            ).length;

            flow.push({ name: stationName, count: unitsAtStation });
        });
        
        return flow;
    }, [logs, forScanningUnitsCount]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return logs.filter(l => 
            l.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 8);
    }, [logs, searchTerm]);

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
                    position: relative;
                }
                .go-icon-link {
                    position: absolute; top: 15px; right: 15px; width: 45px; height: 32px;
                    background: #8b5cf6; color: white; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; border: none; font-size: 0.7rem; font-weight: bold;
                    transition: background 0.2s;
                }
                .go-icon-link:hover { background: #7c3aed; color: white; }
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
                .search-item-result { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: all 0.2s ease; }
                .search-item-result:hover { filter: brightness(0.95); transform: translateX(5px); }
                .fixed-scanning-table { height: 320px; overflow-y: auto; border-radius: 0 0 16px 16px; }
                .process-step { padding: 12px 15px; border-left: 3px solid #e2e8f0; position: relative; margin-left: 15px; }
                .step-dot { position: absolute; left: -9px; top: 18px; width: 15px; height: 15px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; }
                .done .step-dot, .current-ready .step-dot { background: #10b981; }
                .current-progressing .step-dot { background: #fbbf24; }
                .ng .step-dot { background: #ef4444; }

                /* Flow Tracker Styles */
                .flow-wrapper { display: flex; overflow-x: auto; padding: 20px 0; scrollbar-width: thin; gap: 0; }
                .flow-item { flex: 0 0 130px; position: relative; text-align: center; }
                .flow-line-connector { position: absolute; top: 20px; left: 50%; width: 100%; height: 2px; background: #e2e8f0; z-index: 1; }
                .flow-item:last-child .flow-line-connector { display: none; }
                .flow-circle { 
                    width: 40px; height: 40px; border-radius: 50%; background: white; border: 2px solid #cbd5e1;
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;
                    position: relative; z-index: 2; font-weight: 800; font-size: 0.85rem; transition: all 0.3s;
                }
                .flow-item.active .flow-circle { background: #3b82f6; color: white; border-color: #3b82f6; }
                .flow-item.active .flow-line-connector { background: #3b82f6; }
                .flow-name { font-size: 0.6rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; padding: 0 5px; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Overview</h3>
                    <p className="text-muted small mb-0">MKFF Dashboard • Full System Monitoring</p>
                </div>
                
                        <div className="d-flex gap-3 align-items-center">
            {/* --- REPORT INDICATOR (NEW) --- */}
            {newReportsToday > 0 && (
                <div 
                    className="d-flex align-items-center bg-danger text-white px-3 py-1 rounded-pill shadow-sm animate-pulse" 
                    style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', height: '32px' }}
                    onClick={() => setActiveTab('reports')}
                >
                    <i className="bi bi-file-earmark-text-fill me-2"></i>
                    {newReportsToday} NEW REPORT{newReportsToday > 1 ? 'S' : ''} TODAY
                </div>
            )}

            <div className="search-container" style={{ position: 'relative', width: '320px' }}>
                <i className="bi bi-search search-icon-inside"></i>
                
                <input 
                    type="text" 
                    className="form-control form-control-sm rounded-pill search-input-pro shadow-sm" 
                    placeholder="Search Assembly Number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingRight: '35px' }} // Space for the clear button
                />

                {/* Clear Button - Only shows when there is text */}
                {searchTerm && (
                    <i 
                        className="bi bi-x-circle-fill position-absolute" 
                        style={{ 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            cursor: 'pointer', 
                            color: '#94a3b8',
                            zIndex: 5
                        }}
                        onClick={() => setSearchTerm('')}
                    ></i>
                )}
                {/* ... (Dito yung existing searchResults mapping mo, wag galawin) */}
            
                {searchResults.length > 0 && (
                    <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                        {searchResults.map(unit => (
                            <div 
                                key={unit.id} 
                                className="search-item-result"
                                /* Removed the dynamic style here */
                                onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}
                            >
                                <div className="fw-bold text-dark d-flex justify-content-between">
                                    <span>{unit.assembly_no}</span>
                                    <i className="bi bi-arrow-right-short"></i>
                                </div>
                                <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                    Model: {unit.model} • <span className="fw-bold text-uppercase">{unit.status}</span>
                                </div>
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
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#8b5cf6' }}>
                        <button 
                            className="go-icon-link shadow-sm" 
                            onClick={() => setActiveTab('approval')}
                        >
                            GO <i className="bi bi-arrow-right-short ms-1"></i>
                        </button>
                        <span className="label-caps" style={{ color: '#8b5cf6' }}>Pending QA Approval</span>
                        <h3 className="value-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.pendingApprovalUnits}</h3>
                        <div className="badge-pct" style={{backgroundColor: '#f5f3ff', color: '#7c3aed'}}>
                            {stats.pct.approval} Validation
                        </div>
                    </div>
                </div>
            </div>

            {/* --- VISUAL PRODUCTION FLOW TRACKER --- */}
            <div className="bg-white border rounded-4 shadow-sm mb-4 overflow-hidden">
                <div className="p-3 border-bottom bg-light">
                    <span className="label-caps m-0">Live Station Flow Tracker (Current Unit Distribution)</span>
                </div>
                <div className="flow-wrapper px-3">
                    {productionFlow.map((step, idx) => (
                        <div key={idx} className={`flow-item ${step.count > 0 ? 'active' : ''}`}>
                            <div className="flow-line-connector"></div>
                            <div className="flow-circle">
                                {step.count}
                            </div>
                            <span className="flow-name">{step.name}</span>
                        </div>
                    ))}
                </div>
            </div>

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

            <div className="bg-white border rounded-4 overflow-hidden shadow-sm mb-5">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <span className="label-caps m-0">Station Bottleneck Analytics</span>
                    <span className="badge bg-dark text-white rounded-pill">{bottleneckData.length} Active Areas</span>
                </div>
                <div className="table-responsive fixed-scanning-table">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light sticky-top">
                            <tr>
                                <th className="py-3 ps-4">STATION NAME</th>
                                <th className="text-center">CURRENT LOAD</th>
                                <th>LOAD INTENSITY</th>
                                <th className="pe-4 text-end">FLOW STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bottleneckData.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No active units in the production line.</td></tr>
                            ) : (
                                bottleneckData.map((station) => {
                                    const maxCountAcrossLine = Math.max(...bottleneckData.map(d => d.count));
                                    const intensityPct = (station.count / maxCountAcrossLine) * 100;

                                    return (
                                        <tr key={station.name}>
                                            <td className="ps-4 fw-bold text-dark">
                                                {station.isSlow ? 
                                                    <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i> : 
                                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                }
                                                {station.name}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-1 ${station.isSlow ? 'bg-danger' : 'bg-primary'}`}>
                                                    {station.count} Units
                                                </span>
                                            </td>
                                            <td style={{ width: '35%' }}>
                                                <div className="small text-muted mb-1">
                                                    {station.name === 'FOR SCANNING UNITS' 
                                                        ? `Queue Density: ${station.count} units waiting` 
                                                        : `Aging: ${Math.round(station.maxAging)} mins max`}
                                                </div>
                                                <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                                    <div 
                                                        className={`progress-bar ${station.isSlow ? 'bg-danger' : 'bg-success'}`} 
                                                        style={{ width: `${intensityPct}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end">
                                                {station.isSlow ? (
                                                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                                        {station.name === 'FOR SCANNING UNITS' ? 'HIGH VOLUME QUEUE' : 'SLOW / BOTTLENECK'}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle">STABLE FLOW</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

{selectedUnit && (
    <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
        style={{ 
            background: 'rgba(0, 0, 0, 0.5)', 
            backdropFilter: 'blur(8px)',       // Standard blur effect
            WebkitBackdropFilter: 'blur(8px)', 
            zIndex: 1300 
        }}
    >
        <div className="bg-white rounded-4 shadow-lg overflow-hidden border-0" style={{ width: '90%', maxWidth: '500px' }}>
            
            {/* Header: Standard Primary Blue */}
            <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
                <h6 className="mb-0 fw-bold">
                    <i className="bi bi-cpu me-2"></i>TRACKING: {selectedUnit.assembly_no}
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
            </div>

            <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Info Bar */}
                <div className="p-2 px-3 bg-light rounded-2 mb-4 border small d-flex justify-content-between">
                    <span><b>MODEL:</b> {selectedUnit.model}</span>
                    <span className={`badge ${getStatusBadgeClass(selectedUnit.status)}`}>{selectedUnit.status}</span>
                </div>

                <div className="process-timeline px-2">
                    {processStations.map((station, idx) => {
    const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
    const unitStatus = selectedUnit.status?.toLowerCase() || '';
    
    // Status Logic
    const isUnitFullyDone = unitStatus.includes('completed') || unitStatus.includes('finished');
    const isNoGood = unitStatus.includes('no good') || unitStatus === 'ng';

    // Check kung ito ang active/last station recorded
    const isCurrentStation = idx === currentStationIdx;
    
    // Ang station ay "Done" kung ito ay nakalipas na (previous) 
    // O kung ito ang current station at ang status ay "Completed"
    const isDone = idx < currentStationIdx || (isCurrentStation && isUnitFullyDone);

    let subText = "Pending";
    let textColorClass = "text-muted";
    let statusColor = "#dee2e6"; // Default Gray

    if (isDone) {
        subText = "STATION COMPLETED";
        textColorClass = "text-success";
        statusColor = "#198754"; // Green
    } else if (isCurrentStation) {
        if (isNoGood) {
            subText = "NG";
            textColorClass = "text-danger";
            statusColor = "#dc3545"; // Red
        } else {
            subText = "IN PROGRESS";
            textColorClass = "text-warning";
            statusColor = "#ffc107"; // Yellow
        }
    }

    // Line color logic
    const lineBorderColor = isDone ? '#198754' : (isCurrentStation && isNoGood ? '#dc3545' : '#e9ecef');

    return (
        <div key={idx} className="position-relative ps-4 mb-4" 
            style={{ borderLeft: idx === processStations.length - 1 ? 'none' : `2px solid ${lineBorderColor}` }}>
            
            {/* Timeline Dot */}
            <div className="position-absolute rounded-circle" 
                style={{ 
                    width: '12px', height: '12px', 
                    backgroundColor: statusColor, 
                    left: '-7px', top: '4px', zIndex: 2 
                }}>
            </div>

            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <div className={`fw-bold mb-0 ${isDone || isCurrentStation ? 'text-dark' : 'text-muted opacity-50'}`} style={{fontSize: '0.85rem'}}>
                        {idx + 1}. {station}
                    </div>
                    <div className={`fw-bold small ${textColorClass}`} style={{fontSize: '0.65rem'}}>
                        {subText}
                    </div>
                </div>

                {/* Badge: Laging lalabas basta ito ang currentStationIdx */}
                {isCurrentStation && (
                    <span className="badge rounded-pill" 
                          style={{
                              fontSize: '0.55rem', 
                              backgroundColor: statusColor, // Sasunod sa kulay ng status (Green, Red, or Yellow)
                              color: isNoGood || isUnitFullyDone ? 'white' : 'black' // White text for Green/Red, Black for Yellow
                          }}>
                        CURRENT
                    </span>
                )}
            </div>
        </div>
    );
})}
                </div>
            </div>

            {/* Footer: Standard Buttons */}
            <div className="p-3 bg-light border-top d-flex gap-2">
                <button className="btn btn-primary w-100 rounded-pill fw-bold" onClick={() => handleGoToStation(selectedUnit)}>
                    GO TO LOCATION
                </button>
                <button className="btn btn-outline-dark w-100 rounded-pill fw-bold" onClick={() => setSelectedUnit(null)}>
                    CLOSE
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
}