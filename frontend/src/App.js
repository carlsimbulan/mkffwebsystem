import React, { useState } from "react";
import Login from "./Login";
import AdminPage from "./admin/AdminPage";
// CHANGED: Import the generic dashboard instead of specific Station1
import StationDashboard from "./components/StationDashboard"; 
import ITAssistantPage from "./pages/ITAssistantPage";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  // 1. NO USER -> LOGIN
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // 2. ADMIN -> ADMIN PAGE
  if (user.role === 'Administrator') {
    return <AdminPage user={user} onLogout={handleLogout} />;
  }

  // 3. IT ASSISTANT -> IT ASSISTANT PAGE
  if (user.role === 'IT Assistant') {
    return <ITAssistantPage user={user} onLogout={handleLogout} />;
  }

  // 4. OPERATOR LOGIC
  if (user.role === 'Operator') {
    
    // CHANGED: We no longer check specifically for 'Station1'.
    // We just check if a station is assigned at all.
    // The StationDashboard component handles the logic for Station1, 2, 15, etc.
    if (user.station) {
      return <StationDashboard user={user} onLogout={handleLogout} />;
    }
    
    // If Operator but no station assigned in database
    return (
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-light">
            <div className="card shadow p-5 text-center border-danger">
                <i className="bi bi-exclamation-triangle-fill text-danger display-1 mb-3"></i>
                <h1 className="h3">No Station Assigned</h1>
                <p className="text-muted">
                    The account <strong>{user.username}</strong> is an Operator but is not linked to a specific station.
                </p>
                <p className="mb-4">Please contact an Administrator to assign a station.</p>
                <button className="btn btn-primary" onClick={handleLogout}>
                    Back to Login
                </button>
            </div>
        </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="d-flex min-vh-100 justify-content-center align-items-center">
        <div className="text-center">
            <h1>Unknown Role: {user.role}</h1>
            <button className="btn btn-danger mt-3" onClick={handleLogout}>Logout</button>
        </div>
    </div>
  );
}

export default App;