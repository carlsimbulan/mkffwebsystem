import React from 'react';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const StationsGrid = ({ stations, calculateMetrics, handleMonitorStation, handleViewHistory, setActiveTab }) => {
    const namedStations = stations.slice(0, processStations.length).map((station, index) => ({
        ...station, name: processStations[index],
    }));

    return (
        <div className="container-fluid px-0">
            <style>{`
                .station-card-flat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; height: 100%; border-top: 4px solid #e2e8f0; transition: all 0.2s; }
                .station-card-flat:hover { border-color: #cbd5e1; transform: translateY(-2px); }
            `}</style>

            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold text-dark mb-0">Station Control Panel</h4>
                    <p className="text-muted small mb-0">Monitor real-time station activities</p>
                </div>
                <button className="btn btn-light border btn-sm px-3 fw-medium" onClick={() => setActiveTab('overall_history')}>
                    <i className="bi bi-clock-history me-1"></i> View History
                </button>
            </div>

            <div className="row g-4">
                {namedStations.map((station) => {
                    const metrics = calculateMetrics(station.id);
                    const isRunning = metrics.pendingUnits > 0;
                    const isAlert = metrics.ngUnits > 0 && metrics.completedUnits === 0;
                    
                    return (
                        <div key={station.id} className="col-md-3">
                            <div className="station-card-flat" style={{ borderTopColor: isAlert ? '#ef4444' : isRunning ? '#107c55' : '#e2e8f0' }}>
                                <h6 className="fw-bold text-dark mb-1">{station.name}</h6>
                                <div className="bg-light rounded-3 p-3 my-3 border border-light-subtle">
                                    <div className="d-flex justify-content-between small fw-bold text-success"><span>COMPLETED</span><span>{metrics.completedUnits}</span></div>
                                    <div className="d-flex justify-content-between small fw-bold mt-2 text-warning"><span>IN PROGRESS</span><span>{metrics.pendingUnits}</span></div>
                                    <div className="d-flex justify-content-between small fw-bold mt-2 text-danger"><span>DEFECTS (NG)</span><span>{metrics.ngUnits}</span></div>
                                </div>
                                <div className="d-flex gap-2 mt-auto">
                                    <button className="btn btn-dark btn-sm rounded-pill flex-grow-1 fw-bold" onClick={() => handleMonitorStation(station.id)}>MONITOR</button>
                                    <button className="btn btn-light border btn-sm rounded-pill px-3" onClick={() => handleViewHistory(station.id)}><i className="bi bi-clock-history"></i></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StationsGrid;