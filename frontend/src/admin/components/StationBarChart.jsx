import React, { useRef, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const chartRef = useRef(null);
    const [gradientSuccess, setGradientSuccess] = useState(null);
    const [gradientDanger, setGradientDanger] = useState(null);

    const liveLogs = logs.filter(l => l.status !== 'Pending Approval');

    // Prepare dataset per station
    const summaries = stations.map(station => {
        // Calculate metrics for both display and tooltip use
        const metrics = calculateMetrics(station.id, liveLogs) || { completedUnits: 0, ngUnits: 0 };
        return {
            name: station.name,
            completed: metrics.completedUnits || 0,
            ng: metrics.ngUnits || 0,
            total: (metrics.completedUnits || 0) + (metrics.ngUnits || 0)
        };
    });

    const totalOutput = summaries.reduce((sum, s) => sum + s.completed + s.ng, 0);

    // Create Gradients on Mount/Update (More robust check)
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        
        // Success Gradient (Emerald/Bootstrap Success)
        const gradSuccess = ctx.createLinearGradient(0, 0, chart.width, 0);
        gradSuccess.addColorStop(0, '#10b981'); // Dark Green Start
        gradSuccess.addColorStop(1, '#34d399'); // Light Green End
        setGradientSuccess(gradSuccess);

        // Danger Gradient (Red/Bootstrap Danger)
        const gradDanger = ctx.createLinearGradient(0, 0, chart.width, 0);
        gradDanger.addColorStop(0, '#ef4444'); // Dark Red Start
        gradDanger.addColorStop(1, '#f87171'); // Light Red End
        setGradientDanger(gradDanger);

    }, [totalOutput]); // Re-run if total output changes

    // Chart data
    const chartData = {
        labels: summaries.map(s => s.name),
        datasets: [
            {
                label: 'Completed',
                data: summaries.map(s => s.completed),
                backgroundColor: gradientSuccess || '#10b981',
                hoverBackgroundColor: gradientSuccess || '#10b981', // Use the same color for hover
                borderRadius: 10, // Slightly reduced rounding for cleaner look
                borderSkipped: false,
                barThickness: 10, // Thinner bars for better separation
            },
            {
                label: 'No Good (NG)',
                data: summaries.map(s => s.ng),
                backgroundColor: gradientDanger || '#ef4444',
                hoverBackgroundColor: gradientDanger || '#ef4444', // Use the same color for hover
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bars
        scales: {
            x: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    color: '#f1f5f9',
                    borderDash: [4, 4],
                    drawBorder: false, // Remove border line
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, family: "'Inter', sans-serif" },
                },
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    // UPDATED FONT: Bolder and slightly larger for readability
                    font: { size: 13, weight: '700', family: "'Inter', sans-serif" }, 
                    autoSkip: false,
                },
                border: { display: false },
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 25,
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
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                // ADDED: Custom callback to show total output
                callbacks: {
                    title: (tooltipItem) => {
                        const stationName = tooltipItem[0].label;
                        const stationData = summaries.find(s => s.name === stationName);
                        return stationName;
                    },
                    afterBody: (tooltipItem) => {
                         const stationName = tooltipItem[0].label;
                         const stationData = summaries.find(s => s.name === stationName);
                         if (stationData && stationData.total > 0) {
                            const yieldRate = ((stationData.completed / stationData.total) * 100).toFixed(1);
                            return [
                                `---`,
                                `Total Output: ${stationData.total}`,
                                `Yield Rate: ${yieldRate}%`
                            ];
                         }
                         return null;
                    }
                }
            },
        },
    };

    return (
        <div className="w-100 h-100 position-relative" style={{ minHeight: '400px' }}>
            {totalOutput === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div className="bg-light rounded-circle p-4 mb-3">
                        <i className="bi bi-bar-chart-line fs-1 text-secondary opacity-50"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No Data Yet</h6>
                    <p className="small m-0 text-secondary">Start production to see live metrics.</p>
                </div>
            ) : (
                <Bar ref={chartRef} data={chartData} options={options} />
            )}
        </div>
    );
};