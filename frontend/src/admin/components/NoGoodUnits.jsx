import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const NoGoodUnits = ({ logs, handleEditClick }) => {
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [expandedStepIdx, setExpandedStepIdx] = useState(null);

    const allNoGoodLogs = useMemo(() => {
        return (logs || []).filter(log => {
            const status = log.status?.toLowerCase() || '';
            return status.includes('no good') || status === 'ng';
        });
    }, [logs]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getStationIndex = (log) => {
        const stationName = log.station_name || log.station;
        return processStations.findIndex(s => s === stationName);
    };

    return (
        <div className="container-fluid px-0 py-3 animate-in fade-in">
            <style>
                {`
                .ng-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
                .table-ng { font-size: 0.8rem; width: 100%; border-collapse: separate; border-spacing: 0; }
                .table-ng thead th { background: #f1f5f9; color: #475569; font-weight: 800; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; padding: 14px 10px; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
                .table-ng tbody td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #334155; }
                .table-ng tbody tr:hover { background-color: #f8fafc; }
                .mono-box { font-family: 'JetBrains Mono', monospace; background: #f8fafc; padding: 2px 5px; border-radius: 4px; font-size: 0.75rem; color: #0f172a; border: 1px solid #e2e8f0; }
                .summary-header { padding: 20px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1060; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
                .modal-content-balanced { background: white; width: 95%; max-width: 850px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); display: flex; flex-direction: column; max-height: 85vh; border: 1px solid #cbd5e1; }
                .modal-step { padding: 12px 20px; border-left: 3px solid #e2e8f0; position: relative; cursor: pointer; transition: all 0.2s ease; }
                .modal-step.active-ng { border-left-color: #ef4444; background: #fef2f2; }
                .modal-step.done { border-left-color: #22c55e; }
                .modal-dot { position: absolute; left: -8px; top: 18px; width: 13px; height: 13px; border-radius: 50%; background: #e2e8f0; border: 2px solid white; z-index: 2; }
                .active-ng .modal-dot { background: #ef4444; }
                .done .modal-dot { background: #22c55e; }
                .tracker-checklist-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 10px; overflow-x: auto; }
                .tracker-table { width: 100%; font-size: 0.7rem; text-align: center; border-collapse: collapse; min-width: 600px; }
                .tracker-table th { background: #f8fafc; padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 800; color: #64748b; text-transform: uppercase; }
                .tracker-table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 700; }
                `}
            </style>

            <div className="ng-container">
                <div className="summary-header">
                    <div>
                        <h5 className="fw-bold mb-0 text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>NO GOOD (NG) LOGS REGISTRY</h5>
                        <small className="text-muted">Master list of all non-conforming units across stations</small>
                    </div>
                    <span className="badge bg-danger rounded-pill px-3 py-2">Total Units: {allNoGoodLogs.length}</span>
                </div>

                <div className="table-responsive">
                    <table className="table-ng">
                        <thead>
                            <tr>
                                <th>MODEL</th>
                                <th>REVISION</th>
                                <th>BASE UNIT</th>
                                <th>ASSEMBLY</th>
                                <th>DEVICE SERIAL</th>
                                <th>ACCESSORY</th>
                                {/* 🔑 ADDED ERROR STATION COLUMN */}
                                <th className="text-danger">ERROR STATION</th>
                                <th>STATUS</th>
                                {/* 🔑 ADDED LAST MOVEMENT COLUMN */}
                                <th>LAST MOVEMENT</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allNoGoodLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="fw-bold">{log.model}</td>
                                    <td className="text-muted">{log.revision || '---'}</td>
                                    <td><span className="mono-box">{log.base_unit_kitting_no || '---'}</span></td>
                                    <td><span className="mono-box">{log.assembly_no}</span></td>
                                    <td><span className="mono-box text-primary fw-bold">{log.device_serial_no}</span></td>
                                    <td><span className="mono-box">{log.accessory_kitting_no || '---'}</span></td>
                                    {/* 🔑 SHOWING STATION WHERE ERROR HAPPENED */}
                                    <td>
                                        <span className="fw-bold text-danger">
                                            <i className="bi bi-geo-alt-fill me-1"></i>
                                            {log.station_name || log.station || 'N/A'}
                                        </span>
                                    </td>
                                    <td><span className="text-danger fw-bold small">● {log.status}</span></td>
                                    {/* 🔑 SHOWING FORMATTED TIMESTAMP AS LAST MOVEMENT */}
                                    <td className="text-muted small">{formatTimestamp(log.updated_at || log.created_at)}</td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button className="btn btn-sm btn-dark px-3 fw-bold" style={{fontSize: '0.7rem'}} onClick={() => setSelectedUnit(log)}>DETAILS</button>
                                            <button className="btn btn-sm btn-outline-danger px-3 fw-bold" style={{fontSize: '0.7rem'}} onClick={() => handleEditClick(log)}>MANAGE</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUnit && (
                <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
                    <div className="modal-content-balanced animate-in slide-in-bottom" onClick={e => e.stopPropagation()}>
                        <div className="p-3 bg-danger text-white d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">Unit Analysis & Tracker | SN: {selectedUnit.device_serial_no}</h6>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                        </div>

                        <div className="p-3 overflow-auto">
                            <div className="alert alert-danger border-0 p-3 mb-3">
                                <div className="fw-bold text-uppercase mb-1 text-danger" style={{fontSize: '0.6rem'}}>Defect Remarks:</div>
                                <div className="text-dark fw-bold fs-6">"{selectedUnit.remarks || "No recorded remarks."}"</div>
                            </div>

                            <div className="process-timeline border-top pt-2">
                                {processStations.map((station, idx) => {
                                    const currentStationIdx = getStationIndex(selectedUnit);
                                    const isNGPoint = idx === currentStationIdx;
                                    const isDone = idx < currentStationIdx;
                                    const isExpanded = expandedStepIdx === idx;

                                    let stationData = null;
                                    if (idx === 0 && selectedUnit.header_seated_90_deg) {
                                        stationData = { "Header Seated": selectedUnit.header_seated_90_deg, "Soldering": selectedUnit.leads_properly_soldered };
                                    } else if (idx === 1 && selectedUnit.integrated_board_level_test1) {
                                        stationData = { "Board 1": selectedUnit.integrated_board_level_test1, "Board 2": selectedUnit.integrated_board_level_test2, "Board 3": selectedUnit.integrated_board_level_test3 };
                                    } else if (idx === 5 && selectedUnit.voltage) {
                                        stationData = { 
                                            "LoRa": selectedUnit.lora_module, 
                                            "Meter": selectedUnit.energy_meter, 
                                            "PwrGood": selectedUnit.power_good_test,
                                            "Volt": selectedUnit.voltage,
                                            "L1": selectedUnit.line1,
                                            "L2": selectedUnit.line2,
                                            "L3": selectedUnit.line3,
                                            "Temp": selectedUnit.temp_reading,
                                            "Freq": selectedUnit.freq_reading,
                                            "4G": selectedUnit.led_status_4g,
                                            "Blink": selectedUnit.led_status_fast_blink,
                                            "Verdict": selectedUnit.go_no_go 
                                        };
                                    } else if (isNGPoint) {
                                        stationData = { "Station": station, "Status": "NO GOOD", "Defect Code": selectedUnit.defect_code || "GEN-01" };
                                    }

                                    return (
                                        <div key={idx} className={`modal-step ${isNGPoint ? 'active-ng' : (isDone ? 'done' : '')}`} onClick={() => stationData && setExpandedStepIdx(isExpanded ? null : idx)}>
                                            <div className="modal-dot"></div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold small">{idx + 1}. {station}</div>
                                                    <div className="fw-bold text-uppercase" style={{fontSize: '0.6rem', color: isNGPoint ? '#ef4444' : (isDone ? '#22c55e' : '#94a3b8')}}>
                                                        {isNGPoint ? 'FAILED HERE' : (isDone ? 'COMPLETED' : 'PENDING')}
                                                    </div>
                                                </div>
                                                {stationData && <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-muted`}></i>}
                                            </div>

                                            {isExpanded && stationData && (
                                                <div className="tracker-checklist-box shadow-sm animate-in fade-in">
                                                    <table className="tracker-table">
                                                        <thead><tr>{Object.keys(stationData).map(k => <th key={k}>{k}</th>)}</tr></thead>
                                                        <tbody>
                                                            <tr>
                                                                {Object.entries(stationData).map(([key, value], i) => {
                                                                    const val = String(value).toUpperCase().trim();
                                                                    let isFail = false;
                                                                    const failureWords = ["NO GO", "FAIL", "NO GOOD", "NG", "NOT DETECTED", "FALSE"];
                                                                    
                                                                    if (failureWords.includes(val)) isFail = true;

                                                                    if (["Volt", "L1", "L2", "L3"].includes(key)) {
                                                                        const num = parseFloat(value);
                                                                        if (!isNaN(num) && (num < 113.85 || num > 116.15)) isFail = true;
                                                                    }

                                                                    return (
                                                                        <td key={i} className={isFail ? 'text-danger' : 'text-success'}>
                                                                            {value || 'N/A'}
                                                                            {["Volt", "L1", "L2", "L3"].includes(key) && value ? 'V' : ''}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
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
                            <button className="btn btn-secondary px-5 fw-bold" onClick={() => setSelectedUnit(null)}>CLOSE ANALYSIS</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoGoodUnits;