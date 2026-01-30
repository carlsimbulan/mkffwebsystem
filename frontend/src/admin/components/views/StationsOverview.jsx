import React, { useState, useMemo } from 'react';

import 'bootstrap-icons/font/bootstrap-icons.css';



const processStations = [

    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",

    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",

    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",

    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",

    "Packing", "QC Stamping"

];



const DELAY_THRESHOLDS_MINUTES = {

    'Station1': 6, 'Station 1': 6, 'Station2': 8, 'Station 2': 8, 'Station3': 3, 'Station 3': 3,

    'Station4': 12, 'Station 4': 12, 'Station5': 15, 'Station 5': 15, 'Station6': 15, 'Station 6': 15,

    'Station7': 3, 'Station 7': 3, 'Station8': 15, 'Station 8': 15, 'Station9': 480, 'Station 9': 480,

    'Station10': 8, 'Station 10': 8, 'Station11': 22, 'Station 11': 22, 'Station12': 5, 'Station 12': 5,

    'Station13': 10, 'Station 13': 10, 'Station14': 8, 'Station 14': 8, 'Station15': 5, 'Station 15': 5

};



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



const checkUnitDelay = (stationId, updatedAt) => {

    const threshold = DELAY_THRESHOLDS_MINUTES[stationId] || 10;

    const lastUpdate = new Date(updatedAt).getTime();

    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));

    if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };

    if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };

    return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };

};

// Helper function to validate voltage tolerance (±1% of 115V = 113.85 to 116.15)
const getVoltageErrorStatus = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return true; // Error if not a number
    return num < 113.85 || num > 116.15;
};

// Helper function to determine if a value represents an error
const isErrorValue = (value, key) => {
    if (value === null || value === undefined || value === "N/A") return true;
    
    const stringValue = String(value).toUpperCase();
    const errorStrings = ["NOT DETECTED", "NO GO", "FAIL", "N/A", "NO PASSED", "NOT PASSED", "NOT COMPLETE", "FAILED", "BLINKING", "OFF", "RED"];
    
    if (errorStrings.some(error => stringValue.includes(error))) return true;
    
    // Special validation for Station 11 LED status
    if (key && key.includes("LED STATUS") && stringValue !== "SOLID GREEN") return true;
    
    // Voltage validation for voltage-related fields
    if (key && (key.includes("V(") || key.includes("L1") || key.includes("L2") || key.includes("L3"))) {
        const numericValue = parseFloat(stringValue.replace("V", ""));
        return getVoltageErrorStatus(numericValue);
    }
    
    return false;
};

const parseStationSummary = (text) => {
    if (!text) return {};

    const pieces = text
        .split(/\n|\r|\*/)
        .map(l => l.trim().replace(/^[-•\d.)\s]+/, '')) // remove leading bullets/numbers
        .filter(Boolean);

    const take = (idx) => pieces[idx] || '';

    return {
        rootCause: take(0),
        impact: take(1),
        actions: take(2),
        raw: text,
    };
};



