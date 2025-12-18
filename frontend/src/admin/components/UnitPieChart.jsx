import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLOR_COMPLETED = '#10b981';
const COLOR_NG = '#ef4444';
const COLOR_IN_PROGRESS = '#f59e0b';

const StatItem = ({ label, value, color, icon, total }) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
    return (
        <div className="d-flex align-items-center justify-content-between p-3 rounded mb-4" 
             style={{
                backgroundColor: `${color}15`, 
                borderLeft: `5px solid ${color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
             }}>
            <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0" 
                      style={{width: '30px', height: '30px', backgroundColor: color}}>
                    <i className={`bi ${icon} text-white`} style={{fontSize: '0.9rem'}}></i>
                </div>
                <span className="text-dark fw-bold small text-uppercase">{label}</span>
            </div>
            <div className="text-end lh-1">
                <div className="fw-bolder text-dark fs-5">{value}</div>
                <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>{percentage}%</small>
            </div>
        </div>
    );
};

export const UnitPieChart = ({ metrics, title }) => {
    const total = metrics.completedUnits + metrics.ngUnits + metrics.pendingUnits;

    const chartData = {
        labels: ['Completed', 'No Good (NG)', 'In Progress'],
        datasets: [
            {
                data: [metrics.completedUnits, metrics.ngUnits, metrics.pendingUnits],
                backgroundColor: [COLOR_COMPLETED, COLOR_NG, COLOR_IN_PROGRESS],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 4, 
                hoverOffset: 4, // Re-enabled slightly for a subtle "pop" on hover
                cutout: '70%', 
                borderRadius: 10, 
                spacing: 2 
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        
        // --- HIGH-PERFORMANCE CIRCULAR ANIMATION ---
        animation: {
            duration: 1000,
            easing: 'easeOutExpo', // High speed start, very smooth finish
            animateRotate: true,   // Spins the chart into place
            animateScale: true     // Grows the chart from the center
        },
        // Ensures re-renders (data updates) don't lag or jump
        transitions: {
            active: {
                animation: { duration: 200 } // Smooth hover transition
            }
        },
        // -------------------------------------------

        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true, // Re-enabled but optimized
                backgroundColor: '#1e293b',
                padding: 10,
                cornerRadius: 8,
                titleFont: { size: 12 },
                bodyFont: { size: 12 },
            },
        },
    };

    return (
        <div className="w-100 h-100 p-5"> 
            <div className="row g-5 justify-content-center align-items-center h-100">
                
                {/* LEFT COLUMN: Metric Cards */}
                <div className="col-md-5 d-flex flex-column justify-content-center">
                    <h6 className="fw-bold text-uppercase small text-muted mb-4 d-none d-md-block" style={{letterSpacing: '1px'}}>Status Breakdown</h6>
                    
                    <StatItem 
                        label="Completed" 
                        value={metrics.completedUnits} 
                        color={COLOR_COMPLETED} 
                        icon="bi-check-lg" 
                        total={total}
                    />
                    <StatItem 
                        label="In Progress" 
                        value={metrics.pendingUnits} 
                        color={COLOR_IN_PROGRESS} 
                        icon="bi-hourglass-split" 
                        total={total}
                    />
                    <StatItem 
                        label="Defects (NG)" 
                        value={metrics.ngUnits} 
                        color={COLOR_NG} 
                        icon="bi-x-lg" 
                        total={total}
                    />
                </div>

                {/* RIGHT COLUMN: Chart Section */}
                <div className="col-md-7 d-flex align-items-center justify-content-center position-relative">
                    <div style={{ height: '100%', minHeight: '300px', width: '100%', maxWidth: '350px' }}>
                        <Doughnut data={chartData} options={options} />

                        {/* Center Label - Static Position */}
                        <div className="position-absolute top-50 start-50 translate-middle text-center rounded-circle d-flex flex-column align-items-center justify-content-center bg-white" 
                             style={{ 
                                width: '130px', 
                                height: '130px', 
                                pointerEvents: 'none', 
                                zIndex: 5,
                                border: '1px solid #eee',
                                // Subtle CSS animation for the center label to match the chart growth
                                animation: 'fadeInScale 0.8s ease-out'
                             }}>
                            <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total Units</span>
                            <h1 className="mb-0 fw-bolder text-dark display-6" style={{ lineHeight: '1', letterSpacing: '-1px' }}>{total}</h1>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Added CSS for the center label fade-in */}
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </div>
    );
};