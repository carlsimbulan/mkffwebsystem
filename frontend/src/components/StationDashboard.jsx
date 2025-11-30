import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

// REGISTER CHART COMPONENTS
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`;
const REPORT_ENDPOINT = `${API_BASE_URL}/daily_reports.php`;

// DEFINE THE STRICT STATION ORDER
const STATION_ORDER = [
    "Station 1", "Station 2", "Station 3", "Station 4", "Station 5",
    "Station 6", "Station 7", "Station 8", "Station 9", "Station 10", 
    "Station 11", "Station 12", "Station 13", "Station 14", "Station 15"
];

// --- UTILITY COMPONENTS ---

const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;
    let iconClass, spinnerVisible = false, bgColor, statusText;
    if (status === 'loading') {
        spinnerVisible = true; bgColor = "bg-dark opacity-75"; statusText = "PROCESSING DATA...";
    } else if (status === 'success') {
        iconClass = "bi bi-check-circle-fill text-success"; bgColor = "bg-success opacity-75"; statusText = "SUCCESS";
    } else if (status === 'error') {
        iconClass = "bi bi-x-octagon-fill text-danger"; bgColor = "bg-danger opacity-75"; statusText = "FAILED";
    }
    return (
        <div className={`position-fixed w-100 h-100 top-0 start-0 ${bgColor} d-flex justify-content-center align-items-center z-3`}>
            <div className="bg-white p-5 rounded shadow-lg text-center" style={{ minWidth: '300px' }}>
                <div className="mb-3">
                    {spinnerVisible ? <div className="spinner-border text-primary" role="status"></div> : <i className={`${iconClass} fs-1`}></i>}
                </div>
                <h4 className="fw-bold text-dark mb-1">{statusText}</h4>
                <p className="text-muted small">{message}</p>
            </div>
        </div>
    );
};

const EditUnitModal = ({ unit, onClose, onSave }) => {
    const isReopening = unit.status === 'Completed' || unit.status === 'No Good (NG)';
    const initialStatus = isReopening ? 'Pending Approval' : unit.status;
    const [status, setStatus] = useState(initialStatus);
    const [remarks, setRemarks] = useState(unit.remarks);

    const handleSave = () => {
        onSave(unit.id, { 
            ...unit, 
            status: status, 
            remarks: remarks,
            model: unit.model,
            assembly_no: unit.assembly_no 
        });
    };

    const statusOptions = isReopening ? ["Pending Approval"] : ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Edit Unit: {unit.device_serial_no || unit.assembly_no}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label fw-bold">Change Status</label>
                            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isReopening}>
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Remarks</label>
                            <textarea className="form-control" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UnitListTable = ({ units, listStatus, loading, error, onEdit }) => {
    if (loading || error || units.length === 0) {
        if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border" role="status"></div><p className="mt-2">Loading...</p></div>;
        if (error) return <div className="alert alert-danger">{error}</div>;
        return <div className="text-center py-5 bg-light p-4 rounded border border-dashed text-muted"><p>No Units Found for "{listStatus}"</p></div>;
    }
    const canEdit = ['in progress', 'completed', 'no good', 'pending approval'].some(s => listStatus.toLowerCase().includes(s));
    
    return (
        <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover table-striped table-bordered mb-0 small text-nowrap">
                <thead className="table-dark text-center">
                    <tr>
                        <th>MODEL</th>
                        <th>REVISION</th>
                        <th>BASE UNIT</th>
                        <th>ASSEMBLY</th>
                        <th>DEVICE SERIAL</th>
                        <th>ACCESSORY</th>
                        <th>STATUS</th>
                        <th>REMARKS</th>
                        <th>TIME DATE</th>
                        {canEdit && <th>ACTIONS</th>}
                    </tr>
                </thead>
                <tbody className="align-middle">
                    {units.map((unit) => (
                        <tr key={unit.id}>
                            <td className="fw-bold">{unit.model}</td>
                            <td>{unit.revision || '-'}</td>
                            <td className="font-monospace">{unit.base_unit_kitting_no || '-'}</td>
                            <td className="font-monospace text-primary">{unit.assembly_no}</td>
                            <td className="fw-semibold">{unit.device_serial_no || '-'}</td>
                            <td>{unit.accessory_kitting_no || '-'}</td>
                            <td className="text-center">
                                <span className={`badge ${unit.status.includes('Progress') ? 'bg-warning text-dark' : unit.status.includes('Completed') ? 'bg-success' : 'bg-danger'}`}>
                                    {unit.status}
                                </span>
                            </td>
                            <td><small className="text-muted">{unit.remarks}</small></td>
                            <td>{new Date(unit.created_at).toLocaleString()}</td>
                            {canEdit && (
                                <td className="text-center">
                                    <button onClick={() => onEdit(unit)} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit Status">
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UnitHistoryTable = ({ historyLogs, loading, error }) => {
    if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (historyLogs.length === 0) return <div className="text-center py-5 bg-light border border-dashed">No History Found</div>;

    return (
        <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover table-striped mb-0 small">
                <thead className="table-dark">
                    <tr>
                        <th>Unit ID</th>
                        <th>Model</th>
                        <th>Assembly</th>
                        <th>Action</th>
                        <th>Station</th>
                        <th>Status</th>
                        <th>User</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {historyLogs.map((log) => (
                        <tr key={log.history_id}>
                            <td>{log.unit_id}</td>
                            <td className="fw-bold">{log.model || '-'}</td>
                            <td className="font-monospace">{log.assembly_no || '-'}</td>
                            <td>{log.action_type}</td>
                            <td>{log.station_name}</td>
                            <td>{log.status_after}</td>
                            <td>{log.action_by}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- MAIN GENERIC COMPONENT ---
export default function StationDashboard({ user, onLogout }) { 
    
    // --- DYNAMIC STATION LOGIC ---
    const getStationName = () => {
        // Get the raw string from user.station OR user.username
        const rawName = (user?.station || user?.username || "").toLowerCase();

        // If the name contains the word "station"
        if (rawName.includes('station')) {
            // Extract the numbers only (e.g., "station1" -> "1")
            const num = rawName.replace(/\D/g, ''); 
            
            // Return with the correct format "Station X" (Capital S, Space, Number)
            if (num) return `Station ${num}`;
        }

        // Fallback for names like "admin", "james", etc.
        return rawName.charAt(0).toUpperCase() + rawName.slice(1);
    };

    const currentStation = getStationName();

    // --- HOOK DEFINITIONS ---
    const [activeTab, setActiveTab] = useState("home"); 
    const [scanInput, setScanInput] = useState("");
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");
    const [unitList, setUnitList] = useState([]);
    const [historyList, setHistoryList] = useState([]); 
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    const [unitToEdit, setUnitToEdit] = useState(null); 
    
    const [scannedUnitId, setScannedUnitId] = useState(null); 

    const [formData, setFormData] = useState({
        model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "",
        deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: ""
    });
    
    const [dailyReportData, setDailyReportData] = useState({
        shift: 'Day Shift', totalUnitsProcessed: 0, totalNG: 0,
        downtimeMinutes: 0, summary: '', date: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const scannerInputRef = useRef(null); 

    // --- HELPER FUNCTION: RESET FORM ---
    const resetForm = () => {
        setFormData({ model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "", deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: "" });
        setScanInput(""); setStatusMessage(""); setProcessStatus('idle'); setScannedUnitId(null);
    };

    // --- HOOKED FUNCTIONS ---
    const fetchUnits = useCallback(async (status) => { 
        setListLoading(true); setListError(null); setUnitList([]); 
        
        let dbStatus = status.replace(/_/g, ' ').replace(' unit', '');
        if (dbStatus === 'in progress') dbStatus = 'In Progress';
        if (dbStatus === 'completed') dbStatus = 'Completed';
        if (dbStatus === 'no good') dbStatus = 'No Good (NG)';
        if (dbStatus === 'pending') dbStatus = 'Pending Approval'; 
        
        if (['daily reports', 'account history', 'guide'].includes(dbStatus.toLowerCase())) {
            setListLoading(false); return;
        }
        
        try {
            const res = await axios.get(UNITS_ENDPOINT, {
                params: {
                    station: currentStation, 
                    status: dbStatus
                }
            });
            setUnitList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setListError(`Failed to load data: ${err.message}`);
        } finally {
            setListLoading(false);
        }
    }, [currentStation]); 
    
    const fetchHistory = useCallback(async () => {
        setListLoading(true); setListError(null); setHistoryList([]);
        try {
            const res = await axios.get(HISTORY_ENDPOINT, {
                params: { station: currentStation }
            });
            setHistoryList(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            setListError(`Failed to load history: ${err.message}`);
        } finally {
            setListLoading(false);
        }
    }, [currentStation]);

   
    // --- HANDLE SCAN LOGIC (FIXED FLICKERING) ---
    const handleScan = async (e) => { 
        e.preventDefault();
        setProcessStatus('loading'); 
        setStatusMessage("Validating process flow...");
        setScannedUnitId(null); 

        const scannedData = scanInput.trim();
        if (!scannedData) { setProcessStatus('idle'); return; }

        const parts = scannedData.split('|');
        if (parts.length < 5) {
            setProcessStatus('error');
            setStatusMessage("⚠️ Invalid QR Format!");
            setTimeout(() => setProcessStatus('idle'), 3000);
            setScanInput(""); 
            return;
        }

        // QR Format: MODEL|REV|BASE|ASSEMBLY|SERIAL|ACC
        const scannedAssembly = parts[3].trim();
        const scannedSerial = parts[4].trim();
        
        const myStationIndex = STATION_ORDER.indexOf(currentStation);

        // [SECURITY CHECK] 
        // Siguraduhin na nakuha ng maayos ang Station Name (may space dapat, e.g., "Station 2")
        if (myStationIndex === -1 && currentStation !== "Station 1") {
             setProcessStatus('error');
             setStatusMessage(`⛔ ACCESS DENIED: You are logged in as "${currentStation}". Only authorized Stations (1-15) can scan.`);
             setTimeout(() => setProcessStatus('idle'), 5000);
             setScanInput("");
             return;
        }

        try {
            // SEARCH LOGIC
            let response;
            if (scannedSerial) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_serial: scannedSerial } });
            } else if (scannedAssembly) {
                response = await axios.get(UNITS_ENDPOINT, { params: { search_assembly: scannedAssembly } });
            } else {
                throw new Error("Invalid QR: No Serial or Assembly Number found.");
            }

            const dbUnit = response.data && response.data.length > 0 ? response.data[0] : null;

            // --- STRICT LOGIC IMPLEMENTATION ---
            
            const unitStationIndex = dbUnit ? STATION_ORDER.indexOf(dbUnit.station) : -1;
            const dbStatus = dbUnit ? dbUnit.status.toLowerCase() : ""; 

            // [LOGIC GATE 1] STATION 1 RULES
            if (currentStation === "Station 1") {
                if (dbUnit) {
                    if (dbStatus === "for scanning") {
                        setScannedUnitId(dbUnit.id);
                        setStatusMessage("✅ Unit Found (For Scanning). Activating...");
                    } else if (dbUnit.station === "Station 1") {
                        if (dbStatus === "completed") {
                            throw new Error("Unit is already Completed at Station 1. Cannot rescan.");
                        }
                        setScannedUnitId(dbUnit.id);
                        setStatusMessage("✅ Unit Found at Station 1. Resuming...");
                    } else {
                        throw new Error(`Unit has already moved to ${dbUnit.station}. Station 1 cannot modify.`);
                    }
                } else {
                    setStatusMessage("✅ New Unit. Starting Process...");
                }
            } 
            
            // [LOGIC GATE 2] STATIONS 2 - 15 RULES
            else {
                // RULE 1: Must Exist
                if (!dbUnit) {
                    throw new Error("Unit not found in database. Process MUST start at Station 1.");
                }

                // RULE 2: No 'For Scanning'
                if (dbStatus === "for scanning") {
                    throw new Error("Unit is NOT YET ACTIVATED. Please send to Station 1.");
                }

                // RULE 3: Forward Check (Prevent Backtracking)
                if (unitStationIndex > myStationIndex) {
                    throw new Error(`Unit is already processed at ${dbUnit.station}. Cannot backtrack.`);
                }

                // RULE 4: Current Station Check (Resume Work)
                if (unitStationIndex === myStationIndex) {
                    if (dbStatus === "completed") {
                        throw new Error("Unit is already Completed at your station.");
                    }
                    setScannedUnitId(dbUnit.id);
                    setStatusMessage(`✅ Resuming unit at ${currentStation}...`);
                }

                // RULE 5: Previous Station Handover (The Strict Sequence)
                else if (unitStationIndex < myStationIndex) {
                    
                    // Sequence Check
                    if (unitStationIndex !== myStationIndex - 1) {
                         // Kunin ang pangalan ng dapat na previous station
                         const requiredPrev = STATION_ORDER[myStationIndex - 1];
                         throw new Error(`Sequence Violation: Unit is from ${dbUnit.station}. It must pass ${requiredPrev} first.`);
                    }

                    // Status Check
                    if (dbStatus !== 'completed') {
                        throw new Error(`Handover Failed: Unit is '${dbUnit.status}' at ${dbUnit.station}. It must be 'Completed' first.`);
                    }

                    setScannedUnitId(dbUnit.id);
                    setStatusMessage(`✅ Handover accepted from ${dbUnit.station}.`);
                }
                else {
                    throw new Error(`Station Validation Error: Unit is at unknown station '${dbUnit.station}'.`);
                }
            }

            // SUCCESS: Populate Form
            setFormData(prev => ({
                ...prev,
                model: parts[0].trim() || "",
                revision: parts[1].trim() || "",
                baseUnitKittingNo: parts[2].trim() || "",
                assemblyNo: parts[3].trim() || "",
                deviceSerialNo: scannedSerial, 
                accessoryKittingNo: parts[5]?.trim() || "",
                status: "In Progress", 
                remarks: ""
            }));
            
            setProcessStatus('idle'); // Hide overlay immediately on success so user can edit

        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`⛔ ${err.message}`);
            
            // --- FIX HERE: DO NOT CALL resetForm() ---
            // Just clear the form data explicitly if you want, but KEEP status message
            setFormData({
                model: "", revision: "", baseUnitKittingNo: "", assemblyNo: "",
                deviceSerialNo: "", accessoryKittingNo: "", status: "In Progress", remarks: ""
            });
            
            // Wait 5 seconds before hiding the error so the user can read it
            setTimeout(() => {
                setProcessStatus('idle');
                setStatusMessage("");
            }, 5000); 
        }

        setScanInput(""); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.model) {
            setProcessStatus('error'); 
            setStatusMessage("Model is required."); 
            setTimeout(() => setProcessStatus('idle'), 3000); 
            return;
        }
        
        setProcessStatus('loading');
        setStatusMessage("Saving unit...");

        try {
            const commonData = {
                ...formData,
                station: currentStation, 
                full_name: user.full_name,
                username: user.username,
            };

            let res;
            let finalId = scannedUnitId;
            let finalAction = 'create';

            // SAFETY NET: If ID is missing, double-check DB by Assembly No to prevent duplicates
            if (!finalId && currentStation === "Station 1") {
                const checkRes = await axios.get(UNITS_ENDPOINT, { params: { search_assembly: formData.assemblyNo } });
                if (checkRes.data && checkRes.data.length > 0) {
                    finalId = checkRes.data[0].id;
                }
            }

            if (finalId) {
                // UPDATE / HANDOVER
                res = await axios.post(UNITS_ENDPOINT, { 
                    ...commonData, 
                    id: finalId, 
                    action: 'update' 
                });
            } else {
                // CREATE NEW (Only allowed if logic passed handleScan for Station 1)
                res = await axios.post(UNITS_ENDPOINT, { 
                    ...commonData, 
                    action: 'create' 
                });
            }

            if (res.data.status === 'success' || res.data.success === true) {
                setProcessStatus('success');
                setStatusMessage(`Unit saved successfully!`);
                setTimeout(() => {
                    setProcessStatus('idle'); 
                    resetForm(); 
                    scannerInputRef.current?.focus(); 
                    if (activeTab === 'in_progress') fetchUnits('in_progress');
                }, 2000);
            } else {
                const errorMsg = res.data.error || res.data.message || JSON.stringify(res.data);
                console.error("Backend Error:", res.data); 
                setProcessStatus('error');
                setStatusMessage(`Server Error: ${errorMsg}`);
                setTimeout(() => setProcessStatus('idle'), 5000);
            }
        } catch (err) {
            console.error("Network Error:", err);
            setProcessStatus('error');
            const errMsg = err.response?.data?.message || err.message;
            setStatusMessage(`Submission Error: ${errMsg}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        const reportData = new FormData();
        reportData.append('station', currentStation);
        reportData.append('username', user.username);
        reportData.append('date', dailyReportData.date);
        reportData.append('shift', dailyReportData.shift);
        reportData.append('total_units_processed', String(dailyReportData.totalUnitsProcessed));
        reportData.append('total_ng', String(dailyReportData.totalNG));
        reportData.append('downtime_minutes', String(dailyReportData.downtimeMinutes));
        reportData.append('summary', dailyReportData.summary);
        if (selectedFile) reportData.append('file', selectedFile);

        setProcessStatus('loading');
        setStatusMessage("Submitting daily report...");

        try {
            const res = await axios.post(REPORT_ENDPOINT, reportData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(`Daily Report submitted successfully!`);
                setTimeout(() => {
                    setProcessStatus('idle');
                    setDailyReportData(prev => ({ ...prev, totalUnitsProcessed: 0, totalNG: 0, downtimeMinutes: 0, summary: '' }));
                    setSelectedFile(null);
                }, 3000);
            } else {
                setProcessStatus('error');
                setStatusMessage(res.data.message || 'Submission failed');
                setTimeout(() => setProcessStatus('idle'), 5000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`Error: ${err.message}`);
            setTimeout(() => setProcessStatus('idle'), 6000);
        }
    };

    const handleSaveEdit = async (id, updatedData) => {
        setUnitToEdit(null); 
        setProcessStatus('loading');
        
        try {
            const dataToSend = {
                ...updatedData,
                station: currentStation, 
                full_name: user.full_name, 
                username: user.username,
            };

            const res = await axios.put(UNITS_ENDPOINT, dataToSend);
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(res.data.message); 
                setTimeout(() => {
                    setProcessStatus('idle');
                    fetchUnits(activeTab); 
                }, 2000);
            } else {
                setProcessStatus('error');
                setStatusMessage(`Update Failed: ${res.data.error}`);
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
        } catch (err) {
            setProcessStatus('error');
            setStatusMessage(`API Error: ${err.message}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    const handleEditClick = (unit) => setUnitToEdit(unit);

    useEffect(() => { 
        if (activeTab === 'account_history') fetchHistory();
        else if (['in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) fetchUnits(activeTab);
        else { setUnitList([]); setHistoryList([]); }
    }, [activeTab, fetchUnits, fetchHistory]); 

    useEffect(() => { 
        if (activeTab === "input_unit" && scannerInputRef.current && processStatus === 'idle') scannerInputRef.current.focus();
    }, [activeTab, processStatus]);

    if (!user) return <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">Initializing session...</div>;
    
    const currentUsername = user.username; 
    
    const essentialFields = [formData.model, formData.revision, formData.assemblyNo];
    const progressPercent = Math.min((essentialFields.filter(val => val && val.trim() !== "").length / essentialFields.length) * 100, 100).toFixed(0);

    // --- CONTENT RENDERER ---
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <div className="card shadow-sm p-5 text-center">
                        <i className="bi bi-tools text-primary display-3 mb-4 mx-auto"></i>
                        <h1 className="h3 fw-light text-dark">Welcome, <strong>{currentUsername}</strong>!</h1>
                        <p className="lead text-muted mt-2">You are currently logged into <strong className="fw-semibold text-primary">{currentStation}</strong>.</p>
                        <button className="btn btn-primary btn-lg mt-4" onClick={() => setActiveTab('input_unit')}>
                            <i className="bi bi-qr-code-scan me-2"></i> Start Scanning
                        </button>
                    </div>
                );
            case "input_unit":
                return (
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card shadow-sm p-4 border-primary">
                                <label className="form-label fw-bold text-primary small"><i className="bi bi-upc-scan me-2"></i>SCAN QR / 2D BARCODE</label>
                                <form onSubmit={handleScan} className="d-flex gap-3">
                                    <input ref={scannerInputRef} type="text" className="form-control form-control-lg" placeholder="Scan here..." value={scanInput} onChange={(e) => setScanInput(e.target.value)} disabled={processStatus !== 'idle'} autoFocus />
                                    <button type="submit" className="btn btn-primary" disabled={processStatus !== 'idle'}>Process</button>
                                </form>
                                {statusMessage && processStatus !== 'loading' && <p className={`mt-2 small ${processStatus === 'error' ? 'text-danger' : 'text-success'}`}>{statusMessage}</p>}
                            </div>
                        </div>
                        <div className="col-12">
                            <form onSubmit={handleSubmit} className="card shadow-sm p-4 border-top border-secondary">
                                <div className="border-bottom pb-3 mb-4"><h5 className="card-title fw-bold text-dark">Unit Data Entry</h5></div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">COMPLETION</label>
                                    <div className="progress" style={{ height: '15px' }}>
                                        <div className={`progress-bar ${progressPercent < 100 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${progressPercent}%` }}>{progressPercent}%</div>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6"><label className="form-label small text-muted">Model</label><input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.model} readOnly /></div>
                                    <div className="col-md-6"><label className="form-label small text-muted">Revision</label><input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.revision} readOnly /></div>
                                    <div className="col-12"><label className="form-label fw-bold">Assembly No. *</label><input type="text" className="form-control" value={formData.assemblyNo} onChange={(e) => setFormData({...formData, assemblyNo: e.target.value})} required disabled={processStatus !== 'idle'} /></div>
                                    <div className="col-12"><label className="form-label fw-bold">Device Serial No. (Opt)</label><input type="text" className="form-control" value={formData.deviceSerialNo} onChange={(e) => setFormData({...formData, deviceSerialNo: e.target.value})} disabled={processStatus !== 'idle'} /></div>
                                    <div className="col-12"><label className="form-label fw-bold">Accessory Kitting No. (Opt)</label><input type="text" className="form-control" value={formData.accessoryKittingNo} onChange={(e) => setFormData({...formData, accessoryKittingNo: e.target.value})} disabled={processStatus !== 'idle'} /></div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Status *</label>
                                        <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} disabled={processStatus !== 'idle'}>
                                            <option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="No Good (NG)">No Good (NG)</option><option value="Pending Approval">Pending Approval</option>
                                        </select>
                                    </div>
                                    <div className="col-12"><label className="form-label fw-bold">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} disabled={processStatus !== 'idle'}></textarea></div>
                                    <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={processStatus !== 'idle'}>Clear</button>
                                        <button type="submit" className="btn btn-success" disabled={processStatus !== 'idle'}>Save Unit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case "daily_reports":
                return (
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <form onSubmit={handleReportSubmit} className="card shadow-sm p-4">
                                <h4 className="border-bottom pb-3 mb-4">Daily Production Report - {currentStation}</h4>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6"><label className="form-label fw-bold">Date</label><input type="date" className="form-control" value={dailyReportData.date} onChange={(e) => setDailyReportData({...dailyReportData, date: e.target.value})} required /></div>
                                    <div className="col-md-6"><label className="form-label fw-bold">Shift</label><select className="form-select" value={dailyReportData.shift} onChange={(e) => setDailyReportData({...dailyReportData, shift: e.target.value})}><option value="Day Shift">Day Shift</option><option value="Night Shift">Night Shift</option></select></div>
                                </div>
                                <h6 className="mt-4 border-bottom pb-2 text-primary">Metrics</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4"><label className="form-label">Total Units</label><input type="number" className="form-control" value={dailyReportData.totalUnitsProcessed} onChange={(e) => setDailyReportData({...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0})} required /></div>
                                    <div className="col-md-4"><label className="form-label">Total NG</label><input type="number" className="form-control" value={dailyReportData.totalNG} onChange={(e) => setDailyReportData({...dailyReportData, totalNG: parseInt(e.target.value) || 0})} /></div>
                                    <div className="col-md-4"><label className="form-label">Downtime (min)</label><input type="number" className="form-control" value={dailyReportData.downtimeMinutes} onChange={(e) => setDailyReportData({...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0})} /></div>
                                </div>
                                <div className="mb-4"><label className="form-label fw-bold">Summary</label><textarea className="form-control" rows="4" value={dailyReportData.summary} onChange={(e) => setDailyReportData({...dailyReportData, summary: e.target.value})} required></textarea></div>
                                <div className="mb-4"><label className="form-label fw-bold">Attach File</label><input type="file" className="form-control" onChange={(e) => setSelectedFile(e.target.files[0])} /></div>
                                <div className="mt-4 pt-3 border-top d-flex justify-content-end"><button type="submit" className="btn btn-primary btn-lg">Submit Report</button></div>
                            </form>
                        </div>
                    </div>
                );
            case "in_progress":
            case "completed":
            case "no_good":
            case "pending":
                return <UnitListTable units={unitList} listStatus={activeTab.replace(/_/g, ' ')} loading={listLoading} error={listError} onEdit={handleEditClick} />;
            case "account_history":
                return <>
                    <h4 className="mb-4"><i className="bi bi-clock-history me-2 text-primary"></i>Processing History for {currentStation}</h4>
                    <UnitHistoryTable historyLogs={historyList} loading={listLoading} error={listError} />
                </>;
            default:
                return <div className="alert alert-info text-center">Under development.</div>;
        }
    };

    return (
        <>
            <LoadingOverlay status={processStatus} message={statusMessage} />
            {unitToEdit && <EditUnitModal unit={unitToEdit} onClose={() => setUnitToEdit(null)} onSave={handleSaveEdit} />}
            <div className="d-flex flex-row min-vh-100 bg-light"> 
                <div className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" style={{ width: '250px', position: 'sticky', top: 0, height: '100vh' }}>
                    <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <i className="bi bi-wrench-adjustable-circle text-danger fs-4 me-2"></i>
                        <span className="fs-5 fw-bold text-dark">MKFF Portal</span>
                    </div>
                    <nav className="flex-grow-1 overflow-auto">
                        <ul className="nav nav-pills flex-column mb-auto">
                            <li className="nav-item mb-1"><button className={`btn w-100 text-start ${activeTab === 'home' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('home')}><i className="bi bi-house-door me-3"></i> Home</button></li>
                            <li className="nav-item mb-3"><button className={`btn w-100 text-start ${activeTab === 'input_unit' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('input_unit')}><i className="bi bi-pencil-square me-3"></i> Unit Entry</button></li>
                            <li className="text-uppercase small fw-bold text-muted mt-3 mb-2">Unit Management</li>
                            {[{ k: 'in_progress', i: 'bi-hourglass-split' }, { k: 'completed', i: 'bi-check-circle' }, { k: 'no_good', i: 'bi-x-circle' }, { k: 'pending', i: 'bi-clock-history' }].map(({ k, i }) => (
                                <li key={k} className="nav-item mb-1"><button className={`btn w-100 text-start ${activeTab === k ? 'btn-secondary text-white' : 'btn-light'}`} onClick={() => setActiveTab(k)}><i className={`bi ${i} me-3`}></i> {k.replace(/_/g, ' ').toUpperCase()}</button></li>
                            ))}
                            <li className="text-uppercase small fw-bold text-muted mt-3 mb-2 pt-3 border-top">Reports</li>
                            <li className="nav-item mb-1"><button className={`btn w-100 text-start ${activeTab === 'daily_reports' ? 'btn-secondary text-white' : 'btn-light'}`} onClick={() => setActiveTab('daily_reports')}><i className="bi bi-file-bar-graph me-3"></i> DAILY REPORT</button></li>
                            <li className="nav-item mb-1"><button className={`btn w-100 text-start ${activeTab === 'account_history' ? 'btn-secondary text-white' : 'btn-light'}`} onClick={() => setActiveTab('account_history')}><i className="bi bi-person-lines-fill me-3"></i> HISTORY</button></li>
                        </ul>
                    </nav>
                    <div className="mt-auto pt-3 border-top"><button className="btn btn-danger w-100" onClick={onLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></div>
                </div>
                <div className="d-flex flex-column flex-grow-1"> 
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm p-3">
                        <div className="container-fluid d-flex justify-content-between w-100">
                            <span className="navbar-brand h4 mb-0 text-white fw-bold">Edge Sensor Assembly - {currentStation}</span>
                            <div className="text-white d-flex align-items-center small"><span className="me-3">{user.username}</span><button className="btn btn-sm btn-outline-light" onClick={onLogout}>Logout</button></div>
                        </div>
                    </nav>
                    <div className="container-fluid p-4 flex-grow-1">{renderContent()}</div>
                </div>
            </div>
        </>
    );
}