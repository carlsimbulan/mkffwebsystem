import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const chartRef = useRef(null);
    const [gradientSuccess, setGradientSuccess] = useState(null);
    const [gradientDanger, setGradientDanger] = useState(null);

    // UseMemo to prevent recalculating summaries on every render unless logs/stations change
    const summaries = useMemo(() => {
        const liveLogs = logs.filter(l => l.status !== 'Pending Approval');
        return stations.map(station => {
            const metrics = calculateMetrics(station.id, liveLogs) || { completedUnits: 0, ngUnits: 0 };
            const completed = metrics.completedUnits || 0;
            const ng = metrics.ngUnits || 0;
            const total = completed + ng;
            
            return {
                name: station.name,
                completedUnits: completed, 
                ngUnits: ng,
                totalUnits: total,
                achievementPercent: total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0, 
                defectPercent: total > 0 ? parseFloat(((ng / total) * 100).toFixed(1)) : 0,          
            };
        });
    }, [logs, stations, calculateMetrics]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        
        // Only create gradients if they don't exist to save resources
        const gradSuccess = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradSuccess.addColorStop(0, '#34d399'); 
        gradSuccess.addColorStop(1, '#10b981'); 
        setGradientSuccess(gradSuccess);

        const gradDanger = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradDanger.addColorStop(0, '#f87171'); 
        gradDanger.addColorStop(1, '#ef4444'); 
        setGradientDanger(gradDanger);
    }, [summaries.length]); // Only re-run if station count changes

    const chartData = {
        labels: summaries.map(s => s.name),
        datasets: [
            {
                label: 'Product Plan Achievement %',
                data: summaries.map(s => s.achievementPercent),
                backgroundColor: gradientSuccess || '#10b981',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 15, 
            },
            {
                label: 'Defect %',
                data: summaries.map(s => s.defectPercent),
                backgroundColor: gradientDanger || '#ef4444',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 15, 
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        
        // --- PERFORMANCE-OPTIMIZED ANIMATIONS ---
        animation: {
            duration: 750,          // Snappy but visible
            easing: 'easeOutQuart', // Smooth deceleration
            delay: (context) => {
                // Staggered delay: prevents CPU spikes by not animating all bars at once
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 100 + context.datasetIndex * 100;
                }
                return delay;
            }
        },
        // Hover interactions stay instant to prevent "laggy" feeling mouse movement
        transitions: {
            active: {
                animation: { duration: 0 }
            }
        },
        // ----------------------------------------
        
        indexAxis: 'x',
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    font: { size: 12, weight: '600' }, 
                    autoSkip: false,
                },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                max: 100, 
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    callback: (value) => value + '%'
                },
                grid: {
                    color: '#f1f5f9',
                    borderDash: [4, 4],
                },
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                    color: '#64748b',
                }
            },
            tooltip: {
                enabled: true,
                animation: { duration: 150 }, // Slight fade for tooltips
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const stationData = summaries[context.dataIndex];
                        let label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (stationData) {
                            const unitCount = context.datasetIndex === 0 
                                ? stationData.completedUnits 
                                : stationData.ngUnits;
                            return `${label}: ${value}% (${unitCount} units)`;
                        }
                        return `${label}: ${value}%`;
                    }
                }
            },
        },
    };

    return (
        <div className="w-100 h-100 position-relative" style={{ minHeight: '400px' }}>
            {summaries.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <h6 className="fw-bold text-dark">No Stations Configured</h6>
                </div>
            ) : (
                <Bar ref={chartRef} data={chartData} options={options} />
            )}
        </div>
    );
};