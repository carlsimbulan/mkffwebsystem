import React from 'react';
import { Doughnut } from 'react-chartjs-2';

// --- CHART COMPONENT: UnitPieChart ---
export const UnitPieChart = ({ metrics, title }) => {
    // Convert metrics into Chart.js data object format
    const chartData = {
        labels: ['Completed', 'No Good (NG)', 'In Progress'],
        datasets: [
            {
                label: 'Unit Count',
                data: [metrics.completedUnits, metrics.ngUnits, metrics.pendingUnits],
                backgroundColor: ['#198754', '#dc3545', '#0d6efd'],
                borderColor: ['#fff', '#fff', '#fff'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: false, text: title },
        },
    };

    const total = metrics.completedUnits + metrics.ngUnits + metrics.pendingUnits;

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white"><h6 className="mb-0 text-uppercase small fw-bold">{title}</h6></div>
            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                <div style={{ height: '150px', width: '100%', marginBottom: '10px' }}>
                    {/* Render Doughnut Chart */}
                    {total === 0 ? (
                        <p className="text-muted">No units recorded.</p>
                    ) : (
                        <Doughnut data={chartData} options={options} />
                    )}
                </div>

                {/* Manual breakdown below the chart */}
                <div className="mt-2 w-100">
                    {chartData.labels.map((label, index) => {
                        const value = chartData.datasets[0].data[index];
                        const color = chartData.datasets[0].backgroundColor[index];
                        const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(1);
                        return (
                            <div key={label} className="d-flex justify-content-between small">
                                <span className="fw-bold" style={{ color: color }}>• {label}</span>
                                <span>{value} ({percentage}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};