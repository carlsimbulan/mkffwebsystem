import React from 'react';

const GeneratedQRList = ({ list, onSave, onDiscard, isSaving }) => {
    if (list.length === 0) return null;
    
    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area-wrapper').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print QR Batch</title>');
        printWindow.document.write(`
            <style>
                @page { size: A4; margin: 5mm; } 
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .qr-item-label {
                    display: inline-block; width: 95mm; height: 50mm; border: 1px solid #000; 
                    margin: 2mm; padding: 3mm; box-sizing: border-box; page-break-inside: avoid;
                    float: left; overflow: hidden; font-size: 8pt; line-height: 1.2;
                }
                .qr-img-print { max-width: 40mm; height: auto; float: left; margin-right: 5mm; }
                .qr-text-print { text-align: left; float: left; width: 50mm; }
                .qr-text-print strong { font-size: 14pt; display: block; margin-bottom: 2px; color: #000; }
                .tag-label { font-size: 8pt; color: #555; text-transform: uppercase; display: inline-block; width: 15mm; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent); 
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 300); 
    };
    
    return (
        <div className="mt-4 border-top pt-4 animate-in fade-in">
            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-file-earmark-check me-2 text-success"></i>Generated Batch Preview ({list.length} units)</h5>

            <div className="d-flex mb-3 gap-3">
                <button className="btn btn-primary fw-bold flex-grow-1 rounded-pill px-4" onClick={handlePrint}>
                    <i className="bi bi-printer me-2"></i> Print All Labels
                </button>
                <button className="btn btn-success fw-bold flex-grow-1 rounded-pill px-4" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <span><span className="spinner-border spinner-border-sm me-2"></span>Saving...</span> : <span><i className="bi bi-database-add me-2"></i> Save Batch to DB</span>}
                </button>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onDiscard} disabled={isSaving}>
                    <i className="bi bi-trash"></i> Discard
                </button>
            </div>

            <div className="bg-light p-3 border rounded shadow-sm" style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                <div id="qr-print-area-wrapper" style={{ display: 'none' }}>
                     {list.map((unit, index) => (
                        <div key={index} className="qr-item-label">
                            <img src={unit.qr_url} alt="QR" className="qr-img-print" />
                            <div className="qr-text-print">
                                <strong>{unit.assembly_no}</strong>
                                <div><span className="tag-label">Model:</span> {unit.model || 'N/A'}</div>
                                <div><span className="tag-label">Rev:</span> {unit.revision || '-'}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {list.map((unit, index) => (
                    <div key={index} className="bg-white border rounded p-2 text-center" style={{ flex: '0 0 calc(25% - 5px)', minWidth: '150px' }}>
                        <img src={unit.qr_url} alt="QR" style={{ maxWidth: '80px' }} />
                        <div className="small mt-1"><strong>{unit.assembly_no}</strong></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GeneratedQRList;