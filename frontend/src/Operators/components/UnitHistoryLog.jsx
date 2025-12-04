import React from 'react';

const UnitHistoryTable = ({ historyLogs, loading, error }) => {
    if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (historyLogs.length === 0) return <div className="text-center py-5 bg-light border border-dashed">No History Found</div>;

    return (
        <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover table-striped mb-0 small">
                <thead className="table-dark">
                    <tr>
                        <th>Unit ID</th>
                        <th>Model</th>
                        <th>Assembly</th>
                        <th>Action</th>
                        <th>Station</th>
                        <th>Status</th>
                        <th>User</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {historyLogs.map((log) => (
                        <tr key={log.history_id}>
                            <td>{log.unit_id}</td>
                            <td className="fw-bold">{log.model || '-'}</td>
                            <td className="font-monospace">{log.assembly_no || '-'}</td>
                            <td>{log.action_type}</td>
                            <td>{log.station_name}</td>
                            <td>{log.status_after}</td>
                            <td>{log.action_by}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export function UnitHistoryLog({ currentStation, historyList, listLoading, listError }) {
    return (
        <div className="animate-in fade-in">
            <h4 className="mb-4"><i className="bi bi-clock-history me-2 text-primary"></i>Processing History for {currentStation}</h4>
            <UnitHistoryTable historyLogs={historyList} loading={listLoading} error={listError} />
        </div>
    );
}