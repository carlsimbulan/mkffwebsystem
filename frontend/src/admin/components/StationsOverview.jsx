import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const allStatuses = ['All', 'In Progress', 'Completed', 'No Good (NG)', 'Pending Approval', 'For Scanning'];

const formatTimestamp = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(isoString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
};

// FIXED: Pinatibay ang mga kulay para hindi mag-invisible sa Overall History
const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success-subtle text-success border border-success-subtle';
    if (statusText.includes('no good')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    
    // Violet for Pending Approval - Siniguradong may contrast
    if (statusText.includes('pending approval')) return 'bg-primary-subtle text-primary border border-primary-subtle'; 
    
    if (statusText.includes('in progress')) return 'bg-yellow-subtle text-warning border border-yellow-subtle'; 
    
    // Cyan/Info for Scanning
    if (statusText.includes('scanning')) return 'bg-info-subtle text-info border border-info-subtle';
    
    return 'bg-light text-secondary border';
};

// --- SUB-COMPONENT: STATION MONITOR ---
const StationMonitorView = ({ stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [selectedUnitProcess, setSelectedUnitProcess] = useState(null); 

    const monitorMetrics = calculateMetrics(stationMonitorId);

    const filteredLogs = useMemo(() => {
        return (monitorMetrics.stationLogs || [])
            .filter(log => log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(log => statusFilter === 'All' || log.status === statusFilter);
    }, [monitorMetrics.stationLogs, searchTerm, statusFilter]);
    
    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;
    const processName = processStations[stationIndex] || stationMonitorId;

    return (
        <div className="animate-in fade-in pb-5 container-fluid px-0">
            <style>{`
                .stat-card-pro { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; height: 100%; border-left: 5px solid #334155; }
                .label-caps { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .value-bold { font-size: 2.2rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1; }
                .text-violet { color: #6366f1 !important; }
                .bg-violet-subtle { background-color: #eef2ff !important; color: #6366f1 !important; border: 1px solid #e0e7ff; }
                .bg-yellow-subtle { background-color: #fffbeb !important; color: #d97706 !important; border: 1px solid #fef3c7; }
                
                .process-step { padding: 12px 15px; border-left: 3px solid #e2e8f0; position: relative; margin-left: 15px; transition: all 0.3s ease; }
                .process-step.done { border-left-color: #10b981; }
                .process-step.current-progressing { border-left-color: #fbbf24; }
                .process-step.current-ready { border-left-color: #10b981; }
                .process-step.ng { border-left-color: #ef4444; }
                
                .step-dot { position: absolute; left: -9px; top: 18px; width: 15px; height: 15px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; }
                .done .step-dot, .current-ready .step-dot { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
                .current-progressing .step-dot { background: #fbbf24; box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2); }
                .ng .step-dot { background: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-black text-dark mb-1 tracking-tight">{processName}</h3>
                    <p className="text-muted small mb-0">Station Insight • ID: {stationMonitorId}</p>
                </div>
                <button className="btn btn-outline-dark btn-sm px-4 fw-bold rounded-pill" onClick={() => setActiveTab('stations')}>BACK TO GRID</button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{ borderLeftColor: '#10b981' }}><span className="label-caps text-success">Completed Units</span><h3 className="value-bold">{monitorMetrics.completedUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{ borderLeftColor: '#3b82f6' }}><span className="label-caps text-primary">Yield Rate</span><h3 className="value-bold text-primary">{monitorMetrics.yieldRate}%</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{ borderLeftColor: '#fbbf24' }}><span className="label-caps text-warning">In Progress</span><h3 className="value-bold">{monitorMetrics.pendingUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{ borderLeftColor: '#ef4444' }}><span className="label-caps text-danger">Defects (NG)</span><h3 className="value-bold text-danger">{monitorMetrics.ngUnits}</h3></div></div>
            </div>

            <div className="bg-white border rounded-4 overflow-hidden">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50">
                    <h6 className="fw-bold mb-0 small text-uppercase tracking-wider">Station Feed</h6>
                    <div className="d-flex gap-2">
                        <select className="form-select form-select-sm border-0 shadow-none bg-white" style={{width:'150px'}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{allStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="text" className="form-control form-control-sm border-0 shadow-none bg-white" style={{width:'200px'}} placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="btn btn-danger btn-sm rounded-pill px-3 fw-bold" onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}>RESET</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-dark text-white text-uppercase">
                            <tr>
                                <th className="ps-4">MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th><th>DEVICE SERIAL</th><th>ACCESSORY</th><th className="text-center">STATUS</th><th>REMARKS</th><th>TIME DATE</th><th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={highlightedUnitId === log.id ? 'table-danger fw-bold' : ''}>
                                    <td className="ps-4 fw-bold">{log.model}</td><td>{log.revision}</td><td>{log.base_unit_kitting_no}</td><td><code className="text-primary fw-bold">{log.assembly_no}</code></td><td className="fw-bold">{log.device_serial_no}</td><td>{log.accessory_kitting_no}</td>
                                    <td className="text-center"><span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span></td>
                                    <td className="text-muted small italic">{log.remarks || '---'}</td><td className="small text-muted">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button className="btn btn-sm btn-outline-primary py-1 px-3 fw-bold rounded-pill" style={{fontSize:'0.7rem'}} onClick={() => setSelectedUnitProcess(log)}>DETAILS</button>
                                            <button className="btn btn-sm btn-outline-danger py-1 px-3 fw-bold rounded-pill" style={{fontSize:'0.7rem'}} onClick={() => handleEditClick(log)}>EDIT</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedUnitProcess && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(15, 23, 42, 0.7)', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white rounded-4 shadow-lg p-0 overflow-hidden" style={{ width: '95%', maxWidth: '500px' }}>
                        <div className="bg-dark p-3 d-flex justify-content-between align-items-center">
                            <h6 className="text-white mb-0 fw-bold"><i className="bi bi-cpu me-2"></i>TRACKING: {selectedUnitProcess.assembly_no}</h6>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnitProcess(null)}></button>
                        </div>
                        <div className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {processStations.map((station, idx) => {
                                const isCurrent = idx === stationIndex;
                                const isDoneBefore = idx < stationIndex;
                                const unitStatus = selectedUnitProcess.status?.toLowerCase() || '';
                                
                                const isNG = isCurrent && unitStatus.includes('no good');
                                const isCompletedHere = isCurrent && unitStatus.includes('completed');
                                
                                let stepClass = "";
                                let subText = "Pending Station";
                                let textColor = "text-muted";

                                if (isDoneBefore) {
                                    stepClass = "done";
                                    subText = "STATION COMPLETED";
                                    textColor = "text-success";
                                } else if (isNG) {
                                    stepClass = "ng";
                                    subText = "DEFECT DETECTED (NG)";
                                    textColor = "text-danger";
                                } else if (isCompletedHere) {
                                    stepClass = "current-ready";
                                    subText = "READY TO GO TO NEXT STATION";
                                    textColor = "text-success";
                                } else if (isCurrent) {
                                    stepClass = "current-progressing";
                                    subText = "IN PROGRESS";
                                    textColor = "text-warning";
                                }

                                return (
                                    <div key={idx} className={`process-step ${stepClass}`}>
                                        <div className="step-dot"></div>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className={`fw-black mb-0 ${isCurrent || isDoneBefore ? 'text-dark' : 'text-muted opacity-50'}`} style={{fontSize: '0.9rem'}}>
                                                    {idx + 1}. {station}
                                                </div>
                                                <div className={`fw-bold small ${textColor}`} style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>
                                                    {subText}
                                                </div>
                                            </div>
                                            {isCurrent && <span className="badge bg-dark rounded-pill" style={{fontSize: '0.6rem'}}>CURRENT</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 bg-light border-top">
                            <button className="btn btn-dark w-100 rounded-pill fw-bold" onClick={() => setSelectedUnitProcess(null)}>CLOSE TRACKER</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN EXPORT COMPONENT ---
export function StationsOverview({
    activeTab, stations, calculateMetrics, stationMonitorId, highlightedUnitId, setActiveTab, handleMonitorStation, handleViewHistory, handleEditClick, fetchData, allLogs, 
}) {
    const processedHistoryLogs = useMemo(() => {
        if (!allLogs) return [];
        return [...allLogs].sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
    }, [allLogs]);

    if (activeTab === "station_monitor" && stationMonitorId) {
        return <StationMonitorView {...{stationMonitorId, stations, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData}} />;
    }

    if (activeTab === "overall_history") {
        return (
            <div className="animate-in fade-in pb-5 container-fluid px-0">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                    <div>
                        <h4 className="fw-bold text-dark mb-0 tracking-tight">Production Registry (Backtrack)</h4>
                        <p className="text-muted small mb-0">Global history log across all assembly stations.</p>
                    </div>
                    <button className="btn btn-outline-dark btn-sm px-4 fw-bold rounded-pill" onClick={() => setActiveTab('stations')}>BACK TO GRID</button>
                </div>
                <div className="bg-white border rounded-4 overflow-hidden shadow-sm">
                    <div className="table-responsive" style={{maxHeight:'700px'}}>
                        <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>
                            <thead className="bg-dark text-white sticky-top">
                                <tr>
                                    <th className="ps-4 py-3">MODEL</th><th>ASSEMBLY</th><th>TYPE</th><th>STATION</th><th className="text-center">STATUS AFTER</th><th>ACTION BY</th><th className="text-end pe-4">TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedHistoryLogs.map(log => {
                                    const ts = formatTimestamp(log.timestamp || log.created_at);
                                    return (
                                        <tr key={log.id}>
                                            <td className="ps-4 fw-bold">{log.model || log.model_id}</td>
                                            <td><code className="text-primary fw-bold">{log.assembly_no}</code></td>
                                            <td className="text-muted small fw-bold">{log.action_type || 'UPDATE'}</td>
                                            <td className="fw-semibold text-dark">{log.station_name || log.station}</td>
                                            <td className="text-center">
                                                {/* FIXED: Dito lumalabas ang status badges sa history */}
                                                <span className={`badge rounded-pill px-3 py-1 ${getStatusBadgeClass(log.status_after || log.status)}`}>
                                                    {log.status_after || log.status}
                                                </span>
                                            </td>
                                            <td className="small fw-medium text-dark">{log.action_by || 'System'}</td>
                                            <td className="text-end pe-4 small text-muted">
                                                <div className="fw-bold text-dark">{ts.date}</div>
                                                <div>{ts.time}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, name: processStations[index],
    }));

    return (
        <div className="animate-in fade-in container-fluid px-0">
            <style>{`.station-card-flat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; height: 100%; border-top: 4px solid #e2e8f0; transition: all 0.2s; } .station-card-flat:hover { transform: translateY(-2px); border-color: #cbd5e1; }`}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
                <div><h4 className="fw-bold text-dark mb-0 tracking-tight">Station Control Panel</h4><p className="text-muted small mb-0">Operational status of all assembly units.</p></div>
                <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold border-0" style={{background:'#107c55'}} onClick={() => setActiveTab('overall_history')}>VIEW HISTORY</button>
            </div>
            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    const isRunning = metrics.pendingUnits > 0;
                    const isAlert = metrics.ngUnits > 0 && metrics.completedUnits === 0;
                    return (
                        <div key={station.id} className="col-md-3">
                            <div className="station-card-flat" style={{ borderTopColor: isAlert ? '#ef4444' : isRunning ? '#107c55' : '#e2e8f0' }}>
                                <h6 className="fw-black text-dark mb-1">{station.name}</h6>
                                <div className="bg-light rounded-3 p-3 my-3 border border-light-subtle">
                                    <div className="d-flex justify-content-between small fw-bold"><span>COMPLETED</span><span>{metrics.completedUnits}</span></div>
                                    <div className="d-flex justify-content-between small fw-bold mt-2 text-danger"><span>DEFECTS (NG)</span><span>{metrics.ngUnits}</span></div>
                                </div>
                                <div className="d-flex gap-2 mt-auto">
                                    <button className="btn btn-dark btn-sm rounded-pill flex-grow-1 fw-bold" onClick={() => handleMonitorStation(station.id)}>MONITOR</button>
                                    <button className="btn btn-light border btn-sm rounded-pill px-3" onClick={() => handleViewHistory(station.id)}><i className="bi bi-clock-history"></i></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}