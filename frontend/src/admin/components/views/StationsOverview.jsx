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

const checkUnitDelay = (stationId, updatedAt, thresholds = {}) => {
    const threshold = thresholds[stationId] || 10;
    const lastUpdate = new Date(updatedAt).getTime();
    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
    if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };
    if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };
    return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };
};

// Helper function to validate voltage tolerance (±1% of 115V = 113.85 to 116.15)
const getVoltageErrorStatus = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return true;
    return num < 113.85 || num > 116.15;
};

// Helper function to determine if a value represents an error
const isErrorValue = (value, key) => {
    if (value === null || value === undefined || value === "N/A") return true;
    
    const stringValue = String(value).toUpperCase();
    const errorStrings = ["NOT DETECTED", "NO GO", "FAIL", "N/A", "NO PASSED", "NOT PASSED", "NOT COMPLETE", "FAILED", "BLINKING", "OFF", "RED"];
    
    if (errorStrings.some(error => stringValue.includes(error))) return true;
    
    if (key && key.includes("LED STATUS") && stringValue !== "SOLID GREEN") return true;
    
    if (key && (key.includes("V(") || key.includes("L1") || key.includes("L2") || key.includes("L3"))) {
        const numericValue = parseFloat(stringValue.replace("V", ""));
        return getVoltageErrorStatus(numericValue);
    }
    
    return false;
};

