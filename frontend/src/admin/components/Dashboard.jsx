import React, { useRef, useEffect, useState, useMemo } from 'react'; 
import { UnitPieChart } from './UnitPieChart'; 
import { StationBarChart } from './StationBarChart'; 
import html2canvas from 'html2canvas'; 

// --- CONFIGURATIONS ---

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

const DELAY_REASONS = {
    "PCB Pairing": {
        L1: "Header connector non-90° seating",
        L2: "PCB leads soldering rework needed",
        L3: "Component batch mismatch on floor"
    },
    "Integrated Board Test": {
        L1: "Test fixture probe cleaning required",
        L2: "Integrated Level Test alignment issue",
        L3: "Physical damage on test jig pins"
    },
    "Main Board Conformal Coating": {
        L1: "Nozzle cleaning / Air bubble clearing",
        L2: "Drying oven tray congestion",
        L3: "Material stock-out (Coating supply)"
    },
    "RTV Application": {
        L1: "Manual application inconsistency",
        L2: "Extended curing due to humidity",
        L3: "Dispenser machine mechanical jam"
    },
    "Casing/Harnessing": {
        L1: "Tight fitment / Casing alignment",
        L2: "Harness connector shortage on bin",
        L3: "Operator fatigue / Manpower shortage"
    },
    "Complete Unit Test/Calibration": {
        L1: "Voltage calibration drift (Ref: 115V)",
        L2: "LoRa / Energy Meter physical loose contact",
        L3: "Reference 'Golden Unit' sample damaged"
    },
    "Pre BI Hi-Pot Test": {
        L1: "Safety cable insulation manual checking",
        L2: "Leakage current threshold adjustment",
        L3: "High-voltage safety probe malfunction"
    },
    "Burn-in Testing": {
        L1: "Burn-in time requirement pending",
        L2: "Unit flickering observation needed",
        L3: "Burn-in rack power socket failure"
    },
    "Sealing": {
        L1: "Sealant pre-heating delay",
        L2: "Gasket misalignment during press",
        L3: "Heater element physical wear-out"
    },
    "Post BI Hi-Pot Test": {
        L1: "Residual charge discharge time",
        L2: "Post-burn-in connector wear",
        L3: "Test module isolation failure"
    },
    "Final Functional/Connectivity Test": {
        L1: "Antenna/Connectivity pairing lag",
        L2: "Manual reset button responsiveness",
        L3: "Firmware batch inconsistency on units"
    },
    "Label Sticker Attachment": {
        L1: "Label printer ribbon replacement",
        L2: "Missing mandatory warning labels",
        L3: "Label feeder machine mechanical jam"
    },
    "FVI": {
        L1: "Cosmetic smudge / cleaning delay",
        L2: "Detailed inspection of visual defects",
        L3: "Missing physical QC inspector stamp"
    },
    "Packing": {
        L1: "Manual insertion of inserts/manuals",
        L2: "Carton box assembly congestion",
        L3: "Weight scale mechanical calibration"
    },
    "QC Stamping": {
        L1: "Final verification document delay",
        L2: "Minor rework sorting activity",
        L3: "Final Auditor shift transition delay"
    }
};

// --- HELPERS ---

