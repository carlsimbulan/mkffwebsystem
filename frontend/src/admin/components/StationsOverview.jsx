import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const DELAY_THRESHOLDS_MINUTES = {
    'Station1': 6, 'Station 1': 6, 'Station2': 8, 'Station 2': 8, 'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12, 'Station5': 15, 'Station 5': 15, 'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3, 'Station8': 0, 'Station 8': 0, 'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8, 'Station11': 22, 'Station 11': 22, 'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10, 'Station14': 8, 'Station 14': 8, 'Station15': 5, 'Station 15': 5
};

const allStatuses = ['All', 'In Progress', 'Completed', 'No Good (NG)', 'Pending Approval', 'For Scanning'];
const ITEMS_PER_PAGE = 10;

const formatTimestamp = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(isoString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
};

const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success text-white';
    if (statusText.includes('no good') || statusText.includes('ng')) return 'bg-danger text-white';
    if (statusText.includes('in progress')) return 'bg-warning text-dark';
    if (statusText.includes('pending approval')) return 'bg-primary text-white'; 
    if (statusText.includes('scanning')) return 'bg-info text-white';
    return 'bg-light text-secondary border';
};

const checkUnitDelay = (stationId, updatedAt) => {
    const threshold = DELAY_THRESHOLDS_MINUTES[stationId] || 10;
    const lastUpdate = new Date(updatedAt).getTime();
    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
    if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };
    if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };
    return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };
};

