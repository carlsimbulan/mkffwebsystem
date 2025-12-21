import React, { useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
// 💡 Import the new Doughnut Chart component
import { StationSingleDoughnutChart } from './StationSingleDoughnutChart'; 


export function StationHomeDashboard({ currentStation, homeStats, setActiveTab, announcementCount, logs, calculateMetrics }) {
    
    // 💡 Ref to access the Chart.js instance for exporting
    const chartRef = useRef(null);

    // Function to handle chart export
    const handleExportChart = () => {
        const chartInstance = chartRef.current;
        if (!chartInstance) {
             alert("Chart data not ready for export.");
             return;
        }
        
        try {
            const imageURI = chartInstance.toBase64Image('image/png', 1);
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
    
    // Calculation for percentages
    const totalUnits = homeStats.completed + homeStats.inProgress + homeStats.ng;
    
    const calculateStationPercentage = (value) => {
        if (totalUnits === 0) return '0.0%';
        return ((value / totalUnits) * 100).toFixed(1) + '%';
    };

    // Reusable Stat Card Component for a cleaner UI
    const SimpleStatCard = ({ title, value, percentage, label, borderColor, badgeClass }) => (
        <div className="col-md-4">
            <div className={`card border-0 shadow-sm h-100 border-start border-4 ${borderColor}`} style={{ borderRadius: '8px' }}>
                <div className="card-body p-3">
                    <div className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                        {title}
                    </div>
                    <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '2.2rem' }}>{value}</h2>
                    <div className={`d-inline-flex align-items-center px-2 py-1 rounded ${badgeClass}`} style={{ fontSize: '0.75rem' }}>
                        <span className="fw-bold me-1">{percentage}</span>
                        <span className="opacity-75">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="d-flex flex-column h-100 animate-in fade-in pb-3">

            {/* Header Section */}
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

            {/* ANNOUNCEMENT ALERT */}
            {announcementCount > 0 && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center shadow-sm mb-4 border-start border-4 border-warning" role="alert" style={{ borderRadius: '8px' }}>
                    <div className="d-flex align-items-center">
                        <i className="bi bi-megaphone-fill fs-4 me-3 text-warning"></i>
                        <div className='d-flex flex-column'>
                            <span className="fw-bold text-dark mb-0">NEW ANNOUNCEMENT!</span>
                            <small className="text-muted">You have <b>{announcementCount}</b> unread message{announcementCount > 1 ? 's' : ''} from Admin.</small>
                        </div>
                    </div>
                    <button className="btn btn-warning btn-sm fw-bold px-3" onClick={() => setActiveTab('announcements')}>
                        View Messages
                    </button>
                </div>
            )}

            {/* --- STAT CARDS ROW --- */}
            <div className="row g-3 mb-4">
                <SimpleStatCard 
                    title="Completed (Yield)" 
                    value={homeStats.completed} 
                    percentage={calculateStationPercentage(homeStats.completed)} 
                    label="Rate" 
                    borderColor="border-success" 
                    badgeClass="bg-success bg-opacity-10 text-success"
                />
                <SimpleStatCard 
                    title="In Progress (WIP)" 
                    value={homeStats.inProgress} 
                    percentage={calculateStationPercentage(homeStats.inProgress)} 
                    label="Capacity" 
                    borderColor="border-warning" 
                    badgeClass="bg-warning bg-opacity-10 text-warning"
                />
                <SimpleStatCard 
                    title="Total Defects (NG)" 
                    value={homeStats.ng} 
                    percentage={calculateStationPercentage(homeStats.ng)} 
                    label="Failure" 
                    borderColor="border-danger" 
                    badgeClass="bg-danger bg-opacity-10 text-danger"
                />
            </div>

            {/* --- CONSOLIDATED ROW: CHART (LEFT) & READY TO SCAN (RIGHT) --- */}
            <div className="row g-4 mb-4 flex-grow-1">
                {/* 1. LEFT COLUMN: CHART */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-pie-chart-fill me-2 text-primary"></i> Production Analytics (Total: {totalUnits})</h5>
                            <button 
                                className="btn btn-outline-secondary btn-sm px-3 rounded-pill d-flex align-items-center"
                                onClick={handleExportChart}
                                disabled={totalUnits === 0}
                            >
                                <i className="bi bi-download me-1"></i> Export
                            </button>
                        </div>
                        <div className="card-body p-4 d-flex align-items-center justify-content-center">
                            <StationSingleDoughnutChart 
                                ref={chartRef}
                                stationId={currentStation} 
                                logs={logs} 
                                calculateMetrics={calculateMetrics}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: READY TO SCAN */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden"
                        style={{ borderRadius: '16px', background: '#fff', border: '1px solid #f1f5f9' }}>

                        {/* Subtle Background Element */}
                        <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-05" style={{ width: '200px', height: '200px', filter: 'blur(50px)' }}></div>

                        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4 z-1">
                            <div className="mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle shadow-sm" style={{ width: '70px', height: '70px' }}>
                                    <i className="bi bi-qr-code-scan fs-2"></i>
                                </div>
                            </div>
                            <h3 className="fw-bold text-dark mb-2">Ready to Process?</h3>
                            <p className="text-muted small mb-4" style={{ maxWidth: '280px' }}>Scan the unit QR code to verify details and begin logging production data.</p>

                            <button
                                className="btn btn-primary px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2 hover-scale w-100 justify-content-center"
                                onClick={() => setActiveTab('input_unit')}
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                <span className="fs-6 fw-bold ls-1 text-uppercase">Start Scanning</span>
                                <i className="bi bi-arrow-right fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .hover-scale:hover { transform: scale(1.02); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2) !important; }
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