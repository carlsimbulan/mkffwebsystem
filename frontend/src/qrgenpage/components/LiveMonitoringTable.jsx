import React from 'react';

const LiveMonitoringTable = ({ stationId, units, onBack, calculateStationMetrics }) => {
    const stationUnits = units.filter(u => u.station === stationId && u.status !== 'For Scanning');
    const metrics = calculateStationMetrics(stationUnits);

    const getStatusClass = (status) => {
        if (status === 'In Progress') return 'bg-primary';
        if (status === 'Completed') return 'bg-success';
        if (status === 'No Good (NG)' || status === 'Pending Approval') return 'bg-danger';
        return 'bg-secondary';
    };

    return (
        <div className="animate-in fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h4 className="mb-0 fw-bold text-primary"><i className="bi bi-activity me-2"></i>Live Units at {stationId}</h4>
                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onBack}><i className="bi bi-arrow-left me-2"></i>Back</button>
            </div>
            <div className="row g-4 mb-4">
                {[
                    { title: "Completed", value: metrics.completed, color: "success", icon: "bi-check-circle-fill" },
                    { title: "In Progress", value: metrics.inProgress, color: "primary", icon: "bi-hourglass-split" },
                    { title: "No Good (NG)", value: metrics.noGood, color: "danger", icon: "bi-exclamation-octagon-fill" },
                    { title: "Yield Rate", value: `${metrics.yieldRate}%`, color: "info", icon: "bi-graph-up-arrow" }
                ].map((card, i) => (
                    <div className="col-md-3" key={i}>
                        <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${card.color}`}>
                            <div className="card-body p-4 text-center">
                                <i className={`${card.icon} fs-4 text-${card.color}`}></i>
                                <h6 className="text-muted small mt-2">{card.title}</h6>
                                <h2 className="fw-bold mb-0">{card.value}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-striped table-sm mb-0 small align-middle">
                        <thead className="table-dark">
                            <tr><th>Model</th><th>Rev</th><th>Base Kit</th><th>Assembly No.</th><th>Serial No.</th><th>Acc Kit</th><th>Status</th><th>Remarks</th></tr>
                        </thead>
                        <tbody>
                            {stationUnits.map(unit => (
                                <tr key={unit.id}>
                                    <td>{unit.model}</td><td>{unit.revision}</td><td>{unit.base_unit_kitting_no}</td>
                                    <td className="fw-bold text-primary">{unit.assembly_no}</td><td>{unit.device_serial_no || 'Pending'}</td>
                                    <td>{unit.accessory_kitting_no}</td><td><span className={`badge ${getStatusClass(unit.status)}`}>{unit.status}</span></td>
                                    <td>{unit.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitoringTable;