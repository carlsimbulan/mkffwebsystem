import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Define the fixed list of station names based on the process flow (from AdminPage.jsx)
const processStations = [
    "PCB Pairing",
    "Integrated Board Test",
    "Main Board Conformal Coating",
    "RTV Application",
    "Casing/Harnessing",
    "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test",
    "Burn-in Testing",
    "Sealing",
    "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test",
    "Label Sticker Attachment",
    "FVI",
    "Packing",
    "QC Stamping"
];

// List of available statuses for filtering
const allStatuses = ['All', 'In Progress', 'Completed', 'No Good (NG)', 'Pending Approval'];


// Helper function to format date/time
const formatTimestamp = (isoString) => {
    if (!isoString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(isoString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
};

const getStatusBadgeClass = (status) => {
    const statusText = status?.toLowerCase() || '';
    if (statusText.includes('completed') || statusText.includes('ok')) return 'bg-success';
    if (statusText.includes('no good') || statusText.includes('pending approval')) return 'bg-danger';
    if (statusText.includes('in progress')) return 'bg-primary';
    if (statusText.includes('scanning') || statusText.includes('unit in')) return 'bg-info text-dark';
    return 'bg-secondary';
};

// --- NEW COMPONENT: OVERALL HISTORY VIEW (KEPT FOR TAB SWITCHING) ---
const RenderOverallHistory = ({ allLogs, setActiveTab }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!allLogs || allLogs.length === 0) {
        return (
            <div className="animate-in fade-in py-5 text-center bg-white shadow-sm rounded-4 mt-4">
                <i className="bi bi-server fs-1 text-muted opacity-50 mb-3 d-block"></i>
                <h5 className="fw-bold text-dark">No Production History Data</h5>
                <p className="text-muted">No historical logs recorded across all stations yet.</p>
                <button
                    className="btn btn-dark btn-sm mt-3 px-4 rounded-pill fw-bold hover-lift"
                    onClick={() => setActiveTab('stations')}
                >
                    Back to Station Overview
                </button>
            </div>
        );
    }
    
    // --- Filtering Logic ---
    const filteredLogs = allLogs.filter(log => {
        // 1. Assembly ID Search (Case insensitive)
        const matchesSearch = log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Date Range Filter
        const logTimestamp = log.timestamp || log.created_at; 
        const logDate = new Date(logTimestamp);
        let matchesDate = true;

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); 
            matchesDate = matchesDate && logDate >= start;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 
            matchesDate = matchesDate && logDate <= end;
        }

        return matchesSearch && matchesDate;
    });

    // Sort logs by timestamp (most recent first)
    const sortedLogs = filteredLogs.sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));

    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        // setStatusFilter('All'); // Status filter not implemented in this component yet, just clearing
    };

    return (
        <div className="animate-in fade-in pb-5">
            {/* Header: Black Text, No Icons */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bolder text-dark mb-1">Overall Production History (All 15 Stations)</h3>
                    <p className="text-muted small mb-0">Historical logs across the production line ({sortedLogs.length} entries displayed).</p>
                </div>
                <button
                    className="btn btn-light border btn-sm px-3 fw-bold text-dark hover-lift rounded-pill"
                    onClick={() => { setActiveTab('stations'); }}
                >
                    Back to Overview
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="card shadow-sm mb-4 p-3 rounded-4 bg-white">
                <div className="row g-3 align-items-end">
                    
                    {/* Search Assembly ID */}
                    <div className="col-md-5">
                        <label className="form-label small text-muted fw-medium">Search Assembly ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Assembly ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Date Range Filters */}
                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-medium">Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small text-muted fw-medium">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    
                    {/* Reset Button */}
                    <div className="col-md-1 d-flex justify-content-end">
                        <button 
                            className="btn btn-outline-secondary" 
                            onClick={resetFilters}
                            title="Clear All Filters"
                        >
                            <i className="bi bi-x-circle"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main History Table */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle mb-0 small" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-dark text-white text-uppercase" style={{ letterSpacing: '0.5px' }}>
                            <tr>
                                <th className="py-3 ps-4">Model</th> 
                                <th>Assembly No.</th>
                                <th>Action Type</th>
                                <th>Station</th>
                                <th className="text-center">Status After</th>
                                <th>Action By</th>
                                <th className="text-end pe-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {sortedLogs.length > 0 ? sortedLogs.map(log => {
                                // Use the timestamp column from the history log
                                const timestamp = formatTimestamp(log.timestamp || log.created_at);
                                const status = log.status_after || log.status; 
                                const statusClass = getStatusBadgeClass(status);
                                
                                // Display Model ID
                                const modelDisplay = log.model || log.model_id; 

                                return (
                                    <tr key={log.id}>
                                        <td className="ps-4 fw-bold text-dark">{modelDisplay}</td> 
                                        <td className="font-monospace text-primary fw-bold">{log.assembly_no}</td>
                                        <td>{log.action_type || 'UPDATE'}</td>
                                        <td>{log.station_name || log.station}</td>
                                        <td className="text-center">
                                            <span className={`badge ${statusClass} rounded-pill px-3 py-1 fw-bold`}>{status}</span>
                                        </td>
                                        <td>{log.action_by || 'System'}</td>
                                        <td className="text-end pe-4 small text-muted">
                                            <div className="fw-bold text-dark">{timestamp.date}</div>
                                            <div style={{ fontSize: '0.75rem' }}>{timestamp.time}</div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No logs found matching the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- STATION OVERVIEW (Stations tab) ---
const RenderStationGrid = ({ stations, calculateMetrics, handleMonitorStation, handleViewHistory, setActiveTab }) => { 
    // Map the new names to the mock stations while preserving their IDs and metrics.
    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, // Keep existing data like ID
        name: processStations[index], // Overwrite the name with the process name
    }));

    return (
        <div className="animate-in fade-in pb-4">
            {/* Title Header: Black Text, No Icons */}
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bolder text-dark mb-1">Station Management Overview</h3>
                    <p className="text-muted small mb-0">Overview of all {namedStations.length} production stations.</p>
                </div>
                {/* Overall History Button (Black Button) */}
                <button
                    className="btn btn-dark btn-sm rounded-pill px-4 fw-bold shadow-sm hover-lift"
                    onClick={() => setActiveTab('overall_history')}
                >
                    View Overall History
                </button>
            </div>

            {/* Grid Container */}
            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    const hasActivity = metrics.pendingUnits > 0;
                    const hasError = metrics.ngUnits > 0 && metrics.completedUnits === 0;

                    let statusColor = "secondary";
                    let statusLabel = "Idle";

                    if (hasActivity) {
                        statusColor = "primary";
                        statusLabel = "Running";
                    }
                    if (hasError) {
                        statusColor = "danger";
                        statusLabel = "Attention";
                    }

                    return (
                        <div key={station.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                            <div className="card shadow-sm h-100 border-0 rounded-3 hover-lift">
                                <div className="card-body d-flex flex-column">

                                    {/* Station Name + ID */}
                                    <h6 className="fw-bolder text-dark mb-1">{station.name}</h6>
                                    <small className="text-muted mb-2">ID: {station.id}</small>

                                    {/* Status */}
                                    <div className="mb-3">
                                        <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} px-3 py-2 rounded-pill fw-bold`}>
                                            {hasActivity && (
                                                <span className="spinner-grow spinner-grow-sm me-1"
                                                    role="status"
                                                    aria-hidden="true"
                                                    style={{ width: "0.5rem", height: "0.5rem" }}>
                                                </span>
                                            )}
                                            {statusLabel}
                                        </span>
                                    </div>

                                    {/* Metrics */}
                                    <div className="mb-3 p-2 border-top border-bottom bg-light rounded">
                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">Completed</small>
                                            <span className="fw-bold text-dark">{metrics.completedUnits}</span>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">Defects (NG)</small>
                                            <span className={`fw-bold ${metrics.ngUnits > 0 ? "text-danger" : "text-dark"}`}>
                                                {metrics.ngUnits}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions (Removed Icons, Dark Buttons) */}
                                    <div className="mt-auto d-flex gap-2 pt-2">
                                        <button
                                            className="btn btn-sm btn-outline-dark fw-bold flex-grow-1 rounded-pill"
                                            onClick={() => handleMonitorStation(station.id)}
                                        >
                                            Monitor
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-secondary fw-bold flex-grow-1 rounded-pill"
                                            onClick={() => handleViewHistory(station.id)}
                                        >
                                            History
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .hover-lift:hover { transform: translateY(-2px); transition: transform 0.2s; }
            `}</style>
        </div>
    );
};

