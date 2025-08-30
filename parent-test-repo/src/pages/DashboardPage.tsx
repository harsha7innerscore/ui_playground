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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not logged in
  useEffect(() => {
    console.log('DashboardPage useEffect - user:', user);
    
    // Check if we have user in state or in localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    if (!user && !storedUser) {
      console.log('No user found in state or localStorage, redirecting to home page');
      navigate('/', { replace: true });
    } else if (!user && storedUser) {
      // We have user in localStorage but not in state
      // This can happen on page refresh - let App.tsx handle updating the state
      console.log('User found in localStorage but not in state, waiting for state update');
    } else {
      console.log('User is authenticated, staying on dashboard');
    }
  }, [user, navigate]);

  // Handle logout
  const handleLogout = () => {
    console.log('Logout button clicked');
    
    // Use our centralized logout function
    logout();
    
    // Navigate to home page
    console.log('Navigating to home page');
    navigate('/', { replace: true });
    
    // Final check
    setTimeout(() => {
      console.log('Final localStorage check:', localStorage.getItem('currentUser'));
      console.log('Logout complete');
    }, 100);
    
    // Also call the prop setUser for compatibility
    propSetUser(null);
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