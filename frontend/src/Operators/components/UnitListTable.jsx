import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { EditUnitModal } from '../modals/EditUnitModal';

// Process stations for progress display
const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

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
    
    return false;
};

// Helper function to check unit delay
const checkUnitDelay = (stationId, updatedAt, thresholds = {}) => {
    // Try both formats: 'Station1' and 'Station 1'
    const threshold = thresholds[`Station${stationId}`] || thresholds[`Station ${stationId}`] || 10;
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

// Helper function to render station checklists (copied from StationsOverview)
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
        case 12:
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

export const UnitListTable = ({ units, listStatus, loading, error, onEdit, dynamicTargetTimes = {} }) => {
    const [detailsUnit, setDetailsUnit] = useState(null);
    const [stationDropdowns, setStationDropdowns] = useState({});
    const [progressDropdowns, setProgressDropdowns] = useState({});
    const [dynamicDelayThresholds, setDynamicDelayThresholds] = useState({});
    
    // Board editing states
    const [editingBoard, setEditingBoard] = useState(null);
    const [tempBoardValue, setTempBoardValue] = useState('');
    const [editRemarks, setEditRemarks] = useState('');
    const [showBoardEditModal, setShowBoardEditModal] = useState(false);
    const [isSavingBoard, setIsSavingBoard] = useState(false);
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
    const [remarksError, setRemarksError] = useState(false);
    
    // Pending board requests state
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    
    // Fetch pending board requests for this unit
    const fetchPendingRequests = async (unitId) => {
        setLoadingPending(true);
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get_pending_requests',
                    unitId: unitId
                })
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                setPendingRequests(result.requests || []);
            } else {
                console.error('Failed to fetch pending requests:', result.message);
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoadingPending(false);
        }
    };
    
    // Fetch pending requests when details unit changes
    useEffect(() => {
        if (detailsUnit) {
            fetchPendingRequests(detailsUnit.id);
        }
    }, [detailsUnit]);
    
    // Listen for pending requests changes from other components (like InventoryView)
    useEffect(() => {
        const handlePendingRequestsChanged = (event) => {
            // Refresh pending requests when they change in other components
            if (detailsUnit) {
                fetchPendingRequests(detailsUnit.id);
            }
        };
        
        window.addEventListener('pendingRequestsChanged', handlePendingRequestsChanged);
        
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('pendingRequestsChanged', handlePendingRequestsChanged);
        };
    }, [detailsUnit]);
    
    // Get current user based on station (fetch from database)
    const getCurrentUser = async () => {
        // First try to get from localStorage/sessionStorage (cached)
        const cachedUser = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (cachedUser && cachedUser !== 'Operator') {
            return cachedUser;
        }
        
        // If no cached user, try to get from database based on current station
        if (detailsUnit && detailsUnit.station) {
            try {
                const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'get_station_user',
                        station: detailsUnit.station
                    })
                });
                
                const result = await response.json();
                if (result.status === 'success' && result.username) {
                    // Cache the username for future use
                    localStorage.setItem('username', result.username);
                    return result.username;
                }
            } catch (error) {
                console.error('Error fetching station user:', error);
            }
        }
        
        // Fallback to station-based username
        if (detailsUnit && detailsUnit.station) {
            return `Station ${detailsUnit.station}`;
        }
        
        return 'Operator';
    };
    
    // PCB Board mapping for editing
    const pcbaMapping = [
        { model: 'EE-405-MNBD-PCBA-A3', partsCode: '001-00-000034', prefix: 'MK001034-2450-', dbKey: 'mnbd_board_no', displayName: 'MNBD' },
        { model: 'EE-405-CMBD-PCBA-A3', partsCode: '001-00-000031', prefix: 'MK001031-2448-', dbKey: 'cmbd_board_no', displayName: 'CMBD' },
        { model: 'EE-405-LRBD-PCBA-A3', partsCode: '001-00-000030', prefix: 'MK001030-2440-', dbKey: 'lrbd_board_no', displayName: 'LRBD' },
        { model: 'EE-405-PQBD-PCBA-A3', partsCode: '001-00-000033', prefix: 'MK001033-2445-', dbKey: 'pqbd_board_no', displayName: 'PQBD' },
        { model: 'EE-405-BKBD-PCBA-A4', partsCode: '001-00-000041', prefix: 'MK001034-2502-', dbKey: 'bkbd_board_no', displayName: 'BKBD' }
    ];
    
    // Function to generate unique board number
    const generateUniqueBoardNumber = async () => {
        if (!editingBoard) return;
        
        setIsGeneratingNumber(true);
        
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_board_number',
                    boardType: editingBoard.displayName
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                setTempBoardValue(result.generatedNumber);
            } else {
                alert('❌ Error: ' + (result.message || 'Failed to generate board number'));
            }
        } catch (error) {
            console.error('Error generating board number:', error);
            alert('❌ Connection Error: Failed to generate board number. Please check your connection.');
        } finally {
            setIsGeneratingNumber(false);
        }
    };
    
    // Function to handle board edit modal open
    const openBoardEditModal = (board) => {
        setEditingBoard(board);
        setTempBoardValue(detailsUnit[board.dbKey] || '');
        setEditRemarks('');
        setRemarksError(false);
        setShowBoardEditModal(true);
    };
    
    // Determine if the table should display the 'ACTIONS' column based on status.
    const canEdit = ['in progress', 'completed', 'no good'].some(s => listStatus.toLowerCase().includes(s.replace(' (ng)', '')));
    
    // Header for the content section
    const displayTitle = listStatus.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (loading || error || units.length === 0) {
        if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border" role="status"></div><p className="mt-2">Loading...</p></div>;
        if (error) return <div className="alert alert-danger">{error}</div>;
        return <div className="text-center py-5 bg-light p-4 rounded border border-dashed text-muted"><p>No Units Found for "{displayTitle}"</p></div>;
    }

    return (
        <>
            <div className="animate-in fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-list-columns-reverse me-2 text-primary"></i>
                        {displayTitle} Units
                    </h4>
                    <div className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal" style={{fontSize: '0.7rem', padding: '6px 14px'}}>
                        <i className="bi bi-hash me-1"></i>
                        {units.length} Units
                    </div>
                </div>
                
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>MODEL</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>REVISION</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>BASE UNIT</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>ASSEMBLY</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>DEVICE SERIAL</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>ACCESSORY</th>
                                    <th className="px-3 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>STATUS</th>
                                    <th className="px-3 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>DELAY</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>REMARKS</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>LAST UPDATE</th>
                                    <th className="px-4 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((unit) => {
                                    const lastTs = unit.updated_at || unit.created_at;
                                    const minutesInStation = lastTs
                                        ? Math.max(0, (new Date().getTime() - new Date(lastTs).getTime()) / (1000 * 60))
                                        : 0;

                                    const stationId = unit.station?.replace(/\D/g, '');
                                    const thresholdMinutes = dynamicTargetTimes[`Station${stationId}`] || dynamicTargetTimes[`Station ${stationId}`] || 10;
                                    const statusText = (unit.status || '').toLowerCase();
                                    const isInProgressOrNG = unit.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
                                    const delay = isInProgressOrNG
                                        ? checkUnitDelay(stationId, lastTs, dynamicTargetTimes)
                                        : { isDelayed: false, minutes: minutesInStation, level: 'NORMAL' };

                                    const delayMinutes = delay.minutes; // Use actual minutes from checkUnitDelay
                                    return (
                                        <tr 
                                            key={unit.id} 
                                            className={`border-bottom ${delay.isDelayed ? 'bg-danger bg-opacity-5' : 'hover-bg-primary hover-bg-opacity-5'} transition-all`}
                                        >
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{unit.model}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                    {unit.revision || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-muted small fst-italic">{unit.baseUnitKittingNo || '---'}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="d-flex align-items-center">
                                                    <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                        {unit.assemblyNo}
                                                    </code>
                                                    {delay.isDelayed && (
                                                        <i className="bi bi-exclamation-triangle-fill text-danger ms-2" title={`Delayed: ${delay.level}`}></i>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-muted small">{unit.deviceSerialNo || '---'}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-muted small">{unit.accessoryKittingNo || '---'}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`badge rounded-pill fw-normal ${
                                                    unit.status.includes('Progress') ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' : 
                                                    unit.status.includes('Completed') ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 
                                                    'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                                                }`} style={{ fontSize: '0.7rem', padding: '6px 14px' }}>
                                                    {unit.status}
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
                                                <div className="text-muted small fst-italic" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={unit.remarks || 'No remarks'}>
                                                    {unit.remarks || '---'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-muted small">
                                                    <i className="bi bi-clock me-1"></i>
                                                    {new Date(unit.updated_at || unit.created_at).toLocaleString('en-US', { 
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
                                                        onClick={() => setDetailsUnit(unit)}
                                                        title="Details"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    {canEdit && (
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary rounded p-2 transition-all" 
                                                            onClick={() => onEdit(unit)}
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Comprehensive Details Modal */}
            {detailsUnit && ReactDOM.createPortal(
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header bg-primary text-white flex-shrink-0 d-flex justify-content-between align-items-center p-3">
                                <div className="d-flex flex-column">
                                    <h5 className="mb-0 fw-bold">Unit Details | Assembly: {detailsUnit.assembly_no}</h5>
                                    <small className="opacity-75">Model: {detailsUnit.model} | Station: {detailsUnit.station}</small>
                                </div>
                                <button className="btn-close btn-close-white shadow-none" onClick={() => setDetailsUnit(null)}></button>
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
                                            const currentStationNumber = parseInt(detailsUnit.station?.replace(/\D/g, '') || 0);
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
                                                    {pcbaMapping.map((board) => (
                                                        <div key={board.dbKey} className="col-md-6 col-lg-4">
                                                            <small className="text-muted">{board.displayName} Board:</small>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="fw-bold">{detailsUnit[board.dbKey] || '---'}</div>
                                                                <button 
                                                                    className="btn btn-sm btn-outline-primary py-0 px-1"
                                                                    onClick={() => openBoardEditModal(board)}
                                                                    title={`Edit ${board.displayName} Board Number`}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Board Edit Requests Section */}
                            {pendingRequests.length > 0 && (
                                <div className="flex-shrink-0 p-4 pt-0">
                                    <div className="card border-warning">
                                        <div className="card-header bg-warning text-dark">
                                            <h6 className="mb-0 fw-bold">
                                                <i className="bi bi-clock-history me-2"></i>
                                                Pending Board Edit Requests ({pendingRequests.length})
                                            </h6>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="table-responsive">
                                                <table className="table table-hover mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                                                    <thead>
                                                        <tr>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>Board Type</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>Old Value</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>New Value</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>Requested By</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>Remarks</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>Requested At</th>
                                                            <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingRequests.map((request) => {
                                                            const boardInfo = pcbaMapping.find(m => m.dbKey === request.column_name);
                                                            const boardPrefix = boardInfo ? boardInfo.prefix : '';
                                                            
                                                            return (
                                                                <tr key={request.id}>
                                                                    <td>
                                                                        <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25 fw-normal" style={{fontSize: '0.7rem', padding: '6px 14px'}}>{request.board_type}</span>
                                                                    </td>
                                                                    <td>
                                                                        <code className="text-muted">
                                                                            {request.old_value ? `${boardPrefix}${request.old_value}` : 'Empty'}
                                                                        </code>
                                                                    </td>
                                                                    <td>
                                                                        <code className="text-success fw-bold">
                                                                            {boardPrefix}{request.new_value}
                                                                        </code>
                                                                    </td>
                                                                    <td>{request.requested_by}</td>
                                                                    <td>
                                                                        <small className="text-muted">{request.remarks || 'No remarks'}</small>
                                                                    </td>
                                                                    <td>
                                                                        <small className="text-muted">
                                                                            {new Date(request.requested_at).toLocaleString()}
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-normal" style={{fontSize: '0.7rem', padding: '6px 14px'}}>
                                                                            <i className="bi bi-hourglass-split me-1"></i>
                                                                            Pending Approval
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                    <div className="card border">
                                                        <div 
                                                            className="card-header bg-light d-flex justify-content-between align-items-center cursor-pointer"
                                                            onClick={() => setStationDropdowns(prev => ({
                                                                [stationNumber]: !prev[stationNumber]
                                                            }))}
                                                        >
                                                            <h6 className="mb-0 fw-bold">
                                                                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal me-2" style={{fontSize: '0.7rem', padding: '6px 14px'}}>{stationNumber}</span>
                                                                {stationName}
                                                            </h6>
                                                            <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                                        </div>
                                                        
                                                        {isExpanded && (
                                                            <div className="card-body p-3">
                                                                {renderStationChecklist(stationNumber, detailsUnit)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            
            {/* Board Edit Modal */}
            {showBoardEditModal && ReactDOM.createPortal(
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '90%', maxWidth: '500px' }}>
                        <div className="modal-header bg-warning text-white">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-pencil-square me-2"></i>
                                Edit Board Number - Pending Approval
                            </h5>
                            <button className="btn-close btn-close-white" onClick={() => setShowBoardEditModal(false)}></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Note:</strong> Your edit request will be sent for admin approval. The board number change will be applied once approved.
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Assembly No:</label>
                                <div className="form-control bg-light">{detailsUnit?.assembly_no || 'N/A'}</div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Board Type:</label>
                                <div className="form-control bg-light">
                                    {editingBoard?.displayName} ({editingBoard?.model})
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Current Value:</label>
                                <div className="form-control bg-light">{detailsUnit[editingBoard?.dbKey] || '---'}</div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold">New Board Number:</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={tempBoardValue}
                                        readOnly
                                        placeholder="Click Generate to create a unique board number"
                                    />
                                    <button 
                                        className="btn btn-outline-primary"
                                        type="button"
                                        onClick={generateUniqueBoardNumber}
                                        disabled={isGeneratingNumber}
                                    >
                                        {isGeneratingNumber ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate'
                                        )}
                                    </button>
                                </div>
                                <small className="text-muted">Click Generate to create a unique 6-digit board number automatically</small>
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold">Remarks <span className="text-danger">*</span>:</label>
                                <textarea 
                                    className={`form-control ${remarksError ? 'is-invalid' : ''}`}
                                    value={editRemarks}
                                    onChange={(e) => {
                                        setEditRemarks(e.target.value);
                                        if (e.target.value.trim()) {
                                            setRemarksError(false);
                                        }
                                    }}
                                    placeholder="Enter reason for board number change (required)"
                                    rows={3}
                                    required
                                />
                                {remarksError && (
                                    <div className="invalid-feedback">
                                        Please provide a reason for this board number change request
                                    </div>
                                )}
                                <small className="text-muted">Provide a reason for this board number change request</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowBoardEditModal(false)}>Cancel</button>
                            <button 
                                className="btn btn-warning" 
                                onClick={async () => {
                                    if (!editingBoard || !tempBoardValue) {
                                        alert('❌ Please fill in the board number');
                                        return;
                                    }
                                    
                                    if (!editRemarks.trim()) {
                                        setRemarksError(true);
                                        alert('❌ Please provide remarks for the board number change');
                                        return;
                                    }
                                    
                                    setIsSavingBoard(true);
                                    
                                    try {
                                        // Get the current username first
                                        const currentUser = await getCurrentUser();
                                        
                                        const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                id: detailsUnit.id,
                                                column: editingBoard.dbKey,
                                                newValue: tempBoardValue,
                                                remarks: editRemarks,
                                                requestedBy: currentUser, // Use actual username from database
                                                action: 'edit_board'
                                            })
                                        });
                                        
                                        const result = await response.json();
                                        
                                        if (result.status === 'success') {
                                            alert('✅ Board number edit request submitted for admin approval!');
                                            setShowBoardEditModal(false);
                                            setEditingBoard(null);
                                            setTempBoardValue('');
                                            setEditRemarks('');
                                            setRemarksError(false);
                                            // Refresh pending requests to show the new request immediately
                                            fetchPendingRequests(detailsUnit.id);
                                            // Notify other components that pending requests have changed
                                            window.dispatchEvent(new CustomEvent('pendingRequestsChanged', { 
                                                detail: { action: 'submitted', unitId: detailsUnit.id }
                                            }));
                                        } else {
                                            alert('❌ Error: ' + (result.message || 'Failed to submit edit request'));
                                        }
                                    } catch (error) {
                                        console.error('Error submitting board edit:', error);
                                        alert('❌ Connection Error: Failed to submit edit request. Please check your connection.');
                                    } finally {
                                        setIsSavingBoard(false);
                                    }
                                }}
                                disabled={isSavingBoard}
                            >
                                {isSavingBoard ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// Add custom styles
const customStyles = `
<style>
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
</style>
`;

// Inject styles into the document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement.firstElementChild);
};