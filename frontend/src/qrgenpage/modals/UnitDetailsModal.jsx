import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PROCESS_STATIONS = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

// Helper function to validate voltage tolerance (±1% of 115V = 113.85 to 116.15)
const getVoltageErrorStatus = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return true;
    return num < 113.85 || num > 116.15;
};

// Helper function to format display values consistently
const formatDisplayValue = (value) => {
    if (value === null || value === undefined || value === "") return 'Empty';
    return value;
};

// Helper function to determine if a value represents an error
const isErrorValue = (value, key) => {
    if (value === null || value === undefined || value === "N/A" || value === "" || value === "Empty") return true;
    const stringValue = String(value).toUpperCase();
    
    // Check for exact success matches first - only these should be GREEN
    const exactSuccessStrings = ["GO", "DETECTED", "PASSED", "SOLID GREEN"];
    if (exactSuccessStrings.some(success => stringValue === success)) return false;
    
    // Check for exact error matches
    const exactErrorStrings = ["NOT DETECTED", "NO GO", "FAIL", "N/A", "NO PASSED", "NOT PASSED", "NOT COMPLETE", "FAILED", "BLINKING", "OFF", "RED"];
    if (exactErrorStrings.some(error => stringValue === error)) return true;
    
    // Special handling for LED status - only "SOLID GREEN" is not an error
    if (key && key.includes("LED STATUS") && stringValue !== "SOLID GREEN" && stringValue !== "GO") return true;
    
    // Special handling for Go/No-Go fields - only "GO" is not an error
    if (key && key.includes("GO_NO_GO") && stringValue !== "GO") return true;
    
    if (key && (key.includes("V(") || key.includes("L1") || key.includes("L2") || key.includes("L3"))) {
        const numericValue = parseFloat(stringValue.replace("V", ""));
        return getVoltageErrorStatus(numericValue);
    }
    
    return false;
};

// Helper function to render station checklists
const renderStationChecklist = (stationNumber, unit) => {
    switch(stationNumber) {
        case 1:
            return (
                <div className="row g-2">
                    <div className="col-md-6">
                        <small className="text-muted">Header Connector Upright (90°):</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s1_header_seated_90_deg`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s1_header_seated_90_deg`])}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted">Leads Properly Soldered:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s1_leads_properly_soldered`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s1_leads_properly_soldered`])}
                        </div>
                    </div>
                </div>
            );
        
        case 2:
            return (
                <div className="row g-2">
                    <div className="col-md-3">
                        <small className="text-muted">LoRa Module:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_lora_module`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_lora_module`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">LoRa Mesh Test:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_lora_mesh_test`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_lora_mesh_test`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Energy Meter:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_energy_meter`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_energy_meter`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Power Good Test:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_power_good_test`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_power_good_test`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Voltage (Ref):</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s2_voltage`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_voltage`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 1:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s2_line1`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_line1`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 2:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s2_line2`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_line2`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 3:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s2_line3`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_line3`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Temperature:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_temp_reading`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_temp_reading`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Frequency:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_freq_reading`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_freq_reading`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">4G LED:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_led_status_4g`], 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_led_status_4g`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Fast Blink RED:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_led_status_fast_blink`], 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_led_status_fast_blink`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">SW1 Off to LED Off:</small>
                        <div className="fw-bold">{formatDisplayValue(unit[`s2_sw1_off_to_led_off_duration`])}s</div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Go/No-Go:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s2_go_no_go`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s2_go_no_go`])}
                        </div>
                    </div>
                </div>
            );
        
        case 6:
            return (
                <div className="row g-2">
                    <div className="col-md-3">
                        <small className="text-muted">LoRa Module:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_lora_module`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_lora_module`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">LoRa Mesh Test:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_lora_mesh_test`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_lora_mesh_test`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Energy Meter:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_energy_meter`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_energy_meter`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Power Good Test:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_power_good_test`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_power_good_test`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Voltage (Ref):</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s6_voltage`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_voltage`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 1:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s6_line1`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_line1`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 2:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s6_line2`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_line2`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Line 3:</small>
                        <div className={`fw-bold ${getVoltageErrorStatus(unit[`s6_line3`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_line3`])}V
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Temperature:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_temp_reading`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_temp_reading`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Frequency:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_freq_reading`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_freq_reading`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">4G LED:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_led_status_4g`], 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_led_status_4g`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Fast Blink RED:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_led_status_fast_blink`], 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_led_status_fast_blink`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">SW1 Off to LED Off:</small>
                        <div className="fw-bold">{formatDisplayValue(unit[`s6_sw1_off_to_led_off_duration`])}s</div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Go/No-Go:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s6_go_no_go`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s6_go_no_go`])}
                        </div>
                    </div>
                </div>
            );
        
        case 3:
        case 4:
        case 5:
        case 7:
        case 9:
        case 10:
        case 13:
        case 14:
            return (
                <div className="row g-2">
                    <div className="col-md-6">
                        <small className="text-muted">Requirements:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s${stationNumber}_requirements`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s${stationNumber}_requirements`])}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted">Remarks:</small>
                        <div className="fw-bold">{formatDisplayValue(unit[`s${stationNumber}_remarks`])}</div>
                    </div>
                </div>
            );
        
        case 12:
            return (
                <div className="row g-2">
                    <div className="col-md-6">
                        <small className="text-muted">Stickers Attached:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s12_stickers_attached`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s12_stickers_attached`])}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted">Stickers Readable:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s12_stickers_readable`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s12_stickers_readable`])}
                        </div>
                    </div>
                </div>
            );
        
        case 8:
            return (
                <div className="row g-2">
                    <div className="col-md-3">
                        <small className="text-muted">Power Unit & LoRa:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s8_power_unit_disable_lora`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s8_power_unit_disable_lora`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Frequency Band:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s8_frequency_band`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s8_frequency_band`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">RSSO Testing:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s8_rsso_testing`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s8_rsso_testing`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Data Outage:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s8_data_outage`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s8_data_outage`])}
                        </div>
                    </div>
                </div>
            );
        
        case 11:
            return (
                <div className="row g-2">
                    <div className="col-md-3">
                        <small className="text-muted">LED Status:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s11_led_status`], 'LED STATUS') ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s11_led_status`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Low Range:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s11_low_range`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s11_low_range`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">Medium Range:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s11_medium_range`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s11_medium_range`])}
                        </div>
                    </div>
                    <div className="col-md-3">
                        <small className="text-muted">High Range:</small>
                        <div className={`fw-bold ${isErrorValue(unit[`s11_high_range`]) ? 'text-danger' : 'text-success'}`}>
                            {formatDisplayValue(unit[`s11_high_range`])}
                        </div>
                    </div>
                </div>
            );
        
        default:
            return <div className="text-muted">No checklist data available for this station.</div>;
    }
};

