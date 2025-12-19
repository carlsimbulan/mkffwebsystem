import React, { useState, useEffect } from "react";
// Import ang mga kailangan mula sa React Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Login"; // Dapat naka-wrap sa withRouter ang Login component
import AdminPage from "./admin/AdminPage";
import StationDashboard from "./Operators/StationDashboard";
import ITAssistantPage from "./qrgenpage/ITAssistantPage";

// --- HELPER FUNCTION: Get Home Path based on Role ---
const getHomePathByRole = (role) => {
    switch (role) {
        case 'Administrator':
            return '/admin';
        case 'IT Assistant':
            return '/itassistant';
        case 'Operator':
            return '/operator';
        default:
            return '/'; // Fallback to login
    }
};

// --- PRIVATE ROUTE COMPONENT ---
// Ito ang magche-check kung may session at tamang role bago mag-render ng page.
const PrivateRoute = ({ element: Element, requiredRole, user, onLogout }) => {
    // Check 1: May user data ba sa state (galing sa App.js)?
    const isLoggedIn = !!user;

    if (!isLoggedIn) {
        // Kapag walang user sa state (kahit sa refresh), ibalik sa Login page
        return <Navigate to="/" replace />;
    }
    
    // Check 2: Kung may user, tama ba ang role?
    if (requiredRole && user.role !== requiredRole) {
        // Kung hindi tumugma ang role sa requiredRole, i-redirect sa HOME DASHBOARD ng user
        const homePath = getHomePathByRole(user.role);
        return <Navigate to={homePath} replace />;
    }

    // I-render ang Component kasama ang props
    return <Element user={user} onLogout={onLogout} />;
};
// ------------------------------

// ... (keep helper functions and PrivateRoute as they are)

function App() {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('mkff_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('mkff_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mkff_user');
        }
    }, [user]);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Updated Login Path to /login */}
                <Route path="/login" element={<Login onLogin={handleLogin} />} />

                {/* 2. Root Redirect: If someone goes to /, send them to /login or their dashboard */}
                <Route 
                    path="/" 
                    element={user ? <Navigate to={getHomePathByRole(user.role)} replace /> : <Navigate to="/login" replace />} 
                />

                {/* Admin Page */}
                <Route 
                    path="/admin" 
                    element={<PrivateRoute 
                        element={AdminPage} 
                        requiredRole="Administrator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* IT Assistant Page */}
                <Route 
                    path="/itassistant" 
                    element={<PrivateRoute 
                        element={ITAssistantPage} 
                        requiredRole="IT Assistant" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* Operator Page */}
                <Route 
                    path="/operator" 
                    element={<PrivateRoute 
                        element={StationDashboard} 
                        requiredRole="Operator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />
                
                {/* 3. Updated Catch-all: Redirect unknown URLs to /login if not logged in */}
                <Route 
                    path="*" 
                    element={user ? <Navigate to={getHomePathByRole(user.role)} replace /> : <Navigate to="/login" replace />} 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;