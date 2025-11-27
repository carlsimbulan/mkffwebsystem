import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios'; 

// Base URL for the API 
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const REPORT_ENDPOINT = `${API_BASE_URL}/daily_reports.php`; // NEW ENDPOINT
const CURRENT_STATION = "Station1"; 

// --- UTILITY COMPONENTS ---

// 1. Full-Screen Status Overlay (Custom/Utility Styling)
const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;

    let iconClass, spinnerVisible = false, bgColor, statusText;
    let visibilityClass = "d-flex";

    if (status === 'loading') {
        spinnerVisible = true;
        bgColor = "bg-dark opacity-75";
        statusText = "PROCESSING DATA...";
    } else if (status === 'success') {
        iconClass = "bi bi-check-circle-fill text-success";
        bgColor = "bg-success opacity-75";
        statusText = "SAVED SUCCESSFULLY";
    } else if (status === 'error') {
        iconClass = "bi bi-x-octagon-fill text-danger";
        bgColor = "bg-danger opacity-75";
        statusText = "OPERATION FAILED";
    }

    return (
        <div 
            className={`position-fixed w-100 h-100 top-0 start-0 ${bgColor} ${visibilityClass} justify-content-center align-items-center z-3`}
            style={{ transition: 'opacity 0.3s' }}
        >
            <div className="bg-white p-5 rounded shadow-lg text-center" style={{ minWidth: '300px' }}>
                <div className="mb-3">
                    {spinnerVisible ? (
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <i className={`${iconClass} fs-1`}></i>
                    )}
                </div>
                
                <h4 className={`fw-bold text-dark mb-1`}>
                    {statusText}
                </h4>
                <p className="text-muted small">{message}</p>
            </div>
        </div>
    );
};

