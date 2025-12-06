import React from 'react';
import { UnitPieChart } from './UnitPieChart'; // Existing component
import { StationBarChart } from './StationBarChart'; // Existing component

export function Dashboard({
    logs,
    stations,
    calculateMetrics,
    overallMetrics, // Contains: completedUnits, pendingUnits, ngUnits, pendingApprovalUnits, yieldRate
    setActiveTab,
    dashboardView,
    nextChart,
    prevChart,
    handleMonitorStation,
}) {
    // --- CALCULATIONS FOR PERCENTAGES ---
    const totalUnits = 
        overallMetrics.completedUnits + 
        overallMetrics.pendingUnits + 
        overallMetrics.ngUnits + 
        overallMetrics.pendingApprovalUnits;

    // Helper function to safely calculate percentage
    const calculatePercentage = (value) => {
        if (totalUnits === 0) return '0.0%';
        return ((value / totalUnits) * 100).toFixed(1) + '%';
    };

    const completedPercentage = calculatePercentage(overallMetrics.completedUnits);
    const pendingPercentage = calculatePercentage(overallMetrics.pendingUnits);
    const ngPercentage = calculatePercentage(overallMetrics.ngUnits);

    // Determine current chart title
    const currentChartTitle = dashboardView === 'bar' ? 'Station Output' : 'Status Distribution';
    const currentChartSubtitle = dashboardView === 'bar' ? 'Live production count per station' : 'Overall yield ratio';

    return (
        <div className="animate-in fade-in pb-4">
            {/* --- 1. Header Section --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Production Overview</h3>
                    <p className="text-muted small mb-0">Real-time data stream from all active stations.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-white border px-3 py-2 rounded shadow-sm d-flex align-items-center">
                        <span className="position-relative d-flex h-2 w-2 me-2">
                            <span className="animate-ping position-absolute d-inline-flex h-100 w-100 rounded-circle bg-success opacity-75"></span>
                            <span className="position-relative d-inline-flex rounded-circle h-2 w-2 bg-success" style={{ width: '10px', height: '10px' }}></span>
                        </span>
                        <span className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>System Live</span>
                    </div>
                    <div className="bg-white border px-3 py-2 rounded shadow-sm text-secondary fw-bold small">
                        {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* --- 2. Stats Cards (Summary) - UPDATED FOR VISIBILITY --- */}
            <div className="row g-4 mb-5">
                
                {/* 🎯 Total Units Tracked */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-box-fill fs-4"></i>
                                </div>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 small fw-bold">
                                    100% Data Stream
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0 display-6">{totalUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total Units Tracked</span>
                        </div>
                    </div>
                </div>

                {/* Completed Units */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-box-seam-fill fs-4"></i>
                                </div>
                                {/* Display Percentage - BIGGER AND BOLDER */}
                                <span className="badge bg-success text-white px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                    {completedPercentage}
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0 display-6">{overallMetrics.completedUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed Units (Yield: {overallMetrics.yieldRate}%)</span>
                        </div>
                    </div>
                </div>

                {/* In Progress */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-hourglass-split fs-4"></i>
                                </div>
                                {/* Display Percentage - BIGGER AND BOLDER */}
                                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                    {pendingPercentage}
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0 display-6">{overallMetrics.pendingUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress (Work in progress)</span>
                        </div>
                    </div>
                </div>

                {/* Defects (NG) */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                                </div>
                                {/* Display Percentage - BIGGER AND BOLDER */}
                                <span className="badge bg-danger text-white px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                    {ngPercentage}
                                </span>
                            </div>
                            <h2 className="fw-bold text-danger mb-0 display-6">{overallMetrics.ngUnits}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total Defects (NG)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. Approvals Alert (Action Bar) --- */}
            {overallMetrics.pendingApprovalUnits > 0 && (
                <div className="card border-0 shadow-sm mb-4 border-start border-4 border-danger bg-white">
                    <div className="card-body d-flex align-items-center justify-content-between p-3">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-bell-fill text-danger fs-4 me-3 ms-2"></i>
                            <div>
                                <h6 className="fw-bold text-dark mb-0">Action Required</h6>
                                <small className="text-secondary">There are <span className="fw-bold text-danger">{overallMetrics.pendingApprovalUnits} units</span> waiting for QA validation.</small>
                            </div>
                        </div>
                        <button className="btn btn-sm btn-danger px-4 rounded-pill" onClick={() => setActiveTab('approval')}>
                            Review Queue
                        </button>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* --- 4. LIVE UNITS OVERVIEW (PRIORITIZED TABLE) --- */}
            {/* ----------------------------------------------------- */}
            <div className="row g-4 mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="fw-bold text-dark mb-0">Live Units Overview</h5>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Detailed breakdown of active and recent logs.</small>
                        </div>
                        <div className="card-body p-4">
                            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="table table-sm table-striped align-middle mb-0 small">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Time</th>
                                            <th>Station</th>
                                            <th>Device Serial No</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.slice(0, 10).map(log => ( // Show only the last 10 logs for a quick overview
                                            <tr key={log.id}>
                                                <td className="text-muted" style={{ fontSize: '00.7rem' }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                                                <td className="fw-medium">{log.station}</td>
                                                <td className="font-monospace">{log.device_serial_no}</td>
                                                <td><span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.status === 'No Good (NG)' ? 'bg-danger' : log.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>{log.status}</span></td>
                                                <td className="small text-truncate" style={{ maxWidth: '200px' }}>{log.remarks || 'N/A'}</td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr><td colSpan="5" className="text-center py-3 text-muted">No recent activity to display.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ----------------------------------------------------- */}
            {/* --- 5. PAGING CHART CONTAINER (Secondary Visual) --- */}
            {/* ----------------------------------------------------- */}
            <div className="row g-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', minHeight: '480px' }}>

                        {/* CHART HEADER - BUTTONS ARE VISIBLE AND IN THE TOP CENTER/RIGHT */}
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">

                            {/* Left: Title and Subtitle */}
                            <div>
                                <h5 className="fw-bold text-dark mb-0">{currentChartTitle}</h5>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{currentChartSubtitle}</small>
                            </div>

                            {/* Right: Navigation Buttons (Highly Visible) */}
                            <div className="d-flex gap-2 ms-auto">
                                <button className="btn btn-dark btn-sm rounded-pill fw-bold" onClick={prevChart} title="Previous Chart">
                                    <i className="bi bi-arrow-left me-1"></i> Prev
                                </button>
                                <button className="btn btn-dark btn-sm rounded-pill fw-bold" onClick={nextChart} title="Next Chart">
                                    Next <i className="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>

                        {/* Chart Body */}
                        <div className="card-body d-flex align-items-center justify-content-center p-4">
                            <div className="w-100 h-100 fade-in" style={{ height: '400px' }}>
                                {/* Conditional Rendering based on dashboardView state */}
                                {dashboardView === 'bar' && (
                                    <StationBarChart logs={logs} stations={stations} calculateMetrics={calculateMetrics} />
                                )}
                                {dashboardView === 'pie' && (
                                    <UnitPieChart metrics={overallMetrics} title="" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}