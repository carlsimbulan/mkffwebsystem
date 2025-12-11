import React, { useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
// 💡 Import the new Doughnut Chart component
import { StationSingleDoughnutChart } from './StationSingleDoughnutChart'; 


export function StationHomeDashboard({ currentStation, homeStats, setActiveTab, announcementCount, logs, calculateMetrics }) {
    
    // 💡 Ref to access the Chart.js instance for exporting
    const chartRef = useRef(null);

    // Function to handle chart export using the exposed chart method
    const handleExportChart = () => {
        const chartInstance = chartRef.current;
        if (!chartInstance) {
             alert("Chart data not ready for export.");
             return;
        }
        
        try {
            // Use the method exposed via useImperativeHandle
            const imageURI = chartInstance.toBase64Image('image/png', 1);
            
            // Create a temporary link element to trigger the download
            const a = document.createElement('a');
            a.href = imageURI;
            a.download = `Daily_Completion_Ratio_${currentStation}_${new Date().toISOString()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
             console.error("Export failed:", err);
             alert("Export failed due to browser security or drawing error.");
        }
    };
    
    // 🌟 NEW: Calculate total units and percentages based on homeStats (Current Station only) 🌟
    const totalUnits = homeStats.completed + homeStats.inProgress + homeStats.ng;
    
    const calculateStationPercentage = (value) => {
        if (totalUnits === 0) return '0%';
        return ((value / totalUnits) * 100).toFixed(1) + '%';
    };

    const completedPercentage = calculateStationPercentage(homeStats.completed);
    const inProgressPercentage = calculateStationPercentage(homeStats.inProgress);
    const ngPercentage = calculateStationPercentage(homeStats.ng);
    // --------------------------------------------------------------------------------------
    
    // --- RENDER FUNCTION ---
    return (
        <div className="d-flex flex-column h-100 animate-in fade-in pb-3">

            {/* Header Section (Unchanged) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>{currentStation}</h3>
                    <p className="text-muted small mb-0">Operator Control Panel</p>
                </div>
                <div className="bg-white border px-3 py-2 rounded shadow-sm d-flex align-items-center">
                    <span className="position-relative d-flex h-2 w-2 me-2">
                        <span className="animate-ping position-absolute d-inline-flex h-100 w-100 rounded-circle bg-success opacity-75"></span>
                        <span className="position-relative d-inline-flex rounded-circle h-2 w-2 bg-success" style={{ width: '8px', height: '8px' }}></span>
                    </span>
                    <span className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>Station Active</span>
                </div>
            </div>

            {/* 🔑 ANNOUNCEMENT ALERT (Unchanged) */}
            {announcementCount > 0 && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center shadow-sm mb-4 border-start border-4 border-warning" role="alert" style={{ borderRadius: '8px' }}>
                    <div className="d-flex align-items-center">
                        <i className="bi bi-megaphone-fill fs-4 me-3 text-warning"></i>
                        <div className='d-flex flex-column'>
                            <span className="fw-bold text-dark mb-0">
                                NEW ANNOUNCEMENT!
                            </span>
                            <small className="text-muted">You have **{announcementCount}** unread message{announcementCount > 1 ? 's' : ''} from Admin.</small>
                        </div>
                    </div>
                    <button 
                        className="btn btn-warning btn-sm fw-bold px-3" 
                        onClick={() => setActiveTab('announcements')}
                    >
                        View Messages
                    </button>
                </div>
            )}
            {/* 🔑 END ANNOUNCEMENT ALERT */}


            {/* ----------------------------------------------------- */}
            {/* --- NEW LAYOUT ROW: CHART (Left) & CARDS (Right) --- */}
            {/* ----------------------------------------------------- */}
            <div className="row g-4 mb-4">
                
                {/* 1. LEFT COLUMN (CHART) - Takes 7/12 column width */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-pie-chart-fill me-2 text-primary"></i> Daily Completion Ratio (Total: {totalUnits})</h5>
                            {/* Export Button */}
                            <button 
                                className="btn btn-outline-secondary btn-sm px-3 rounded-pill d-flex align-items-center"
                                onClick={handleExportChart}
                                title="Export Chart as PNG"
                                disabled={!logs || totalUnits === 0} // Disabled if total units is zero
                            >
                                <i className="bi bi-download me-1"></i> Export
                            </button>
                        </div>
                        <div className="card-body p-4">
                            {/* Render the Doughnut Chart */}
                            <StationSingleDoughnutChart 
                                ref={chartRef}
                                stationId={currentStation} 
                                logs={logs} 
                                calculateMetrics={calculateMetrics}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT COLUMN (CARDS) - Takes 5/12 column width, stacked */}
                <div className="col-lg-5">
                    <div className="row g-4 h-100">
                        {/* CARD 1: Completed Units */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                            <i className="bi bi-box-seam-fill fs-4"></i>
                                        </div>
                                        {/* 🌟 PERCENTAGE DISPLAY 🌟 */}
                                        <span className="badge bg-success text-white px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                            {completedPercentage}
                                        </span>
                                    </div>
                                    <h2 className="fw-bold text-dark mb-0 display-6">{homeStats.completed}</h2>
                                    <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed Units</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: In Progress Card */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                            <i className="bi bi-hourglass-split fs-4"></i>
                                        </div>
                                        {/* 🌟 PERCENTAGE DISPLAY 🌟 */}
                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                            {inProgressPercentage}
                                        </span>
                                    </div>
                                    <h2 className="fw-bold text-dark mb-0 display-6">{homeStats.inProgress}</h2>
                                    <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: NG Card */}
                        <div className="col-12">
                            <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                            <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                                        </div>
                                        {/* 🌟 PERCENTAGE DISPLAY 🌟 */}
                                        <span className="badge bg-danger text-white px-3 py-2 rounded-pill fw-bolder" style={{ fontSize: '1rem' }}>
                                            {ngPercentage}
                                        </span>
                                    </div>
                                    <h2 className="fw-bold text-danger mb-0 display-6">{homeStats.ng}</h2>
                                    <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total NG</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ----------------------------------------------------- */}
            {/* --- END LAYOUT ROW: CHART & CARDS --- */}
            {/* ----------------------------------------------------- */}

            {/* --- Start Scanning Hero Section (BELOW THE MAIN ROW) --- */}
            <div className="card border-0 shadow-sm flex-grow-1 position-relative overflow-hidden"
                style={{ borderRadius: '16px', background: '#fff', border: '1px solid #f1f5f9' }}>

                {/* Subtle Background Element */}
                <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-05" style={{ width: '300px', height: '300px', filter: 'blur(60px)' }}></div>

                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5 z-1">
                    <div className="mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-qr-code-scan fs-1"></i>
                        </div>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Ready to Process?</h3>
                    <p className="text-muted mb-4" style={{ maxWidth: '350px' }}>Scan the unit QR code to verify details and begin logging production data.</p>

                    <button
                        className="btn btn-primary px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2 hover-scale"
                        onClick={() => setActiveTab('input_unit')}
                        style={{ transition: 'all 0.3s ease' }}
                    >
                        <span className="fs-6 fw-bold ls-1 text-uppercase">Start Scanning</span>
                        <i className="bi bi-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .hover-scale:hover { transform: scale(1.03); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2) !important; }
                .ls-1 { letter-spacing: 1px; }
                .opacity-05 { opacity: 0.05; }
                .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                .animate-in { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}