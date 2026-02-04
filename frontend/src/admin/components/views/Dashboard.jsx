import React, { useRef, useEffect, useState, useMemo } from 'react'; 
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useTargetTimes } from '../../../utils/targetTimeService';

ChartJS.register(
    LineElement,
    PointElement,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
);

// --- CONFIGURATIONS ---

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const stationDescriptions = {
    "PCB Pairing": "Assembling boards and pairing components.",
    "Integrated Board Test": "Testing the compatibility of the three boards.",
    "Main Board Conformal Coating": "Applying protective coating to the main board.",
    "RTV Application": "Applying Room Temperature Vulcanizing sealant.",
    "Casing/Harnessing": "Assembling the unit into the casing and wire harnessing.",
    "Complete Unit Test/Calibration": "Calibrating and testing voltage accuracy.",
    "Pre BI Hi-Pot Test": "High potential safety testing before burn-in.",
    "Burn-in Testing": "Stress testing under full load conditions.",
    "Sealing": "Final sealing of the unit enclosure.",
    "Post BI Hi-Pot Test": "Secondary high voltage test after burn-in.",
    "Final Functional/Connectivity Test": "Checking final functions and network connectivity.",
    "Label Sticker Attachment": "Checking if all stickers are correctly attached.",
    "FVI": "Final Visual Inspection for physical defects.",
    "Packing": "Secure packaging of the unit for shipping.",
    "QC Stamping": "Validation of unit checklist and final QC approval."
};

const checkUnitDelay = (stationId, updatedAt, thresholds) => {
    const threshold = thresholds[stationId] || 10;
    const lastUpdate = new Date(updatedAt).getTime();
    const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
    if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };
    if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };
    return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };
};

const hourLabel = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success-subtle text-success border-0';
    if (statusText.includes('no good') || statusText.includes('ng')) return 'bg-danger-subtle text-danger border-0';
    if (statusText.includes('pending approval')) return 'bg-primary-subtle text-primary border-0'; 
    if (statusText.includes('in progress')) return 'bg-warning-subtle text-warning border-0'; 
    if (statusText.includes('scanning')) return 'bg-info-subtle text-info border-0';
    return 'bg-light text-secondary border';
};

