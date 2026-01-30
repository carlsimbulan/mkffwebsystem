import React, { useState } from 'react';

export const EditUnitModal = ({ unit, onClose, onSave }) => {
    const isReopening = unit.status === 'Completed' || unit.status === 'No Good (NG)';
    const initialStatus = isReopening ? 'Pending Approval' : unit.status;
    
    const [status, setStatus] = useState(initialStatus);
    const [remarks, setRemarks] = useState(unit.remarks || "");
    const [showChecklist, setShowChecklist] = useState(true);

    // --- STATION 1 CHECKLIST STATE ---
    const [s1Readings, setS1Readings] = useState({
        header_seated_90_deg: "GO",
        leads_properly_soldered: "GO"
    });

    // --- STATION 2 COMPLETE TECHNICAL READINGS (SAME AS STATION 6) ---
    const [s2Readings, setS2Readings] = useState({
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
        test_duration: "120",
        sw1_off_to_led_off_duration: "0"
    });

    // --- STATION 3, 4, 5, 7, 9, 10, 13, 14: STANDARD CHECKLIST ---
    const [s3Readings, setS3Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s4Readings, setS4Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s5Readings, setS5Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s7Readings, setS7Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s9Readings, setS9Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s10Readings, setS10Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s13Readings, setS13Readings] = useState({ requirements: "Passed", remarks: "" });
    const [s14Readings, setS14Readings] = useState({ requirements: "Passed", remarks: "" });

    // --- STATION 8: BURN-IN TESTING ---
    const [s8Readings, setS8Readings] = useState({
        power_unit_disable_lora: "Passed",
        frequency_band: "Complete",
        test_input_fields: "",
        rsso_testing: "Passed",
        data_outage: "Passed"
    });

    // --- STATION 11: CONNECTIVITY TESTING ---
    const [s11Readings, setS11Readings] = useState({
        led_status: "SOLID GREEN",
        low_range: "PASSED",
        medium_range: "PASSED",
        high_range: "PASSED"
    });

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
        test_duration: "120",
        sw1_off_to_led_off_duration: "0"
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
            return (
                s2Readings.lora_module !== "Detected" ||
                s2Readings.lora_mesh_test !== "Detected" || 
                s2Readings.energy_meter !== "Detected" ||
                s2Readings.power_good_test !== "Detected" ||
                getVoltageStatus(s2Readings.voltage) === "FAIL" ||
                getVoltageStatus(s2Readings.line1) === "FAIL" ||
                getVoltageStatus(s2Readings.line2) === "FAIL" ||
                getVoltageStatus(s2Readings.line3) === "FAIL" ||
                s2Readings.led_status_4g !== "GO" ||
                s2Readings.led_status_fast_blink !== "GO" ||
                s2Readings.go_no_go !== "GO"
            );
        }
        if (stn === "Station6") {
            return (
                s6Readings.lora_module !== "Detected" ||
                s6Readings.lora_mesh_test !== "Detected" || 
                s6Readings.energy_meter !== "Detected" ||
                s6Readings.power_good_test !== "Detected" ||
                getVoltageStatus(s6Readings.voltage) !== "PASS" ||
                getVoltageStatus(s6Readings.line1) !== "PASS" ||
                getVoltageStatus(s6Readings.line2) !== "PASS" ||
                getVoltageStatus(s6Readings.line3) !== "PASS" ||
                s6Readings.led_status_4g !== "GO" ||
                s6Readings.led_status_fast_blink !== "GO" ||
                s6Readings.go_no_go !== "GO"
            );
        }
        // Standard stations (3, 4, 5, 7, 9, 10, 13, 14)
        if (stn === "Station3") return s3Readings.requirements !== "Passed";
        if (stn === "Station4") return s4Readings.requirements !== "Passed";
        if (stn === "Station5") return s5Readings.requirements !== "Passed";
        if (stn === "Station7") return s7Readings.requirements !== "Passed";
        if (stn === "Station9") return s9Readings.requirements !== "Passed";
        if (stn === "Station10") return s10Readings.requirements !== "Passed";
        if (stn === "Station13") return s13Readings.requirements !== "Passed";
        if (stn === "Station14") return s14Readings.requirements !== "Passed";
        
        // Station 8: Burn-in testing
        if (stn === "Station8") {
            return s8Readings.power_unit_disable_lora !== "Passed" ||
                   s8Readings.frequency_band !== "Complete" ||
                   s8Readings.rsso_testing !== "Passed" ||
                   s8Readings.data_outage !== "Passed";
        }
        
        // Station 11: Connectivity testing
        if (stn === "Station11") {
            return s11Readings.led_status !== "SOLID GREEN" ||
                   s11Readings.low_range !== "PASSED" ||
                   s11Readings.medium_range !== "PASSED" ||
                   s11Readings.high_range !== "PASSED";
        }

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
        // Standard stations (3, 4, 5, 7, 9, 10, 13, 14)
        if (stn === "Station3") finalChecklistData = s3Readings;
        else if (stn === "Station4") finalChecklistData = s4Readings;
        else if (stn === "Station5") finalChecklistData = s5Readings;
        else if (stn === "Station7") finalChecklistData = s7Readings;
        else if (stn === "Station8") finalChecklistData = s8Readings;
        else if (stn === "Station9") finalChecklistData = s9Readings;
        else if (stn === "Station10") finalChecklistData = s10Readings;
        else if (stn === "Station11") finalChecklistData = s11Readings;
        else if (stn === "Station13") finalChecklistData = s13Readings;
        else if (stn === "Station14") finalChecklistData = s14Readings;

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

    const isRemarksError = !remarks || remarks.trim() === "";

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
                        {(unit.station === "Station 1" || unit.station === "Station1") && (
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

                        {/* --- STATION 2: FULL TECHNICAL READINGS (SAME AS STATION 6) --- */}
                        {(unit.station === "Station 2" || unit.station === "Station2") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase">
                                    <i className="bi bi-broadcast me-2"></i> Station 2: Integrated Board Test
                                </h6>
                                <div className="row g-3">
                                    {/* Hardware Detection */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Module</label>
                                        <select className="form-select form-select-sm" value={s2Readings.lora_module} onChange={(e) => setS2Readings({...s2Readings, lora_module: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Mesh Test</label>
                                        <select className="form-select form-select-sm" value={s2Readings.lora_mesh_test} onChange={(e) => setS2Readings({...s2Readings, lora_mesh_test: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Energy Meter</label>
                                        <select className="form-select form-select-sm" value={s2Readings.energy_meter} onChange={(e) => setS2Readings({...s2Readings, energy_meter: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Power Good Test</label>
                                        <select className="form-select form-select-sm" value={s2Readings.power_good_test} onChange={(e) => setS2Readings({...s2Readings, power_good_test: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>

                                    {/* Voltage Readings */}
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Voltage (Ref)</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s2Readings.voltage) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s2Readings.voltage} onChange={(e) => setS2Readings({...s2Readings, voltage: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 1</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s2Readings.line1) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s2Readings.line1} onChange={(e) => setS2Readings({...s2Readings, line1: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 2</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s2Readings.line2) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s2Readings.line2} onChange={(e) => setS2Readings({...s2Readings, line2: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 3</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s2Readings.line3) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s2Readings.line3} onChange={(e) => setS2Readings({...s2Readings, line3: e.target.value})} />
                                    </div>

                                    {/* Indicators and Timing */}
                                    <div className="col-md-2">
                                        <label className="small fw-bold">4G LED</label>
                                        <select className="form-select form-select-sm" value={s2Readings.led_status_4g} onChange={(e) => setS2Readings({...s2Readings, led_status_4g: e.target.value})}>
                                            <option value="GO">GO</option><option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Fast Blink RED</label>
                                        <select className="form-select form-select-sm" value={s2Readings.led_status_fast_blink} onChange={(e) => setS2Readings({...s2Readings, led_status_fast_blink: e.target.value})}>
                                            <option value="GO">GO</option><option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">SW1 Off to LED Off (sec)</label>
                                        <input type="number" className="form-control form-control-sm" value={s2Readings.sw1_off_to_led_off_duration} 
                                            onChange={(e) => setS2Readings({...s2Readings, sw1_off_to_led_off_duration: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Go/No-Go Result</label>
                                        <select className="form-select form-select-sm fw-bold" value={s2Readings.go_no_go} onChange={(e) => setS2Readings({...s2Readings, go_no_go: e.target.value})}>
                                            <option value="GO">GO (PASS)</option>
                                            <option value="NO GO">NO GO (FAIL)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 6: FULL TECHNICAL READINGS --- */}
                        {(unit.station.includes('6')) && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2 text-uppercase">
                                    <i className="bi bi-broadcast me-2"></i> Station 6: Final functional Test
                                </h6>
                                <div className="row g-3">
                                    {/* Hardware Detection */}
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Module</label>
                                        <select className="form-select form-select-sm" value={s6Readings.lora_module} onChange={(e) => setS6Readings({...s6Readings, lora_module: e.target.value})}>
                                            <option value="Detected">Detected</option>
                                            <option value="Not Detected">Not Detected</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">LoRa Mesh Test</label>
                                        <select className="form-select form-select-sm" value={s6Readings.lora_mesh_test} onChange={(e) => setS6Readings({...s6Readings, lora_mesh_test: e.target.value})}>
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

                                    {/* Voltage Readings */}
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Voltage (Ref)</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.voltage) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s6Readings.voltage} onChange={(e) => setS6Readings({...s6Readings, voltage: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 1</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line1) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s6Readings.line1} onChange={(e) => setS6Readings({...s6Readings, line1: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 2</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line2) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s6Readings.line2} onChange={(e) => setS6Readings({...s6Readings, line2: e.target.value})} />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Line 3</label>
                                        <input type="number" className={`form-control form-control-sm ${getVoltageStatus(s6Readings.line3) === 'FAIL' ? 'is-invalid' : 'is-valid'}`} 
                                            value={s6Readings.line3} onChange={(e) => setS6Readings({...s6Readings, line3: e.target.value})} />
                                    </div>

                                    {/* Indicators and Timing */}
                                    <div className="col-md-2">
                                        <label className="small fw-bold">4G LED</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_4g} onChange={(e) => setS6Readings({...s6Readings, led_status_4g: e.target.value})}>
                                            <option value="GO">GO</option><option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="small fw-bold">Fast Blink RED</label>
                                        <select className="form-select form-select-sm" value={s6Readings.led_status_fast_blink} onChange={(e) => setS6Readings({...s6Readings, led_status_fast_blink: e.target.value})}>
                                            <option value="GO">GO</option><option value="NO GO">NO GO</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">SW1 Off to LED Off (sec)</label>
                                        <input type="number" className="form-control form-control-sm" value={s6Readings.sw1_off_to_led_off_duration} 
                                            onChange={(e) => setS6Readings({...s6Readings, sw1_off_to_led_off_duration: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">Go/No-Go Result</label>
                                        <select className="form-select form-select-sm fw-bold" value={s6Readings.go_no_go} onChange={(e) => setS6Readings({...s6Readings, go_no_go: e.target.value})}>
                                            <option value="GO">GO (PASS)</option>
                                            <option value="NO GO">NO GO (FAIL)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 3: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 3" || unit.station === "Station3") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 3: RTV Application</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s3Readings.requirements} onChange={(e) => setS3Readings({...s3Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s3Readings.remarks} onChange={(e) => setS3Readings({...s3Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 4: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 4" || unit.station === "Station4") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 4: Casing/Harnessing</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s4Readings.requirements} onChange={(e) => setS4Readings({...s4Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s4Readings.remarks} onChange={(e) => setS4Readings({...s4Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 5: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 5" || unit.station === "Station5") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 5: Complete Unit Test/Calibration</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s5Readings.requirements} onChange={(e) => setS5Readings({...s5Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s5Readings.remarks} onChange={(e) => setS5Readings({...s5Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 7: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 7" || unit.station === "Station7") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 7: Pre BI Hi-Pot Test</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s7Readings.requirements} onChange={(e) => setS7Readings({...s7Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s7Readings.remarks} onChange={(e) => setS7Readings({...s7Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 8: BURN-IN TESTING --- */}
                        {showChecklist && (unit.station === "Station 8" || unit.station === "Station8") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 8: Burn-in Testing</h6>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="small fw-bold">1 Power Unit and Disable LoRa</label>
                                        <select className="form-select form-select-sm" value={s8Readings.power_unit_disable_lora} onChange={(e) => setS8Readings({...s8Readings, power_unit_disable_lora: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">2. Confirm Frequency Band</label>
                                        <select className="form-select form-select-sm" value={s8Readings.frequency_band} onChange={(e) => setS8Readings({...s8Readings, frequency_band: e.target.value})}>
                                            <option value="Complete">Complete</option>
                                            <option value="Not Complete">Not Complete</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">3. Start Testing</label>
                                        <input type="text" className="form-control form-control-sm" value={s8Readings.start_testing} onChange={(e) => setS8Readings({...s8Readings, start_testing: e.target.value})} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">4. Confirm RSSO Testing</label>
                                        <select className="form-select form-select-sm" value={s8Readings.rsso_testing} onChange={(e) => setS8Readings({...s8Readings, rsso_testing: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold">5. Data Outage</label>
                                        <select className="form-select form-select-sm" value={s8Readings.data_outage} onChange={(e) => setS8Readings({...s8Readings, data_outage: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 9: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 9" || unit.station === "Station9") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 9: Sealing</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s9Readings.requirements} onChange={(e) => setS9Readings({...s9Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s9Readings.remarks} onChange={(e) => setS9Readings({...s9Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 10: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 10" || unit.station === "Station10") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 10: Post BI Hi-Pot Test</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s10Readings.requirements} onChange={(e) => setS10Readings({...s10Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s10Readings.remarks} onChange={(e) => setS10Readings({...s10Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 11: CONNECTIVITY TESTING --- */}
                        {showChecklist && (unit.station === "Station 11" || unit.station === "Station11") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 11: Final Functional/Connectivity Test</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="small fw-bold">LED Status</label>
                                        <select className="form-select form-select-sm" value={s11Readings.led_status} onChange={(e) => setS11Readings({...s11Readings, led_status: e.target.value})}>
                                            <option value="SOLID GREEN">SOLID GREEN</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small fw-bold">Low Range</label>
                                        <select className="form-select form-select-sm" value={s11Readings.low_range} onChange={(e) => setS11Readings({...s11Readings, low_range: e.target.value})}>
                                            <option value="PASSED">PASSED</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small fw-bold">Medium Range</label>
                                        <select className="form-select form-select-sm" value={s11Readings.medium_range} onChange={(e) => setS11Readings({...s11Readings, medium_range: e.target.value})}>
                                            <option value="PASSED">PASSED</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small fw-bold">High Range</label>
                                        <select className="form-select form-select-sm" value={s11Readings.high_range} onChange={(e) => setS11Readings({...s11Readings, high_range: e.target.value})}>
                                            <option value="PASSED">PASSED</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 13: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 13" || unit.station === "Station13") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 13: Label Sticker Attachment</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s13Readings.requirements} onChange={(e) => setS13Readings({...s13Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s13Readings.remarks} onChange={(e) => setS13Readings({...s13Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- STATION 14: STANDARD CHECKLIST --- */}
                        {showChecklist && (unit.station === "Station 14" || unit.station === "Station14") && (
                            <div className="mt-2 p-3 border rounded bg-white border-primary shadow-sm">
                                <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">STATION 14: FVI</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Requirements</label>
                                        <select className="form-select form-select-sm" value={s14Readings.requirements} onChange={(e) => setS14Readings({...s14Readings, requirements: e.target.value})}>
                                            <option value="Passed">Passed</option>
                                            <option value="Not Passed">Not Passed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Remarks</label>
                                        <input type="text" className="form-control form-control-sm" value={s14Readings.remarks} onChange={(e) => setS14Readings({...s14Readings, remarks: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

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