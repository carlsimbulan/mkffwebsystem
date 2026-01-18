import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const allStatuses = ['All', 'In Progress', 'Completed', 'No Good (NG)', 'Pending Approval', 'For Scanning'];

// Configuration for Pagination
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

// --- SUB-COMPONENT: STATION MONITOR ---
const StationMonitorView = ({ stationMonitorId, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [selectedUnitProcess, setSelectedUnitProcess] = useState(null); 

    const monitorMetrics = calculateMetrics(stationMonitorId);

    const filteredLogs = useMemo(() => {
        return (monitorMetrics.stationLogs || [])
            .filter(log => log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(log => statusFilter === 'All' || log.status === statusFilter);
    }, [monitorMetrics.stationLogs, searchTerm, statusFilter]);
    
    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;
    const processName = processStations[stationIndex] || stationMonitorId;

    return (
        <div className="pb-5 container-fluid px-0">
            <style>{`
                .btn-box { border-radius: 4px !important; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: none; }
                .btn-box:hover { opacity: 0.9; }
                .stat-card-pro { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; height: 100%; border-left: 5px solid #198754; }
                .table thead th { background-color: #1e293b !important; color: #ffffff !important; font-weight: 600; border: none; padding: 12px 15px; }
                .table-hover tbody tr:hover { background-color: #f1f5f9 !important; }
                .modal-step { padding: 15px 20px; border-left: 2px solid #e9ecef; position: relative; border-radius: 0 8px 8px 0; }
                .modal-step.done { border-left-color: #198754; }
                .modal-step.current { border-left-color: #0d6efd; background: #f0f7ff; }
                .modal-step.ng { border-left-color: #dc3545; background: #fff5f5; }
                .modal-dot { position: absolute; left: -7px; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: #dee2e6; border: 2px solid white; z-index: 2; }
                .done .modal-dot { background: #198754; }
                .current .modal-dot { background: #0d6efd; }
                .ng .modal-dot { background: #dc3545; }
            `}</style>

            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 px-2">
                <div>
                    <h3 className="fw-bold text-dark mb-1">{processName}</h3>
                    <p className="text-muted small mb-0">Operational View • ID: {stationMonitorId}</p>
                </div>
<button 
    className="btn btn-light border btn-sm btn-box px-3" 
    onClick={() => setActiveTab && typeof setActiveTab === 'function' ? setActiveTab('stations') : console.warn('setActiveTab not found')}
>
    <i className="bi bi-arrow-left me-1"></i> BACK
</button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro"><span className="text-muted small fw-bold text-uppercase">Completed</span><h3 className="fw-bold text-success mt-1">{monitorMetrics.completedUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#0d6efd'}}><span className="text-muted small fw-bold text-uppercase">Yield Rate</span><h3 className="fw-bold text-primary mt-1">{monitorMetrics.yieldRate}%</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#ffc107'}}><span className="text-muted small fw-bold text-uppercase">In Progress</span><h3 className="fw-bold text-warning mt-1">{monitorMetrics.pendingUnits}</h3></div></div>
                <div className="col-md-6 col-xl-3"><div className="stat-card-pro" style={{borderLeftColor: '#dc3545'}}><span className="text-muted small fw-bold text-uppercase">No Good (NG)</span><h3 className="fw-bold text-danger mt-1">{monitorMetrics.ngUnits}</h3></div></div>
            </div>

            <div className="bg-white border rounded-2 overflow-hidden shadow-sm">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-bold small text-muted">STATION LOGS</span>
                    <div className="d-flex gap-2">
                        <select className="form-select form-select-sm btn-box shadow-none" style={{width:'160px'}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{allStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <input type="text" className="form-control form-control-sm btn-box shadow-none" style={{width:'200px'}} placeholder="Search ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button className="btn btn-secondary btn-sm btn-box px-3" onClick={() => {setSearchTerm(''); setStatusFilter('All'); fetchData();}}>RESET</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th className="ps-4">MODEL</th><th>REVISION</th><th>BASE UNIT</th><th>ASSEMBLY</th><th>DEVICE SERIAL</th><th>ACCESSORY</th><th className="text-center">STATUS</th><th>REMARKS</th><th>TIMESTAMP</th><th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={highlightedUnitId === log.id ? 'table-danger fw-bold' : ''}>
                                    <td className="ps-4 fw-bold">{log.model}</td><td>{log.revision}</td><td>{log.base_unit_kitting_no}</td><td><code className="text-primary fw-bold">{log.assembly_no}</code></td><td className="fw-bold">{log.device_serial_no}</td><td>{log.accessory_kitting_no}</td>
                                    <td className="text-center"><span className={`badge rounded-1 px-3 py-1 ${getStatusBadgeClass(log.status)}`}>{log.status}</span></td>
                                    <td className="text-muted small italic">{log.remarks || '---'}</td><td className="small text-muted">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button className="btn btn-sm btn-primary btn-box py-1 px-3" style={{fontSize:'0.7rem'}} onClick={() => setSelectedUnitProcess(log)}>DETAILS</button>
                                            <button className="btn btn-sm btn-danger btn-box py-1 px-3" style={{fontSize:'0.7rem'}} onClick={() => handleEditClick(log)}>EDIT</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUnitProcess && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.4)', zIndex: 1050 }}>
                    <div className="bg-white rounded-3 shadow-xl p-0 overflow-hidden border-0" style={{ width: '95%', maxWidth: '500px' }}>
                        <div className="p-4 d-flex justify-content-between align-items-center text-white bg-primary">
                            <div>
                                <h5 className="mb-0 fw-bold">Unit Tracker</h5>
                                <p className="mb-0 small opacity-75">{selectedUnitProcess.assembly_no}</p>
                            </div>
                            <button className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUnitProcess(null)}></button>
                        </div>
                        <div className="p-2 bg-light border-bottom d-flex justify-content-around small fw-bold text-muted">
                            <span><i className="bi bi-box-seam me-1"></i> {selectedUnitProcess.model}</span>
                            <span><i className="bi bi-hash me-1"></i> SN: {selectedUnitProcess.device_serial_no}</span>
                        </div>
                        <div className="p-0" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            <div className="p-4">
                                {processStations.map((station, idx) => {
                                    const isCurrent = idx === stationIndex;
                                    const isDoneBefore = idx < stationIndex;
                                    const unitStatus = selectedUnitProcess.status?.toLowerCase() || '';
                                    const isNG = isCurrent && unitStatus.includes('no good');
                                    const isCompletedHere = isCurrent && unitStatus.includes('completed');
                                    
                                    let stepClass = ""; let subText = "Pending Station"; let textColor = "text-muted";
                                    if (isDoneBefore || isCompletedHere) { stepClass = "done"; subText = "STATION COMPLETED"; textColor = "text-success"; }
                                    else if (isNG) { stepClass = "ng"; subText = "DEFECT DETECTED (NG)"; textColor = "text-danger"; }
                                    else if (isCurrent) { stepClass = "current"; subText = "IN PROGRESS"; textColor = "text-primary"; }

                                    return (
                                        <div key={idx} className={`modal-step ${stepClass}`}>
                                            <div className="modal-dot"></div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className={`fw-bold mb-0 ${isCurrent || isDoneBefore || isCompletedHere ? 'text-dark' : 'text-muted opacity-50'}`} style={{fontSize: '0.9rem'}}>
                                                        {idx + 1}. {station}
                                                    </div>
                                                    <div className={`fw-bold ${textColor}`} style={{fontSize: '0.65rem', letterSpacing: '0.3px'}}>
                                                        {subText}
                                                    </div>
                                                </div>
                                                {isCurrent && <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-1" style={{fontSize: '0.6rem'}}>CURRENT</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-3 bg-white border-top">
                            <button className="btn btn-primary w-100 btn-box py-2 shadow-sm" onClick={() => setSelectedUnitProcess(null)}>CLOSE TRACKER</button>
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
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Filter and Sort Logic
    const filteredHistory = useMemo(() => {
        if (!allLogs) return [];
        const result = allLogs.filter(log => {
            const matchesSearch = log.assembly_no?.toLowerCase().includes(historySearch.toLowerCase());
            if (!startDate && !endDate) return matchesSearch;
            const logDate = new Date(log.timestamp || log.created_at);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0); if (end) end.setHours(23, 59, 59, 999);
            return matchesSearch && (!start || logDate >= start) && (!end || logDate <= end);
        }).sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
        
        return result;
    }, [allLogs, historySearch, startDate, endDate]);

    // Calculate current slice of data for pagination
    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredHistory, currentPage]);

    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

    // Reset to page 1 when search/filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [historySearch, startDate, endDate]);

    if (activeTab === "station_monitor" && stationMonitorId) {
        return <StationMonitorView {...{stationMonitorId, stations, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData}} />;
    }

    if (activeTab === "overall_history") {
        return (
            <div className="pb-5 container-fluid px-0">
                <style>{`
                    .btn-box { border-radius: 4px !important; font-weight: 600; }
                    .table thead th { background-color: #1e293b !important; color: white !important; padding: 12px; }
                    .pagination .page-link { color: #1e293b; border: 1px solid #dee2e6; margin: 0 2px; border-radius: 4px; }
                    .pagination .page-item.active .page-link { background-color: #1e293b; border-color: #1e293b; color: white; }
                    .pagination .page-item.disabled .page-link { color: #6c757d; pointer-events: none; background-color: #fff; border-color: #dee2e6; }
                `}</style>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 px-2">
                    <div>
                        <h4 className="fw-bold text-dark mb-0">Production History</h4>
                        <p className="text-muted small mb-0">Showing {paginatedHistory.length} of {filteredHistory.length} Total Logs</p>
                    </div>
                    <button className="btn btn-light border btn-sm btn-box px-3" onClick={() => setActiveTab('stations')}>BACK</button>
                </div>

                <div className="bg-light p-3 rounded-2 border mb-4 d-flex flex-wrap gap-3 align-items-end mx-2">
                    <div className="flex-grow-1"><label className="fw-bold small text-muted mb-1 d-block">ASSEMBLY NO.</label>
                    <input type="text" className="form-control form-control-sm btn-box shadow-none" placeholder="Search..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} /></div>
                    <div><label className="fw-bold small text-muted mb-1 d-block">START DATE</label><input type="date" className="form-control form-control-sm btn-box" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                    <div><label className="fw-bold small text-muted mb-1 d-block">END DATE</label><input type="date" className="form-control form-control-sm btn-box" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                    <button className="btn btn-danger btn-sm btn-box px-3" onClick={() => { setHistorySearch(''); setStartDate(''); setEndDate(''); }}>RESET</button>
                </div>

                <div className="bg-white border rounded-2 overflow-hidden mx-2 shadow-sm">
                    <div style={{minHeight: '450px'}}>
                        <table className="table table-hover align-middle mb-0" style={{fontSize: '0.85rem'}}>
                            <thead className="sticky-top">
                                <tr>
                                    <th className="ps-4">MODEL</th>
                                    <th>ASSEMBLY</th>
                                    <th>TYPE</th>
                                    <th>STATION</th>
                                    <th className="text-center">STATUS</th>
                                    <th>USER</th>
                                    <th className="text-end pe-4">TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistory.length > 0 ? (
                                    paginatedHistory.map(log => {
                                        const ts = formatTimestamp(log.timestamp || log.created_at);
                                        return (
                                            <tr key={log.id}>
                                                <td className="ps-4 fw-bold">{log.model || log.model_id}</td>
                                                <td><code className="text-primary fw-bold">{log.assembly_no}</code></td>
                                                <td className="text-muted small fw-bold">{log.action_type || 'UPDATE'}</td>
                                                <td className="fw-semibold">{log.station_name || log.station}</td>
                                                <td className="text-center"><span className={`badge rounded-1 px-3 ${getStatusBadgeClass(log.status_after || log.status)}`}>{log.status_after || log.status}</span></td>
                                                <td className="small">{log.action_by || 'System'}</td>
                                                <td className="text-end pe-4 small text-muted"><strong>{ts.date}</strong><br/>{ts.time}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted italic">No logs found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-3 border-top d-flex justify-content-between align-items-center bg-light">
                        <div className="small text-muted fw-bold">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                
                                {/* Simple Logic to show current, prev, and next page buttons */}
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    // Only show first page, last page, and 2 pages around current page
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                        return (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button className="page-link shadow-none" onClick={() => setCurrentPage(pageNum)}>
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                                    }
                                    return null;
                                })}

                                <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                    <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }

    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, name: processStations[index],
    }));

    return (
        <div className="container-fluid px-0">
            <style>{`
                .btn-box { border-radius: 4px !important; font-weight: 700; transition: none; }
                .station-card-flat { 
                    background: #fff; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 20px; 
                    height: 100%; 
                    transition: all 0.2s ease;
                }
                .station-card-flat:hover { 
                    border-color: #94a3b8; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transform: translateY(-2px);
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
                .metric-row:last-child { border-bottom: none; }
                .metric-value { color: #1e293b; } 
                .btn-monitor { background: #1e293b; color: #fff; border: none; }
                .btn-monitor:hover { background: #0f172a; color: #fff; }
                .btn-history { background: transparent; color: #475569; border: 1px solid #e2e8f0; }
                .btn-history:hover { background: #f8fafc; border-color: #cbd5e1; }
            `}</style>
            
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
                <div><h4 className="fw-bold text-dark mb-0">Station Control Panel</h4><p className="text-muted small mb-0">Operational real-time monitoring.</p></div>
                <button className="btn btn-dark btn-sm btn-box px-4 py-2" onClick={() => setActiveTab('overall_history')}>OVERALL HISTORY</button>
            </div>
            
            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    return (
                        <div key={station.id} className="col-md-3">
                            <div className="station-card-flat">
                                <div className="mb-3">
                                    <span className="text-muted" style={{fontSize: '0.65rem', fontWeight: 800}}>STATION ID: {station.id}</span>
                                    <h6 className="fw-bold text-dark text-truncate mb-0 mt-1">{station.name}</h6>
                                </div>
                                <div className="mb-4">
                                    <div className="metric-row"><span>COMPLETED</span><span className="metric-value">{metrics.completedUnits}</span></div>
                                    <div className="metric-row"><span>IN PROGRESS</span><span className="metric-value">{metrics.pendingUnits}</span></div>
                                    <div className="metric-row"><span>NO GOOD (NG)</span><span className="metric-value">{metrics.ngUnits}</span></div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-monitor btn-sm btn-box flex-grow-1" onClick={() => handleMonitorStation(station.id)}>MONITOR</button>
                                    <button className="btn btn-history btn-sm btn-box px-3" onClick={() => handleViewHistory(station.id)}>HISTORY</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}