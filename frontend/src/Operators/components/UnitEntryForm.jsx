import React, { useState, useEffect, useRef } from 'react';

// Fixed PCBA Details based on Control Card
const PCBA_FIXED_DATA = [
    { label: 'MNBD', model: 'EE-405-MNBD-PCBA-A3', code: '001-00-000034', prefix: 'MK001034-2450-', key: 'mnbd_no' },
    { label: 'CMBD', model: 'EE-405-CMBD-PCBA-A3', code: '001-00-000031', prefix: 'MK001031-2448-', key: 'cmbd_no' },
    { label: 'LRBD', model: 'EE-405-LRBD-PCBA-A3', code: '001-00-000030', prefix: 'MK001030-2440-', key: 'lrbd_no' },
    { label: 'PQBD', model: 'EE-405-PQBD-PCBA-A3', code: '001-00-000033', prefix: 'MK001033-2445-', key: 'pqbd_no' },
    { label: 'BKBD', model: 'EE-405-BKBD-PCBA-A4', code: '001-00-000041', prefix: 'MK001034-2502-', key: 'bkbd_no' }
];

export function UnitEntryForm({
    scanInput, setScanInput, handleScan, scannerInputRef, processStatus,
    statusMessage, handleSubmit, formData, setFormData, resetForm, currentStation,
    allUnits // Prop used to check for existing numbers in database
}) {
    const [isScannerEnabled, setIsScannerEnabled] = useState(true);

    const stn = currentStation ? currentStation.toString().replace(/\s+/g, '') : '';
    const isStation1 = stn.toLowerCase() === 'station1';
    const isStation5 = stn.toLowerCase() === 'station5';
    const isStation6 = stn.toLowerCase() === 'station6';
    const isStation11 = stn.toLowerCase() === 'station11';

    // 🔑 HELPER: Generate Unique Identifier and check against database records
    const generateUniqueID = (prefix, length = 6) => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 100) {
            result = prefix;
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            // Check if result already exists in the provided allUnits list (Database)
            const exists = allUnits?.some(u => 
                u.device_serial_no === result || 
                u.accessory_kitting_no === result || 
                u.base_unit_kitting_no === result
            );
            
            if (!exists) isUnique = true;
            attempts++;
        }
        return result;
    };

    // 🔑 FOCUS MANAGEMENT & AUTO-GENERATION LOGIC (DATABASE-AWARE)
    useEffect(() => {
        const handleGlobalClick = (e) => {
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            if (!isInputField && isScannerEnabled && (processStatus === 'idle' || processStatus === 'error')) {
                if (scannerInputRef.current) {
                    scannerInputRef.current.focus();
                }
            }
        };

        // DATABASE SYNC & GENERATION LOGIC
        if (formData.assemblyNo && formData.assemblyNo !== "") {
            // Find the current unit in the database list (allUnits)
            const unitInDb = allUnits?.find(u => u.assembly_no === formData.assemblyNo);
            
            let updates = {};

            // 1. DATA PRESERVATION: If database has values, pull them into the form immediately
            if (unitInDb) {
                if (!formData.accessoryKittingNo && unitInDb.accessory_kitting_no) {
                    updates.accessoryKittingNo = unitInDb.accessory_kitting_no;
                }
                if (!formData.deviceSerialNo && unitInDb.device_serial_no) {
                    updates.deviceSerialNo = unitInDb.device_serial_no;
                }
                if (!formData.baseUnitKittingNo && unitInDb.base_unit_kitting_no) {
                    updates.baseUnitKittingNo = unitInDb.base_unit_kitting_no;
                }
            }

            // 2. SMART GENERATION: Only generate if the field is empty in BOTH the form AND the database
            
            // Station 5: Accessory No
            if (isStation5 && (!formData.accessoryKittingNo && !unitInDb?.accessory_kitting_no)) {
                updates.accessoryKittingNo = generateUniqueID("ACC-");
            }
            
            // Station 6: Device Serial
            if (isStation6 && (!formData.deviceSerialNo && !unitInDb?.device_serial_no)) {
                updates.deviceSerialNo = generateUniqueID("SN-");
            }
            
            // Station 11: Base Unit Kitting No
            if (isStation11 && (!formData.baseUnitKittingNo && !unitInDb?.base_unit_kitting_no)) {
                updates.baseUnitKittingNo = generateUniqueID("KIT-");
            }

            // Apply all updates at once without wiping previous data
            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ 
                    ...prev, 
                    ...updates 
                }));
            }
        }

        if (isScannerEnabled && (processStatus === 'idle' || processStatus === 'error')) {
            if (scannerInputRef.current) scannerInputRef.current.focus();
            window.addEventListener('click', handleGlobalClick);
            return () => window.removeEventListener('click', handleGlobalClick);
        }
    }, [isScannerEnabled, processStatus, scannerInputRef, formData.assemblyNo, stn, allUnits]);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        let updatedData = { ...formData, status: newStatus };

        if (newStatus === "No Good (NG)") {
            PCBA_FIXED_DATA.forEach(board => {
                updatedData[board.key] = "";
            });
        }
        setFormData(updatedData);
    };

    const essentialFields = [formData.model, formData.revision, formData.assemblyNo];
    const progressPercent = Math.min(
        (essentialFields.filter(val => val && val.trim() !== "").length / essentialFields.length) * 100, 
        100
    ).toFixed(0);

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (formData.status === "No Good (NG)" && (!formData.remarks || formData.remarks.trim() === "")) {
            alert("⚠️ VALIDATION ERROR: Remarks are required when status is set to No Good (NG).");
            return;
        }
        
        if (isStation1 && formData.status === "In Progress") {
            const missing = PCBA_FIXED_DATA.filter(b => !formData[b.key] || formData[b.key].trim().length < 6);
            if (missing.length > 0) {
                alert(`⚠️ TRACEABILITY ERROR: Please input the FULL 6-digit serial numbers for all 5 boards to set unit to In Progress.`);
                return; 
            }
        }

        if (isStation1) {
            const missing = PCBA_FIXED_DATA.filter(b => !formData[b.key] || formData[b.key].trim().length < 6);
            if (missing.length > 0 && formData.status !== "No Good (NG)") {
                alert(`⚠️ TRACEABILITY ERROR: Please input the FULL 6-digit serial numbers for all boards at Station 1.`);
                return; 
            }
        }

        let checklist_data = null;
        if (isStation1) {
            checklist_data = { header_seated_90_deg: "GO", leads_properly_soldered: "GO" };
        } else if (stn === 'Station2') {
            checklist_data = { integrated_board_level_test1: "Detected", integrated_board_level_test2: "Detected", integrated_board_level_test3: "Detected" };
        } else if (stn === 'Station6') {
            checklist_data = { lora_module: "Detected", energy_meter: "Detected", power_good_test: "Detected", voltage: "115", line1: "115", line2: "115", line3: "115", temp_reading: "PASS", freq_reading: "GO", led_status_4g: "GO", led_status_fast_blink: "GO", go_no_go: "GO", test_duration: "120" };
        } else if (stn === 'Station7') {
            checklist_data = { performed_passed: "GO", result_recorded: "GO" };
        } else if (stn === 'Station8') {
            checklist_data = { burnin_completed: "GO", no_failure_observed: "GO" };
        } else if (stn === 'Station10') {
            checklist_data = { post_performed_passed: "GO", post_result_recorded: "GO" };
        } else if (stn === 'Station11') {
            checklist_data = { functions_working: "GO", connectivity_passed: "GO" };
        } else if (stn === 'Station12') {
            checklist_data = { stickers_attached: "GO", stickers_readable: "GO" };
        }

        handleSubmit(e, checklist_data);
    };

    return (
        <div className="row g-3 animate-in fade-in" style={{ fontFamily: "'Inter', sans-serif", color: '#212529' }}>
            <div className="col-12">
                <div className={`card border-0 shadow-sm ${isScannerEnabled ? 'bg-white' : 'bg-light'}`} 
                     style={{ borderRadius: '8px', borderLeft: isScannerEnabled ? '4px solid #198754' : '4px solid #6c757d' }}>
                    <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className={`${isScannerEnabled ? 'bg-success' : 'bg-secondary'} rounded-circle me-3`} 
                                 style={{ width: '10px', height: '10px', animation: isScannerEnabled ? 'pulse 2s infinite' : 'none' }}>
                            </div>
                            <div>
                                <small className="text-muted d-block fw-bold" style={{ fontSize: '0.6rem' }}>SCANNER STATUS</small>
                                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{isScannerEnabled ? 'READY TO SCAN ASSEMBLY' : 'SCANNER OFF'}</span>
                            </div>
                            <div className="ms-4 ps-4 border-start d-none d-md-block">
                                <small className="text-muted d-block fw-bold" style={{ fontSize: '0.6rem' }}>STATION ID</small>
                                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{stn}</span>
                            </div>
                        </div>
                        <div className="form-check form-switch">
                            <input className="form-check-input shadow-none" type="checkbox" checked={isScannerEnabled} onChange={(e) => setIsScannerEnabled(e.target.checked)} />
                        </div>
                    </div>
                    <form onSubmit={handleScan} className="visually-hidden">
                        <input ref={scannerInputRef} type="text" value={scanInput} onChange={(e) => setScanInput(e.target.value)} disabled={!isScannerEnabled || (processStatus !== 'idle' && processStatus !== 'error')} />
                    </form>
                </div>
            </div>

            <div className="col-12">
                <form onSubmit={handleFormSubmit} className="card border-0 shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.85rem' }}>Unit Data Entry - {currentStation}</h6>
                            <div className="text-end" style={{ width: '120px' }}>
                                <div className="progress" style={{ height: '4px', borderRadius: '0' }}>
                                    <div className="progress-bar bg-success" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4 bg-light-subtle">
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small mb-1">MODEL</label>
                                <input type="text" className="form-control form-control-sm border-0 bg-light" value={formData.model || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small mb-1">REVISION</label>
                                <input type="text" className="form-control form-control-sm border-0 bg-light" value={formData.revision || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small mb-1">ASSEMBLY NO.</label>
                                <input type="text" className="form-control form-control-sm border-primary bg-white fw-bold shadow-sm" value={formData.assemblyNo || ''} readOnly placeholder="SCAN QR CODE" />
                            </div>
                        </div>

                        {isStation1 && (
                            <div className="col-12 mb-4 animate-in slide-in">
                                <div className="p-3 border rounded bg-white shadow-sm" style={{ borderTop: '4px solid #0d6efd' }}>
                                    <h6 className="fw-bold text-primary mb-3 small"><i className="bi bi-cpu-fill me-2"></i>PCBA BOARD DETAILS (REQUIRED)</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered align-middle text-center small" style={{ fontSize: '0.7rem' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>PCBA MODEL</th>
                                                    <th>PARTS CODE</th>
                                                    <th className="bg-primary-subtle text-primary">BOARD SERIAL (6 DIGITS)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PCBA_FIXED_DATA.map((board) => (
                                                    <tr key={board.key}>
                                                        <td className="fw-semibold text-start ps-3">{board.model}</td>
                                                        <td className="text-muted">{board.code}</td>
                                                        <td style={{ width: '280px' }}>
                                                            <div className="input-group input-group-sm">
                                                                <span className="input-group-text bg-light border-primary-subtle" style={{ fontSize: '0.6rem' }}>{board.prefix}</span>
                                                                <input 
                                                                    type="text" maxLength="6"
                                                                    className="form-control form-control-sm fw-bold border-primary text-primary" 
                                                                    placeholder="000000"
                                                                    value={formData[board.key] || ''}
                                                                    onChange={(e) => setFormData({...formData, [board.key]: e.target.value.toUpperCase()})}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-1 small text-muted italic">* Input the 6 handwritten digits from the card.</div>
                                </div>
                            </div>
                        )}

                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className={`form-label fw-bold small mb-1 ${isStation6 ? 'text-primary' : 'text-muted'}`}>
                                    SERIAL NO. {isStation6 && <i className="bi bi-magic ms-1" title="Auto-generated"></i>}
                                </label>
                                <input type="text" className={`form-control form-control-sm ${isStation6 ? 'border-primary fw-bold' : 'bg-light'}`} value={formData.deviceSerialNo || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className={`form-label fw-bold small mb-1 ${isStation5 ? 'text-primary' : 'text-muted'}`}>
                                    ACCESSORY NO. {isStation5 && <i className="bi bi-magic ms-1" title="Auto-generated"></i>}
                                </label>
                                <input type="text" className={`form-control form-control-sm ${isStation5 ? 'border-primary fw-bold' : 'bg-light'}`} value={formData.accessoryKittingNo || ''} readOnly />
                            </div>
                            <div className="col-md-4">
                                <label className={`form-label fw-bold small mb-1 ${isStation11 ? 'text-primary' : 'text-muted'}`}>
                                    BASE UNIT KITTING NO. {isStation11 && <i className="bi bi-magic ms-1" title="Auto-generated"></i>}
                                </label>
                                <input type="text" className={`form-control form-control-sm ${isStation11 ? 'border-primary fw-bold' : 'bg-light'}`} value={formData.baseUnitKittingNo || ''} readOnly />
                            </div>

                            <div className="col-12 mt-3">
                                <label className="form-label fw-bold small mb-1">STATUS <span className="text-danger">*</span></label>
                                <select className="form-select form-select-sm border-secondary-subtle shadow-none" value={formData.status || 'In Progress'} onChange={handleStatusChange}>
                                    <option value="In Progress">In Progress</option>
                                    <option value="No Good (NG)">No Good (NG)</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small mb-1">REMARKS {formData.status === 'No Good (NG)' && <span className="text-danger">*</span>}</label>
                                <textarea className={`form-control form-control-sm shadow-none ${formData.status === 'No Good (NG)' ? 'border-danger' : 'border-secondary-subtle'}`} rows="2" placeholder="Notes for this unit..." value={formData.remarks || ''} onChange={(e) => setFormData({...formData, remarks: e.target.value})}></textarea>
                            </div>
                        </div>

                        {statusMessage && (
                            <div className={`mt-3 p-3 border-start border-4 small fw-bold shadow-sm ${processStatus === 'error' ? 'border-danger text-danger bg-danger-subtle' : 'border-success text-success bg-success-subtle'}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi ${processStatus === 'error' ? 'bi-exclamation-octagon-fill' : 'bi-check-circle-fill'} me-2`}></i>
                                    <span>{statusMessage.toString().toUpperCase()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary px-4 fw-bold shadow-none" onClick={resetForm}>CLEAR</button>
                        <button type="submit" className="btn btn-sm btn-success px-5 fw-bold shadow-sm" style={{ letterSpacing: '1px' }} disabled={!formData.assemblyNo || processStatus === 'processing'}>
                            {processStatus === 'processing' ? 'SAVING...' : 'SAVE UNIT'}
                        </button>
                    </div>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                input[readonly] { background-color: #f8f9fa !important; color: #495057; cursor: not-allowed; border: 1px solid #dee2e6 !important; }
                .form-select:focus, .form-control:focus { border-color: #0d6efd !important; box-shadow: none !important; }
                .bg-success-subtle { background-color: #d1e7dd !important; color: #0f5132 !important; }
                .bg-danger-subtle { background-color: #f8d7da !important; color: #842029 !important; }
            ` }} />
        </div>
    );
}