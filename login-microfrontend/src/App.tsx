import { LoginPage } from './pages';
import { useAuth } from './hooks';

function App() {
  // Not using authentication state for conditional rendering
  const { } = useAuth();

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  // Don't show a dashboard after login - this will be handled by the parent application

  // Show login page
  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onLoginError={handleLoginError}
    />
  );
}

export default App;
