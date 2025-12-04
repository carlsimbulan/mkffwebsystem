import React from 'react';

export function StationHomeDashboard({ currentStation, homeStats, setActiveTab }) {
    return (
        <div className="d-flex flex-column h-100 animate-in fade-in pb-3">

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>{currentStation}</h3>
                    <p className="text-muted small mb-0">Operator Control Panel</p>
                </div>
                <div className="bg-white border px-3 py-2 rounded shadow-sm d-flex align-items-center">
                    <span className="position-relative d-flex h-2 w-2 me-2">
                        <span className="animate-ping position-absolute d-inline-flex h-100 w-100 rounded-circle bg-success opacity-75"></span>
                        <span className="position-relative d-inline-flex rounded-circle h-2 w-2 bg-success" style={{ width: '8px', height: '8px' }}></span>
                    </span>
                    <span className="fw-bold text-dark small" style={{ fontSize: '0.8rem' }}>Station Active</span>
                </div>
            </div>

            {/* --- Stats Cards (Modern Enterprise Style) --- */}
            <div className="row g-4 mb-4">
                {/* Completed Card */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-success" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-box-seam-fill fs-4"></i>
                                </div>
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small fw-normal">
                                    Output
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0 display-6">{homeStats.completed}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Completed Units</span>
                        </div>
                    </div>
                </div>

                {/* In Progress Card */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-hourglass-split fs-4"></i>
                                </div>
                                <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small fw-normal">
                                    Active
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-0 display-6">{homeStats.inProgress}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>In Progress</span>
                        </div>
                    </div>
                </div>

                {/* NG Card */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-danger" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-danger bg-opacity-10 text-danger rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <i className="bi bi-exclamation-octagon-fill fs-4"></i>
                                </div>
                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small fw-normal">
                                    Defects
                                </span>
                            </div>
                            <h2 className="fw-bold text-danger mb-0 display-6">{homeStats.ng}</h2>
                            <span className="text-muted text-uppercase small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Total NG</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Start Scanning Hero Section --- */}
            <div className="card border-0 shadow-sm flex-grow-1 position-relative overflow-hidden"
                style={{ borderRadius: '16px', background: '#fff', border: '1px solid #f1f5f9' }}>

                {/* Subtle Background Element */}
                <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-05" style={{ width: '300px', height: '300px', filter: 'blur(60px)' }}></div>

                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5 z-1">
                    <div className="mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle shadow-sm" style={{ width: '80px', height: '80px' }}>
                            <i className="bi bi-qr-code-scan fs-1"></i>
                        </div>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Ready to Process?</h3>
                    <p className="text-muted mb-4" style={{ maxWidth: '350px' }}>Scan the unit QR code to verify details and begin logging production data.</p>

                    <button
                        className="btn btn-primary px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2 hover-scale"
                        onClick={() => setActiveTab('input_unit')}
                        style={{ transition: 'all 0.3s ease' }}
                    >
                        <span className="fs-6 fw-bold ls-1 text-uppercase">Start Scanning</span>
                        <i className="bi bi-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                .hover-scale:hover { transform: scale(1.03); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.2) !important; }
                .ls-1 { letter-spacing: 1px; }
                .opacity-05 { opacity: 0.05; }
                .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                .animate-in { animation: fadeInUp 0.5s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}