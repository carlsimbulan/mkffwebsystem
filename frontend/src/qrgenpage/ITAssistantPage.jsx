import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import 'bootstrap-icons/font/bootstrap-icons.css';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const UNITS_ENDPOINT = `${API_BASE_URL}/units.php`;
const HISTORY_ENDPOINT = `${API_BASE_URL}/unit_history.php`; 
const MAX_QR_COUNT = 100;
const USER_ENDPOINT = `${API_BASE_URL}/user_management.php`; 

// Helper Functions
const formatSerial = (num) => String(num).padStart(5, '0');
const safeParseSerial = (serialStr, prefix) => {
    const numStr = serialStr?.replace(prefix, '') || '0';
    return parseInt(numStr, 10) || 0;
};
const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
};

// --- UTILITY COMPONENTS (MODALS & OVERLAYS) ---

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
        <div className={`position-fixed w-100 h-100 top-0 start-0 ${bgColor} d-flex justify-content-center align-items-center z-3`} style={{ zIndex: 1060 }}>
            <div className="bg-white p-5 rounded shadow text-center" style={{ minWidth: '300px' }}>
                <div className="mb-3">
                    {spinnerVisible ? <div className="spinner-border text-primary" role="status"></div> : <i className={`${iconClass} fs-1`}></i>}
                </div>
                <h4 className="fw-bold text-dark mb-1">{statusText}</h4>
                <p className="text-muted small">{message}</p>
            </div>
        </div>
    );
};

