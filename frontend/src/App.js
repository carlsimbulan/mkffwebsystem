import React, { useState } from "react";
import Login from "./Login";
import AdminPage from "./admin/AdminPage";
import StationDashboard from "./Operators/StationDashboard"; // Assuming path is correct
import ITAssistantPage from "./qrgenpage/ITAssistantPage";

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
  
    return <StationDashboard user={user} onLogout={handleLogout} />;
  }

  return <div className="p-5 text-center"><h1>Unknown Role: {user.role}</h1><button className="btn btn-danger" onClick={handleLogout}>Logout</button></div>;
}

export default App;