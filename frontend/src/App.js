import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Login"; 
import AdminPage from "./admin/AdminPage";
import StationDashboard from "./Operators/StationDashboard";
import ITAssistantPage from "./qrgenpage/ITAssistantPage";

// --- HELPER FUNCTION: Get Home Path based on Role ---
const getHomePathByRole = (role) => {
    switch (role) {
        case 'Administrator':
            return '/admin/dashboard';
        case 'IT Assistant':
            return '/itassistant/overview';
        case 'Operator':
            return '/operator/dashboard'; // <--- BINAGO: Default sa dashboard sub-route
        default:
            return '/login';
    }
};

// --- PRIVATE ROUTE COMPONENT ---
const PrivateRoute = ({ element: Element, requiredRole, user, onLogout }) => {
    const isLoggedIn = !!user;

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        const homePath = getHomePathByRole(user.role);
        return <Navigate to={homePath} replace />;
    }

    return <Element user={user} onLogout={onLogout} />;
};

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
                {/* 1. Login Path */}
                <Route path="/login" element={<Login onLogin={handleLogin} />} />

                {/* 2. Root Redirect */}
                <Route 
                    path="/" 
                    element={user ? <Navigate to={getHomePathByRole(user.role)} replace /> : <Navigate to="/login" replace />} 
                />

                {/* 3. Admin Page */}
                <Route 
                    path="/admin/*" 
                    element={<PrivateRoute 
                        element={AdminPage} 
                        requiredRole="Administrator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* 4. IT Assistant Page */}
                <Route 
                    path="/itassistant/*" 
                    element={<PrivateRoute 
                        element={ITAssistantPage} 
                        requiredRole="IT Assistant" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />

                {/* 5. Operator Page - NILAGYAN NG /* PARA SA SUB-ROUTES */}
                <Route 
                    path="/operator/*" 
                    element={<PrivateRoute 
                        element={StationDashboard} 
                        requiredRole="Operator" 
                        user={user} 
                        onLogout={handleLogout} 
                    />} 
                />
                
                {/* 6. Catch-all Redirect */}
                <Route 
                    path="*" 
                    element={user ? <Navigate to={getHomePathByRole(user.role)} replace /> : <Navigate to="/login" replace />} 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;