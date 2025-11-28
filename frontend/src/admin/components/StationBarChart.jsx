import React from 'react';
import { Bar } from 'react-chartjs-2';

// --- CHART COMPONENT: StationBarChart ---
export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const liveLogs = logs.filter(l => l.status !== 'Pending Approval');

    const summaries = stations.map(station => ({
        ...calculateMetrics(station.id, liveLogs),
        name: station.name
    }));

    const chartLabels = summaries.map(s => s.name);
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Total Output (Completed + NG)',
                data: summaries.map(s => s.yieldTotal),
                backgroundColor: 'rgba(220, 53, 69, 0.8)', // Danger Red
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Make it a horizontal bar chart
        scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: true } }
        },
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
    };

    const totalOutput = summaries.reduce((sum, s) => sum + s.yieldTotal, 0);

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white">
                <h5 className="mb-0"><i className="bi bi-bar-chart-fill me-2"></i>Daily Output Comparison (Excl. Pending)</h5>
            </div>
            <div className="card-body">
                {totalOutput === 0 ? (
                    <p className="text-muted text-center">No completed or NG units checked across all stations.</p>
                ) : (
                    <div style={{ height: '300px', width: '100%' }}>
                        <Bar data={chartData} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
};