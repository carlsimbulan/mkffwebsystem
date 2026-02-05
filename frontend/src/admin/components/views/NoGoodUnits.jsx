import React, { useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const processStations = [
    "PCB Pairing", "Integrated Board Test", "Main Board Conformal Coating",
    "RTV Application", "Casing/Harnessing", "Complete Unit Test/Calibration",
    "Pre BI Hi-Pot Test", "Burn-in Testing", "Sealing", "Post BI Hi-Pot Test",
    "Final Functional/Connectivity Test", "Label Sticker Attachment", "FVI",
    "Packing", "QC Stamping"
];

const NoGoodUnits = ({ logs, handleEditClick }) => {
    const allNoGoodLogs = useMemo(() => {
        return (logs || []).filter(log => {
            const status = log.status?.toLowerCase() || '';
            return status.includes('no good') || status === 'ng';
        });
    }, [logs]);

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-x-circle me-2 text-danger"></i>
                    No Good (NG) Units
                </h4>
                <div className="badge bg-danger bg-opacity-10 text-danger px-3 py-2">
                    <i className="bi bi-hash me-1"></i>
                    {allNoGoodLogs.length} Units
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border-0 px-4 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    MODEL
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    REVISION
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    BASE UNIT
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ASSEMBLY
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    DEVICE SERIAL
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ACCESSORY
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ERROR STATION
                                </th>
                                <th className="border-0 px-3 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    STATUS
                                </th>
                                <th className="border-0 px-3 py-3 fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    LAST MOVEMENT
                                </th>
                                <th className="border-0 px-4 py-3 text-center fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allNoGoodLogs.map(log => (
                                <tr key={log.id} className="border-bottom hover-bg-primary hover-bg-opacity-5 transition-all">
                                    <td className="ps-4 py-3">
                                        <div className="fw-bold text-dark">{log.model}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="badge bg-light text-dark rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                            {log.revision || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-muted small fst-italic">{log.base_unit_kitting_no || '---'}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <code className="text-primary fw-bold bg-light px-2 py-1 rounded" style={{ fontSize: '0.8rem' }}>
                                            {log.assembly_no}
                                        </code>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-muted small">{log.device_serial_no || '---'}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="text-muted small">{log.accessory_kitting_no || '---'}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-danger bg-opacity-10 rounded-circle p-1 me-2">
                                                <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '0.7rem' }}></i>
                                            </div>
                                            <span className="fw-bold text-danger small">
                                                {log.station_name || log.station || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="badge bg-danger px-3 py-2 rounded-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="text-muted small">
                                            <i className="bi bi-clock me-1"></i>
                                            {formatTimestamp(log.updated_at || log.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button 
                                                className="btn btn-sm btn-outline-danger rounded p-2 transition-all" 
                                                onClick={() => handleEditClick(log)}
                                                title="Manage"
                                            >
                                                <i className="bi bi-gear"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .hover-bg-primary:hover {
                    background-color: rgba(13, 110, 253, 0.03) !important;
                }
                
                .transition-all {
                    transition: all 0.15s ease;
                }
                
                .border-bottom {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
                }
                
                .badge {
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }
                
                .table {
                    border-collapse: separate;
                    border-spacing: 0;
                }
                
                .shadow-sm {
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
                }
            `}</style>
        </div>
    );
};

export { NoGoodUnits };