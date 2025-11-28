// App.js

import React, { useState } from "react";
import Login from "./Login";
import AdminPage from "./admin/AdminPage";
import Station1 from "./components/Station1"; // Assuming path is correct
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
    // Check kung saang station siya naka-assign
    if (user.station === 'Station1') {
      
      // FIX: Diretso na sa Station1 component.
      // Ang Station1 na ang may responsibilidad sa buong UI (Sidebar, Header, at Content).
      return <Station1 user={user} onLogout={handleLogout} />;

    }
    
    // Kung Operator pero walang valid station
    return (
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
            <h1>No Station Assigned</h1>
            <p>Please contact admin to assign a station for {user.username}.</p>
            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
    );
  }

  return <div className="p-5 text-center"><h1>Unknown Role: {user.role}</h1><button className="btn btn-danger" onClick={handleLogout}>Logout</button></div>;
}

export default App;