import React, { useState } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from './logo.png'; 
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";

const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;
    let iconClass, bgColor, statusTitle;

    if (status === 'loading') {
        iconClass = "spinner-border text-light";
        bgColor = "rgba(15, 23, 42, 0.92)"; 
        statusTitle = "ENCRYPTING CONNECTION";
    } else if (status === 'success') {
        iconClass = "bi bi-shield-check text-success display-1";
        bgColor = "rgba(6, 78, 59, 0.95)"; 
        statusTitle = "ACCESS GRANTED";
    } else {
        iconClass = "bi bi-shield-slash text-danger display-1";
        bgColor = "rgba(127, 29, 29, 0.95)";
        statusTitle = "ACCESS DENIED";
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: bgColor, zIndex: 9999, display: 'flex',
            justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)',
            transition: 'all 0.4s ease'
        }}>
            <div className="text-center text-white p-5">
                <div className="mb-4">
                    {status === 'loading' ? (
                        <div className={iconClass} style={{ width: '3.5rem', height: '3.5rem' }}></div>
                    ) : (
                        <i className={iconClass}></i>
                    )}
                </div>
                <h2 className="fw-bold mb-2 tracking-tight">{statusTitle}</h2>
                <p className="opacity-75 small">{message}</p>
            </div>
        </div>
    );
};

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isHuman, setIsHuman] = useState(false);
    const [loginStatus, setLoginStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isHuman) return;
        setLoginStatus('loading');
        setStatusMessage("Authenticating with secure server...");

        try {
            const res = await axios.post(`${API_BASE_URL}/login.php`, { username, password });
            if (res.data.status === "ok") {
                setLoginStatus('success');
                setStatusMessage(`Identity verified. Redirecting to ${res.data.user.role} workspace...`);
                setTimeout(() => {
                    onLogin(res.data.user);
                    if (res.data.user.role === 'Administrator') navigate('/admin');
                    else if (res.data.user.role === 'IT Assistant') navigate('/itassistant');
                    else navigate('/operator');
                }, 1800); 
            } else {
                setLoginStatus('error');
                setStatusMessage(res.data.error || "Invalid credentials provided.");
                setTimeout(() => setLoginStatus('idle'), 2500);
            }
        } catch (err) {
            setLoginStatus('error');
            setStatusMessage("Security handshake failed. Check connection.");
            setTimeout(() => setLoginStatus('idle'), 2500);
        }
    };

    return (
        <div className="container-fluid p-0 vh-100 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <LoadingOverlay status={loginStatus} message={statusMessage} />

            <style>
                {`
                @keyframes scrollLeft { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .form-control { border: 1px solid #e2e8f0; padding: 12px; font-size: 0.9rem; border-radius: 8px; }
                .form-control:focus { border-color: #107c55; box-shadow: 0 0 0 3px rgba(16, 124, 85, 0.1); }
                .human-box { 
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 12px; 
                    background: #f8fafc; 
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .human-box:hover { border-color: #cbd5e1; }
                .human-box.checked { border-color: #107c55; background: #f0fdf4; }
                .btn-submit { background: #107c55; border: none; padding: 13px; font-weight: 700; border-radius: 8px; letter-spacing: 0.5px; }
                .btn-submit:hover { background: #0d6646; }
                .left-panel { background: #0f172a; color: white; position: relative; }
                .scroller-container {
                    width: 320px;
                    overflow: hidden;
                    margin-top: 15px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 12px;
                }
                .lock-icon-header {
                    font-size: 2.5rem;
                    color: #107c55;
                    margin-bottom: 10px;
                }
                `}
            </style>

            <div className="row g-0 vh-100">
                {/* LEFT PANEL */}
                <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center left-panel p-5 text-center">
                    {/* Clean Logo: No borders/circles as requested */}
                    <img src={logo} alt="Logo" className="mb-4" style={{ height: "130px", width: "auto" }} />
                    
                    <h1 className="fw-bold mb-1 h2 tracking-tight">Edge Sensor Assembly MKFF</h1>
                    <p className="text-secondary small opacity-75">Precision Management & Monitoring</p>
                    
                    {/* Scrolling text positioned under MKFF Text */}
                    <div className="scroller-container">
                        <div style={{ animation: "scrollLeft 20s linear infinite", whiteSpace: "nowrap", fontSize: "0.65rem", color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                            • SYSTEM SECURED • AUTHORIZED ACCESS ONLY • ALL IP ADDRESSES LOGGED • ENCRYPTED SESSION • 
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white">
                    <div style={{ width: "100%", maxWidth: "380px", padding: "30px" }}>
                        
                        <div className="text-center mb-4">
                            <div className="lock-icon-header">
                                <i className="bi bi-shield-lock-fill"></i>
                            </div>
                            <h3 className="fw-bold text-dark mb-1">Secure Portal Access</h3>
                            <p className="text-muted small">Authentication required to proceed</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-1">USER IDENTITY</label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="Username" value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required disabled={loginStatus !== 'idle'}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-1">PASSWORD</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-end-0"
                                        placeholder="••••••••" value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required disabled={loginStatus !== 'idle'}
                                    />
                                    <button 
                                        type="button"
                                        className="btn btn-outline-secondary border-start-0"
                                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className={`human-box mb-4 ${isHuman ? 'checked' : ''}`} onClick={() => setIsHuman(!isHuman)}>
                                <div className="d-flex align-items-center">
                                    <div className={`border rounded me-3 d-flex align-items-center justify-content-center ${isHuman ? 'bg-success border-success text-white' : 'bg-white'}`} 
                                         style={{ width: '22px', height: '22px', transition: '0.2s' }}>
                                        {isHuman && <i className="bi bi-check-lg" style={{ fontSize: '14px' }}></i>}
                                    </div>
                                    <span className="small fw-medium text-dark">Verify Human Identity</span>
                                    <i className="bi bi-robot ms-auto text-muted opacity-25"></i>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-success w-100 btn-submit shadow-sm"
                                disabled={loginStatus !== 'idle' || !isHuman}
                            >
                                {loginStatus === 'loading' ? "SECURE LOGGING IN..." : "AUTHORIZE ACCESS"}
                            </button>
                        </form>
                        
                        <div className="mt-5 text-center">
                            <p className="text-muted" style={{ fontSize: '0.7rem', opacity: '0.6' }}>
                                © 2025 MkFF Laserteknique International Inc. <br/>
                                <span className="text-uppercase tracking-widest">Security Protocol v1.0.4</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}