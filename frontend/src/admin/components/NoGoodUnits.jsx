import React, { useState, useMemo } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// EXPORT AS DEFAULT to match your import style in AdminPage.jsx
const NoGoodUnits = ({ logs, userList, handleEditClick }) => {
    // 1. DEFINE BUTTONS/OPTIONS (Mapped to specific Station IDs where the unit failed/became NG)
    const actionButtons = [
        // Grid 1: PCB Pairing (Station1) -> VI Process Flow
        { id: 'VI_PROCEDURE', label: 'Refer to VI Process Flow Work Procedure', stationIDs: ['Station1'] }, 
        
        // Grid 2: Integrated Board Test (Station2) -> Customer Verification Hold
        { id: 'CUSTOMER_VERIFICATION', label: 'PUT on Hold For Customer Verification', stationIDs: ['Station2'] }, 
        
        // Grid 3: Complete Unit Test/Calibration (Station6) -> Complete Unit Test Flow
        { id: 'UNIT_TEST_FLOW', label: 'Refer to Complete Unit Test Flow Work Procedure', stationIDs: ['Station6'] },
        
        // Grid 4: Pre BI Hi-Pot Test (Station7) -> Hi-Pot Test Flow
        { id: 'HI_POT_TEST', label: 'Refer to Hi-Pot Test Flow Work Procedure', stationIDs: ['Station7'] },
        
        // Grid 5: Burn-in Testing (Station8) -> Burn In Test Flow
        { id: 'BURN_IN_TEST', label: 'Refer to Burn In Test Flow Work Procedure', stationIDs: ['Station8'] },
        
        // Grid 6: Final Functional/Connectivity Test (Station11) -> Final Functionality Test Flow
        { id: 'FINAL_FUNC_TEST', label: 'Refer to Final Functionality Test Flow Work Procedure', stationIDs: ['Station11'] },
        
        // Grid 7: Rework Procedure (Station9, 12, 13)
        // Station9: Sealing, Station12: Label Sticker, Station13: FVI
        { id: 'REJECTED_REWORK', label: 'Refer to CONTROL OF REJECTED MATERIALS/PRODUCT Rework Procedure', stationIDs: ['Station9', 'Station12', 'Station13'] },
        
        // Grid 8: QC Stamping (Station15) -> Batch for Shipment Hold
        { id: 'BATCH_SHIPMENT_HOLD', label: 'Batch for Shipment PUT-ON HOLD', stationIDs: ['Station15'] },
    ];

    // 2. STATE MANAGEMENT
    const [selectedAction, setSelectedAction] = useState(null); 

    // Filter all logs once to get only 'No Good (NG)' units
    const initialNoGoodLogs = useMemo(() => {
        return logs.filter(log => log.status === 'No Good (NG)');
    }, [logs]);

    // 3. FILTERED LOGS BASED ON SELECTED ACTION (Logic based on Station ID)
    const filteredLogs = useMemo(() => {
        if (!selectedAction) return [];
        
        const targetStationIDs = selectedAction.stationIDs;

        // Filter the initial NG logs based on the unit's recorded station
        return initialNoGoodLogs.filter(log => {
            // Normalize the log station name for direct comparison (remove spaces)
            const logStationId = log.station.replace(/\s+/g, '');
            
            // Check if the log's station ID is included in the target list of stations for the action
            return targetStationIDs.includes(logStationId);
        });

    }, [selectedAction, initialNoGoodLogs]);


    // Helper function to format date/time
    const formatTimestamp = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };


    // 4. RENDER METHOD
    return (
        <div className="container-fluid px-0">
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-x-octagon-fill me-2"></i> No Good (NG) Units Action Tracker
                    </h5>
                    <span className="badge bg-light text-dark">Total NG Units in System: {initialNoGoodLogs.length}</span>
                </div>
                
                <div className="card-body">
                    <p className="text-muted">Select an action/procedure below to view the **No Good units that failed at the specific station(s)** associated with it.</p>
                    
                    {/* ACTION BUTTONS GRID */}
                    <div className="row g-2 mb-4">
                        {actionButtons.map((action) => {
                            // Calculate how many NG units match this action (for display count)
                            const count = initialNoGoodLogs.filter(log => action.stationIDs.includes(log.station.replace(/\s+/g, ''))).length;
                            
                            return (
                                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={action.id}>
                                    <button
                                        className={`btn w-100 text-start d-flex align-items-center justify-content-between ${selectedAction?.id === action.id ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => setSelectedAction(action)}
                                        style={{ whiteSpace: 'normal', height: '100%' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            {selectedAction?.id === action.id 
                                                ? <i className="bi bi-check-circle-fill me-2 fs-5"></i> 
                                                : <i className="bi bi-arrow-right-short me-2 fs-5"></i>
                                            }
                                            <span className="fw-medium">{action.label}</span>
                                        </div>
                                        <span className={`badge ${selectedAction?.id === action.id ? 'bg-light text-danger' : 'bg-danger'} fw-bold ms-2`}>{count}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* DYNAMIC CONTENT / TABLE DISPLAY */}
                    {selectedAction && (
                        <div className="mt-4 border-top pt-3">
                            <h5 className="mb-3 text-danger">
                                Units for: <span className="fw-bold">{selectedAction.label}</span>
                                <span className="badge bg-secondary ms-2">{filteredLogs.length} Total Units</span>
                            </h5>

                            {filteredLogs.length === 0 ? (
                                <div className="alert alert-warning text-center">
                                    No No Good (NG) units found that failed at the associated station(s).
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className="table table-bordered table-striped table-sm">
                                        <thead className="table-danger sticky-top">
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
                                            {filteredLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>{log.model}</td>
                                                    <td>{log.revision}</td>
                                                    <td>{log.base_unit_kitting_no}</td>
                                                    <td>{log.assembly_no}</td>
                                                    <td>{log.device_serial_no}</td>
                                                    <td>{log.accessory_kitting_no}</td>
                                                    <td><span className="badge bg-danger">{log.status}</span></td>
                                                    <td>{log.remarks || '-'}</td>
                                                    <td>{formatTimestamp(log.created_at)}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleEditClick(log)}
                                                        >
                                                            Edit/Rework
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoGoodUnits;