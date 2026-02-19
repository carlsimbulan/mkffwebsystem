import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const DiagnosticChart = ({ chartData, title }) => {
    if (!chartData) {
        return (
            <div className="text-center py-4">
                <div className="text-muted">No chart data available</div>
            </div>
        );
    }

    const { labels, delayData, unitsData, causeLabels, causeData } = chartData;

    // Bar chart data for station delays
    const barChartData = {
        labels: labels || [],
        datasets: [
            {
                label: 'Avg Delay (minutes)',
                data: delayData || [],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Delayed Units',
                data: unitsData || [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }
        ]
    };

    // Pie chart data for root causes
    const pieChartData = {
        labels: causeLabels || [],
        datasets: [
            {
                data: causeData || [],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // Red - Operator Performance
                    'rgba(245, 158, 11, 0.8)',  // Orange - Voltage Issues  
                    'rgba(59, 130, 246, 0.8)',  // Blue - Quality Failures
                    'rgba(34, 197, 94, 0.8)',   // Green - Process Delays
                    'rgba(168, 85, 247, 0.8)',  // Purple - Other
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(168, 85, 247, 1)',
                ],
                borderWidth: 1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title || 'Delay Analysis',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    drawBorder: false,
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Root Cause Breakdown',
                font: {
                    size: 14,
                    weight: 'bold'
                }
            }
        }
    };

    return (
        <div className="row mb-4">
            <div className="col-md-8 mb-3">
                <div style={{ height: '300px' }}>
                    <Bar data={barChartData} options={chartOptions} />
                </div>
            </div>
            <div className="col-md-4 mb-3">
                <div style={{ height: '300px' }}>
                    <Pie data={pieChartData} options={pieOptions} />
                </div>
            </div>
        </div>
    );
};
