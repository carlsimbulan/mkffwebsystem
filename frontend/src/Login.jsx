import React, { useState } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from './logo.png'; 
import { useNavigate } from 'react-router-dom'; // <-- IMPORT THE HOOK

// Base URL for the API
const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
// Note: Sa iyong handleLogin function, directly ginagamit ang URL, kaya okay lang ito.

// --- 1. Loading and Notification Overlay (Retained) ---
const LoadingOverlay = ({ status, message }) => {
    if (status === 'idle') return null;

    let iconClass, spinnerVisible = false, bgColor;

    if (status === 'loading') {
        iconClass = "bi bi-arrow-clockwise";
        spinnerVisible = true;
        bgColor = "rgba(0, 0, 0, 0.7)"; // Dark semi-transparent background
    } else if (status === 'success') {
        iconClass = "bi bi-check-circle-fill text-success";
        bgColor = "rgba(16, 124, 85, 0.9)"; // Green semi-transparent background
    } else if (status === 'error') {
        iconClass = "bi bi-x-octagon-fill text-danger";
        bgColor = "rgba(220, 53, 69, 0.9)"; // Red semi-transparent background
    }

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: bgColor,
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                color: 'white',
                textAlign: 'center',
                transition: 'opacity 0.3s'
            }}
        >
            <div className="card shadow-lg p-5" style={{ maxWidth: '400px', backgroundColor: 'white', borderRadius: '10px' }}>
                {/* Icon/Spinner Area */}
                <div className={`mb-3 ${status === 'loading' ? 'text-primary' : ''}`}>
                    {spinnerVisible ? (
                        <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <i className={`${iconClass} display-4`} style={{ color: status === 'success' ? '#107c55' : '#dc3545' }}></i>
                    )}
                </div>
                
                {/* Message Area */}
                <h4 className={`fw-bold ${status === 'loading' ? 'text-primary' : status === 'success' ? 'text-success' : 'text-danger'}`}>
                    {status === 'loading' ? "AUTHENTICATING..." : 
                    status === 'success' ? "LOGIN SUCCESSFUL" : 
                    "LOGIN FAILED"}
                </h4>
                <p className="text-dark mb-0 small">{message}</p>
            </div>
        </div>
    );
};
// --- END LoadingOverlay COMPONENT ---


