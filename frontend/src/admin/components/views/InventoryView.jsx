import React, { useState, useMemo } from 'react';

export const InventoryView = ({ pcbaLogs, onUpdateSerial }) => {
    const [editingCell, setEditingCell] = useState(null); 
    const [tempValue, setTempValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null); 
    const [isSaving, setIsSaving] = useState(false); 
    const itemsPerPage = 10; 

    const pcbaMapping = [
        { model: 'EE-405-MNBD-PCBA-A3', code: '001-00-000034', prefix: 'MK001034-2450-', key: 'mnbd_board_no' },
        { model: 'EE-405-CMBD-PCBA-A3', code: '001-00-000031', prefix: 'MK001031-2448-', key: 'cmbd_board_no' },
        { model: 'EE-405-LRBD-PCBA-A3', code: '001-00-000030', prefix: 'MK001030-2440-', key: 'lrbd_board_no' },
        { model: 'EE-405-PQBD-PCBA-A3', code: '001-00-000033', prefix: 'MK001033-2445-', key: 'pqbd_board_no' },
        { model: 'EE-405-BKBD-PCBA-A4', code: '001-00-000041', prefix: 'MK001034-2502-', key: 'bkbd_board_no' }
    ];

    const filteredLogs = useMemo(() => {
        return pcbaLogs.filter(log => 
            log.assembly_no?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pcbaLogs, searchTerm]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage]);

    const handleEdit = (logId, key, currentVal) => {
        setEditingCell({ logId, key });
        setTempValue(currentVal || '');
    };

    const handleSave = async (logId, key) => {
        setIsSaving(true);
        try {
            // Siguraduhin na ang path na ito ay tama base sa folder sa htdocs mo
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: logId,
                    column: key,
                    newValue: tempValue
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (onUpdateSerial) onUpdateSerial(logId, key, tempValue);
                setEditingCell(null);
            } else {
                alert("Database Error: " + result.message);
            }
        } catch (error) {
            console.error("Database connection failed:", error);
            alert("Connection Error: Check if XAMPP is running and the URL is correct.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-2">
            <style>{`
                .inventory-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px; overflow: hidden; }
                .card-header-btn { width: 100%; border: none; background: #f8fafc; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; outline: none; }
                .card-header-btn:hover { background: #f1f5f9; }
                .assembly-text { font-weight: 800; color: #0f172a; font-family: 'SFMono-Regular', Consolas, monospace; }
                .pcba-table { width: 100%; border-collapse: collapse; background: #fff; }
                .pcba-table th { font-size: 0.65rem; text-transform: uppercase; color: #64748b; padding: 10px 20px; border-bottom: 1px solid #f1f5f9; text-align: left; background: #fff; }
                .pcba-table td { padding: 10px 20px; border-bottom: 1px solid #f8fafc; font-size: 0.8rem; }
                .edit-input { width: 85px; border: 1px solid #2563eb; border-radius: 4px; padding: 0 4px; outline: none; font-weight: 800; color: #2563eb; font-family: monospace; }
                .edit-btn { font-size: 0.65rem; font-weight: 700; border: 1px solid #e2e8f0; background: #fff; color: #64748b; padding: 2px 8px; border-radius: 4px; transition: 0.2s; }
                .edit-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; }
                .save-btn { font-size: 0.65rem; font-weight: 700; background: #10b981; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; margin-left: 5px; }
                .save-btn:disabled { background: #94a3b8; opacity: 0.7; }
                .search-box { padding-left: 35px !important; height: 42px; border-radius: 10px; border: 1px solid #e2e8f0; width: 100%; font-size: 0.9rem; }
                .pagination-btn { padding: 6px 14px; border: 1px solid #e2e8f0; background: #fff; font-size: 0.75rem; font-weight: 800; border-radius: 6px; color: #475569; }
                .pagination-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .prefix-text { color: #94a3b8; font-size: 0.75rem; font-family: monospace; }
            `}</style>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h5 className="fw-bold text-dark mb-0">Component Traceability</h5>
                    <p className="text-muted small mb-0 fw-bold text-uppercase" style={{letterSpacing: '0.5px'}}>Industrial Serialization Registry</p>
                </div>
                <div className="position-relative" style={{ minWidth: '300px' }}>
                    <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                    <input 
                        type="text" 
                        className="form-control search-box" 
                        placeholder="Search Assembly No..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>
            
            {paginatedLogs.length > 0 ? (
                <>
                    <div className="mb-4">
                        {paginatedLogs.map((item) => (
                            <div key={item.id} className="inventory-card">
                                <button className="card-header-btn" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                    <div className="d-flex align-items-center">
                                        <span className="assembly-text fs-6">{item.assembly_no}</span>
                                        <span className="ms-3 badge bg-white text-muted border fw-bold" style={{ fontSize: '0.6rem' }}>
                                            {new Date(item.created_at).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <small className="text-muted d-none d-md-inline fw-bold" style={{fontSize: '0.6rem'}}>UID: {item.id}</small>
                                        <i className={`bi bi-chevron-${expandedId === item.id ? 'up' : 'down'} text-primary`}></i>
                                    </div>
                                </button>

                                {expandedId === item.id && (
                                    <div className="p-3 bg-light border-top text-start">
                                        <table className="pcba-table border rounded overflow-hidden">
                                            <thead>
                                                <tr>
                                                    <th>PCBA Module Model</th>
                                                    <th className="text-center">Code</th>
                                                    <th className="text-end">Serial Number (6 Digits)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pcbaMapping.map((map, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-bold text-dark">{map.model}</td>
                                                        <td className="text-center text-muted small">{map.code}</td>
                                                        <td className="text-end">
                                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                                <span className="prefix-text">{map.prefix}</span>
                                                                {editingCell?.logId === item.id && editingCell?.key === map.key ? (
                                                                    <>
                                                                        <input 
                                                                            autoFocus
                                                                            maxLength={6}
                                                                            disabled={isSaving}
                                                                            className="edit-input"
                                                                            value={tempValue}
                                                                            onChange={(e) => setTempValue(e.target.value)}
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, map.key)}
                                                                        />
                                                                        <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, map.key)}>
                                                                            {isSaving ? '...' : 'SAVE'}
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="fw-bold text-primary font-monospace">{item[map.key] || '000000'}</span>
                                                                        <button className="edit-btn" onClick={() => handleEdit(item.id, map.key, item[map.key])}>EDIT</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                        <small className="fw-bold text-muted text-uppercase" style={{fontSize: '0.65rem'}}>
                            Showing {paginatedLogs.length} Records
                        </small>
                        <div className="d-flex gap-2">
                            <button className="pagination-btn" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); setExpandedId(null); }}>PREV</button>
                            <button className="pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => { setCurrentPage(p => p + 1); setExpandedId(null); }}>NEXT</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-5 border rounded-4 bg-light shadow-sm" style={{ borderStyle: 'dashed' }}>
                    <p className="fw-bold text-muted uppercase">No Matching Assembly Found</p>
                </div>
            )}
        </div>
    );
};