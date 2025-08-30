import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface User {
  userId?: number;
  userName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

interface DashboardPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

function DashboardPage({ setUser: propSetUser }: DashboardPageProps) {
  // Use our custom hook for consistent auth state
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not logged in
  useEffect(() => {
    console.log('DashboardPage useEffect - user:', user);
    
    // Check if we have user in state or in localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    // Clear any login navigation flag when we're on the dashboard
    if ((window as any).__loginSuccessNavigation) {
      console.log('Clearing login navigation flag now that we are on dashboard');
      (window as any).__loginSuccessNavigation = false;
    }
    
    // If the URL contains a hash fragment (#) from a direct navigation, remove it
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    if (!user && !storedUser) {
      console.log('No user found in state or localStorage, redirecting to home page');
      navigate('/', { replace: true });
    } else if (!user && storedUser) {
      // We have user in localStorage but not in state
      // This can happen on page refresh - let's update the state directly here
      try {
        console.log('User found in localStorage but not in state, updating state directly');
        const parsedUser = JSON.parse(storedUser);
        // Update the useAuth hook's state
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user', error);
        navigate('/', { replace: true });
      }
    } else {
      console.log('User is authenticated, staying on dashboard');
    }
  }, [user, navigate, setUser]);

  // Handle logout
  const handleLogout = () => {
    console.log('Logout button clicked');
    
    // Use our centralized logout function
    logout();
    
    // Log the localStorage state immediately after logout
    console.log('After logout, localStorage contains:', localStorage.getItem('currentUser'));
    
    // Also call the prop setUser for compatibility
    propSetUser(null);
    
    // Navigate to home page - do this last to ensure all logout processing is complete
    console.log('Navigating to home page');
    navigate('/', { replace: true });
    
    console.log('Logout complete');
  };

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <header>
        <h1>Parent Test App</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Dashboard</h2>
          </div>
          
          <div className="user-info">
            <h3>User Information</h3>
            <p><strong>Name:</strong> {user.userName || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Role:</strong> {user.roleName || 'N/A'}</p>
          </div>
          
          <div className="card">
            <h3>Welcome to your Dashboard</h3>
            <p>This is a protected page that only authenticated users can access.</p>
            <p>You have successfully integrated the login microfrontend!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;