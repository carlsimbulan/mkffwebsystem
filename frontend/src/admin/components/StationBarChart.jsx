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
        const metrics = calculateMetrics(station.id, liveLogs) || { completedUnits: 0, ngUnits: 0 };
        return {
            name: station.name,
            completed: metrics.completedUnits || 0,
            ng: metrics.ngUnits || 0,
        };
    });

    const totalOutput = summaries.reduce((sum, s) => sum + s.completed + s.ng, 0);

    // Create Gradients on Mount
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        
        // Success Gradient (Emerald)
        const gradSuccess = ctx.createLinearGradient(0, 0, 400, 0);
        gradSuccess.addColorStop(0, '#10b981'); // Start
        gradSuccess.addColorStop(1, '#34d399'); // End
        setGradientSuccess(gradSuccess);

        // Danger Gradient (Red)
        const gradDanger = ctx.createLinearGradient(0, 0, 400, 0);
        gradDanger.addColorStop(0, '#ef4444'); // Start
        gradDanger.addColorStop(1, '#f87171'); // End
        setGradientDanger(gradDanger);

    }, []);

    // Chart data
    const chartData = {
        labels: summaries.map(s => s.name),
        datasets: [
            {
                label: 'Completed',
                data: summaries.map(s => s.completed),
                backgroundColor: gradientSuccess || '#10b981',
                borderRadius: 20, // Fully rounded
                borderSkipped: false, // Round all corners
                barPercentage: 0.6,
                categoryPercentage: 0.7,
            },
            {
                label: 'No Good (NG)',
                data: summaries.map(s => s.ng),
                backgroundColor: gradientDanger || '#ef4444',
                borderRadius: 20, // Fully rounded
                borderSkipped: false, // Round all corners
                barPercentage: 0.6,
                categoryPercentage: 0.7,
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
                    color: '#f1f5f9', // Very light gray grid
                    borderDash: [4, 4],
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, family: "'Inter', sans-serif" },
                },
                border: { display: false }, 
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    font: { size: 12, weight: '600', family: "'Inter', sans-serif" },
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
                backgroundColor: 'rgba(30, 41, 59, 0.95)', // Dark blue-gray
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                padding: 14,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 6,
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
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