// 2. Edit Modal (CORRECTED LOGIC - UNCHANGED)
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
        });
    };

    const statusOptions = isReopening
        ? ["Pending Approval"]
        : ["In Progress", "Completed", "No Good (NG)", "Pending Approval"];
        
    const specialMessage = isReopening
        ? "⚠️ **REOPENING UNIT:** Saving any changes will submit this unit to the **Pending Approval** queue for re-inspection and verification."
        : "You can update the status and remarks for this In-Progress unit.";

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Edit Unit: {unit.device_serial_no}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className={`small mb-4 ${isReopening ? 'text-danger fw-bold' : 'text-muted'}`}>{specialMessage}</p>
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold">Change Status</label>
                            <select 
                                className="form-select" 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={isReopening}
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {isReopening && (
                                <div className="form-text text-info">
                                    Status automatically set to 'Pending Approval' upon editing a final status.
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Remarks</label>
                            <textarea 
                                className="form-control" 
                                rows="3"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Unit List Table Component (UNCHANGED)
const UnitListTable = ({ units, listStatus, loading, error, onEdit }) => {
    
    // ... (rest of UnitListTable component remains unchanged)
    
    // Conditional Rendering for Loading/Error/Empty states
    if (loading || error || units.length === 0) {
        if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border" role="status"></div><p className="mt-2">Loading {listStatus} units...</p></div>;
        if (error) return <div className="alert alert-danger" role="alert"><h4 className="alert-heading">Error!</h4><p>{error}</p></div>;
        
        return (
            <div className="text-center py-5 bg-light p-4 rounded border border-dashed text-muted">
                <i className="bi bi-database-x fs-1 d-block mb-3"></i>
                <p className="fs-5 fw-semibold">No Units Found</p>
                <p>There are no units currently logged as "{listStatus}".</p>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        if (status.includes('Progress')) return 'badge bg-warning text-dark';
        if (status.includes('Completed')) return 'badge bg-success';
        if (status.includes('No Good')) return 'badge bg-danger';
        if (status.includes('Pending')) return 'badge bg-info text-dark';
        return 'badge bg-secondary';
    };

    const canEdit = listStatus.toLowerCase().includes('in progress') || 
                    listStatus.toLowerCase().includes('completed') ||
                    listStatus.toLowerCase().includes('no good');

    return (
        <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover table-striped table-bordered mb-0 small">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Serial No.</th>
                        <th scope="col">Model</th>
                        <th scope="col">Revision</th>
                        <th scope="col">Base Kit No.</th>
                        <th scope="col">Assembly No.</th>
                        <th scope="col">Accessory Kit No.</th>
                        <th scope="col">Status</th>
                        <th scope="col">Remarks</th>
                        <th scope="col">Time Stamp</th>
                        {canEdit && <th scope="col">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {units.map((unit) => (
                        <tr key={unit.id}>
                            <td className="fw-semibold">{unit.device_serial_no}</td>
                            <td>{unit.model}</td>
                            <td>{unit.revision}</td>
                            <td className="font-monospace">{unit.base_unit_kitting_no || 'N/A'}</td>
                            <td className="font-monospace">{unit.assembly_no || 'N/A'}</td>
                            <td className="font-monospace">{unit.accessory_kitting_no || 'N/A'}</td>
                            <td>
                                <span className={getStatusBadge(unit.status)}>
                                    {unit.status}
                                </span>
                            </td>
                            <td className="small text-muted text-wrap" style={{ maxWidth: '100px' }}>
                                {unit.remarks || 'N/A'}
                            </td>
                            <td className="small">{new Date(unit.created_at).toLocaleString()}</td>
                            {canEdit && (
                                <td>
                                    <button
                                        onClick={() => onEdit(unit)}
                                        className="btn btn-sm btn-outline-warning py-0 text-dark"
                                    >
                                        <i className="bi bi-pencil me-1"></i> Edit
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


// --- MAIN APP COMPONENT ---
export default function Station1({ user, onLogout }) { 
    // --- 1. HOOK DEFINITIONS (UNCONDITIONAL - MUST BE AT THE TOP) ---
    const [activeTab, setActiveTab] = useState("home"); 
    const [scanInput, setScanInput] = useState("");
    
    // Global Status State
    const [processStatus, setProcessStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");

    // State for Unit Listings
    const [unitList, setUnitList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState(null);
    
    // State for Unit Editing 
    const [unitToEdit, setUnitToEdit] = useState(null); 

    // Form State 
    const [formData, setFormData] = useState({
        model: "",
        revision: "",
        baseUnitKittingNo: "",
        assemblyNo: "",
        deviceSerialNo: "",
        accessoryKittingNo: "",
        status: "In Progress", 
        remarks: ""
    });
    
    // NEW STATES FOR DAILY REPORT
    const [dailyReportData, setDailyReportData] = useState({
        shift: 'Day Shift',
        totalUnitsProcessed: 0,
        totalNG: 0,
        downtimeMinutes: 0,
        summary: '',
        date: new Date().toISOString().split('T')[0] // Today's date
    });
    const [selectedFile, setSelectedFile] = useState(null);
    

    const scannerInputRef = useRef(null); 

    // --- 2. HOOKED FUNCTIONS (useCallback) ---
    const fetchUnits = useCallback(async (status) => { 
        setListLoading(true);
        setListError(null);
        setUnitList([]); 
        
        let dbStatus = status.replace(/_/g, ' ').replace(' unit', '');
        if (dbStatus === 'in progress') dbStatus = 'In Progress';
        if (dbStatus === 'completed') dbStatus = 'Completed';
        if (dbStatus === 'no good') dbStatus = 'No Good (NG)';
        if (dbStatus === 'pending') dbStatus = 'Pending Approval'; 
        if (['daily reports', 'account history', 'guide'].includes(dbStatus)) {
            setListLoading(false);
            return;
        }
        
        try {
            // REAL API CALL: GET
            const res = await axios.get(UNITS_ENDPOINT, {
                params: {
                    station: CURRENT_STATION,
                    status: dbStatus
                }
            });
            
            if (Array.isArray(res.data)) {
                setUnitList(res.data);
            } else {
                setUnitList([]); 
            }
            
        } catch (err) {
            console.error("Fetch Units Error:", err);
            setListError(`Failed to load data: ${err.message}. Check network and backend configuration.`);
        } finally {
            setListLoading(false);
        }
        
    }, []); 
    
    // --- NEW HANDLER FOR REPORT SUBMISSION (ENHANCED FILE VALIDATION AND ERROR LOGGING) ---
    // ... (Lines 1-320 remain unchanged) ...

// --- NEW HANDLER FOR REPORT SUBMISSION (ENHANCED) ---
const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    const MAX_FILE_SIZE = 2097152; // 2MB in bytes
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
    
    // --- Front-end validation (required fields) ---
    if (!dailyReportData.summary || dailyReportData.totalUnitsProcessed === 0) {
        setProcessStatus('error');
        setStatusMessage("Please fill out the required report details (Summary and Units Processed must be greater than 0).");
        setTimeout(() => setProcessStatus('idle'), 3000);
        return;
    }

    if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
            setProcessStatus('error');
            setStatusMessage("File upload failed: File size exceeds the 2MB limit.");
            setTimeout(() => setProcessStatus('idle'), 4000);
            return;
        }
        if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
            setProcessStatus('error');
            setStatusMessage("File upload failed: Only JPG, PNG, and PDF files are allowed.");
            setTimeout(() => setProcessStatus('idle'), 4000);
            return;
        }
    }
    
    // 🚨 FIX: Create FormData and ensure all number fields are sent as actual numbers or strings of numbers.
    const reportData = new FormData();
    reportData.append('station', CURRENT_STATION);
    reportData.append('username', user.username);
    reportData.append('date', dailyReportData.date || new Date().toISOString().split('T')[0]);
    reportData.append('shift', dailyReportData.shift);
    
    // Ensure numerical fields are explicitly converted to string numbers, even if they are zero.
    reportData.append('total_units_processed', String(dailyReportData.totalUnitsProcessed));
    reportData.append('total_ng', String(dailyReportData.totalNG));
    reportData.append('downtime_minutes', String(dailyReportData.downtimeMinutes));
    
    reportData.append('summary', dailyReportData.summary);
    
    if (selectedFile) {
        reportData.append('file', selectedFile);
    }

    setProcessStatus('loading');
    setStatusMessage("Submitting daily report and uploading file...");

    try {
        // REAL API CALL: POST to the new report endpoint
        const res = await axios.post(REPORT_ENDPOINT, reportData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (res.data.status === 'success') {
            setProcessStatus('success');
            setStatusMessage(`Daily Report submitted successfully! File saved: ${res.data.filename || 'N/A'}`);

            setTimeout(() => {
                setProcessStatus('idle');
                // Reset report form
                setDailyReportData(prev => ({
                    ...prev,
                    totalUnitsProcessed: 0,
                    totalNG: 0,
                    downtimeMinutes: 0,
                    summary: '',
                    date: new Date().toISOString().split('T')[0]
                }));
                setSelectedFile(null);
            }, 3000);

        } else {
            setProcessStatus('error');
            // If PHP returned a structured error, display it
            setStatusMessage(`Report Submission Failed: ${res.data.message || res.data.error || 'Unknown error received from server.'}`);
            setTimeout(() => setProcessStatus('idle'), 5000);
        }
    } catch (err) {
        console.error("Report Submission Error:", err);
        
        // This still catches generic 400/500 errors if the server environment is misconfigured
        if (err.response && err.response.status === 400) {
            setStatusMessage(`Submission failed (400 Bad Request). Likely PHP limits exceeded or invalid data sent.`);
        } else {
            setStatusMessage(`Network or API Error: ${err.message}. Check if backend is running.`);
        }
        setProcessStatus('error');
        setTimeout(() => setProcessStatus('idle'), 6000);
    }
};

// ... (rest of the component remains unchanged) ...
    

    // --- 3. HOOKED EFFECTS (useEffect) ---
    useEffect(() => { 
        if (['in_progress', 'completed', 'no_good', 'pending'].includes(activeTab)) {
            fetchUnits(activeTab);
        } else {
            setUnitList([]); 
        }
    }, [activeTab, fetchUnits]);

    useEffect(() => { 
        if (activeTab === "input_unit" && scannerInputRef.current && processStatus === 'idle') {
            scannerInputRef.current.focus();
        }
    }, [activeTab, processStatus]);


    // --- 4. CONDITIONAL RETURN (ERROR/LOADING CHECK) ---
    if (!user) {
        return <div className="d-flex justify-content-center align-items-center min-vh-100 text-muted">Initializing operator session...</div>;
    }
    
    // --- 5. Handlers and Logic (Safe access after the check) ---
    const currentUsername = user.username; 
    
    // ... (rest of resetForm, handleScan, handleSubmit, handleSaveEdit, handleEditClick remain unchanged) ...
    // Note: handleSaveEdit logic uses the global unitToEdit, which is fine but relies on the UnitListTable triggering it.

    const resetForm = () => {
        setFormData({
            model: "",
            revision: "",
            baseUnitKittingNo: "",
            assemblyNo: "",
            deviceSerialNo: "",
            accessoryKittingNo: "",
            status: "In Progress",
            remarks: ""
        });
        setScanInput("");
        setStatusMessage("");
        setProcessStatus('idle');
    };

    const handleScan = (e) => { 
        e.preventDefault();
        setProcessStatus('idle'); 
        setStatusMessage("");
        const scannedData = scanInput.trim();

        if (!scannedData) return;

        // SIMULATION PARSER: MODEL|REV|BASE-KIT|ASSY|SERIAL|ACC-KIT
        const parts = scannedData.split('|');

        if (parts.length >= 5) {
            setFormData(prev => ({
                ...prev,
                model: parts[0].trim() || "",
                revision: parts[1].trim() || "",
                baseUnitKittingNo: parts[2].trim() || "",
                assemblyNo: parts[3].trim() || "",
                deviceSerialNo: parts[4].trim() || "",
                accessoryKittingNo: parts[5]?.trim() || "",
                status: "In Progress"
            }));
            setStatusMessage(`Data scanned successfully. Ready to save Unit: ${parts[4].trim()}`);
            setProcessStatus('idle'); 
        } else {
            setProcessStatus('error');
            setStatusMessage("⚠️ Invalid QR Format! Expected: MODEL|REV|BASE-KIT|ASSY|SERIAL|ACC-KIT.");
            setTimeout(() => setProcessStatus('idle'), 3000);
        }

        setScanInput(""); 
    };

    // DATABASE INSERT LOGIC (POST REQUEST)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.deviceSerialNo || !formData.model) {
            setProcessStatus('error');
            setStatusMessage("Serial No. and Model are required before saving.");
            setTimeout(() => setProcessStatus('idle'), 3000);
            return;
        }
        
        setProcessStatus('loading');
        setStatusMessage("Saving unit information to the database...");

        try {
            const dataToSend = {
                // Ensure data fields match backend expectation (snake_case if necessary, based on your API)
                model: formData.model,
                revision: formData.revision,
                base_unit_kitting_no: formData.baseUnitKittingNo,
                assembly_no: formData.assemblyNo,
                device_serial_no: formData.deviceSerialNo,
                accessory_kitting_no: formData.accessoryKittingNo,
                status: formData.status,
                remarks: formData.remarks,
                station: CURRENT_STATION,
            };

            // REAL API CALL: POST
            const res = await axios.post(UNITS_ENDPOINT, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(`Unit ${formData.deviceSerialNo} saved as ${formData.status}.`);

                setTimeout(() => {
                    setProcessStatus('idle');
                    resetForm(); 
                    scannerInputRef.current?.focus(); 
                    if (activeTab === 'in_progress') {
                        fetchUnits('in_progress');
                    }
                }, 2000);

            } else {
                setProcessStatus('error');
                setStatusMessage(`Error from Server: ${res.data.error || 'Unknown error'}`);
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
        } catch (err) {
            console.error("Submission Error:", err);
            let errMsg = err.response?.data?.error || `Network Error: ${err.message}`;
            setProcessStatus('error');
            setStatusMessage(`API Submission Error: ${errMsg}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    // DATABASE UPDATE LOGIC (FOR EDIT MODAL) - 🚨 CORRECTED LOGIC HERE
    const handleSaveEdit = async (id, updatedData) => {
        setUnitToEdit(null); 
        
        const originalStatus = unitToEdit.status; 
        const isReopening = originalStatus === 'Completed' || originalStatus === 'No Good (NG)' || originalStatus === 'Pending Approval';
        
        const newStatus = isReopening ? 'Pending Approval' : updatedData.status;

        setProcessStatus('loading');
        setStatusMessage(`Updating unit ${id}. New status: ${newStatus}...`);
        
        try {
            // Remap front-end camelCase to database snake_case for PUT request
            const dataToSend = {
                id: id, 
                model: updatedData.model,
                revision: updatedData.revision,
                base_unit_kitting_no: updatedData.base_unit_kitting_no,
                assembly_no: updatedData.assembly_no,
                device_serial_no: updatedData.device_serial_no,
                accessory_kitting_no: updatedData.accessory_kitting_no,
                status: newStatus, // Use the determined status
                remarks: updatedData.remarks,
                station: updatedData.station || CURRENT_STATION,
            };

            // REAL API CALL: PUT
            const res = await axios.put(UNITS_ENDPOINT, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.data.status === 'success') {
                setProcessStatus('success');
                setStatusMessage(res.data.message);

                setTimeout(() => {
                    setProcessStatus('idle');
                    
                    if (isReopening || newStatus === 'Pending Approval') {
                        setActiveTab('pending');
                        fetchUnits('pending'); 
                    } else {
                        fetchUnits(activeTab); 
                    }
                }, 2000);
            
            } else {
                setProcessStatus('error');
                setStatusMessage(`Update Failed: ${res.data.error || 'Unknown server error.'}`);
                setTimeout(() => setProcessStatus('idle'), 3000);
            }
            
        } catch (err) {
            console.error("Update Error:", err);
            let errMsg = err.response?.data?.error || `Network Error: ${err.message}`;
            setProcessStatus('error');
            setStatusMessage(`API Update Error: ${errMsg}`);
            setTimeout(() => setProcessStatus('idle'), 4000);
        }
    };
    
    // Handler to open the Edit Modal
    const handleEditClick = (unit) => {
        setUnitToEdit(unit);
    };


    // Determine progress percentage
    const essentialFields = [formData.model, formData.revision, formData.baseUnitKittingNo, formData.assemblyNo, formData.deviceSerialNo, formData.accessoryKittingNo];
    const filledFields = essentialFields.filter(val => val && val.trim() !== "").length;
    const totalRequiredFields = essentialFields.length;
    const progressPercent = Math.min((filledFields / totalRequiredFields) * 100, 100).toFixed(0);


    // --- CONTENT RENDERER ---
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <div className="card shadow-sm p-5 text-center">
                        <i className="bi bi-tools text-primary display-3 mb-4 mx-auto"></i>
                        <h1 className="h3 fw-light text-dark">Welcome, **{currentUsername}**!</h1>
                        <p className="lead text-muted mt-2">You are currently logged into <strong className="fw-semibold text-primary">{CURRENT_STATION}</strong>.</p>
                        <button className="btn btn-primary btn-lg mt-4" onClick={() => setActiveTab('input_unit')}>
                            <i className="bi bi-qr-code-scan me-2"></i> Start Scanning & Input
                        </button>
                    </div>
                );

            case "input_unit":
                // ... (Input Unit form remains unchanged) ...
                return (
                    <div className="row g-4">
                        <div className="col-12">
                            {/* SCANNER SECTION */}
                            <div className="card shadow-sm p-4 border-primary">
                                <label className="form-label fw-bold text-primary small text-uppercase">
                                    <i className="bi bi-upc-scan me-2"></i>
                                    SCAN QR / 2D BARCODE HERE
                                </label>
                                <form onSubmit={handleScan} className="d-flex gap-3">
                                    <input 
                                        ref={scannerInputRef}
                                        type="text" 
                                        className="form-control form-control-lg flex-grow-1" 
                                        placeholder="Place cursor here and scan..." 
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        disabled={processStatus !== 'idle'}
                                        autoFocus
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={processStatus !== 'idle'}>
                                        Process
                                    </button>
                                </form>
                                {statusMessage && processStatus !== 'loading' && (
                                    <p className={`mt-2 small ${processStatus === 'error' ? 'text-danger' : processStatus === 'idle' ? 'text-muted' : 'text-success'}`}>
                                        {statusMessage}
                                    </p>
                                )}
                                <small className="mt-2 text-muted">
                                    *Simulate format: <code>MODEL|REV|BASE-KIT|ASSY|SERIAL|ACC-KIT</code>
                                </small>
                            </div>
                        </div>

                        <div className="col-12">
                            {/* FORM SECTION */}
                            <form onSubmit={handleSubmit} className="card shadow-sm p-4 border-top border-secondary">
                                <div className="border-bottom pb-3 mb-4">
                                    <h5 className="card-title fw-bold text-dark">
                                        <i className="bi bi-list-check me-2 text-primary"></i>
                                        Unit Data Entry
                                    </h5>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">UNIT COMPLETION PROGRESS</label>
                                    <div className="progress" style={{ height: '15px' }}>
                                        <div 
                                            className={`progress-bar ${progressPercent < 100 ? 'bg-warning' : 'bg-success'}`}
                                            role="progressbar"
                                            style={{ width: `${progressPercent}%` }}
                                            aria-valuenow={progressPercent}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            {progressPercent}%
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    {/* Read-Only/Scanned Fields */}
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Model</label>
                                        <input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.model} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Revision</label>
                                        <input type="text" className="form-control form-control-sm bg-light font-monospace" value={formData.revision} readOnly />
                                    </div>

                                    {/* Editable Input Fields */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Base Unit Kitting No. <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.baseUnitKittingNo} 
                                            onChange={(e) => setFormData({...formData, baseUnitKittingNo: e.target.value})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Assembly No. <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.assemblyNo} 
                                            onChange={(e) => setFormData({...formData, assemblyNo: e.target.value})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold">Device Serial No. <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.deviceSerialNo} 
                                            onChange={(e) => setFormData({...formData, deviceSerialNo: e.target.value})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold">Accessory Kitting No. <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.accessoryKittingNo} 
                                            onChange={(e) => setFormData({...formData, accessoryKittingNo: e.target.value})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Status <span className="text-danger">*</span></label>
                                        <select 
                                            className="form-select" 
                                            value={formData.status} 
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            disabled={processStatus !== 'idle'}
                                        >
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="No Good (NG)">No Good (NG)</option>
                                            <option value="Pending Approval">Pending Approval</option>
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold">Remarks (optional)</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="3"
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                            disabled={processStatus !== 'idle'}
                                        ></textarea>
                                    </div>

                                    <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={processStatus !== 'idle'}>
                                            <i className="bi bi-trash me-2"></i> Clear Form
                                        </button>
                                        <button type="submit" className="btn btn-success" disabled={processStatus !== 'idle' || !formData.deviceSerialNo}>
                                            <i className="bi bi-save me-2"></i> Save Unit Info
                                        </button>
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
                                <h4 className="border-bottom pb-3 mb-4">
                                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                                    Daily Production Report
                                </h4>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Date</label>
                                        <input type="date" className="form-control" name="date" 
                                            value={dailyReportData.date} 
                                            onChange={(e) => setDailyReportData({...dailyReportData, date: e.target.value})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Shift</label>
                                        <select className="form-select" name="shift" 
                                            value={dailyReportData.shift} 
                                            onChange={(e) => setDailyReportData({...dailyReportData, shift: e.target.value})}
                                            disabled={processStatus !== 'idle'}
                                        >
                                            <option value="Day Shift">Day Shift</option>
                                            <option value="Night Shift">Night Shift</option>
                                        </select>
                                    </div>
                                </div>

                                <h6 className="mt-4 border-bottom pb-2 text-primary">Metrics</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <label className="form-label">Total Units Processed</label>
                                        <input type="number" className="form-control" name="totalUnitsProcessed" min="0"
                                            value={dailyReportData.totalUnitsProcessed} 
                                            onChange={(e) => setDailyReportData({...dailyReportData, totalUnitsProcessed: parseInt(e.target.value) || 0})} 
                                            required
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Total No Good (NG)</label>
                                        <input type="number" className="form-control" name="totalNG" min="0"
                                            value={dailyReportData.totalNG} 
                                            onChange={(e) => setDailyReportData({...dailyReportData, totalNG: parseInt(e.target.value) || 0})} 
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Total Downtime (minutes)</label>
                                        <input type="number" className="form-control" name="downtimeMinutes" min="0"
                                            value={dailyReportData.downtimeMinutes} 
                                            onChange={(e) => setDailyReportData({...dailyReportData, downtimeMinutes: parseInt(e.target.value) || 0})} 
                                            disabled={processStatus !== 'idle'}
                                        />
                                    </div>
                                </div>
                                
                                <h6 className="mt-4 border-bottom pb-2 text-primary">Summary & Attachments</h6>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Shift Summary & Issues</label>
                                    <textarea className="form-control" rows="4" name="summary" 
                                        value={dailyReportData.summary} 
                                        onChange={(e) => setDailyReportData({...dailyReportData, summary: e.target.value})} 
                                        required
                                        placeholder="Summarize production achievements, bottlenecks, and maintenance needs."
                                        disabled={processStatus !== 'idle'}
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Attach File (Photo/Document)</label>
                                    <input type="file" className="form-control" 
                                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                                        disabled={processStatus !== 'idle'}
                                    />
                                    <small className="form-text text-muted">Max size 2MB. Accepted formats: jpg, png, pdf.</small>
                                </div>

                                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={processStatus !== 'idle'}>
                                        <i className="bi bi-send me-2"></i> Submit Daily Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );

            case "in_progress":
            case "completed":
            case "no_good":
            case "pending":
            case "account_history":
            case "guide":
                // Handles all list views using UnitListTable or placeholder
                return (
                    <UnitListTable 
                        units={unitList} 
                        listStatus={activeTab.replace(/_/g, ' ')}
                        loading={listLoading}
                        error={listError}
                        onEdit={handleEditClick} 
                    />
                );

            default:
                return (
                    <div className="alert alert-info text-center">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        The module **{activeTab.replace(/_/g, ' ')}** is under development.
                    </div>
                );
        }
    };

    return (
        <>
            {/* 1. Full-Screen Status Overlay */}
            <LoadingOverlay status={processStatus} message={statusMessage} />
            
            {/* 2. Edit Modal */}
            {unitToEdit && <EditUnitModal unit={unitToEdit} onClose={() => setUnitToEdit(null)} onSave={handleSaveEdit} />}

            {/* 3. Main Content Container (Bootstrap based) */}
            <div className="d-flex flex-row min-vh-100 bg-light"> 
                
                {/* --- SIDEBAR (Fixed Width) --- */}
                <div 
                    className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm"
                    style={{ width: '250px', position: 'sticky', top: 0, height: '100vh' }}
                >
                    <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <i className="bi bi-wrench-adjustable-circle text-danger fs-4 me-2"></i>
                        <span className="fs-5 fw-bold text-dark">MKFF Portal</span>
                    </div>
                    
                    <nav className="flex-grow-1 overflow-auto">
                        <ul className="nav nav-pills flex-column mb-auto">
                            {/* Primary Navigation */}
                            <li className="nav-item mb-1">
                                <button 
                                    className={`btn w-100 text-start ${activeTab === 'home' ? 'btn-primary' : 'btn-light'}`}
                                    onClick={() => setActiveTab('home')}
                                >
                                    <i className="bi bi-house-door me-3"></i> Home
                                </button>
                            </li>
                            <li className="nav-item mb-3">
                                <button 
                                    className={`btn w-100 text-start ${activeTab === 'input_unit' ? 'btn-primary' : 'btn-light'}`}
                                    onClick={() => setActiveTab('input_unit')}
                                >
                                    <i className="bi bi-pencil-square me-3"></i> Unit Data Entry
                                </button>
                            </li>
                            
                            {/* Unit Management Submenu */}
                            <li className="text-uppercase small fw-bold text-muted mt-3 mb-2">
                                Unit Management
                            </li>
                            {[{ key: 'in_progress', icon: 'bi-hourglass-split', color: 'btn-warning text-dark' },
                              { key: 'completed', icon: 'bi-check-circle', color: 'btn-success' },
                              { key: 'no_good', icon: 'bi-x-circle', color: 'btn-danger' },
                              { key: 'pending', icon: 'bi-clock-history', color: 'btn-info text-dark' }
                            ].map(({ key, icon, color }) => (
                                <li key={key} className="nav-item mb-1">
                                    <button 
                                        className={`btn w-100 text-start ${activeTab === key ? color : 'btn-light text-secondary'}`}
                                        onClick={() => setActiveTab(key)}
                                    >
                                        <i className={`bi ${icon} me-3`}></i> 
                                        {key.replace(/_/g, ' ').toUpperCase()}
                                    </button>
                                </li>
                            ))}

                            {/* Reports Submenu */}
                            <li className="text-uppercase small fw-bold text-muted mt-3 mb-2 border-top pt-3">
                                Reports & Utilities
                            </li>
                            {[{ key: 'daily_reports', icon: 'bi-file-bar-graph' }, // New functional report link
                              { key: 'account_history', icon: 'bi-person-lines-fill' },
                              { key: 'guide', icon: 'bi-book' }
                            ].map(({ key, icon }) => (
                                <li key={key} className="nav-item mb-1">
                                    <button 
                                        className={`btn w-100 text-start ${activeTab === key ? 'btn-secondary text-white' : 'btn-light text-secondary'}`}
                                        onClick={() => setActiveTab(key)}
                                    >
                                        <i className={`bi ${icon} me-3`}></i> 
                                        {key.replace(/_/g, ' ').toUpperCase()}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer / Logout Button (Duplicate in Sidebar for convenience) */}
                    <div className="mt-auto pt-3 border-top">
                        <button 
                            className="btn btn-danger w-100"
                            onClick={onLogout} 
                        >
                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA (Scrollable) --- */}
                <div className="d-flex flex-column flex-grow-1"> 
                    
                    {/* STICKY TOP HEADER (Bootstrap Navbar Style) */}
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm p-3">
                        <div className="container-fluid d-flex justify-content-between w-100">
                            <span className="navbar-brand h4 mb-0 text-white fw-bold">Edge Sensor Assembly Terminal</span>
                            <div className="text-white d-flex align-items-center small">
                                <span className="me-3">{currentUsername} ({CURRENT_STATION})</span>
                                <button 
                                    className="btn btn-sm btn-outline-light" 
                                    onClick={onLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* DYNAMIC TAB CONTENT AREA */}
                    <div className="container-fluid p-4 flex-grow-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
}