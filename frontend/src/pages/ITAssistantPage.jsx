import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`; 
const CURRENT_STATION = "IT_Assistant"; 
const MAX_QR_COUNT = 100000; 

// Helper to format a number into a sequential serial string (e.g., 1 -> 00001)
const formatSerial = (num) => String(num).padStart(5, '0');

// Helper function to safely parse a SN/ASSY string to a number
const safeParseSerial = (serialStr, prefix) => {
    const numStr = serialStr?.replace(prefix, '') || '0';
    return parseInt(numStr, 10) || 0;
}

// --- QR LIST PRINT COMPONENT (UPDATED FOR ASSEMBLY NO) ---
const GeneratedQRList = ({ list, onSave, onDiscard, isSaving }) => {
    if (list.length === 0) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area-wrapper').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print QR Batch</title>');
        
        printWindow.document.write(`
            <style>
                @page { size: auto; margin: 3mm; } 
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                .qr-item {
                    display: inline-block;
                    width: 95mm; 
                    height: 50mm; 
                    border: 1px dotted #ccc; 
                    margin: 2mm;
                    padding: 3mm;
                    box-sizing: border-box;
                    text-align: center;
                    page-break-inside: avoid;
                }
                .qr-img {
                    max-width: 35mm; 
                    height: auto;
                    margin-bottom: 2mm;
                }
                .qr-text {
                    font-size: 9pt; 
                    line-height: 1.3;
                }
                .qr-text strong {
                    font-size: 11pt;
                    display: block;
                    margin-bottom: 2px;
                }
                .tag-label {
                    font-size: 7pt;
                    color: #555;
                    text-transform: uppercase;
                }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent); 
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 300); 
    };
    
    return (
        <div className="mt-4 border-top pt-3">
            <h5 className="fw-bold mb-3 text-primary">Generated Batch Preview & Actions ({list.length} units)</h5>

            <div className="d-flex mb-3 gap-2">
                <button className="btn btn-primary fw-bold flex-grow-1" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print All Labels
                </button>
                <button className="btn btn-success fw-bold flex-grow-1" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <span><span className="spinner-border spinner-border-sm me-2"></span>Saving...</span> : <span><i className="bi bi-database-add me-2"></i> Save Batch to DB</span>}
                </button>
                <button className="btn btn-outline-secondary" onClick={onDiscard} disabled={isSaving}>
                    <i className="bi bi-trash"></i> Discard
                </button>
            </div>

            {/* Print Area Container */}
            <div className="bg-light p-3 border rounded" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <p className="small text-danger fw-bold mb-2">
                    Start Assembly No: {list[0]?.assembly_no} | Serial Numbers are BLANK (Pending Scan)
                </p>
                
                <div id="qr-print-area-wrapper">
                    {list.map((unit, index) => (
                        <div key={unit.id || index} className="qr-item bg-white shadow-sm" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '5px', width: '150px', height: '120px', border: '1px solid #ddd' }}>
                            <img src={unit.qr_url} alt="QR" className="qr-img" style={{ maxWidth: '60px' }} />
                            <div className="qr-text">
                                {/* Display Assembly No as the main identifier since Serial is blank */}
                                <strong>{unit.assembly_no}</strong>
                                <div><span className="tag-label">Model:</span> {unit.model || 'N/A'}</div>
                                <div><span className="tag-label">Rev:</span> {unit.revision || '-'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MODAL COMPONENTS ---
const CustomMessageModal = ({ title, message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-info'; 
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                    <div className={`modal-header ${bgColor} text-white`}>
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body"><p>{message}</p></div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS (Monitoring Table - Unscanned) ---
const UnscannedUnitsTable = ({ unscannedUnits }) => (
    <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
            <h5 className="mb-0"><i className="bi bi-box me-2"></i>Units For Scanning (**{unscannedUnits.length}** Units)</h5>
            <p className="small mb-0">These units have been created and are ready for the production floor.</p>
        </div>
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-striped table-sm mb-0 small">
                <thead className="table-light sticky-top">
                    <tr>
                        <th>Assembly No. (Ref)</th>
                        <th>Serial No.</th>
                        <th>Model/Rev</th>
                        <th>Kitting No.</th>
                        <th>Status</th>
                        <th>Station Logged</th>
                    </tr>
                </thead>
                <tbody>
                    {unscannedUnits.length > 0 ? unscannedUnits.map(unit => (
                        <tr key={unit.id} className="table-info">
                            <td className="fw-bold text-primary">{unit.assembly_no}</td>
                            <td>
                                {unit.device_serial_no ? (
                                    <span className="fw-bold text-dark">{unit.device_serial_no}</span>
                                ) : (
                                    <span className="text-muted fst-italic">(Pending Scan)</span>
                                )}
                            </td>
                            <td>{unit.model} ({unit.revision})</td>
                            <td>{unit.base_unit_kitting_no}</td>
                            <td><span className="badge bg-primary">For Scanning</span></td>
                            <td>{unit.station}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" className="text-center py-4">No units currently require initial scanning.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- MONITORING VIEW UTILITIES (Station History Modal) ---
const StationHistoryModal = ({ stationId, onClose }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const response = await axios.get(HISTORY_ENDPOINT, { params: { station: stationId } });
                if (Array.isArray(response.data)) {
                    setHistoryLogs(response.data);
                } else {
                    setHistoryLogs([]);
                }
            } catch (err) {
                setHistoryError(`Failed to fetch history for ${stationId}.`);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, [stationId]);
    
    const getStatusBadge = (status) => {
        let className = 'bg-secondary';
        if (status === 'Completed') className = 'bg-success';
        else if (status === 'No Good (NG)') className = 'bg-danger';
        else if (status === 'In Progress') className = 'bg-primary';
        else if (status === 'For Scanning') className = 'bg-info text-dark';
        else if (status === 'Pending Approval') className = 'bg-warning text-dark';
        return <span className={`badge ${className}`}>{status}</span>;
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title"><i className="bi bi-clock-history me-2"></i> Unit History for: {stationId}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0">
                        {historyLoading && <div className="text-center py-5">Loading history...</div>}
                        {historyError && <div className="alert alert-danger m-3">{historyError}</div>}
                        {!historyLoading && !historyError && (
                            <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover table-striped mb-0 small">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            <th>Unit ID</th>
                                            <th>Status After</th>
                                            <th>Action By</th>
                                            <th>Remarks</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyLogs.length > 0 ? historyLogs.map(log => (
                                            <tr key={log.history_id}> 
                                                <td>{log.unit_id}</td>
                                                <td>{getStatusBadge(log.status_after)}</td>
                                                <td>{log.action_by || 'System'}</td>
                                                <td>{log.remarks || 'N/A'}</td>
                                                <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-4">No historical records found for **{stationId}**.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MONITORING VIEW UTILITIES (Live Monitoring Table) ---
const LiveMonitoringTable = ({ stationId, units, onBack, handleMonitorHistory }) => {
    const stationUnits = units.filter(u => u.station === stationId && u.status !== 'For Scanning');

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="bi bi-activity me-2"></i>Live Units at {stationId}</h4>
                <button className="btn btn-sm btn-outline-danger" onClick={onBack}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Grid View
                </button>
            </div>
            <div className="card shadow-sm">
                <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="table table-striped table-sm mb-0 small">
                        <thead className="table-dark sticky-top">
                            <tr>
                                <th>Assembly No.</th>
                                <th>Serial No.</th>
                                <th>Model/Rev</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stationUnits.length > 0 ? stationUnits.map(unit => (
                                <tr key={unit.id}>
                                    <td className="fw-bold">{unit.assembly_no}</td>
                                    <td>
                                        {unit.device_serial_no ? (
                                            <span className="text-dark">{unit.device_serial_no}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">(Pending)</span>
                                        )}
                                    </td>
                                    <td>{unit.model} ({unit.revision})</td>
                                    <td><span className={`badge ${unit.status === 'In Progress' ? 'bg-primary' : unit.status === 'Completed' ? 'bg-success' : 'bg-danger'}`}>{unit.status}</span></td>
                                    <td>{unit.remarks}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-secondary py-0" onClick={() => handleMonitorHistory(unit.station)}>
                                            <i className="bi bi-clock-history me-1"></i>History
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-4">No live units currently logged at this station.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function ITAssistantPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");

    // --- STATE FOR QR GENERATOR ---
    const [qrFormData, setQrFormData] = useState({
        model: "MKFF-X1", 
        revision: "REV-01", 
        baseKit: "", 
        accKit: "", 
        quantity: 9, 
    });
    const [generatedQRList, setGeneratedQRList] = useState([]); 
    const [isSaving, setIsSaving] = useState(false);
    
    // --- LIVE DATA STATES ---
    const [unitLogs, setUnitLogs] = useState([]); 
    const [stations, setStations] = useState([]); 
    const [nextSerialNo, setNextSerialNo] = useState(1); 
    const [nextAssemblyNo, setNextAssemblyNo] = useState(1); 
    
    // --- UI STATES ---
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); 
    const [activeMonitorStationId, setActiveMonitorStationId] = useState(null); 
    const [activeHistoryStation, setActiveHistoryStation] = useState(null);

    // --- METRICS ---
    const calculateMetrics = (logs) => {
        const counts = { forScanning: 0, inProgress: 0, completed: 0, noGood: 0, pendingApproval: 0 };
        logs.forEach(log => {
            switch (log.status) {
                case 'For Scanning': counts.forScanning++; break;
                case 'In Progress': counts.inProgress++; break;
                case 'Completed': counts.completed++; break;
                case 'No Good (NG)': counts.noGood++; break;
                case 'Pending Approval': counts.pendingApproval++; break;
                default: counts.inProgress++;
            }
        });
        return counts;
    };

    // --- FETCH DATA ---
    const fetchUnitData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setError(null);
        try {
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            const fetchedUnits = Array.isArray(unitsRes.data) ? unitsRes.data : [];
            setUnitLogs(fetchedUnits);

            if (fetchedUnits.length > 0) {
                let maxSerial = 0;
                let maxAssembly = 0;

                fetchedUnits.forEach(unit => {
                    // Only parse serials if they exist
                    if (unit.device_serial_no) {
                        const currentSerial = safeParseSerial(unit.device_serial_no, 'SN-');
                        if (currentSerial > maxSerial) maxSerial = currentSerial;
                    }
                    if (unit.assembly_no) {
                        const currentAssembly = safeParseSerial(unit.assembly_no, 'ASSY-');
                        if (currentAssembly > maxAssembly) maxAssembly = currentAssembly;
                    }
                });

                setNextSerialNo(maxSerial + 1);
                setNextAssemblyNo(maxAssembly + 1);
            } else {
                setNextSerialNo(1);
                setNextAssemblyNo(1);
            }
        } catch (err) {
            console.error("Error fetching unit data:", err);
        } finally {
            if (isInitial) {
                setLoading(false);
                setIsInitialLoadComplete(true); 
            }
        }
    }, []);

    useEffect(() => {
        const mockStations = Array.from({ length: 15 }, (_, i) => ({
            id: `Station${i + 1}`,
            name: `Station ${i + 1}`,
            operator: `Operator-${100 + i}`,
            status: Math.random() > 0.8 ? "ERROR" : Math.random() > 0.6 ? "IDLE" : "RUNNING", 
        }));
        setStations(mockStations);
        fetchUnitData(true);
    }, [fetchUnitData]);

    useEffect(() => {
        if (isInitialLoadComplete) {
            const interval = setInterval(() => fetchUnitData(false), 10000); 
            return () => clearInterval(interval);
        }
    }, [isInitialLoadComplete, fetchUnitData]);
    
    // --- QR HANDLERS ---
    const handleGenerateQR = (e) => {
        e.preventDefault();

        // 1. Validation: Only Quantity is strictly required now
        const quantity = parseInt(qrFormData.quantity, 10);
        
        if (isNaN(quantity) || quantity < 1 || quantity > 100) { 
            setModalConfig({ title: "Error", message: "Batch quantity must be between 1 and 100.", type: "error" });
            setShowModal(true);
            return;
        }

        const newQRList = [];
        // We track Assembly No for uniqueness
        let currentAssembly = nextAssemblyNo; 

        for (let i = 0; i < quantity; i++) {
            if (currentAssembly > 999999) { 
                setModalConfig({ title: "Warning", message: `Generation stopped. Limit reached.`, type: "warning" });
                setShowModal(true);
                break;
            }

            // 2. Generate Unique Assembly No
            const newAssemblyNum = `ASSY-${formatSerial(currentAssembly)}`; 
            
            // 3. Serial No is BLANK
            const newSerialNum = ""; 

            // 4. Get Optional Values (Default to empty string if undefined)
            const model = qrFormData.model?.trim() || "";
            const rev = qrFormData.revision?.trim() || "";
            const base = qrFormData.baseKit?.trim() || "";
            const acc = qrFormData.accKit?.trim() || "";

            // 5. Construct QR String - Format: MODEL|REV|BASE_KIT|ASSEMBLY|SERIAL|ACC_KIT
            const qrString = `${model}|${rev}|${base}|${newAssemblyNum}|${newSerialNum}|${acc}`;
            
            newQRList.push({
                id: Date.now() + i, // Temp Key
                device_serial_no: newSerialNum, // BLANK
                assembly_no: newAssemblyNum,    // UNIQUE
                model: model,
                revision: rev,
                base_unit_kitting_no: base,
                accessory_kitting_no: acc,
                qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrString)}`,
                qr_string: qrString,
                status: 'For Scanning', 
                station: 'N/A', 
                remarks: 'Batch generated.',
            });

            currentAssembly++; 
        }
        
        setGeneratedQRList(newQRList);
    };

    const handleSaveToDB = async () => {
        if (generatedQRList.length === 0) {
            setModalConfig({ title: "Warning", message: "No QRs generated to save.", type: "warning" });
            setShowModal(true);
            return;
        }
        
        setIsSaving(true);
        
        try {
            // Prepare payload: Add creation context
            const unitsWithContext = generatedQRList.map(unit => ({
                ...unit,
                created_by: user.full_name || user.username || 'System',
                station: CURRENT_STATION, 
            }));

            const payload = {
                units: unitsWithContext,
                method: "BATCH_INSERT" 
            };

            const response = await axios.post(UNITS_ENDPOINT, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 201 || response.data.status === 'success') {
                setModalConfig({ 
                    title: "Batch Save Successful", 
                    message: `${generatedQRList.length} unique assembly QRs saved successfully!`, 
                    type: "success" 
                });
                setShowModal(true);
                setGeneratedQRList([]);
                fetchUnitData(false); 
            } else {
                throw new Error(response.data.message || 'Unknown API error.');
            }

        } catch (error) {
            console.error("Batch Unit Save Failed:", error.response?.data || error);
            const detailedErrorMessage = error.response 
                ? `Status ${error.response.status}: ${error.response.data?.message || error.response.data?.error || error.response.statusText}` 
                : error.message;

            setModalConfig({ 
                title: "Save Failed", 
                message: `Failed to save units. ${detailedErrorMessage}`, 
                type: "error" 
            });
            setShowModal(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveInput = (e) => {
        let { name, value } = e.target;
        if (name === 'quantity') {
            if (value === '') { setQrFormData(prev => ({...prev, [name]: ''})); return; }
            let parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 1) parsed = 1;
            if (parsed > 100) parsed = 100;
            value = parsed;
        }
        setQrFormData(prev => ({...prev, [name]: value}));
    };

    const handleApproveUnit = async (unit) => {
        setLoading(true);
        try {
            const dataToSend = {
                id: unit.id,
                status: 'In Progress', 
                remarks: `Approved by ${user.full_name || user.username}. Re-entry permitted.`,
            };
            await axios.put(UNITS_ENDPOINT, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            setModalConfig({ title: "Success", message: `Unit ${unit.device_serial_no || unit.assembly_no} approved!`, type: "success" });
            setShowModal(true);
            fetchUnitData(false);
        } catch (error) {
            console.error("Approval Failed:", error);
            setModalConfig({ title: "Approval Failed", message: `Could not approve unit. Check backend.`, type: "error" });
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };
    
    // --- HANDLERS FOR MONITORING ---
    const handleMonitorHistory = (stationId) => { setActiveHistoryStation(stationId); }
    const handleMonitorStationDetails = (stationId) => { setActiveMonitorStationId(stationId); setActiveTab('station_details'); }
    
    // --- RENDER CONTENT ---
    const renderContent = () => {
        const metrics = calculateMetrics(unitLogs);
        const unitsForScanning = unitLogs.filter(u => u.status === 'For Scanning');
        const pendingApprovals = unitLogs.filter(u => u.status === 'Pending Approval');
        
        if (loading && !isInitialLoadComplete) return <div className="text-center py-5">Loading production data...</div>;
        if (error) return <div className="alert alert-danger">{error}</div>;

        switch (activeTab) {
            case "overview":
                return (
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card text-white bg-primary shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">For Scanning</h6>
                                    <h2 className="display-6 fw-bold">{metrics.forScanning}</h2>
                                    <p className="card-text small">Waiting for initial scan</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-info shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">In Progress</h6>
                                    <h2 className="display-6 fw-bold">{metrics.inProgress}</h2>
                                    <p className="card-text small">Currently in production</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-success shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">Completed</h6>
                                    <h2 className="display-6 fw-bold">{metrics.completed}</h2>
                                    <p className="card-text small">Finished assembly/QA</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-danger shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">No Good (NG)</h6>
                                    <h2 className="display-6 fw-bold">{metrics.noGood}</h2>
                                    <p className="card-text small">Defective units</p>
                                </div>
                            </div>
                        </div>
                        
                        {metrics.pendingApproval > 0 && (
                            <div className="col-12">
                                <div className="alert alert-warning d-flex justify-content-between align-items-center shadow-sm">
                                    <h5 className="mb-0 text-dark fw-bold">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                                        {metrics.pendingApproval} UNITS AWAITING APPROVAL!
                                    </h5>
                                    <button className="btn btn-sm btn-dark" onClick={() => setActiveTab('approvals')}>Review Approvals</button>
                                </div>
                            </div>
                        )}

                        <div className="col-12 mt-4">
                            <UnscannedUnitsTable unscannedUnits={unitsForScanning} />
                        </div>
                    </div>
                );

            case "qr_generator":
                const currentQuantity = parseInt(qrFormData.quantity, 10) || 0;
                const isMaxLimitReached = currentQuantity > MAX_QR_COUNT; 
                const isFormInvalid = currentQuantity < 1 || isMaxLimitReached; 

                return (
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="mb-0"><i className="bi bi-qr-code me-2"></i>Generate Unique Assembly QR Batch</h5>
                                </div>
                                <div className="card-body">
                                    <div className="alert alert-primary small p-2 mb-3">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        <strong>Auto-Generation Info:</strong><br/>
                                        Only <strong>Assembly No.</strong> will be auto-generated.<br/>
                                        Next Assembly No: <strong className="fs-6 text-dark">ASSY-{formatSerial(nextAssemblyNo)}</strong>
                                        {isMaxLimitReached && (
                                            <p className="text-danger fw-bold mt-2 mb-0">
                                                ⚠️ WARNING: Quantity exceeds limit.
                                            </p>
                                        )}
                                    </div>
                                    <form onSubmit={handleGenerateQR}>
                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <label className="form-label fw-bold text-primary">How many QRs to generate? (Required)</label>
                                                <input type="number" className="form-control form-control-lg fw-bold border-primary" name="quantity" required min="1" max="100" value={qrFormData.quantity} onChange={handleSaveInput} placeholder="Enter quantity (e.g. 50)"/>
                                            </div>
                                            <hr className="my-4 text-muted" />
                                            <p className="small text-muted mb-2 fst-italic">OPTIONAL FIELDS</p>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Model</label>
                                                <input type="text" className="form-control" name="model" value={qrFormData.model} onChange={handleSaveInput} placeholder="Optional"/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Revision</label>
                                                <input type="text" className="form-control" name="revision" value={qrFormData.revision} onChange={handleSaveInput} placeholder="Optional"/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Base Unit Kitting No.</label>
                                                <input type="text" className="form-control" name="baseKit" value={qrFormData.baseKit} onChange={handleSaveInput} placeholder="Optional"/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Accessory Kitting No.</label>
                                                <input type="text" className="form-control" name="accKit" value={qrFormData.accKit} onChange={handleSaveInput} placeholder="Optional"/>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-end">
                                            <button type="submit" className="btn btn-primary px-4 btn-lg" disabled={isFormInvalid}>
                                                <i className="bi bi-printer me-2"></i> Generate {qrFormData.quantity || 0} QRs
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <GeneratedQRList list={generatedQRList} onSave={handleSaveToDB} onDiscard={() => setGeneratedQRList([])} isSaving={isSaving} />
                        </div>
                    </div>
                );
            
            case "station_details":
                return <LiveMonitoringTable stationId={activeMonitorStationId} units={unitLogs} onBack={() => { setActiveTab('station_monitor'); setActiveMonitorStationId(null); }} handleMonitorHistory={handleMonitorHistory} />;

            case "station_monitor":
                const productionUnits = unitLogs.filter(u => u.status !== 'For Scanning' && u.station !== 'N/A');
                return (
                    <div className="row g-4">
                        <div className="col-12">
                            <h4 className="mb-3"><i className="bi bi-grid-3x3-gap-fill me-2"></i>Production Stations Overview</h4>
                            <div className="row g-3">
                                {stations.map((station) => {
                                    const stationUnits = productionUnits.filter(u => u.station === station.id);
                                    let statusText = "IDLE";
                                    let statusClass = "bg-secondary";
                                    if (stationUnits.length > 0) {
                                        statusText = `${stationUnits.length} UNITS IN PRODUCTION`;
                                        statusClass = "bg-primary"; 
                                    }
                                    return (
                                        <div key={station.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                                            <div className={`card h-100 shadow-sm border-top-4 ${statusClass === 'bg-primary' ? 'border-primary' : 'border-secondary'}`}>
                                                <div className="card-body text-center p-2">
                                                    <h6 className="fw-bold mb-1">{station.name}</h6>
                                                    <span className={`badge mb-2 ${statusClass}`}>{statusText}</span>
                                                    <p className="small text-muted mb-0">{station.operator}</p>
                                                </div>
                                                <div className="card-footer bg-white p-1 d-flex justify-content-between">
                                                    <button className="btn btn-primary btn-sm py-0 flex-grow-1 me-1" style={{fontSize: '0.7rem'}} onClick={() => handleMonitorStationDetails(station.id)}>
                                                        <i className="bi bi-eye me-1"></i>Monitor
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm py-0" style={{fontSize: '0.7rem'}} onClick={() => handleMonitorHistory(station.id)}>
                                                        <i className="bi bi-clock-history me-1"></i>History
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            
            case "approvals":
                const pendingApprovalLogs = unitLogs.filter(u => u.status === 'Pending Approval');
                return (
                    <div className="card shadow-sm">
                        <div className="card-header bg-warning text-dark">
                            <h5 className="mb-0"><i className="bi bi-shield-check me-2"></i>Pending Rework Approvals (**{pendingApprovalLogs.length}** Units)</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped table-sm mb-0">
                                <thead className="table-light">
                                    <tr><th>Serial No.</th><th>Model</th><th>Assembly No.</th><th>Station</th><th>Remarks</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {pendingApprovalLogs.length > 0 ? pendingApprovalLogs.map(unit => (
                                        <tr key={unit.id}>
                                            <td className="fw-bold">{unit.device_serial_no || '(No Serial)'}</td>
                                            <td>{unit.model}</td>
                                            <td>{unit.assembly_no}</td>
                                            <td><span className="badge bg-secondary">{unit.station}</span></td>
                                            <td>{unit.remarks}</td>
                                            <td>
                                                <button className="btn btn-sm btn-success py-0" onClick={() => handleApproveUnit(unit)}>
                                                    <i className="bi bi-check-circle me-1"></i> Approve
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center py-4">No units currently require approval.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default:
                return <div className="alert alert-info">Select a menu item</div>;
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: "260px" }}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <i className="bi bi-hdd-rack fs-4 me-2"></i>
                    <span className="fs-5 fw-bold">IT Support</span>
                </a>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'overview' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('overview')}>
                            <i className="bi bi-speedometer2 me-2"></i> Overview
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'qr_generator' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('qr_generator')}>
                            <i className="bi bi-qr-code me-2"></i> QR Generator
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'station_monitor' || activeTab === 'station_details' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('station_monitor')}>
                            <i className="bi bi-display me-2"></i> Station Monitor
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'approvals' ? 'active bg-danger' : ''}`} onClick={() => setActiveTab('approvals')}>
                            <i className="bi bi-shield-check me-2"></i> Approvals
                        </button>
                    </li>
                </ul>
                <hr />
                <div className="dropdown">
                    <div className="d-flex align-items-center text-white text-decoration-none">
                        <i className="bi bi-person-circle fs-4 me-2"></i>
                        <strong>{user.full_name || user.username}</strong>
                    </div>
                    <button onClick={onLogout} className="btn btn-outline-danger w-100 btn-sm mt-2">Logout</button>
                </div>
            </div>

            <div className="flex-grow-1 p-4 overflow-auto">
                <h2 className="mb-4 text-capitalize border-bottom pb-2">{activeTab.replace(/_/g, ' ')}</h2>
                {renderContent()}
            </div>
            
            {showModal && (
                <CustomMessageModal
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                    onClose={() => setShowModal(false)}
                />
            )}
            {activeHistoryStation && (
                <StationHistoryModal 
                    stationId={activeHistoryStation}
                    onClose={() => setActiveHistoryStation(null)}
                />
            )}
        </div>
    );
}