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
      console.log('LoginMicrofrontend is not loaded, setting up listener...');
      
      // Use a more modern approach with MutationObserver to detect when the script is loaded
      // This is more efficient than polling with setInterval
      const waitForMicrofrontend = async () => {
        // Create a promise that resolves when LoginMicrofrontend becomes available
        const microfrontendPromise = new Promise<void>((resolve) => {
          // Check if it's already available (race condition handling)
          if (window.LoginMicrofrontend) {
            resolve();
            return;
          }
          
          // Set up a listener for script loads
          observerRef.current = new MutationObserver(() => {
            if (window.LoginMicrofrontend) {
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
              resolve();
            }
          });
          
          // Watch for changes to the DOM that might include our script loading
          observerRef.current.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
          
          // We'll handle cleanup in the useEffect return function
          // This is safer than using a timeout and prevents memory leaks
        });
        
        // Wait for the microfrontend to be available
        await microfrontendPromise;
        
        // If we got here and the microfrontend is available, check auth
        if (window.LoginMicrofrontend) {
          console.log('LoginMicrofrontend loaded');
          checkAuth();
        }
      };
      
      // Start the async process
      const observerRef = { current: null as MutationObserver | null };
      
      // Store the observer reference for cleanup
      waitForMicrofrontend().catch(error => {
        console.error('Error waiting for microfrontend:', error);
      });
      
      // Return cleanup function
      return () => {
        // Disconnect the observer if it exists
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
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