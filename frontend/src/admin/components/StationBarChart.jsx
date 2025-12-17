import React, { useRef, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const chartRef = useRef(null);
    const [gradientSuccess, setGradientSuccess] = useState(null);
    const [gradientDanger, setGradientDanger] = useState(null);

    const liveLogs = logs.filter(l => l.status !== 'Pending Approval');

    const summaries = stations.map(station => {
        const metrics = calculateMetrics(station.id, liveLogs) || { completedUnits: 0, ngUnits: 0 };
        const completed = metrics.completedUnits || 0;
        const ng = metrics.ngUnits || 0;
        const total = completed + ng;
        
        const achievementPercent = total > 0 ? (completed / total) * 100 : 0;
        const defectPercent = total > 0 ? (ng / total) * 100 : 0;
        
        return {
            name: station.name,
            completedUnits: completed, 
            ngUnits: ng,
            totalUnits: total,
            achievementPercent: parseFloat(achievementPercent.toFixed(1)), 
            defectPercent: parseFloat(defectPercent.toFixed(1)),          
        };
    });

    const totalOutput = summaries.reduce((sum, s) => sum + s.totalUnits, 0);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        
        // Success Gradient
        const gradSuccess = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradSuccess.addColorStop(0, '#34d399'); 
        gradSuccess.addColorStop(1, '#10b981'); 
        setGradientSuccess(gradSuccess);

        // Danger Gradient
        const gradDanger = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradDanger.addColorStop(0, '#f87171'); 
        gradDanger.addColorStop(1, '#ef4444'); 
        setGradientDanger(gradDanger);

    }, [totalOutput]); 

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
        // --- DISABLE ALL ANIMATIONS ---
        animation: false,
        animations: {
            colors: false,
            x: false,
        },
        transitions: {
            active: { animation: { duration: 0 } }
        },
        // ------------------------------
        indexAxis: 'x',
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    font: { size: 13, weight: '700' }, 
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
                    padding: 25,
                    color: '#64748b',
                }
            },
            tooltip: {
                // Pinanatili ang tooltip pero inalis ang animations nito
                enabled: true,
                animation: false,
                backgroundColor: 'rgba(30, 41, 59, 1)', // Solid para bawas process sa opacity
                callbacks: {
                    label: (context) => {
                        const stationData = summaries.find(s => s.name === context.label);
                        let label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (stationData) {
                            if (context.dataset.label.includes('Achievement')) {
                                return `${label}: ${value}% (${stationData.completedUnits} units)`;
                            } else {
                                return `${label}: ${value}% (${stationData.ngUnits} units)`;
                            }
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