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
      console.log('Checking authentication status');
      if (window.LoginMicrofrontend?.isAuthenticated()) {
        console.log('User is authenticated');
        const currentUser = window.LoginMicrofrontend.getCurrentUser();
        console.log('Current user:', currentUser);
        setUser(currentUser);
      } else {
        console.log('User is not authenticated');
      }
    };

    // Check if LoginMicrofrontend is already loaded
    if (window.LoginMicrofrontend) {
      console.log('LoginMicrofrontend is already loaded');
      checkAuth();
    } else {
      console.log('LoginMicrofrontend is not loaded, waiting...');
      // Wait for microfrontend to be loaded
      const checkInterval = setInterval(() => {
        if (window.LoginMicrofrontend) {
          console.log('LoginMicrofrontend loaded');
          checkAuth();
          clearInterval(checkInterval);
        }
      }, 100);

      // Clean up interval
      return () => clearInterval(checkInterval);
    }
  }, []);

  console.log('App rendering with user:', user);

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