import React, { useState } from 'react';

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    const isReopening = unit.status === 'Completed' || unit.status === 'No Good (NG)';
    const initialStatus = isReopening ? 'Pending Approval' : unit.status;
    
    const [status, setStatus] = useState(initialStatus);
    const [remarks, setRemarks] = useState(unit.remarks || "");

    // --- STATION 6 COMPLETE TECHNICAL READINGS (Base sa Excel & DB mo) ---
    const [s6Readings, setS6Readings] = useState({
        lora_module: "Detected",
        energy_meter: "Detected",
        power_good_test: "Detected",
        voltage: "115",
        line1: "115",
        line2: "115",
        line3: "115",
        temp_reading: "PASS",
        freq_reading: "GO",
        led_status_4g: "GO",
        led_status_fast_blink: "GO",
        go_no_go: "GO",
        test_duration: "120"
    });

    const getVoltageStatus = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "PENDING";
        return (num >= 113.85 && num <= 116.15) ? "PASS" : "FAIL";
    };

    const handleSave = () => {
        if (unit.station === "Station6" && status === "Completed") {
            const vStatus = getVoltageStatus(s6Readings.voltage);
            if (!s6Readings.voltage || vStatus === "FAIL") {
                alert(`⚠️ INVALID VOLTAGE: ${s6Readings.voltage}V is out of range! (115V +/- 1%)`);
                return;
            }
        }

        onSave(unit.id, { 
            ...unit, 
            status: status, 
            remarks: remarks,
            checklist_data: unit.station === "Station6" ? s6Readings : null 
        });
    };

    const statusOptions = isReopening 
        ? ["Pending Approval"] 
        : ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className={`modal-dialog modal-dialog-centered ${unit.station === 'Station6' ? 'modal-xl' : ''}`}>
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

                        {/* --- STATION 6 FULL TECHNICAL CHECKLIST --- */}
                        {unit.station === "Station6" && status === "Completed" && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">
                                    <i className="bi bi-clipboard-check me-2"></i>TECHNICAL CHECKLIST (STATION 6)
                                </h6>
                                
                                <div className="row g-3">
                                    {/* FIRST ROW: CORE COMPONENTS */}
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
                                        <label className="small fw-bold text-primary">Main Voltage (115V)</label>
                                        <input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.voltage) === 'PASS' ? 'is-valid' : 'is-invalid'}`} 
                                            value={s6Readings.voltage} onChange={(e) => setS6Readings({...s6Readings, voltage: e.target.value})} />
                                    </div>

                                    {/* SECOND ROW: LINE READINGS */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Line 1 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line1} onChange={(e) => setS6Readings({...s6Readings, line1: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Line 2 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line2} onChange={(e) => setS6Readings({...s6Readings, line2: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Line 3 Reading</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.line3} onChange={(e) => setS6Readings({...s6Readings, line3: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Temp Reading</label>
                                        <select className="form-select form-select-sm" value={s6Readings.temp_reading} onChange={(e) => setS6Readings({...s6Readings, temp_reading: e.target.value})}>
                                            <option value="PASS">PASS</option>
                                            <option value="FAIL">FAIL</option>
                                        </select>
                                    </div>

                                    {/* THIRD ROW: LEDS & CONNECTIVITY */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Freq Reading</label>
                                        <select className="form-select form-select-sm" value={s6Readings.freq_reading} onChange={(e) => setS6Readings({...s6Readings, freq_reading: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">4G LED Status</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_4g} onChange={(e) => setS6Readings({...s6Readings, led_status_4g: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Fast Blink RED</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_fast_blink} onChange={(e) => setS6Readings({...s6Readings, led_status_fast_blink: e.target.value})}>
                                            <option value="GO">GO</option>
                                            <option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
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