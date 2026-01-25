import React, { useState, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
    Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function DataAnalytics({ unitHistoryLogs }) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const trendChartRef = useRef(null);

    // 1. DYNAMIC MONTHLY TREND LOGIC
    const trendData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const completedCounts = new Array(12).fill(0);
        const ngCounts = new Array(12).fill(0);

        if (unitHistoryLogs) {
            unitHistoryLogs.forEach(log => {
                const date = new Date(log.timestamp);
                if (date.getFullYear() === parseInt(selectedYear)) {
                    const monthIdx = date.getMonth();
                    if (log.status_after === 'Completed') completedCounts[monthIdx]++;
                    else if (log.status_after === 'No Good (NG)') ngCounts[monthIdx]++;
                }
            });
        }

        return {
            labels: months,
            datasets: [
                { 
                    label: 'Completed Units', 
                    data: completedCounts, 
                    borderColor: '#22c55e', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    fill: true, 
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 3
                },
                { 
                    label: 'No Good (NG)', 
                    data: ngCounts, 
                    borderColor: '#ef4444', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    fill: true, 
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 9,
                    pointBackgroundColor: '#ef4444',
                    borderWidth: 3
                }
            ]
        };
    }, [unitHistoryLogs, selectedYear]);

    const downloadChartImage = () => {
        if (!trendChartRef.current) return;
        const link = document.createElement('a');
        link.download = `Production_Trend_${selectedYear}_${new Date().getTime()}.png`;
        link.href = trendChartRef.current.toBase64Image();
        link.click();
    };

    return (
        <div className="p-2 animate-in fade-in">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                {/* Header with Title and Year Selector Only */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                            <i className="bi bi-graph-up-arrow fs-5"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0 text-dark">Production Trend Analysis</h5>
                            <p className="text-muted small mb-0 font-monospace">Visualizing annual manufacturing yield</p>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <select 
                            className="form-select form-select-sm fw-bold text-primary border-primary rounded-pill shadow-none" 
                            style={{ width: '120px' }}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value={currentYear}>{currentYear}</option>
                            <option value={currentYear - 1}>{currentYear - 1}</option>
                            <option value={currentYear - 2}>{currentYear - 2}</option>
                        </select>
                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={downloadChartImage}>
                            <i className="bi bi-camera-fill me-2"></i>Snapshot
                        </button>
                    </div>
                </div>

                {/* Chart Area - Full Width */}
                <div style={{ height: '450px', width: '100%' }}>
                    <Line 
                        ref={trendChartRef} 
                        data={trendData} 
                        options={{ 
                            maintainAspectRatio: false, 
                            plugins: { 
                                legend: { 
                                    position: 'top', 
                                    align: 'end',
                                    labels: { usePointStyle: true, boxWidth: 8, font: { weight: 'bold', size: 12 } } 
                                },
                                tooltip: { 
                                    backgroundColor: '#1e293b', 
                                    padding: 15, 
                                    titleFont: { size: 14 },
                                    bodyFont: { size: 13 },
                                    cornerRadius: 10 
                                }
                            },
                            scales: {
                                y: { 
                                    beginAtZero: true, 
                                    grid: { color: '#f1f5f9' }, 
                                    ticks: { stepSize: 1, color: '#64748b', font: { family: 'monospace' } } 
                                },
                                x: { 
                                    grid: { display: false },
                                    ticks: { color: '#64748b', font: { weight: 'bold' } }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>
    );
}