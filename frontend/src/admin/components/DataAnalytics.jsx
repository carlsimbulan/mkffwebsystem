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
    const [timeFilter, setTimeFilter] = useState('month');
    
    // Refs for individual charts to enable image export
    const trendChartRef = useRef(null);
    const rankingChartRef = useRef(null);

    // 1. FILTER LOGIC
    const filteredLogs = useMemo(() => {
        const now = new Date();
        return unitHistoryLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            if (timeFilter === 'day') {
                return logDate.toDateString() === now.toDateString();
            } else if (timeFilter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return logDate >= oneWeekAgo;
            } else if (timeFilter === 'month') {
                return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }, [unitHistoryLogs, timeFilter]);

    // 2. TREND CHART LOGIC (Line Chart)
    const trendData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const completedCounts = new Array(12).fill(0);
        const ngCounts = new Array(12).fill(0);

        unitHistoryLogs.forEach(log => {
            const date = new Date(log.timestamp);
            if (log.status_after === 'Completed') completedCounts[date.getMonth()]++;
            else if (log.status_after === 'No Good (NG)') ngCounts[date.getMonth()]++;
        });

        return {
            labels: months,
            datasets: [
                { label: 'Completed', data: completedCounts, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, tension: 0.4 },
                { label: 'NG', data: ngCounts, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
            ]
        };
    }, [unitHistoryLogs]);

    // 3. RANKING CHART LOGIC (Bar Chart)
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

    // 4. EXPORT TO IMAGE HANDLER
    const downloadChartImage = (chartRef, fileName) => {
        const link = document.createElement('a');
        link.download = `${fileName}_${new Date().getTime()}.png`;
        link.href = chartRef.current.toBase64Image();
        link.click();
    };

    return (
        <div className="p-2 animate-in fade-in">
            {/* Header with Time Filters */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                <div className="p-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Production Performance Analytics</h4>
                        <p className="text-muted small mb-0">Monitor factory throughput and rejection trends with live filters.</p>
                    </div>
                    <div className="btn-group p-1 bg-light rounded-pill" style={{ border: '1px solid #e5e7eb' }}>
                        {['day', 'week', 'month', 'year'].map((filter) => (
                            <button 
                                key={filter}
                                className={`btn rounded-pill px-3 btn-sm text-capitalize ${timeFilter === filter ? 'btn-danger shadow-sm' : 'text-muted'}`} 
                                onClick={() => setTimeFilter(filter)}
                            >
                                {filter === 'day' ? 'Today' : `This ${filter}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Monthly Line Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <h6 className="fw-bold text-muted text-uppercase mb-0">Production Yield Trend (Yearly)</h6>
                            <button 
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                onClick={() => downloadChartImage(trendChartRef, 'Production_Yield_Trend')}
                            >
                                <i className="bi bi-download me-2"></i>Export Image
                            </button>
                        </div>
                        <div style={{ height: '350px' }}>
                            <Line 
                                ref={trendChartRef}
                                data={trendData} 
                                options={{ maintainAspectRatio: false, animation: { duration: 800 }, plugins: { legend: { position: 'bottom' } } }} 
                            />
                        </div>
                    </div>
                </div>

                {/* KPI Overview Box */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 bg-dark h-100 rounded-4" style={{ color: '#e5e7eb' }}>
                        <h6 className="fw-bold text-danger text-uppercase mb-4" style={{ letterSpacing: '1px' }}>
                            Insights: {timeFilter === 'day' ? 'TODAY' : timeFilter.toUpperCase()}
                        </h6>
                        
                        <div className="mb-4">
                            <span className="small opacity-75 d-block mb-1">Total Processed Units</span>
                            <h2 className="fw-bold text-white">{filteredLogs.length} Units</h2>
                        </div>
                        
                        <div className="mb-4">
                            <span className="small opacity-75 d-block mb-1">Production Success Rate</span>
                            <h3 className="fw-bold text-success" style={{ fontSize: '2rem' }}>
                                {((filteredLogs.filter(l => l.status_after === 'Completed').length / (filteredLogs.length || 1)) * 100).toFixed(1)}%
                            </h3>
                        </div>
                        
                        <div className="mt-auto">
                            <div className="alert border-0 small mb-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                                <i className="bi bi-info-circle me-2 text-info"></i>
                                {timeFilter === 'day' ? 'Showing data for today only.' : 
                                 timeFilter === 'week' ? 'Data reflects the last 7 days.' : 
                                 timeFilter === 'month' ? 'Data for the current month.' : 'Showing all historical data for the year.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Station Breakdown Bar Chart */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 rounded-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold text-muted text-uppercase mb-0">Station Performance Ranking (Completed vs NG)</h6>
                            <div className="d-flex gap-2 align-items-center">
                                <span className="badge bg-light text-dark border px-3 py-2">Scope: {timeFilter.toUpperCase()}</span>
                                <button 
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                    onClick={() => downloadChartImage(rankingChartRef, 'Station_Performance')}
                                >
                                    <i className="bi bi-download me-2"></i>Export Image
                                </button>
                            </div>
                        </div>
                        <div style={{ height: '400px' }}>
                            <Bar 
                                ref={rankingChartRef}
                                data={stationRanking} 
                                options={{ 
                                    indexAxis: 'y', 
                                    maintainAspectRatio: false,
                                    animation: { duration: 800 },
                                    plugins: { legend: { position: 'top' } },
                                    scales: { 
                                        x: { stacked: false, grid: { display: false } }, 
                                        y: { stacked: false, grid: { color: '#f3f4f6' } } 
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}