const formatAgingTime = (totalMinutes) => {
    if (totalMinutes < 60) return `${Math.round(totalMinutes)} mins`;
    if (totalMinutes < 1440) { 
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);
        return `${hours}h ${mins}m`;
    }
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    return `${days}d ${hours}h`;
};

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
    const [qrValue, setQrValue] = useState(''); 
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedStationCause, setSelectedStationCause] = useState(null); // State para sa Delay Modal

    const handleQrInput = (val) => {
        setQrValue(val);
        const parts = val.split(/[|]+/); 
        const assemblyFromQR = parts.find(p => p.trim().toUpperCase().startsWith('ASSY-'))?.trim();
        if (assemblyFromQR) {
            const matchedUnit = logs.find(l => l.assembly_no?.toLowerCase() === assemblyFromQR.toLowerCase());
            if (matchedUnit) {
                setSelectedUnit(matchedUnit);
                setQrValue('');
            }
        }
    };

    const getDelayInfo = (stationName, minutes) => {
        let descriptiveName = stationName;
        if (stationName.toLowerCase().startsWith('station')) {
            const num = parseInt(stationName.replace(/\D/g, ''));
            if (num > 0 && num <= processStations.length) {
                descriptiveName = processStations[num - 1];
            }
        }
        const reasons = DELAY_REASONS[descriptiveName] || { 
            L1: "Floor processing lag", 
            L2: "Station manual rework", 
            L3: "Major production bottleneck" 
        };
        const threshold = DELAY_THRESHOLDS_MINUTES[stationName] || 10;
        if (minutes > threshold * 3) return { reason: reasons.L3, level: 'CRITICAL', color: 'text-danger' };
        if (minutes > threshold * 2) return { reason: reasons.L2, level: 'MODERATE', color: 'text-warning' };
        if (minutes > threshold) return { reason: reasons.L1, level: 'MINOR', color: 'text-info' };
        return { reason: "Normal Flow", level: 'STABLE', color: 'text-success' };
    };

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
            if (!acc[sName]) acc[sName] = { name: sName, count: 0, maxAging: 0, isSlow: false, items: [] };
            
            const lastUpdate = new Date(unit.updated_at || unit.created_at).getTime();
            const now = new Date().getTime();
            const minutesInStation = Math.max(0, (now - lastUpdate) / (1000 * 60));
            const threshold = DELAY_THRESHOLDS_MINUTES[sName] || 10;
            
            acc[sName].count += 1;
            acc[sName].items.push({ ...unit, minutesInStation });
            
            if (minutesInStation > acc[sName].maxAging) acc[sName].maxAging = minutesInStation;
            
            if (sName === 'FOR SCANNING UNITS') {
                if (acc[sName].count > 8) acc[sName].isSlow = true;
            } else {
                if (minutesInStation > threshold || acc[sName].count > 8) acc[sName].isSlow = true;
            }
            return acc;
        }, {});

        return Object.values(groups).sort((a, b) => {
            if (a.isSlow !== b.isSlow) return a.isSlow ? -1 : 1;
            return b.count - a.count;
        });
    }, [logs]);

    const forScanningUnitsCount = useMemo(() => logs.filter(l => l.status === 'For Scanning').length, [logs]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return logs.filter(l => l.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
    }, [logs, searchTerm]);

    const stats = useMemo(() => {
        const coreProductionUnits = overallMetrics.completedUnits + overallMetrics.pendingUnits + overallMetrics.ngUnits + overallMetrics.pendingApprovalUnits; 
        const total = coreProductionUnits + forScanningUnitsCount;
        const getPct = (value) => total === 0 ? '0.0%' : ((value / total) * 100).toFixed(1) + '%';
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
        if (!chartRef.current) return;
        html2canvas(chartRef.current, { allowTaint: true, useCORS: true, backgroundColor: "#ffffff", scale: 2 }).then(canvas => {
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
                .icon-bg-box { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.1rem; }
                .go-icon-link { position: absolute; top: 15px; right: 15px; width: 45px; height: 32px; background: #8b5cf6; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 0.7rem; font-weight: bold; transition: background 0.2s; }
                .label-caps { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .value-bold { font-size: 2rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1; }
                .badge-pct { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 8px; }
                .search-container { position: relative; width: 300px; }
                .qr-container { position: relative; width: 180px; }
                .search-icon-inside { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
                .search-input-pro { padding-left: 38px !important; background-color: #f1f5f9; border: 1px solid transparent; }
                .qr-input-pro { padding-left: 38px !important; background-color: #eef2ff; border: 2px solid #8b5cf6; }
                .fixed-scanning-table { height: 350px; overflow-y: auto; border-radius: 0 0 16px 16px; }
                .btn-view-cause { font-size: 0.65rem; font-weight: bold; padding: 2px 10px; border-radius: 5px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; transition: 0.2s; }
                .btn-view-cause:hover { background: #f8fafc; color: #000; border-color: #cbd5e1; }
                .modal-blur { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Overview</h3>
                    <p className="text-muted small mb-0">MKFF Dashboard • Full System Monitoring</p>
                </div>
                
                <div className="d-flex gap-3 align-items-center">
                    {newReportsToday > 0 && (
                        <div className="d-flex align-items-center bg-danger text-white px-3 py-1 rounded-pill shadow-sm" style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', height: '32px' }} onClick={() => setActiveTab('reports')}>
                            <i className="bi bi-file-earmark-text-fill me-2"></i> {newReportsToday} NEW REPORT TODAY
                        </div>
                    )}
                    <div className="qr-container">
                        <i className="bi bi-qr-code-scan search-icon-inside text-primary"></i>
                        <input type="text" className="form-control form-control-sm rounded-pill qr-input-pro shadow-sm" placeholder="Scan QR..." value={qrValue} onChange={(e) => handleQrInput(e.target.value)} />
                    </div>
                    <div className="search-container">
                        <i className="bi bi-search search-icon-inside"></i>
                        <input type="text" className="form-control form-control-sm rounded-pill search-input-pro shadow-sm" placeholder="Manual Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                                {searchResults.map(unit => (
                                    <div key={unit.id} className="p-3 border-bottom" style={{cursor:'pointer'}} onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}>
                                        <div className="fw-bold text-dark d-flex justify-content-between">
                                            <span>{unit.assembly_no}</span>
                                            <i className="bi bi-arrow-right-short"></i>
                                        </div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>Model: {unit.model} • <span className="fw-bold text-uppercase">{unit.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0f172a' }}>
                        <div className="icon-bg-box bg-dark bg-opacity-10 text-dark"><i className="bi bi-cpu"></i></div>
                        <span className="label-caps">Total Scanned Units</span>
                        <h3 className="value-bold">{stats.coreProductionUnits}</h3>
                        <div className="badge-pct bg-dark text-white">{stats.pct.scanned} Share</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#0ea5e9' }}>
                        <div className="icon-bg-box bg-info bg-opacity-10 text-info"><i className="bi bi-qr-code-scan"></i></div>
                        <span className="label-caps text-info">For Scanning Queue</span>
                        <h3 className="value-bold">{forScanningUnitsCount}</h3>
                        <div className="badge-pct bg-info bg-opacity-10 text-info">{stats.pct.forScanning} Pending</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#fbbf24' }}>
                        <div className="icon-bg-box bg-warning bg-opacity-10 text-warning"><i className="bi bi-clock-history"></i></div>
                        <span className="label-caps text-warning">In Progress (WIP)</span>
                        <h3 className="value-bold">{overallMetrics.pendingUnits}</h3>
                        <div className="badge-pct bg-warning bg-opacity-10 text-warning">{stats.pct.wip} Capacity</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#10b981' }}>
                        <div className="icon-bg-box bg-success bg-opacity-10 text-success"><i className="bi bi-check-circle"></i></div>
                        <span className="label-caps text-success">Completed (Yield)</span>
                        <h3 className="value-bold">{overallMetrics.completedUnits}</h3>
                        <div className="badge-pct bg-success bg-opacity-10 text-success">{stats.pct.completed} Rate</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#ef4444' }}>
                        <div className="icon-bg-box bg-danger bg-opacity-10 text-danger"><i className="bi bi-exclamation-octagon"></i></div>
                        <span className="label-caps text-danger">Total Defects (NG)</span>
                        <h3 className="value-bold text-danger">{overallMetrics.ngUnits}</h3>
                        <div className="badge-pct bg-danger bg-opacity-10 text-danger">{stats.pct.ng} Failure</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro" style={{ borderLeftColor: '#8b5cf6' }}>
                        <button className="go-icon-link shadow-sm" onClick={() => setActiveTab('approval')}>
                            GO <i className="bi bi-arrow-right-short ms-1"></i>
                        </button>
                        <div className="icon-bg-box bg-primary bg-opacity-10 text-primary" style={{color: '#8b5cf6'}}><i className="bi bi-shield-check"></i></div>
                        <span className="label-caps" style={{ color: '#8b5cf6' }}>Pending QA Approval</span>
                        <h3 className="value-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.pendingApprovalUnits}</h3>
                        <div className="badge-pct" style={{backgroundColor: '#f5f3ff', color: '#7c3aed'}}>{stats.pct.approval} Validation</div>
                    </div>
                </div>
            </div>

            {/* STATION DELAYED ANALYTICS */}
            <div className="bg-white border rounded-4 overflow-hidden shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                    <span className="label-caps m-0">Station Delayed Analytics</span>
                    <span className="badge bg-dark text-white rounded-pill">{bottleneckData.length} Active Areas</span>
                </div>
                <div className="table-responsive fixed-scanning-table">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="table-light sticky-top">
                            <tr>
                                <th className="py-3 ps-4">STATION NAME</th>
                                <th className="text-center">CURRENT LOAD</th>
                                <th>FLOW PERFORMANCE & PROBABLE CAUSE</th>
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
                                    const delayInfo = getDelayInfo(station.name, station.maxAging);

                                    return (
                                        <tr key={station.name}>
                                            <td className="ps-4 fw-bold text-dark">
                                                {station.isSlow ? <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i> : <i className="bi bi-check-circle-fill text-success me-2"></i>}
                                                {station.name}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-1 ${station.isSlow ? 'bg-danger' : 'bg-primary'}`}>{station.count} Units</span>
                                            </td>
                                            <td style={{ width: '40%' }}>
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span className="text-muted">
                                                        {station.name === 'FOR SCANNING UNITS' ? `Queue: ${station.count}` : `Max Aging: ${formatAgingTime(station.maxAging)}`}
                                                    </span>
                                                    {station.isSlow && (
                                                        <div className="d-flex gap-2 align-items-center">
                                                            <span className={`fw-bold ${delayInfo.color}`} style={{fontSize: '0.65rem'}}>LEVEL: {delayInfo.level}</span>
                                                            <button className="btn-view-cause" onClick={() => setSelectedStationCause(station)}>
                                                                VIEW CAUSE
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="progress mb-2" style={{ height: '6px', borderRadius: '4px' }}>
                                                    <div className={`progress-bar ${station.isSlow ? (delayInfo.level === 'CRITICAL' ? 'bg-danger' : 'bg-warning') : 'bg-success'}`} style={{ width: `${intensityPct}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <span className={`badge border ${station.isSlow ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-success-subtle text-success border-success-subtle'}`}>
                                                    {station.isSlow ? 'BOTTLENECK' : 'STABLE'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* UNIT DELAY CAUSE MODAL */}
            {selectedStationCause && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-blur" style={{ zIndex: 1400 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden border-0" style={{ width: '90%', maxWidth: '650px' }}>
                        <div className="p-3 d-flex justify-content-between align-items-center bg-dark text-white">
                            <h6 className="mb-0 fw-bold"><i className="bi bi-search me-2 text-danger"></i>ROOT CAUSE ANALYSIS: {selectedStationCause.name}</h6>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedStationCause(null)}></button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="alert alert-warning border-0 bg-warning-subtle d-flex align-items-start mb-4">
                                <i className="bi bi-megaphone-fill me-2 fs-5"></i>
                                <div>
                                    <div className="fw-bold">ACTION REQUIRED:</div>
                                    <div className="small">Supervisor must check the station floor for material shortages or operator assistance. Please clear aging units to maintain yield.</div>
                                </div>
                            </div>
                            
                            <div className="table-responsive">
                                <table className="table table-sm align-middle" style={{fontSize: '0.8rem'}}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>ASSEMBLY NO.</th>
                                            <th>AGING</th>
                                            <th>LEVEL</th>
                                            <th>PROBABLE CAUSE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedStationCause.items.map((unit, idx) => {
                                            const unitDelay = getDelayInfo(selectedStationCause.name, unit.minutesInStation);
                                            return (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{unit.assembly_no}</td>
                                                    <td>{formatAgingTime(unit.minutesInStation)}</td>
                                                    <td>
                                                        <span className={`badge ${unitDelay.color} bg-light border border-${unitDelay.color.replace('text-', '')}`} style={{fontSize: '0.6rem'}}>
                                                            {unitDelay.level}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted" style={{fontSize: '0.75rem'}}>{unitDelay.reason}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-3 bg-light border-top text-end">
                            <button className="btn btn-outline-dark rounded-pill fw-bold px-4" onClick={() => setSelectedStationCause(null)}>CLOSE ANALYSIS</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHARTS SECTION */}
            <div className="bg-white border rounded-4 overflow-hidden mb-5 shadow-sm">
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

            {/* UNIT TRACKING MODAL */}
            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1300 }}>
                    <div className="bg-white rounded-4 shadow-lg overflow-hidden border-0" style={{ width: '90%', maxWidth: '500px' }}>
                        <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
                            <h6 className="mb-0 fw-bold"><i className="bi bi-cpu me-2"></i>TRACKING: {selectedUnit.assembly_no}</h6>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="p-2 px-3 bg-light rounded-2 mb-4 border small d-flex justify-content-between">
                                <span><b>MODEL:</b> {selectedUnit.model}</span>
                                <span className={`badge ${getStatusBadgeClass(selectedUnit.status)}`}>{selectedUnit.status}</span>
                            </div>
                            <div className="process-timeline px-2">
                                {processStations.map((station, idx) => {
                                    const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
                                    const unitStatus = selectedUnit.status?.toLowerCase() || '';
                                    const isDone = idx < currentStationIdx || (idx === currentStationIdx && (unitStatus.includes('completed') || unitStatus.includes('finished')));
                                    const isCurrent = idx === currentStationIdx;
                                    return (
                                        <div key={idx} className="position-relative ps-4 mb-4" style={{ borderLeft: idx === processStations.length - 1 ? 'none' : `2px solid ${isDone ? '#198754' : '#dee2e6'}` }}>
                                            <div className="position-absolute rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: isDone ? '#198754' : (isCurrent ? '#ffc107' : '#dee2e6'), left: '-7px', top: '4px', zIndex: 2 }}></div>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className={`fw-bold mb-0 ${isDone || isCurrent ? 'text-dark' : 'text-muted opacity-50'}`} style={{fontSize: '0.85rem'}}>{idx + 1}. {station}</div>
                                                    <div className="small text-muted" style={{fontSize: '0.65rem'}}>{isDone ? 'STATION COMPLETED' : (isCurrent ? 'IN PROGRESS' : 'PENDING')}</div>
                                                </div>
                                                {isCurrent && <span className="badge bg-warning text-dark" style={{fontSize: '0.55rem'}}>CURRENT</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-3 bg-light border-top d-flex gap-2">
                            <button className="btn btn-primary w-100 rounded-pill fw-bold" onClick={() => handleGoToStation(selectedUnit)}>GO TO LOCATION</button>
                            <button className="btn btn-outline-dark w-100 rounded-pill fw-bold" onClick={() => setSelectedUnit(null)}>CLOSE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}