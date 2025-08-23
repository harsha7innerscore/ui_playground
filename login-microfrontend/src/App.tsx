import { LoginPage } from './pages';
import { useAuth } from './hooks';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';

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
      <Box textAlign="center" py={10} px={6}>
        <VStack gap={6}>
          <Heading size="xl" color="green.500">
            Welcome, {user.userName}!
          </Heading>
          <Text color="gray.600">
            You are successfully logged in to the microfrontend.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Email: {user.email}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Role: {user.roleName}
          </Text>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </VStack>
      </Box>
    );
  }

  // Show login page
  return (
    <LoginPage
      companyName="Login Microfrontend"
      subtitle="Welcome to the authentication module"
      onLoginSuccess={handleLoginSuccess}
      onLoginError={handleLoginError}
    />
  );
}

export default App;
