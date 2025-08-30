import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

function DashboardPage({ user, setUser }: DashboardPageProps) {
  const navigate = useNavigate();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle logout
  const handleLogout = () => {
    if (window.LoginMicrofrontend) {
      window.LoginMicrofrontend.logout();
      setUser(null);
      navigate('/');
    }
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