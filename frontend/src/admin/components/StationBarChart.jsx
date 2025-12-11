import React, { useRef, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const StationBarChart = ({ logs, stations, calculateMetrics }) => {
    const chartRef = useRef(null);
    const [gradientSuccess, setGradientSuccess] = useState(null);
    const [gradientDanger, setGradientDanger] = useState(null);

    const liveLogs = logs.filter(l => l.status !== 'Pending Approval');

    // Prepare dataset for ALL stations (No filter applied here)
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
            achievementPercent: parseFloat(achievementPercent.toFixed(1)), 
            defectPercent: parseFloat(defectPercent.toFixed(1)),          
        };
    }); // <-- TINANGGAL ANG .filter(s => s.totalUnits > 0)

    const totalOutput = summaries.reduce((sum, s) => sum + s.totalUnits, 0);

    // Create Gradients on Mount/Update
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        
        // Success Gradient (Emerald/Bootstrap Success) - Vertical gradient
        const gradSuccess = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradSuccess.addColorStop(0, '#34d399'); // Light Green Start (Top)
        gradSuccess.addColorStop(1, '#10b981'); // Dark Green End (Bottom)
        setGradientSuccess(gradSuccess);

        // Danger Gradient (Red/Bootstrap Danger) - Vertical gradient
        const gradDanger = ctx.createLinearGradient(0, 0, 0, chart.height);
        gradDanger.addColorStop(0, '#f87171'); // Light Red Start (Top)
        gradDanger.addColorStop(1, '#ef4444'); // Dark Red End (Bottom)
        setGradientDanger(gradDanger);

    }, [totalOutput]); 

    // Chart data
    const chartData = {
        labels: summaries.map(s => s.name), // Lahat ng 15 stations kasama dito
        datasets: [
            {
                // Product Plan Achievement %
                label: 'Product Plan Achievement %',
                data: summaries.map(s => s.achievementPercent), // Magiging 0% kung walang output
                backgroundColor: gradientSuccess || '#10b981',
                hoverBackgroundColor: gradientSuccess || '#10b981',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 15, 
            },
            {
                // Defect %
                label: 'Defect %',
                data: summaries.map(s => s.defectPercent), // Magiging 0% kung walang output
                backgroundColor: gradientDanger || '#ef4444',
                hoverBackgroundColor: gradientDanger || '#ef4444',
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 15, 
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x', // Vertical bars
        scales: {
            x: { // X-axis (Stations)
                stacked: true,
                grid: { display: false },
                ticks: {
                    color: '#475569',
                    font: { size: 13, weight: '700', family: "'Inter', sans-serif" }, 
                    autoSkip: false, // <-- Siguraduhin na lahat ng station label ay lumabas
                },
                border: { display: false },
            },
            y: { // Y-axis (Percentage)
                stacked: true,
                beginAtZero: true,
                max: 100, 
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
                callbacks: {
                    title: (tooltipItem) => {
                        return tooltipItem[0].label;
                    },
                    label: (context) => {
                        const stationName = context.label;
                        const stationData = summaries.find(s => s.name === stationName);
                        
                        let label = context.dataset.label || '';
                        const value = context.parsed.y;
                        
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
                        
                        if (stationData) {
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

    // Note: Ginamit ko ang 'totalOutput === 0' para i-handle ang case na walang recorded units.
    // Kapag may units na, gagamitin na ang chart.
    return (
        <div className="w-100 h-100 position-relative" style={{ minHeight: '400px' }}>
            {summaries.length === 0 ? (
                // Only show this if there are literally no stations configured (unlikely, but for safety)
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div className="bg-light rounded-circle p-4 mb-3">
                        <i className="bi bi-bar-chart-line fs-1 text-secondary opacity-50"></i>
                    </div>
                    <h6 className="fw-bold text-dark">No Stations Configured</h6>
                    <p className="small m-0 text-secondary">Please ensure stations data is loaded.</p>
                </div>
            ) : (
                <Bar ref={chartRef} data={chartData} options={options} />
            )}
        </div>
    );
};