export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Operator");
    
    // NEW STATE: Gamitin ang `loginStatus` para i-control ang overlay
    const [loginStatus, setLoginStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [statusMessage, setStatusMessage] = useState("");
    
    // I-initialize ang useNavigate hook para sa redirection
    const navigate = useNavigate(); // <-- USE THE HOOK HERE

    // Custom styles para sa layout (No change)
    const styles = {
        leftPanel: {
            backgroundColor: "#111827",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            padding: "3rem"
        },
        rightPanel: {
            backgroundColor: "#ffffff",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem"
        },
        formContainer: {
            width: "100%",
            maxWidth: "400px",
        },
        marqueeContainer: {
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
            maxWidth: "450px",
            marginTop: "1rem"
        },
        marqueeText: {
            display: "inline-block",
            animation: "scrollLeft 15s linear infinite",
            fontSize: "1.1rem",
            color: "#d1d5db"
        }
    };

    const handleRedirect = (userData) => {
        // 1. Update the overall App state
        onLogin(userData); 
        
        // 2. Perform URL navigation based on role
        if (userData.role === 'Administrator') {
            navigate('/admin');
        } else if (userData.role === 'IT Assistant') {
            navigate('/itassistant');
        } else if (userData.role === 'Operator') {
            navigate('/operator');
        } else {
            // Should not happen if API is correct, but logs out just in case
            onLogin(null);
            console.error("Unknown role received:", userData.role);
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        if (loginStatus === 'loading') return;
        
        // 1. Simulan ang loading state
        setLoginStatus('loading');
        setStatusMessage("Checking credentials against the database...");

        try {
            const res = await axios.post(
                "http://localhost/mkffwebsystem/backend/api/login.php",
                { username, password, role },
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Server response:", res.data);

            if (res.data.status === "ok" && res.data.user) {
                // 2. Success state
                setLoginStatus('success');
                setStatusMessage(`Welcome ${res.data.user.username}! Redirecting to ${res.data.user.role} dashboard...`);
                
                // CRITICAL FIX: Maghintay ng 1.5 seconds, then i-trigger ang navigation
                setTimeout(() => {
                    handleRedirect(res.data.user); // <-- Call navigation helper
                }, 1500); 
                
            } else {
                // 3. Error state (API returned fail status)
                setStatusMessage(res.data.error || "Authentication failed. Please check username, password, and role.");
                setLoginStatus('error');
                
                // Ibalik sa idle state ang overlay pagkatapos ng 3 seconds
                setTimeout(() => {
                    setLoginStatus('idle');
                }, 3000);
            }
        } catch (err) {
            // 4. Network/Server Error state
            console.error(err);
            setStatusMessage(err.response?.data?.error || "Cannot connect to the backend server. Check network connection.");
            setLoginStatus('error');
            
            // Ibalik sa idle state ang overlay pagkatapos ng 3 seconds
            setTimeout(() => {
                    setLoginStatus('idle');
            }, 3000);
        }
    };

    const isFormDisabled = loginStatus === 'loading' || loginStatus === 'success';

    return (
        <div className="container-fluid p-0 overflow-hidden">
            
            {/* 4. RENDER THE LOADING/NOTIFICATION OVERLAY FIRST */}
            <LoadingOverlay status={loginStatus} message={statusMessage} />

            {/* CSS Animation Injection */}
            <style>
                {`
                @keyframes scrollLeft {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                `}
            </style>

            <div className="row g-0">
                {/* LEFT PANEL */}
                <div className="col-lg-6" style={styles.leftPanel}>
                    <img 
                        src={logo} 
                        alt="Logo" 
                        className="img-fluid mb-4" 
                        style={{ maxHeight: "150px" }}
                        onError={(e) => {e.target.style.display='none';}} 
                    />
                    <h2 className="fw-bold text-center mb-2">Edge Sensor Assembly MKFF</h2>
                    
                    <div style={styles.marqueeContainer}>
                        <div style={styles.marqueeText}>
                            Edge Sensor Assembly Process Portal • Authorized Personnel Only • Secure System
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="col-lg-6" style={styles.rightPanel}>
                    <div style={styles.formContainer}>
                        <div className="text-center mb-5">
                            <h3 className="fw-bold text-dark">
                                <i className="bi bi-shield-lock-fill me-2 text-success"></i>
                                Secure Login
                            </h3>
                            <p className="text-muted">Please enter your credentials</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            {/* Username Input */}
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-envelope"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Username / Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{ padding: "12px" }}
                                    disabled={isFormDisabled} // Disable input fields
                                />
                            </div>

                            {/* Password Input */}
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ padding: "12px" }}
                                    disabled={isFormDisabled} // Disable input fields
                                />
                            </div>
                            
                            {/* Role Select */}
                            <div className="input-group mb-4">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-person-badge"></i>
                                </span>
                                <select 
                                    className="form-select bg-light border-start-0"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ padding: "12px", cursor: "pointer" }}
                                    disabled={isFormDisabled} // Disable input fields
                                >
                                    <option value="Operator">Operator</option>
                                    <option value="IT Assistant">IT Assistant</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>

                            {/* Error/Success messages removed from here, now handled by Overlay */}

                            <button 
                                type="submit" 
                                className="btn btn-success w-100 py-3 fw-bold shadow-sm"
                                disabled={isFormDisabled}
                                style={{ backgroundColor: "#107c55", borderColor: "#107c55" }}
                            >
                                {/* Button text is static unless actively loading */}
                                {isFormDisabled ? "PROCESSING..." : "LOGIN TO PORTAL"}
                            </button>
                        </form>

            
                    </div>
                </div>
            </div>
        </div>
    );
}