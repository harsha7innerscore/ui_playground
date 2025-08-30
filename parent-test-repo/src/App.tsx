import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import useAuth from './hooks/useAuth';
import './App.css';

function App() {
  // Use our custom auth hook for consistent authentication state management
  const { user, setUser } = useAuth();

  // Check if user is authenticated on app load
  useEffect(() => {
    // This will be updated to use LoginMicrofrontend when it's loaded
    const checkAuth = () => {
      console.log('Checking authentication status');
      if (window.LoginMicrofrontend?.isAuthenticated()) {
        console.log('User is authenticated via microfrontend');
        const currentUser = window.LoginMicrofrontend.getCurrentUser();
        console.log('Current user from microfrontend:', currentUser);
        
        // Only update user state if it's different from what we already have
        if (currentUser && (!user || currentUser.userId !== user.userId)) {
          console.log('Updating user state from microfrontend');
          setUser(currentUser);
        }
      } else if (user) {
        console.log('User exists in state but not authenticated in microfrontend');
        // If we have a user in state but microfrontend says not authenticated,
        // keep the user state as is (from localStorage) since we trust that more
      } else {
        console.log('User is not authenticated');
      }
    };

    // Always check localStorage first (already done in useState initializer)
    // Then check microfrontend when available
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
  }, [user]);

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