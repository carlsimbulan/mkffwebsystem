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
        <div className="pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0">No Good (NG) Units</h3>
                    <p className="text-muted small mb-0">Master list of all non-conforming units across stations</p>
                </div>
                <span className="badge bg-danger rounded-pill px-3 py-2">Total: {allNoGoodLogs.length}</span>
            </div>

            <div className="bg-white border rounded-2 overflow-hidden shadow-sm mx-2">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-dark">
                        <tr>
                            <th className="ps-4">MODEL</th>
                            <th>REVISION</th>
                            <th>BASE UNIT</th>
                            <th>ASSEMBLY</th>
                            <th>DEVICE SERIAL</th>
                            <th>ACCESSORY</th>
                            <th className="text-danger">ERROR STATION</th>
                            <th>STATUS</th>
                            <th>LAST MOVEMENT</th>
                            <th className="text-center pe-4">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allNoGoodLogs.map(log => (
                            <tr key={log.id}>
                                <td className="ps-4 fw-bold">{log.model}</td>
                                <td className="text-muted">{log.revision || '---'}</td>
                                <td>{log.base_unit_kitting_no || '---'}</td>
                                <td>
                                    <code className="text-primary fw-bold">{log.assembly_no}</code>
                                </td>
                                <td className="fw-bold">{log.device_serial_no}</td>
                                <td>{log.accessory_kitting_no || '---'}</td>
                                <td>
                                    <span className="fw-bold text-danger">
                                        <i className="bi bi-geo-alt-fill me-1"></i>
                                        {log.station_name || log.station || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge bg-danger text-white rounded-1 px-3">
                                        {log.status}
                                    </span>
                                </td>
                                <td className="small text-muted">
                                    {formatTimestamp(log.updated_at || log.created_at)}
                                </td>
                                <td className="text-center pe-4">
                                    <div className="d-flex gap-1 justify-content-center">
                                        <button className="btn btn-sm btn-primary px-3 fw-bold" onClick={() => setSelectedUnit(log)}>DETAILS</button>
                                        <button className="btn btn-sm btn-outline-danger px-3 fw-bold" onClick={() => handleEditClick(log)}>MANAGE</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '850px' }}>
                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-danger shadow-sm">
                            <div><h5 className="mb-0 fw-bold">Unit Analysis | SN: {selectedUnit.device_serial_no}</h5></div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnit(null)}></button>
                        </div>

                        <div className="p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            <div className="process-timeline mt-4 ps-2">
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

            <style>{`
                .modal-step { padding: 15px 20px; border-left: 2px solid #e9ecef; position: relative; cursor: pointer; }
                .modal-dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: #dee2e6; border: 2px solid white; z-index: 2; }
                .done .modal-dot { background: #198754; }
                .active-ng .modal-dot { background: #dc3545; }
                .tracker-checklist-box { background: #f8fafc; border-radius: 8px; margin-top: 10px; }
                .tracker-table th { background: #f1f5f9; padding: 8px; border-bottom: 1px solid #cbd5e1; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; }
                .tracker-table td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700; }
            `}</style>
        </div>
    );
};

export { NoGoodUnits };