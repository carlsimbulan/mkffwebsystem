import React, { useState } from 'react';
import { UnitDetailsModal } from '../modals/UnitDetailsModal';

const LiveMonitoringTable = ({ stationId, units, onBack, calculateStationMetrics }) => {
    console.log('LiveMonitoringTable - stationId:', stationId);
    console.log('LiveMonitoringTable - units count:', units.length);
    console.log('LiveMonitoringTable - sample unit stations:', units.slice(0, 5).map(u => ({ station: u.station, status: u.status })));
    
    const stationUnits = units.filter(u => u.station?.toString().replace(/\s+/g, '') === stationId && u.status !== 'For Scanning');
    console.log('LiveMonitoringTable - filtered stationUnits count:', stationUnits.length);
    
    const metrics = calculateStationMetrics(stationUnits);
    const [selectedUnit, setSelectedUnit] = useState(null);

    const getStatusClass = (status) => {
        if (status === 'In Progress') return 'bg-primary';
        if (status === 'Completed') return 'bg-success';
        if (status === 'No Good (NG)' || status === 'Pending Approval') return 'bg-danger';
        return 'bg-secondary';
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Live Units at {stationId}</h4>
                    <p className="text-muted small mb-0">Real-time monitoring of units in this station</p>
                </div>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onBack}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Stations
                </button>
            </div>
            
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <div className="text-muted small">Completed</div>
                                    <h3 className="fw-bold mb-0">{metrics.completed}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <i className="bi bi-hourglass-split fs-2 text-primary"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <div className="text-muted small">In Progress</div>
                                    <h3 className="fw-bold mb-0">{metrics.inProgress}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <i className="bi bi-exclamation-octagon-fill fs-2 text-danger"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <div className="text-muted small">No Good (NG)</div>
                                    <h3 className="fw-bold mb-0">{metrics.noGood}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0" style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <i className="bi bi-graph-up-arrow fs-2 text-info"></i>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <div className="text-muted small">Yield Rate</div>
                                    <h3 className="fw-bold mb-0">{metrics.yieldRate}%</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom">
                    <h6 className="mb-0 fw-bold text-dark">Units in Station</h6>
                    <small className="text-muted">{stationUnits.length} units currently in this station</small>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle" style={{ fontSize: '0.85rem', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>MODEL</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>REVISION</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>BASE UNIT</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>ASSEMBLY</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>DEVICE SERIAL</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>ACCESSORY</th>
                                    <th className="px-3 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>STATUS</th>
                                    <th className="px-3 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>DELAY</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>REMARKS</th>
                                    <th className="px-3 py-3 fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderRight: '1px solid #6c757d', borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>LAST UPDATE</th>
                                    <th className="px-4 py-3 text-center fw-semibold text-white" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: '#495057', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stationUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox display-6 d-block mb-3 opacity-25"></i>
                                            <div>No units in this station</div>
                                        </td>
                                    </tr>
                                ) : (
                                    stationUnits.map(unit => {
                                        const lastTs = unit.updated_at || unit.created_at;
                                        const minutesInStation = lastTs
                                            ? Math.max(0, (new Date().getTime() - new Date(lastTs).getTime()) / (1000 * 60))
                                            : 0;
                                        
                                        return (
                                            <tr key={unit.id} className="border-bottom">
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold text-dark">{unit.model}</div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                        {unit.revision || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-muted small fst-italic">{unit.base_unit_kitting_no || '---'}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                                        {unit.assembly_no}
                                                    </code>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-muted small">{unit.device_serial_no || '---'}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-muted small fst-italic">{unit.accessory_kitting_no || '---'}</span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`badge ${getStatusClass(unit.status)} rounded-pill px-3 py-1`} style={{ fontSize: '0.7rem' }}>
                                                        {unit.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                        {minutesInStation.toFixed(0)}m
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="text-muted small">{unit.remarks || '---'}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-muted small">
                                                        {lastTs ? new Date(lastTs).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : '---'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        className="btn btn-primary btn-sm fw-bold px-3"
                                                        onClick={() => setSelectedUnit(unit)}
                                                        style={{ fontSize: '0.7rem' }}
                                                    >
                                                        DETAILS
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {selectedUnit && (
                <UnitDetailsModal 
                    unit={selectedUnit}
                    onClose={() => setSelectedUnit(null)}
                />
            )}
        </div>
    );
};

export default LiveMonitoringTable;