const StationMonitorView = ({ stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {

    const [searchTerm, setSearchTerm] = useState('');

    const [statusFilter, setStatusFilter] = useState('All'); 

    const [selectedUnitProcess, setSelectedUnitProcess] = useState(null); 

    const [expandedStepIdx, setExpandedStepIdx] = useState(null);

    const [stationAiAnalysis, setStationAiAnalysis] = useState('');

    const [isStationAiLoading, setIsStationAiLoading] = useState(false);

    // Format AI output with enhanced styling
    const formatStationOutput = (text) => {
        if (!text) return '';
        
        const lines = text.split('\n').filter(line => line.trim());
        let formatted = '';
        let itemIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Remove all asterisks and clean up formatting
            line = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            
            // Check if it's a numbered item
            if (line.match(/^\d+\./)) {
                itemIndex++;
                const content = line.replace(/^\d+\.\s*/, '');
                formatted += `<div class="item"><span class="number">${itemIndex}</span>${content}</div>`;
            }
            // Check if it's a summary line
            else if (line.toLowerCase().includes('summary:')) {
                const summary = line.replace(/^summary:\s*/i, '');
                formatted += `<div class="summary"><strong>Summary:</strong> ${summary}</div>`;
            }
            // Regular line
            else if (line) {
                formatted += `<div class="item">${line}</div>`;
            }
        }
        
        return formatted;
    };

    // Format hotspot AI output with the same styling
    const formatHotspotOutput = (text) => {
        if (!text) return '';
        
        const lines = text.split('\n').filter(line => line.trim());
        let formatted = '';
        let itemIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Remove all asterisks and clean up formatting
            line = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            
            // Check if it's a numbered item
            if (line.match(/^\d+\./)) {
                itemIndex++;
                const content = line.replace(/^\d+\.\s*/, '');
                formatted += `<div class="item"><span class="number">${itemIndex}</span>${content}</div>`;
            }
            // Check if it's a summary line
            else if (line.toLowerCase().includes('summary:')) {
                const summary = line.replace(/^summary:\s*/i, '');
                formatted += `<div class="summary"><strong>Summary:</strong> ${summary}</div>`;
            }
            // Regular line
            else if (line) {
                formatted += `<div class="item">${line}</div>`;
            }
        }
        
        return formatted;
    };

    const [summaryExpanded, setSummaryExpanded] = useState({

        root: false,

        impact: false,

        actions: false,

    });



    const monitorMetrics = calculateMetrics(stationMonitorId);



    const filteredLogs = useMemo(() => {

        return (monitorMetrics.stationLogs || [])

            .filter(log => log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase()))

            .filter(log => statusFilter === 'All' || log.status === statusFilter);

    }, [monitorMetrics.stationLogs, searchTerm, statusFilter]);

    

    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;

    const processName = processStations[stationIndex] || stationMonitorId;

    const hasGeminiKey = true; // Backend handles API key securely



    // Only show ROOT CAUSE DELAY ANALYSIS when there is at least 1 truly delayed unit in this station

    const hasDelayedUnits = useMemo(() => {

        return (monitorMetrics.stationLogs || []).some(log => {

            if (log.status !== 'In Progress' && !log.status?.toLowerCase().includes('no good') && !log.status?.toLowerCase().includes('ng')) return false;

            const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at);

            return d.isDelayed;

        });

    }, [monitorMetrics.stationLogs, stationMonitorId]);



    // Helper to convert raw AI text into short summary buckets

    const parseStationSummary = (text) => {

        if (!text) return {};



        // Split on line breaks and bullet markers (*) to be robust

        const pieces = text

            .split(/\n|\r|\*/)

            .map(l => l.trim().replace(/^[-•\d.)\s]+/, '')) // remove leading bullets/numbers

            .filter(Boolean);



        const take = (idx) => pieces[idx] || '';



        return {

            rootCause: take(0),

            impact: take(1),

            actions: take(2),

            raw: text,

        };

    };



    // 🔎 Advanced Station-level diagnostic with root cause delay analysis

    const fetchStationDiagnosis = async () => {

        setIsStationAiLoading(true);

        setStationAiAnalysis(null);

        try {

            // Step 1: Get available model from backend

            const modelRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ action: 'list_models' })

            });

            

            if (!modelRes.ok) {

                const body = await modelRes.text().catch(() => "");

                throw new Error(`Model listing failed (${modelRes.status}): ${body || modelRes.statusText}`);

            }

            

            const modelData = await modelRes.json();

            if (!modelData.modelName) {

                throw new Error('No model returned from backend');

            }

            

            const modelName = modelData.modelName;



            const stationLogs = monitorMetrics.stationLogs || [];

            const totalUnits = stationLogs.length;



            // Collect delayed units with enhanced checklist error scanning

            const delayedUnits = stationLogs.filter(log => {

                if (log.status !== 'In Progress' && !log.status?.toLowerCase().includes('no good') && !log.status?.toLowerCase().includes('ng')) return false;

                const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at);

                return d.isDelayed;

            });



            // Enhanced delayed context with comprehensive historical scanning

            const delayedContext = delayedUnits.map(log => {

                const lastUpdate = new Date(log.updated_at || log.created_at).getTime();

                const timeSpentMinutes = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));

                

                // Advanced pre-diagnostic checklist error scanning for ALL stations

                const checklist_errors = [];

                const checklist_values = {}; // Store actual values for analysis

                const voltage_tolerance = { min: 113.85, max: 116.15 }; // ±1% of 115V

                

                // Full History Scan: Station 1 checks

                checklist_values.s1_header_seated_90_deg = log.s1_header_seated_90_deg;

                checklist_values.s1_leads_properly_soldered = log.s1_leads_properly_soldered;

                if (log.s1_header_seated_90_deg === 'NO GO' || log.s1_header_seated_90_deg === 'FAIL') checklist_errors.push('S1: Header seating failure');

                if (log.s1_leads_properly_soldered === 'NO GO' || log.s1_leads_properly_soldered === 'FAIL') checklist_errors.push('S1: Soldering defects');

                

                // Full History Scan: Station 2 checks

                checklist_values.s2_lora_module = log.s2_lora_module;

                checklist_values.s2_lora_mesh_test = log.s2_lora_mesh_test;

                checklist_values.s2_energy_meter = log.s2_energy_meter;

                checklist_values.s2_power_good_test = log.s2_power_good_test;

                checklist_values.s2_voltage = log.s2_voltage;

                checklist_values.s2_line1 = log.s2_line1;

                checklist_values.s2_line2 = log.s2_line2;

                checklist_values.s2_line3 = log.s2_line3;

                checklist_values.s2_temp_reading = log.s2_temp_reading;

                checklist_values.s2_freq_reading = log.s2_freq_reading;

                checklist_values.s2_led_status_4g = log.s2_led_status_4g;

                checklist_values.s2_led_status_fast_blink = log.s2_led_status_fast_blink;

                checklist_values.s2_go_no_go = log.s2_go_no_go;

                checklist_values.s2_sw1_off_to_led_off_duration = log.s2_sw1_off_to_led_off_duration;

                

                if (log.s2_lora_module === 'Not Detected' || log.s2_lora_module === 'FAIL') checklist_errors.push('S2: LoRa module not detected');

                if (log.s2_lora_mesh_test === 'Not Detected' || log.s2_lora_mesh_test === 'FAIL') checklist_errors.push('S2: Mesh test failure');

                if (log.s2_energy_meter === 'Not Detected' || log.s2_energy_meter === 'FAIL') checklist_errors.push('S2: Energy meter issue');

                if (log.s2_power_good_test === 'Not Detected' || log.s2_power_good_test === 'FAIL') checklist_errors.push('S2: Power good failure');

                if (log.s2_voltage && (log.s2_voltage < voltage_tolerance.min || log.s2_voltage > voltage_tolerance.max)) checklist_errors.push('S2: Voltage out of tolerance');

                if (log.s2_go_no_go === 'NO GO' || log.s2_go_no_go === 'FAIL') checklist_errors.push('S2: Final test failure');

                

                // Full History Scan: Station 3-5 checks (standard stations)

                checklist_values.s3_requirements = log.s3_requirements;

                checklist_values.s3_remarks = log.s3_remarks;

                checklist_values.s4_requirements = log.s4_requirements;

                checklist_values.s4_remarks = log.s4_remarks;

                checklist_values.s5_requirements = log.s5_requirements;

                checklist_values.s5_remarks = log.s5_remarks;

                

                if (log.s3_requirements === 'FAIL' || log.s3_requirements === 'NO GO') checklist_errors.push('S3: Requirements not met');

                if (log.s4_requirements === 'FAIL' || log.s4_requirements === 'NO GO') checklist_errors.push('S4: Requirements not met');

                if (log.s5_requirements === 'FAIL' || log.s5_requirements === 'NO GO') checklist_errors.push('S5: Requirements not met');

                

                // Full History Scan: Station 6 checks

                checklist_values.s6_lora_module = log.s6_lora_module;

                checklist_values.s6_lora_mesh_test = log.s6_lora_mesh_test;

                checklist_values.s6_energy_meter = log.s6_energy_meter;

                checklist_values.s6_power_good_test = log.s6_power_good_test;

                checklist_values.s6_voltage = log.s6_voltage;

                checklist_values.s6_line1 = log.s6_line1;

                checklist_values.s6_line2 = log.s6_line2;

                checklist_values.s6_line3 = log.s6_line3;

                checklist_values.s6_temp_reading = log.s6_temp_reading;

                checklist_values.s6_freq_reading = log.s6_freq_reading;

                checklist_values.s6_led_status_4g = log.s6_led_status_4g;

                checklist_values.s6_led_status_fast_blink = log.s6_led_status_fast_blink;

                checklist_values.s6_go_no_go = log.s6_go_no_go;

                checklist_values.s6_sw1_off_to_led_off_duration = log.s6_sw1_off_to_led_off_duration;

                

                if (log.s6_lora_module === 'Not Detected' || log.s6_lora_module === 'FAIL') checklist_errors.push('S6: LoRa module not detected');

                if (log.s6_lora_mesh_test === 'Not Detected' || log.s6_lora_mesh_test === 'FAIL') checklist_errors.push('S6: Mesh test failure');

                if (log.s6_voltage && (log.s6_voltage < voltage_tolerance.min || log.s6_voltage > voltage_tolerance.max)) checklist_errors.push('S6: Voltage out of tolerance');

                if (log.s6_go_no_go === 'NO GO' || log.s6_go_no_go === 'FAIL') checklist_errors.push('S6: Final calibration failure');

                

                // Full History Scan: Station 7-10 checks

                checklist_values.s7_requirements = log.s7_requirements;

                checklist_values.s7_remarks = log.s7_remarks;

                checklist_values.s8_power_unit_disable_lora = log.s8_power_unit_disable_lora;

                checklist_values.s8_frequency_band = log.s8_frequency_band;

                checklist_values.s8_start_testing = log.s8_start_testing;

                checklist_values.s8_rsso_testing = log.s8_rsso_testing;

                checklist_values.s8_data_outage = log.s8_data_outage;

                checklist_values.s9_requirements = log.s9_requirements;

                checklist_values.s9_remarks = log.s9_remarks;

                checklist_values.s10_requirements = log.s10_requirements;

                checklist_values.s10_remarks = log.s10_remarks;

                

                if (log.s7_requirements === 'FAIL' || log.s7_requirements === 'NO GO') checklist_errors.push('S7: Requirements not met');

                if (log.s8_power_unit_disable_lora === 'FAIL' || log.s8_power_unit_disable_lora === 'NO GO') checklist_errors.push('S8: Power unit issue');

                if (log.s8_rsso_testing === 'FAIL' || log.s8_rsso_testing === 'NO GO') checklist_errors.push('S8: RSSO test failure');

                if (log.s9_requirements === 'FAIL' || log.s9_requirements === 'NO GO') checklist_errors.push('S9: Requirements not met');

                if (log.s10_requirements === 'FAIL' || log.s10_requirements === 'NO GO') checklist_errors.push('S10: Requirements not met');

                

                // Full History Scan: Station 11 checks

                checklist_values.s11_led_status = log.s11_led_status;

                checklist_values.s11_low_range = log.s11_low_range;

                checklist_values.s11_medium_range = log.s11_medium_range;

                checklist_values.s11_high_range = log.s11_high_range;

                

                if (log.s11_led_status === 'FAIL' || log.s11_led_status === 'NO GO') checklist_errors.push('S11: LED status failure');

                if (log.s11_low_range === 'FAIL' || log.s11_low_range === 'NO GO') checklist_errors.push('S11: Low range failure');

                if (log.s11_medium_range === 'FAIL' || log.s11_medium_range === 'NO GO') checklist_errors.push('S11: Medium range failure');

                if (log.s11_high_range === 'FAIL' || log.s11_high_range === 'NO GO') checklist_errors.push('S11: High range failure');

                

                // Full History Scan: Station 12-14 checks

                checklist_values.s12_requirements = log.s12_requirements;

                checklist_values.s12_remarks = log.s12_remarks;

                checklist_values.s13_requirements = log.s13_requirements;

                checklist_values.s13_remarks = log.s13_remarks;

                checklist_values.s14_requirements = log.s14_requirements;

                checklist_values.s14_remarks = log.s14_remarks;

                

                if (log.s12_requirements === 'FAIL' || log.s12_requirements === 'NO GO') checklist_errors.push('S12: Sticker attachment failure');

                if (log.s13_requirements === 'FAIL' || log.s13_requirements === 'NO GO') checklist_errors.push('S13: FVI requirements not met');

                if (log.s14_requirements === 'FAIL' || log.s14_requirements === 'NO GO') checklist_errors.push('S14: Packing requirements not met');

                

                return {

                    assembly_no: log.assembly_no,

                    time_spent_minutes: Math.round(timeSpentMinutes * 10) / 10,

                    status: log.status,

                    remarks: log.remarks || '',

                    checklist_errors: checklist_errors, // Comprehensive error array

                    checklist_values: checklist_values, // Actual values for analysis

                    // Full checklist data for AI analysis using new aliases

                    checklist_data: {

                        s1: { seated: log.s1_header_seated_90_deg, solder: log.s1_leads_properly_soldered },

                        s2: { lora: log.s2_lora_module, mesh: log.s2_lora_mesh_test, v: log.s2_voltage, go_no_go: log.s2_go_no_go, duration: log.s2_sw1_off_to_led_off_duration },

                        s6: { v: log.s6_voltage, verdict: log.s6_go_no_go, duration: log.s6_sw1_off_to_led_off_duration },

                        s11: { led: log.s11_led_status, range: log.s11_low_range, medium: log.s11_medium_range, high: log.s11_high_range },

                        s3: { requirements: log.s3_requirements, remarks: log.s3_remarks },

                        s4: { requirements: log.s4_requirements, remarks: log.s4_remarks },

                        s5: { requirements: log.s5_requirements, remarks: log.s5_remarks },

                        s7: { requirements: log.s7_requirements, remarks: log.s7_remarks },

                        s8: { power: log.s8_power_unit_disable_lora, freq: log.s8_frequency_band, testing: log.s8_start_testing, rsso: log.s8_rsso_testing, outage: log.s8_data_outage },

                        s9: { requirements: log.s9_requirements, remarks: log.s9_remarks },

                        s10: { requirements: log.s10_requirements, remarks: log.s10_remarks },

                        s12: { requirements: log.s12_requirements, remarks: log.s12_remarks },

                        s13: { requirements: log.s13_requirements, remarks: log.s13_remarks },

                        s14: { requirements: log.s14_requirements, remarks: log.s14_remarks }

                    }

                };

            });

            const delayedCount = delayedUnits.length;

            const totalDelayMinutes = delayedUnits.reduce((sum, log) => {

                const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at);

                return sum + d.minutes;

            }, 0);

            const maxDelayMinutes = delayedUnits.reduce((max, log) => {

                const d = checkUnitDelay(stationMonitorId, log.updated_at || log.created_at);

                return Math.max(max, d.minutes);

            }, 0);

            const avgDelayMinutes = delayedCount > 0 ? (totalDelayMinutes / delayedCount) : 0;

            const thresholdMinutes = DELAY_THRESHOLDS_MINUTES[stationMonitorId] || 10;

            const prompt = `You are a Senior Manufacturing Auditor at MKFF Laserteknique International inc.
DIAGNOSTIC DIRECTIVE: Perform blunt root-cause analysis for manufacturing delays using technical precision.

MANUFACTURING ANALYTICS OVERVIEW:
Station: ${processName} (${stationMonitorId}) | Threshold: ${thresholdMinutes}min | Delayed Units: ${delayedCount}/${totalUnits}
Avg Delay: ${avgDelayMinutes.toFixed(1)}min | Max Delay: ${maxDelayMinutes.toFixed(1)}min

CRITICAL DIAGNOSTIC DATA:
${JSON.stringify(delayedContext, null, 2)}

MANUFACTURING AUDIT PROTOCOL:
1. QUALITY ESCAPE DETECTION: If downstream station delayed but upstream errors exist → "QUALITY ESCAPE from S[X] - Rework Loop Required"
2. PROCESS STALL ANALYSIS: If time_spent >> threshold but all checklist_values = 'GO'/'PASS' → "MANPOWER BOTTLENECK - Workflow Impediment"
3. FACILITY POWER AUDIT: Any voltage outside 113.85V-116.15V range → "FACILITY POWER ISSUE - Voltage Tolerance Breach"
4. SYSTEMIC FAILURE PATTERN: Sequential station failures → "SYSTEMIC FAILURE - Cross-Station Calibration Drift"
5. REMARKS INTELLIGENCE: Prioritize remarks field for human-caused delays and operator notes

DIAGNOSTIC CLASSIFICATION:
- Defect-Driven: High error count + high time → "QUALITY-DRIVEN DELAY"
- Process-Driven: Low error count + high time → "MANPOWER-DRIVEN DELAY"  
- Quality Escape: Upstream errors causing downstream delays → "INHERITED DEFECT ESCAPE"

TECHNICAL RESPONSE FORMAT:
1. [Direct diagnosis with manufacturing terminology]
2. [Root cause with station-specific failure mode]

Summary: [Corrective action directive - max 20 words]

USE MANUFACTURING TERMS: Rework Loop, Systemic Failure, Calibration Drift, Quality Escape, Manpower Bottleneck, Workflow Impediment`;

            // Step 2: Generate content using backend

            const genRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {
                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({

                    modelName: modelName,

                    prompt: prompt

                })

            });

            if (!genRes.ok) {
                const body = await genRes.text().catch(() => "");
                throw new Error(`generateContent failed (${genRes.status}): ${body || genRes.statusText}`);
            }

            const genData = await genRes.json();
            const text = genData.text || '';
            
            if (!text) throw new Error("Empty AI response.");
            setStationAiAnalysis(text);

        } catch (err) {
            console.error("Gemini Station Error:", err);
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

                .stat-card-pro { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; height: 100%; border-left: 5px solid #198754; }

                .table thead th { background-color: #1e293b !important; color: #ffffff !important; font-weight: 600; padding: 12px 15px; }

                .modal-step { padding: 15px 20px; border-left: 2px solid #e9ecef; position: relative; cursor: pointer; }

                .modal-dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: #dee2e6; border: 2px solid white; z-index: 2; }

                .done .modal-dot { background: #198754; }

                .current .modal-dot { background: #0d6efd; }

                .tracker-table th { background: #f1f5f9; padding: 6px 8px; border-bottom: 1px solid #cbd5e1; text-transform: uppercase; font-weight: 800; text-align: center; font-size: 0.7rem; }

                .tracker-table td { padding: 8px 8px; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 0.7rem; }

                .diagnostic-card-minimal { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }

                .delay-row { background-color: #fff5f5 !important; }

                .station-summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }

                @media (max-width: 768px) {

                    .station-summary-grid { grid-template-columns: 1fr; }

                }

                .station-summary-chip { border-radius: 10px; padding: 10px 12px; border: 1px solid #e2e8f0; background: #f9fafb; min-height: 64px; display: flex; flex-direction: column; justify-content: flex-start; }

                .station-summary-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }

                .station-summary-text { font-size: 0.8rem; font-weight: 600; color: #0f172a; }
                .ai-numbered-list { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 0.95rem; line-height: 1.8; font-weight: 500; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .ai-numbered-list .number { font-weight: 700; color: #dc2626; margin-right: 12px; font-size: 1.1rem; display: inline-block; width: 28px; height: 28px; line-height: 28px; text-align: center; background: #fee2e2; border-radius: 50%; }
                .ai-numbered-list .item { margin-bottom: 12px; padding: 12px 16px; border-radius: 8px; background: rgba(255, 255, 255, 0.8); }
                .ai-numbered-list .summary { font-weight: 700; color: #1e293b; margin-top: 16px; padding-top: 16px; border-top: 2px solid #e2e8f0; font-size: 1rem; background: rgba(59, 130, 246, 0.05); padding: 16px; border-radius: 8px; }

            `}</style>



            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 px-2">

                <div>

                    <h3 className="fw-bold text-dark mb-1">{processName}</h3>

                    <p className="text-muted small mb-0">Operational View • ID: {stationMonitorId}</p>

                </div>

                <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>

            </div>



            {/* 🔍 Station-level delay diagnosis – only when there are delayed units */}

            {hasDelayedUnits && (

                <div className="diagnostic-card-minimal p-3 mb-4 shadow-sm">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                        <div>

                            <div className="fw-bold text-dark small uppercase tracking-wider">ROOT CAUSE DELAY ANALYSIS</div>

                            <div className="small text-muted">Short AI summary of delay patterns and recommended actions for this station.</div>

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
                            className="ai-numbered-list text-dark p-3" 
                            dangerouslySetInnerHTML={{ __html: formatStationOutput(stationAiAnalysis) }}
                        />

                    ) : (

                        <div className="text-muted p-3">No analysis available.</div>

                    )}

                </div>

            )}



            <div className="row g-4 mb-4">

                <div className="col-md-6 col-xl-3"><div className="stat-card-pro"><span className="text-muted small fw-bold uppercase">Completed</span><h3 className="fw-bold text-success mt-1">{monitorMetrics.completedUnits}</h3></div></div>

                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#0d6efd'}}><span className="text-muted small fw-bold uppercase">Yield Rate</span><h3 className="fw-bold text-primary mt-1">{monitorMetrics.yieldRate}%</h3></div></div>

                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#ffc107'}}><span className="text-muted small fw-bold uppercase">In Progress</span><h3 className="fw-bold text-warning mt-1">{monitorMetrics.pendingUnits}</h3></div></div>

                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#dc3545'}}><span className="text-muted small fw-bold uppercase">No Good (NG)</span><h3 className="fw-bold text-danger mt-1">{monitorMetrics.ngUnits}</h3></div></div>

            </div>



            <div className="bg-white border rounded-2 overflow-hidden shadow-sm">

                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">

                    <span className="fw-bold small text-muted text-uppercase">Station Logs</span>

                    <div className="d-flex gap-2">

                        <select className="form-select form-select-sm" style={{width:'160px'}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{allStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>

                        <input type="text" className="form-control form-control-sm" style={{width:'200px'}} placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                        <button className="btn btn-secondary btn-sm px-3 fw-bold" onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}>RESET</button>

                    </div>

                </div>

                <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>

                        <thead>

                            <tr>

                                <th className="ps-4">MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th>

                                <th>DEVICE SERIAL</th><th>ACCESSORY</th><th className="text-center">STATUS</th>

                                <th className="text-center">DELAY (MINS)</th><th>REMARKS / NOTES</th><th>LAST MOVEMENT</th><th className="text-center">ACTIONS</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredLogs.map(log => {

                                const isHighlighted = log.id === highlightedUnitId;

                                const lastTs = log.updated_at || log.created_at;

                                const minutesInStation = lastTs

                                    ? Math.max(0, (new Date().getTime() - new Date(lastTs).getTime()) / (1000 * 60))

                                    : 0;



                                const thresholdMinutes = DELAY_THRESHOLDS_MINUTES[stationMonitorId] || 10;

                                const statusText = (log.status || '').toLowerCase();

                                const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');

                                const delay = isInProgressOrNG

                                    ? checkUnitDelay(stationMonitorId, lastTs)

                                    : { isDelayed: false, minutes: minutesInStation, level: 'NORMAL' };



                                const isCompleted = statusText.includes('completed') || statusText.includes('ok');

                                const moveNextThreshold = Math.max(10, thresholdMinutes); // avoid too sensitive thresholds

                                const needsMoveNext = isCompleted && minutesInStation > moveNextThreshold;



                                const delayMinutes = Math.max(0, minutesInStation - thresholdMinutes);

                                return (

                                    <tr 

                                        key={log.id} 

                                        // PINALITAN: Nagdagdag ng check kung ang log.id ay tumutugma sa highlightedUnitId

                                        className={`

                                            ${delay.isDelayed ? 'delay-row' : ''} 

                                            ${log.id === highlightedUnitId ? 'highlight-pulse' : ''}

                                        `}

                                    >

                                        <td className="ps-4 fw-bold">{log.model}</td>

                                        <td>{log.revision}</td>

                                        <td>{log.base_unit_kitting_no}</td>

                                        <td>

                                            <code className="text-primary fw-bold">{log.assembly_no}</code>

                                            {delay.isDelayed && <i className="bi bi-exclamation-triangle-fill text-danger ms-2" title={`Delayed: ${delay.level}`}></i>}

                                        </td>

                                        <td className="fw-bold">{log.device_serial_no}</td>

                                        <td>{log.accessory_kitting_no}</td>

                                        <td className="text-center"><span className={`badge rounded-1 px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span></td>

                                        <td className="text-center">

                                            {isInProgressOrNG && delay.isDelayed ? (

                                                <span className={`badge rounded-pill ${delay.level === 'CRITICAL' ? 'bg-danger' : 'bg-warning text-dark'}`}>

                                                    +{Math.round(delayMinutes)}m

                                                </span>

                                            ) : (

                                                <span className="text-muted small">—</span>

                                            )}

                                        </td>

                                        <td className="text-muted small italic">

                                            {log.remarks || '---'}

                                            {needsMoveNext && (

                                                <div className="mt-1">

                                                    <span className="badge bg-warning text-dark fw-bold">MOVE TO NEXT STATION</span>

                                                    <div className="small text-muted mt-1">Completed but still here for {Math.round(minutesInStation)} mins.</div>

                                                </div>

                                            )}

                                        </td>

                                        <td className="small text-muted">{new Date(log.updated_at || log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>

                                        <td className="text-center">

                                            <div className="d-flex gap-1 justify-content-center">

                                                <button className="btn btn-sm btn-primary px-3 fw-bold" onClick={() => setSelectedUnitProcess(log)}>

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



            {selectedUnitProcess && (

                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>

                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '900px' }}>

                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-primary shadow-sm">

                            <div><h5 className="mb-0 fw-bold">Process Tracker</h5><p className="mb-0 small opacity-75">{selectedUnitProcess.assembly_no}</p></div>

                            <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnitProcess(null)}></button>

                        </div>



                        <div className="p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

                            <div className="process-timeline mt-4 ps-2">

                                {processStations.map((station, idx) => {

                                    // Determine unit's actual station progress from unit data, not current viewing station
                                    const unitCurrentStation = selectedUnitProcess.station || '';
                                    const unitStationIndex = parseInt(unitCurrentStation.replace('Station', '')) - 1;
                                    
                                    const isCurrent = idx === unitStationIndex;

                                    const isDoneBefore = idx < unitStationIndex;

                                    const unitStatus = selectedUnitProcess.status?.toLowerCase() || '';

                                    const isCompletedHere = isCurrent && unitStatus.includes('completed');

                                    const isNG = isCurrent && unitStatus.includes('no good');

                                    const isExpanded = expandedStepIdx === idx;



                                   // Enhanced logic: Show historical checklist data from all previous stations
let stationData = null;

// Show data for ALL previous stations the unit has passed through, based on unit's actual progress
if (idx <= unitStationIndex) { // Show data for current station AND all previous stations
    if (idx === 0) { // Station 1: PCB Pairing - from station1_checklists table
        stationData = { 
            "Header Connector Upright (90°)": selectedUnitProcess.s1_header_seated_90_deg ?? "N/A",
            "Leads Properly Soldered": selectedUnitProcess.s1_leads_properly_soldered ?? "N/A"
        };
    } else if (idx === 1) { // Station 2: Integrated Board Test - from station2_checklists table
        stationData = { 
            "LoRa Module": selectedUnitProcess.s2_lora_module ?? "N/A",
            "LoRa Mesh Test": selectedUnitProcess.s2_lora_mesh_test ?? "N/A",
            "Energy Meter": selectedUnitProcess.s2_energy_meter ?? "N/A",
            "Power Good Test": selectedUnitProcess.s2_power_good_test ?? "N/A",
            "Voltage (Ref)": selectedUnitProcess.s2_voltage ?? "N/A",
            "Line 1": selectedUnitProcess.s2_line1 ?? "N/A",
            "Line 2": selectedUnitProcess.s2_line2 ?? "N/A",
            "Line 3": selectedUnitProcess.s2_line3 ?? "N/A",
            "Temp Reading": selectedUnitProcess.s2_temp_reading ?? "N/A",
            "Freq Reading": selectedUnitProcess.s2_freq_reading ?? "N/A",
            "4G LED": selectedUnitProcess.s2_led_status_4g ?? "N/A",
            "Fast Blink RED": selectedUnitProcess.s2_led_status_fast_blink ?? "N/A",
            "SW1 Off to LED Off (sec)": selectedUnitProcess.s2_sw1_off_to_led_off_duration === 0 ? "0s" : (selectedUnitProcess.s2_sw1_off_to_led_off_duration ?? "N/A"),
            "Go/No-Go Result": selectedUnitProcess.s2_go_no_go ?? "N/A"
        };
    } else if (idx === 2) { // Station 3: Main Board Conformal Coating - from station3_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s3_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s3_remarks ?? "N/A"
        };
    } else if (idx === 3) { // Station 4: RTV Application - from station4_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s4_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s4_remarks ?? "N/A"
        };
    } else if (idx === 4) { // Station 5: Casing/Harnessing - from station5_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s5_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s5_remarks ?? "N/A"
        };
    } else if (idx === 5) { // Station 6: Complete Unit Test/Calibration - from station6_checklists table
        stationData = { 
            "LoRa Module": selectedUnitProcess.s6_lora_module ?? "N/A",
            "LoRa Mesh Test": selectedUnitProcess.s6_lora_mesh_test ?? "N/A",
            "Energy Meter": selectedUnitProcess.s6_energy_meter ?? "N/A",
            "Power Good Test": selectedUnitProcess.s6_power_good_test ?? "N/A",
            "Voltage (Ref)": selectedUnitProcess.s6_voltage ?? "N/A",
            "Line 1": selectedUnitProcess.s6_line1 ?? "N/A",
            "Line 2": selectedUnitProcess.s6_line2 ?? "N/A",
            "Line 3": selectedUnitProcess.s6_line3 ?? "N/A",
            "Temp Reading": selectedUnitProcess.s6_temp_reading ?? "N/A",
            "Freq Reading": selectedUnitProcess.s6_freq_reading ?? "N/A",
            "4G LED": selectedUnitProcess.s6_led_status_4g ?? "N/A",
            "Fast Blink RED": selectedUnitProcess.s6_led_status_fast_blink ?? "N/A",
            "SW1 Off to LED Off (sec)": selectedUnitProcess.s6_sw1_off_to_led_off_duration === 0 ? "0s" : (selectedUnitProcess.s6_sw1_off_to_led_off_duration ?? "N/A"),
            "Go/No-Go Result": selectedUnitProcess.s6_go_no_go ?? "N/A"
        };
    } else if (idx === 6) { // Station 7: Pre BI Hi-Pot Test - from station7_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s7_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s7_remarks ?? "N/A"
        };
    } else if (idx === 7) { // Station 8: Burn-in Testing - from station8_checklists table
        stationData = { 
            "Power Unit and Disable LoRa": selectedUnitProcess.s8_power_unit_disable_lora ?? "N/A",
            "Confirm Frequency Band": selectedUnitProcess.s8_frequency_band ?? "N/A",
            "Start Testing": selectedUnitProcess.s8_start_testing ?? "N/A",
            "Confirm RSSO Testing": selectedUnitProcess.s8_rsso_testing ?? "N/A",
            "Data Outage": selectedUnitProcess.s8_data_outage ?? "N/A"
        };
    } else if (idx === 8) { // Station 9: Sealing - from station9_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s9_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s9_remarks ?? "N/A"
        };
    } else if (idx === 9) { // Station 10: Post BI Hi-Pot Test - from station10_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s10_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s10_remarks ?? "N/A"
        };
    } else if (idx === 10) { // Station 11: Final Functional/Connectivity Test - from station11_checklists table
        stationData = { 
            "LED Status": selectedUnitProcess.s11_led_status ?? "N/A",
            "Low Range": selectedUnitProcess.s11_low_range ?? "N/A",
            "Medium Range": selectedUnitProcess.s11_medium_range ?? "N/A",
            "High Range": selectedUnitProcess.s11_high_range ?? "N/A"
        };
    } else if (idx === 11) { // Station 12: Label Sticker Attachment - from station12_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s12_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s12_remarks ?? "N/A"
        };
    } else if (idx === 12) { // Station 13: FVI - from station13_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s13_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s13_remarks ?? "N/A"
        };
    } else if (idx === 13) { // Station 14: Packing - from station14_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s14_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s14_remarks ?? "N/A"
        };
    } else if (idx === 14) { // Station 15: QC Stamping - from station15_checklists table
        stationData = { 
            "Requirements": selectedUnitProcess.s15_requirements ?? "N/A",
            "Remarks": selectedUnitProcess.s15_remarks ?? "N/A"
        };
    }
}
                                 let stepClass = isDoneBefore || isCompletedHere ? 'done' : (isNG ? 'ng' : (isCurrent ? 'current' : ''));

                                    return (

                                        <div key={idx} className={`modal-step ${stepClass}`} onClick={() => stationData && setExpandedStepIdx(isExpanded ? null : idx)}>

                                            <div className="modal-dot"></div>

                                            <div className="d-flex justify-content-between align-items-center">

                                                <div><div className="fw-bold small">{idx + 1}. {station}</div></div>

                                                {stationData && <span className="badge bg-light text-dark border" style={{fontSize: '0.6rem'}}>VIEW DATA</span>}

                                            </div>

                                            {isExpanded && stationData && (

                                                <div className="tracker-checklist-box">

                                                    <table className="tracker-table table-sm">

                                                        <thead><tr>{Object.keys(stationData).map(k => <th key={k}>{k}</th>)}</tr></thead>

                                                        <tbody>

                                                            <tr>{Object.entries(stationData).map(([key, value]) => (
                                                                <td key={key} className={isErrorValue(value, key) ? 'text-danger fw-bold' : 'text-success'}>{value || 'N/A'}</td>
                                                            ))}</tr>

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

                            <button className="btn btn-secondary px-5 fw-bold py-2 rounded shadow-sm" onClick={() => setSelectedUnitProcess(null)}>DISMISS</button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};



export function StationsOverview({

    activeTab, stations, calculateMetrics, stationMonitorId, highlightedUnitId, setActiveTab, handleMonitorStation, handleViewHistory, handleEditClick, fetchData, allLogs, 

}) {

    const [historySearch, setHistorySearch] = useState('');

    const [startDate, setStartDate] = useState('');

    const [endDate, setEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);

    const [delayHotspotsAi, setDelayHotspotsAi] = useState(null); // { [stationId]: reason }

    const [isDelayHotspotsAiLoading, setIsDelayHotspotsAiLoading] = useState(false);

    // Format hotspot AI output with the same styling
    const formatHotspotOutput = (text) => {
        if (!text) return '';
        
        const lines = text.split('\n').filter(line => line.trim());
        let formatted = '';
        let itemIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Remove all asterisks and clean up formatting
            line = line.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            
            // Check if it's a numbered item
            if (line.match(/^\d+\./)) {
                itemIndex++;
                const content = line.replace(/^\d+\.\s*/, '');
                formatted += `<div class="item"><span class="number">${itemIndex}</span>${content}</div>`;
            }
            // Check if it's a summary line
            else if (line.toLowerCase().includes('summary:')) {
                const summary = line.replace(/^summary:\s*/i, '');
                formatted += `<div class="summary"><strong>Summary:</strong> ${summary}</div>`;
            }
            // Regular line
            else if (line) {
                formatted += `<div class="item">${line}</div>`;
            }
        }
        
        return formatted;
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



    // ✨ PAGINATION LOGIC RESTORED

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

        // Compute top 3 stations with most delayed units (and basic reason from remarks)

        const stats = namedStations.map((station) => {

            const metrics = calculateMetrics(station.id);

            const logsForStation = metrics.stationLogs || [];



            let delayedUnits = 0;

            let totalDelayMinutes = 0;

            let maxDelayMinutes = 0;



            const remarkCounts = new Map();

            logsForStation.forEach(log => {

                const statusText = (log.status || '').toLowerCase();

                const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');

                

                if (isInProgressOrNG) {

                    const delay = checkUnitDelay(station.id, log.updated_at || log.created_at);

                    if (delay.isDelayed) {

                        delayedUnits += 1;

                        totalDelayMinutes += delay.minutes;

                        if (delay.minutes > maxDelayMinutes) maxDelayMinutes = delay.minutes;



                        const remark = (log.remarks || '').trim();

                        if (remark) remarkCounts.set(remark, (remarkCounts.get(remark) || 0) + 1);

                    }

                }

            });



            const avgDelayMinutes = delayedUnits ? (totalDelayMinutes / delayedUnits) : 0;

            let topRemark = '';

            let topRemarkCount = 0;

            remarkCounts.forEach((count, remark) => {

                if (count > topRemarkCount) {

                    topRemark = remark;

                    topRemarkCount = count;

                }

            });



   return {

    stationId: station.id,

    stationName: station.name,

    delayedUnits,

    avgDelayMinutes,

    maxDelayMinutes,

    thresholdMinutes: DELAY_THRESHOLDS_MINUTES[station.id] || 10,

    fallbackReason: '', // Gawing blanko ito

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

            // Step 1: Get available model from backend

            const modelRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ action: 'list_models' })

            });

            

            if (!modelRes.ok) {

                const body = await modelRes.text().catch(() => "");

                throw new Error(`Model listing failed (${modelRes.status}): ${body || modelRes.statusText}`);

            }

            

            const modelData = await modelRes.json();

            if (!modelData.modelName) {

                throw new Error('No model returned from backend');

            }

            // Ito ang binabasa ni Gemini

const payload = delayHotspots.map(h => {
    const metrics = calculateMetrics(h.stationId);
    const delayedSamples = (metrics.stationLogs || [])
        .filter(log => checkUnitDelay(h.stationId, log.updated_at || log.created_at).isDelayed)
        .slice(0, 3)
        .map(log => {
            // Pre-diagnostic checklist error scanning
            const checklist_errors = [];
            const checklist_values = {}; // Store actual values for analysis
            
            // Scan all historical stations for failures and capture values
            const voltage_tolerance = { min: 113.85, max: 116.15 }; // ±1% of 115V
            
            // Station 1 checks
            checklist_values.s1_header_seated_90_deg = log.s1_header_seated_90_deg;
            checklist_values.s1_leads_properly_soldered = log.s1_leads_properly_soldered;
            if (log.s1_header_seated_90_deg === 'NO GO' || log.s1_header_seated_90_deg === 'FAIL') checklist_errors.push('S1: Header seating failure');
            if (log.s1_leads_properly_soldered === 'NO GO' || log.s1_leads_properly_soldered === 'FAIL') checklist_errors.push('S1: Soldering defects');
            
            // Station 2 checks
            checklist_values.s2_lora_module = log.s2_lora_module;
            checklist_values.s2_lora_mesh_test = log.s2_lora_mesh_test;
            checklist_values.s2_energy_meter = log.s2_energy_meter;
            checklist_values.s2_power_good_test = log.s2_power_good_test;
            checklist_values.s2_voltage = log.s2_voltage;
            checklist_values.s2_go_no_go = log.s2_go_no_go;
            
            if (log.s2_lora_module === 'Not Detected' || log.s2_lora_module === 'FAIL') checklist_errors.push('S2: LoRa module not detected');
            if (log.s2_lora_mesh_test === 'Not Detected' || log.s2_lora_mesh_test === 'FAIL') checklist_errors.push('S2: Mesh test failure');
            if (log.s2_energy_meter === 'Not Detected' || log.s2_energy_meter === 'FAIL') checklist_errors.push('S2: Energy meter issue');
            if (log.s2_power_good_test === 'Not Detected' || log.s2_power_good_test === 'FAIL') checklist_errors.push('S2: Power good failure');
            if (log.s2_voltage && (log.s2_voltage < voltage_tolerance.min || log.s2_voltage > voltage_tolerance.max)) checklist_errors.push('S2: Voltage out of tolerance');
            if (log.s2_go_no_go === 'NO GO' || log.s2_go_no_go === 'FAIL') checklist_errors.push('S2: Final test failure');
            
            // Station 3-5 checks (standard stations)
            checklist_values.s3_requirements = log.s3_requirements;
            checklist_values.s4_requirements = log.s4_requirements;
            checklist_values.s5_requirements = log.s5_requirements;
            
            if (log.s3_requirements === 'FAIL' || log.s3_requirements === 'NO GO') checklist_errors.push('S3: Requirements not met');
            if (log.s4_requirements === 'FAIL' || log.s4_requirements === 'NO GO') checklist_errors.push('S4: Requirements not met');
            if (log.s5_requirements === 'FAIL' || log.s5_requirements === 'NO GO') checklist_errors.push('S5: Requirements not met');
            
            // Station 6 checks
            checklist_values.s6_lora_module = log.s6_lora_module;
            checklist_values.s6_lora_mesh_test = log.s6_lora_mesh_test;
            checklist_values.s6_voltage = log.s6_voltage;
            checklist_values.s6_go_no_go = log.s6_go_no_go;
            
            if (log.s6_lora_module === 'Not Detected' || log.s6_lora_module === 'FAIL') checklist_errors.push('S6: LoRa module not detected');
            if (log.s6_lora_mesh_test === 'Not Detected' || log.s6_lora_mesh_test === 'FAIL') checklist_errors.push('S6: Mesh test failure');
            if (log.s6_voltage && (log.s6_voltage < voltage_tolerance.min || log.s6_voltage > voltage_tolerance.max)) checklist_errors.push('S6: Voltage out of tolerance');
            if (log.s6_go_no_go === 'NO GO' || log.s6_go_no_go === 'FAIL') checklist_errors.push('S6: Final calibration failure');
            
            // Station 7-10 checks
            checklist_values.s7_requirements = log.s7_requirements;
            checklist_values.s8_power_unit_disable_lora = log.s8_power_unit_disable_lora;
            checklist_values.s8_rsso_testing = log.s8_rsso_testing;
            checklist_values.s9_requirements = log.s9_requirements;
            checklist_values.s10_requirements = log.s10_requirements;
            
            if (log.s7_requirements === 'FAIL' || log.s7_requirements === 'NO GO') checklist_errors.push('S7: Requirements not met');
            if (log.s8_power_unit_disable_lora === 'FAIL' || log.s8_power_unit_disable_lora === 'NO GO') checklist_errors.push('S8: Power unit issue');
            if (log.s8_rsso_testing === 'FAIL' || log.s8_rsso_testing === 'NO GO') checklist_errors.push('S8: RSSO test failure');
            if (log.s9_requirements === 'FAIL' || log.s9_requirements === 'NO GO') checklist_errors.push('S9: Requirements not met');
            if (log.s10_requirements === 'FAIL' || log.s10_requirements === 'NO GO') checklist_errors.push('S10: Requirements not met');
            
            // Station 11 checks
            checklist_values.s11_led_status = log.s11_led_status;
            checklist_values.s11_low_range = log.s11_low_range;
            checklist_values.s11_medium_range = log.s11_medium_range;
            checklist_values.s11_high_range = log.s11_high_range;
            
            if (log.s11_led_status === 'FAIL' || log.s11_led_status === 'NO GO') checklist_errors.push('S11: LED status failure');
            if (log.s11_low_range === 'FAIL' || log.s11_low_range === 'NO GO') checklist_errors.push('S11: Low range failure');
            if (log.s11_medium_range === 'FAIL' || log.s11_medium_range === 'NO GO') checklist_errors.push('S11: Medium range failure');
            if (log.s11_high_range === 'FAIL' || log.s11_high_range === 'NO GO') checklist_errors.push('S11: High range failure');
            
            // Station 12-14 checks
            checklist_values.s12_requirements = log.s12_requirements;
            checklist_values.s13_requirements = log.s13_requirements;
            checklist_values.s14_requirements = log.s14_requirements;
            
            if (log.s12_requirements === 'FAIL' || log.s12_requirements === 'NO GO') checklist_errors.push('S12: Sticker attachment failure');
            if (log.s13_requirements === 'FAIL' || log.s13_requirements === 'NO GO') checklist_errors.push('S13: FVI requirements not met');
            if (log.s14_requirements === 'FAIL' || log.s14_requirements === 'NO GO') checklist_errors.push('S14: Packing requirements not met');
            
            return {
                assembly: log.assembly_no,
                current_station: log.station,
                time_spent: Math.round(checkUnitDelay(h.stationId, log.updated_at).minutes),
                checklist_errors: checklist_errors, // Error array (may be empty if all GO)
                checklist_values: checklist_values, // Actual values for analysis
                last_remarks: log.remarks || '',
                // Full checklist data for AI analysis
                full_checklists: {
                    s1: { seated: log.s1_header_seated_90_deg, solder: log.s1_leads_properly_soldered },
                    s2: { lora: log.s2_lora_module, mesh: log.s2_lora_mesh_test, v: log.s2_voltage, go_no_go: log.s2_go_no_go },
                    s6: { v: log.s6_voltage, verdict: log.s6_go_no_go },
                    s11: { led: log.s11_led_status, range: log.s11_low_range }
                }
            };
        });

    return {
        stationName: h.stationName,
        stationId: h.stationId,
        delayedUnits: h.delayedUnits,
        avgDelayMinutes: h.avgDelayMinutes,
        samples: delayedSamples
    };
});

           // Siguraduhin na ang payload ay na-define na sa itaas nito
const prompt = `You are a Senior Manufacturing Systems Engineer at MKFF.
Perform advanced root-cause analysis for production delay hotspots using comprehensive diagnostic data.

ENHANCED DIAGNOSTIC DATA (JSON format):
${JSON.stringify(payload, null, 2)}

ADVANCED ANALYSIS PROTOCOL:
1. CUMULATIVE REWORK LOOPS: Cross-reference checklist_errors array with current delay. If errors exist in previous stations, diagnose "cumulative rework loops" or "inherited defects" as root cause.

2. INHERITED DEFECT DETECTION: Scan checklist_errors for patterns like:
   - S1/S2 failures causing downstream verification delays
   - Voltage tolerance violations (±1% of 115V) indicating power quality issues
   - Sequential failures across multiple stations indicating systemic problems

3. PROCESS STALL ANALYSIS: When checklist_errors array is EMPTY, analyze checklist_values:
   - If checklist_values show "GO", "Detected", "Passed" values: Process stall or documentation failure
   - If checklist_values are null/undefined: Missing checklist data requiring documentation update
   - If all tests passed but time_spent is high: Manpower bottleneck or logistics impedance

4. MANUFACTURING SYSTEM LOGIC:
   - If checklist_errors has entries: "Inherited defects from [station] causing extended rework verification"
   - If checklist_errors empty but checklist_values show GO values: "Process stall with all tests passed - documentation or workflow issue"
   - If Station 11 range failures: "Connectivity interference or calibration drift requiring extended testing"
   - If voltage tolerance violations: "Power quality issues causing repeated test failures"

5. HISTORICAL CORRELATION: Analyze time_spent vs checklist_errors to determine if delays are:
   - Defect-driven (high error count + high time)
   - Process-driven (low error count + high time)
   - Documentation-driven (GO values but no progress)

OUTPUT SPECIFICATION:
Return EXACTLY ${payload.length} lines (no extra text), format:
StationID | [Deep-dive technical reason linking history to current delay. Max 25 words]`;



            // Step 2: Generate content using backend

            const genRes = await fetch('http://localhost/mkffwebsystem/backend/api/gemini.php', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({

                    modelName: modelData.modelName,

                    prompt: prompt

                })

            });

            

            if (!genRes.ok) {

                const body = await genRes.text().catch(() => "");

                throw new Error(`generateContent failed (${genRes.status}): ${body || genRes.statusText}`);

            }

            

            const genData = await genRes.json();

            const text = genData.text || '';

            

            if (!text) throw new Error("Empty AI response.");



            const lines = text

                .split(/\r?\n/)

                .map(l => l.trim())

                .filter(Boolean);



            const map = {};

            lines.forEach(line => {

                const [stationIdRaw, ...rest] = line.split('|');

                const stationId = (stationIdRaw || '').trim();

                const reason = rest.join('|').trim();

                if (stationId && reason) map[stationId] = reason;

            });



            setDelayHotspotsAi(map);

        } catch (err) {

            console.error("Delay Hotspots AI Error:", err);

            setDelayHotspotsAi({ __error: String(err?.message || err) });

        } finally {

            setIsDelayHotspotsAiLoading(false);

        }

    };



    if (activeTab === "station_monitor" && stationMonitorId) {

        return <StationMonitorView {...{stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData}} />;

    }



    if (activeTab === "overall_history") {

        return (

            <div className="pb-5 container-fluid px-0">

                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">

                    <div><h4 className="fw-bold text-dark mb-0">Production History</h4></div>

                    <button className="btn btn-light border btn-sm px-3 shadow-sm fw-bold" onClick={() => setActiveTab('stations')}>BACK</button>

                </div>

                <div className="bg-light p-3 rounded-2 border mb-4 d-flex flex-wrap gap-3 align-items-end mx-2 shadow-sm">

                    <div className="flex-grow-1"><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Assembly No.</label><input type="text" className="form-control form-control-sm shadow-none" placeholder="Search..." value={historySearch} onChange={(e) => {setHistorySearch(e.target.value); setCurrentPage(1);}} /></div>

                    <div><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>Start</label><input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} /></div>

                    <div><label className="fw-bold small text-muted mb-1 d-block uppercase" style={{fontSize:'0.65rem'}}>End</label><input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} /></div>

                    <button className="btn btn-danger btn-sm px-3 fw-bold shadow-sm" onClick={() => { setHistorySearch(''); setStartDate(''); setEndDate(''); setCurrentPage(1); }}>RESET</button>

                </div>

                <div className="bg-white border rounded-2 overflow-hidden mx-2 shadow-sm">

                    <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>

                        <thead className="table-dark">

                            <tr><th>MODEL</th><th>ASSEMBLY</th><th>TYPE</th><th>STATION</th><th className="text-center">STATUS</th><th className="text-end pe-4">TIMESTAMP</th></tr>

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

                                        <td className="text-center"><span className={`badge rounded-1 px-3 ${getStatusBadgeClass(log.status_after || log.status)}`}>{log.status_after || log.status}</span></td>

                                        <td className="text-end pe-4 small text-muted"><strong>{ts.date}</strong><br/>{ts.time}</td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                    

                    {/* ✨ PAGINATION CONTROLS */}

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

                .station-card-flat { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; height: 100%; position: relative; }

                .delay-indicator { position: absolute; top: 10px; right: 10px; color: #dc3545; font-size: 0.8rem; animation: pulse-red 1.5s infinite; }

                @keyframes pulse-red {

                    0% { opacity: 1; transform: scale(1); }

                    50% { opacity: 0.7; transform: scale(1.1); }

                    100% { opacity: 1; transform: scale(1); }

                }

                .metric-row { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }

                .hotspot-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }

                .hotspot-row { display: grid; grid-template-columns: 34px 1.4fr 0.6fr 0.6fr 2fr; gap: 10px; align-items: center; }

                @media (max-width: 992px) {

                    .hotspot-row { grid-template-columns: 34px 1fr; gap: 6px; }

                }

            `}</style>

            

            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">

                <div><h4 className="fw-bold text-dark mb-0">Station Control Panel</h4><p className="text-muted small mb-0">Operational real-time monitoring dashboard.</p></div>

                <button className="btn btn-dark btn-sm px-4 py-2 shadow-sm fw-bold" onClick={() => setActiveTab('overall_history')}>OVERALL HISTORY</button>

            </div>



            

            <div className="row g-4">

                {namedStations.map((station) => {

                    const metrics = calculateMetrics(station.id);

                    const delayedCount = (metrics.stationLogs || []).filter(log => {

                        const statusText = (log.status || '').toLowerCase();

                        const isInProgressOrNG = log.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');

                        return isInProgressOrNG && checkUnitDelay(station.id, log.updated_at || log.created_at).isDelayed;

                    }).length;

                    return (

                        <div key={station.id} className="col-md-3">

                            <div className="station-card-flat shadow-sm">

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

                                <div className="mb-4">

                                    <div className="metric-row"><span>COMPLETED</span><span className="text-success">{metrics.completedUnits}</span></div>

                                    <div className="metric-row"><span>IN PROGRESS</span><span className="text-primary">{metrics.pendingUnits}</span></div>

                                    <div className="metric-row"><span>NO GOOD (NG)</span><span className="text-danger">{metrics.ngUnits}</span></div>

                                </div>

                                <div className="d-flex gap-2">

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