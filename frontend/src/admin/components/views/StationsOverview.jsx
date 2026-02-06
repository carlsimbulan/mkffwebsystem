import React, { useState, useMemo, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ReactDOM from 'react-dom';

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
    
    // State for station checklist dropdowns
    const [stationDropdowns, setStationDropdowns] = useState({});
    const [progressDropdowns, setProgressDropdowns] = useState({});

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
                        <div class="analysis-content">${diagnosis.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${forecast ? `
                    <div class="forecast-card">
                        <div class="analysis-header">
                            <span class="analysis-title">FORECAST</span>
                        </div>
                        <div class="analysis-content">${forecast.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${prescription ? `
                    <div class="prescription-card">
                        <div class="analysis-header">
                            <span class="analysis-title">PRESCRIPTION</span>
                        </div>
                        <div class="analysis-content">${prescription.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${!diagnosis && !forecast && !prescription ? `
                    <div class="fallback-analysis">
                        <div class="analysis-content">${cleanedAnalysis.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
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
            // Data Scanning: Create delayedContext array with actual checklist values
            const delayedContext = monitorMetrics.stationLogs
                .filter(log => {
                    const statusText = (log.status || '').toLowerCase();
                    const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                    return isInProgressOrNG && checkUnitDelay(stationMonitorId, log.updated_at || log.created_at, dynamicDelayThresholds).isDelayed;
                })
                .map(log => {
                    const checklistData = {};
                    
                    // Capture all relevant checklist fields for this station
                    for (let i = 1; i <= 15; i++) {
                        // Station-specific fields
                        checklistData[`s${i}_requirements`] = log[`s${i}_requirements`];
                        checklistData[`s${i}_remarks`] = log[`s${i}_remarks`];
                        
                        // Station 1 specific
                        if (i === 1) {
                            checklistData.s1_header_seated_90_deg = log.s1_header_seated_90_deg;
                            checklistData.s1_leads_properly_soldered = log.s1_leads_properly_soldered;
                        }
                        
                        // Station 2 & 6 specific (technical readings)
                        if (i === 2 || i === 6) {
                            checklistData[`s${i}_lora_module`] = log[`s${i}_lora_module`];
                            checklistData[`s${i}_lora_mesh_test`] = log[`s${i}_lora_mesh_test`];
                            checklistData[`s${i}_energy_meter`] = log[`s${i}_energy_meter`];
                            checklistData[`s${i}_power_good_test`] = log[`s${i}_power_good_test`];
                            checklistData[`s${i}_voltage`] = log[`s${i}_voltage`];
                            checklistData[`s${i}_line1`] = log[`s${i}_line1`];
                            checklistData[`s${i}_line2`] = log[`s${i}_line2`];
                            checklistData[`s${i}_line3`] = log[`s${i}_line3`];
                            checklistData[`s${i}_temp_reading`] = log[`s${i}_temp_reading`];
                            checklistData[`s${i}_freq_reading`] = log[`s${i}_freq_reading`];
                            checklistData[`s${i}_led_status_4g`] = log[`s${i}_led_status_4g`];
                            checklistData[`s${i}_led_status_fast_blink`] = log[`s${i}_led_status_fast_blink`];
                            checklistData[`s${i}_sw1_off_to_led_off_duration`] = log[`s${i}_sw1_off_to_led_off_duration`];
                            checklistData[`s${i}_go_no_go`] = log[`s${i}_go_no_go`];
                        }
                        
                        // Station 8 specific
                        if (i === 8) {
                            checklistData.s8_power_unit_disable_lora = log.s8_power_unit_disable_lora;
                            checklistData.s8_frequency_band = log.s8_frequency_band;
                            checklistData.s8_rsso_testing = log.s8_rsso_testing;
                            checklistData.s8_data_outage = log.s8_data_outage;
                        }
                        
                        // Station 11 specific
                        if (i === 11) {
                            checklistData.s11_led_status = log.s11_led_status;
                            checklistData.s11_low_range = log.s11_low_range;
                            checklistData.s11_medium_range = log.s11_medium_range;
                            checklistData.s11_high_range = log.s11_high_range;
                        }
                    }
                    
                    return {
                        assembly_no: log.assembly_no,
                        model: log.model,
                        station: log.station,
                        status: log.status,
                        minutes_in_station: Math.max(0, (new Date().getTime() - new Date(log.updated_at || log.created_at).getTime()) / (1000 * 60)),
                        checklist_data: checklistData
                    };
                });

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

DELAYED UNITS CHECKLIST DATA:
${JSON.stringify(delayedContext, null, 2)}

ANALYSIS INSTRUCTIONS:
1. Look for Voltage Tolerance breaches (outside 113.85V-116.15V) in the checklist data
2. Identify if delays are Quality-Driven (due to 'NO GO', 'FAIL', 'NOT DETECTED' values) or Process-Driven (all items are 'GO' but time spent is still high)
3. Focus on specific errors found in the actual checklist values
4. When you see 'Empty' values in the checklist, diagnose this as Documentation Breakdown - this indicates failure in documentation protocol

REQUIRED OUTPUT FORMAT (STRICT):
[DIAGNOSIS]: Current root cause using manufacturing terminology, referencing specific checklist failures
- Maximum 2 bullet points
- Each bullet must be exactly one sentence
- Example: • Voltage breach detected at Station 2.

[FORECAST]: Predict station status for next 2-4 hours based on current conditions and error patterns
- Maximum 1 bullet point
- Each bullet must be exactly one sentence
- Example: • Risk of 30% slowdown in 2 hours.

[PRESCRIPTION]: Provide exactly 2 actionable steps for production supervisor based on specific checklist errors found
- Maximum 2 bullet points
- Each bullet must be exactly one sentence
- Example: • Recalibrate Station 2 test rig.
- For voltage issues: suggest electrical equipment calibration
- For quality failures: suggest specific process adjustments
- For process-driven delays: suggest workflow optimization

EXECUTIVE SUMMARY: Strictly maximum of 10 words only.

CRITICAL: Use only one-sentence bullet points. No paragraphs. No long explanations.`;

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
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
                    border: 1px solid #e2e8f0; 
                    border-radius: 16px; 
                    padding: 24px; 
                    height: 100%; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .hover-bg-primary:hover {
                    background-color: rgba(13, 110, 253, 0.03) !important;
                }
                
                .transition-all {
                    transition: all 0.15s ease;
                }
                
                .border-bottom {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
                }
                
                .bg-danger.bg-opacity-5 {
                    background-color: rgba(220, 53, 69, 0.03) !important;
                }
                
                .badge {
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }
                
                .table {
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                .shadow-sm {
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
                }
                
                .shadow-lg {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }

                .diagnostic-card-minimal { 
                    background: #ffffff; 
                    border-radius: 8px; 
                    border: 1px solid #e2e8f0; 
                }

                .delay-row { 
                    background-color: #fff5f5 !important; 
                }

                /* Enhanced AI Analysis Styling */
                .intelligent-analysis-container { 
                    margin-top: 16px; 
                    display: flex; 
                    gap: 16px; 
                    flex-wrap: wrap;
                }
                .intelligent-analysis-container > div {
                    flex: 1;
                    min-width: 300px;
                }
                .diagnosis-card, .forecast-card, .prescription-card, .fallback-analysis { 
                    margin-bottom: 0; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .diagnosis-card { border: 1px solid #e2e8f0; background: #ffffff; }
                .forecast-card { border: 1px solid #e2e8f0; background: #ffffff; }
                .prescription-card { border: 1px solid #e2e8f0; background: #ffffff; }
                .fallback-analysis { border: 1px solid #e2e8f0; background: #ffffff; }
                
                .analysis-header { 
                    padding: 12px 16px; 
                    font-weight: 700; 
                    font-size: 0.85rem; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    display: flex; 
                    align-items: center;
                    background: #f8fafc;
                    color: #374151;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .analysis-content { 
                    padding: 16px; 
                    font-size: 0.8rem; 
                    line-height: 1.4; 
                    font-weight: 500;
                    color: #374151;
                }

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
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-check-circle text-success"></i>
                            </div>
                            <span className="text-success small fw-bold">+12%</span>
                        </div>
                        <span className="text-muted small fw-bold d-block mb-1">COMPLETED UNITS</span>
                        <h3 className="fw-bold text-success mt-1 mb-0">{monitorMetrics.completedUnits}</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-graph-up text-primary"></i>
                            </div>
                            <span className="text-primary small fw-bold">+5%</span>
                        </div>
                        <span className="text-muted small fw-bold d-block mb-1">YIELD RATE</span>
                        <h3 className="fw-bold text-primary mt-1 mb-0">{monitorMetrics.yieldRate}%</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-clock text-warning"></i>
                            </div>
                            <span className="text-warning small fw-bold">-3%</span>
                        </div>
                        <span className="text-muted small fw-bold d-block mb-1">IN PROGRESS</span>
                        <h3 className="fw-bold text-warning mt-1 mb-0">{monitorMetrics.pendingUnits}</h3>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3">
                    <div className="stat-card-pro">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-x-circle text-danger"></i>
                            </div>
                            <span className="text-danger small fw-bold">-8%</span>
                        </div>
                        <span className="text-muted small fw-bold d-block mb-1">NO GOOD (NG)</span>
                        <h3 className="fw-bold text-danger mt-1 mb-0">{monitorMetrics.ngUnits}</h3>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-list-columns-reverse me-2 text-primary"></i>
                    Station Logs
                </h4>
                <div className="d-flex gap-3 align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-funnel text-muted"></i>
                        <select 
                            className="form-select form-select-sm border-0 bg-light" 
                            style={{width:'160px', borderRadius: '8px'}} 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-search text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control form-control-sm border-0 bg-light" 
                            style={{width:'200px', borderRadius: '8px'}} 
                            placeholder="Search Assembly ID..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <button 
                        className="btn btn-outline-secondary btn-sm px-4 fw-bold d-flex align-items-center gap-2" 
                        style={{borderRadius: '8px'}}
                        onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                        RESET
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    MODEL
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    REVISION
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    BASE UNIT
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ASSEMBLY
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    DEVICE SERIAL
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ACCESSORY
                                </th>
                                <th className="border-0 px-3 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    STATUS
                                </th>
                                <th className="border-0 px-3 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    DELAY
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    REMARKS
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    LAST UPDATE
                                </th>
                                <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ACTIONS
                                </th>
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

                                const delayMinutes = delay.minutes; // Use actual minutes from checkUnitDelay
                                return (
                                        <tr 
                                        key={log.id} 
                                        className={`border-bottom ${delay.isDelayed ? 'bg-danger bg-opacity-5' : 'hover-bg-primary hover-bg-opacity-5'} transition-all`}
                                    >
                                        <td className="ps-4 py-3">
                                            <div className="fw-bold text-dark">{log.model}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                {log.revision || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-muted small fst-italic">{log.base_unit_kitting_no || '---'}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="d-flex align-items-center">
                                                <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                    {log.assembly_no}
                                                </code>
                                                {delay.isDelayed && (
                                                    <i className="bi bi-exclamation-triangle-fill text-danger ms-2" 
                                                       title={`Delayed: ${delay.level}`}></i>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-muted small">{log.device_serial_no || '---'}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-muted small">{log.accessory_kitting_no || '---'}</span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className={`badge px-3 py-2 rounded-1 fw-semibold ${
                                                log.status.includes('Progress') ? 'bg-warning text-dark' : 
                                                log.status.includes('Completed') ? 'bg-success' : 
                                                'bg-danger'
                                            }`} style={{ fontSize: '0.75rem' }}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {isInProgressOrNG && delay.isDelayed ? (
                                                <div className="d-flex flex-column align-items-center">
                                                    <span className={`badge rounded-pill px-2 py-1 fw-bold ${
                                                        delay.level === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'
                                                    }`} style={{ fontSize: '0.7rem' }}>
                                                        +{Math.round(delayMinutes)}m
                                                    </span>
                                                    <small className="text-muted mt-1" style={{ fontSize: '0.6rem' }}>
                                                        {delay.level}
                                                    </small>
                                                </div>
                                            ) : (
                                                <span className="text-muted small fst-italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-muted small fst-italic" 
                                                 style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                                                 title={log.remarks || 'No remarks'}>
                                                {log.remarks || '---'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="text-muted small">
                                                <i className="bi bi-clock me-1"></i>
                                                {new Date(log.updated_at || log.created_at).toLocaleString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button 
                                                    className="btn btn-sm btn-primary rounded p-2 transition-all" 
                                                    onClick={() => setSelectedUnit(log)}
                                                    title="Details"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary rounded p-2 transition-all" 
                                                    onClick={() => handleEditClick(log)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
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
            {selectedUnit && ReactDOM.createPortal(
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '1200px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                                <div className="d-flex flex-column">
                                    <h5 className="mb-0 fw-bold">Unit Details | Assembly: {selectedUnit.assembly_no}</h5>
                                    <small className="opacity-75">Model: {selectedUnit.model} | Station: {selectedUnit.station}</small>
                                </div>
                                <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnit(null)}></button>
                            </div>

                            {/* Fixed Top Section - Progress and PCB */}
                            <div className="flex-shrink-0 p-4">
                                {/* Progress Line */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="bi bi-arrow-right-circle me-2"></i>Production Progress
                                    </h6>
                                    <div className="d-flex align-items-center overflow-auto">
                                        {processStations.map((station, index) => {
                                            const stationNumber = index + 1;
                                            const currentStationNumber = parseInt(selectedUnit.station?.replace(/\D/g, '') || 0);
                                            const isCurrentStation = stationNumber === currentStationNumber;
                                            const isCompleted = stationNumber < currentStationNumber;
                                            const isPending = stationNumber > currentStationNumber;
                                            const isExpanded = progressDropdowns[stationNumber];
                                            
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
                                                        <div className="fw-bold">{selectedUnit.mnbd_board_no || selectedUnit.mnbd_no || '---'}</div>
                                                    </div>
                                                    <div className="col-md-6 col-lg-4">
                                                        <small className="text-muted">CMBD Board:</small>
                                                        <div className="fw-bold">{selectedUnit.cmbd_board_no || selectedUnit.cmbd_no || '---'}</div>
                                                    </div>
                                                    <div className="col-md-6 col-lg-4">
                                                        <small className="text-muted">LRBD Board:</small>
                                                        <div className="fw-bold">{selectedUnit.lrbd_board_no || selectedUnit.lrbd_no || '---'}</div>
                                                    </div>
                                                    <div className="col-md-6 col-lg-4">
                                                        <small className="text-muted">PQBD Board:</small>
                                                        <div className="fw-bold">{selectedUnit.pqbd_board_no || selectedUnit.pqbd_no || '---'}</div>
                                                    </div>
                                                    <div className="col-md-6 col-lg-4">
                                                        <small className="text-muted">BKBD Board:</small>
                                                        <div className="fw-bold">{selectedUnit.bkbd_board_no || selectedUnit.bkbd_no || '---'}</div>
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
                                        {processStations.map((stationName, index) => {
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
                                                                {renderStationChecklist(stationNumber, selectedUnit)}
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
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

/* ... */
export function StationsOverview({
    activeTab, stations, calculateMetrics, stationMonitorId, highlightedUnitId, setActiveTab, handleMonitorStation, handleViewHistory, handleEditClick, fetchData, allLogs, liveUnitLogs, dynamicDelayThresholds, onTargetTimeManagement
}) {
    const [historySearch, setHistorySearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [delayHotspotsAi, setDelayHotspotsAi] = useState(null);
    const [isDelayHotspotsAiLoading, setIsDelayHotspotsAiLoading] = useState(false);
    const [currentAssignments, setCurrentAssignments] = useState({});
    const [historicalPerformanceDatabase, setHistoricalPerformanceDatabase] = useState({});

    // Fetch users data early for operator name lookup
    useEffect(() => {
        const fetchUsersForLookup = async () => {
            if (window.cachedUsersData && window.cachedUsersData.length > 0) {
                return; // Already cached
            }
            
            try {
                const usersRes = await fetch(`http://localhost/mkffwebsystem/backend/api/user_management.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'get_all_users'
                    })
                });
                
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    const users = usersData.users || [];
                    window.cachedUsersData = users;
                    
                    // Create and set global utility function
                    window.getOperatorDisplayName = (actionBy) => {
                        if (!actionBy) return 'SYSTEM';
                        if (actionBy.toLowerCase() === 'system') return 'SYSTEM';
                        
                        const operatorMap = {};
                        users.forEach(user => {
                            if (user.username && user.full_name) {
                                operatorMap[user.username] = user.full_name;
                            }
                            if (user.email && user.full_name) {
                                operatorMap[user.email] = user.full_name;
                            }
                            if (user.id && user.full_name) {
                                operatorMap[user.id.toString()] = user.full_name;
                            }
                        });
                        
                        return operatorMap[actionBy] || actionBy;
                    };
                }
            } catch (err) {
                console.warn('Failed to fetch users for operator lookup:', err);
            }
        };
        
        fetchUsersForLookup();
    }, []);

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
                        <div class="hub-content">${diagnosis.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${forecast ? `
                    <div class="forecast-hub-card">
                        <div class="hub-header">
                            <span class="hub-title">FORECAST</span>
                        </div>
                        <div class="hub-content">${forecast.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${prescription ? `
                    <div class="prescription-hub-card">
                        <div class="hub-header">
                            <span class="hub-title">PRESCRIPTION</span>
                        </div>
                        <div class="hub-content">${prescription.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
                    </div>
                ` : ''}
                ${!diagnosis && !forecast && !prescription ? `
                    <div class="fallback-hub-analysis">
                        <div class="hub-content">${cleanedAnalysis.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '• ').trim()).join('<br>')}</div>
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
            // Data Pipeline Update: Create currentAssignments mapping stations to operator full names
            const currentAssignments = {};
            
            // Get current operator assignments directly from users table
            try {
                const usersRes = await fetch(`http://localhost/mkffwebsystem/backend/api/user_management.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'get_all_users'
                    })
                });
                
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    const users = usersData.users || [];
                    
                    // Map each station to its assigned operator
                    for (const station of namedStations) {
                        // Find operator assigned to this station from users table
                        const assignedOperator = users.find(user => 
                            user.station === station.id && 
                            user.role === 'Operator' && 
                            user.full_name
                        );
                        
                        if (assignedOperator) {
                            currentAssignments[station.id] = assignedOperator.full_name;
                        } else {
                            // Fallback: check recent activity logs
                            const stationMetrics = calculateMetrics(station.id);
                            const stationLogs = stationMetrics.stationLogs || [];
                            
                            const recentLog = stationLogs
                                .filter(log => log.action_by && (log.status === 'In Progress' || log.status?.toLowerCase().includes('no good')))
                                .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0];
                            
                            if (recentLog && recentLog.action_by) {
                                // Try to find this operator in users table by username, id, or email
                                const operatorUser = users.find(user => 
                                    user.username === recentLog.action_by || 
                                    user.id === recentLog.action_by ||
                                    user.email === recentLog.action_by
                                );
                                
                                currentAssignments[station.id] = operatorUser ? operatorUser.full_name : 'Unassigned';
                            } else {
                                currentAssignments[station.id] = 'Unassigned';
                            }
                        }
                    }
                    
                    // Store users data for later use in operator mapping
                    window.cachedUsersData = users;
                } else {
                    // Fallback to previous method if users API fails
                    for (const station of namedStations) {
                        currentAssignments[station.id] = 'Unknown Assignment';
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch user assignments:', err);
                // Fallback to previous method
                for (const station of namedStations) {
                    currentAssignments[station.id] = 'Unknown Assignment';
                }
            }

            // Create User Lookup Map: username/email -> full_name lookup
            const createOperatorMap = () => {
                const users = window.cachedUsersData || [];
                const operatorMap = {};
                
                users.forEach(user => {
                    if (user.username && user.full_name) {
                        operatorMap[user.username] = user.full_name;
                    }
                    if (user.email && user.full_name) {
                        operatorMap[user.email] = user.full_name;
                    }
                    if (user.id && user.full_name) {
                        operatorMap[user.id.toString()] = user.full_name;
                    }
                });
                
                return operatorMap;
            };

            // Utility function to convert action_by to full_name
            const getOperatorDisplayName = (actionBy) => {
                if (!actionBy) return 'SYSTEM';
                if (actionBy.toLowerCase() === 'system') return 'SYSTEM';
                
                // Try to get from cached data first
                let users = window.cachedUsersData || [];
                
                // If no cached data, try to fetch synchronously (not recommended but as fallback)
                if (users.length === 0) {
                    try {
                        // This is a fallback - ideally cachedUsersData should already be populated
                        const operatorMap = createOperatorMap();
                        return operatorMap[actionBy] || actionBy;
                    } catch (err) {
                        console.warn('Could not fetch user data for operator lookup:', err);
                        return actionBy;
                    }
                }
                
                // Create lookup map from cached data
                const operatorMap = {};
                users.forEach(user => {
                    if (user.username && user.full_name) {
                        operatorMap[user.username] = user.full_name;
                    }
                    if (user.email && user.full_name) {
                        operatorMap[user.email] = user.full_name;
                    }
                    if (user.id && user.full_name) {
                        operatorMap[user.id.toString()] = user.full_name;
                    }
                });
                
                return operatorMap[actionBy] || actionBy;
            };

            // Make the utility function globally available for modals
            window.getOperatorDisplayName = getOperatorDisplayName;

            const operatorMap = createOperatorMap();

            // 3-Year Historical Operator Performance Analysis - DEEP DIVE
            const calculateHistoricalPerformance = (operatorId, stationId) => {
                // Get the full name for this operator using the operator map
                const operatorFullName = operatorMap[operatorId] || operatorId;
                
                // DEEP DIVE: Filter allLogs for this operator and station over 3 years
                // INCLUDE DISPATCHED UNITS: Scan ALL records regardless of current unit status
                const threeYearsAgo = new Date();
                threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

                // SCAN BY STATION NAME: Use station_name field within history entry instead of current station field
                const stationNameVariants = [
                    stationId,
                    stationId.replace(/Station(\d+)/i, 'Station $1'), // "Station1" -> "Station 1"
                    stationId.replace(/\s+/g, ''), // "Station 1" -> "Station1"
                    stationId.replace(/Station\s*(\d+)/i, 'Station$1'), // "Station 1" -> "Station1"
                ];

                const operatorLogs = (allLogs || []).filter(log => {
                    const logDate = new Date(log.timestamp || log.created_at);
                    
                    // MAP EMAIL TO FULL NAME: Check both original email and mapped full name
                    const isOperatorMatch = (
                        log.action_by === operatorId || 
                        log.operator_id === operatorId ||
                        log.action_by === operatorFullName ||
                        operatorMap[log.action_by] === operatorFullName
                    );
                    
                    // SCAN BY STATION NAME: Check station_name field in history entry
                    const isStationMatch = stationNameVariants.some(variant => 
                        (log.station_name && log.station_name === variant) ||
                        (log.station && log.station === variant)
                    );
                    
                    return (
                        isOperatorMatch &&
                        isStationMatch &&
                        logDate >= threeYearsAgo
                    );
                });

                // Calculate comprehensive performance metrics from ALL historical records
                const totalUnitsProcessed = operatorLogs.length;
                const ngCount = operatorLogs.filter(log => {
                    const status = (log.status || log.status_after || '').toLowerCase();
                    return status.includes('no good') || status.includes('ng');
                }).length;

                // Calculate delay patterns from historical processing times
                const delayedUnits = operatorLogs.filter(log => {
                    const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
                    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
                    const threshold = dynamicDelayThresholds[stationId] || 10;
                    return minutesInStation > threshold;
                }).length;

                const avgDelayTime = operatorLogs.reduce((sum, log) => {
                    const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
                    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
                    return sum + minutesInStation;
                }, 0) / (totalUnitsProcessed || 1);

                // Calculate consistency score (percentage of units completed within threshold)
                const consistencyScore = totalUnitsProcessed > 0 ? 
                    Math.round(((totalUnitsProcessed - delayedUnits) / totalUnitsProcessed) * 100) : 100;

                // Calculate NG rate from 3-year deep dive
                const ngRate = totalUnitsProcessed > 0 ? 
                    Math.round((ngCount / totalUnitsProcessed) * 100) : 0;

                // Calculate voltage error patterns for stations 2 and 6 from ALL historical records
                const voltageErrors = operatorLogs.filter(log => {
                    if (stationId.includes('Station2') || stationId.includes('Station 2')) {
                        return log.s2_voltage && getVoltageErrorStatus(log.s2_voltage);
                    }
                    if (stationId.includes('Station6') || stationId.includes('Station 6')) {
                        return log.s6_voltage && getVoltageErrorStatus(log.s6_voltage);
                    }
                    return false;
                }).length;

                const voltageErrorRate = totalUnitsProcessed > 0 ? 
                    Math.round((voltageErrors / totalUnitsProcessed) * 100) : 0;

                // Calculate quality failure patterns
                const qualityFailures = operatorLogs.filter(log => {
                    const checklistFields = Object.keys(log).filter(key => key.startsWith('s') && key.includes('_'));
                    return checklistFields.some(field => {
                        const value = log[field];
                        return value && (
                            String(value).toLowerCase().includes('no go') ||
                            String(value).toLowerCase().includes('fail') ||
                            String(value).toLowerCase().includes('not detected') ||
                            String(value) === '0V'
                        );
                    });
                }).length;

                const qualityFailureRate = totalUnitsProcessed > 0 ? 
                    Math.round((qualityFailures / totalUnitsProcessed) * 100) : 0;

                return {
                    operator_id: operatorId,
                    operator_full_name: operatorFullName,
                    station_id: stationId,
                    total_units_processed: totalUnitsProcessed,
                    ng_count: ngCount,
                    ng_rate_percentage: ngRate,
                    delayed_units_count: delayedUnits,
                    avg_delay_minutes: Math.round(avgDelayTime * 100) / 100,
                    consistency_score_percentage: consistencyScore,
                    voltage_errors_count: voltageErrors,
                    voltage_error_rate_percentage: voltageErrorRate,
                    quality_failures_count: qualityFailures,
                    quality_failure_rate_percentage: qualityFailureRate,
                    analysis_period_years: 3,
                    historical_records_found: totalUnitsProcessed,
                    deep_dive_analysis: true,
                    includes_dispatched_units: true,
                    last_activity: operatorLogs.length > 0 ? 
                        operatorLogs.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0].updated_at || 
                        operatorLogs.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))[0].created_at : null
                };
            };

            // Build comprehensive historical performance database using full names as primary identifiers
            // DEEP DIVE: Include dispatched units and scan by station name
            const historicalPerformanceDatabase = {};
            for (const station of namedStations) {
                const stationMetrics = calculateMetrics(station.id);
                const stationLogs = stationMetrics.stationLogs || [];

                // Get all unique operators who have worked at this station from BOTH current logs AND historical logs
                const currentOperators = [...new Set(stationLogs.map(log => log.action_by).filter(Boolean))];
                
                // DEEP DIVE: Get operators from 3-year historical data using station_name field
                const threeYearsAgo = new Date();
                threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                
                const stationNameVariants = [
                    station.id,
                    station.id.replace(/Station(\d+)/i, 'Station $1'),
                    station.id.replace(/\s+/g, ''),
                    station.id.replace(/Station\s*(\d+)/i, 'Station$1'),
                ];
                
                const historicalOperators = [...new Set((allLogs || [])
                    .filter(log => {
                        const logDate = new Date(log.timestamp || log.created_at);
                        const isStationMatch = stationNameVariants.some(variant => 
                            (log.station_name && log.station_name === variant) ||
                            (log.station && log.station === variant)
                        );
                        return isStationMatch && logDate >= threeYearsAgo;
                    })
                    .map(log => log.action_by)
                    .filter(Boolean)
                )];
                
                // Combine current and historical operators for comprehensive analysis
                const allUniqueOperators = [...new Set([...currentOperators, ...historicalOperators])];

                historicalPerformanceDatabase[station.id] = {};
                for (const operatorId of allUniqueOperators) {
                    const historicalData = calculateHistoricalPerformance(operatorId, station.id);
                    const operatorFullName = historicalData.operator_full_name;
                    
                    // Use full_name as primary key for easier AI lookup
                    historicalPerformanceDatabase[station.id][operatorFullName] = {
                        ...historicalData,
                        original_operator_id: operatorId // Keep original ID for reference
                    };
                    
                    // Also maintain backward compatibility with operator_id lookup
                    if (operatorId !== operatorFullName) {
                        historicalPerformanceDatabase[station.id][operatorId] = historicalPerformanceDatabase[station.id][operatorFullName];
                    }
                }
            }

            // Update state variables for UI access
            setCurrentAssignments(currentAssignments);
            setHistoricalPerformanceDatabase(historicalPerformanceDatabase);

            // Data Extraction: Create hotspotDetailedPayload with checklist data and enhanced historical performance
            const hotspotDetailedPayload = await Promise.all(delayHotspots.map(async (station) => {
                const stationMetrics = calculateMetrics(station.id);
                const stationLogs = stationMetrics.stationLogs || [];
                
                // Get delayed units for this station
                const delayedUnits = stationLogs.filter(log => {
                    const statusText = (log.status || '').toLowerCase();
                    const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                    return isInProgressOrNG && checkUnitDelay(station.id, log.updated_at || log.created_at, dynamicDelayThresholds).isDelayed;
                });

                // Get unique operators currently active at the station
                const activeOperators = [...new Set(delayedUnits.map(log => log.action_by).filter(Boolean))];
                
                // Get unique operators currently active at the station with their full names
                const operatorsWithNames = activeOperators.map(operatorId => {
                    const operatorFullName = operatorMap[operatorId] || operatorId;
                    return {
                        operator_id: operatorId,
                        operator_full_name: operatorFullName
                    };
                });
                
                // Create a mapping of operator_id to full_name using the operator map
                const operatorNameMap = {};
                operatorsWithNames.forEach(op => {
                    operatorNameMap[op.operator_id] = op.operator_full_name;
                });
                
                // Enhanced 3-year historical performance with local calculation fallback
                const enhancedHistoricalPerformance = await Promise.all(activeOperators.map(async (operatorId) => {
                    try {
                        // Get full name from operator map
                        const operatorFullName = operatorMap[operatorId] || operatorId;
                        
                        const performanceRes = await fetch(`http://localhost/mkffwebsystem/backend/api/operator_performance.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'get_operator_performance_with_names',
                                operator_id: operatorId,
                                station_id: station.id,
                                years: 3
                            })
                        });
                        
                        if (performanceRes.ok) {
                            const performanceData = await performanceRes.json();
                            // Use local historical data with full name as primary identifier
                            const localPerformance = historicalPerformanceDatabase[station.id]?.[operatorFullName] || {};
                            return {
                                operator_id: operatorId,
                                operator_full_name: operatorFullName,
                                performance_data: performanceData.data || [],
                                // Enhanced metrics from local calculation using full name
                                historical_metrics: {
                                    ...localPerformance,
                                    operator_full_name: operatorFullName
                                }
                            };
                        }
                        
                        // Fallback to local calculation only
                        const localPerformance = historicalPerformanceDatabase[station.id]?.[operatorFullName] || {};
                        return { 
                            operator_id: operatorId, 
                            operator_full_name: operatorFullName, 
                            performance_data: [],
                            historical_metrics: {
                                ...localPerformance,
                                operator_full_name: operatorFullName
                            }
                        };
                    } catch (err) {
                        console.warn(`Failed to fetch performance for operator ${operatorId}:`, err);
                        // Fallback to local calculation with full name
                        const operatorFullName = operatorMap[operatorId] || operatorId;
                        const localPerformance = historicalPerformanceDatabase[station.id]?.[operatorFullName] || {};
                        return { 
                            operator_id: operatorId, 
                            operator_full_name: operatorFullName, 
                            performance_data: [],
                            historical_metrics: {
                                ...localPerformance,
                                operator_full_name: operatorFullName
                            }
                        };
                    }
                }));

                // Capture checklist data for each delayed unit with operator full names
                const delayedUnitsWithChecklist = delayedUnits.map(log => {
                    const checklistData = {};
                    
                    // Capture all relevant checklist fields for this station
                    for (let i = 1; i <= 15; i++) {
                        // Station-specific fields
                        checklistData[`s${i}_requirements`] = log[`s${i}_requirements`];
                        checklistData[`s${i}_remarks`] = log[`s${i}_remarks`];
                        
                        // Station 1 specific
                        if (i === 1) {
                            checklistData.s1_header_seated_90_deg = log.s1_header_seated_90_deg;
                            checklistData.s1_leads_properly_soldered = log.s1_leads_properly_soldered;
                        }
                        
                        // Station 2 & 6 specific (technical readings)
                        if (i === 2 || i === 6) {
                            checklistData[`s${i}_lora_module`] = log[`s${i}_lora_module`];
                            checklistData[`s${i}_lora_mesh_test`] = log[`s${i}_lora_mesh_test`];
                            checklistData[`s${i}_energy_meter`] = log[`s${i}_energy_meter`];
                            checklistData[`s${i}_power_good_test`] = log[`s${i}_power_good_test`];
                            checklistData[`s${i}_voltage`] = log[`s${i}_voltage`];
                            checklistData[`s${i}_line1`] = log[`s${i}_line1`];
                            checklistData[`s${i}_line2`] = log[`s${i}_line2`];
                            checklistData[`s${i}_line3`] = log[`s${i}_line3`];
                            checklistData[`s${i}_temp_reading`] = log[`s${i}_temp_reading`];
                            checklistData[`s${i}_freq_reading`] = log[`s${i}_freq_reading`];
                            checklistData[`s${i}_led_status_4g`] = log[`s${i}_led_status_4g`];
                            checklistData[`s${i}_led_status_fast_blink`] = log[`s${i}_led_status_fast_blink`];
                            checklistData[`s${i}_sw1_off_to_led_off_duration`] = log[`s${i}_sw1_off_to_led_off_duration`];
                            checklistData[`s${i}_go_no_go`] = log[`s${i}_go_no_go`];
                        }
                        
                        // Station 8 specific
                        if (i === 8) {
                            checklistData.s8_power_unit_disable_lora = log.s8_power_unit_disable_lora;
                            checklistData.s8_frequency_band = log.s8_frequency_band;
                            checklistData.s8_rsso_testing = log.s8_rsso_testing;
                            checklistData.s8_data_outage = log.s8_data_outage;
                        }
                        
                        // Station 11 specific
                        if (i === 11) {
                            checklistData.s11_led_status = log.s11_led_status;
                            checklistData.s11_low_range = log.s11_low_range;
                            checklistData.s11_medium_range = log.s11_medium_range;
                            checklistData.s11_high_range = log.s11_high_range;
                        }
                    }
                    
                    // Transform action_by to full_name using operator map
                    const operatorFullName = operatorMap[log.action_by] || log.action_by;
                    
                    return {
                        assembly_no: log.assembly_no,
                        model: log.model,
                        station: log.station,
                        status: log.status,
                        action_by: log.action_by, // Keep original for reference
                        operator_full_name: operatorFullName, // Use full name as primary identifier
                        minutes_in_station: Math.max(0, (new Date().getTime() - new Date(log.updated_at || log.created_at).getTime()) / (1000 * 60)),
                        checklist_data: checklistData
                    };
                });

                return {
                    station_id: station.id,
                    station_name: station.name,
                    delayed_units_count: delayedUnits.length,
                    avg_delay_minutes: station.avgDelayMinutes,
                    active_operators: operatorsWithNames,
                    historical_performance: enhancedHistoricalPerformance,
                    delayed_units_with_checklist: delayedUnitsWithChecklist,
                    current_assigned_operator: currentAssignments[station.id] || 'Unassigned',
                    // Add comprehensive historical performance database for this station
                    station_historical_database: historicalPerformanceDatabase[station.id] || {}
                };
            }));

            // Add currentAssignments and historical database to the payload for AI context
            const payloadWithAssignments = {
                current_station_assignments: currentAssignments,
                delay_hotspots: hotspotDetailedPayload,
                comprehensive_historical_performance: historicalPerformanceDatabase,
                // Add explicit mapping of current assignments to their 3-year historical performance
                current_operators_historical_summary: Object.entries(currentAssignments).reduce((summary, [stationId, operatorName]) => {
                    if (operatorName !== 'Unassigned' && operatorName !== 'Unknown Assignment') {
                        // Look up historical data using full name as primary key
                        const stationHistorical = historicalPerformanceDatabase[stationId] || {};
                        const operatorHistorical = stationHistorical[operatorName]; // Direct lookup by full name
                        
                        if (operatorHistorical) {
                            summary[`${stationId}_${operatorName}`] = {
                                station_id: stationId,
                                operator_full_name: operatorName,
                                ng_rate_percentage: operatorHistorical.ng_rate_percentage,
                                voltage_error_rate_percentage: operatorHistorical.voltage_error_rate_percentage,
                                consistency_score_percentage: operatorHistorical.consistency_score_percentage,
                                total_units_processed: operatorHistorical.total_units_processed,
                                analysis_period_years: 3
                            };
                        } else {
                            summary[`${stationId}_${operatorName}`] = {
                                station_id: stationId,
                                operator_full_name: operatorName,
                                historical_data_status: 'no_historical_data_available'
                            };
                        }
                    }
                    return summary;
                }, {})
            };

            // Debug log to check operator names and historical data
            console.log('Operator Map (username/email -> full_name):', operatorMap);
            console.log('Current Assignments being sent to AI:', currentAssignments);
            console.log('Historical Performance Database (using full names as keys):', historicalPerformanceDatabase);
            console.log('Sample delayed unit with operator info:', hotspotDetailedPayload[0]?.delayed_units_with_checklist?.[0]);
            console.log('Current Operators Historical Summary:', payloadWithAssignments.current_operators_historical_summary);
            
            // Debug: Check if email mapping is working for historical data
            const sampleHistoricalData = Object.values(historicalPerformanceDatabase)[0];
            if (sampleHistoricalData) {
                console.log('Sample historical performance data:', Object.keys(sampleHistoricalData).map(key => ({
                    key,
                    data: sampleHistoricalData[key],
                    recordsFound: sampleHistoricalData[key]?.historical_records_found || 0
                })));
            }

            const modelRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list_models' })
});

const modelData = await modelRes.json();
if (!modelData.modelName) {
    throw new Error('No model returned from backend');
}

const prompt = `You are a Senior Industrial AI Systems Engineer specializing in real-time manufacturing intelligence at MKFF Laserteknique International inc.

REAL-TIME OPERATIONAL INTELLIGENCE WITH 3-YEAR PERFORMANCE DEEP DIVE:
${JSON.stringify(payloadWithAssignments, null, 2)}

CURRENT STATION ASSIGNMENTS FROM USERS DATABASE (Use these exact full names for accountability):
${Object.entries(currentAssignments).map(([station, operator]) => `${station}: ${operator}`).join('\n')}

CURRENT OPERATORS 3-YEAR HISTORICAL PERFORMANCE SUMMARY (MANDATORY TO REFERENCE):
${Object.entries(currentAssignments).map(([stationId, operatorName]) => {
    if (operatorName !== 'Unassigned' && operatorName !== 'Unknown Assignment') {
        const stationHistorical = historicalPerformanceDatabase[stationId] || {};
        const operatorHistorical = stationHistorical[operatorName]; // Direct lookup by full name
        
        if (operatorHistorical) {
            return `${stationId} - ${operatorName}: NG Rate: ${operatorHistorical.ng_rate_percentage}%, Voltage Errors: ${operatorHistorical.voltage_error_rate_percentage}%, Consistency: ${operatorHistorical.consistency_score_percentage}% (3-year deep dive analysis - ${operatorHistorical.historical_records_found} records analyzed)`;
        } else {
            return `${stationId} - ${operatorName}: No 3-year historical data available`;
        }
    }
    return `${stationId} - ${operatorName}: Station unassigned`;
}).join('\n')}

MANDATORY 3-YEAR PERFORMANCE DEEP DIVE ANALYSIS:
You are performing a comprehensive 3-year performance deep dive that includes ALL historical records from 2023-2025, including dispatched units and completed production runs. This analysis provides the complete digital footprint of each operator's performance patterns.

CRITICAL DATA STRUCTURE RULES:
1. ALL OPERATOR IDENTIFIERS ARE FULL NAMES: The system has already converted all email addresses (e.g., 'james@mkff.com') and usernames to full names (e.g., 'Lebron James')
2. NEVER USE EMAIL ADDRESSES OR USERNAMES: You will only see and must only use full names like "Lebron James", "Shane Villars", "Carl Ivan Simbulan"
3. HISTORICAL DATA LOOKUP: comprehensive_historical_performance[station_id][operator_full_name] contains the 3-year metrics
4. CURRENT ASSIGNMENTS: current_station_assignments maps each station to an operator's full name
5. DELAYED UNITS: delayed_units_with_checklist uses operator_full_name field (NOT action_by)

CRITICAL HISTORICAL DATA EXTRACTION RULES:
1. MANDATORY CROSS-REFERENCE: For each delayed station, find the current_assigned_operator (which is a full name) and look up their historical_metrics in comprehensive_historical_performance[station_id][operator_full_name]
2. REQUIRED METRICS TO CITE: ng_rate_percentage, voltage_error_rate_percentage, consistency_score_percentage from the 3-year analysis
3. PATTERN RECOGNITION: Cross-reference current delays with 3-year historical data to identify recurring operator performance issues
4. SURGICAL ACCOUNTABILITY: If an operator shows consistent patterns (high NG rate >15%, voltage errors >10%, consistency score <80%), flag for mandatory retraining
5. PREDICTIVE INTERVENTION: Use historical trends to predict which operators will cause future bottlenecks

MANDATORY HISTORICAL CITATION RULES FOR DEEP DIVE:
- CRITICAL: You MUST examine the comprehensive_historical_performance object for EVERY operator mentioned in your analysis
- MANDATORY DEEP DIVE FORMAT: "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of [NG/Delay/Voltage Issues] has been identified ([XX]% historical [metric] rate over 3 years)"
- If operator has >20% NG rate over 3 years: "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of quality failures has been identified ([XX]% historical NG rate over 3 years)"
- If operator has >15% voltage error rate over 3 years: "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of voltage calibration issues has been identified ([XX]% historical voltage error rate over 3 years)"
- If operator has <70% consistency score over 3 years: "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of processing delays has been identified ([XX]% historical consistency score over 3 years)"
- MANDATORY: ALWAYS include the specific percentage and "3-year deep dive" in your citations
- SCAN ALL RECORDS: The comprehensive_historical_performance includes data from dispatched units and all historical records over 3 years using station_name field analysis

IMMEDIATE ANALYSIS FRAMEWORK:
1. SHORT-TERM FORECASTING: Predict production line status for the next 3 hours ONLY based on current delay trends, shift patterns, AND historical operator performance
2. PERSONAL ACCOUNTABILITY: Use operator full_name from current_station_assignments to identify specific individuals responsible for bottlenecks
3. SURGICAL PRESCRIPTION: Provide targeted interventions for specific operators by their exact full names from users database, enhanced with 3-year historical context

CRITICAL ATTRIBUTION RULES:
- For 'For Scanning' backlogs: Attribute to the operator assigned to the scanning station from current_station_assignments
- For 'Station X delays': Attribute directly to current_assigned_operator for that station (e.g., "Shane Villars", "Lebron James", "Carl Ivan Simbulan")
- For quality issues: Use operator_full_name from delayed_units_with_checklist AND cross-reference with current_station_assignments AND historical_metrics
- ALWAYS use full names from users database, NEVER operator IDs, usernames, or email addresses
- If operator shows "Unassigned", recommend immediate operator assignment to that station
- PRIORITIZE operators with poor 3-year historical performance (high NG rates, voltage errors, low consistency scores)
- CRITICAL: When referencing operators, use their FULL NAMES ONLY (e.g., "Shane Villars", "Lebron James") - NEVER use email addresses like "joe@mkff.com"

VALIDATION CRITERIA:
- Voltage Tolerance: 115V ±1% (113.85V - 116.15V)
- Quality Status: 'GO', 'Detected', 'Passed', 'SOLID GREEN' = GOOD
- Quality Status: 'NO GO', 'FAIL', 'NOT DETECTED', '0V' = BAD
- Historical Performance Thresholds: NG Rate >15%, Voltage Error Rate >10%, Consistency Score <80% = POOR PERFORMER

REQUIRED OUTPUT FORMAT (STRICT):
[DIAGNOSIS]: Identify immediate root causes with personal accountability using operator_full_name AND MANDATORY 3-year deep dive context
- Maximum 2 bullet points
- Each bullet must be exactly one sentence
- MANDATORY DEEP DIVE FORMAT: Must use "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of [specific issue] has been identified ([XX]% historical [metric] rate over 3 years)"
- REQUIRED: Include historical performance metrics when available (NG rate, voltage error rate, consistency score) with specific percentages and "3-year deep dive" timeframe
- If operator shows poor historical pattern (>15% NG rate or <80% consistency), you MUST mention the specific percentage and "3-year deep dive" analysis

[FORECAST]: Predict production line status for the next 3 hours ONLY with probability metrics based on current conditions AND historical operator patterns
- Maximum 1 bullet point
- Each bullet must be exactly one sentence
- Must include probability percentage and specific 3-hour timeframe (e.g., '85% chance of clearing backlog by 3PM today based on Lebron James historical 12% NG rate' or '95% risk of line stoppage within 3 hours due to Shane Villars chronic voltage issues')

[PRESCRIPTION]: Provide surgical interventions for specific operators using their exact full names from users database, MANDATORY enhanced with 3-year deep dive analysis
- Maximum 2 bullet points
- Each bullet must be exactly one sentence
- MANDATORY DEEP DIVE FORMAT: Must use "Based on a 3-year deep dive into the performance of [Full Name], mandatory [specific intervention] is required due to chronic [specific issue] pattern ([XX]% historical [metric] rate over 3 years)"
- For "Unassigned" stations, recommend specific operator assignment avoiding those with poor historical performance
- Focus on operators with repeated 'NO GO' or '0V' readings AND poor historical metrics
- MANDATORY: If historical performance shows chronic issues (>20% NG rate, >15% voltage errors, <70% consistency), recommend mandatory retraining or performance improvement plans with specific percentages and "3-year deep dive" timeframe
- CRITICAL: Use FULL NAMES ONLY (e.g., "Shane Villars", "Lebron James") - NEVER use email addresses or usernames
- REQUIRED EXAMPLE FORMAT: "Based on a 3-year deep dive into the performance of [Full Name], mandatory retraining is required due to chronic [specific issue] pattern ([XX]% historical [metric] rate over 3 years)"
- MUST REFERENCE: Look for these patterns in the comprehensive_historical_performance object which contains complete 3-year analysis including dispatched units

EXECUTIVE SUMMARY: Strictly maximum of 10 words only.

CRITICAL: Use only one-sentence bullet points. No paragraphs. No long explanations. Focus on immediate actionable intelligence with personal accountability enhanced by 3-year historical performance data. Always use exact operator full names from users database current_station_assignments for maximum accountability. Never use "Unassigned" in prescriptions - always recommend specific operator assignments. Prioritize interventions for operators with poor historical performance patterns. 

MANDATORY HISTORICAL DATA USAGE: You MUST examine the comprehensive_historical_performance object in the payload. For every operator you mention, you MUST include their 3-year deep dive historical metrics (ng_rate_percentage, voltage_error_rate_percentage, consistency_score_percentage) with specific percentages and timeframes. The comprehensive_historical_performance object contains complete 3-year deep dive analysis including dispatched units and all historical records analyzed by station_name field. The system has already converted all email addresses (like james@mkff.com) to full names (like Lebron James) - you will only see full names like "Lebron James", "Shane Villars", "Carl Ivan Simbulan". If you cannot find historical data for an operator, explicitly state "no historical data available" but still provide current analysis.

FINAL REMINDER: ALL OPERATOR IDENTIFIERS HAVE BEEN STANDARDIZED TO FULL NAMES. You will never see email addresses like "james@mkff.com" or usernames - only full names like "Lebron James", "Shane Villars", "Carl Ivan Simbulan". Always use the full_name provided in the historical metrics and current assignments. This is a professional industrial engineering report analyzing the 3-year digital footprint of operators. If a delay is detected for an operator, you MUST use the format "Based on a 3-year deep dive into the performance of [Full Name], a chronic pattern of [specific issue] has been identified" in your Diagnosis and Prescription sections. ALWAYS include specific 3-year historical percentages when available and mention "3-year deep dive" in your analysis.`;

const genRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        modelName: modelData.modelName,
        prompt: prompt
    })
});

const genData = await genRes.json();
if (genData.text) {
    setDelayHotspotsAi({ __complete_analysis: genData.text });
} else {
    setDelayHotspotsAi({ __error: 'No analysis returned from AI service' });
}

        } catch (err) {
            console.error("Delay Hotspots AI Error:", err);
            setDelayHotspotsAi({ __error: err.message });
        } finally {
            setIsDelayHotspotsAiLoading(false);
        }
    };

if (activeTab === "station_monitor") {
    return (
        <StationMonitorView 
            stationMonitorId={stationMonitorId}
            calculateMetrics={calculateMetrics}
            handleEditClick={handleEditClick}
            highlightedUnitId={highlightedUnitId}
            setActiveTab={setActiveTab}
            fetchData={fetchData}
            dynamicDelayThresholds={dynamicDelayThresholds}
        />
    );
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

            /* Visual Heatmap - Station Card Borders - Removed */
            
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
                background: #ffffff; 
                border: 1px solid #e2e8f0; 
                border-radius: 16px; 
                padding: 24px; 
                margin-bottom: 32px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

            /* Intelligence Hub Cards - Row Layout */
            .intelligence-hub-container { 
                display: flex; 
                gap: 16px; 
                margin-top: 16px; 
                flex-wrap: wrap;
            }
            .intelligence-hub-container > div {
                flex: 1;
                min-width: 300px;
            }
            .diagnosis-hub-card, .forecast-hub-card, .prescription-hub-card, .fallback-hub-analysis { 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                background: #ffffff;
            }

            
            .hub-header { 
                padding: 12px 16px; 
                font-weight: 700; 
                font-size: 0.85rem; 
                text-transform: uppercase; 
                letter-spacing: 0.05em; 
                display: flex; 
                align-items: center;
                background: #f8fafc;
                color: #374151;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .hub-content { 
                padding: 16px; 
                font-size: 0.8rem; 
                line-height: 1.4; 
                font-weight: 500;
                color: #374151;
            }

            /* Historical Performance Indicators */
            .historical-indicator {
                font-size: 0.65rem;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 8px;
                margin-left: 4px;
            }
            .historical-ng-high { background: #fef2f2; color: #dc2626; }
            .historical-ng-moderate { background: #fefce8; color: #ca8a04; }
            .historical-ng-low { background: #f0fdf4; color: #16a34a; }
            .historical-voltage-error { background: #fdf2f8; color: #be185d; }
            .historical-consistency-poor { background: #f3f4f6; color: #374151; }
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
                    Set Thresholds
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
                    cardClass += ' station-card-critical';
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

export default StationsOverview;