export const UnitDetailsModal = ({ unit, onClose }) => {
    const [stationDropdowns, setStationDropdowns] = useState({});
    const [progressDropdowns, setProgressDropdowns] = useState({});

    if (!unit) return null;

    return ReactDOM.createPortal(
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999 }}>
            <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '1200px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                        <div className="d-flex flex-column">
                            <h5 className="mb-0 fw-bold">Unit Details | Assembly: {unit.assembly_no}</h5>
                            <small className="opacity-75">Model: {unit.model} | Station: {unit.station}</small>
                        </div>
                        <button className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
                    </div>

                    {/* Fixed Top Section - Progress and PCB */}
                    <div className="flex-shrink-0 p-4">
                        {/* Progress Line */}
                        <div className="mb-4">
                            <h6 className="fw-bold text-primary mb-3">
                                <i className="bi bi-arrow-right-circle me-2"></i>Production Progress
                            </h6>
                            <div className="d-flex align-items-center overflow-auto">
                                {PROCESS_STATIONS.map((station, index) => {
                                    const stationNumber = index + 1;
                                    const currentStationNumber = parseInt(unit.station?.replace(/\D/g, '') || 0);
                                    const isCurrentStation = stationNumber === currentStationNumber;
                                    const isCompleted = stationNumber < currentStationNumber;
                                    const isPending = stationNumber > currentStationNumber;
                                    
                                    return (
                                        <div key={stationNumber} className="flex-shrink-0 text-center me-3">
                                            <button
                                                className={`btn rounded-circle d-flex align-items-center justify-content-center ${
                                                    isCurrentStation ? 'btn-primary' : 
                                                    isCompleted ? 'btn-success' : 
                                                    'btn-outline-secondary'
                                                }`}
                                                style={{ width: '45px', height: '45px' }}
                                                onClick={() => setProgressDropdowns(prev => ({
                                                    [stationNumber]: !prev[stationNumber]
                                                }))}
                                            >
                                                <span className="fw-bold">{stationNumber}</span>
                                            </button>
                                            <small className="d-block mt-1 text-muted" style={{ fontSize: '0.7rem', maxWidth: '80px' }}>
                                                {station.split(' ')[0]}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PCB Board Numbers */}
                        <div className="row g-4">
                            <div className="col-12">
                                <div className="card border-0 bg-light">
                                    <div className="card-body">
                                        <h6 className="card-title fw-bold text-success mb-3">
                                            <i className="bi bi-cpu me-2"></i>PCB Board Numbers
                                        </h6>
                                        <div className="row g-2">
                                            <div className="col-md-6 col-lg-4">
                                                <small className="text-muted">MNBD Board:</small>
                                                <div className="fw-bold">{unit.mnbd_board_no || unit.mnbd_no || '---'}</div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <small className="text-muted">CMBD Board:</small>
                                                <div className="fw-bold">{unit.cmbd_board_no || unit.cmbd_no || '---'}</div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <small className="text-muted">LRBD Board:</small>
                                                <div className="fw-bold">{unit.lrbd_board_no || unit.lrbd_no || '---'}</div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <small className="text-muted">PQBD Board:</small>
                                                <div className="fw-bold">{unit.pqbd_board_no || unit.pqbd_no || '---'}</div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <small className="text-muted">BKBD Board:</small>
                                                <div className="fw-bold">{unit.bkbd_board_no || unit.bkbd_no || '---'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Bottom Section - Station Checklists */}
                    <div className="flex-grow-1 overflow-auto p-4 pt-0">
                        <div className="row g-4">
                            <div className="col-12">
                                <h6 className="fw-bold text-primary mb-3">
                                    <i className="bi bi-clipboard-check me-2"></i>Station Checklists
                                </h6>
                                {PROCESS_STATIONS.map((stationName, index) => {
                                    const stationNumber = index + 1;
                                    const isExpanded = stationDropdowns[stationNumber];
                                    
                                    return (
                                        <div key={stationNumber} className="mb-3">
                                            <button
                                                className="btn btn-outline-primary w-100 text-start d-flex justify-content-between align-items-center"
                                                onClick={() => setStationDropdowns(prev => ({
                                                    [stationNumber]: !prev[stationNumber]
                                                }))}
                                            >
                                                <span className="fw-bold">Station {stationNumber}: {stationName}</span>
                                                <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="card border-top-0 border-start border-end border-bottom">
                                                    <div className="card-body p-3">
                                                        {renderStationChecklist(stationNumber, unit)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer flex-shrink-0">
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