// --- STATION MONITOR (station_monitor tab) ---
const RenderStationMonitor = ({ stationMonitorId, stations, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 

    if (!stationMonitorId) return null;

    const station = stations.find(s => s.id === stationMonitorId);
    
    // Calculate metrics first to get raw logs for the station
    const monitorMetrics = calculateMetrics(stationMonitorId);
    
    // Filter logs based on Assembly ID search term AND selected status
    const filteredLogs = monitorMetrics.stationLogs
        // 1. Filter by Assembly No.
        .filter(log => {
            return log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase());
        })
        // 2. Filter by Status
        .filter(log => {
            if (statusFilter === 'All') {
                return true;
            }
            return log.status === statusFilter;
        });
    
    // Determine the user-facing station name based on the ID index
    const stationIndex = parseInt(stationMonitorId.replace('Station', '')) - 1;
    const processName = processStations[stationIndex] || stationMonitorId;

    // Handler: Reset Filters
    const handleResetFilters = () => {
        setSearchTerm(''); // Reset search term
        setStatusFilter('All'); // Reset status filter
        fetchData(); // Fetch fresh data
    };


    return (
        <div className="animate-in fade-in pb-5">
            {/* --- Header Section: FIXED HEADER --- */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bolder text-dark mb-1">{processName}</h3> {/* Display Process Name */}
                    <p className="text-muted small mb-0">ID: {stationMonitorId}</p> {/* Display Station ID below */}
                </div>
                <button
                    className="btn btn-light border btn-sm px-3 fw-bold text-dark hover-lift rounded-pill"
                    onClick={() => { setActiveTab('stations'); }}
                >
                    Back to Overview
                </button>
            </div>

            {/* --- Stats Cards (Content and styling remain optimized) --- */}
            <div className="row g-4 mb-4">
                
                {/* 1. Completed */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-check-circle-fill fs-4"></i>
                                </div>
                                <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-bolder" style={{ fontSize: '0.9rem' }}>OUTPUT</span>
                            </div>
                            <h2 className="fw-bolder text-dark mb-0 display-5">{monitorMetrics.completedUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed Units</span>
                        </div>
                    </div>
                </div>

                {/* 2. Yield Rate (Made percentage stand out) */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-graph-up-arrow fs-4"></i>
                                </div>
                                <span className="badge bg-primary text-white rounded-pill px-3 py-2 fw-bolder" style={{ fontSize: '0.9rem' }}>TARGET: 98%</span>
                            </div>
                            <h2 className="fw-bolder text-primary mb-0 display-5">{monitorMetrics.yieldRate}%</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Current Yield Rate</span>
                        </div>
                    </div>
                </div>

                {/* 3. In Progress */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-hourglass-split fs-4"></i>
                                </div>
                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bolder" style={{ fontSize: '0.9rem' }}>WIP</span>
                            </div>
                            <h2 className="fw-bolder text-dark mb-0 display-5">{monitorMetrics.pendingUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress</span>
                        </div>
                    </div>
                </div>

                {/* 4. Defects (NG) */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                                </div>
                                <span className="badge bg-danger text-white rounded-pill px-3 py-2 fw-bolder" style={{ fontSize: '0.9rem' }}>DEFECTS</span>
                            </div>
                            <h2 className="fw-bolder text-danger mb-0 display-5">{monitorMetrics.ngUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total No Good (NG)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Live Logs Table --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-header bg-white py-3 px-4 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h6 className="fw-bold text-dark mb-0">Production Feed ({filteredLogs.length} Units)</h6>
                    
                    <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-end">
                        
                        {/* Status Filter Dropdown */}
                        <div className="input-group input-group-sm" style={{ maxWidth: '150px' }}>
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option disabled>Status</option>
                                {allStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Search Input for Assembly No. (Adjusted Width) */}
                        <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Assembly No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="input-group-text bg-white text-muted"><i className="bi bi-search"></i></span>
                        </div>
                        
                        {/* UPDATED: Reset Filters Button */}
                        <button 
                            className="btn btn-danger text-white fw-bold border rounded-pill px-3" 
                            onClick={handleResetFilters}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i> Reset Filters
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0 small text-start align-middle">
                        <thead className="table-dark text-uppercase">
                            <tr>
                                {/* RESTORED ORIGINAL COLUMNS, CENTERING STATUS */}
                                <th className="ps-4">MODEL</th>
                                <th>REVISION</th>
                                <th>BASE UNIT</th>
                                <th style={{ width: '15%' }}>ASSEMBLY</th>
                                <th style={{ width: '15%' }}>DEVICE SERIAL</th>
                                <th>ACCESSORY</th>
                                <th className="text-center">STATUS</th>
                                <th>REMARKS</th>
                                <th style={{ width: '15%' }}>TIME DATE</th>
                                <th className="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map(log => {
                                const isHighlighted = highlightedUnitId === log.id;
                                const timestamp = new Date(log.created_at).toLocaleString(); // Simple date format for table
                                return (
                                    <tr key={log.id} className={isHighlighted ? 'table-danger fw-bold' : ''}>
                                        <td className="ps-4">{log.model}</td>
                                        <td>{log.revision}</td>
                                        <td className="font-monospace">{log.base_unit_kitting_no}</td>
                                        <td className="font-monospace text-dark fw-bold">{log.assembly_no}</td>
                                        <td className="fw-bold">{log.device_serial_no}</td>
                                        <td>{log.accessory_kitting_no}</td>
                                        <td className="text-center"><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                        <td>{log.remarks}</td>
                                        <td className="small text-muted">{timestamp}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-outline-danger py-0" onClick={() => handleEditClick(log)}><i className="bi bi-pencil"></i> Edit</button>
                                        </td>
                                    </tr>
                                );
                            }) : (<tr><td colSpan="10" className="text-center py-4">No live logs found for this station matching the current filters.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .hover-lift:hover { transform: translateY(-1px); }
            `}</style>
        </div>
    );
};

// --- MAIN EXPORT COMPONENT ---
export function StationsOverview({
    activeTab,
    stations,
    calculateMetrics,
    stationMonitorId,
    highlightedUnitId,
    setActiveTab,
    handleMonitorStation,
    handleViewHistory,
    handleEditClick,
    fetchData,
    allLogs, 
}) {
    // 1. Render Station Monitor
    if (activeTab === "station_monitor" && stationMonitorId) {
        return (
            <RenderStationMonitor
                stationMonitorId={stationMonitorId}
                stations={stations}
                calculateMetrics={calculateMetrics}
                handleEditClick={handleEditClick}
                highlightedUnitId={highlightedUnitId}
                setActiveTab={setActiveTab}
                fetchData={fetchData}
            />
        );
    }
    
    // 2. Render Overall History
    if (activeTab === "overall_history") {
        return (
            <RenderOverallHistory
                allLogs={allLogs}
                setActiveTab={setActiveTab}
            />
        );
    }

    // 3. Render Station Grid (Default view)
    return (
        <RenderStationGrid
            stations={stations}
            calculateMetrics={calculateMetrics}
            handleMonitorStation={handleMonitorStation}
            handleViewHistory={handleViewHistory}
            setActiveTab={setActiveTab} 
        />
    );
}