import { LoginPage } from './pages';
import { useAuth } from './hooks';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  const handleLogout = () => {
    logout();
  };

  // If authenticated, show a simple dashboard
  if (isAuthenticated && user) {
    return (
      <div className="text-center py-10 px-6">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-3xl font-bold text-green-500">
            Welcome, {user.userName}!
          </h1>
          <p className="text-gray-600">
            You are successfully logged in to the microfrontend.
          </p>
          <p className="text-sm text-gray-500">
            Email: {user.email}
          </p>
          <p className="text-sm text-gray-500">
            Role: {user.roleName}
          </p>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show login page
  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onLoginError={handleLoginError}
    />
  );
}

export default App;