const StationMonitorView = ({ stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [selectedUnitProcess, setSelectedUnitProcess] = useState(null); 
    const [expandedStepIdx, setExpandedStepIdx] = useState(null);
    const [stationAiAnalysis, setStationAiAnalysis] = useState(null);
    const [isStationAiLoading, setIsStationAiLoading] = useState(false);
    const [summaryExpanded, setSummaryExpanded] = useState({
        root: false,
        impact: false,
        actions: false,
    });

    const monitorMetrics = calculateMetrics(stationMonitorId);

    const filteredLogs = useMemo(() => {
        return (monitorMetrics.stationLogs || [])
            .filter(log => log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(log => statusFilter === 'All' || log.status === statusFilter);
    }, [monitorMetrics.stationLogs, searchTerm, statusFilter]);
    
    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;
    const processName = processStations[stationIndex] || stationMonitorId;
    const hasGeminiKey = Boolean(process.env.REACT_APP_GEMINI_API_KEY);

    // Helper to convert raw AI text into short summary buckets
    const parseStationSummary = (text) => {
        if (!text) return {};

        // Split on line breaks and bullet markers (*) to be robust
        const pieces = text
            .split(/\n|\r|\*/)
            .map(l => l.trim().replace(/^[-•\d.)\s]+/, '')) // remove leading bullets/numbers
            .filter(Boolean);

        const take = (idx) => pieces[idx] || '';

        return {
            rootCause: take(0),
            impact: take(1),
            actions: take(2),
            raw: text,
        };
    };

    // Use the stable REST `v1` API directly.
    // Your key currently returns 404 for models on `v1beta`, so we:
    // 1) List models from `v1`
    // 2) Pick the first model that supports `generateContent`
    // 3) Call `generateContent` on that model
    const GEMINI_V1_BASE = "https://generativelanguage.googleapis.com/v1";

    const pickGenerativeModelName = async (apiKey) => {
        const res = await fetch(`${GEMINI_V1_BASE}/models?key=${encodeURIComponent(apiKey)}`);
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`ListModels failed (${res.status}): ${body || res.statusText}`);
        }
        const data = await res.json();
        const models = Array.isArray(data.models) ? data.models : [];
        const model = models.find(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"));
        if (!model?.name) throw new Error("No available Gemini model supports generateContent for this API key.");
        return model.name; // e.g. "models/gemini-2.0-flash"
    };

    // 🔎 Station-level diagnostic (aggregated across all units in this station)
    const fetchStationDiagnosis = async () => {
        setIsStationAiLoading(true);
        setStationAiAnalysis(null);
        try {
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Missing REACT_APP_GEMINI_API_KEY. Add it to `frontend/.env` and restart the dev server (then hard-refresh the page).");
            }

            const modelName = await pickGenerativeModelName(apiKey);

            const stationLogs = monitorMetrics.stationLogs || [];
            const totalUnits = stationLogs.length;

            let delayedUnits = 0;
            let totalDelayMinutes = 0;
            let maxDelayMinutes = 0;

            stationLogs.forEach(log => {
                if (log.status === 'In Progress') {
                    const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at);
                    if (d.isDelayed) {
                        delayedUnits += 1;
                        totalDelayMinutes += d.minutes;
                        if (d.minutes > maxDelayMinutes) maxDelayMinutes = d.minutes;
                    }
                }
            });

            const avgDelayMinutes = delayedUnits > 0 ? (totalDelayMinutes / delayedUnits) : 0;
            const thresholdMinutes = DELAY_THRESHOLDS_MINUTES[stationMonitorId] || 10;

            const prompt = `You are a Senior Manufacturing Engineer at MKFF.
            Analyze delay patterns for this production station and summarize the situation very concisely.

            Station name: ${processName}
            Station ID: ${stationMonitorId}
            Standard delay threshold (minutes): ${thresholdMinutes}
            Total units in this station (current view): ${totalUnits}
            Units currently delayed beyond threshold: ${delayedUnits}
            Average delay of delayed units (minutes): ${avgDelayMinutes.toFixed(1)}
            Maximum observed delay (minutes): ${maxDelayMinutes.toFixed(1)}

            Use the fact that the station has a checklist and previous unit histories, and that delays here usually mean units are staying longer than the configured time window.
            Focus the analysis on why this specific station tends to have frequent or long delays, not on a single unit.

            Respond with EXACTLY 3 very short lines (no extra text, no introductions, no labels):
            Line 1: Most probable root-cause patterns for delays in this station (max 18 words).
            Line 2: Impact on throughput and downstream stations (max 18 words).
            Line 3: Practical corrective and preventive actions for operators and engineers (max 18 words).`;

            const genRes = await fetch(`${GEMINI_V1_BASE}/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                }),
            });

            if (!genRes.ok) {
                const body = await genRes.text().catch(() => "");
                throw new Error(`generateContent failed (${genRes.status}): ${body || genRes.statusText}`);
            }

            const genData = await genRes.json();
            const text =
                genData?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join("") ||
                genData?.candidates?.[0]?.output ||
                "";

            if (!text) throw new Error("Empty AI response.");

            setStationAiAnalysis(text);
        } catch (err) {
            console.error("Gemini Station Error:", err);
            setStationAiAnalysis("Station diagnostic failed: " + err.message);
        } finally {
            setIsStationAiLoading(false);
        }
    };

    return (
        <div className="pb-5 container-fluid px-0">
            <style>{`
                .stat-card-pro { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; height: 100%; border-left: 5px solid #198754; }
                .table thead th { background-color: #1e293b !important; color: #ffffff !important; font-weight: 600; padding: 12px 15px; }
                .modal-step { padding: 15px 20px; border-left: 2px solid #e9ecef; position: relative; cursor: pointer; }
                .modal-dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: #dee2e6; border: 2px solid white; z-index: 2; }
                .done .modal-dot { background: #198754; }
                .current .modal-dot { background: #0d6efd; }
                .tracker-table th { background: #f1f5f9; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; text-transform: uppercase; font-weight: 800; text-align: center; font-size: 0.7rem; }
                .tracker-table td { padding: 8px 8px; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 0.7rem; }
                .diagnostic-card-minimal { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
                .delay-row { background-color: #fff5f5 !important; }
                .station-summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
                @media (max-width: 768px) {
                    .station-summary-grid { grid-template-columns: 1fr; }
                }
                .station-summary-chip { border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0; background: #f9fafb; min-height: 64px; display: flex; flex-direction: column; justify-content: flex-start; }
                .station-summary-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
                .station-summary-text { font-size: 0.8rem; font-weight: 600; color: #0f172a; }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-1">{processName}</h3>
                    <p className="text-muted small mb-0">Operational View • ID: {stationMonitorId}</p>
                </div>
                <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>
            </div>

            {/* 🔍 Station-level delay diagnosis */}
            <div className="diagnostic-card-minimal p-3 mb-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <div className="fw-bold text-dark small uppercase tracking-wider">ROOT CAUSE DELAY ANALYTICS</div>
                        <div className="small text-muted">Short AI summary of delay patterns and recommended actions for this station.</div>
                    </div>
                    <button
                        className="btn btn-outline-dark btn-sm fw-bold shadow-sm px-4 rounded-pill"
                        onClick={fetchStationDiagnosis}
                        disabled={isStationAiLoading}
                    >
                        {isStationAiLoading ? 'ANALYZING...' : 'ANALYZE STATION'}
                    </button>
                </div>
                <div className="p-3 bg-white rounded border text-dark small shadow-inner">
                    {stationAiAnalysis ? (() => {
                        const summary = parseStationSummary(stationAiAnalysis);
                        const textOrFallback = (s) => (s && s.trim().length > 0 ? s : 'No data.');
                        const makeChip = (label, key, fullText) => {
                            const max = 120;
                            const normalized = textOrFallback(fullText);
                            const isLong = normalized.length > max;
                            const isOpen = summaryExpanded[key];
                            const displayText = isOpen || !isLong ? normalized : normalized.slice(0, max - 1) + '…';
                            return (
                                <div className="station-summary-chip" key={key}>
                                    <div className="station-summary-label d-flex justify-content-between align-items-center">
                                        <span>{label}</span>
                                        {isLong && (
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 m-0 small text-primary text-decoration-none"
                                                onClick={() =>
                                                    setSummaryExpanded(prev => ({
                                                        ...prev,
                                                        [key]: !prev[key],
                                                    }))
                                                }
                                            >
                                                {isOpen ? 'Hide' : 'View full'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="station-summary-text">
                                        {displayText}
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div className="station-summary-grid">
                                {makeChip('Root cause', 'root', summary.rootCause)}
                                {makeChip('Impact', 'impact', summary.impact)}
                                {makeChip('Recommended actions', 'actions', summary.actions)}
                            </div>
                        );
                    })() : (
                        <div className="text-muted italic text-center py-1">
                            Click "ANALYZE STATION" to get AI summary of why this station is delayed and what to do next.
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro"><span className="text-muted small fw-bold uppercase">Completed</span><h3 className="fw-bold text-success mt-1">{monitorMetrics.completedUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#0d6efd'}}><span className="text-muted small fw-bold uppercase">Yield Rate</span><h3 className="fw-bold text-primary mt-1">{monitorMetrics.yieldRate}%</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#ffc107'}}><span className="text-muted small fw-bold uppercase">In Progress</span><h3 className="fw-bold text-warning mt-1">{monitorMetrics.pendingUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#dc3545'}}><span className="text-muted small fw-bold uppercase">No Good (NG)</span><h3 className="fw-bold text-danger mt-1">{monitorMetrics.ngUnits}</h3></div></div>
            </div>

            <div className="bg-white border rounded-2 overflow-hidden shadow-sm">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-bold small text-muted text-uppercase">Station Logs</span>
                    <div className="d-flex gap-2">
                        <select className="form-select form-select-sm" style={{width:'160px'}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{allStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="text" className="form-control form-control-sm" style={{width:'200px'}} placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="btn btn-secondary btn-sm px-3 fw-bold" onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}>RESET</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th className="ps-4">MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th>
                                <th>DEVICE SERIAL</th><th>ACCESSORY</th><th className="text-center">STATUS</th>
                                <th>REMARKS</th><th>LAST MOVEMENT</th><th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => {
                                const delay = log.status === 'In Progress' ? checkUnitDelay(stationMonitorId, log.updated_at || log.created_at) : { isDelayed: false };
                                return (
                                    <tr key={log.id} className={delay.isDelayed ? 'delay-row' : ''}>
                                        <td className="ps-4 fw-bold">{log.model}</td>
                                        <td>{log.revision}</td>
                                        <td>{log.base_unit_kitting_no}</td>
                                        <td>
                                            <code className="text-primary fw-bold">{log.assembly_no}</code>
                                            {delay.isDelayed && <i className="bi bi-exclamation-triangle-fill text-danger ms-2" title={`Delayed: ${delay.level}`}></i>}
                                        </td>
                                        <td className="fw-bold">{log.device_serial_no}</td>
                                        <td>{log.accessory_kitting_no}</td>
                                        <td className="text-center"><span className={`badge rounded-1 px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span></td>
                                        <td className="text-muted small italic">{log.remarks || '---'}</td>
                                        <td className="small text-muted">{new Date(log.updated_at || log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="text-center">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button className="btn btn-sm btn-primary px-3 fw-bold" onClick={() => setSelectedUnitProcess(log)}>
                                                    DETAILS
                                                </button>
                                                <button className="btn btn-sm btn-danger px-3 fw-bold" onClick={() => handleEditClick(log)}>EDIT</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUnitProcess && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '900px' }}>
                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-primary shadow-sm">
                            <div><h5 className="mb-0 fw-bold">Process Tracker & Analysis</h5><p className="mb-0 small opacity-75">{selectedUnitProcess.assembly_no}</p></div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnitProcess(null)}></button>
                        </div>

                        <div className="p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            <div className="process-timeline mt-4 ps-2">
                                {processStations.map((station, idx) => {
                                    const isCurrent = idx === stationIndex;
                                    const isDoneBefore = idx < stationIndex;
                                    const unitStatus = selectedUnitProcess.status?.toLowerCase() || '';
                                    const isCompletedHere = isCurrent && unitStatus.includes('completed');
                                    const isNG = isCurrent && unitStatus.includes('no good');
                                    const isExpanded = expandedStepIdx === idx;

                                    let stationData = null;
                                    if (idx === 0 && selectedUnitProcess.header_seated_90_deg) stationData = { "Header Seated": selectedUnitProcess.header_seated_90_deg, "Soldering": selectedUnitProcess.leads_properly_soldered };
                                    else if (idx === 1 && selectedUnitProcess.integrated_board_level_test1) stationData = { "Board 1": selectedUnitProcess.integrated_board_level_test1, "Board 2": selectedUnitProcess.integrated_board_level_test2, "Board 3": selectedUnitProcess.integrated_board_level_test3 };
                                    else if (idx === 5 && selectedUnitProcess.voltage) stationData = { "LoRa": selectedUnitProcess.lora_module, "Volt": selectedUnitProcess.voltage + "V", "Verdict": selectedUnitProcess.go_no_go };

                                    let stepClass = isDoneBefore || isCompletedHere ? 'done' : (isNG ? 'ng' : (isCurrent ? 'current' : ''));
                                    return (
                                        <div key={idx} className={`modal-step ${stepClass}`} onClick={() => stationData && setExpandedStepIdx(isExpanded ? null : idx)}>
                                            <div className="modal-dot"></div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div><div className="fw-bold small">{idx + 1}. {station}</div></div>
                                                {stationData && <span className="badge bg-light text-dark border" style={{fontSize: '0.6rem'}}>VIEW DATA</span>}
                                            </div>
                                            {isExpanded && stationData && (
                                                <div className="tracker-checklist-box">
                                                    <table className="tracker-table table-sm">
                                                        <thead><tr>{Object.keys(stationData).map(k => <th key={k}>{k}</th>)}</tr></thead>
                                                        <tbody>
                                                            <tr>{Object.values(stationData).map((v, i) => (
                                                                <td key={i} className={["NO GO", "FAIL"].includes(v) ? 'text-danger fw-bold' : 'text-success'}>{v || 'N/A'}</td>
                                                            ))}</tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-3 bg-light border-top text-end">
                            <button className="btn btn-secondary px-5 fw-bold py-2 rounded shadow-sm" onClick={() => setSelectedUnitProcess(null)}>DISMISS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export function StationsOverview({
    activeTab, stations, calculateMetrics, stationMonitorId, highlightedUnitId, setActiveTab, handleMonitorStation, handleViewHistory, handleEditClick, fetchData, allLogs, 
}) {
    const [historySearch, setHistorySearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredHistory = useMemo(() => {
        if (!allLogs) return [];
        return allLogs.filter(log => {
            const matchesSearch = log.assembly_no?.toLowerCase().includes(historySearch.toLowerCase());
            if (!startDate && !endDate) return matchesSearch;
            const logDate = new Date(log.timestamp || log.created_at);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0); 
            if (end) end.setHours(23, 59, 59, 999);
            return matchesSearch && (!start || logDate >= start) && (!end || logDate <= end);
        }).sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
    }, [allLogs, historySearch, startDate, endDate]);

    // ✨ PAGINATION LOGIC RESTORED
    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredHistory, currentPage]);

    if (activeTab === "station_monitor" && stationMonitorId) {
        return <StationMonitorView {...{stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData}} />;
    }

    if (activeTab === "overall_history") {
        return (
            <div className="pb-5 container-fluid px-0">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                    <div><h4 className="fw-bold text-dark mb-0">Production History</h4></div>
                    <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>
                </div>
                <div className="bg-light p-3 rounded-2 border mb-4 d-flex flex-wrap gap-3 align-items-end mx-2 shadow-sm">
                    <div className="flex-grow-1"><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Assembly No.</label><input type="text" className="form-control form-control-sm shadow-none" placeholder="Search..." value={historySearch} onChange={(e) => {setHistorySearch(e.target.value); setCurrentPage(1);}} /></div>
                    <div><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Start</label><input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} /></div>
                    <div><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>End</label><input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} /></div>
                    <button className="btn btn-danger btn-sm px-3 fw-bold shadow-sm" onClick={() => { setHistorySearch(''); setStartDate(''); setEndDate(''); setCurrentPage(1); }}>RESET</button>
                </div>
                <div className="bg-white border rounded-2 overflow-hidden mx-2 shadow-sm">
                    <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>
                        <thead className="table-dark">
                            <tr><th>MODEL</th><th>ASSEMBLY</th><th>TYPE</th><th>STATION</th><th className="text-center">STATUS</th><th className="text-end pe-4">TIMESTAMP</th></tr>
                        </thead>
                        <tbody>
                            {paginatedHistory.map(log => {
                                const ts = formatTimestamp(log.timestamp || log.created_at);
                                return (
                                    <tr key={log.id}>
                                        <td className="ps-4 fw-bold">{log.model || log.model_id}</td>
                                        <td><code className="text-primary fw-bold">{log.assembly_no}</code></td>
                                        <td className="small text-muted fw-bold">{log.action_type || 'UPDATE'}</td>
                                        <td className="fw-semibold">{log.station_name || log.station}</td>
                                        <td className="text-center"><span className={`badge rounded-1 px-3 ${getStatusBadgeClass(log.status_after || log.status)}`}>{log.status_after || log.status}</span></td>
                                        <td className="text-end pe-4 small text-muted"><strong>{ts.date}</strong><br/>{ts.time}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {/* ✨ PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top">
                            <span className="small text-muted">Page {currentPage} of {totalPages} ({filteredHistory.length} total logs)</span>
                            <div className="btn-group shadow-sm">
                                <button className="btn btn-white btn-sm border" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>PREV</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} className={`btn btn-sm border ${currentPage === i + 1 ? 'btn-dark' : 'btn-white'}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                <button className="btn btn-white btn-sm border" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>NEXT</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, name: processStations[index],
    }));

    return (
        <div className="container-fluid px-0">
            <style>{`
                .station-card-flat { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; position: relative; }
                .delay-card { border: 2px solid #dc3545 !important; background-color: #fff5f5; }
                .delay-tag { position: absolute; top: 10px; right: 10px; color: #dc3545; font-size: 0.6rem; font-weight: 800; border: 1px solid #dc3545; padding: 1px 6px; border-radius: 4px; }
                .metric-row { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
                .animate-pulse { animation: pulse-red 1.5s infinite !important; }
            `}</style>
            
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
                <div><h4 className="fw-bold text-dark mb-0">Station Control Panel</h4><p className="text-muted small mb-0">Operational real-time monitoring dashboard.</p></div>
                <button className="btn btn-dark btn-sm px-4 py-2 shadow-sm fw-bold" onClick={() => setActiveTab('overall_history')}>OVERALL HISTORY</button>
            </div>
            
            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    const delayedCount = (metrics.stationLogs || []).filter(log => log.status === 'In Progress' && checkUnitDelay(station.id, log.updated_at || log.created_at).isDelayed).length;
                    return (
                        <div key={station.id} className="col-md-3">
                            <div className={`station-card-flat shadow-sm ${delayedCount > 0 ? 'delay-card' : ''}`}>
                                {delayedCount > 0 && <div className="delay-tag animate-pulse">DELAYED ({delayedCount})</div>}
                                <div className="mb-3"><span className="text-muted small fw-bold uppercase">ID: {station.id}</span><h6 className="fw-bold text-dark text-truncate mt-1 uppercase">{station.name}</h6></div>
                                <div className="mb-4">
                                    <div className="metric-row"><span>COMPLETED</span><span className="text-success">{metrics.completedUnits}</span></div>
                                    <div className="metric-row"><span>IN PROGRESS</span><span className="text-primary">{metrics.pendingUnits}</span></div>
                                    <div className="metric-row"><span>NO GOOD (NG)</span><span className="text-danger">{metrics.ngUnits}</span></div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-dark btn-sm flex-grow-1 fw-bold shadow-sm" onClick={() => handleMonitorStation(station.id)}>MONITOR</button>
                                    <button className="btn btn-outline-secondary btn-sm px-3 shadow-sm" onClick={() => handleViewHistory(station.id)}><i className="bi bi-clock-history"></i></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}