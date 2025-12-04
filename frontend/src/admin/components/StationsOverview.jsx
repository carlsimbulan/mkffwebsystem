import React from 'react';

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


// --- STATION OVERVIEW (Stations tab) ---
const RenderStationGrid = ({ stations, calculateMetrics, handleMonitorStation, handleViewHistory }) => {
    // Map the new names to the mock stations while preserving their IDs and metrics.
    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, // Keep existing data like ID
        name: processStations[index], // Overwrite the name with the process name
    }));

    return (
        <div className="animate-in fade-in">
            {/* Title Header */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Station Management</h3>
                    <p className="text-muted small mb-0">Overview of all {namedStations.length} production stations.</p>
                </div>
            </div>

            {/* Grid Container */}
            <div className="row g-3">
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
                            <div className="card shadow-sm h-100 border-0">
                                <div className="card-body d-flex flex-column">

                                    {/* Station Name + ID */}
                                    <h6 className="fw-bold text-dark mb-1">{station.name}</h6>
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
                                    <div className="mb-3">
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

                                    {/* Actions */}
                                    <div className="mt-auto d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary fw-bold flex-grow-1"
                                            onClick={() => handleMonitorStation(station.id)}
                                        >
                                            <i className="bi bi-speedometer2 me-1"></i> Monitor
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-secondary fw-bold flex-grow-1"
                                            onClick={() => handleViewHistory(station.id)}
                                        >
                                            <i className="bi bi-clock-history me-1"></i> History
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- STATION MONITOR (station_monitor tab) ---
const RenderStationMonitor = ({ stationMonitorId, stations, calculateMetrics, handleEditClick, highlightedUnitId, setActiveTab, fetchData }) => {
    if (!stationMonitorId) return null;

    const station = stations.find(s => s.id === stationMonitorId);
    const monitorMetrics = calculateMetrics(stationMonitorId);

    return (
        <div className="animate-in fade-in pb-5">
            {/* --- Header Section --- */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1">{station?.name || stationMonitorId}</h3>
                    <p className="text-muted small mb-0">Real-time production feed</p>
                </div>
                <button
                    className="btn btn-light border btn-sm px-3 fw-bold text-muted hover-lift"
                    onClick={() => { setActiveTab('stations'); }}
                >
                    <i className="bi bi-arrow-left me-2"></i>Back to Overview
                </button>
            </div>

            {/* --- Stats Cards (Modern Style) --- */}
            <div className="row g-4 mb-4">
                {/* Completed */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-check-circle-fill fs-4"></i>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-normal">Output</span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0">{monitorMetrics.completedUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed</span>
                        </div>
                    </div>
                </div>

                {/* Yield Rate */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-graph-up-arrow fs-4"></i>
                                </div>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 small fw-normal">Efficiency</span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0">{monitorMetrics.yieldRate}%</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Yield Rate</span>
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-hourglass-split fs-4"></i>
                                </div>
                                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small fw-normal">Active</span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0">{monitorMetrics.pendingUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress</span>
                        </div>
                    </div>
                </div>

                {/* Defects (NG) */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                                </div>
                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small fw-normal">Defects</span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0">{monitorMetrics.ngUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total NG</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Live Logs Table (Kept Original Structure) --- */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-header bg-white py-3 px-4 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold text-dark mb-0">Production Feed</h6>
                    <button className="btn btn-sm btn-light text-primary fw-bold border rounded-pill px-3" onClick={fetchData}>
                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0 small text-center align-middle">
                        <thead className="table-dark">
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
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monitorMetrics.stationLogs.length > 0 ? monitorMetrics.stationLogs.map(log => {
                                const isHighlighted = highlightedUnitId === log.id;
                                return (
                                    <tr key={log.id} className={isHighlighted ? 'table-danger fw-bold' : ''}>
                                        <td>{log.model}</td>
                                        <td>{log.revision}</td>
                                        <td className="font-monospace">{log.base_unit_kitting_no}</td>
                                        <td className="font-monospace text-primary fw-bold">{log.assembly_no}</td>
                                        <td className="fw-bold">{log.device_serial_no}</td>
                                        <td>{log.accessory_kitting_no}</td>
                                        <td><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                        <td>{log.remarks}</td>
                                        <td className="small">{new Date(log.created_at).toLocaleString()}</td>
                                        <td><button className="btn btn-sm btn-outline-danger py-0" onClick={() => handleEditClick(log)}><i className="bi bi-pencil"></i> Edit</button></td>
                                    </tr>
                                );
                            }) : (<tr><td colSpan="10" className="text-center py-4">No live logs found for this station.</td></tr>)}
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
}) {
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

    return (
        <RenderStationGrid
            stations={stations}
            calculateMetrics={calculateMetrics}
            handleMonitorStation={handleMonitorStation}
            handleViewHistory={handleViewHistory}
        />
    );
}