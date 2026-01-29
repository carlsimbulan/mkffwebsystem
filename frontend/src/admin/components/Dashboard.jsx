import React, { useRef, useEffect, useState, useMemo } from 'react'; 
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
);

// --- CONFIGURATIONS ---

const DELAY_THRESHOLDS_MINUTES = {
    'Station1': 6, 'Station 1': 6, 'Station2': 8, 'Station 2': 8, 'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12, 'Station5': 15, 'Station 5': 15, 'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3, 'Station8': 0, 'Station 8': 0, 'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8, 'Station11': 22, 'Station 11': 22, 'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10, 'Station14': 8, 'Station 14': 8, 'Station15': 5, 'Station 15': 5
};

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const stationDescriptions = {
    "PCB Pairing": "Assembling boards and pairing components.",
    "Integrated Board Test": "Testing the compatibility of the three boards.",
    "Main Board Conformal Coating": "Applying protective coating to the main board.",
    "RTV Application": "Applying Room Temperature Vulcanizing sealant.",
    "Casing/Harnessing": "Assembling the unit into the casing and wire harnessing.",
    "Complete Unit Test/Calibration": "Calibrating and testing voltage accuracy.",
    "Pre BI Hi-Pot Test": "High potential safety testing before burn-in.",
    "Burn-in Testing": "Stress testing under full load conditions.",
    "Sealing": "Final sealing of the unit enclosure.",
    "Post BI Hi-Pot Test": "Secondary high voltage test after burn-in.",
    "Final Functional/Connectivity Test": "Checking final functions and network connectivity.",
    "Label Sticker Attachment": "Checking if all stickers are correctly attached.",
    "FVI": "Final Visual Inspection for physical defects.",
    "Packing": "Secure packaging of the unit for shipping.",
    "QC Stamping": "Validation of unit checklist and final QC approval."
};

const checkUnitDelay = (stationId, updatedAt) => {
    const threshold = DELAY_THRESHOLDS_MINUTES[stationId] || 10;
    const lastUpdate = new Date(updatedAt).getTime();
    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
    if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };
    if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };
    return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };
};

const hourLabel = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success-subtle text-success border-0';
    if (statusText.includes('no good') || statusText.includes('ng')) return 'bg-danger-subtle text-danger border-0';
    if (statusText.includes('pending approval')) return 'bg-primary-subtle text-primary border-0'; 
    if (statusText.includes('in progress')) return 'bg-warning-subtle text-warning border-0'; 
    if (statusText.includes('scanning')) return 'bg-info-subtle text-info border-0';
    return 'bg-light text-secondary border';
};

