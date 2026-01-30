import React, { useMemo, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import station standard times from parent component
const STATION_STANDARD_TIMES = {
    'Station1': 6, 'Station 1': 6,
    'Station2': 8, 'Station 2': 8,
    'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12,
    'Station5': 15, 'Station 5': 15,
    'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3,
    'Station8': 15, 'Station 8': 15,
    'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8,
    'Station11': 22, 'Station 11': 22,
    'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10,
    'Station14': 8, 'Station 14': 8,
    'Station15': 5, 'Station 15': 5,
};

export function StationHomeDashboard({ currentStation, homeStats, setActiveTab, announcementCount, logs, calculateMetrics }) {
    
    // 🔑 Delay calculation function (same as admin component)
    const checkUnitDelay = (stationId, updatedAt) => {
        const threshold = STATION_STANDARD_TIMES[stationId] || 10;
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
    }, [logs, currentStation]);

    // 🔑 NOTES STATE FOR DELAYED UNITS
    const [delayedUnitNotes, setDelayedUnitNotes] = useState({});

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
                
                <div className="d-flex gap-2">
                   {announcementCount > 0 && (
    <button className="btn btn-warning shadow-sm d-flex align-items-center gap-2 px-3 rounded-pill fw-bold animate-pulse" 
            onClick={() => setActiveTab('announcements')} 
            style={{ fontSize: '0.8rem' }}>
        <i className="bi bi-megaphone-fill"></i>
        {announcementCount} NEW {announcementCount === 1 ? 'UPDATE' : 'UPDATES'} TODAY
    </button>
)}
                    <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2 px-4 rounded-pill fw-bold" 
                            onClick={() => setActiveTab('input_unit')} style={{ fontSize: '0.8rem' }}>
                        <i className="bi bi-qr-code-scan"></i> NEW ENTRY
                    </button>
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
                                <h5 className="mb-0 fw-bold text-dark">
                                    <i className="bi bi-list-task me-2 text-primary"></i> 
                                    {delayedUnits.length > 0 ? 'Critical Delay Tracking' : 'Current Operations'}
                                </h5>
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
                                                <th>REMARKS</th>
                                                <th>DELAY TIME</th>
                                                <th>STATUS</th>
                                                <th>CHECKLIST NOTES</th>
                                                <th className="text-end px-4">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '0.85rem' }}>
                                            {delayedUnits.map((unit) => (
                                                <tr key={unit.id}>
                                                    {/* Binago: log.model_id o log.model depende sa source */}
                                                    <td className="px-4 fw-bold text-dark">{unit.model || unit.model_id}</td>
                                                    {/* PINAKAMAHALAGA: ASSEMBLY NO FIX (underscore dapat) */}
                                                    <td className="fw-bold text-primary">
                                                        <code style={{fontSize: '0.9rem'}}>{unit.assembly_no || unit.assemblyNo}</code>
                                                    </td>
                                                    <td className="text-muted" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {unit.remarks || <span className="opacity-50 italic">No remarks</span>}
                                                    </td>
                                                    <td>
                                                        <div className="text-danger fw-bold d-flex align-items-center gap-1">
                                                            <i className="bi bi-alarm-fill"></i> {unit.delayMinutes}m Over
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            unit.status === 'In Progress' 
                                                                ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' 
                                                                : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'
                                                        } px-2 rounded-pill`}>
                                                            {unit.status === 'In Progress' ? 'IN PROGRESS' : 'NO GOOD (NG)'}
                                                        </span>
                                                    </td>
                                                    <td style={{ minWidth: '200px' }}>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Add required checklist notes..."
                                                            value={delayedUnitNotes[unit.id] || ''}
                                                            onChange={(e) => handleNoteChange(unit.id, e.target.value)}
                                                            style={{ fontSize: '0.8rem' }}
                                                        />
                                                        {delayedUnitNotes[unit.id] && (
                                                            <div className="small text-muted mt-1">
                                                                <i className="bi bi-check-circle-fill text-success"></i> Notes added
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-end px-4">
                                                        <button className="btn btn-sm btn-dark rounded-pill px-3 fw-bold" onClick={() => setActiveTab('in_progress')}>
                                                            MANAGE
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-check2-all text-success display-4 mb-3"></i>
                                    <h5 className="fw-bold">No Delays Detected</h5>
                                    <p className="text-muted small">All units are currently within the standard processing time.</p>
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
            `}</style>
        </div>
    );
}