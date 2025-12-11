import React from 'react';

export const UnitListTable = ({ units, listStatus, loading, error, onEdit }) => {
    // Determine if the table should display the 'ACTIONS' column based on status.
    const canEdit = ['in progress', 'completed', 'no good'].some(s => listStatus.toLowerCase().includes(s.replace(' (ng)', '')));
    
    // Header for the content section
    const displayTitle = listStatus.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (loading || error || units.length === 0) {
        if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border" role="status"></div><p className="mt-2">Loading...</p></div>;
        if (error) return <div className="alert alert-danger">{error}</div>;
        return <div className="text-center py-5 bg-light p-4 rounded border border-dashed text-muted"><p>No Units Found for "{displayTitle}"</p></div>;
    }

    return (
        <div className="table-responsive shadow-sm rounded animate-in fade-in">
            <h4 className="mb-4"><i className="bi bi-list-columns-reverse me-2 text-primary"></i>{displayTitle} Units</h4>
            <table className="table table-hover table-striped table-bordered mb-0 small text-nowrap">
                <thead className="table-dark text-center">
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
                        {canEdit && <th>ACTIONS</th>}
                    </tr>
                </thead>
                <tbody className="align-middle">
                    {units.map((unit) => (
                        <tr key={unit.id}>
                            <td className="fw-bold">{unit.model}</td>
                            <td>{unit.revision || '-'}</td>
                            <td className="font-monospace">{unit.base_unit_kitting_no || '-'}</td>
                            <td className="font-monospace text-primary">{unit.assembly_no}</td>
                            <td className="fw-semibold">{unit.device_serial_no || '-'}</td>
                            <td>{unit.accessory_kitting_no || '-'}</td>
                            <td className="text-center">
                                <span className={`badge ${unit.status.includes('Progress') ? 'bg-warning text-dark' : unit.status.includes('Completed') ? 'bg-success' : 'bg-danger'}`}>
                                    {unit.status}
                                </span>
                            </td>
                            <td><small className="text-muted">{unit.remarks}</small></td>
                            <td>{new Date(unit.created_at).toLocaleString()}</td>
                            {canEdit && (
                                <td className="text-center">
                                    <button onClick={() => onEdit(unit)} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit Status">
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};