const CustomMessageModal = ({ title, message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-info'; 
    const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-x-octagon-fill' : 'bi-info-circle-fill';

    return (
        <div className="modal d-block animate-in fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                    <div className={`modal-header ${bgColor} text-white border-0 rounded-top-2`} style={{ borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <i className={`${icon} me-2`}></i> {title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <p className="mb-0 text-dark fw-medium">{message}</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MONITORING VIEW COMPONENTS ---

const StationHistoryModal = ({ stationId, onClose, user }) => {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    
    // NOTE: Ang filterAssemblyNo ay gagamitin na sa FE filtering muna dahil sa structure ng inyong API call.
    const [filterAssemblyNo, setFilterAssemblyNo] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState(getTodayDate());

    // --- REVISED FETCH HISTORY LOGIC ---
    // Fetch all history for the station, then filter on the client side based on user input.
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            // Fetch all logs for the station first (assuming API supports station filter)
            const response = await axios.get(HISTORY_ENDPOINT, { params: { station: stationId } });
            // Reverse the array to show most recent logs first
            const logs = Array.isArray(response.data) ? response.data.reverse() : [];
            setHistoryLogs(logs);
        } catch (err) {
            setHistoryError(`Failed to fetch history: ${err.message}.`);
        } finally {
            setHistoryLoading(false);
        }
    }, [stationId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    // --- REVISED CLIENT-SIDE FILTERING LOGIC ---
    const filteredLogs = React.useMemo(() => {
        let logs = historyLogs;

        // 1. Filter by Assembly No.
        if (filterAssemblyNo) {
            const search = filterAssemblyNo.toLowerCase();
            logs = logs.filter(log => log.assembly_no?.toLowerCase().includes(search));
        }

        // 2. Filter by Date Range
        if (filterStartDate || filterEndDate) {
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp || log.created_at);
                logDate.setHours(0, 0, 0, 0);

                let matchesDate = true;
                if (filterStartDate) {
                    const start = new Date(filterStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (logDate < start) matchesDate = false;
                }
                if (filterEndDate) {
                    const end = new Date(filterEndDate);
                    end.setHours(0, 0, 0, 0);
                    // Add 1 day to end date filter to include logs from that day
                    end.setDate(end.getDate() + 1); 
                    if (logDate >= end) matchesDate = false;
                }
                return matchesDate;
            });
        }
        return logs;

    }, [historyLogs, filterAssemblyNo, filterStartDate, filterEndDate]);
    
    // Helper function for status badges (Replicated from previous response)
    const getStatusClass = (status) => {
        if (status?.includes('Completed') || status?.includes('OK')) return 'bg-success bg-opacity-10 text-success';
        if (status?.includes('No Good') || status?.includes('Error') || status?.includes('Failed')) return 'bg-danger bg-opacity-10 text-danger';
        if (status?.includes('Progress') || status?.includes('Pending')) return 'bg-warning bg-opacity-10 text-warning text-dark';
        return 'bg-secondary bg-opacity-10 text-secondary';
    };

    return (
        <div className="modal d-block animate-in fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                    <div className="modal-header bg-dark text-white border-0">
                        <h5 className="modal-title fw-bold"><i className="bi bi-clock-history me-2"></i> History Logs for: {stationId}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        
                        {/* --- FILTER BAR --- */}
                        <div className="card mb-4 p-3 border-0 bg-light">
                            <div className="row g-3 align-items-center small">
                                <div className="col-md-4">
                                    <label className="form-label mb-0 fw-bold">Assembly No. Search:</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        placeholder="ASSY-00001"
                                        value={filterAssemblyNo}
                                        onChange={(e) => setFilterAssemblyNo(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label mb-0 fw-bold">Date From:</label>
                                    <input 
                                        type="date" 
                                        className="form-control form-control-sm" 
                                        value={filterStartDate}
                                        onChange={(e) => setFilterStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label mb-0 fw-bold">Date To:</label>
                                    <input 
                                        type="date" 
                                        className="form-control form-control-sm" 
                                        value={filterEndDate}
                                        onChange={(e) => setFilterEndDate(e.target.value)}
                                        max={getTodayDate()}
                                    />
                                </div>
                                <div className="col-md-2 d-flex justify-content-end">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary w-100 mt-3" 
                                        onClick={() => { setFilterAssemblyNo(''); setFilterStartDate(''); setFilterEndDate(getTodayDate()); }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                            <div className="text-muted small mt-2 pt-2 border-top">
                                Showing <span className="fw-bold text-dark">{filteredLogs.length}</span> of {historyLogs.length} total records.
                            </div>
                        </div>

                        {/* --- HISTORY TABLE --- */}
                        {historyLoading && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-3 text-muted fw-bold">Loading records...</p></div>}
                        {historyError && <div className="alert alert-danger m-3">{historyError}</div>}
                        
                        {!historyLoading && !historyError && (
                            <div className="table-responsive border rounded-3 overflow-hidden" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover table-striped mb-0 align-middle small">
                                    <thead className="table-dark sticky-top" style={{zIndex: 5}}>
                                        <tr>
                                            <th className="py-2 ps-3 text-uppercase" style={{ fontSize: '0.75rem' }}>Unit / Model</th>
                                            <th className="py-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Assembly No.</th>
                                            <th className="py-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Action Type</th>
                                            <th className="py-2 text-center text-uppercase" style={{ fontSize: '0.75rem' }}>Status After</th>
                                            <th className="py-2 text-uppercase" style={{ fontSize: '0.75rem' }}>User</th>
                                            <th className="py-2 text-end pe-3 text-uppercase" style={{ fontSize: '0.75rem' }}>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length > 0 ? filteredLogs.map(log => {
                                            const status = log.status_after;
                                            const isSuccess = status?.includes('Completed') || status?.includes('OK');
                                            const isError = status?.includes('No Good') || status?.includes('Failed');
                                            
                                            return (
                                                <tr key={log.history_id}>
                                                    {/* Unit / Model */}
                                                    <td className="ps-3">
                                                        <div className="fw-bold text-dark">{log.model || 'N/A'}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>ID: #{log.unit_id || log.id}</div>
                                                    </td>
                                                    {/* Assembly No. */}
                                                    <td>
                                                        <span className="font-monospace fw-bold text-primary">{log.assembly_no || '-'}</span>
                                                    </td>
                                                    {/* Action Type */}
                                                    <td>
                                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 px-2 py-1 fw-normal text-uppercase" style={{ fontSize: '0.7rem' }}>
                                                            {log.action_type || 'UPDATE'}
                                                        </span>
                                                    </td>
                                                    {/* Status After */}
                                                    <td className="text-center">
                                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusClass(status)}`}>
                                                            {isSuccess && <i className="bi bi-check-circle-fill me-1"></i>}
                                                            {isError && <i className="bi bi-x-circle-fill me-1"></i>}
                                                            {!isSuccess && !isError && <i className="bi bi-hourglass-split me-1"></i>}
                                                            {status}
                                                        </span>
                                                    </td>
                                                    {/* User */}
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                            <span className="text-dark fw-bold" style={{fontSize: '0.85rem'}}>{log.action_by || 'System'}</span>
                                                        </div>
                                                    </td>
                                                    {/* Timestamp */}
                                                    <td className="text-end pe-3">
                                                        <div className="fw-bold text-dark small">
                                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            {new Date(log.timestamp).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="6" className="text-center py-5 text-muted">No historical records match your search criteria.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .sticky-top { top: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
};

const UnscannedUnitsTable = ({ unscannedUnits }) => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-light border-0">
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-box me-2 text-primary"></i>Units For Initial Scanning (**{unscannedUnits.length}** Units)</h5>
            <p className="small text-muted mb-0">These units have been created and are ready for the production floor (Station 1).</p>
        </div>
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-striped table-sm mb-0 small align-middle">
                <thead className="table-light sticky-top">
                    {/* --- REVISED HEADERS for UnscannedUnitsTable --- */}
                    <tr>
                        <th className="fw-bold">Assembly No.</th>
                        <th>Model</th>
                        <th>Revision</th>
                        <th>Base Unit Kitting No.</th>
                        <th>Accessory Kitting No.</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {unscannedUnits.length > 0 ? unscannedUnits.map(unit => (
                        <tr key={unit.id}>
                            {/* --- REVISED DATA for UnscannedUnitsTable --- */}
                            <td className="fw-bold text-primary">{unit.assembly_no}</td>
                            <td>{unit.model}</td>
                            <td>{unit.revision}</td>
                            <td>{unit.base_unit_kitting_no}</td>
                            <td>{unit.accessory_kitting_no || 'N/A'}</td>
                            <td><span className="badge bg-info text-dark fw-bold">For Scanning</span></td>
                            <td>{new Date(unit.created_at).toLocaleString()}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="7" className="text-center py-4 text-muted">No units currently require initial scanning.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- REVISED: LiveMonitoringTable (Added KPI Cards) ---
const LiveMonitoringTable = ({ stationId, units, onBack, calculateStationMetrics }) => {
    // Retain filtering logic to show units currently logged at this station
    const stationUnits = units.filter(u => u.station === stationId && u.status !== 'For Scanning');
    
    // Calculate metrics for this specific station
    const metrics = calculateStationMetrics(stationUnits);

    // Helper function for status badges
    const getStatusClass = (status) => {
        if (status === 'In Progress') return 'bg-primary';
        if (status === 'Completed') return 'bg-success';
        if (status === 'No Good (NG)' || status === 'Pending Approval') return 'bg-danger';
        return 'bg-secondary';
    };

    const cardData = [
        { title: "Completed", value: metrics.completed, color: "success", icon: "bi-check-circle-fill", subtitle: "Total Units Completed" },
        { title: "In Progress", value: metrics.inProgress, color: "primary", icon: "bi-hourglass-split", subtitle: "Units Currently Active" },
        { title: "No Good (NG)", value: metrics.noGood, color: "danger", icon: "bi-exclamation-octagon-fill", subtitle: "Total Defects" },
        { title: "Yield Rate", value: `${metrics.yieldRate}%`, color: "info", icon: "bi-graph-up-arrow", subtitle: "Success Ratio", textColor: "text-primary" }
    ];

    return (
        <div className="animate-in fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h4 className="mb-0 fw-bold text-primary"><i className="bi bi-activity me-2"></i>Live Units at {stationId}</h4>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onBack}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Grid View
                </button>
            </div>

            {/* NEW: KPI Cards for the Station */}
            <div className="row g-4 mb-4">
                {cardData.map((card, index) => (
                    <div className="col-md-3" key={index}>
                        <div 
                            className={`card border-0 shadow-sm h-100 border-start border-4 border-${card.color}`}
                            style={{ borderRadius: '12px' }}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div 
                                        className={`bg-${card.color} bg-opacity-10 text-${card.color} rounded-3 p-3 d-flex align-items-center justify-content-center`} 
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <i className={`${card.icon} fs-4`}></i>
                                    </div>
                                    <span className={`badge bg-${card.color} bg-opacity-10 text-${card.color} rounded-pill px-2 py-1 small fw-normal`}>
                                        {card.title.toUpperCase()}
                                    </span>
                                </div>
                                <h2 className={`fw-bold mb-0 display-6 ${card.textColor || 'text-dark'}`}>{card.value}</h2>
                                <span 
                                    className="text-muted text-uppercase small fw-bold" 
                                    style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                                >
                                    {card.subtitle}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Live Units Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <table className="table table-striped table-sm mb-0 small align-middle">
                        <thead className="table-dark sticky-top">
                            {/* --- REVISED TABLE HEADERS START HERE --- */}
                            <tr>
                                <th className="fw-bold">Model</th>
                                <th>Revision</th>
                                <th>Base Unit Kitting No.</th>
                                <th className="fw-bold">Assembly No.</th>
                                <th>Device Serial No.</th>
                                <th>Accessory Kitting No.</th>
                                <th>Status</th>
                                <th>Remarks</th>
                            </tr>
                            {/* --- REVISED TABLE HEADERS END HERE --- */}
                        </thead>
                        <tbody>
                            {stationUnits.length > 0 ? stationUnits.map(unit => (
                                <tr key={unit.id}>
                                    {/* --- REVISED TABLE DATA CELLS START HERE --- */}
                                    <td>{unit.model}</td>
                                    <td>{unit.revision}</td>
                                    <td>{unit.base_unit_kitting_no || 'N/A'}</td>
                                    <td className="fw-bold text-primary">{unit.assembly_no}</td>
                                    <td>{unit.device_serial_no || <span className="text-muted fst-italic">Pending</span>}</td>
                                    <td>{unit.accessory_kitting_no || 'N/A'}</td>
                                    <td><span className={`badge ${getStatusClass(unit.status)}`}>{unit.status}</span></td>
                                    <td><small className="text-muted">{unit.remarks || 'N/A'}</small></td>
                                    {/* --- REVISED TABLE DATA CELLS END HERE --- */}
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-4 text-muted">No live units currently logged at this station.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const GeneratedQRList = ({ list, onSave, onDiscard, isSaving }) => {
    if (list.length === 0) return null;
    
    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area-wrapper').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print QR Batch</title>');
        printWindow.document.write(`
            <style>
                @page { size: A4; margin: 5mm; } 
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .qr-item-label {
                    display: inline-block;
                    width: 95mm; 
                    height: 50mm; 
                    border: 1px solid #000; 
                    margin: 2mm;
                    padding: 3mm;
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    float: left; 
                    overflow: hidden;
                    font-size: 8pt;
                    line-height: 1.2;
                }
                .qr-img-print { max-width: 40mm; height: auto; float: left; margin-right: 5mm; }
                .qr-text-print { text-align: left; float: left; width: 50mm; }
                .qr-text-print strong { font-size: 14pt; display: block; margin-bottom: 2px; color: #000; }
                .tag-label { font-size: 8pt; color: #555; text-transform: uppercase; display: inline-block; width: 15mm; }
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
        <div className="mt-4 border-top pt-4 animate-in fade-in">
            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-file-earmark-check me-2 text-success"></i>Generated Batch Preview & Actions ({list.length} units)</h5>

            <div className="d-flex mb-3 gap-3">
                <button className="btn btn-primary fw-bold flex-grow-1 rounded-pill px-4" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print All Labels
                </button>
                <button className="btn btn-success fw-bold flex-grow-1 rounded-pill px-4" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <span><span className="spinner-border spinner-border-sm me-2"></span>Saving...</span> : <span><i className="bi bi-database-add me-2"></i> Save Batch to DB</span>}
                </button>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onDiscard} disabled={isSaving}>
                    <i className="bi bi-trash"></i> Discard
                </button>
            </div>

            <div className="bg-light p-3 border rounded shadow-sm" style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                <p className="small text-danger fw-bold w-100 mb-2">
                    Start Assembly No: **{list[0]?.assembly_no}** | **{list.length}** QRs generated (Serial No. is BLANK)
                </p>
                
                <div id="qr-print-area-wrapper" style={{ display: 'none' }}>
                     {list.map((unit, index) => (
                        <div key={unit.id || index} className="qr-item-label bg-white shadow-sm">
                            <img src={unit.qr_url} alt="QR" className="qr-img-print" />
                            <div className="qr-text-print">
                                <strong>{unit.assembly_no}</strong>
                                <div><span className="tag-label">Model:</span> {unit.model || 'N/A'}</div>
                                <div><span className="tag-label">Rev:</span> {unit.revision || '-'}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {list.map((unit, index) => (
                    <div key={unit.id || index} className="bg-white border rounded p-2" style={{ flex: '0 0 calc(25% - 5px)', minWidth: '150px', maxWidth: '250px', textAlign: 'center' }}>
                        <img src={unit.qr_url} alt="QR" style={{ maxWidth: '80px', marginBottom: '5px' }} />
                        <div className="small">
                            <strong className="d-block text-dark" style={{ fontSize: '0.9rem' }}>{unit.assembly_no}</strong>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Model: {unit.model || 'N/A'}</span>
                        </div>
                    </div>
                ))}

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

    // --- REVISED: METRICS for Overview ---
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
        
        const totalTracked = logs.length;
        
        return {
            ...counts,
            totalTracked: totalTracked,
            // Calculate percentage relative to totalTracked (for the cards)
            pctCompleted: totalTracked > 0 ? ((counts.completed / totalTracked) * 100).toFixed(1) : '0.0',
            pctInProgress: totalTracked > 0 ? ((counts.inProgress / totalTracked) * 100).toFixed(1) : '0.0',
            pctNoGood: totalTracked > 0 ? ((counts.noGood / totalTracked) * 100).toFixed(1) : '0.0',
            pctForScanning: totalTracked > 0 ? ((counts.forScanning / totalTracked) * 100).toFixed(1) : '0.0',
        };
    };

    // --- NEW: METRICS for Station Details ---
    const calculateStationMetrics = (stationLogs) => {
        const completed = stationLogs.filter(u => u.status === 'Completed').length;
        const inProgress = stationLogs.filter(u => u.status === 'In Progress').length;
        const noGood = stationLogs.filter(u => u.status === 'No Good (NG)').length;
        const totalOutput = completed + noGood;
        
        return {
            completed: completed,
            inProgress: inProgress,
            noGood: noGood,
            totalOutput: totalOutput,
            yieldRate: totalOutput > 0 ? ((completed / totalOutput) * 100).toFixed(1) : '0.0',
        };
    };

    // --- FETCH DATA ---
    const fetchUnitData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setError(null);
        try {
            const unitsRes = await axios.get(UNITS_ENDPOINT);
            const fetchedUnits = Array.isArray(unitsRes.data) ? unitsRes.data : [];
            setUnitLogs(fetchedUnits);

            // Fetch user list (to ensure we have the latest full_name and email)
            const userRes = await axios.get(USER_ENDPOINT);
            const fetchedUsers = Array.isArray(userRes.data) ? userRes.data : [];
            const currentUser = fetchedUsers.find(u => u.username === user.username);
            
            // Update user object with fetched data
            if (currentUser) {
                user.full_name = currentUser.full_name;
                user.email = currentUser.email;
            }

            if (fetchedUnits.length > 0) {
                let maxSerial = 0;
                let maxAssembly = 0;

                fetchedUnits.forEach(unit => {
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
            console.error("Error fetching data:", err);
            setError("Failed to fetch production data.");
        } finally {
            if (isInitial) {
                setLoading(false);
                setIsInitialLoadComplete(true); 
            }
        }
    }, [user]); // Depend on user to ensure profile data is fetched

    useEffect(() => {
        // Define Stations 1-15 (Kept for monitoring view)
        const mockStations = Array.from({ length: 15 }, (_, i) => ({
            id: `Station ${i + 1}`, // Matches DB station names
            name: `Station ${i + 1}`,
            operator: `Operator-${100 + i}`,
            status: "ACTIVE", 
        }));
        setStations(mockStations);
        fetchUnitData(true);
    }, [fetchUnitData]);

    useEffect(() => {
        if (isInitialLoadComplete) {
            // Poll every 10 seconds for real-time updates
            const interval = setInterval(() => fetchUnitData(false), 10000); 
            return () => clearInterval(interval);
        }
    }, [isInitialLoadComplete, fetchUnitData]);
    
    // --- HANDLERS (Logic Retained) ---
    const handleGenerateQR = (e) => {
        e.preventDefault();
        const quantity = parseInt(qrFormData.quantity, 10) || 0;
        
        if (isNaN(quantity) || quantity < 1 || quantity > MAX_QR_COUNT) { 
            setModalConfig({ title: "Error", message: `Batch quantity must be between 1 and ${MAX_QR_COUNT}.`, type: "error" });
            setShowModal(true);
            return;
        }

        const newQRList = [];
        let currentAssembly = nextAssemblyNo; 

        for (let i = 0; i < quantity; i++) {
            if (currentAssembly > 999999) break;

            const newAssemblyNum = `ASSY-${formatSerial(currentAssembly)}`; 
            const newSerialNum = ""; // BLANK
            const model = qrFormData.model?.trim() || "";
            const rev = qrFormData.revision?.trim() || "";
            const base = qrFormData.baseKit?.trim() || "";
            const acc = qrFormData.accKit?.trim() || "";

            const qrString = `${model}|${rev}|${base}|${newAssemblyNum}|${newSerialNum}|${acc}`;
            
            newQRList.push({
                id: Date.now() + i, 
                device_serial_no: newSerialNum, 
                assembly_no: newAssemblyNum, 
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
        if (generatedQRList.length === 0) return;
        
        setIsSaving(true);
        
        try {
            const promises = generatedQRList.map(unit => {
                return axios.post(UNITS_ENDPOINT, {
                    ...unit,
                    action: 'create', 
                    username: user.username,
                    station: 'N/A', 
                    status: 'For Scanning'
                });
            });

            await Promise.all(promises);

            setModalConfig({ 
                title: "Batch Save Successful", 
                message: `${generatedQRList.length} unique assembly QRs saved successfully!`, 
                type: "success" 
            });
            setShowModal(true);
            setGeneratedQRList([]);
            fetchUnitData(false); 

        } catch (error) {
            console.error("Batch Unit Save Failed:", error);
            setModalConfig({ 
                title: "Save Failed", 
                message: `Failed to save units. Check console for details.`, 
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
            let parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed < 1) parsed = 1;
            if (parsed > MAX_QR_COUNT) parsed = MAX_QR_COUNT; // Enforce max limit
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
                model: unit.model,
                assemblyNo: unit.assembly_no
            };
            
             await axios.post(`${UNITS_ENDPOINT}?method=PUT`, dataToSend, {
                headers: { 'Content-Type': 'application/json' }
            });

            setModalConfig({ title: "Success", message: `Unit approved!`, type: "success" });
            setShowModal(true);
            fetchUnitData(false);
        } catch (error) {
            setModalConfig({ title: "Approval Failed", message: `Could not approve unit.`, type: "error" });
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };
    
    const handleMonitorHistory = (stationId) => { setActiveHistoryStation(stationId); }
    const handleMonitorStationDetails = (stationId) => { setActiveMonitorStationId(stationId); setActiveTab('station_details'); }
    
    // --- RENDER CONTENT ---
    const renderContent = () => {
        const metrics = calculateMetrics(unitLogs);
        const unitsForScanning = unitLogs.filter(u => u.status === 'For Scanning');
        const pendingApprovalLogs = unitLogs.filter(u => u.status === 'Pending Approval');
        
        if (loading && !isInitialLoadComplete) return <div className="text-center py-5">Loading production data...</div>;
        if (error) return <div className="alert alert-danger">{error}</div>;

        switch (activeTab) {
            case "overview":
                // Updated cardData to use percentages
                const cardData = [
                    { title: "For Scanning", value: metrics.forScanning, color: "info", icon: "bi-qr-code-scan", subtitle: `(${metrics.pctForScanning}% of Total)`, percentage: metrics.pctForScanning, textColor: "text-dark" },
                    { title: "In Progress", value: metrics.inProgress, color: "primary", icon: "bi-hourglass-split", subtitle: `(${metrics.pctInProgress}% of Total)`, percentage: metrics.pctInProgress },
                    { title: "Completed", value: metrics.completed, color: "success", icon: "bi-check-circle-fill", subtitle: `(${metrics.pctCompleted}% of Total)`, percentage: metrics.pctCompleted },
                    { title: "No Good (NG)", value: metrics.noGood, color: "danger", icon: "bi-exclamation-octagon-fill", subtitle: `(${metrics.pctNoGood}% of Total)`, percentage: metrics.pctNoGood }
                ];

                return (
                    <div className="row g-4 animate-in fade-in">
                         {/* --- NEW: Total Units Card (Admin-style) --- */}
                         <div className="col-md-3">
                            <div className="card border-0 shadow-sm h-100 border-start border-4 border-dark" style={{ borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div 
                                            className={`bg-dark bg-opacity-10 text-dark rounded-3 p-3 d-flex align-items-center justify-content-center`} 
                                            style={{ width: '50px', height: '50px' }}
                                        >
                                            <i className={`bi bi-box-fill fs-4`}></i>
                                        </div>
                                        <span className={`badge bg-dark text-white rounded-pill px-2 py-1 small fw-normal`}>
                                            100% Tracked
                                        </span>
                                    </div>
                                    <h2 className={`fw-bold mb-0 display-6 text-dark`}>{metrics.totalTracked}</h2>
                                    <span 
                                        className="text-muted text-uppercase small fw-bold" 
                                        style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                                    >
                                        Total Units Tracked
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* --- 1. Stats Cards (with visible percentages) --- */}
                        {cardData.map((card, index) => (
                            <div className="col-md-3" key={index}>
                                <div 
                                    className={`card border-0 shadow-sm h-100 border-start border-4 border-${card.color}`}
                                    style={{ borderRadius: '12px' }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div 
                                                className={`bg-${card.color} bg-opacity-10 text-${card.color} rounded-3 p-3 d-flex align-items-center justify-content-center`} 
                                                style={{ width: '50px', height: '50px' }}
                                            >
                                                <i className={`${card.icon} fs-4`}></i>
                                            </div>
                                            {/* Increased visibility of percentage */}
                                            <span className={`badge bg-${card.color} text-white rounded-pill px-3 py-2 fw-bolder`} style={{ fontSize: '0.9rem' }}>
                                                {card.percentage}%
                                            </span>
                                        </div>
                                        <h2 className={`fw-bold mb-0 display-6 ${card.textColor || 'text-dark'}`}>{card.value}</h2>
                                        <span 
                                            className="text-muted text-uppercase small fw-bold" 
                                            style={{ fontSize: '0.7rem', letterSpacing: '1px' }}
                                        >
                                            {card.title} {card.subtitle}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Shifting cardData (4 cards) to fill the remaining 3 columns, if Total Units is added. */}
                        {/* We will adjust the layout to fit 4 cards total (Total Units + 3 other key metrics) if needed, but for now, I'll keep the current 4 data cards and add the Total Unit card. */}


                        {/* --- 2. Pending Approval Alert (Shadow Reduced) --- */}
                        {metrics.pendingApproval > 0 && (
                            <div className="col-12">
                                <div 
                                    className="alert alert-warning d-flex justify-content-between align-items-center shadow-sm border-start border-4 border-danger" 
                                    role="alert"
                                    style={{ borderRadius: '12px' }}
                                >
                                    <h5 className="mb-0 text-dark fw-bold">
                                        <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i> 
                                        {metrics.pendingApproval} UNITS AWAITING APPROVAL!
                                    </h5>
                                    <button 
                                        className="btn btn-sm btn-danger px-3 rounded-pill fw-bold" 
                                        onClick={() => setActiveTab('approvals')}
                                    >
                                        <i className="bi bi-eye me-2"></i> Review Approvals
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- 3. Unscanned Units Table (Shadow Reduced) --- */}
                        <div className="col-12 mt-4">
                            <UnscannedUnitsTable unscannedUnits={unitsForScanning} />
                        </div>
                    </div>
                );

            case "qr_generator":
                const currentQuantity = parseInt(qrFormData.quantity, 10) || 0;
                const isFormInvalid = currentQuantity < 1 || currentQuantity > MAX_QR_COUNT; 

                return (
                    <div className="row g-4 animate-in fade-in">
                        <div className="col-md-12">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                <div className="card-header bg-dark text-white border-0 rounded-top-2">
                                    <h5 className="mb-0 fw-bold"><i className="bi bi-qr-code me-2"></i>Generate Unique Assembly QR Batch</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="alert alert-primary small p-3 mb-4 border-primary bg-opacity-10 border-start border-4">
                                        <h6 className="fw-bold mb-1 text-primary"><i className="bi bi-info-circle-fill me-2"></i>Auto-Generation Info</h6>
                                        <p className="mb-1">
                                            Only **Assembly No.** will be auto-generated sequentially.
                                        </p>
                                        <p className="mb-0">
                                            Next Assembly No: <strong className="fs-6 text-dark bg-light px-2 py-1 rounded">ASSY-{formatSerial(nextAssemblyNo)}</strong>
                                        </p>
                                    </div>
                                    <form onSubmit={handleGenerateQR}>
                                        <div className="row g-3">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label fw-bold text-dark">How many QRs to generate? (Max: {MAX_QR_COUNT})</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control form-control-lg fw-bold border-primary" 
                                                    name="quantity" 
                                                    required 
                                                    min="1" 
                                                    max={MAX_QR_COUNT} 
                                                    value={qrFormData.quantity} 
                                                    onChange={handleSaveInput} 
                                                    placeholder="Enter quantity (e.g. 50)"
                                                />
                                            </div>
                                            <hr className="my-4 text-muted" />
                                            <p className="small text-muted mb-2 fst-italic fw-bold text-uppercase">Optional Fields (Will be embedded in the QR data string)</p>
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
                                        <div className="mt-4 pt-3 border-top text-end">
                                            <button type="submit" className="btn btn-primary px-4 btn-lg rounded-pill fw-bold" disabled={isFormInvalid}>
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
        return <LiveMonitoringTable stationId={activeMonitorStationId} units={unitLogs} onBack={() => { setActiveTab('station_monitor'); setActiveMonitorStationId(null); }} calculateStationMetrics={calculateStationMetrics} />;

            case "station_monitor":
                // 1. Filter units to include only those with a specific assembly_no (assuming this maps to a production station)
                // and exclude those 'For Scanning' or 'N/A' as before.
                const productionUnits = unitLogs.filter(u => u.status !== 'For Scanning' && u.assembly_no !== 'N/A');

                return (
                    <div className="row g-4 animate-in fade-in">
                        <div className="col-12">
                            <h4 className="mb-4 fw-bold text-dark"><i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>Production Stations Monitor</h4>
                            <div className="row g-3">
                                {stations.map((station) => {
                                    // 2. Filter units by the station.id field (assuming station.id holds the assembly number)
                                    // NOTE: This logic assumes unit.station field holds the station name, not unit.assembly_no
                                    const stationUnits = productionUnits.filter(u => u.station === station.id);

                                    // 3. Status checks still use the 'status' field, which is in your table structure.
                                    const inProgressCount = stationUnits.filter(u => u.status === 'In Progress').length;
                                    const completedCount = stationUnits.filter(u => u.status === 'Completed').length;
                                    const ngCount = stationUnits.filter(u => u.status === 'No Good (NG)').length;
                                    
                                    let statusText = "IDLE";
                                    let statusClass = "bg-secondary";
                                    
                                    if (inProgressCount > 0) {
                                        statusText = `${inProgressCount} UNITS ACTIVE`;
                                        statusClass = "bg-primary"; 
                                    } else if (completedCount > 0) {
                                        statusText = `${completedCount} UNITS COMPLETED`;
                                        statusClass = "bg-success";
                                    } else if (ngCount > 0) {
                                        statusText = `${ngCount} DEFECTS`;
                                        statusClass = "bg-danger";
                                    }
                                    
                                    return (
                                        <div key={station.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                                            <div className={`card h-100 border-0 shadow-sm border-start border-4 ${statusClass === 'bg-secondary' ? 'border-secondary' : statusClass === 'bg-primary' ? 'border-primary' : statusClass === 'bg-success' ? 'border-success' : 'border-danger'}`} style={{ borderRadius: '12px' }}>
                                                <div className="card-body p-3">
                                                    <h6 className="fw-bold mb-1 text-dark">{station.name}</h6>
                                                    <span className={`badge mb-2 ${statusClass} text-white fw-bold`}>{statusText}</span>
                                                    <p className="small text-muted mb-2 lh-sm">{station.operator || 'Unassigned'}</p>
                                                </div>
                                                <div className="card-footer bg-light p-2 d-flex justify-content-between border-top">
                                                    <button className="btn btn-primary btn-sm py-1 flex-grow-1 me-1 rounded-pill" style={{fontSize: '0.75rem'}} onClick={() => handleMonitorStationDetails(station.id)}>
                                                        <i className="bi bi-eye me-1"></i>Monitor
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm py-1 rounded-pill" style={{fontSize: '0.75rem'}} onClick={() => handleMonitorHistory(station.id)}>
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
                return (
                    <div className="card border-0 shadow-sm animate-in fade-in" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-danger text-white border-0 rounded-top-2">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-shield-check me-2"></i>Pending Rework Approvals (**{pendingApprovalLogs.length}** Units)</h5>
                            <p className="small mb-0 text-white-50">Review and approve units set for rework or re-entry.</p>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <table className="table table-striped table-sm mb-0 align-middle">
                                <thead className="table-light sticky-top">
                                    <tr><th>Serial No.</th><th>Model</th><th>Assembly No.</th><th>Station</th><th>Remarks</th><th className="text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    {pendingApprovalLogs.length > 0 ? pendingApprovalLogs.map(unit => (
                                        <tr key={unit.id} className="table-warning">
                                            <td className="fw-bold">{unit.device_serial_no || '(No Serial)'}</td>
                                            <td>{unit.model}</td>
                                            <td>{unit.assembly_no}</td>
                                            <td><span className="badge bg-secondary">{unit.station}</span></td>
                                            <td>{unit.remarks}</td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-success py-1 px-3 rounded-pill fw-bold" onClick={() => handleApproveUnit(unit)}>
                                                    <i className="bi bi-check-circle me-1"></i> Approve
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">No units currently require approval.</td></tr>
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
            {/* --- 1. SIDEBAR (Fixed, Dark Blue, Scrollable) --- */}
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white" style={{ 
                width: "260px", 
                backgroundColor: "#111827", 
                height: '100vh', 
                position: 'fixed', 
                top: 0, 
                bottom: 0, 
                zIndex: 1000, 
                overflowY: 'auto'
            }}>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <i className="bi bi-hdd-rack fs-4 me-2 text-danger"></i>
                    <span className="fs-5 fw-bold">IT Support</span>
                </a>
                <hr className="text-white-50"/>
                
                {/* NAVIGATION */}
                <ul className="nav nav-pills flex-column mb-auto gap-2 flex-grow-1">
                    <li className="nav-item"><button className={`nav-link text-white text-start w-100 fw-bold ${activeTab === 'overview' ? 'active bg-danger' : 'hover-danger-bg'}`} onClick={() => setActiveTab('overview')}><i className="bi bi-speedometer2 me-2"></i> Overview</button></li>
                    <li className="nav-item"><button className={`nav-link text-white text-start w-100 fw-bold ${activeTab === 'qr_generator' ? 'active bg-danger' : 'hover-danger-bg'}`} onClick={() => setActiveTab('qr_generator')}><i className="bi bi-qr-code me-2"></i> QR Generator</button></li>
                    <li className="nav-item"><button className={`nav-link text-white text-start w-100 fw-bold ${activeTab === 'station_monitor' || activeTab === 'station_details' ? 'active bg-danger' : 'hover-danger-bg'}`} onClick={() => setActiveTab('station_monitor')}><i className="bi bi-display me-2"></i> Station Monitor</button></li>
                    <li className="nav-item"><button className={`nav-link text-white text-start w-100 fw-bold ${activeTab === 'approvals' ? 'active bg-danger' : 'hover-danger-bg'}`} onClick={() => setActiveTab('approvals')}><i className="bi bi-shield-check me-2"></i> Approvals</button></li>
                </ul> 
    
    
    
                {/* LOGOUT + COPYRIGHT SECTION (SIMPLIFIED & SPLIT) */}
                <div className="mt-auto pt-2">
                    
                    {/* LOGOUT BUTTON (FIRST SECTION) */}
                    <button onClick={onLogout} className="btn btn-outline-danger w-100 btn-sm fw-bold">
                        <i className="bi bi-box-arrow-left me-2"></i> Logout
                    </button>

                    {/* SEPARATOR LINE */}
                    <hr className="text-white-50 my-2" /> 

                    {/* COPYRIGHT TEXT (SECOND SECTION) */}
                    <div className="text-center text-white-50 small" style={{fontSize: '0.7rem'}}>
                        ©2025 MKFF Laserteqhnique
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN CONTENT AREA (Fixed Header, Scrollable Content) --- */}
            <div className="flex-grow-1 d-flex flex-column" style={{ 
                marginLeft: "260px", 
                backgroundColor: '#eeeeeeff', 
                height: '100vh', 
                overflow: 'hidden' 
            }}>
                
                {/* HEADER (Sticky/Fixed Visual - No strong shadow) */}
                <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center border-bottom" style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
                    <div className="d-flex align-items-center">
                        <h2 className="mb-0 text-capitalize fw-bold text-dark">{activeTab.replace(/_/g, ' ')}</h2>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small">Logged in as:</span>
                        <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                            {/* FIXED: Display full_name */}
                            <div className="fw-bold small text-dark me-2">{user.full_name || user.username}</div>
                            <span className="badge bg-danger">{user.role || 'IT Assistant'}</span>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE CONTENT */}
                <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
                    {renderContent()}
                </div>
            </div>
            
            {/* Global Modals */}
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
                    user={user} 
                />
            )}
            
            {/* Global Styles for UI Enhancements */}
            <style jsx>{`
                .animate-in { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hover-danger-bg:hover {
                    background-color: #dc3545 !important;
                    color: white !important;
                }
            `}</style>
        </div>
    );
}