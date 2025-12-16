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
        bgColor = "rgba(15, 23, 42, 0.85)"; 
        statusTitle = "SECURE AUTHENTICATION";
    } else if (status === 'success') {
        iconClass = "bi bi-shield-check text-success display-1";
        bgColor = "rgba(6, 78, 59, 0.95)"; 
        statusTitle = "ACCESS GRANTED";
    } else {
        iconClass = "bi bi-shield-lock text-danger display-1";
        bgColor = "rgba(127, 29, 29, 0.95)";
        statusTitle = "ACCESS DENIED";
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: bgColor, zIndex: 9999, display: 'flex',
            justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)',
            transition: 'all 0.5s ease'
        }}>
            <div className="text-center text-white p-5" style={{ maxWidth: '450px' }}>
                <div className="mb-4">
                    {status === 'loading' ? (
                        <div className={iconClass} style={{ width: '4rem', height: '4rem', borderWidth: '5px' }}></div>
                    ) : (
                        <i className={iconClass}></i>
                    )}
                </div>
                <h2 className="fw-black tracking-tighter mb-2">{statusTitle}</h2>
                <p className="opacity-75">{message}</p>
            </div>
        </div>
    );
};

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(true); // Default to unhide (true)
    const [isHuman, setIsHuman] = useState(false);
    const [loginStatus, setLoginStatus] = useState('idle'); 
    const [statusMessage, setStatusMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isHuman) return;
        setLoginStatus('loading');
        setStatusMessage("Connecting to MKFF secure database...");

        try {
            const res = await axios.post(`${API_BASE_URL}/login.php`, { username, password });
            if (res.data.status === "ok") {
                setLoginStatus('success');
                setStatusMessage(`Identity Confirmed. Loading ${res.data.user.role} Dashboard...`);
                setTimeout(() => {
                    onLogin(res.data.user);
                    if (res.data.user.role === 'Administrator') navigate('/admin');
                    else if (res.data.user.role === 'IT Assistant') navigate('/itassistant');
                    else navigate('/operator');
                }, 2000); 
            } else {
                setLoginStatus('error');
                setStatusMessage(res.data.error || "Invalid Credentials.");
                setTimeout(() => setLoginStatus('idle'), 3000);
            }
        } catch (err) {
            setLoginStatus('error');
            setStatusMessage("Server error. Please try again later.");
            setTimeout(() => setLoginStatus('idle'), 3000);
        }
    };

    return (
        <div className="container-fluid p-0 vh-100 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <LoadingOverlay status={loginStatus} message={statusMessage} />

            <style>
                {`
                @keyframes scrollLeft { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .input-group-text { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; }
                .form-control { border: 1px solid #e2e8f0; padding: 12px 15px; font-size: 0.95rem; }
                .form-control:focus { border-color: #107c55; box-shadow: 0 0 0 4px rgba(16, 124, 85, 0.08); }
                .human-box { 
                    border: 1px solid #e2e8f0; 
                    border-radius: 12px; 
                    padding: 15px; 
                    background: #f8fafc; 
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .human-box:hover { border-color: #107c55; background: #ffffff; }
                .human-box.checked { border-color: #107c55; background: #f0fdf4; }
                .btn-submit { 
                    background: #107c55; 
                    border: none; 
                    padding: 14px; 
                    border-radius: 10px; 
                    font-weight: 700; 
                    transition: all 0.3s ease;
                }
                .btn-submit:hover:not(:disabled) { background: #0d6646; transform: translateY(-1px); }
                .btn-submit:disabled { opacity: 0.6; }
                .left-panel { background: #0f172a; color: white; position: relative; overflow: hidden; }
                .left-panel::before {
                    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at center, rgba(16, 124, 85, 0.2), transparent);
                }
                .password-toggle {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-left: none;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .password-toggle:hover { color: #107c55; }
                `}
            </style>

            <div className="row g-0 vh-100">
                {/* LEFT PANEL */}
                <div className="col-lg-6 d-flex flex-column left-panel">
                    <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ zIndex: 1 }}>
                        <img src={logo} alt="Logo" className="mb-4 shadow-lg rounded-circle" style={{ height: "180px", width: "180px", objectFit: "contain", background: "rgba(255,255,255,0.05)", padding: "10px" }} />
                        <h1 className="fw-bold mb-2 display-6">Edge Sensor Assembly MKFF</h1>
                        <p className="text-secondary mb-4 fs-5" style={{ maxWidth: "80%" }}>Centralized Management & Monitoring Portal</p>
                        <div className="d-flex gap-2 justify-content-center opacity-75 small">
                            <span className="badge border border-secondary text-secondary fw-normal px-3 py-2">VERSION 1.0</span>
                            <span className="badge border border-success text-success fw-normal px-3 py-2">SECURE ENCRYPTION</span>
                        </div>
                    </div>
                    <div className="mt-auto w-100 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", zIndex: 1, background: "rgba(0,0,0,0.2)" }}>
                        <div className="overflow-hidden">
                            <div style={{ animation: "scrollLeft 25s linear infinite", whiteSpace: "nowrap", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
                                • AUTHORIZED PERSONNEL ONLY • ALL ACTIVITIES ARE LOGGED • MKFF PRECISION ASSEMBLY UNIT • 
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="col-lg-6 d-flex align-items-center justify-content-center">
                    <div style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
                        <div className="mb-5 text-center text-lg-start">
                            <h3 className="fw-bold text-dark mb-1">System Login</h3>
                            <p className="text-muted small">Enter credentials to proceed to your dashboard.</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">Username</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0"><i className="bi bi-person-fill"></i></span>
                                    <input
                                        type="text" className="form-control border-start-0"
                                        placeholder="Enter username" value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required disabled={loginStatus !== 'idle'}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text border-end-0"><i className="bi bi-lock-fill"></i></span>
                                    <input
                                        type={showPassword ? "text" : "password"} // Dynamic type
                                        className="form-control border-start-0 border-end-0"
                                        placeholder="••••••••" value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required disabled={loginStatus !== 'idle'}
                                    />
                                    {/* HIDE/UNHIDE BUTTON */}
                                    <button 
                                        type="button"
                                        className="input-group-text password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className={`human-box mb-4 ${isHuman ? 'checked' : ''}`} onClick={() => setIsHuman(!isHuman)}>
                                <div className="d-flex align-items-center">
                                    <div className={`border rounded me-3 d-flex align-items-center justify-content-center ${isHuman ? 'bg-success border-success text-white' : 'bg-white'}`} 
                                         style={{ width: '22px', height: '22px', transition: 'all 0.2s' }}>
                                        {isHuman && <i className="bi bi-check-bold" style={{ fontSize: '14px' }}></i>}
                                    </div>
                                    <span className="small fw-semibold text-dark">I verify that I am human</span>
                                    <i className="bi bi-shield-shaded ms-auto text-muted opacity-25 fs-5"></i>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-success w-100 btn-submit shadow-sm text-uppercase"
                                disabled={loginStatus !== 'idle' || !isHuman}
                            >
                                {loginStatus === 'loading' ? "Authenticating..." : "Login to Portal"}
                            </button>
                        </form>
                        
                        <div className="mt-5 text-center">
                            <p className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                ©2025 MkFF Laserteknique International Inc. All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}