import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';

export const InventoryView = ({ pcbaLogs, onUpdateSerial, setSelectedUnit }) => {
    const [editingCell, setEditingCell] = useState(null); 
    const [tempValue, setTempValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null); 
    const [isSaving, setIsSaving] = useState(false); 
    const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
    const [selectedModelKey, setSelectedModelKey] = useState('all'); // State for dynamic column routing
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSave, setPendingSave] = useState(null);
    const [validationError, setValidationError] = useState('');
    const itemsPerPage = 15; 

    const pcbaMapping = [
        { model: 'EE-405-MNBD-PCBA-A3', partsCode: '001-00-000034', prefix: 'MK001034-2450-', dbKey: 'mnbd_board_no', displayName: 'MNBD' },
        { model: 'EE-405-CMBD-PCBA-A3', partsCode: '001-00-000031', prefix: 'MK001031-2448-', dbKey: 'cmbd_board_no', displayName: 'CMBD' },
        { model: 'EE-405-LRBD-PCBA-A3', partsCode: '001-00-000030', prefix: 'MK001030-2440-', dbKey: 'lrbd_board_no', displayName: 'LRBD' },
        { model: 'EE-405-PQBD-PCBA-A3', partsCode: '001-00-000033', prefix: 'MK001033-2445-', dbKey: 'pqbd_board_no', displayName: 'PQBD' },
        { model: 'EE-405-BKBD-PCBA-A4', partsCode: '001-00-000041', prefix: 'MK001034-2502-', dbKey: 'bkbd_board_no', displayName: 'BKBD' }
    ];

    // Check for GLOBAL duplicate board numbers across all units
    const hasDuplicate = (currentItem, allLogs) => {
        const currentBoards = pcbaMapping.map(board => ({
            name: board.displayName,
            value: currentItem[board.dbKey],
            prefix: board.prefix
        })).filter(board => board.value && board.value !== '000000' && board.value !== '' && board.value !== null);
        
        // If current unit has less than 1 valid board, no duplicates possible
        if (currentBoards.length === 0) {
            return { hasDuplicate: false, duplicateBoards: [] };
        }
        
        const duplicateBoards = [];
        
        // Check each current board against all other units
        currentBoards.forEach(currentBoard => {
            // Check if this board number exists in any OTHER unit
            const foundInOtherUnit = allLogs.some(otherItem => {
                // Skip checking against itself
                if (otherItem.id === currentItem.id) return false;
                
                // Check if this board number exists in the other unit
                const otherBoards = pcbaMapping.map(board => otherItem[board.dbKey])
                    .filter(board => board && board !== '000000' && board !== '' && board !== null);
                
                return otherBoards.includes(currentBoard.value);
            });
            
            if (foundInOtherUnit) {
                duplicateBoards.push(currentBoard.name);
            }
        });
        
        return {
            hasDuplicate: duplicateBoards.length > 0,
            duplicateBoards: duplicateBoards
        };
    };

    // Get duplicate details for status display
    const getDuplicateDetails = (currentItem, allLogs) => {
        const duplicateInfo = hasDuplicate(currentItem, allLogs);
        return duplicateInfo.duplicateBoards;
    };

    // Get status based on duplicate detection (respects model selection)
    const getStatusBadge = (log) => {
        if (selectedModelKey === 'all') {
            // When "All Models" is selected, check for duplicates across ALL board types
            const duplicateInfo = hasDuplicate(log, pcbaLogs);
            if (duplicateInfo.hasDuplicate) {
                return <span className="badge bg-danger" title={`Duplicate boards: ${duplicateInfo.duplicateBoards.join(', ')}`}>DUP</span>;
            } else {
                return <span className="badge bg-success">NO DUP</span>;
            }
        } else {
            // When a specific model is selected, only check for duplicates within that board type
            const boardValue = log[selectedModelKey];
            if (!boardValue || boardValue === '000000' || boardValue === '') {
                return <span className="badge bg-success">NO DUP</span>;
            }
            
            // Check if this specific board value exists in any other unit
            const isDuplicate = pcbaLogs.some(otherItem => {
                if (otherItem.id === log.id) return false;
                return otherItem[selectedModelKey] === boardValue;
            });
            
            if (isDuplicate) {
                const boardInfo = pcbaMapping.find(m => m.dbKey === selectedModelKey);
                const boardName = boardInfo ? boardInfo.displayName : selectedModelKey;
                return <span className="badge bg-danger" title={`Duplicate ${boardName} board`}>DUP</span>;
            } else {
                return <span className="badge bg-success">NO DUP</span>;
            }
        }
    };

    // Get selected model info
    const getSelectedModelInfo = () => {
        if (selectedModelKey === 'all') return null;
        return pcbaMapping.find(m => m.dbKey === selectedModelKey);
    };

    // Format board display with prefix and serial
    const formatBoardValue = (value, boardKey) => {
        if (!value || value === '000000' || value === '') {
            return { text: 'Empty', className: 'text-danger fw-bold' };
        }
        
        // Always show prefix + serial for proper context
        const modelInfo = pcbaMapping.find(m => m.dbKey === boardKey);
        if (modelInfo) {
            return { text: `${modelInfo.prefix}${value}`, className: 'text-dark fw-bold' };
        }
        
        return { text: value, className: 'text-dark fw-bold' };
    };

    // Check if a specific board cell should be colored red (because it's causing duplicates)
    const getBoardCellClass = (boardValue, currentItem, allLogs) => {
        if (!boardValue || boardValue === '000000' || boardValue === '') {
            return 'text-danger fw-bold'; // Empty boards
        }
        
        // Check if this specific board value exists in any other unit
        const isDuplicate = allLogs.some(otherItem => {
            if (otherItem.id === currentItem.id) return false;
            
            const otherBoards = pcbaMapping.map(board => otherItem[board.dbKey])
                .filter(board => board && board !== '000000' && board !== '' && board !== null);
            
            return otherBoards.includes(boardValue);
        });
        
        return isDuplicate ? 'text-danger fw-bold' : 'text-dark fw-bold';
    };

    // Enhanced search for Assembly No. and Board Numbers
    const filteredLogs = useMemo(() => {
        let logs = pcbaLogs;
        
        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            logs = logs.filter(log => {
                // Search Assembly No.
                if (log.assembly_no?.toLowerCase().includes(searchLower)) {
                    return true;
                }
                
                // Search all board numbers
                const boardKeys = pcbaMapping.map(board => board.dbKey);
                return boardKeys.some(key => {
                    const boardValue = log[key];
                    return boardValue && (
                        boardValue.toLowerCase().includes(searchLower) ||
                        (log[key] && log[key].toLowerCase().includes(searchLower))
                    );
                });
            });
        }
        
        // Filter to show only duplicates if the toggle is on
        if (showOnlyDuplicates) {
            if (selectedModelKey === 'all') {
                // When "All Models" is selected, show units with duplicates across ANY board type
                logs = logs.filter(log => hasDuplicate(log, pcbaLogs).hasDuplicate);
            } else {
                // When a specific model is selected, only show units with duplicates in that board type
                logs = logs.filter(log => {
                    const boardValue = log[selectedModelKey];
                    if (!boardValue || boardValue === '000000' || boardValue === '') {
                        return false; // Skip empty boards
                    }
                    
                    // Check if this specific board value exists in any other unit
                    return pcbaLogs.some(otherItem => {
                        if (otherItem.id === log.id) return false;
                        return otherItem[selectedModelKey] === boardValue;
                    });
                });
            }
        }
        
        return logs;
    }, [pcbaLogs, searchTerm, showOnlyDuplicates, selectedModelKey]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage]);

    // Check for duplicate serial number within the same model type
    const checkDuplicateInSameModel = (newValue, boardKey, currentLogId) => {
        if (!newValue || newValue === '000000' || newValue === '') return false;
        
        const boardInfo = pcbaMapping.find(board => board.dbKey === boardKey);
        if (!boardInfo) return false;
        
        // Check if this serial number already exists in the same board type (excluding current item)
        const isDuplicate = pcbaLogs.some(item => {
            if (item.id === currentLogId) return false; // Skip current item
            return item[boardKey] === newValue; // Check if same serial exists in same board type
        });
        
        return isDuplicate;
    };

    const handleEdit = (logId, key, currentVal) => {
        setEditingCell({ logId, key });
        setTempValue(currentVal || '');
        setValidationError(''); // Clear validation error when starting edit
    };

    const handleSave = async (logId, key) => {
        // Check for duplicate in same model type first
        const isDuplicate = checkDuplicateInSameModel(tempValue, key, logId);
        
        if (isDuplicate) {
            const boardInfo = pcbaMapping.find(board => board.dbKey === key);
            const boardName = boardInfo ? boardInfo.displayName : key;
            setValidationError(`Serial number already exists in ${boardName} board type!`);
            return;
        }
        
        // Clear validation error if no duplicate
        setValidationError('');
        
        // Show confirmation modal instead of saving directly
        const currentItem = pcbaLogs.find(item => item.id === logId);
        const boardInfo = pcbaMapping.find(board => board.dbKey === key);
        const boardName = boardInfo ? boardInfo.displayName : key;
        const assemblyNo = currentItem ? currentItem.assembly_no : 'Unknown';
        
        setPendingSave({ logId, key, assemblyNo, boardName });
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        if (!pendingSave) return;
        
        setIsSaving(true);
        setShowConfirmModal(false);
        
        try {
            const response = await fetch('http://localhost/mkffwebsystem/backend/api/inventory.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pendingSave.logId,
                    column: pendingSave.key,
                    newValue: tempValue
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (onUpdateSerial) onUpdateSerial(pendingSave.logId, pendingSave.key, tempValue);
                setEditingCell(null);
                setTempValue('');
            } else {
                alert("Database Error: " + result.message);
            }
        } catch (error) {
            console.error("Database connection failed:", error);
            alert("Connection Error: Check if XAMPP is running and the URL is correct.");
        } finally {
            setIsSaving(false);
            setPendingSave(null);
        }
    };

    const cancelSave = () => {
        setShowConfirmModal(false);
        setPendingSave(null);
    };

    const handleRowClick = (log) => {
        // Open Unit Details modal with the selected log
        if (setSelectedUnit) {
            setSelectedUnit(log);
        }
    };

    return (
        <div className="p-3">
            <style>{`
                .traceability-header {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .traceability-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                    letter-spacing: 0.05em;
                }
                
                .traceability-subtitle {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                
                .search-container {
                    position: relative;
                    max-width: 400px;
                }
                
                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 45px;
                    border: 2px solid #334155;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    background: #f8fafc;
                    transition: all 0.2s ease;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    font-size: 1.1rem;
                }
                
                .traceability-table {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                
                .traceability-table th {
                    background: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 12px 16px;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .traceability-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.875rem;
                    vertical-align: middle;
                }
                
                .traceability-table tbody tr {
                    transition: background-color 0.2s ease;
                    cursor: pointer;
                }
                
                .traceability-table tbody tr:hover {
                    background-color: #f8fafc;
                }
                
                .assembly-number {
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 0.9rem;
                }
                
                .uid-text {
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    color: #64748b;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .board-value {
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    font-weight: 700;
                    font-size: 0.85rem;
                }
                
                .board-value.empty {
                    color: #dc2626 !important;
                    font-weight: 800;
                }
                
                .edit-input {
                    width: 120px;
                    border: 2px solid #3b82f6;
                    border-radius: 6px;
                    padding: 6px 8px;
                    font-family: 'SFMono-Regular', Consolas, monospace;
                    font-weight: 700;
                    font-size: 0.85rem;
                    outline: none;
                    background: white;
                }
                
                .edit-input:focus {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .edit-btn, .save-btn {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-left: 6px;
                }
                
                .edit-btn {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                }
                
                .edit-btn:hover {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }
                
                .save-btn {
                    background: #10b981;
                    color: white;
                }
                
                .save-btn:disabled {
                    background: #94a3b8;
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .pagination-container {
                    display: flex;
                    justify-content: between;
                    align-items: center;
                    padding: 16px 20px;
                    background: white;
                    border-radius: 12px;
                    margin-top: 16px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                
                .pagination-info {
                    color: #64748b;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .pagination-controls {
                    display: flex;
                    gap: 8px;
                }
                
                .pagination-btn {
                    padding: 8px 16px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .pagination-btn:hover:not(:disabled) {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }
                
                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 12px;
                    border: 2px dashed #cbd5e1;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .empty-state-title {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>

            <div className="traceability-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="traceability-title">PCBA Traceability System</h1>
                        <p className="traceability-subtitle">Industrial Serialization Registry</p>
                        <div className="mt-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-auto">
                                    <label className="text-white small me-2">Select Model:</label>
                                    <select 
                                        className="form-select form-select-sm" 
                                        style={{ width: '250px' }}
                                        value={selectedModelKey} 
                                        onChange={(e) => { setSelectedModelKey(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="all">All Models</option>
                                        {pcbaMapping.map(board => (
                                            <option key={board.dbKey} value={board.dbKey}>
                                                {board.displayName} - {board.model}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {getSelectedModelInfo() && (
                                    <div className="col-auto">
                                        <div className="text-white">
                                            <strong>Model:</strong> {getSelectedModelInfo().model}<br/>
                                            <strong>Parts Code:</strong> {getSelectedModelInfo().partsCode}<br/>
                                            <strong>Prefix:</strong> {getSelectedModelInfo().prefix}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                        <button 
                            className={`btn px-4 py-2 fw-bold ${showOnlyDuplicates ? 'btn-danger' : 'btn-outline-light'}`}
                            onClick={() => {
                                setShowOnlyDuplicates(!showOnlyDuplicates);
                                setCurrentPage(1);
                            }}
                        >
                            {showOnlyDuplicates ? 'Show All' : 'Show All with Dup'}
                        </button>
                        <div className="search-container">
                            <i className="bi bi-search search-icon"></i>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search Assembly No. or Board Numbers..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {paginatedLogs.length > 0 ? (
                <>
                    <div className="traceability-table">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: selectedModelKey === 'all' ? '15%' : '25%' }}>Assembly No.</th>
                                    {selectedModelKey === 'all' ? (
                                        <>
                                            <th style={{ width: '17%' }}>MNBD Board</th>
                                            <th style={{ width: '17%' }}>CMBD Board</th>
                                            <th style={{ width: '17%' }}>LRBD Board</th>
                                            <th style={{ width: '17%' }}>PQBD Board</th>
                                            <th style={{ width: '17%' }}>BKBD Board</th>
                                        </>
                                    ) : (
                                        <th style={{ width: '50%' }}>
                                            {getSelectedModelInfo()?.displayName} Board
                                        </th>
                                    )}
                                    <th style={{ width: '10%' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((item) => (
                                    <tr key={item.id} onClick={() => handleRowClick(item)}>
                                        <td>
                                            <div className="assembly-number">{item.assembly_no}</div>
                                        </td>
                                        {selectedModelKey === 'all' ? (
                                            <>
                                                <td>
                                                    {editingCell?.logId === item.id && editingCell?.key === 'mnbd_board_no' ? (
                                                        <div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <input 
                                                                    autoFocus
                                                                    maxLength={6}
                                                                    disabled={isSaving}
                                                                    className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                    value={tempValue}
                                                                    onChange={(e) => {
                                                                        setTempValue(e.target.value);
                                                                        setValidationError(''); // Clear error on input change
                                                                    }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, 'mnbd_board_no')}
                                                                />
                                                                <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, 'mnbd_board_no')}>
                                                                    {isSaving ? '...' : 'SAVE'}
                                                                </button>
                                                            </div>
                                                            {validationError && editingCell?.key === 'mnbd_board_no' && (
                                                                <div className="text-danger small fw-bold">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    {validationError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className={`board-value ${getBoardCellClass(item.mnbd_board_no, item, pcbaLogs)}`}>
                                                                {formatBoardValue(item.mnbd_board_no, 'mnbd_board_no').text}
                                                            </span>
                                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, 'mnbd_board_no', item.mnbd_board_no); }}>
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingCell?.logId === item.id && editingCell?.key === 'cmbd_board_no' ? (
                                                        <div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <input 
                                                                    autoFocus
                                                                    maxLength={6}
                                                                    disabled={isSaving}
                                                                    className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                    value={tempValue}
                                                                    onChange={(e) => {
                                                                        setTempValue(e.target.value);
                                                                        setValidationError(''); // Clear error on input change
                                                                    }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, 'cmbd_board_no')}
                                                                />
                                                                <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, 'cmbd_board_no')}>
                                                                    {isSaving ? '...' : 'SAVE'}
                                                                </button>
                                                            </div>
                                                            {validationError && editingCell?.key === 'cmbd_board_no' && (
                                                                <div className="text-danger small fw-bold">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    {validationError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className={`board-value ${getBoardCellClass(item.cmbd_board_no, item, pcbaLogs)}`}>
                                                                {formatBoardValue(item.cmbd_board_no, 'cmbd_board_no').text}
                                                            </span>
                                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, 'cmbd_board_no', item.cmbd_board_no); }}>
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingCell?.logId === item.id && editingCell?.key === 'lrbd_board_no' ? (
                                                        <div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <input 
                                                                    autoFocus
                                                                    maxLength={6}
                                                                    disabled={isSaving}
                                                                    className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                    value={tempValue}
                                                                    onChange={(e) => {
                                                                        setTempValue(e.target.value);
                                                                        setValidationError(''); // Clear error on input change
                                                                    }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, 'lrbd_board_no')}
                                                                />
                                                                <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, 'lrbd_board_no')}>
                                                                    {isSaving ? '...' : 'SAVE'}
                                                                </button>
                                                            </div>
                                                            {validationError && editingCell?.key === 'lrbd_board_no' && (
                                                                <div className="text-danger small fw-bold">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    {validationError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className={`board-value ${getBoardCellClass(item.lrbd_board_no, item, pcbaLogs)}`}>
                                                                {formatBoardValue(item.lrbd_board_no, 'lrbd_board_no').text}
                                                            </span>
                                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, 'lrbd_board_no', item.lrbd_board_no); }}>
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingCell?.logId === item.id && editingCell?.key === 'pqbd_board_no' ? (
                                                        <div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <input 
                                                                    autoFocus
                                                                    maxLength={6}
                                                                    disabled={isSaving}
                                                                    className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                    value={tempValue}
                                                                    onChange={(e) => {
                                                                        setTempValue(e.target.value);
                                                                        setValidationError(''); // Clear error on input change
                                                                    }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, 'pqbd_board_no')}
                                                                />
                                                                <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, 'pqbd_board_no')}>
                                                                    {isSaving ? '...' : 'SAVE'}
                                                                </button>
                                                            </div>
                                                            {validationError && editingCell?.key === 'pqbd_board_no' && (
                                                                <div className="text-danger small fw-bold">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    {validationError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className={`board-value ${getBoardCellClass(item.pqbd_board_no, item, pcbaLogs)}`}>
                                                                {formatBoardValue(item.pqbd_board_no, 'pqbd_board_no').text}
                                                            </span>
                                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, 'pqbd_board_no', item.pqbd_board_no); }}>
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingCell?.logId === item.id && editingCell?.key === 'bkbd_board_no' ? (
                                                        <div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <input 
                                                                    autoFocus
                                                                    maxLength={6}
                                                                    disabled={isSaving}
                                                                    className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                    value={tempValue}
                                                                    onChange={(e) => {
                                                                        setTempValue(e.target.value);
                                                                        setValidationError(''); // Clear error on input change
                                                                    }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, 'bkbd_board_no')}
                                                                />
                                                                <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, 'bkbd_board_no')}>
                                                                    {isSaving ? '...' : 'SAVE'}
                                                                </button>
                                                            </div>
                                                            {validationError && editingCell?.key === 'bkbd_board_no' && (
                                                                <div className="text-danger small fw-bold">
                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                    {validationError}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <span className={`board-value ${getBoardCellClass(item.bkbd_board_no, item, pcbaLogs)}`}>
                                                                {formatBoardValue(item.bkbd_board_no, 'bkbd_board_no').text}
                                                            </span>
                                                            <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, 'bkbd_board_no', item.bkbd_board_no); }}>
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </>
                                        ) : (
                                            <td>
                                                {editingCell?.logId === item.id && editingCell?.key === selectedModelKey ? (
                                                    <div>
                                                        <div className="d-flex align-items-center mb-1">
                                                            <input 
                                                                autoFocus
                                                                maxLength={6}
                                                                disabled={isSaving}
                                                                className={`edit-input ${validationError ? 'border-danger' : ''}`}
                                                                value={tempValue}
                                                                onChange={(e) => {
                                                                    setTempValue(e.target.value);
                                                                    setValidationError(''); // Clear error on input change
                                                                }}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleSave(item.id, selectedModelKey)}
                                                            />
                                                            <button className="save-btn" disabled={isSaving} onClick={() => handleSave(item.id, selectedModelKey)}>
                                                                {isSaving ? '...' : 'SAVE'}
                                                            </button>
                                                        </div>
                                                        {validationError && editingCell?.key === selectedModelKey && (
                                                            <div className="text-danger small fw-bold">
                                                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                {validationError}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <span className={`board-value ${getBoardCellClass(item[selectedModelKey], item, pcbaLogs)}`}>
                                                            {formatBoardValue(item[selectedModelKey], selectedModelKey).text}
                                                        </span>
                                                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(item.id, selectedModelKey, item[selectedModelKey]); }}>
                                                            EDIT
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        <td>
                                            <div className="status-badge">
                                                {getStatusBadge(item)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing {paginatedLogs.length} of {filteredLogs.length} Records
                        </div>
                        <div className="pagination-controls">
                            <button className="pagination-btn" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); }}>
                                PREV
                            </button>
                            <span className="px-3 text-muted">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button className="pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => { setCurrentPage(p => p + 1); }}>
                                NEXT
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-title">No Matching Records Found</div>
                    <p className="text-muted mt-2">Try adjusting your search criteria</p>
                </div>
            )}
            
            {/* Confirmation Modal */}
            {showConfirmModal && ReactDOM.createPortal(
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
                    <div className="bg-white rounded-3 shadow-lg p-0" style={{ width: '90%', maxWidth: '400px' }}>
                        <div className="modal-header border-bottom p-3">
                            <h5 className="modal-title fw-bold text-dark">
                                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                                Confirm Update
                            </h5>
                        </div>
                        <div className="modal-body p-4">
                            <p className="mb-3">Are you sure you want to update this serial number?</p>
                            <div className="alert alert-light border">
                                <div className="row g-2">
                                    <div className="col-4"><strong>Assembly:</strong></div>
                                    <div className="col-8">{pendingSave?.assemblyNo || 'N/A'}</div>
                                    <div className="col-4"><strong>Board:</strong></div>
                                    <div className="col-8">{pendingSave?.boardName || 'N/A'}</div>
                                    <div className="col-4"><strong>New Value:</strong></div>
                                    <div className="col-8">
                                        <code className="bg-light px-2 py-1 rounded">{tempValue || '(empty)'}</code>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted small mb-0">This action will update the database immediately.</p>
                        </div>
                        <div className="modal-footer border-top p-3">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={cancelSave}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={confirmSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Yes, Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};