export function Dashboard({
    logs = [],
    stations = [],
    calculateMetrics,
    overallMetrics, 
    setActiveTab,
    handleMonitorStation,
    newReportsToday,
    setHighlightedUnitId
}) {
    
    const stepperRef = useRef(null); 
    const [searchTerm, setSearchTerm] = useState('');
    const [qrValue, setQrValue] = useState(''); 
    const [selectedUnit, setSelectedUnit] = useState(null);

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

    const scrollStepper = (direction) => {
        if (stepperRef.current) {
            const scrollAmount = 300;
            stepperRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

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

    // 🥇 Throughput Trend: Completed units per hour (last 12 hours) + delta vs previous 12 hours
    const throughputTrend = useMemo(() => {
        const now = new Date();
        const hours = 12;
        const bucketStart = new Date(now.getTime() - hours * 60 * 60 * 1000);
        bucketStart.setMinutes(0, 0, 0);

        const makeBuckets = (start, count) => {
            const arr = [];
            for (let i = 0; i < count; i++) {
                const t = new Date(start.getTime() + i * 60 * 60 * 1000);
                arr.push({ t, key: t.getTime(), count: 0 });
            }
            return arr;
        };

        const buckets = makeBuckets(bucketStart, hours + 1); // include current hour
        const bucketMap = new Map(buckets.map(b => [b.key, b]));

        const prevStart = new Date(bucketStart.getTime() - hours * 60 * 60 * 1000);
        const prevEnd = new Date(bucketStart.getTime());

        let currentTotal = 0;
        let prevTotal = 0;

        (logs || []).forEach(l => {
            const status = (l.status || '').toLowerCase();
            const isCompleted = status === 'completed' || status.includes('completed') || status.includes('ok');
            if (!isCompleted) return;

            const ts = new Date(l.updated_at || l.created_at);
            if (Number.isNaN(ts.getTime())) return;

            // current window buckets
            if (ts >= bucketStart) {
                const h = new Date(ts);
                h.setMinutes(0, 0, 0);
                const k = h.getTime();
                if (bucketMap.has(k)) {
                    bucketMap.get(k).count += 1;
                    currentTotal += 1;
                }
            }

            // previous window total
            if (ts >= prevStart && ts < prevEnd) {
                prevTotal += 1;
            }
        });

        const labels = buckets.map(b => hourLabel(b.t));
        const data = buckets.map(b => b.count);
        const deltaPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : (currentTotal > 0 ? 100 : 0);

        return { labels, data, currentTotal, prevTotal, deltaPct };
    }, [logs]);

    // 🥈 Avg Cycle Time per Station: avg minutes in-station for in-progress units vs threshold
    const cycleTimePerStation = useMemo(() => {
        const rows = (stations || []).slice(0, processStations.length).map((s, idx) => {
            const m = calculateMetrics(s.id) || {};
            const stationLogs = m.stationLogs || [];
            const inProgress = stationLogs.filter(l => (l.status || '') === 'In Progress');

            const times = inProgress
                .map(l => {
                    const ts = new Date(l.updated_at || l.created_at);
                    if (Number.isNaN(ts.getTime())) return null;
                    return (new Date().getTime() - ts.getTime()) / (1000 * 60);
                })
                .filter(v => typeof v === 'number');

            const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
            const threshold = DELAY_THRESHOLDS_MINUTES[s.id] || 10;
            return {
                id: s.id,
                name: processStations[idx] || s.id,
                avgMinutes: avg,
                thresholdMinutes: threshold,
                exceedsPct: threshold > 0 ? ((avg - threshold) / threshold) * 100 : 0,
            };
        });

        // Show worst offenders first (avg above threshold)
        rows.sort((a, b) => (b.avgMinutes - b.thresholdMinutes) - (a.avgMinutes - a.thresholdMinutes));
        return rows;
    }, [stations, calculateMetrics]);

    // 🥉 FPY (approx): Completed / (Completed + NG)
    const fpy = useMemo(() => {
        const completed = Number(overallMetrics?.completedUnits || 0);
        const ng = Number(overallMetrics?.ngUnits || 0);
        const processed = completed + ng;
        const pct = processed > 0 ? (completed / processed) * 100 : 0;
        return { completed, ng, processed, pct };
    }, [overallMetrics]);

    const handleGoToStation = (unit) => {
        if (!unit.station) return;
        setHighlightedUnitId?.(unit.id); 
        handleMonitorStation(unit.station); 
        setSelectedUnit(null);
    };

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                /* Stat Cards shrunk from 24px to 18px padding and font size reduced */
                .stat-card-pro { background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 18px; height: 100%; position: relative; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
                .icon-bg-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.1rem; }
                .label-caps { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
                .value-bold { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1; letter-spacing: -1px; }
                .badge-pct { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 5px; display: inline-block; margin-top: 8px; }
                
                .search-input-pro { padding-left: 38px !important; background-color: #f8fafc; border: 1px solid #e2e8f0; height: 40px; }
                .qr-input-pro { padding-left: 38px !important; background-color: #f5f3ff; border: 1px solid #ddd6fe; height: 40px; color: #5b21b6; }
                .modal-blur { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); }

                .stepper-nav-container { position: relative; display: flex; align-items: center; }
                .stepper-nav-btn { position: absolute; top: 30%; transform: translateY(-50%); z-index: 20; width: 32px; height: 32px; background: #fff; border: 1px solid #e2e8f0; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
                .stepper-nav-btn:hover { background: #f8fafc; color: #0f172a; }
                .btn-left { left: -10px; }
                .btn-right { right: -10px; }
                .stepper-wrapper { display: flex; justify-content: space-between; position: relative; margin-bottom: 40px; padding: 20px 10px; overflow-x: auto; padding-bottom: 30px; scrollbar-width: none; }
                .stepper-wrapper::-webkit-scrollbar { display: none; }
                .stepper-item { position: relative; display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 150px; z-index: 10; }
                .stepper-item::before { content: ""; position: absolute; top: 22px; left: -50%; width: 100%; height: 4px; background: #e2e8f0; z-index: -1; }
                .stepper-item:first-child::before { content: none; }
                .step-counter { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #fff; border: 4px solid #e2e8f0; border-radius: 50%; font-weight: 800; font-size: 0.9rem; color: #94a3b8; transition: all 0.3s ease; margin-bottom: 12px; }
                .step-name { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; text-align: center; max-width: 120px; line-height: 1.2; }
                .step-desc { font-size: 0.6rem; font-weight: 500; color: #94a3b8; text-align: center; margin-top: 4px; max-width: 130px; }
                .stepper-item.completed .step-counter { background: #10b981; border-color: #10b981; color: white; }
                .stepper-item.completed::before { background: #10b981; }
                .stepper-item.completed .step-name { color: #10b981; }
                .stepper-item.active .step-counter { border-color: #f59e0b; color: #f59e0b; box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.15); }
                .stepper-item.active .step-name { color: #0f172a; }
                .stepper-item.active .step-desc { color: #64748b; font-weight: 700; }
                .stepper-item.danger .step-counter { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
                .stepper-item.danger .step-name { color: #ef4444; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

                .analytics-card { background: #ffffff; border: 1px solid #edf2f7; border-radius: 18px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; }
                .analytics-card-header { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
                .analytics-card-body { padding: 14px 16px; }
                .kpi-pill { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; padding: 6px 10px; border-radius: 999px; border: 1px solid #e2e8f0; background: #fff; }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Intel</h3>
                    <p className="text-muted small mb-0">Live Manufacturing Lifecycle Monitoring</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                    {newReportsToday > 0 && (
                        <div className="d-flex align-items-center bg-danger text-white px-3 py-1 rounded-pill shadow-sm" style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', height: '36px' }} onClick={() => setActiveTab('reports')}>
                            <i className="bi bi-file-earmark-text-fill me-2"></i> {newReportsToday} NEW REPORT TODAY
                        </div>
                    )}
                    <div className="position-relative" style={{width: '180px'}}>
                        <i className="bi bi-qr-code-scan position-absolute start-0 ms-3 top-50 translate-middle-y text-primary"></i>
                        <input type="text" className="form-control rounded-pill qr-input-pro" placeholder="Scan QR..." value={qrValue} onChange={(e) => handleQrInput(e.target.value)} />
                    </div>
                    <div className="position-relative" style={{width: '280px'}}>
                        <i className="bi bi-search position-absolute start-0 ms-3 top-50 translate-middle-y text-muted"></i>
                        <input type="text" className="form-control rounded-pill search-input-pro" placeholder="Manual Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                                {searchResults.map(unit => (
                                    <div key={unit.id} className="p-3 border-bottom" style={{cursor:'pointer'}} onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}>
                                        <div className="fw-bold text-dark d-flex justify-content-between"><span>{unit.assembly_no}</span><i className="bi bi-chevron-right small text-muted"></i></div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{unit.model} • <span className={`fw-bold ${unit.status?.toLowerCase().includes('no good') ? 'text-danger' : 'text-primary'}`}>{unit.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f8fafc', color: '#334155' }}><i className="bi bi-cpu"></i></div>
                        <span className="label-caps">Total Scanned Units</span>
                        <h3 className="value-bold">{stats.coreProductionUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>{stats.pct.scanned} Total</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}><i className="bi bi-qr-code-scan"></i></div>
                        <span className="label-caps" style={{color: '#0ea5e9'}}>For Scanning Queue</span>
                        <h3 className="value-bold">{forScanningUnitsCount}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>{stats.pct.forScanning} Pending</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><i className="bi bi-clock-history"></i></div>
                        <span className="label-caps" style={{color: '#d97706'}}>In Progress (WIP)</span>
                        <h3 className="value-bold">{overallMetrics.pendingUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>{stats.pct.wip} Capacity</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><i className="bi bi-check-circle"></i></div>
                        <span className="label-caps" style={{color: '#16a34a'}}>Completed (Yield)</span>
                        <h3 className="value-bold">{overallMetrics.completedUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>{stats.pct.completed} Rate</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><i className="bi bi-exclamation-octagon"></i></div>
                        <span className="label-caps" style={{color: '#dc2626'}}>Total Defects (NG)</span>
                        <h3 className="value-bold text-danger">{overallMetrics.ngUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>{stats.pct.ng} Failure</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}><i className="bi bi-shield-check"></i></div>
                        <span className="label-caps" style={{ color: '#8b5cf6' }}>Pending Approval</span>
                        <h3 className="value-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.pendingApprovalUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>{stats.pct.approval} Validation</div>
                    </div>
                </div>
            </div>

            {/* 📊 Advanced Analytics (Top 3 KPIs) */}
            <div className="row g-4 mb-5 mx-1">
                {/* 🥇 Throughput Trend */}
                <div className="col-lg-6">
                    <div className="analytics-card h-100">
                        <div className="analytics-card-header d-flex justify-content-between align-items-center">
                            <div>
                                <div className="label-caps mb-0">TOP 1 — Throughput Trend</div>
                                <div className="small text-muted">Completed units per hour (last 12 hours)</div>
                            </div>
                            <span className={`kpi-pill ${throughputTrend.deltaPct < 0 ? 'text-danger' : 'text-success'}`}>
                                {throughputTrend.deltaPct < 0 ? 'DOWN' : 'UP'} {Math.abs(throughputTrend.deltaPct).toFixed(0)}%
                            </span>
                        </div>
                        <div className="analytics-card-body" style={{ height: 280 }}>
                            <Line
                                data={{
                                    labels: throughputTrend.labels,
                                    datasets: [
                                        {
                                            label: 'Completed / hour',
                                            data: throughputTrend.data,
                                            borderColor: '#0ea5e9',
                                            backgroundColor: 'rgba(14, 165, 233, 0.15)',
                                            tension: 0.35,
                                            fill: true,
                                            pointRadius: 3,
                                            pointBackgroundColor: '#0ea5e9',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0 } },
                                        y: { beginAtZero: true, ticks: { color: '#94a3b8', precision: 0 }, grid: { color: '#f1f5f9' } },
                                    },
                                }}
                            />
                        </div>
                        <div className="px-3 pb-3 small text-muted">
                            Total (12h): <strong>{throughputTrend.currentTotal}</strong> • Prev (12h): <strong>{throughputTrend.prevTotal}</strong>
                        </div>
                    </div>
                </div>

                {/* 🥈 Avg Cycle Time per Station */}
                <div className="col-lg-6">
                    <div className="analytics-card h-100">
                        <div className="analytics-card-header">
                            <div className="label-caps mb-0">TOP 2 — Average Cycle Time per Station</div>
                            <div className="small text-muted">Avg minutes in station (WIP) vs threshold</div>
                        </div>
                        <div className="analytics-card-body" style={{ height: 280 }}>
                            <Bar
                                data={{
                                    labels: cycleTimePerStation.map(r => r.name),
                                    datasets: [
                                        {
                                            label: 'Avg mins (WIP)',
                                            data: cycleTimePerStation.map(r => Number(r.avgMinutes.toFixed(1))),
                                            backgroundColor: 'rgba(245, 158, 11, 0.85)',
                                            borderRadius: 10,
                                            barThickness: 10,
                                        },
                                        {
                                            label: 'Threshold',
                                            data: cycleTimePerStation.map(r => r.thresholdMinutes),
                                            backgroundColor: 'rgba(148, 163, 184, 0.45)',
                                            borderRadius: 10,
                                            barThickness: 10,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: { legend: { position: 'bottom', labels: { color: '#64748b' } } },
                                    scales: {
                                        x: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
                                        y: { ticks: { color: '#475569', font: { size: 11, weight: '600' } }, grid: { display: false } },
                                    },
                                }}
                            />
                        </div>
                        <div className="px-3 pb-3 small text-muted">
                            Worst station: <strong>{cycleTimePerStation[0]?.name || 'N/A'}</strong>
                            {cycleTimePerStation[0] ? (
                                <> • Exceeds by <strong>{Math.max(0, cycleTimePerStation[0].exceedsPct).toFixed(0)}%</strong></>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* 🥉 FPY */}
                <div className="col-lg-12">
                    <div className="analytics-card">
                        <div className="analytics-card-header d-flex justify-content-between align-items-center">
                            <div>
                                <div className="label-caps mb-0">TOP 3 — First Pass Yield (FPY)</div>
                                <div className="small text-muted">Completed ÷ (Completed + NG)</div>
                            </div>
                            <span className="kpi-pill text-primary">FPY {fpy.pct.toFixed(1)}%</span>
                        </div>
                        <div className="analytics-card-body d-flex flex-wrap gap-3 align-items-center justify-content-between">
                            <div style={{ width: 260, height: 220, position: 'relative' }}>
                                <Doughnut
                                    data={{
                                        labels: ['Pass', 'Fail'],
                                        datasets: [
                                            {
                                                data: [Number(fpy.pct.toFixed(1)), Number((100 - fpy.pct).toFixed(1))],
                                                backgroundColor: ['#10b981', '#ef4444'],
                                                borderColor: ['#fff', '#fff'],
                                                borderWidth: 4,
                                                cutout: '72%',
                                                borderRadius: 10,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'bottom', labels: { color: '#64748b' } } },
                                    }}
                                />
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <div className="label-caps">FPY</div>
                                    <div className="fw-black" style={{ fontSize: '2rem', color: '#0f172a' }}>{fpy.pct.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex flex-wrap gap-3">
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">Processed</div>
                                        <div className="fw-black" style={{ fontSize: '1.6rem' }}>{fpy.processed}</div>
                                        <div className="small text-muted">Completed + NG</div>
                                    </div>
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">Completed</div>
                                        <div className="fw-black text-success" style={{ fontSize: '1.6rem' }}>{fpy.completed}</div>
                                        <div className="small text-muted">First-pass success</div>
                                    </div>
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">NG</div>
                                        <div className="fw-black text-danger" style={{ fontSize: '1.6rem' }}>{fpy.ng}</div>
                                        <div className="small text-muted">First-pass fail</div>
                                    </div>
                                </div>
                                <div className="small text-muted mt-2">
                                    Tip: FPY drops usually indicate checklist gaps, test failures, or rework loops in specific stations.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-blur" style={{ zIndex: 1300 }}>
                    <div className="bg-white rounded-4 shadow-2xl overflow-hidden border-0" style={{ width: '90%', maxWidth: '950px' }}>
                        <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
                            <div><h6 className="mb-0 fw-bold">Unit Process Tracker</h6><p className="mb-0" style={{fontSize: '0.7rem', opacity: 0.8}}>{selectedUnit.assembly_no} • {selectedUnit.model}</p></div>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                        </div>
                        <div className="p-4 custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 mb-4 border-0 shadow-sm">
                                <div><div className="label-caps mb-0" style={{fontSize: '0.6rem'}}>Current Status</div><span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(selectedUnit.status)}`}>{selectedUnit.status}</span></div>
                                <div className="text-end"><div className="label-caps mb-0" style={{fontSize: '0.6rem'}}>Last Station</div><div className="fw-bold text-primary small">{selectedUnit.station || 'Pending'}</div></div>
                            </div>
                            <div className="stepper-nav-container">
                                <button className="stepper-nav-btn btn-left" onClick={() => scrollStepper('left')}><i className="bi bi-chevron-left"></i></button>
                                <div className="stepper-wrapper" ref={stepperRef}>
                                    {processStations.map((station, idx) => {
                                        const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
                                        const unitStatus = selectedUnit.status?.toLowerCase() || '';
                                        const isNG = unitStatus.includes('no good') || unitStatus.includes('ng');
                                        const isDone = idx < currentStationIdx || (idx === currentStationIdx && (unitStatus.includes('completed') || unitStatus.includes('finished')));
                                        const isCurrent = idx === currentStationIdx;
                                        let stepStateClass = "";
                                        if (isDone) stepStateClass = "completed";
                                        else if (isCurrent) stepStateClass = isNG ? "danger" : "active";
                                        return (
                                            <div key={idx} className={`stepper-item ${stepStateClass}`}>
                                                <div className="step-counter">{isDone ? <i className="bi bi-check-lg"></i> : (idx + 1)}</div>
                                                <div className="step-name">{station}</div>
                                                <div className="step-desc">{stationDescriptions[station]}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="stepper-nav-btn btn-right" onClick={() => scrollStepper('right')}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                        <div className="p-3 bg-light border-top d-flex gap-2">
                            <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" style={{fontSize: '0.8rem'}} onClick={() => handleGoToStation(selectedUnit)}>LOCATE UNIT</button>
                            <button className="btn btn-outline-dark w-100 rounded-pill fw-bold py-2" style={{fontSize: '0.8rem'}} onClick={() => setSelectedUnit(null)}>DISMISS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}