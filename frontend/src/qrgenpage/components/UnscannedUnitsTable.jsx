import React from 'react';

const UnscannedUnitsTable = ({ unscannedUnits }) => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-light border-0">
            <h5 className="mb-0 fw-bold text-dark">
                <i className="bi bi-box me-2 text-primary"></i>
                Units For Initial Scanning (<strong>{unscannedUnits.length}</strong> Units)
            </h5>
            <p className="small text-muted mb-0">These units have been created and are ready for the production floor (Station 1).</p>
        </div>
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-striped table-sm mb-0 small align-middle">
                <thead className="table-light sticky-top">
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

export default UnscannedUnitsTable;