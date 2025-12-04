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

function App() {
    // Kukunin ang user session mula sa Local Storage pag-load pa lang ng App
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('mkff_user');
            // I-parse ang JSON kung may laman, kundi null
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return null;
        }
    });

    // I-update ang Local Storage tuwing magbabago ang user state
    useEffect(() => {
        if (user) {
            localStorage.setItem('mkff_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('mkff_user');
        }
    }, [user]);


    const handleLogin = (loggedInUser) => {
        // Sa Login, i-set ang user state
        setUser(loggedInUser);
        // Ang router na ang bahalang mag-redirect base sa role (tingnan sa baba)
    };

    const handleLogout = () => {
        // Sa Logout, i-clear ang user state (na mag-a-trigger din ng useEffect at Local Storage clear)
        setUser(null);
    };

    // Dito natin ide-define ang mga URL path
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Login Page: Accessible sa lahat, walang path (/ - root) */}
                <Route path="/" element={<Login onLogin={handleLogin} />} />

                {/* 2. Admin Page: Protected, may URL path na /admin */}
                <Route 
                    path="/admin" 
                    element={<PrivateRoute 
                        element={AdminPage} 
                        requiredRole="Administrator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* 3. IT Assistant Page: Protected, may URL path na /itassistant */}
                <Route 
                    path="/itassistant" 
                    element={<PrivateRoute 
                        element={ITAssistantPage} 
                        requiredRole="IT Assistant" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* 4. Operator Page: Protected, may URL path na /operator */}
                <Route 
                    path="/operator" 
                    element={<PrivateRoute 
                        element={StationDashboard} 
                        requiredRole="Operator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />
                
                {/* 5. Catch-all: Kung ang URL ay hindi tugma sa itaas: */}
                {/* Kung naka-login na, i-redirect sa tamang dashboard. Kung hindi, ibalik sa login. */}
                <Route 
                    path="*" 
                    element={user ? <Navigate to={getHomePathByRole(user.role)} replace /> : <Navigate to="/" replace />} 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;