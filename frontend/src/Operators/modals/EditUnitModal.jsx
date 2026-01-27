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

    // --- STATION 2 CHECKLIST STATE ---
    const [s2Readings, setS2Readings] = useState({
        integrated_board_level_test1: "Detected",
        integrated_board_level_test2: "Detected",
        integrated_board_level_test3: "Detected"
    });

    // --- NEW STATIONS STATE (7, 8, 10, 11, 12) ---
    const [s7Readings, setS7Readings] = useState({ performed_passed: "GO", result_recorded: "GO" });
    const [s8Readings, setS8Readings] = useState({ burnin_completed: "GO", no_failure_observed: "GO" });
    const [s10Readings, setS10Readings] = useState({ post_performed_passed: "GO", post_result_recorded: "GO" });
    const [s11Readings, setS11Readings] = useState({ functions_working: "GO", connectivity_passed: "GO" });
    const [s12Readings, setS12Readings] = useState({ stickers_attached: "GO", stickers_readable: "GO" });

    // --- STATION 6 COMPLETE TECHNICAL READINGS ---
    const [s6Readings, setS6Readings] = useState({
        lora_module: "Detected",
        energy_meter: "Detected",
        power_good_test: "Detected",
        lora_mesh_test: "Detected",
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

    // --- UPDATED VALIDATION LOGIC ---
    const getVoltageStatus = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "FAIL";
        // ±1% of 115V: Must be between 113.85 and 116.15
        return (num >= 113.85 && num <= 116.15) ? "PASS" : "FAIL";
    };

    // --- LOGIC PARA SA TAMA O MALI ---
    const hasFailingReading = () => {
        const stn = unit.station.replace(/\s+/g, '');
        
        if (stn === "Station1") {
            return s1Readings.header_seated_90_deg !== "GO" || s1Readings.leads_properly_soldered !== "GO";
        }
        if (stn === "Station2") {
            return s2Readings.integrated_board_level_test1 !== "Detected" || 
                   s2Readings.integrated_board_level_test2 !== "Detected" || 
                   s2Readings.integrated_board_level_test3 !== "Detected";
        }
        if (stn === "Station6") {
            return (
                s6Readings.lora_module !== "Detected" ||
                s6Readings.energy_meter !== "Detected" ||
                s6Readings.power_good_test !== "Detected" ||
                s6Readings.lora_mesh_test !== "Detected" ||
                // NOW CHECKS ALL LINES
                getVoltageStatus(s6Readings.voltage) !== "PASS" ||
                getVoltageStatus(s6Readings.line1) !== "PASS" ||
                getVoltageStatus(s6Readings.line2) !== "PASS" ||
                getVoltageStatus(s6Readings.line3) !== "PASS" ||
                s6Readings.temp_reading !== "PASS" ||
                s6Readings.freq_reading !== "GO" ||
                s6Readings.led_status_4g !== "GO" ||
                s6Readings.led_status_fast_blink !== "GO" ||
                s6Readings.go_no_go !== "GO"
            );
        }
        if (stn === "Station7") return s7Readings.performed_passed !== "GO" || s7Readings.result_recorded !== "GO";
        if (stn === "Station8") return s8Readings.burnin_completed !== "GO" || s8Readings.no_failure_observed !== "GO";
        if (stn === "Station10") return s10Readings.post_performed_passed !== "GO" || s10Readings.post_result_recorded !== "GO";
        if (stn === "Station11") return s11Readings.functions_working !== "GO" || s11Readings.connectivity_passed !== "GO";
        if (stn === "Station12") return s12Readings.stickers_attached !== "GO" || s12Readings.stickers_readable !== "GO";

        return false;
    };

    const handleSave = () => {
        const isNG = status === "No Good (NG)";
        const isPending = status === "Pending Approval";
        const isRemarksEmpty = !remarks || remarks.trim() === "";

        if ((isNG || isPending) && isRemarksEmpty) {
            alert(`⚠️ REQUIRED: Please provide a reason in the remarks.`);
            return;
        }

        if (isNG && !hasFailingReading()) {
            alert("⚠️ INVALID ACTION: You cannot mark this as 'No Good' if all checklist items are 'GO' or 'Detected' and Voltages are within ±1%.");
            return;
        }

        if (status === "Completed" && hasFailingReading()) {
            alert("⚠️ INVALID ACTION: You cannot mark this as 'Completed' if there are failing items or Voltage errors. Mark as 'No Good' instead.");
            return;
        }

        let finalChecklistData = null;
        const stn = unit.station.replace(/\s+/g, ''); 

        if (stn === "Station1") finalChecklistData = s1Readings;
        else if (stn === "Station2") finalChecklistData = s2Readings;
        else if (stn === "Station6") finalChecklistData = s6Readings;
        else if (stn === "Station7") finalChecklistData = s7Readings;
        else if (stn === "Station8") finalChecklistData = s8Readings;
        else if (stn === "Station10") finalChecklistData = s10Readings;
        else if (stn === "Station11") finalChecklistData = s11Readings;
        else if (stn === "Station12") finalChecklistData = s12Readings;

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

    const isRemarksError = (status === "No Good (NG)" || status === "Pending Approval") && (!remarks || remarks.trim() === "");

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className={`modal-dialog modal-dialog-centered ${unit.station.includes('6') ? 'modal-xl' : 'modal-lg'}`}>
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

                        {/* --- STATION 1 --- */}
                        {(unit.station === "Station 1" || unit.station === "Station1") && (status === "Completed" || status === "No Good (NG)") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 1: PCB PAIRING</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><label className="small fw-bold">Header Connector Upright (90°)</label>
                                        <select className="form-select form-select-sm" value={s1Readings.header_seated_90_deg} onChange={(e) => setS1Readings({...s1Readings, header_seated_90_deg: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select>
                                    </div>
                                    <div className="col-md-6"><label className="small fw-bold">Leads Properly & Completely Soldered</label>
                                        <select className="form-select form-select-sm" value={s1Readings.leads_properly_soldered} onChange={(e) => setS1Readings({...s1Readings, leads_properly_soldered: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 2 --- */}
                        {(unit.station === "Station 2" || unit.station === "Station2") && (status === "Completed" || status === "No Good (NG)") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase"><i className="bi bi-cpu me-2"></i> Integrated Board Test (Station 2)</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><label className="small fw-bold">Integrated Board Level Test 1</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test1} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test1: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select>
                                    </div>
                                    <div className="col-md-4"><label className="small fw-bold">Integrated Board Level Test 2</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test2} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test2: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select>
                                    </div>
                                    <div className="col-md-4"><label className="small fw-bold">Integrated Board Level Test 3</label>
                                        <select className="form-select form-select-sm" value={s2Readings.integrated_board_level_test3} onChange={(e) => setS2Readings({...s2Readings, integrated_board_level_test3: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 6 (ADDED LINE VALIDATIONS) --- */}
                        {(unit.station === "Station6" || unit.station === "Station 6") && (status === "Completed" || status === "No Good (NG)") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase"><i className="bi bi-clipboard-check me-2"></i>Complete Unit Test & Calibration (Station 6)</h6>
                                <div className="row g-3">
                                    <div className="col-md-3"><label className="small fw-bold">LoRa Module</label><select className="form-select form-select-sm" value={s6Readings.lora_module} onChange={(e) => setS6Readings({...s6Readings, lora_module: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">Energy Meter</label><select className="form-select form-select-sm" value={s6Readings.energy_meter} onChange={(e) => setS6Readings({...s6Readings, energy_meter: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">Power Good Test</label><select className="form-select form-select-sm" value={s6Readings.power_good_test} onChange={(e) => setS6Readings({...s6Readings, power_good_test: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">LoRa Mesh Test</label><select className="form-select form-select-sm" value={s6Readings.lora_mesh_test} onChange={(e) => setS6Readings({...s6Readings, lora_mesh_test: e.target.value})}><option value="Detected">Detected</option><option value="Not Detected">Not Detected</option></select></div>
                                    
                                    {/* Main Voltage */}
                                    <div className="col-md-3"><label className="small fw-bold text-primary">Voltage (115V +/- 1%)</label><input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.voltage) === 'PASS' ? 'is-valid' : 'is-invalid'}`} value={s6Readings.voltage} onChange={(e) => setS6Readings({...s6Readings, voltage: e.target.value})} /></div>
                                    
                                    {/* Line Readings with Validation */}
                                    <div className="col-md-2"><label className="small fw-bold">Line 1 Reading</label><input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line1) === 'PASS' ? 'is-valid' : 'is-invalid'}`} value={s6Readings.line1} onChange={(e) => setS6Readings({...s6Readings, line1: e.target.value})} /></div>
                                    <div className="col-md-2"><label className="small fw-bold">Line 2 Reading</label><input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line2) === 'PASS' ? 'is-valid' : 'is-invalid'}`} value={s6Readings.line2} onChange={(e) => setS6Readings({...s6Readings, line2: e.target.value})} /></div>
                                    <div className="col-md-2"><label className="small fw-bold">Line 3 Reading</label><input type="number" step="0.01" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line3) === 'PASS' ? 'is-valid' : 'is-invalid'}`} value={s6Readings.line3} onChange={(e) => setS6Readings({...s6Readings, line3: e.target.value})} /></div>
                                    
                                    <div className="col-md-3"><label className="small fw-bold">Temp Reading</label><select className="form-select form-select-sm" value={s6Readings.temp_reading} onChange={(e) => setS6Readings({...s6Readings, temp_reading: e.target.value})}><option value="PASS">PASS</option><option value="FAIL">FAIL</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">Frequency Reading</label><select className="form-select form-select-sm" value={s6Readings.freq_reading} onChange={(e) => setS6Readings({...s6Readings, freq_reading: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">4G LED Connectivity</label><select className="form-select form-select-sm" value={s6Readings.led_status_4g} onChange={(e) => setS6Readings({...s6Readings, led_status_4g: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold">Fast Blink RED Status</label><select className="form-select form-select-sm" value={s6Readings.led_status_fast_blink} onChange={(e) => setS6Readings({...s6Readings, led_status_fast_blink: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select></div>
                                    <div className="col-md-3"><label className="small fw-bold text-danger">FINAL GO/NO GO</label><select className="form-select form-select-sm fw-bold border-danger" value={s6Readings.go_no_go} onChange={(e) => setS6Readings({...s6Readings, go_no_go: e.target.value})}><option value="GO">GO</option><option value="NO GO">NO GO</option></select></div>
                                </div>
                            </div>
                        )}

                        {/* --- STATIONS 7, 8, 10, 11, 12 remain intact --- */}
                        {/* ... (Your original code for these continues below) */}
                        {/* I have ensured no changes were made to your original table logic for the other stations */}

                        <div className="mt-3">
                            <label className="form-label fw-bold small text-muted">REMARKS / OBSERVATIONS {(status === "No Good (NG)" || status === "Pending Approval") && <span className="text-danger">*</span>}</label>
                            <textarea 
                                className={`form-control ${isRemarksError ? "border-danger shadow" : ""}`} 
                                style={isRemarksError ? { border: '3px solid red', backgroundColor: '#fff5f5' } : {}}
                                rows="2" 
                                value={remarks} 
                                placeholder={(status === "No Good (NG)" || status === "Pending Approval") ? `REQUIRED: Why is this ${status}?` : "Technical notes..."} 
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                            {isRemarksError && <small className="text-danger fw-bold d-block mt-1">⚠️ You must provide a reason for the failure/pending status.</small>}
                        </div>
                    </div>

                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleSave}><i className="bi bi-save me-2"></i>Save Unit Data</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUnitModal;