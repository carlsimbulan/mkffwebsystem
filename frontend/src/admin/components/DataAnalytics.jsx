import React, { useState, useMemo, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
    PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function DataAnalytics({ logs, unitHistoryLogs, stations }) {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    // STATES
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [selectedYear, setSelectedYear] = useState(currentYear); // State para sa Year Selector ng Chart

    const trendChartRef = useRef(null);
    const rankingChartRef = useRef(null);

    // 1. BACKTRACKING LOGIC (Para sa Cards at Bar Chart)
    const filteredLogs = useMemo(() => {
        return unitHistoryLogs.filter(log => {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate >= startDate && logDate <= endDate;
        });
    }, [unitHistoryLogs, startDate, endDate]);

    // 2. DYNAMIC YEARLY TREND LOGIC (Base sa napiling taon sa dropdown)
    const trendData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const completedCounts = new Array(12).fill(0);
        const ngCounts = new Array(12).fill(0);

        unitHistoryLogs.forEach(log => {
            const date = new Date(log.timestamp);
            // I-filter ang data base sa napiling taon (selectedYear)
            if (date.getFullYear() === parseInt(selectedYear)) {
                if (log.status_after === 'Completed') completedCounts[date.getMonth()]++;
                else if (log.status_after === 'No Good (NG)') ngCounts[date.getMonth()]++;
            }
        });

        return {
            labels: months,
            datasets: [
                { label: 'Completed', data: completedCounts, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, tension: 0.4 },
                { label: 'NG', data: ngCounts, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
            ]
        };
    }, [unitHistoryLogs, selectedYear]);

    // 3. STATION RANKING LOGIC
    const stationRanking = useMemo(() => {
        const labels = stations.map(s => s.name);
        const completedData = labels.map(name => 
            filteredLogs.filter(l => l.station_name === name && l.status_after === 'Completed').length
        );
        const ngData = labels.map(name => 
            filteredLogs.filter(l => l.station_name === name && l.status_after === 'No Good (NG)').length
        );

        return {
            labels,
            datasets: [
                { label: 'Completed', data: completedData, backgroundColor: '#3b82f6', borderRadius: 5 },
                { label: 'No Good (NG)', data: ngData, backgroundColor: '#ef4444', borderRadius: 5 }
            ]
        };
    }, [filteredLogs, stations]);

    const downloadChartImage = (chartRef, fileName) => {
        if (!chartRef.current) return;
        const link = document.createElement('a');
        link.download = `${fileName}_${new Date().getTime()}.png`;
        link.href = chartRef.current.toBase64Image();
        link.click();
    };

    return (
        <div className="p-2 animate-in fade-in">
            {/* TOP HEADER: GLOBAL BACKTRACKING */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 bg-white p-4">
                <div className="row align-items-center">
                    <div className="col-lg-5 mb-3 mb-lg-0">
                        <h4 className="fw-bold mb-1 text-dark">Industrial Backtracking</h4>
                        <p className="text-muted small mb-0">Select a custom date range for the Station Performance and Insights.</p>
                    </div>
                    <div className="col-lg-7 d-flex flex-wrap justify-content-lg-end gap-2">
                        <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 border">
                            <label className="small fw-bold text-muted">From:</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-transparent" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <label className="small fw-bold text-muted ms-2">To:</label>
                            <input type="date" className="form-control form-control-sm border-0 bg-transparent" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <button className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm" onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }}>
                            Reset to Today
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* LINE CHART: Annual Trend with YEAR SELECTOR */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <h6 className="fw-bold text-muted text-uppercase mb-0">Production Trend</h6>
                                {/* YEAR SELECTOR DROPDOWN */}
                                <select 
                                    className="form-select form-select-sm fw-bold text-primary border-primary rounded-pill" 
                                    style={{ width: '100px' }}
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value={currentYear}>{currentYear}</option>
                                    <option value={currentYear - 1}>{currentYear - 1}</option>
                                    <option value={currentYear - 2}>{currentYear - 2}</option>
                                </select>
                            </div>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => downloadChartImage(trendChartRef, `Production_Trend_${selectedYear}`)}>
                                <i className="bi bi-download me-2"></i>Export
                            </button>
                        </div>
                        <div style={{ height: '320px' }}>
                            <Line ref={trendChartRef} data={trendData} options={{ maintainAspectRatio: false, animation: { duration: 800 }, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                    </div>
                </div>

                {/* KPI BOX */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white border-start border-5 border-danger">
                        <h6 className="fw-bold text-danger text-uppercase mb-4">Range Insights</h6>
                        <div className="mb-4">
                            <span className="small text-muted d-block mb-1">Processed Units (Range)</span>
                            <h2 className="fw-bold text-dark">{filteredLogs.length} Units</h2>
                            <small className="text-muted italic">{startDate} to {endDate}</small>
                        </div>
                        <div className="mb-4">
                            <span className="small text-muted d-block mb-1">Success Rate</span>
                            <h3 className="fw-bold text-success" style={{ fontSize: '2.2rem' }}>
                                {((filteredLogs.filter(l => l.status_after === 'Completed').length / (filteredLogs.length || 1)) * 100).toFixed(1)}%
                            </h3>
                        </div>
                        <div className="mt-auto p-3 bg-light rounded-3">
                            <div className="d-flex justify-content-between mb-1 small text-muted">
                                <span>NG Units:</span> <span className="fw-bold text-danger">{filteredLogs.filter(l => l.status_after === 'No Good (NG)').length}</span>
                            </div>
                            <div className="d-flex justify-content-between small text-muted">
                                <span>Completed:</span> <span className="fw-bold text-success">{filteredLogs.filter(l => l.status_after === 'Completed').length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BAR CHART */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold text-muted text-uppercase mb-0">Station Throughput Ranking</h6>
                            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => downloadChartImage(rankingChartRef, 'Station_Backtracking')}>
                                <i className="bi bi-download me-2"></i>Export
                            </button>
                        </div>
                        <div style={{ height: '400px' }}>
                            <Bar ref={rankingChartRef} data={stationRanking} options={{ indexAxis: 'y', maintainAspectRatio: false, animation: { duration: 800 }, plugins: { legend: { position: 'top' } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } } }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}