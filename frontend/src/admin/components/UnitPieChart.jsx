import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const UnitPieChart = ({ metrics, title }) => {
    const chartData = {
        labels: ['Completed', 'No Good (NG)', 'In Progress'],
        datasets: [
            {
                label: 'Unit Count',
                data: [metrics.completedUnits, metrics.ngUnits, metrics.pendingUnits],
                backgroundColor: ['#198754', '#dc3545', '#0d6efd'],
                borderWidth: 0,
                hoverOffset: 10,       // Smooth hover effect
                cutout: '65%',         // More modern donut size
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,        // We create a custom legend below
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                borderWidth: 0,
            },
        },
    };

    const total = metrics.completedUnits + metrics.ngUnits + metrics.pendingUnits;

    return (
        <div
            className="p-3"
            style={{
                borderRadius: '16px',
                background: '#ffffff',
                boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                height: '100%'
            }}
        >
            <h6
                className="fw-bold text-uppercase small mb-3"
                style={{ letterSpacing: '0.5px' }}
            >
                {title}
            </h6>

            <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '200px' }}>
                {total === 0 ? (
                    <p className="text-muted">No units recorded.</p>
                ) : (
                    <Doughnut data={chartData} options={options} />
                )}
            </div>

            {/* Modern Minimal Legend */}
            <div className="mt-3">
                {chartData.labels.map((label, index) => {
                    const value = chartData.datasets[0].data[index];
                    const color = chartData.datasets[0].backgroundColor[index];
                    const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(1);

                    return (
                        <div
                            key={label}
                            className="d-flex justify-content-between align-items-center py-1 small"
                            style={{ borderBottom: '1px solid #f1f5f9' }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                    }}
                                ></span>

                                <span className="fw-semibold">{label}</span>
                            </div>

                            <span className="text-muted fw-semibold">
                                {value} ({percentage}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