export function Dashboard({
    logs = [],
    stations = [],
    calculateMetrics,
    overallMetrics, 
    setActiveTab,
    handleMonitorStation,
    newReportsToday,
    setHighlightedUnitId
}) {
    
    // Use dynamic target times
    const { thresholds: dynamicDelayThresholds } = useTargetTimes();
    
    const stepperRef = useRef(null); 
    const [searchTerm, setSearchTerm] = useState('');
    const [qrValue, setQrValue] = useState(''); 
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [criticalStationAnalysis, setCriticalStationAnalysis] = useState('');
    const [isCriticalAnalysisLoading, setIsCriticalAnalysisLoading] = useState(false);

    const handleQrInput = (val) => {
        setQrValue(val);
        const parts = val.split(/[|]+/); 
        const assemblyFromQR = parts.find(p => p.trim().toUpperCase().startsWith('ASSY-'))?.trim();
        if (assemblyFromQR) {
            const matchedUnit = logs.find(l => l.assembly_no?.toLowerCase() === assemblyFromQR.toLowerCase());
            if (matchedUnit) {
                setSelectedUnit(matchedUnit);
                setQrValue('');
            }
        }
    };

    const scrollStepper = (direction) => {
        if (stepperRef.current) {
            const scrollAmount = 300;
            stepperRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const forScanningUnitsCount = useMemo(() => logs.filter(l => l.status === 'For Scanning').length, [logs]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return logs.filter(l => l.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
    }, [logs, searchTerm]);

    const stats = useMemo(() => {
        const coreProductionUnits = overallMetrics.completedUnits + overallMetrics.pendingUnits + overallMetrics.ngUnits + overallMetrics.pendingApprovalUnits; 
        const total = coreProductionUnits + forScanningUnitsCount;
        const getPct = (value) => total === 0 ? '0.0%' : ((value / total) * 100).toFixed(1) + '%';
        return {
            coreProductionUnits,
            totalUnits: total,
            pct: {
                scanned: getPct(coreProductionUnits),
                forScanning: getPct(forScanningUnitsCount),
                wip: getPct(overallMetrics.pendingUnits),
                completed: getPct(overallMetrics.completedUnits),
                ng: getPct(overallMetrics.ngUnits),
                approval: getPct(overallMetrics.pendingApprovalUnits)
            }
        };
    }, [overallMetrics, forScanningUnitsCount]);

    // 🥇 Throughput Trend: Completed units per hour (last 12 hours) + delta vs previous 12 hours
    const throughputTrend = useMemo(() => {
        const now = new Date();
        const hours = 12;
        const bucketStart = new Date(now.getTime() - hours * 60 * 60 * 1000);
        bucketStart.setMinutes(0, 0, 0);

        const makeBuckets = (start, count) => {
            const arr = [];
            for (let i = 0; i < count; i++) {
                const t = new Date(start.getTime() + i * 60 * 60 * 1000);
                arr.push({ t, key: t.getTime(), count: 0 });
            }
            return arr;
        };

        const buckets = makeBuckets(bucketStart, hours + 1); // include current hour
        const bucketMap = new Map(buckets.map(b => [b.key, b]));

        const prevStart = new Date(bucketStart.getTime() - hours * 60 * 60 * 1000);
        const prevEnd = new Date(bucketStart.getTime());

        let currentTotal = 0;
        let prevTotal = 0;

        (logs || []).forEach(l => {
            const status = (l.status || '').toLowerCase();
            const isCompleted = status === 'completed' || status.includes('completed') || status.includes('ok');
            if (!isCompleted) return;

            const ts = new Date(l.updated_at || l.created_at);
            if (Number.isNaN(ts.getTime())) return;

            // current window buckets
            if (ts >= bucketStart) {
                const h = new Date(ts);
                h.setMinutes(0, 0, 0);
                const k = h.getTime();
                if (bucketMap.has(k)) {
                    bucketMap.get(k).count += 1;
                    currentTotal += 1;
                }
            }

            // previous window total
            if (ts >= prevStart && ts < prevEnd) {
                prevTotal += 1;
            }
        });

        const labels = buckets.map(b => hourLabel(b.t));
        const data = buckets.map(b => b.count);
        const deltaPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : (currentTotal > 0 ? 100 : 0);

        return { labels, data, currentTotal, prevTotal, deltaPct };
    }, [logs]);

    // 🥈 Avg Cycle Time per Station: avg minutes in-station for in-progress units vs threshold
    const cycleTimePerStation = useMemo(() => {
        const rows = (stations || []).map((s, idx) => {
            const m = calculateMetrics(s.id) || {};
            const stationLogs = m.stationLogs || [];
            const inProgress = stationLogs.filter(l => {
                const statusText = (l.status || '').toLowerCase();
                return l.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
            });

            const times = inProgress
                .map(l => {
                    const ts = new Date(l.updated_at || l.created_at);
                    if (Number.isNaN(ts.getTime())) return null;
                    return (new Date().getTime() - ts.getTime()) / (1000 * 60);
                })
                .filter(v => typeof v === 'number');

            const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
            const threshold = dynamicDelayThresholds[s.id] || 10;
            const exceedsThreshold = avg > threshold;
            
            return {
                id: s.id,
                name: s.name || s.id, // Use actual station name
                avgMinutes: avg,
                thresholdMinutes: threshold,
                exceedsPct: threshold > 0 ? ((avg - threshold) / threshold) * 100 : 0,
                exceedsThreshold,
                delayedUnits: inProgress.filter(l => {
                    const delay = checkUnitDelay(s.id, l.updated_at || l.created_at, dynamicDelayThresholds);
                    return delay.isDelayed;
                }).length,
                totalUnits: inProgress.length
            };
        });

        // Sort by exceedance percentage (worst first) but show all stations
        rows.sort((a, b) => b.exceedsPct - a.exceedsPct);
        return rows;
    }, [stations, calculateMetrics]);

    // � Identify Worst Station: station with most units exceeding thresholds
    const worstStation = useMemo(() => {
        const stationAnalysis = (stations || []).map((s, idx) => {
            const m = calculateMetrics(s.id) || {};
            const stationLogs = m.stationLogs || [];
            const inProgress = stationLogs.filter(l => {
                const statusText = (l.status || '').toLowerCase();
                return l.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
            });

            // Count units exceeding thresholds
            const delayedUnits = inProgress.filter(l => {
                const delay = checkUnitDelay(s.id, l.updated_at || l.created_at, dynamicDelayThresholds);
                return delay.isDelayed;
            });

            // Calculate metrics
            const totalWIP = inProgress.length;
            const stuckUnits = delayedUnits.length;
            const delays = delayedUnits.map(l => {
                const delay = checkUnitDelay(s.id, l.updated_at || l.created_at, dynamicDelayThresholds);
                return delay.minutes;
            });
            const avgDelay = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

            return {
                id: s.id,
                name: s.name || s.id,
                totalWIP,
                stuckUnits,
                avgDelay,
                delayedUnits,
                stationLogs: inProgress
            };
        });

        // Sort by number of stuck units (worst first)
        stationAnalysis.sort((a, b) => b.stuckUnits - a.stuckUnits);
        
        // Return the worst station (first in sorted list)
        return stationAnalysis[0] || null;
    }, [stations, calculateMetrics]);

    // �� FPY (approx): Completed / (Completed + NG)
    const fpy = useMemo(() => {
        const completed = Number(overallMetrics?.completedUnits || 0);
        const ng = Number(overallMetrics?.ngUnits || 0);
        const processed = completed + ng;
        const pct = processed > 0 ? (completed / processed) * 100 : 0;
        return { completed, ng, processed, pct };
    }, [overallMetrics]);

    // 🚨 Line Health Status Calculation
    const lineHealthStatus = useMemo(() => {
        const fpyValue = fpy.pct;
        const criticalDelays = cycleTimePerStation.filter(station => 
            station.exceedsThreshold && station.exceedsPct > 50
        ).length;
        const multipleCriticalDelays = cycleTimePerStation.filter(station => 
            station.exceedsThreshold && station.exceedsPct > 100
        ).length;

        if (fpyValue > 95 && criticalDelays === 0) {
            return { status: 'STABLE', color: 'success', pulse: true };
        } else if (criticalDelays === 1) {
            return { status: 'AT RISK', color: 'warning', pulse: true };
        } else if (multipleCriticalDelays > 0) {
            return { status: 'BOTTLENECKED', color: 'danger', pulse: true };
        } else {
            return { status: 'MONITORING', color: 'info', pulse: false };
        }
    }, [fpy.pct, cycleTimePerStation]);

    // Enhanced AI output formatting for new 3-section format (matching StationsOverview)
    const formatCriticalStationOutput = (text) => {
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

    // 📊 PDF Export Function
    const generateShiftReport = async () => {
        try {
            // ... (rest of the code remains the same)
            // Dynamic imports to avoid bundling issues
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');
            
            const dashboardElement = document.getElementById('dashboard-content');
            if (!dashboardElement) {
                alert('Dashboard content not found');
                return;
            }

            // Show loading state
            const originalButton = document.getElementById('export-btn');
            if (originalButton) {
                originalButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
                originalButton.disabled = true;
            }

            // Capture the dashboard
            const canvas = await html2canvas(dashboardElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Add timestamp and metadata
            const timestamp = new Date().toLocaleString();
            pdf.setPage(1);
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Generated: ${timestamp}`, 10, pageHeight - 10);
            pdf.text(`Line Health: ${lineHealthStatus.status}`, 10, pageHeight - 5);
            pdf.text(`FPY: ${fpy.pct.toFixed(1)}%`, 70, pageHeight - 5);
            pdf.text(`Worst Station: ${worstStation?.name || 'N/A'}`, 120, pageHeight - 5);

            // Save the PDF
            pdf.save(`shift-report-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            // Restore button
            const originalButton = document.getElementById('export-btn');
            if (originalButton) {
                originalButton.innerHTML = '<i class="bi bi-download me-2"></i>Generate Shift Report';
                originalButton.disabled = false;
            }
        }
    };

    const handleGoToStation = (unit) => {
        if (!unit.station) return;
        setHighlightedUnitId?.(unit.id); 
        handleMonitorStation(unit.station); 
        setSelectedUnit(null);
    };

    // 🔍 Critical Station AI Diagnosis
    const fetchCriticalStationDiagnosis = async () => {
        if (!worstStation) return;
        
        setIsCriticalAnalysisLoading(true);
        setCriticalStationAnalysis('');
        
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

            // Step 2: Fetch trend data - Get last 5 completed units for the worst station
            const historyRes = await fetch(`http://localhost/mkffwebsystem/backend/api/unit_history.php?station=${encodeURIComponent(worstStation.id)}`);
            let trendData = [];
            let velocity = 'STABLE';
            
            if (historyRes.ok) {
                const historyLogs = await historyRes.json();
                
                // Filter for completed units at this station (last 5)
                const completedUnits = historyLogs
                    .filter(log => 
                        log.station_name === worstStation.id && 
                        (log.status_after?.toLowerCase().includes('completed') || 
                         log.action_type === 'STATION_UPDATE' && 
                         log.status_after?.toLowerCase() === 'in progress')
                    )
                    .slice(0, 5)
                    .reverse(); // Oldest to newest for trend calculation

                if (completedUnits.length >= 2) {
                    // Calculate processing speeds (time between consecutive completions)
                    const processingTimes = [];
                    for (let i = 1; i < completedUnits.length; i++) {
                        const prevTime = new Date(completedUnits[i-1].timestamp).getTime();
                        const currTime = new Date(completedUnits[i].timestamp).getTime();
                        const timeDiff = (currTime - prevTime) / (1000 * 60); // minutes
                        processingTimes.push(timeDiff);
                    }
                    
                    // Calculate velocity trend (comparing first half vs second half of processing times)
                    if (processingTimes.length >= 2) {
                        const firstHalf = processingTimes.slice(0, Math.ceil(processingTimes.length / 2));
                        const secondHalf = processingTimes.slice(Math.floor(processingTimes.length / 2));
                        
                        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                        
                        const velocityChange = ((secondAvg - firstAvg) / firstAvg) * 100;
                        
                        if (velocityChange > 15) velocity = 'SLOWING_DOWN';
                        else if (velocityChange < -15) velocity = 'SPEEDING_UP';
                        else velocity = 'STABLE';
                    }
                    
                    trendData = completedUnits.map((log, idx) => ({
                        assembly_no: log.assembly_no,
                        timestamp: log.timestamp,
                        processing_time_minutes: idx > 0 ? processingTimes[idx-1] : null,
                        action_type: log.action_type,
                        status: log.status_after
                    }));
                }
            }

            // Step 3: Prepare comprehensive station data for AI analysis
            const delayedUnits = worstStation.delayedUnits || [];
            const thresholdMinutes = dynamicDelayThresholds[worstStation.id] || 10;
            
            // Enhanced context with checklist error scanning AND trend data
            const delayedContext = delayedUnits.map(log => {
                const lastUpdate = new Date(log.updated_at || log.created_at).getTime();
                const timeSpentMinutes = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
                
                // Checklist error scanning (similar to StationsOverview)
                const checklist_errors = [];
                const checklist_values = {};
                const voltage_tolerance = { min: 113.85, max: 116.15 };
                
                // Station-specific checks based on station ID
                if (worstStation.id.includes('Station1') || worstStation.id.includes('Station 1')) {
                    checklist_values.s1_header_seated_90_deg = log.s1_header_seated_90_deg;
                    checklist_values.s1_leads_properly_soldered = log.s1_leads_properly_soldered;
                    if (log.s1_header_seated_90_deg === 'NO GO' || log.s1_header_seated_90_deg === 'FAIL') checklist_errors.push('S1: Header seating failure');
                    if (log.s1_leads_properly_soldered === 'NO GO' || log.s1_leads_properly_soldered === 'FAIL') checklist_errors.push('S1: Soldering defects');
                    // Check for Empty/null values
                    if (!log.s1_header_seated_90_deg || log.s1_header_seated_90_deg === '' || log.s1_header_seated_90_deg === null) checklist_errors.push('S1: Documentation Gap - Header seating');
                    if (!log.s1_leads_properly_soldered || log.s1_leads_properly_soldered === '' || log.s1_leads_properly_soldered === null) checklist_errors.push('S1: Documentation Gap - Soldering');
                }
                
                if (worstStation.id.includes('Station2') || worstStation.id.includes('Station 2')) {
                    checklist_values.s2_voltage = log.s2_voltage;
                    checklist_values.s2_go_no_go = log.s2_go_no_go;
                    if (log.s2_voltage && (log.s2_voltage < voltage_tolerance.min || log.s2_voltage > voltage_tolerance.max)) checklist_errors.push('S2: Voltage out of tolerance');
                    if (log.s2_go_no_go === 'NO GO' || log.s2_go_no_go === 'FAIL') checklist_errors.push('S2: Final test failure');
                    // Check for Empty/null values
                    if (!log.s2_voltage || log.s2_voltage === '' || log.s2_voltage === null) checklist_errors.push('S2: Documentation Gap - Voltage');
                    if (!log.s2_go_no_go || log.s2_go_no_go === '' || log.s2_go_no_go === null) checklist_errors.push('S2: Documentation Gap - Test result');
                }
                
                // Generic checks for other stations
                if (log.remarks && log.remarks.toLowerCase().includes('error')) checklist_errors.push('Remarks indicate error condition');
                if (!log.remarks || log.remarks === '' || log.remarks === null) checklist_errors.push('Documentation Gap - Remarks');
                
                return {
                    assembly_no: log.assembly_no,
                    time_spent_minutes: Math.round(timeSpentMinutes * 10) / 10,
                    status: log.status,
                    remarks: log.remarks || '',
                    checklist_errors: checklist_errors,
                    checklist_values: checklist_values,
                    trend_velocity: velocity // Add velocity to each delayed unit context
                };
            });

            const prompt = `You are an AI Industrial Engineer specializing in real-time production optimization at MKFF Laserteknique International inc.

CRITICAL BOTTLENECK ANALYSIS: Focus on the primary reason for the bottleneck.

STATION PERFORMANCE:
Station: ${worstStation.name} (${worstStation.id}) | Threshold: ${thresholdMinutes}min
WIP: ${worstStation.totalWIP} units | Bottleneck Units: ${worstStation.stuckUnits} units | Avg Delay: ${worstStation.avgDelay.toFixed(1)}min

BOTTLENECK UNIT DATA:
${JSON.stringify(delayedContext, null, 2)}

CRITICAL INSTRUCTIONS:
- Scan for 'Empty' or 'null' values in bottleneck units
- If found, diagnose as 'Documentation Gap'
- Focus ONLY on the primary bottleneck cause
- Provide ONLY bullet points (Max 2 per section)

REQUIRED OUTPUT FORMAT (STRICT):
[DIAGNOSIS]: Primary bottleneck reason (Max 2 bullets)
Example: • High NG count due to Voltage breaches

[FORECAST]: Production line status prediction (Max 1 bullet)
Example: • Risk of 30% slowdown in 2 hours

[PRESCRIPTION]: Actionable steps (Max 2 bullets)
Example: • Recalibrate Station 2 test rig

EXECUTIVE SUMMARY: Exactly one sentence (Max 10 words)

CRITICAL: Use only bullet points. No paragraphs. No long explanations.`;

            // Step 3: Generate AI analysis
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
            setCriticalStationAnalysis(text);

        } catch (err) {
            console.error("Critical Station AI Error:", err);
            setCriticalStationAnalysis("Diagnosis failed: " + err.message);
        } finally {
            setIsCriticalAnalysisLoading(false);
        }
    };

    return (
        <div className="container-fluid px-0 py-2">
            <style>{`
                /* Stat Cards shrunk from 24px to 18px padding and font size reduced */
                .stat-card-pro { background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 18px; height: 100%; position: relative; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
                .icon-bg-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 1.1rem; }
                .label-caps { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
                .value-bold { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin: 0; line-height: 1; letter-spacing: -1px; }
                .badge-pct { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 5px; display: inline-block; margin-top: 8px; }
                
                .search-input-pro { padding-left: 38px !important; background-color: #f8fafc; border: 1px solid #e2e8f0; height: 40px; }
                .qr-input-pro { padding-left: 38px !important; background-color: #f5f3ff; border: 1px solid #ddd6fe; height: 40px; color: #5b21b6; }
                .modal-blur { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); }

                .stepper-nav-container { position: relative; display: flex; align-items: center; }
                .stepper-nav-btn { position: absolute; top: 30%; transform: translateY(-50%); z-index: 20; width: 32px; height: 32px; background: #fff; border: 1px solid #e2e8f0; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
                .stepper-nav-btn:hover { background: #f8fafc; color: #0f172a; }
                .btn-left { left: -10px; }
                .btn-right { right: -10px; }
                .stepper-wrapper { display: flex; justify-content: space-between; position: relative; margin-bottom: 40px; padding: 20px 10px; overflow-x: auto; padding-bottom: 30px; scrollbar-width: none; }
                .stepper-wrapper::-webkit-scrollbar { display: none; }
                .stepper-item { position: relative; display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 150px; z-index: 10; }
                .stepper-item::before { content: ""; position: absolute; top: 22px; left: -50%; width: 100%; height: 4px; background: #e2e8f0; z-index: -1; }
                .stepper-item:first-child::before { content: none; }
                .step-counter { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #fff; border: 4px solid #e2e8f0; border-radius: 50%; font-weight: 800; font-size: 0.9rem; color: #94a3b8; transition: all 0.3s ease; margin-bottom: 12px; }
                .step-name { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; text-align: center; max-width: 120px; line-height: 1.2; }
                .step-desc { font-size: 0.6rem; font-weight: 500; color: #94a3b8; text-align: center; margin-top: 4px; max-width: 130px; }
                .stepper-item.completed .step-counter { background: #10b981; border-color: #10b981; color: white; }
                .stepper-item.completed::before { background: #10b981; }
                .stepper-item.completed .step-name { color: #10b981; }
                .stepper-item.active .step-counter { border-color: #f59e0b; color: #f59e0b; box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.15); }
                .stepper-item.active .step-name { color: #0f172a; }
                .stepper-item.active .step-desc { color: #64748b; font-weight: 700; }
                .stepper-item.danger .step-counter { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
                .stepper-item.danger .step-name { color: #ef4444; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

                .analytics-card { background: #ffffff; border: 0.5px solid #e0e0e0ff; border-radius: 18px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); overflow: hidden; }
                .analytics-card-header { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
                .analytics-card-body { padding: 14px 16px; }
                .kpi-pill { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; padding: 6px 10px; border-radius: 999px; border: 1px solid #f3f3f3ff; background: #fff; }

                /* AI Analyze Button Pulse Animation */
                .ai-analyze-btn {
                    animation: ai-pulse 2s infinite;
                    transition: all 0.3s ease;
                }
                .ai-analyze-btn:hover {
                    animation-play-state: paused;
                    transform: scale(1.05);
                }
                @keyframes ai-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }

                /* Predictive Insight Card (Blue Border) */
                .predictive-insight-card { 
                    background: #ffffff; 
                    border: 2px solid #3b82f6; 
                    border-radius: 18px; 
                    box-shadow: 0 6px 18px rgba(59, 130, 246, 0.15); 
                    overflow: hidden; 
                }
                .predictive-insight-header { 
                    padding: 14px 16px; 
                    border-bottom: 1px solid #dbeafe; 
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); 
                    color: #1e40af;
                }
                .predictive-insight-body { 
                    padding: 14px 16px; 
                    background: #fafbff;
                }

                /* Smart Recommendation Card (Green Border) */
                .smart-recommendation-card { 
                    background: #ffffff; 
                    border: 2px solid #10b981; 
                    border-radius: 18px; 
                    box-shadow: 0 6px 18px rgba(16, 185, 129, 0.15); 
                    overflow: hidden; 
                }
                .smart-recommendation-header { 
                    padding: 14px 16px; 
                    border-bottom: 1px solid #d1fae5; 
                    background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); 
                    color: #047857;
                }
                .smart-recommendation-body { 
                    padding: 14px 16px; 
                    background: #fafffe;
                }

                /* Compact AI Display Cards */
                .compact-ai-card {
                    max-height: 120px;
                    overflow-y: auto;
                    font-size: 0.75rem;
                    line-height: 1.3;
                }
                .compact-ai-card::-webkit-scrollbar {
                    width: 3px;
                }
                .compact-ai-card::-webkit-scrollbar-track {
                    background: transparent;
                }
                .compact-ai-card::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                
                /* Keyword Highlighting */
                .highlight-voltage { color: #dc2626; font-weight: 700; }
                .highlight-empty { color: #dc2626; font-weight: 700; }
                .highlight-critical { color: #dc2626; font-weight: 700; }
                .highlight-bottleneck { color: #dc2626; font-weight: 700; }
                
                /* Empty text styling */
                .empty-text { color: #dc2626; font-weight: 600; }
                
                /* Line Health Pulse Animation */
                .pulse-animation {
                    animation: pulse-glow 2s infinite;
                }
                .status-dot-pulse {
                    animation: dot-pulse 1.5s infinite;
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
                    50% { box-shadow: 0 0 30px rgba(255,255,255,0.6); }
                    100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
                }
                @keyframes dot-pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }

                /* Intelligence Hub Container (matching StationsOverview) */
                .intelligence-hub-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .diagnosis-hub-card, .forecast-hub-card, .prescription-hub-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }
                .diagnosis-hub-card {
                    border-left: 4px solid #ef4444;
                }
                .forecast-hub-card {
                    border-left: 4px solid #3b82f6;
                }
                .prescription-hub-card {
                    border-left: 4px solid #10b981;
                }
                .hub-header {
                    padding: 10px 14px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .hub-title {
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .diagnosis-hub-card .hub-title {
                    color: #ef4444;
                }
                .forecast-hub-card .hub-title {
                    color: #3b82f6;
                }
                .prescription-hub-card .hub-title {
                    color: #10b981;
                }
                .hub-content {
                    padding: 12px 14px;
                    font-size: 0.8rem;
                    line-height: 1.5;
                    color: #374151;
                }
                .fallback-hub-analysis {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 14px;
                }
                .ai-analysis-output {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .ai-analysis-output::-webkit-scrollbar {
                    width: 4px;
                }
                .ai-analysis-output::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ai-analysis-output::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-0 tracking-tight">Production Intel</h3>
                    <p className="text-muted small mb-0">Live Manufacturing Lifecycle Monitoring</p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                    {/* Compact Status Badge */}
                    <div className={`d-flex align-items-center px-3 py-2 rounded-pill shadow-sm ${
                        lineHealthStatus.pulse ? 'pulse-animation' : ''
                    }`} style={{
                        background: `linear-gradient(135deg, ${
                            lineHealthStatus.color === 'success' ? '#10b981' :
                            lineHealthStatus.color === 'warning' ? '#f59e0b' :
                            lineHealthStatus.color === 'danger' ? '#ef4444' : '#3b82f6'
                        } 0%, ${
                            lineHealthStatus.color === 'success' ? '#059669' :
                            lineHealthStatus.color === 'warning' ? '#d97706' :
                            lineHealthStatus.color === 'danger' ? '#dc2626' : '#2563eb'
                        } 100%)`,
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px',
                        minWidth: '140px',
                        height: '36px'
                    }}>
                        <div className={`me-2 ${lineHealthStatus.pulse ? 'status-dot-pulse' : ''}`} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            boxShadow: '0 0 6px rgba(255,255,255,0.8)'
                        }}></div>
                        <span>{lineHealthStatus.status}</span>
                        <button 
                            id="export-btn"
                            onClick={generateShiftReport}
                            className="btn btn-sm btn-light ms-2 rounded-pill px-2 py-1"
                            style={{ fontSize: '0.7rem', height: '28px' }}
                        >
                            <i className="bi bi-download me-1"></i>Generate
                        </button>
                    </div>
                    {newReportsToday > 0 && (
                        <div className="d-flex align-items-center bg-danger text-white px-3 py-1 rounded-pill shadow-sm" style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', height: '36px' }} onClick={() => setActiveTab('reports')}>
                            <i className="bi bi-file-earmark-text-fill me-2"></i> {newReportsToday} NEW REPORT TODAY
                        </div>
                    )}
                    <div className="position-relative" style={{width: '180px'}}>
                        <i className="bi bi-qr-code-scan position-absolute start-0 ms-3 top-50 translate-middle-y text-primary"></i>
                        <input type="text" className="form-control rounded-pill qr-input-pro" placeholder="Scan QR..." value={qrValue} onChange={(e) => handleQrInput(e.target.value)} />
                    </div>
                    <div className="position-relative" style={{width: '280px'}}>
                        <i className="bi bi-search position-absolute start-0 ms-3 top-50 translate-middle-y text-muted"></i>
                        <input type="text" className="form-control rounded-pill search-input-pro" placeholder="Manual Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        {searchResults.length > 0 && (
                            <div className="position-absolute w-100 mt-2 bg-white border rounded-4 shadow-lg overflow-hidden" style={{ zIndex: 1100 }}>
                                {searchResults.map(unit => (
                                    <div key={unit.id} className="p-3 border-bottom" style={{cursor:'pointer'}} onClick={() => { setSelectedUnit(unit); setSearchTerm(''); }}>
                                        <div className="fw-bold text-dark d-flex justify-content-between"><span>{unit.assembly_no}</span><i className="bi bi-chevron-right small text-muted"></i></div>
                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{unit.model} • <span className={`fw-bold ${unit.status?.toLowerCase().includes('no good') ? 'text-danger' : 'text-primary'}`}>{unit.status}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div id="dashboard-content">
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f8fafc', color: '#334155' }}><i className="bi bi-cpu"></i></div>
                        <span className="label-caps">Total Scanned Units</span>
                        <h3 className="value-bold">{stats.coreProductionUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>{stats.pct.scanned} Total</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}><i className="bi bi-qr-code-scan"></i></div>
                        <span className="label-caps" style={{color: '#0ea5e9'}}>For Scanning Queue</span>
                        <h3 className="value-bold">{forScanningUnitsCount}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>{stats.pct.forScanning} Pending</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><i className="bi bi-clock-history"></i></div>
                        <span className="label-caps" style={{color: '#d97706'}}>In Progress (WIP)</span>
                        <h3 className="value-bold">{overallMetrics.pendingUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>{stats.pct.wip} Capacity</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><i className="bi bi-check-circle"></i></div>
                        <span className="label-caps" style={{color: '#16a34a'}}>Completed (Yield)</span>
                        <h3 className="value-bold">{overallMetrics.completedUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>{stats.pct.completed} Rate</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><i className="bi bi-exclamation-octagon"></i></div>
                        <span className="label-caps" style={{color: '#dc2626'}}>Total Defects (NG)</span>
                        <h3 className="value-bold text-danger">{overallMetrics.ngUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>{stats.pct.ng} Failure</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card-pro">
                        <div className="icon-bg-box" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}><i className="bi bi-shield-check"></i></div>
                        <span className="label-caps" style={{ color: '#8b5cf6' }}>Pending Approval</span>
                        <h3 className="value-bold" style={{ color: '#8b5cf6' }}>{overallMetrics.pendingApprovalUnits}</h3>
                        <div className="badge-pct" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>{stats.pct.approval} Validation</div>
                    </div>
                </div>
            </div>

            {/* 📊 Advanced Analytics (Top 3 KPIs) */}
            <div className="row g-4 mb-5 mx-1">
                {/* 🥇 Throughput Trend */}
                <div className="col-lg-6">
                    <div className="analytics-card h-100">
                        <div className="analytics-card-header d-flex justify-content-between align-items-center">
                            <div>
                                <div className="label-caps mb-0">TOP 1 — Throughput Trend</div>
                                <div className="small text-muted">Completed units per hour (last 12 hours)</div>
                            </div>
                            <span className={`kpi-pill ${throughputTrend.deltaPct < 0 ? 'text-danger' : 'text-success'}`}>
                                {throughputTrend.deltaPct < 0 ? 'DOWN' : 'UP'} {Math.abs(throughputTrend.deltaPct).toFixed(0)}%
                            </span>
                        </div>
                        <div className="analytics-card-body" style={{ height: 280 }}>
                            <Line
                                data={{
                                    labels: throughputTrend.labels,
                                    datasets: [
                                        {
                                            label: 'Completed / hour',
                                            data: throughputTrend.data,
                                            borderColor: '#0ea5e9',
                                            backgroundColor: 'rgba(14, 165, 233, 0.15)',
                                            tension: 0.35,
                                            fill: true,
                                            pointRadius: 3,
                                            pointBackgroundColor: '#0ea5e9',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 0 } },
                                        y: { beginAtZero: true, ticks: { color: '#94a3b8', precision: 0 }, grid: { color: '#f1f5f9' } },
                                    },
                                }}
                            />
                        </div>
                        <div className="px-3 pb-3 small text-muted">
                            Total (12h): <strong>{throughputTrend.currentTotal}</strong> • Prev (12h): <strong>{throughputTrend.prevTotal}</strong>
                        </div>
                    </div>
                </div>

                {/* 🥈 Critical Station Analysis */}
                <div className="col-lg-6">
                    <div className="analytics-card h-100">
                        <div className="analytics-card-header">
                            <div className="label-caps mb-0">Worst Station</div>
                            <div className="small text-muted">Real-time bottleneck analysis with critical metrics</div>
                        </div>
                        <div className="analytics-card-body" style={{ height: 280 }}>
                            <Bar
                                data={{
                                    labels: cycleTimePerStation.map(r => r.name),
                                    datasets: [
                                        {
                                            label: 'Avg Cycle Time (WIP)',
                                            data: cycleTimePerStation.map(r => Number(r.avgMinutes.toFixed(1))),
                                            backgroundColor: cycleTimePerStation.map(r => 
                                                r.exceedsThreshold ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.85)'
                                            ),
                                            borderRadius: 10,
                                            barThickness: 10,
                                        },
                                        {
                                            label: 'Takt Time',
                                            data: cycleTimePerStation.map(r => r.thresholdMinutes),
                                            backgroundColor: 'rgba(148, 163, 184, 0.45)',
                                            borderRadius: 10,
                                            barThickness: 10,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    plugins: { 
                                        legend: { position: 'bottom', labels: { color: '#64748b' } },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    const station = cycleTimePerStation[context.dataIndex];
                                                    if (context.datasetIndex === 0) {
                                                        return [
                                                            `Avg Cycle Time: ${context.parsed.x} mins`,
                                                            `Takt Time: ${station.thresholdMinutes} mins`,
                                                            `Bottleneck Units: ${station.delayedUnits}/${station.totalUnits}`,
                                                            station.exceedsThreshold ? `⚠️ EXCEEDS TAKT BY ${Math.abs(station.exceedsPct).toFixed(0)}%` : '✅ Within Takt Time'
                                                        ];
                                                    }
                                                    return `Takt Time: ${context.parsed.x} mins`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' } },
                                        y: { ticks: { color: '#475569', font: { size: 11, weight: '600' } }, grid: { display: false } },
                                    },
                                }}
                            />
                        </div>
                        
                        {/* Worst Station Indicator Box */}
                        {worstStation && worstStation.stuckUnits > 0 && (
                            <div className="px-3 pb-3">
                                <div className="analytics-card p-3 border">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <div className="fw-bold text-dark fs-6">
                                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                Worst Station: {worstStation.name}
                                            </div>
                                            <div className="small text-muted">{worstStation.id}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced indicators with 4H Forecast */}
                                    <div className="row g-2 text-center">
                                        <div className="col-2">
                                            <div className="fw-bold text-dark">{worstStation.totalWIP}</div>
                                            <div className="small text-muted" style={{fontSize: '0.65rem'}}>WIP</div>
                                        </div>
                                        <div className="col-2">
                                            <div className="fw-bold text-danger">{worstStation.stuckUnits}</div>
                                            <div className="small text-muted" style={{fontSize: '0.65rem'}}>Units</div>
                                        </div>
                                        <div className="col-2">
                                            <div className="fw-bold text-warning">{worstStation.avgDelay.toFixed(1)}m</div>
                                            <div className="small text-muted" style={{fontSize: '0.65rem'}}>Avg Delay</div>
                                        </div>
                                        <div className="col-3">
                                            <div className="fw-bold" style={{fontSize: '0.7rem'}}>
                                                {worstStation.avgDelay > (dynamicDelayThresholds[worstStation.id] || 10) * 2 ? (
                                                    <span className="badge bg-danger text-white px-2 py-1">📈 CRITICAL</span>
                                                ) : (
                                                    <span className="badge bg-secondary text-white px-2 py-1">⏳ STABLE</span>
                                                )}
                                            </div>
                                            <div className="small text-muted" style={{fontSize: '0.65rem'}}>4H Forecast</div>
                                        </div>
                                        <div className="col-3">
                                            <div className="fw-bold text-primary ai-analyze-btn" style={{fontSize: '0.7rem', cursor: 'pointer'}} onClick={fetchCriticalStationDiagnosis}>
                                                {isCriticalAnalysisLoading ? (
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                ) : null}
                                                ANALYZE
                                            </div>
                                        </div>
                                    </div> 
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced AI Result Display with 3-section format (matching StationsOverview) */}
                        {criticalStationAnalysis && (
                            <div className="px-3 pb-3">
                                <div className="analytics-card p-3" style={{ 
                                    border: 'none',
                                    background: '#ffffff'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="fw-semibold text-dark fs-6">
                                            <i className="bi bi-cpu me-2"></i>AI Critical Station Analysis
                                        </div>
                                        <button 
                                            className="btn btn-sm text-dark"
                                            onClick={() => setCriticalStationAnalysis('')}
                                            style={{ border: '1px solid #64748b', background: 'none', padding: '4px' }}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                    <div className="ai-analysis-output">
                                        <div 
                                            className="text-dark" 
                                            dangerouslySetInnerHTML={{ __html: formatCriticalStationOutput(criticalStationAnalysis) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="px-3 pb-3 small text-muted">
                            {cycleTimePerStation.filter(r => r.exceedsThreshold).length} stations exceeding takt time • 
                            Worst: <strong>{worstStation?.name || 'None'}</strong>
                            {worstStation && worstStation.stuckUnits > 0 ? (
                                <> • Bottleneck Units: <strong>{worstStation.stuckUnits}</strong></>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* 🥉 FPY */}
                <div className="col-lg-12">
                    <div className="analytics-card">
                        <div className="analytics-card-header d-flex justify-content-between align-items-center">
                            <div>
                                <div className="label-caps mb-0">TOP 3 — First Pass Yield (FPY)</div>
                                <div className="small text-muted">Completed ÷ (Completed + NG)</div>
                            </div>
                            <span className="kpi-pill text-primary">FPY {fpy.pct.toFixed(1)}%</span>
                        </div>
                        <div className="analytics-card-body d-flex flex-wrap gap-3 align-items-center justify-content-between">
                            <div style={{ width: 260, height: 220, position: 'relative' }}>
                                <Doughnut
                                    data={{
                                        labels: ['Pass', 'Fail'],
                                        datasets: [
                                            {
                                                data: [Number(fpy.pct.toFixed(1)), Number((100 - fpy.pct).toFixed(1))],
                                                backgroundColor: ['#10b981', '#ef4444'],
                                                borderColor: ['#fff', '#fff'],
                                                borderWidth: 4,
                                                cutout: '72%',
                                                borderRadius: 10,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'bottom', labels: { color: '#64748b' } } },
                                    }}
                                />
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <div className="label-caps">FPY</div>
                                    <div className="fw-black" style={{ fontSize: '2rem', color: '#0f172a' }}>{fpy.pct.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex flex-wrap gap-3">
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">Processed</div>
                                        <div className="fw-black" style={{ fontSize: '1.6rem' }}>{fpy.processed}</div>
                                        <div className="small text-muted">Completed + NG</div>
                                    </div>
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">Completed</div>
                                        <div className="fw-black text-success" style={{ fontSize: '1.6rem' }}>{fpy.completed}</div>
                                        <div className="small text-muted">First-pass success</div>
                                    </div>
                                    <div className="stat-card-pro" style={{ padding: 14, minWidth: 220 }}>
                                        <div className="label-caps">NG</div>
                                        <div className="fw-black text-danger" style={{ fontSize: '1.6rem' }}>{fpy.ng}</div>
                                        <div className="small text-muted">First-pass fail</div>
                                    </div>
                                </div>
                                <div className="small text-muted mt-2">
                                    Tip: FPY drops usually indicate checklist gaps, test failures, or rework loops in specific stations.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedUnit && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center modal-blur" style={{ zIndex: 1300 }}>
                    <div className="bg-white rounded-4 shadow-2xl overflow-hidden border-0" style={{ width: '90%', maxWidth: '950px' }}>
                        <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
                            <div><h6 className="mb-0 fw-bold">Unit Process Tracker</h6><p className="mb-0" style={{fontSize: '0.7rem', opacity: 0.8}}>{selectedUnit.assembly_no} • {selectedUnit.model}</p></div>
                            <button className="btn-close btn-close-white" onClick={() => setSelectedUnit(null)}></button>
                        </div>
                        <div className="p-4 custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 mb-4 border-0 shadow-sm">
                                <div><div className="label-caps mb-0" style={{fontSize: '0.6rem'}}>Current Status</div><span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(selectedUnit.status)}`}>{selectedUnit.status}</span></div>
                                <div className="text-end"><div className="label-caps mb-0" style={{fontSize: '0.6rem'}}>Last Station</div><div className="fw-bold text-primary small">{selectedUnit.station || 'Pending'}</div></div>
                            </div>
                            <div className="stepper-nav-container">
                                <button className="stepper-nav-btn btn-left" onClick={() => scrollStepper('left')}><i className="bi bi-chevron-left"></i></button>
                                <div className="stepper-wrapper" ref={stepperRef}>
                                    {processStations.map((station, idx) => {
                                        const currentStationIdx = parseInt(selectedUnit.station?.replace('Station', '')) - 1;
                                        const unitStatus = selectedUnit.status?.toLowerCase() || '';
                                        const isNG = unitStatus.includes('no good') || unitStatus.includes('ng');
                                        const isDone = idx < currentStationIdx || (idx === currentStationIdx && (unitStatus.includes('completed') || unitStatus.includes('finished')));
                                        const isCurrent = idx === currentStationIdx;
                                        let stepStateClass = "";
                                        if (isDone) stepStateClass = "completed";
                                        else if (isCurrent) stepStateClass = isNG ? "danger" : "active";
                                        return (
                                            <div key={idx} className={`stepper-item ${stepStateClass}`}>
                                                <div className="step-counter">{isDone ? <i className="bi bi-check-lg"></i> : (idx + 1)}</div>
                                                <div className="step-name">{station}</div>
                                                <div className="step-desc">{stationDescriptions[station]}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="stepper-nav-btn btn-right" onClick={() => scrollStepper('right')}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                        <div className="p-3 bg-light border-top d-flex gap-2">
                            <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" style={{fontSize: '0.8rem'}} onClick={() => handleGoToStation(selectedUnit)}>LOCATE UNIT</button>
                            <button className="btn btn-outline-dark w-100 rounded-pill fw-bold py-2" style={{fontSize: '0.8rem'}} onClick={() => setSelectedUnit(null)}>DISMISS</button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}