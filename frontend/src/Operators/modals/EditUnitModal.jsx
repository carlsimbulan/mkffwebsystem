import React, { useState } from 'react';

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    const isReopening = unit.status === 'Completed' || unit.status === 'No Good (NG)';
    const initialStatus = isReopening ? 'Pending Approval' : unit.status;
    
    const [status, setStatus] = useState(initialStatus);
    const [remarks, setRemarks] = useState(unit.remarks || "");

    // --- STATION 1 CHECKLIST STATE ---
    const [s1Readings, setS1Readings] = useState({
        header_seated_90_deg: "GO",
        leads_properly_soldered: "GO"
    });

    // --- STATION 2 CHECKLIST STATE (NEW ADDITION) ---
    const [s2Readings, setS2Readings] = useState({
        integrated_board_level_test1: "Detected",
        integrated_board_level_test2: "Detected",
        integrated_board_level_test3: "Detected"
    });

    // --- STATION 6 COMPLETE TECHNICAL READINGS (Updated to match Client Excel exactly) ---
    const [s6Readings, setS6Readings] = useState({
        lora_module: "Detected",
        energy_meter: "Detected",
        power_good_test: "Detected",
        power_good_not_detected: "Not Detected", // Added based on image_3f3528.png
        lora_mesh_test: "Detected",             // Added based on image_3f3528.png
        voltage: "115",
        line1: "115",
        line2: "115",
        line3: "115",
        temp_reading: "PASS",
        freq_reading: "GO",                     // Frequency Reading field
        led_status_4g: "GO",                    // 4G Connectivity LED
        led_status_fast_blink: "GO",            // Fast Blink RED LED
        go_no_go: "GO",
        test_duration: "120"
    });

    const getVoltageStatus = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "PENDING";
        // Client Range: 115 +/- 1% (113.85V to 116.15V)
        return (num >= 113.85 && num <= 116.15) ? "PASS" : "FAIL";
    };

    const handleSave = () => {
        // Validation for Station 6 Voltage
        if (unit.station === "Station6" && status === "Completed") {
            const vStatus = getVoltageStatus(s6Readings.voltage);
            if (!s6Readings.voltage || vStatus === "FAIL") {
                alert(`⚠️ INVALID VOLTAGE: ${s6Readings.voltage}V is out of range! Standard: 115V +/- 1% (113.85V - 116.15V).`);
                return;
            }
        }

        // Logic to determine which checklist data to send
        let finalChecklistData = null;
        const stationKey = unit.station.replace(/\s+/g, ''); // Handles "Station 2" or "Station2"

        if (stationKey === "Station 1" || stationKey === "Station1") {
            finalChecklistData = s1Readings;
        } else if (stationKey === "Station 2" || stationKey === "Station2") {
            finalChecklistData = s2Readings;
        } else if (stationKey === "Station6") {
            finalChecklistData = s6Readings;
        }

        onSave(unit.id, { 
            ...unit, 
            status: status, 
            remarks: remarks,
            checklist_data: finalChecklistData
        });
    };

    const statusOptions = isReopening 
        ? ["Pending Approval"] 
        : ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className={`modal-dialog modal-dialog-centered ${unit.station === 'Station6' ? 'modal-xl' : 'modal-lg'}`}>
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit Unit: {unit.device_serial_no || unit.assembly_no}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-muted">STATION</label>
                                <input type="text" className="form-control bg-light fw-bold" value={unit.station} disabled />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-muted">CHANGE STATUS</label>
                                <select className="form-select fw-bold" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isReopening}>
                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* --- STATION 1 CHECKLIST --- */}
                        {(unit.station === "Station 1" || unit.station === "Station1") && status === "Completed" && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">
                                    <i className="bi bi-clipboard-check me-2"></i>PCB PAIRING CHECKLIST (STATION 1)
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Header Connector Upright (90°)</label>
                                        <select className="form-select form-select-sm" value={s1Readings.header_seated_90_deg} onChange={(e) => setS1Readings({...s1Readings, header_seated_90_deg: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Leads Properly & Completely Soldered</label>
                                        <select className="form-select form-select-sm" value={s1Readings.leads_properly_soldered} onChange={(e) => setS1Readings({...s1Readings, leads_properly_soldered: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 2 CHECKLIST (Integrated Board Test) --- */}
                        {(unit.station === "Station 2" || unit.station === "Station2") && status === "Completed" && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase">
                                    <i className="bi bi-cpu me-2"></i> Integrated Board Test (Station 2)
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="small fw-bold">Integrated Board Level Test 1</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test1} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test1: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small fw-bold">Integrated Board Level Test 2</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test2} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test2: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small fw-bold">Integrated Board Level Test 3</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test3} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test3: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 6 FULL TECHNICAL CHECKLIST (Client Updated) --- */}
                        {unit.station === "Station6" && status === "Completed" && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase">
                                    <i className="bi bi-clipboard-check me-2"></i>Complete Unit Test & Calibration (Station 6)
                                </h6>
                                
                                <div className="row g-3">
                                    {/* Detection Row */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Module</label>
                                        <select className="form-select form-select-sm" value={s6Readings.lora_module} onChange={(e) => setS6Readings({...s6Readings, lora_module: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Energy Meter</label>
                                        <select className="form-select form-select-sm" value={s6Readings.energy_meter} onChange={(e) => setS6Readings({...s6Readings, energy_meter: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Power Good Test</label>
                                        <select className="form-select form-select-sm" value={s6Readings.power_good_test} onChange={(e) => setS6Readings({...s6Readings, power_good_test: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Power Good Not Detected</label>
                                        <select className="form-select form-select-sm" value={s6Readings.power_good_not_detected} onChange={(e) => setS6Readings({...s6Readings, power_good_not_detected: e.target.value})}>
                                            <option value="Not Detected">Not Detected</option>
                                            <option value="Detected">Detected</option>
                                        </select>
                                    </div>

                                    {/* Connectivity & Mesh */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Mesh Test</label>
                                        <select className="form-select form-select-sm" value={s6Readings.lora_mesh_test} onChange={(e) => setS6Readings({...s6Readings, lora_mesh_test: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-primary">Voltage (115V +/- 1%)</label>
                                        <input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.voltage) === 'PASS' ? 'is-valid' : 'is-invalid'}`} 
                                            value={s6Readings.voltage} onChange={(e) => setS6Readings({...s6Readings, voltage: e.target.value})} />
                                    </div>

                                    {/* Line Readings */}
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 1 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line1} onChange={(e) => setS6Readings({...s6Readings, line1: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 2 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line2} onChange={(e) => setS6Readings({...s6Readings, line2: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 3 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line3} onChange={(e) => setS6Readings({...s6Readings, line3: e.target.value})} />
                                    </div>

                                    {/* Temperature & Frequency */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Temp Reading</label>
                                        <select className="form-select form-select-sm" value={s6Readings.temp_reading} onChange={(e) => setS6Readings({...s6Readings, temp_reading: e.target.value})}>
                                            <option value="PASS">PASS</option>
                                            <option value="FAIL">FAIL</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Frequency Reading</label>
                                        <select className="form-select form-select-sm" value={s6Readings.freq_reading} onChange={(e) => setS6Readings({...s6Readings, freq_reading: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>

                                    {/* LED Statuses */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">4G LED Connectivity</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_4g} onChange={(e) => setS6Readings({...s6Readings, led_status_4g: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Fast Blink RED Status</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_fast_blink} onChange={(e) => setS6Readings({...s6Readings, led_status_fast_blink: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>

                                    {/* Final Verdict */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-danger">FINAL GO/NO GO</label>
                                        <select className="form-select form-select-sm fw-bold border-danger" value={s6Readings.go_no_go} onChange={(e) => setS6Readings({...s6Readings, go_no_go: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-3">
                            <label className="form-label fw-bold small text-muted">REMARKS / OBSERVATIONS</label>
                            <textarea className="form-control" rows="2" value={remarks} placeholder="Technical notes..." onChange={(e) => setRemarks(e.target.value)}></textarea>
                        </div>
                    </div>

                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleSave}>
                            <i className="bi bi-save me-2"></i>Save Unit Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};