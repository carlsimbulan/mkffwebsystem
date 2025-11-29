import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
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

    // Chart data
    const chartData = {
        labels: summaries.map(s => s.name),
        datasets: [
            {
                label: 'Completed',
                data: summaries.map(s => s.completed),
                backgroundColor: '#198754', // Green
                borderRadius: 6,
            },
            {
                label: 'No Good (NG)',
                data: summaries.map(s => s.ng),
                backgroundColor: '#dc3545', // Red
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // horizontal bars
        scales: {
            x: {
                stacked: true, // key for stacked bars
                beginAtZero: true,
                grid: { color: 'rgba(203, 213, 225, 0.3)', drawBorder: false },
                ticks: { color: '#475569', font: { size: 12, weight: '500' } },
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: { color: '#1e293b', font: { size: 13, weight: '600' } },
            },
        },
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, padding: 15 } },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 6,
            },
        },
    };

    const totalOutput = summaries.reduce((sum, s) => sum + s.completed + s.ng, 0);

    return (
        <div
            className="p-3 h-100"
            style={{
                borderRadius: '16px',
                background: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
            }}
        >
            <h5 className="fw-bold text-uppercase small mb-3" style={{ letterSpacing: '0.5px' }}>
                Completed vs No Good Units per Station
            </h5>

            {totalOutput === 0 ? (
                <p className="text-muted text-center">
                    No completed or NG units checked across all stations.
                </p>
            ) : (
                <div style={{ height: '450px', width: '100%' }}>
                    <Bar data={chartData} options={options} />
                </div>
            )}
        </div>
    );
};
