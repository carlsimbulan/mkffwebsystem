import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const UnitPieChart = ({ metrics, title }) => {
    // Calculate Total
    const total = metrics.completedUnits + metrics.ngUnits + metrics.pendingUnits;

    const chartData = {
        labels: ['Completed', 'No Good (NG)', 'In Progress'],
        datasets: [
            {
                data: [metrics.completedUnits, metrics.ngUnits, metrics.pendingUnits],
                backgroundColor: [
                    '#10b981', // Emerald Green
                    '#ef4444', // Red
                    '#f59e0b', // Amber
                ],
                borderWidth: 0,
                hoverOffset: 20, // Mas malaking umbok pag hover
                cutout: '85%',   // Ultra thin ring (Modern look)
                borderRadius: 20, // Fully rounded ends
                spacing: 5       // Konting gap between arcs
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            animateScale: true,
            animateRotate: true
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        let percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                        return ` ${label}: ${value} (${percentage})`;
                    }
                }
            },
        },
    };

    // Helper to render mini stat card
    const StatItem = ({ label, value, color, icon }) => {
        const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
        return (
            <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2" 
                 style={{backgroundColor: `${color}15`, borderLeft: `4px solid ${color}`}}>
                <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center justify-content-center rounded-circle me-2" 
                         style={{width: '24px', height: '24px', backgroundColor: color}}>
                        <i className={`bi ${icon} text-white`} style={{fontSize: '0.7rem'}}></i>
                    </div>
                    <span className="text-dark fw-bold small">{label}</span>
                </div>
                <div className="text-end lh-1">
                    <div className="fw-bolder text-dark">{value}</div>
                    <small className="text-muted" style={{fontSize: '0.65rem'}}>{percentage}%</small>
                </div>
            </div>
        );
    };

    return (
        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative">
            
            {/* Chart Section */}
            <div className="position-relative mb-4" style={{ height: '200px', width: '200px' }}>
                <Doughnut data={chartData} options={options} />
                
                {/* Modern Floating Center */}
                <div className="position-absolute top-50 start-50 translate-middle text-center rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm bg-white" 
                     style={{ width: '120px', height: '120px', pointerEvents: 'none' }}>
                    <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Total Units</span>
                    <h1 className="mb-0 fw-bolder text-dark display-6" style={{ lineHeight: '1', letterSpacing: '-1px' }}>{total}</h1>
                </div>
            </div>

            {/* Modern Card Legend */}
            <div className="w-100 px-2">
                <StatItem 
                    label="Completed" 
                    value={metrics.completedUnits} 
                    color="#10b981" 
                    icon="bi-check-lg" 
                />
                <StatItem 
                    label="In Progress" 
                    value={metrics.pendingUnits} 
                    color="#f59e0b" 
                    icon="bi-hourglass-split" 
                />
                <StatItem 
                    label="Defects (NG)" 
                    value={metrics.ngUnits} 
                    color="#ef4444" 
                    icon="bi-x-lg" 
                />
            </div>
        </div>
    );
};