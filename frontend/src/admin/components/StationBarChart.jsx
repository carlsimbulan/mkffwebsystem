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
        const completed = metrics.completedUnits || 0;
        const ng = metrics.ngUnits || 0;
        const total = completed + ng;
        
        // Calculate percentage achievements
        const achievementPercent = total > 0 ? (completed / total) * 100 : 0;
        const defectPercent = total > 0 ? (ng / total) * 100 : 0;
        
        return {
            name: station.name,
            // Raw Counts (kept for richer tooltip data)
            completedUnits: completed, 
            ngUnits: ng,
            totalUnits: total,
            
            // Percentage Data (used for the actual bar chart drawing)
            achievementPercent: parseFloat(achievementPercent.toFixed(1)), // Use percentage for the bar height
            defectPercent: parseFloat(defectPercent.toFixed(1)),           // Use percentage for the bar height
        };
    }).filter(s => s.totalUnits > 0); // Only show stations with some production data

    const totalOutput = summaries.reduce((sum, s) => sum + s.totalUnits, 0);

    // Create Gradients on Mount/Update
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
                // New Label: Product Plan Achievement %
                label: 'Product Plan Achievement %',
                data: summaries.map(s => s.achievementPercent),
                backgroundColor: gradientSuccess || '#10b981',
                hoverBackgroundColor: gradientSuccess || '#10b981',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 10,
            },
            {
                // New Label: Defect %
                label: 'Defect %',
                data: summaries.map(s => s.defectPercent),
                backgroundColor: gradientDanger || '#ef4444',
                hoverBackgroundColor: gradientDanger || '#ef4444',
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
                // --- KEY CHANGE: Set the maximum value to 100
                max: 100, 
                // --- KEY CHANGE: Append '%' to the x-axis ticks
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, family: "'Inter', sans-serif" },
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: '#f1f5f9',
                    borderDash: [4, 4],
                    drawBorder: false,
                },
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    // Bolder and slightly larger for readability
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
                // Custom callback updated to show raw counts and yield rate
                callbacks: {
                    title: (tooltipItem) => {
                        const stationName = tooltipItem[0].label;
                        return stationName;
                    },
                    label: (context) => {
                        const stationName = context.label;
                        const stationData = summaries.find(s => s.name === stationName);
                        
                        let label = context.dataset.label || '';
                        const value = context.parsed.x;
                        
                        if (stationData) {
                            if (context.dataset.label.includes('Achievement')) {
                                return `${label}: ${value}% (${stationData.completedUnits} units)`;
                            } else if (context.dataset.label.includes('Defect')) {
                                return `${label}: ${value}% (${stationData.ngUnits} units)`;
                            }
                        }
                        return `${label}: ${value}%`;
                    },
                    afterBody: (tooltipItem) => {
                        const stationName = tooltipItem[0].label;
                        const stationData = summaries.find(s => s.name === stationName);
                        
                        if (stationData && stationData.totalUnits > 0) {
                            return [
                                `---`,
                                `Total Output (Units): ${stationData.totalUnits}`,
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
            {summaries.length === 0 || totalOutput === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div className="bg-light rounded-circle p-4 mb-3">
                        <i className="bi bi-bar-chart-line fs-1 text-secondary opacity-50"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No Production Data</h6>
                    <p className="small m-0 text-secondary">No recorded Completed or NG units for active stations.</p>
                </div>
            ) : (
                <Bar ref={chartRef} data={chartData} options={options} />
            )}
        </div>
    );
};