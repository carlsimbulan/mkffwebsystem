import React, { useMemo, useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function StationHomeDashboard({ currentStation, homeStats, setActiveTab, announcementCount, logs, calculateMetrics, dynamicTargetTimes = {} }) {
    
    // 🔑 Track loading state for target times
    const [isTargetTimeLoading, setIsTargetTimeLoading] = useState(false);
    
    // 🔑 Delay calculation function (updated to use dynamic target times)
    const checkUnitDelay = (stationId, updatedAt) => {
        const threshold = dynamicTargetTimes[stationId] || 10;
        const lastUpdate = new Date(updatedAt).getTime();
        const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
        if (minutesInStation > threshold * 3) return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation };
        if (minutesInStation > threshold) return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation };
        return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation };
    };

    // 🔑 1. Filter logs to find only Delayed Units 
    // Ginagamit ang assembly_no (underscore) base sa logs data
    const delayedUnits = useMemo(() => {
        return logs.filter(unit => {
            const statusText = (unit.status || '').toLowerCase();
            const isInProgressOrNG = unit.status === 'In Progress' || statusText.includes('no good') || statusText.includes('ng');
            if (!isInProgressOrNG) return false;
            
            const delay = checkUnitDelay(currentStation, unit.updated_at || unit.created_at);
            return delay.isDelayed;
        }).map(unit => {
            const delay = checkUnitDelay(currentStation, unit.updated_at || unit.created_at);
            return {
                ...unit,
                delayMinutes: Math.round(delay.minutes)
            };
        });
    }, [logs, currentStation, dynamicTargetTimes]);

    // 🔑 NOTES STATE FOR DELAYED UNITS
    const [delayedUnitNotes, setDelayedUnitNotes] = useState({});
    
    // 🔑 Track target time changes for visual feedback
    const [previousTargetTime, setPreviousTargetTime] = useState(dynamicTargetTimes[currentStation] || 10);
    const [showTargetTimeUpdate, setShowTargetTimeUpdate] = useState(false);
    
    // Effect to detect target time changes
    useEffect(() => {
        const currentTargetTime = dynamicTargetTimes[currentStation] || 10;
        if (currentTargetTime !== previousTargetTime) {
            setIsTargetTimeLoading(true);
            setPreviousTargetTime(currentTargetTime);
            setShowTargetTimeUpdate(true);
            
            // Show loading for 1 second, then show update notification
            setTimeout(() => {
                setIsTargetTimeLoading(false);
            }, 1000);
            
            // Hide the update indicator after 5 seconds
            setTimeout(() => setShowTargetTimeUpdate(false), 5000);
        }
    }, [dynamicTargetTimes, currentStation, previousTargetTime]);

    // 🔑 Get current task based on station
    const getCurrentTask = (stationId) => {
        const stationTasks = {
            'Station 1': 'Header Seating Check',
            'Station 2': 'Soldering Inspection',
            'Station 3': 'Component Testing',
            'Station 4': 'Quality Control',
            'Station 5': 'Final Assembly',
            'Station 6': 'Voltage Calibration',
            'Station 7': 'Packaging Inspection'
        };
        return stationTasks[stationId] || 'Processing Task';
    };

    // 🔑 Handle note change for delayed unit
    const handleNoteChange = (unitId, note) => {
        setDelayedUnitNotes(prev => ({
            ...prev,
            [unitId]: note
        }));
    };

    const totalUnits = homeStats.completed + homeStats.inProgress + homeStats.ng;
    
    const calculateStationPercentage = (value) => {
        if (totalUnits === 0) return '0.0%';
        return ((value / totalUnits) * 100).toFixed(1) + '%';
    };

    const SimpleStatCard = ({ title, value, percentage, label, borderColor, badgeClass, icon }) => (
        <div className="col-md-3">
            <div className={`card border-0 shadow-sm h-100 border-top border-4 ${borderColor}`} style={{ borderRadius: '12px' }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className={`bi ${icon} fs-5 text-dark opacity-75`}></i>
                        </div>
                        <div className={`badge ${badgeClass} rounded-pill px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                            {percentage} {label}
                        </div>
                    </div>
                    <div className="text-uppercase fw-bold text-secondary mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.8px' }}>
                        {title}
                    </div>
                    <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '2rem' }}>{value}</h2>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="d-flex flex-column h-100 animate-in fade-in pb-4 px-2">

            {/* --- HEADER SECTION --- */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1" style={{ fontSize: '0.75rem' }}>
                            <li className="breadcrumb-item text-primary fw-bold">MKFF SYSTEM</li>
                            <li className="breadcrumb-item active">{currentStation.toUpperCase()}</li>
                        </ol>
                    </nav>
                    <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-1px' }}>Station Overview</h2>
                </div>
                
            </div>

            {/* --- STAT CARDS ROW --- */}
            <div className="row g-3 mb-4">
                <SimpleStatCard 
                    title="Completed Units" value={homeStats.completed} 
                    percentage={calculateStationPercentage(homeStats.completed)} 
                    label="Yield" borderColor="border-success" icon="bi-check-all"
                    badgeClass="bg-success bg-opacity-10 text-success"
                />
                <SimpleStatCard 
                    title="Work in Progress" value={homeStats.inProgress} 
                    percentage={calculateStationPercentage(homeStats.inProgress)} 
                    label="WIP" borderColor="border-primary" icon="bi-clock-history"
                    badgeClass="bg-primary bg-opacity-10 text-primary"
                />
                <SimpleStatCard 
                    title="Rejected (NG)" value={homeStats.ng} 
                    percentage={calculateStationPercentage(homeStats.ng)} 
                    label="Loss" borderColor="border-danger" icon="bi-bug"
                    badgeClass="bg-danger bg-opacity-10 text-danger"
                />
                <SimpleStatCard 
                    title="Delayed Tasks" value={delayedUnits.length} 
                    percentage={delayedUnits.length} 
                    label="Units" borderColor="border-warning" icon="bi-exclamation-octagon"
                    badgeClass="bg-warning bg-opacity-10 text-warning"
                />
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="row g-4">
                {/* DELAYED UNITS TABLE */}
                <div className="col-lg-12">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white py-4 px-4 border-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0 fw-bold text-dark">
                                        <i className="bi bi-list-task me-2"></i> 
                                        {delayedUnits.length > 0 ? 'Critical Delay Tracking' : 'Current Operations'}
                                    </h5>
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="text-muted small me-2">Target Time Per Unit:</span>
                                        {isTargetTimeLoading ? (
                                            <span className="text-primary small fw-bold">
                                                <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                                                Updating...
                                            </span>
                                        ) : (
                                            <span className={`text-primary small fw-bold ${showTargetTimeUpdate ? 'target-time-update' : ''}`}>
                                                {(() => {
                                                    const targetMinutes = dynamicTargetTimes[currentStation] || 10;
                                                    if (targetMinutes >= 60) {
                                                        const hours = Math.floor(targetMinutes / 60);
                                                        const mins = targetMinutes % 60;
                                                        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
                                                    }
                                                    return `${targetMinutes}m`;
                                                })()}
                                                {showTargetTimeUpdate && !isTargetTimeLoading && (
                                                    <span className="badge bg-light text-dark rounded-pill px-2 py-1 ms-2" style={{ fontSize: '0.6rem' }}>
                                                        <i className="bi bi-arrow-clockwise me-1"></i>
                                                        Updated
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {delayedUnits.length > 0 && <span className="badge bg-danger rounded-pill px-3">Attention Required</span>}
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {delayedUnits.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                            <tr>
                                                <th className="px-4">MODEL</th>
                                                <th>ASSEMBLY NO</th>
                                                <th>CURRENT TASK</th>
                                                <th>DELAY TIME</th>
                                                <th>STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '0.85rem' }}>
                                            {delayedUnits.map((unit) => {
                                                const delay = checkUnitDelay(currentStation, unit.updated_at || unit.created_at);
                                                const isCritical = delay.level === 'CRITICAL';
                                                return (
                                                    <tr key={unit.id} className={isCritical ? 'critical-delay-row' : ''}>
                                                        <td className="px-4">{unit.model || unit.model_id}</td>
                                                        <td>
                                                            {unit.assembly_no || unit.assemblyNo}
                                                        </td>
                                                        <td>
                                                            {getCurrentTask(currentStation)}
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {unit.delayMinutes}m Over
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-secondary px-2 rounded-pill">
                                                                {unit.status === 'In Progress' ? 'IN PROGRESS' : 'NO GOOD (NG)'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-check2-all text-success display-4 mb-3"></i>
                                    <h5 className="fw-bold">LINE CLEAR</h5>
                                    <p className="text-muted small">All units are operating within Takt Time efficiency.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-in { animation: fadeInUp 0.4s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .smaller { font-size: 0.75rem; }
                
                /* Target time card animations */
                .target-time-card {
                    transition: all 0.3s ease;
                }
                .target-time-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
                }
                
                /* Pulse animation for target time updates */
                @keyframes targetTimePulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .target-time-update {
                    animation: targetTimePulse 0.6s ease-in-out;
                }
                
                /* Critical delay row styling */
                .critical-delay-row {
                    background-color: rgba(220, 38, 38, 0.1) !important;
                }
            `}</style>
        </div>
    );
}