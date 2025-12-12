// src/components/Shipment.jsx (FINAL REVISION: Correct Table Structure & Fixed Date Error)
import React from 'react';
// 💡 NOTE: moment import REMOVED to fix 'Module not found' error.

// Final Station bago i-ship
const TARGET_STATION = 'Station15'; 

export const Shipment = ({ liveUnitLogs, onMarkAsShipped }) => {
    
    // Function para i-format ang petsa at oras nang walang moment
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        
        // Define options for toLocaleString (Example output: "Dec 12, 2025 9:59 PM")
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
        };
        
        return date.toLocaleString('en-US', options);
    };

    // Filter 1: Status must be 'Completed'
    // Filter 2: Station must be 'Station15' (Normalization handles 'Station 15' vs 'Station15')
    const unitsForShipment = liveUnitLogs.filter(log => 
        log.status === 'Completed' && 
        log.station.replace(/\s/g, '').toLowerCase() === TARGET_STATION.toLowerCase()
    );

    // Dummy handler for the "Mark as Shipped" action
    const handleMarkAsShipped = (unitId) => {
        // FUTURE API LOGIC: You will send an API request here to mark the unit as 'Shipped'
        alert(`Unit ${unitId} is marked as Shipped. Next step: API integration to update database status to 'Shipped'.`);
        
        if (onMarkAsShipped) {
            // Trigger a data refresh in AdminPage to remove the unit from this list
            onMarkAsShipped(unitId); 
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-success text-white"> 
                <i className="bi bi-truck me-2"></i> Shipment Queue (Final Station: {TARGET_STATION})
            </div>
            <div className="card-body">
                <h4 className="card-title">Completed Units from {TARGET_STATION} Ready for Shipping</h4>
                <p className="card-text text-muted">
                    This table displays units that have successfully finished the final quality check at **{TARGET_STATION}** (Status: **Completed**). These units are considered **All Goods** and ready to be processed for shipment.
                </p>

                <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {unitsForShipment.length > 0 ? (
                        <table className="table table-hover table-striped table-sm align-middle">
                            <thead className="sticky-top bg-light shadow-sm">
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
                                    <th className="text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unitsForShipment.map(unit => (
                                    <tr key={unit.id}>
                                        {/* MODEL */}
                                        <td><span className="fw-bold text-dark">{unit.model || 'N/A'}</span></td>
                                        
                                        {/* REVISION */}
                                        <td>{unit.revision || 'N/A'}</td>
                                        
                                        {/* BASE UNIT (base_unit_kitting_no) */}
                                        <td>{unit.base_unit_kitting_no || 'N/A'}</td>
                                        
                                        {/* ASSEMBLY (assembly_no) */}
                                        <td>{unit.assembly_no || 'N/A'}</td>
                                        
                                        {/* DEVICE SERIAL */}
                                        <td><span className="badge bg-secondary">{unit.device_serial_no}</span></td>
                                        
                                        {/* ACCESSORY (accessory_kitting_no) */}
                                        <td>{unit.accessory_kitting_no || 'N/A'}</td>
                                        
                                        {/* STATUS */}
                                        <td><span className="badge bg-success">{unit.status}</span></td>
                                        
                                        {/* REMARKS */}
                                        <td>{unit.remarks || 'None'}</td>
                                        
                                        {/* TIME DATE (Fixed using formatDateTime) */}
                                        <td>{formatDateTime(unit.created_at)}</td>
                                        
                                        {/* ACTION */}
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleMarkAsShipped(unit.id)}
                                                title="Mark this unit as officially shipped and remove from queue."
                                            >
                                                <i className="bi bi-box-seam me-1"></i> Ship
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="alert alert-info text-center mt-4">
                            <i className="bi bi-info-circle-fill me-2"></i> 
                            There are currently no units with a 'Completed' status from **{TARGET_STATION}** ready for shipment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};