const StationMonitorView = ({ stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData, dynamicDelayThresholds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [selectedUnitProcess, setSelectedUnitProcess] = useState(null); 
    const [expandedStepIdx, setExpandedStepIdx] = useState(null);
    const [stationAiAnalysis, setStationAiAnalysis] = useState('');
    const [isStationAiLoading, setIsStationAiLoading] = useState(false);
    
    // State for unit details modal
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showChecklist, setShowChecklist] = useState(false);
    const [expandedStation, setExpandedStation] = useState(null);

    // Enhanced AI output formatting for new 3-section format
    const formatStationOutput = (text) => {
        if (!text) return '';
        
        const cleanedAnalysis = text.replace(/\*\*/g, '').replace(/\*/g, '');
        
        let diagnosis = '';
        let forecast = '';
        let prescription = '';
        
        const diagnosisMatch = cleanedAnalysis.match(/\[DIAGNOSIS\]\s*[:\-]?\s*(.+?)(?=\[FORECAST\]|$)/s);
        const forecastMatch = cleanedAnalysis.match(/\[FORECAST\]\s*[:\-]?\s*(.+?)(?=\[PRESCRIPTION\]|$)/s);
        const prescriptionMatch = cleanedAnalysis.match(/\[PRESCRIPTION\]\s*[:\-]?\s*(.+?)(?=$)/s);
        
        diagnosis = diagnosisMatch?.[1]?.trim() || '';
        forecast = forecastMatch?.[1]?.trim() || '';
        prescription = prescriptionMatch?.[1]?.trim() || '';
        
        if (!diagnosis && !forecast && !prescription) {
            const lines = cleanedAnalysis.split('\n').filter(line => line.trim());
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.toLowerCase().includes('diagnosis') && i < lines.length - 1) {
                    diagnosis = lines[i + 1]?.trim() || '';
                }
                if (line.toLowerCase().includes('forecast') && i < lines.length - 1) {
                    forecast = lines[i + 1]?.trim() || '';
                }
                if (line.toLowerCase().includes('prescription') && i < lines.length - 1) {
                    prescription = lines[i + 1]?.trim() || '';
                }
            }
        }
        
        return `
            <div class="intelligent-analysis-container">
                ${diagnosis ? `
                    <div class="diagnosis-card">
                        <div class="analysis-header">
                            <span class="analysis-title">DIAGNOSIS</span>
                        </div>
                        <div class="analysis-content">${diagnosis}</div>
                    </div>
                ` : ''}
                ${forecast ? `
                    <div class="forecast-card">
                        <div class="analysis-header">
                            <span class="analysis-title">FORECAST</span>
                        </div>
                        <div class="analysis-content">${forecast}</div>
                    </div>
                ` : ''}
                ${prescription ? `
                    <div class="prescription-card">
                        <div class="analysis-header">
                            <span class="analysis-title">PRESCRIPTION</span>
                        </div>
                        <div class="analysis-content">${prescription}</div>
                    </div>
                ` : ''}
                ${!diagnosis && !forecast && !prescription ? `
                    <div class="fallback-analysis">
                        <div class="analysis-content">${cleanedAnalysis}</div>
                    </div>
                ` : ''}
            </div>
        `;
    };

    const monitorMetrics = calculateMetrics(stationMonitorId);

    const filteredLogs = useMemo(() => {
        return (monitorMetrics.stationLogs || [])
            .filter(log => log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(log => statusFilter === 'All' || log.status === statusFilter);
    }, [monitorMetrics.stationLogs, searchTerm, statusFilter]);
    
    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;
    const processName = processStations[stationIndex] || stationMonitorId;

    // Calculate Takt Time status for the station
    const taktTimeStatus = useMemo(() => {
        const thresholdMinutes = dynamicDelayThresholds[stationMonitorId] || 10;
        const stationLogs = monitorMetrics.stationLogs || [];
        const inProgressLogs = stationLogs.filter(log => {
            const statusText = (log.status || '').toLowerCase();
            return log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
        });
        
        if (inProgressLogs.length === 0) return 'ON_TRACK';
        
        const avgProcessingTime = inProgressLogs.reduce((sum, log) => {
            const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
            const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
            return sum + minutesInStation;
        }, 0) / inProgressLogs.length;
        
        const hasVoltageIssues = inProgressLogs.some(log => {
            if (stationMonitorId.includes('Station2') || stationMonitorId.includes('Station 2')) {
                return log.s2_voltage && getVoltageErrorStatus(log.s2_voltage);
            }
            if (stationMonitorId.includes('Station6') || stationMonitorId.includes('Station 6')) {
                return log.s6_voltage && getVoltageErrorStatus(log.s6_voltage);
            }
            return false;
        });
        
        if (hasVoltageIssues || avgProcessingTime > thresholdMinutes * 1.5) {
            return 'BOTTLENECKED';
        }
        
        return 'ON_TRACK';
    }, [monitorMetrics.stationLogs, stationMonitorId, dynamicDelayThresholds]);

    const hasDelayedUnits = useMemo(() => {
        return (monitorMetrics.stationLogs || []).some(log => {
            if (log.status !== 'In Progress' && !log.status?.toLowerCase().includes('no good') && !log.status?.toLowerCase().includes('ng')) return false;
            const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at, dynamicDelayThresholds);
            return d.isDelayed;
        });
    }, [monitorMetrics.stationLogs, stationMonitorId, dynamicDelayThresholds]);

    // AI Industrial Engineer Analysis Function
    const fetchStationDiagnosis = async () => {
        setIsStationAiLoading(true);
        setStationAiAnalysis('');
        try {
            const modelRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list_models' })
            });
            
            if (!modelRes.ok) {
                throw new Error(`Model listing failed (${modelRes.status})`);
            }
            
            const modelData = await modelRes.json();
            if (!modelData.modelName) {
                throw new Error('No model returned from backend');
            }

            const prompt = `You are an AI Industrial Engineer specializing in real-time production optimization at MKFF Laserteknique International inc.

STATION ANALYSIS: ${processName} (${stationMonitorId})
Current Status: ${hasDelayedUnits ? 'DELAYED UNITS DETECTED' : 'NORMAL OPERATION'}
Takt Time Status: ${taktTimeStatus}

REQUIRED OUTPUT FORMAT (STRICT):
[DIAGNOSIS]: Current root cause using manufacturing terminology

[FORECAST]: Predict station status for next 2-4 hours based on current conditions

[PRESCRIPTION]: Provide exactly 2 actionable steps for production supervisor

USE INDUSTRIAL ENGINEERING TERMS: Takt Time, Bottleneck Propagation, Resource Reallocation, Cycle Time Variance`;

            const genRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelName: modelData.modelName,
                    prompt: prompt
                })
            });

            if (!genRes.ok) {
                throw new Error(`generateContent failed (${genRes.status})`);
            }

            const genData = await genRes.json();
            const text = genData.text || '';
            
            if (!text) throw new Error("Empty AI response.");
            setStationAiAnalysis(text);

        } catch (err) {
            console.error("Station AI Error:", err);
            setStationAiAnalysis("Station diagnostic failed: " + err.message);
        } finally {
            setIsStationAiLoading(false);
        }
    };

    return (
        <div className="pb-5 container-fluid px-0">
            <style>{`
                @keyframes highlight-pulse-effect {
                    0% { background-color: rgba(239, 68, 68, 0.1); outline: 2px solid transparent; }
                    50% { background-color: rgba(239, 68, 68, 0.3); outline: 2px solid #ef4444; }
                    100% { background-color: rgba(239, 68, 68, 0.1); outline: 2px solid transparent; }
                }

                .highlight-pulse {
                    animation: highlight-pulse-effect 2s infinite ease-in-out;
                    position: relative;
                    z-index: 5;
                }

                .stat-card-pro { 
                    background: #fff; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 22px; 
                    height: 100%; 
                    border-left: 5px solid #198754; 
                }

                .table thead th { 
                    background-color: #1e293b !important; 
                    color: #ffffff !important; 
                    font-weight: 600; 
                    padding: 12px 15px; 
                }

                .diagnostic-card-minimal { 
                    background: #f8fafc; 
                    border-radius: 8px; 
                    border: 1px solid #e2e8f0; 
                }

                .delay-row { 
                    background-color: #fff5f5 !important; 
                }

                /* Enhanced AI Analysis Styling */
                .intelligent-analysis-container { margin-top: 16px; }
                .diagnosis-card, .forecast-card, .prescription-card, .fallback-analysis { 
                    margin-bottom: 16px; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .diagnosis-card { border: 2px solid #dc2626; background: #fef2f2; }
                .forecast-card { border: 2px solid #2563eb; background: #eff6ff; }
                .prescription-card { border: 2px solid #16a34a; background: #f0fdf4; }
                .fallback-analysis { border: 2px solid #64748b; background: #f8fafc; }
                
                .analysis-header { 
                    padding: 12px 16px; 
                    font-weight: 700; 
                    font-size: 0.85rem; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    display: flex; 
                    align-items: center;
                }
                .diagnosis-card .analysis-header { background: #dc2626; color: white; }
                .forecast-card .analysis-header { background: #2563eb; color: white; }
                .prescription-card .analysis-header { background: #16a34a; color: white; }
                .fallback-analysis .analysis-header { background: #64748b; color: white; }
                
                .analysis-content { 
                    padding: 16px; 
                    font-size: 0.9rem; 
                    line-height: 1.6; 
                    font-weight: 500;
                }
                .diagnosis-card .analysis-content { color: #7f1d1d; }
                .forecast-card .analysis-content { color: #1e3a8a; }
                .prescription-card .analysis-content { color: #14532d; }
                .fallback-analysis .analysis-content { color: #334155; }

                /* Takt Time Badge Styling */
                .takt-time-badge { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 6px; 
                    padding: 8px 12px; 
                    border-radius: 20px; 
                    font-size: 0.75rem; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }
                .takt-time-on-track { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .takt-time-bottlenecked { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-1">{processName}</h3>
                    <p className="text-muted small mb-0">Operational View • ID: {stationMonitorId}</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className={`takt-time-badge ${taktTimeStatus === 'ON_TRACK' ? 'takt-time-on-track' : 'takt-time-bottlenecked'}`}>
                        <i className={`bi ${taktTimeStatus === 'ON_TRACK' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                        <span>Takt Time: {taktTimeStatus === 'ON_TRACK' ? 'On-Track' : 'Bottlenecked'}</span>
                    </div>
                    <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>
                </div>
            </div>

            {hasDelayedUnits && (
                <div className="diagnostic-card-minimal p-3 mb-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div className="fw-bold text-dark small uppercase tracking-wider">AI INDUSTRIAL ENGINEER ANALYSIS</div>
                            <div className="small text-muted">Predictive manufacturing intelligence with forecasting and actionable prescriptions.</div>
                        </div>
                        <button
                            className="btn btn-outline-dark btn-sm fw-bold shadow-sm px-4 rounded-pill"
                            onClick={fetchStationDiagnosis}
                            disabled={isStationAiLoading}
                        >
                            {isStationAiLoading ? 'ANALYZING...' : 'ANALYZE STATION'}
                        </button>
                    </div>

                    {stationAiAnalysis ? (
                        <div 
                            className="text-dark" 
                            dangerouslySetInnerHTML={{ __html: formatStationOutput(stationAiAnalysis) }}
                        />
                    ) : (
                        <div className="text-muted p-3">No analysis available.</div>
                    )}
                </div>
            )}

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro">
                        <span className="text-muted small fw-bold uppercase">Completed</span>
                        <h3 className="fw-bold text-success mt-1">{monitorMetrics.completedUnits}</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro" style={{borderLeftColor: '#0d6efd'}}>
                        <span className="text-muted small fw-bold uppercase">Yield Rate</span>
                        <h3 className="fw-bold text-primary mt-1">{monitorMetrics.yieldRate}%</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro" style={{borderLeftColor: '#ffc107'}}>
                        <span className="text-muted small fw-bold uppercase">In Progress</span>
                        <h3 className="fw-bold text-warning mt-1">{monitorMetrics.pendingUnits}</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro" style={{borderLeftColor: '#dc3545'}}>
                        <span className="text-muted small fw-bold uppercase">No Good (NG)</span>
                        <h3 className="fw-bold text-danger mt-1">{monitorMetrics.ngUnits}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-2 overflow-hidden shadow-sm">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-bold small text-muted text-uppercase">Station Logs</span>
                    <div className="d-flex gap-2">
                        <select className="form-select form-select-sm" style={{width:'160px'}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="text" className="form-control form-control-sm" style={{width:'200px'}} placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="btn btn-secondary btn-sm px-3 fw-bold" onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}>RESET</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th className="ps-4">MODEL</th>
                                <th>REVISION</th>
                                <th>BASE UNIT</th>
                                <th>ASSEMBLY</th>
                                <th>DEVICE SERIAL</th>
                                <th>ACCESSORY</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-center">DELAY (MINS)</th>
                                <th>REMARKS</th>
                                <th>LAST UPDATE</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => {
                                const lastTs = log.updated_at || log.created_at;
                                const minutesInStation = lastTs
                                    ? Math.max(0, (new Date().getTime() - new Date(lastTs).getTime()) / (1000 * 60))
                                    : 0;

                                const thresholdMinutes = dynamicDelayThresholds[stationMonitorId] || 10;
                                const statusText = (log.status || '').toLowerCase();
                                const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                                const delay = isInProgressOrNG
                                    ? checkUnitDelay(stationMonitorId, lastTs, dynamicDelayThresholds)
                                    : { isDelayed: false, minutes: minutesInStation, level: 'NORMAL' };

                                const delayMinutes = Math.max(0, minutesInStation - thresholdMinutes);
                                return (
                                    <tr 
                                        key={log.id} 
                                        className={`
                                            ${delay.isDelayed ? 'delay-row' : ''} 
                                            ${log.id === highlightedUnitId ? 'highlight-pulse' : ''}
                                        `}
                                    >
                                        <td className="ps-4 fw-bold">{log.model}</td>
                                        <td className="text-muted small">{log.revision || '---'}</td>
                                        <td className="text-muted small">{log.base_unit_kitting_no || '---'}</td>
                                        <td>
                                            <code className="text-primary fw-bold">{log.assembly_no}</code>
                                            {delay.isDelayed && <i className="bi bi-exclamation-triangle-fill text-danger ms-2" title={`Delayed: ${delay.level}`}></i>}
                                        </td>
                                        <td className="text-muted small">{log.device_serial_no || '---'}</td>
                                        <td className="text-muted small">{log.accessory_kitting_no || '---'}</td>
                                        <td className="text-center">
                                            <span className={`badge rounded-1 px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span>
                                        </td>
                                        <td className="text-center">
                                            {isInProgressOrNG && delay.isDelayed ? (
                                                <span className={`badge rounded-pill ${delay.level === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                    +{Math.round(delayMinutes)}m
                                                </span>
                                            ) : (
                                                <span className="text-muted small">—</span>
                                            )}
                                        </td>
                                        <td className="text-muted small italic">{log.remarks || '---'}</td>
                                        <td className="small text-muted">{new Date(log.updated_at || log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="text-center">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button className="btn btn-sm btn-primary px-3 fw-bold" onClick={() => setSelectedUnit(log)}>
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
            
            {/* Unit Details Modal */}
            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-primary shadow-sm">
                            <div>
                                <h5 className="mb-0 fw-bold">Unit Details | Assembly: {selectedUnit.assembly_no}</h5>
                                <small className="opacity-75">Model: {selectedUnit.model} | Station: {selectedUnit.station}</small>
                            </div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnit(null)}></button>
                        </div>

                        <div className="p-4">
                            <div className="row g-4">
                                {/* Basic Information */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-primary mb-3">
                                                <i className="bi bi-info-circle me-2"></i>Basic Information
                                            </h6>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <small className="text-muted">Model:</small>
                                                    <div className="fw-bold">{selectedUnit.model || '---'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted">Revision:</small>
                                                    <div className="fw-bold">{selectedUnit.revision || '---'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted">Assembly No:</small>
                                                    <div className="fw-bold text-primary">{selectedUnit.assembly_no || '---'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted">Status:</small>
                                                    <div>
                                                        <span className={`badge ${getStatusBadgeClass(selectedUnit.status)}`}>
                                                            {selectedUnit.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PCB Board Numbers */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-success mb-3">
                                                <i className="bi bi-cpu me-2"></i>PCB Board Numbers
                                            </h6>
                                            <div className="row g-2">
                                                <div className="col-12">
                                                    <small className="text-muted">MNBD Board:</small>
                                                    <div className="fw-bold">{selectedUnit.mnbd_board_no || selectedUnit.mnbd_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">CMBD Board:</small>
                                                    <div className="fw-bold">{selectedUnit.cmbd_board_no || selectedUnit.cmbd_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">LRBD Board:</small>
                                                    <div className="fw-bold">{selectedUnit.lrbd_board_no || selectedUnit.lrbd_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">PQBD Board:</small>
                                                    <div className="fw-bold">{selectedUnit.pqbd_board_no || selectedUnit.pqbd_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">BKBD Board:</small>
                                                    <div className="fw-bold">{selectedUnit.bkbd_board_no || selectedUnit.bkbd_no || '---'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Serial Numbers */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-warning mb-3">
                                                <i className="bi bi-hash me-2"></i>Serial Numbers
                                            </h6>
                                            <div className="row g-2">
                                                <div className="col-12">
                                                    <small className="text-muted">Device Serial:</small>
                                                    <div className="fw-bold">{selectedUnit.device_serial_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">Base Unit Kitting:</small>
                                                    <div className="fw-bold">{selectedUnit.base_unit_kitting_no || '---'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">Accessory Kitting:</small>
                                                    <div className="fw-bold">{selectedUnit.accessory_kitting_no || '---'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Results & Checklist Data */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-info mb-3">
                                                <i className="bi bi-clipboard-check me-2"></i>Station 1 & 2 Tests
                                            </h6>
                                            <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                                                {/* Station 1 Tests */}
                                                {selectedUnit.s1_header_seated_90_deg && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Header Seated:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s1_header_seated_90_deg) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s1_header_seated_90_deg}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s1_leads_properly_soldered && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Soldering:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s1_leads_properly_soldered) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s1_leads_properly_soldered}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Station 2 Tests */}
                                                {selectedUnit.s2_lora_module && (
                                                    <div className="col-6">
                                                        <small className="text-muted">LoRa Module:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_lora_module) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_lora_module}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_lora_mesh_test && (
                                                    <div className="col-6">
                                                        <small className="text-muted">LoRa Mesh:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_lora_mesh_test) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_lora_mesh_test}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_energy_meter && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Energy Meter:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_energy_meter) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_energy_meter}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_power_good_test && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Power Good:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_power_good_test) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_power_good_test}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_temp_reading && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Temperature:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_temp_reading) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_temp_reading}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_freq_reading && (
                                                    <div className="col-6">
                                                        <small className="text-muted">Frequency:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_freq_reading) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_freq_reading}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedUnit.s2_go_no_go && (
                                                    <div className="col-12">
                                                        <small className="text-muted">Station 2 Verdict:</small>
                                                        <div className={`fw-bold ${isErrorValue(selectedUnit.s2_go_no_go) ? 'text-danger' : 'text-success'}`}>
                                                            {selectedUnit.s2_go_no_go}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Voltage Readings */}
                                {(selectedUnit.s2_voltage || selectedUnit.s2_line1 || selectedUnit.s2_line2 || selectedUnit.s2_line3 || selectedUnit.s6_voltage || selectedUnit.s6_line1 || selectedUnit.s6_line2 || selectedUnit.s6_line3) && (
                                    <div className="col-md-6">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title fw-bold text-danger mb-3">
                                                    <i className="bi bi-lightning me-2"></i>Voltage Readings
                                                </h6>
                                                <div className="row g-2">
                                                    {/* Station 2 Voltage Readings */}
                                                    {selectedUnit.s2_voltage && (
                                                        <div className="col-12">
                                                            <small className="text-muted">Station 2 Main Voltage:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s2_voltage) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_voltage}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s2_line1 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S2 Line 1:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s2_line1) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_line1}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s2_line2 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S2 Line 2:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s2_line2) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_line2}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s2_line3 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S2 Line 3:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s2_line3) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_line3}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Station 6 Voltage Readings */}
                                                    {selectedUnit.s6_voltage && (
                                                        <div className="col-12">
                                                            <small className="text-muted">Station 6 Main Voltage:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s6_voltage) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_voltage}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s6_line1 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S6 Line 1:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s6_line1) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_line1}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s6_line2 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S6 Line 2:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s6_line2) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_line2}V
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s6_line3 && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S6 Line 3:</small>
                                                            <div className={`fw-bold ${getVoltageErrorStatus(selectedUnit.s6_line3) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_line3}V
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* LED Status & Final Tests */}
                                {(selectedUnit.s2_led_status_4g || selectedUnit.s2_led_status_fast_blink || selectedUnit.s2_go_no_go || selectedUnit.s6_led_status_4g || selectedUnit.s6_led_status_fast_blink || selectedUnit.s6_go_no_go) && (
                                    <div className="col-md-6">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title fw-bold text-secondary mb-3">
                                                    <i className="bi bi-lightbulb me-2"></i>LED Status & Final Tests
                                                </h6>
                                                <div className="row g-2">
                                                    {/* Station 2 LED Status */}
                                                    {selectedUnit.s2_led_status_4g && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S2 4G LED:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s2_led_status_4g, 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_led_status_4g}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s2_led_status_fast_blink && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S2 Fast Blink:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s2_led_status_fast_blink, 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_led_status_fast_blink}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s2_go_no_go && (
                                                        <div className="col-12">
                                                            <small className="text-muted">Station 2 Final Verdict:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s2_go_no_go) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s2_go_no_go}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Station 6 LED Status */}
                                                    {selectedUnit.s6_led_status_4g && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S6 4G LED:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s6_led_status_4g, 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_led_status_4g}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s6_led_status_fast_blink && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S6 Fast Blink:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s6_led_status_fast_blink, 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_led_status_fast_blink}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s6_go_no_go && (
                                                        <div className="col-12">
                                                            <small className="text-muted">Station 6 Final Verdict:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s6_go_no_go) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s6_go_no_go}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Station Requirements & Other Tests */}
                                {(selectedUnit.s3_requirements || selectedUnit.s4_requirements || selectedUnit.s5_requirements || selectedUnit.s7_requirements || selectedUnit.s8_power_unit_disable_lora || selectedUnit.s9_requirements || selectedUnit.s10_requirements || selectedUnit.s11_led_status || selectedUnit.s12_requirements || selectedUnit.s13_requirements || selectedUnit.s14_requirements) && (
                                    <div className="col-md-6">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="card-title fw-bold text-warning mb-3">
                                                    <i className="bi bi-gear me-2"></i>Station Requirements & Tests
                                                </h6>
                                                <div className="row g-2" style={{ fontSize: '0.85rem' }}>
                                                    {selectedUnit.s3_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 3:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s3_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s3_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s4_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 4:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s4_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s4_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s5_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 5:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s5_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s5_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s7_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 7:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s7_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s7_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s8_power_unit_disable_lora && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S8 Power Unit:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s8_power_unit_disable_lora) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s8_power_unit_disable_lora}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s8_frequency_band && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S8 Frequency:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s8_frequency_band) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s8_frequency_band}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s9_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 9:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s9_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s9_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s10_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 10:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s10_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s10_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s11_led_status && (
                                                        <div className="col-6">
                                                            <small className="text-muted">S11 LED Status:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s11_led_status, 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s11_led_status}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s11_low_range && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S11 Low:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s11_low_range) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s11_low_range}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s11_medium_range && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S11 Med:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s11_medium_range) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s11_medium_range}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s11_high_range && (
                                                        <div className="col-4">
                                                            <small className="text-muted">S11 High:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s11_high_range) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s11_high_range}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s12_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 12:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s12_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s12_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s13_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 13:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s13_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s13_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedUnit.s14_requirements && (
                                                        <div className="col-6">
                                                            <small className="text-muted">Station 14:</small>
                                                            <div className={`fw-bold ${isErrorValue(selectedUnit.s14_requirements) ? 'text-danger' : 'text-success'}`}>
                                                                {selectedUnit.s14_requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-muted mb-3">
                                                <i className="bi bi-clock me-2"></i>Timestamps
                                            </h6>
                                            <div className="row g-2">
                                                <div className="col-12">
                                                    <small className="text-muted">Created:</small>
                                                    <div className="fw-bold">
                                                        {selectedUnit.created_at ? new Date(selectedUnit.created_at).toLocaleString() : '---'}
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">Last Updated:</small>
                                                    <div className="fw-bold">
                                                        {selectedUnit.updated_at ? new Date(selectedUnit.updated_at).toLocaleString() : '---'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div className="col-md-6">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-dark mb-3">
                                                <i className="bi bi-chat-text me-2"></i>Remarks
                                            </h6>
                                            <div className="p-2 bg-white rounded border">
                                                {selectedUnit.remarks || <span className="text-muted fst-italic">No remarks available</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-light border-top text-end">
                            <button className="btn btn-secondary px-5 fw-bold" onClick={() => setSelectedUnit(null)}>
                                CLOSE DETAILS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export function StationsOverview({
    activeTab, stations, calculateMetrics, stationMonitorId, highlightedUnitId, setActiveTab, handleMonitorStation, handleViewHistory, handleEditClick, fetchData, allLogs, liveUnitLogs, dynamicDelayThresholds, onTargetTimeManagement
}) {
    const [historySearch, setHistorySearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [delayHotspotsAi, setDelayHotspotsAi] = useState(null);
    const [isDelayHotspotsAiLoading, setIsDelayHotspotsAiLoading] = useState(false);

    // Enhanced AI output formatting for new 3-section format
    const formatHotspotOutput = (text) => {
        if (!text) return '';
        
        const cleanedAnalysis = text.replace(/\*\*/g, '').replace(/\*/g, '');
        
        let diagnosis = '';
        let forecast = '';
        let prescription = '';
        
        const diagnosisMatch = cleanedAnalysis.match(/\[DIAGNOSIS\]\s*[:\-]?\s*(.+?)(?=\[FORECAST\]|$)/s);
        const forecastMatch = cleanedAnalysis.match(/\[FORECAST\]\s*[:\-]?\s*(.+?)(?=\[PRESCRIPTION\]|$)/s);
        const prescriptionMatch = cleanedAnalysis.match(/\[PRESCRIPTION\]\s*[:\-]?\s*(.+?)(?=$)/s);
        
        diagnosis = diagnosisMatch?.[1]?.trim() || '';
        forecast = forecastMatch?.[1]?.trim() || '';
        prescription = prescriptionMatch?.[1]?.trim() || '';
        
        if (!diagnosis && !forecast && !prescription) {
            const lines = cleanedAnalysis.split('\n').filter(line => line.trim());
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.toLowerCase().includes('diagnosis') && i < lines.length - 1) {
                    diagnosis = lines[i + 1]?.trim() || '';
                }
                if (line.toLowerCase().includes('forecast') && i < lines.length - 1) {
                    forecast = lines[i + 1]?.trim() || '';
                }
                if (line.toLowerCase().includes('prescription') && i < lines.length - 1) {
                    prescription = lines[i + 1]?.trim() || '';
                }
            }
        }
        
        return `
            <div class="intelligence-hub-container">
                ${diagnosis ? `
                    <div class="diagnosis-hub-card">
                        <div class="hub-header">
                            <span class="hub-title">DIAGNOSIS</span>
                        </div>
                        <div class="hub-content">${diagnosis}</div>
                    </div>
                ` : ''}
                ${forecast ? `
                    <div class="forecast-hub-card">
                        <div class="hub-header">
                            <span class="hub-title">FORECAST</span>
                        </div>
                        <div class="hub-content">${forecast}</div>
                    </div>
                ` : ''}
                ${prescription ? `
                    <div class="prescription-hub-card">
                        <div class="hub-header">
                            <span class="hub-title">PRESCRIPTION</span>
                        </div>
                        <div class="hub-content">${prescription}</div>
                    </div>
                ` : ''}
                ${!diagnosis && !forecast && !prescription ? `
                    <div class="fallback-hub-analysis">
                        <div class="hub-content">${cleanedAnalysis}</div>
                    </div>
                ` : ''}
            </div>
        `;
    };

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

    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredHistory, currentPage]);

    const namedStations = useMemo(() => {
        return (stations || []).slice(0, processStations.length).map((station, index) => ({
            ...station,
            name: processStations[index],
        }));
    }, [stations]);

    const delayHotspots = useMemo(() => {
        const stats = namedStations.map((station) => {
            const metrics = calculateMetrics(station.id);
            const logsForStation = metrics.stationLogs || [];

            let delayedUnits = 0;
            let totalDelayMinutes = 0;
            let maxDelayMinutes = 0;

            logsForStation.forEach(log => {
                const statusText = (log.status || '').toLowerCase();
                const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                
                if (isInProgressOrNG) {
                    const delay = checkUnitDelay(station.id, log.updated_at || log.created_at, dynamicDelayThresholds);
                    if (delay.isDelayed) {
                        delayedUnits += 1;
                        totalDelayMinutes += delay.minutes;
                        if (delay.minutes > maxDelayMinutes) maxDelayMinutes = delay.minutes;
                    }
                }
            });

            const avgDelayMinutes = delayedUnits ? (totalDelayMinutes / delayedUnits) : 0;

            return {
                stationId: station.id,
                stationName: station.name,
                delayedUnits,
                avgDelayMinutes,
                maxDelayMinutes,
                thresholdMinutes: dynamicDelayThresholds[station.id] || 10,
            };
        });

        return stats
            .filter(s => s.delayedUnits > 0)
            .sort((a, b) => (b.delayedUnits - a.delayedUnits) || (b.maxDelayMinutes - a.maxDelayMinutes))
            .slice(0, 3);
    }, [namedStations, calculateMetrics]);

    const fetchDelayHotspotReasons = async () => {
        setIsDelayHotspotsAiLoading(true);
        setDelayHotspotsAi(null);
        try {
            const modelRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list_models' })
            });
            
            if (!modelRes.ok) {
                throw new Error(`Model listing failed (${modelRes.status})`);
            }
            
            const modelData = await modelRes.json();
            if (!modelData.modelName) {
                throw new Error('No model returned from backend');
            }

            const prompt = `You are an AI Industrial Engineer specializing in real-time production optimization at MKFF Laserteknique International inc.

MANUFACTURING HOTSPOTS ANALYSIS:
${JSON.stringify(delayHotspots, null, 2)}

REQUIRED OUTPUT FORMAT (STRICT):
[DIAGNOSIS]: Current root cause analysis across all hotspot stations using manufacturing terminology

[FORECAST]: Predict production line status for next 2-4 hours based on current bottlenecks and their propagation risk

[PRESCRIPTION]: Provide exactly 2 actionable steps for production supervisor focusing on resource reallocation and bottleneck mitigation

USE INDUSTRIAL ENGINEERING TERMS: Takt Time, Bottleneck Propagation, Resource Reallocation, Throughput Optimization`;

            const genRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelName: modelData.modelName,
                    prompt: prompt
                })
            });
            
            if (!genRes.ok) {
                throw new Error(`generateContent failed (${genRes.status})`);
            }
            
            const genData = await genRes.json();
            const text = genData.text || '';
            
            if (!text) throw new Error("Empty AI response.");
            setDelayHotspotsAi({ __complete_analysis: text });

        } catch (err) {
            console.error("Delay Hotspots AI Error:", err);
            setDelayHotspotsAi({ __error: String(err?.message || err) });
        } finally {
            setIsDelayHotspotsAiLoading(false);
        }
    };

    if (activeTab === "station_monitor" && stationMonitorId) {
        return <StationMonitorView {...{stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData, dynamicDelayThresholds}} />;
    }

    if (activeTab === "overall_history") {
        return (
            <div className="pb-5 container-fluid px-0">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                    <div><h4 className="fw-bold text-dark mb-0">Production History</h4></div>
                    <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>
                </div>
                <div className="bg-light p-3 rounded-2 border mb-4 d-flex flex-wrap gap-3 align-items-end mx-2 shadow-sm">
                    <div className="flex-grow-1">
                        <label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Assembly No.</label>
                        <input type="text" className="form-control form-control-sm shadow-none" placeholder="Search..." value={historySearch} onChange={(e) => {setHistorySearch(e.target.value); setCurrentPage(1);}} />
                    </div>
                    <div>
                        <label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Start</label>
                        <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} />
                    </div>
                    <div>
                        <label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>End</label>
                        <input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} />
                    </div>
                    <button className="btn btn-danger btn-sm px-3 fw-bold shadow-sm" onClick={() => { setHistorySearch(''); setStartDate(''); setEndDate(''); setCurrentPage(1); }}>RESET</button>
                </div>
                <div className="bg-white border rounded-2 overflow-hidden mx-2 shadow-sm">
                    <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>
                        <thead className="table-dark">
                            <tr>
                                <th>MODEL</th>
                                <th>ASSEMBLY</th>
                                <th>TYPE</th>
                                <th>STATION</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end pe-4">TIMESTAMP</th>
                            </tr>
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
                                        <td className="text-center">
                                            <span className={`badge rounded-1 px-3 ${getStatusBadgeClass(log.status_after || log.status)}`}>
                                                {log.status_after || log.status}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4 small text-muted">
                                            <strong>{ts.date}</strong><br/>{ts.time}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
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

    return (
        <div className="container-fluid px-0">
            <style>{`
                .station-card-flat { 
                    background: #fff; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 20px; 
                    height: 100%; 
                    position: relative; 
                    transition: all 0.3s ease;
                }

                /* Visual Heatmap - Station Card Borders */
                .station-card-delay-1-2 { border-top: 5px solid #fbbf24; }
                .station-card-delay-3-plus { border-top: 5px solid #ef4444; }
                
                /* Critical Glow Animation for 5+ delayed units */
                @keyframes critical-glow {
                    0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
                    50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
                    100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
                }
                .station-card-critical { animation: critical-glow 2s infinite; }

                .delay-indicator { 
                    position: absolute; 
                    top: 10px; 
                    right: 10px; 
                    color: #dc3545; 
                    font-size: 0.8rem; 
                    animation: pulse-red 1.5s infinite; 
                }

                @keyframes pulse-red {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .metric-row { 
                    display: flex; 
                    justify-content: space-between; 
                    font-size: 0.75rem; 
                    font-weight: 700; 
                    padding: 8px 0; 
                    border-bottom: 1px solid #f1f5f9; 
                    color: #475569; 
                }

                /* Efficiency Index Styling */
                .efficiency-index { 
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                    border: 1px solid #bae6fd; 
                    border-radius: 8px; 
                    padding: 8px 12px; 
                    margin: 8px 0;
                }
                .efficiency-value { 
                    font-size: 1.1rem; 
                    font-weight: 800; 
                    color: #0369a1; 
                }
                .efficiency-label { 
                    font-size: 0.65rem; 
                    font-weight: 700; 
                    color: #0284c7; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }

                /* Takt Time Comparison */
                .takt-comparison { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    font-size: 0.7rem; 
                    margin-top: 8px;
                }
                .takt-target { color: #16a34a; font-weight: 600; }
                .takt-actual { color: #dc2626; font-weight: 600; }
                .takt-gap { 
                    background: #fef2f2; 
                    color: #dc2626; 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    font-weight: 700;
                }

                /* AI Manufacturing Intelligence Hub Styling */
                .intelligence-hub { 
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                    border: 2px solid #e2e8f0; 
                    border-radius: 16px; 
                    padding: 24px; 
                    margin-bottom: 32px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                .intelligence-hub-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 20px;
                }
                .intelligence-hub-title { 
                    font-size: 1.25rem; 
                    font-weight: 800; 
                    color: #0f172a; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }
                .intelligence-hub-subtitle { 
                    font-size: 0.85rem; 
                    color: #64748b; 
                    margin-top: 4px;
                }

                /* Intelligence Hub Cards */
                .intelligence-hub-container { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                    gap: 16px; 
                    margin-top: 16px; 
                }
                .diagnosis-hub-card, .forecast-hub-card, .prescription-hub-card, .fallback-hub-analysis { 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .diagnosis-hub-card { border: 2px solid #dc2626; background: #fef2f2; }
                .forecast-hub-card { border: 2px solid #2563eb; background: #eff6ff; }
                .prescription-hub-card { border: 2px solid #16a34a; background: #f0fdf4; }
                .fallback-hub-analysis { border: 2px solid #64748b; background: #f8fafc; }
                
                .hub-header { 
                    padding: 12px 16px; 
                    font-weight: 700; 
                    font-size: 0.85rem; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    display: flex; 
                    align-items: center;
                }
                .diagnosis-hub-card .hub-header { background: #dc2626; color: white; }
                .forecast-hub-card .hub-header { background: #2563eb; color: white; }
                .prescription-hub-card .hub-header { background: #16a34a; color: white; }
                .fallback-hub-analysis .hub-header { background: #64748b; color: white; }
                
                .hub-content { 
                    padding: 16px; 
                    font-size: 0.9rem; 
                    line-height: 1.6; 
                    font-weight: 500;
                }
                .diagnosis-hub-card .hub-content { color: #7f1d1d; }
                .forecast-hub-card .hub-content { color: #1e3a8a; }
                .prescription-hub-card .hub-content { color: #14532d; }
                .fallback-hub-analysis .hub-content { color: #334155; }
            `}</style>
            
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold text-dark mb-0">Intelligent Decision Support System</h4>
                    <p className="text-muted small mb-0">AI-powered manufacturing intelligence and predictive analytics.</p>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-outline-primary btn-sm px-3 py-2 shadow-sm fw-bold" 
                        onClick={onTargetTimeManagement}
                        title="Configure target processing times for each station"
                    >
                        <i className="bi bi-clock-history me-2"></i>
                        Target Times
                    </button>
                    <button className="btn btn-dark btn-sm px-4 py-2 shadow-sm fw-bold" onClick={() => setActiveTab('overall_history')}>OVERALL HISTORY</button>
                </div>
            </div>

            {/* AI Manufacturing Intelligence Hub */}
            {delayHotspots.length > 0 && (
                <div className="intelligence-hub mx-2">
                    <div className="intelligence-hub-header">
                        <div>
                            <div className="intelligence-hub-title">AI Manufacturing Intelligence Hub</div>
                            <div className="intelligence-hub-subtitle">Predictive analytics and actionable insights for production optimization</div>
                        </div>
                        <button
                            className="btn btn-primary btn-sm fw-bold shadow-sm px-4 rounded-pill"
                            onClick={fetchDelayHotspotReasons}
                            disabled={isDelayHotspotsAiLoading}
                        >
                            {isDelayHotspotsAiLoading ? 'ANALYZING...' : 'ANALYZE HOTSPOTS'}
                        </button>
                    </div>

                    {delayHotspotsAi && delayHotspotsAi.__complete_analysis ? (
                        <div 
                            className="text-dark" 
                            dangerouslySetInnerHTML={{ __html: formatHotspotOutput(delayHotspotsAi.__complete_analysis) }}
                        />
                    ) : delayHotspotsAi && delayHotspotsAi.__error ? (
                        <div className="alert alert-danger">
                            <strong>Analysis Error:</strong> {delayHotspotsAi.__error}
                        </div>
                    ) : (
                        <div className="text-muted text-center py-4">
                            <i className="bi bi-robot fs-1 mb-2 d-block"></i>
                            <div>Click "ANALYZE HOTSPOTS" to generate AI-powered manufacturing intelligence</div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    const delayedCount = (metrics.stationLogs || []).filter(log => {
                        const statusText = (log.status || '').toLowerCase();
                        const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                        return isInProgressOrNG && checkUnitDelay(station.id, log.updated_at || log.created_at, dynamicDelayThresholds).isDelayed;
                    }).length;

                    // Calculate Efficiency Index
                    const completed = metrics.completedUnits || 0;
                    const pending = metrics.pendingUnits || 0;
                    const ng = metrics.ngUnits || 0;
                    const total = completed + pending + ng;
                    const efficiencyIndex = total > 0 ? Math.round((completed / total) * 100) : 0;

                    // Calculate Takt Time metrics
                    const thresholdMinutes = dynamicDelayThresholds[station.id] || 10;
                    const stationLogs = metrics.stationLogs || [];
                    const inProgressLogs = stationLogs.filter(log => {
                        const statusText = (log.status || '').toLowerCase();
                        return log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                    });
                    
                    const avgActualTime = inProgressLogs.length > 0 ? 
                        inProgressLogs.reduce((sum, log) => {
                            const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
                            const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
                            return sum + minutesInStation;
                        }, 0) / inProgressLogs.length : 0;

                    // Determine card styling based on delayed units
                    let cardClass = 'station-card-flat shadow-sm';
                    if (delayedCount >= 5) {
                        cardClass += ' station-card-critical station-card-delay-3-plus';
                    } else if (delayedCount >= 3) {
                        cardClass += ' station-card-delay-3-plus';
                    } else if (delayedCount >= 1) {
                        cardClass += ' station-card-delay-1-2';
                    }

                    return (
                        <div key={station.id} className="col-md-3">
                            <div className={cardClass}>
                                {delayedCount > 0 && (
                                    <div className="delay-indicator">
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                        <span className="fw-bold">DELAYED ({delayedCount})</span>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <span className="text-muted small fw-bold uppercase">ID: {station.id}</span>
                                    <h6 className="fw-bold text-dark text-truncate mt-1 uppercase">{station.name}</h6>
                                </div>

                                {/* Efficiency Index */}
                                <div className="efficiency-index text-center">
                                    <div className="efficiency-value">{efficiencyIndex}%</div>
                                    <div className="efficiency-label">Efficiency Index</div>
                                </div>

                                <div className="mb-4">
                                    <div className="metric-row"><span>COMPLETED</span><span className="text-success">{metrics.completedUnits}</span></div>
                                    <div className="metric-row"><span>IN PROGRESS</span><span className="text-primary">{metrics.pendingUnits}</span></div>
                                    <div className="metric-row"><span>NO GOOD (NG)</span><span className="text-danger">{metrics.ngUnits}</span></div>
                                </div>

                                {/* Takt Time Comparison */}
                                <div className="takt-comparison">
                                    <div>
                                        <div className="takt-target">Target: {thresholdMinutes}m</div>
                                        <div className="takt-actual">Actual: {avgActualTime.toFixed(1)}m</div>
                                    </div>
                                    {avgActualTime > thresholdMinutes && (
                                        <div className="takt-gap">+{(avgActualTime - thresholdMinutes).toFixed(1)}m</div>
                                    )}
                                </div>

                                <div className="d-flex gap-2 mt-3">
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