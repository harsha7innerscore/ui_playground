import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

// Define user type
interface User {
  userId?: number;
  userName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    // This will be updated to use LoginMicrofrontend when it's loaded
    const checkAuth = () => {
      if (window.LoginMicrofrontend?.isAuthenticated()) {
        const currentUser = window.LoginMicrofrontend.getCurrentUser();
        setUser(currentUser);
      }
    };

    // Check if LoginMicrofrontend is already loaded
    if (window.LoginMicrofrontend) {
      checkAuth();
    } else {
      // Wait for microfrontend to be loaded
      const checkInterval = setInterval(() => {
        if (window.LoginMicrofrontend) {
          checkAuth();
          clearInterval(checkInterval);
        }
      }, 100);

      // Clean up interval
      return () => clearInterval(checkInterval);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
        <Route 
          path="/dashboard" 
          element={<DashboardPage user={user} setUser={setUser} />} 
        />
      </Routes>
    </Router>
  );
}

// Global types are defined in types.d.ts

export default App;