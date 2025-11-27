import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios'; 

// Base URL for the API 
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const CURRENT_STATION = "IT_Assistant"; 
const MAX_QR_COUNT = 1000; // Maximum allowed units

// Helper to format a number into a sequential serial string (e.g., 1 -> 00001)
const formatSerial = (num) => String(num).padStart(5, '0');

export default function ITAssistantPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");

    // --- STATE FOR QR GENERATOR ---
    const [qrFormData, setQrFormData] = useState({
        model: "MKFF-X1",
        revision: "REV-01",
        baseKit: "KIT-001",
        assembly: "", // Will be generated automatically
        serial: "",    // Will be generated automatically
        accKit: "ACC-501"
    });
    const [generatedQR, setGeneratedQR] = useState(null);
    const [qrCount, setQrCount] = useState(5); // Simulate starting count of generated QRs (up to 1000)
    const [nextAssemblyNo, setNextAssemblyNo] = useState(106); // Next sequential assembly number

    // --- MOCK LOGS (Simulate data from DB) ---
    const [unscannedUnits, setUnscannedUnits] = useState([
        { id: 1, serial: 'SN-00001', assembly: 'ASSY-101', status: 'ReadyToScan', model: 'MKFF-X1', station: 'N/A' },
        { id: 2, serial: 'SN-00002', assembly: 'ASSY-102', status: 'ReadyToScan', model: 'MKFF-X1', station: 'N/A' },
        { id: 3, serial: 'SN-00003', assembly: 'ASSY-103', status: 'ReadyToScan', model: 'MKFF-X2', station: 'N/A' },
    ]);
    const [pendingApprovals, setPendingApprovals] = useState([
        { id: 101, serial: 'SN-90001', assembly: 'ASSY-901', status: 'Pending Approval', model: 'MKFF-X1', station: 'Station5', remarks: 'Reopened from NG status.' },
        { id: 102, serial: 'SN-90002', assembly: 'ASSY-902', status: 'Pending Approval', model: 'MKFF-X2', station: 'Station8', remarks: 'Requires QA review.' },
    ]);

    // --- DUMMY DATA FOR STATION MONITOR (1-15) ---
    const stations = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Station ${i + 1}`,
        // Random status simulation
        status: Math.random() > 0.8 ? "ERROR" : Math.random() > 0.6 ? "IDLE" : "RUNNING", 
        operator: `Operator-${100 + i}`,
        lastPing: "Just now"
    }));

    // --- QR HANDLERS ---
    const handleGenerateQR = (e) => {
        e.preventDefault();

        if (qrCount >= MAX_QR_COUNT) {
            alert(`Maximum QR limit (${MAX_QR_COUNT}) reached.`);
            return;
        }

        // 1. Generate unique sequential numbers
        const newSerialNum = formatSerial(qrCount + 1);
        const newAssemblyNum = `ASSY-${formatSerial(nextAssemblyNo)}`;

        // 2. Construct the QR string
        const qrString = `${qrFormData.model}|${qrFormData.revision}|${qrFormData.baseKit}|${newAssemblyNum}|${newSerialNum}|${qrFormData.accKit}`;
        
        // 3. Generate QR URL
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
        
        setGeneratedQR({
            string: qrString,
            url: qrUrl,
            assembly: newAssemblyNum,
            serial: newSerialNum,
        });

        // Update the form fields to show the generated values
        setQrFormData(prev => ({
            ...prev,
            assembly: newAssemblyNum,
            serial: newSerialNum
        }));
    };

    const handleSaveToDB = () => {
        if (!generatedQR) {
            alert("Please generate a QR code first.");
            return;
        }

        // 1. Simulate saving the new unit record to a conceptual DB (Updating state)
        const newUnit = {
            id: Date.now(), // Unique ID based on timestamp
            serial: generatedQR.serial,
            assembly: generatedQR.assembly,
            status: 'ReadyToScan', // Initial status for IT-generated units
            model: qrFormData.model,
            station: 'N/A'
        };
        
        setUnscannedUnits(prev => [...prev, newUnit]);

        // 2. Increment counters
        setQrCount(prev => prev + 1);
        setNextAssemblyNo(prev => prev + 1);

        // 3. Notify and Reset
        alert(`Unit ${generatedQR.serial} saved successfully with status: ReadyToScan!`);
        setGeneratedQR(null);
        setQrFormData(prev => ({
            model: prev.model, // Keep model/rev/kit for batch creation
            revision: prev.revision,
            baseKit: prev.baseKit,
            accKit: prev.accKit,
            assembly: "",
            serial: ""
        }));
    };

    // --- APPROVAL HANDLERS ---
    const handleApproveUnit = async (unitId) => {
        const unitToApprove = pendingApprovals.find(u => u.id === unitId);
        if (!unitToApprove) return;

        // 1. Simulate API call (PUT request) to update status
        const dataToSend = {
            ...unitToApprove,
            status: 'In Progress', // Change to In Progress
            remarks: 'Approved by IT Assistant. Re-entry permitted.',
        };

        // Example API call (Mocking success for now)
        // await axios.put(`${UNITS_ENDPOINT}/${unitId}`, dataToSend);

        // 2. Update state: Remove from Pending and place back into Unscanned/Monitoring pool (as In Progress)
        setPendingApprovals(prev => prev.filter(u => u.id !== unitId));
        setUnscannedUnits(prev => [...prev.filter(u => u.id !== unitId), { ...unitToApprove, status: 'In Progress' }]);
        
        alert(`Unit ${unitToApprove.serial} has been approved and moved to In Progress!`);
    };

    // --- RENDER CONTENT ---
    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card text-white bg-primary shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">Generated QRs (Limit: {MAX_QR_COUNT})</h6>
                                    <h2 className="display-6 fw-bold">{qrCount}</h2>
                                    <p className="card-text small">Total units created</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-info shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">Unscanned Units (ReadyToScan)</h6>
                                    <h2 className="display-6 fw-bold">{unscannedUnits.length}</h2>
                                    <p className="card-text small">Awaiting initial scanning on the floor</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-warning shadow-sm h-100">
                                <div className="card-body text-dark">
                                    <h6 className="card-title text-uppercase mb-2">Pending Approval</h6>
                                    <h2 className="display-6 fw-bold">{pendingApprovals.length}</h2>
                                    <p className="card-text small">Needs rework/re-inspection approval</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-white bg-success shadow-sm h-100">
                                <div className="card-body">
                                    <h6 className="card-title text-uppercase mb-2">Network Status</h6>
                                    <h2 className="display-6 fw-bold">Stable</h2>
                                    <p className="card-text small">Uptime: 99.9%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "qr_generator":
                return (
                    <div className="row">
                        <div className="col-md-7">
                            <div className="card shadow-sm">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="mb-0"><i className="bi bi-qr-code me-2"></i>Generate New Unit QR</h5>
                                </div>
                                <div className="card-body">
                                    <div className="alert alert-info small p-2 mb-3">
                                        Current Count: **{qrCount}** / **{MAX_QR_COUNT}**. Next Assembly No: **ASSY-{formatSerial(nextAssemblyNo)}**.
                                    </div>
                                    <form onSubmit={handleGenerateQR}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Model</label>
                                                <input type="text" className="form-control" required 
                                                    value={qrFormData.model} onChange={e => setQrFormData({...qrFormData, model: e.target.value})} placeholder="e.g. MKFF-X1"/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Revision</label>
                                                <input type="text" className="form-control" required
                                                    value={qrFormData.revision} onChange={e => setQrFormData({...qrFormData, revision: e.target.value})} placeholder="e.g. REV-01"/>
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label small fw-bold">Base Unit Kitting No.</label>
                                                <input type="text" className="form-control" required
                                                    value={qrFormData.baseKit} onChange={e => setQrFormData({...qrFormData, baseKit: e.target.value})} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Assembly No. (Generated)</label>
                                                <input type="text" className="form-control bg-light" readOnly
                                                    value={generatedQR?.assembly || `ASSY-${formatSerial(nextAssemblyNo)} (Pending)`} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Serial No. (Generated)</label>
                                                <input type="text" className="form-control bg-light" readOnly
                                                    value={generatedQR?.serial || `SN-${formatSerial(qrCount + 1)} (Pending)`} />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label small fw-bold">Accessory Kitting No.</label>
                                                <input type="text" className="form-control" required
                                                    value={qrFormData.accKit} onChange={e => setQrFormData({...qrFormData, accKit: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-end">
                                            <button type="submit" className="btn btn-primary px-4" disabled={qrCount >= MAX_QR_COUNT}>
                                                <i className="bi bi-gear-wide-connected me-2"></i> Generate QR
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW SECTION */}
                        <div className="col-md-5">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">QR Preview</h5>
                                </div>
                                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                                    {generatedQR ? (
                                        <>
                                            <div className="border p-3 mb-3 bg-white">
                                                <img src={generatedQR.url} alt="QR Code" className="img-fluid" style={{maxHeight: '200px'}} />
                                            </div>
                                            <div className="alert alert-light w-100 text-break font-monospace small border">
                                                **Data String:** {generatedQR.string}
                                            </div>
                                            <button className="btn btn-success w-100 fw-bold" onClick={handleSaveToDB}>
                                                <i className="bi bi-database-add me-2"></i> Save Unit **{generatedQR.serial}** (ReadyToScan)
                                            </button>
                                            <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => window.print()}>
                                                <i className="bi bi-printer me-2"></i> Print Label
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-muted py-5">
                                            <i className="bi bi-qr-code-scan display-1 opacity-25"></i>
                                            <p className="mt-3">Fill the form and click Generate to see preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "station_monitor":
                // IT Assistant monitors stations and units currently not scanned/in production
                const allMonitoredUnits = [...unscannedUnits, ...pendingApprovals];

                return (
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="mb-0"><i className="bi bi-display me-2"></i>Live Station Status (No Action)</h5>
                                </div>
                                <div className="card-body bg-light">
                                    <div className="row g-3">
                                        {stations.map((station) => (
                                            <div key={station.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                                                <div className={`card h-100 border-0 shadow-sm ${
                                                    station.status === 'RUNNING' ? 'border-start border-5 border-success' :
                                                    station.status === 'ERROR' ? 'border-start border-5 border-danger' :
                                                    'border-start border-5 border-secondary'
                                                }`}>
                                                    <div className="card-body p-2">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <span className="fw-bold">{station.name}</span>
                                                            {station.status === 'RUNNING' && <i className="bi bi-activity text-success"></i>}
                                                            {station.status === 'ERROR' && <i className="bi bi-exclamation-triangle-fill text-danger"></i>}
                                                            {station.status === 'IDLE' && <i className="bi bi-pause-circle-fill text-secondary"></i>}
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className={`badge ${
                                                                station.status === 'RUNNING' ? 'bg-success-subtle text-success' :
                                                                station.status === 'ERROR' ? 'bg-danger-subtle text-danger' :
                                                                'bg-secondary-subtle text-dark'
                                                            }`}>
                                                                {station.status}
                                                            </span>
                                                        </div>
                                                        <div className="small text-muted text-truncate">
                                                            <i className="bi bi-person me-1"></i> {station.operator}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Unscanned Units Table */}
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-info text-white">
                                    <h5 className="mb-0"><i className="bi bi-box me-2"></i>Unscanned Inventory (**{unscannedUnits.length}** Units)</h5>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-striped table-sm mb-0">
                                        <thead className="table-light">
                                            <tr><th>Serial No.</th><th>Model</th><th>Assembly No.</th><th>Status</th><th>Station Logged</th></tr>
                                        </thead>
                                        <tbody>
                                            {unscannedUnits.map(unit => (
                                                <tr key={unit.id}>
                                                    <td className="fw-bold">{unit.serial}</td>
                                                    <td>{unit.model}</td>
                                                    <td>{unit.assembly}</td>
                                                    <td><span className="badge bg-primary">ReadyToScan</span></td>
                                                    <td>{unit.station}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case "approvals":
                // IT Assistant Approvals Tab
                return (
                    <div className="card shadow-sm">
                        <div className="card-header bg-warning text-dark">
                            <h5 className="mb-0"><i className="bi bi-shield-check me-2"></i>Pending Rework Approvals (**{pendingApprovals.length}** Units)</h5>
                            <p className="small mb-0">These units were flagged from a final status and require your approval to be moved back to the production line (**In Progress**).</p>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped table-sm mb-0">
                                <thead className="table-light">
                                    <tr><th>Serial No.</th><th>Model</th><th>Assembly No.</th><th>Flagged Station</th><th>Remarks</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {pendingApprovals.length > 0 ? pendingApprovals.map(unit => (
                                        <tr key={unit.id}>
                                            <td className="fw-bold">{unit.serial}</td>
                                            <td>{unit.model}</td>
                                            <td>{unit.assembly}</td>
                                            <td><span className="badge bg-secondary">{unit.station}</span></td>
                                            <td>{unit.remarks}</td>
                                            <td>
                                                <button className="btn btn-sm btn-success py-0" onClick={() => handleApproveUnit(unit.id)}>
                                                    <i className="bi bi-check-circle me-1"></i> Approve (In Progress)
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

            case "maintenance":
                return (
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Maintenance Requests</h5>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Station 1 - Scanner Connectivity Issue
                                <span className="badge bg-warning text-dark">Urgent</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Station 5 - Monitor flickering
                                <span className="badge bg-secondary">Pending</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Admin PC - Printer Setup
                                <span className="badge bg-success">Resolved</span>
                            </li>
                        </ul>
                    </div>
                );

            default:
                return <div className="alert alert-info">Select a menu item</div>;
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: "260px" }}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <i className="bi bi-hdd-rack fs-4 me-2"></i>
                    <span className="fs-5 fw-bold">IT Support</span>
                </a>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'overview' ? 'active bg-primary' : ''}`} onClick={() => setActiveTab('overview')}>
                            <i className="bi bi-speedometer2 me-2"></i> Overview
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'qr_generator' ? 'active bg-primary' : ''}`} onClick={() => setActiveTab('qr_generator')}>
                            <i className="bi bi-qr-code me-2"></i> QR Generator
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'station_monitor' ? 'active bg-primary' : ''}`} onClick={() => setActiveTab('station_monitor')}>
                            <i className="bi bi-display me-2"></i> Station Monitor
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'approvals' ? 'active bg-primary' : ''}`} onClick={() => setActiveTab('approvals')}>
                            <i className="bi bi-shield-check me-2"></i> Approvals
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className={`nav-link text-white text-start w-100 ${activeTab === 'maintenance' ? 'active bg-primary' : ''}`} onClick={() => setActiveTab('maintenance')}>
                            <i className="bi bi-tools me-2"></i> Maintenance
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button className="nav-link text-white text-start w-100">
                            <i className="bi bi-wifi me-2"></i> Network Logs
                        </button>
                    </li>
                </ul>
                <hr />
                <div className="dropdown">
                    <div className="d-flex align-items-center text-white text-decoration-none">
                        <i className="bi bi-person-circle fs-4 me-2"></i>
                        <strong>{user.username}</strong>
                    </div>
                    <button onClick={onLogout} className="btn btn-outline-danger w-100 btn-sm mt-2">Logout</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 p-4 overflow-auto">
                <h2 className="mb-4 text-capitalize border-bottom pb-2">{activeTab.replace(/_/g, ' ')}</h2>
                {renderContent()}
            </div>
        </div>
    );
}