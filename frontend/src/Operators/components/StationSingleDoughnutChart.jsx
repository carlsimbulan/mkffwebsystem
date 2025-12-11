import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Doughnut } from 'react-chartjs-2'; 
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// =========================================================================
// FINAL UPDATED: CHART COMPONENT (Doughnut Chart with Centered Layout)
// =========================================================================
export const StationSingleDoughnutChart = forwardRef(({ stationId, logs, calculateMetrics }, ref) => {
    const chartInternalRef = useRef(null);
    const [chartColors, setChartColors] = useState([]);

    useImperativeHandle(ref, () => ({
        // Exposes the Chart.js built-in method for external export button
        toBase64Image: (type, quality) => {
            if (chartInternalRef.current) {
                return chartInternalRef.current.toBase64Image(type, quality);
            }
            return null;
        }
    }));
    
    // --- Prepare Data: Focus on current station's completed and NG units ---
    const stationMetrics = calculateMetrics(stationId, logs) || { completedUnits: 0, ngUnits: 0 };
    const completed = stationMetrics.completedUnits || 0;
    const ng = stationMetrics.ngUnits || 0;
    const totalOutput = completed + ng;

    // Create Colors on Mount/Update
    useEffect(() => {
        const successColor = '#10b981'; // Green
        const dangerColor = '#ef4444'; // Red
        setChartColors([successColor, dangerColor]);
    }, []); 

    // Chart data
    const chartData = {
        labels: ['Completed Units', 'No Good (NG) Units'], 
        datasets: [
            {
                label: 'Unit Status',
                data: [completed, ng], 
                backgroundColor: chartColors,
                hoverBackgroundColor: chartColors.map(c => c + 'd0'),
                borderColor: '#ffffff', 
                borderWidth: 2,
                cutout: '75%', 
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom', // 💡 MOVED LEGEND TO THE BOTTOM
                align: 'center', // 💡 CENTERED THE LEGEND
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 15,
                    color: '#64748b',
                    font: { size: 12, family: "'Inter', sans-serif" }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    title: (tooltipItem) => {
                        return tooltipItem[0].label;
                    },
                    label: (context) => {
                        const rawValue = context.raw;
                        const percentage = totalOutput === 0 ? 0 : ((rawValue / totalOutput) * 100).toFixed(1);
                        return `${context.label}: ${rawValue} units (${percentage}%)`;
                    },
                    footer: () => `Total Output: ${totalOutput}`
                }
            },
        },
    };

    // Center Text Plugin (Using chart metadata for precise centering)
    const plugins = [{
        id: 'centerText',
        beforeDraw: (chart) => {
            if (totalOutput > 0) {
                const { ctx } = chart;
                ctx.restore();
                
                // Get the exact center point (x, y) of the chart area
                const centerX = chart.getDatasetMeta(0).data[0].x;
                const centerY = chart.getDatasetMeta(0).data[0].y;
                
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center'; 

                // 1. Draw the Main Number (Total Output)
                const fontSize = (chart.height / 114).toFixed(2);
                ctx.font = `${fontSize}em Inter, sans-serif`;
                ctx.fillStyle = '#1e293b'; 
                ctx.fillText(totalOutput, centerX, centerY - 10); 

                // 2. Draw the Label ("Total Units")
                ctx.font = `0.6em Inter, sans-serif`;
                ctx.fillStyle = '#64748b'; 
                ctx.fillText("Total Units", centerX, centerY + 15);

                ctx.save();
            }
        }
    }];

    return (
        // 💡 ADDED FLEX STYLES HERE TO CENTER THE DOUGHNUT INSIDE ITS PARENT DIV
        <div className="w-100 position-relative d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            {totalOutput === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">
                    <div className="bg-light rounded-circle p-4 mb-3">
                        <i className="bi bi-pie-chart-fill fs-1 text-secondary opacity-50"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No Data Recorded Today</h6>
                    <p className="small m-0 text-secondary">Start scanning units to see performance data.</p>
                </div>
            ) : (
                <Doughnut 
                    ref={chartInternalRef}
                    data={chartData} 
                    options={options} 
                    plugins={plugins}
                />
            )}
        </div>
    );
});
// =========================================================================
// END UPDATED: CHART COMPONENT
// =========================================================================