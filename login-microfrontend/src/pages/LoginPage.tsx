import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Flex,
  Image,
} from '@chakra-ui/react';
import { LoginForm } from '../components';
import { useAuth } from '../hooks';

export interface LoginPageProps {
  logo?: string;
  companyName?: string;
  subtitle?: string;
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  logo,
  companyName = 'Your Company',
  subtitle = 'Sign in to your account',
  onLoginSuccess,
  onLoginError,
}) => {
  const { isAuthenticated } = useAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // If already authenticated, show success message or redirect
  if (isAuthenticated) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg={bgColor}
      >
        <Container maxW="md">
          <Box
            bg={cardBg}
            p={8}
            rounded="lg"
            shadow="md"
            border="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack gap={4}>
              <Heading size="lg" color="green.500">
                Welcome Back!
              </Heading>
              <Text color="gray.600">
                You are already signed in.
              </Text>
            </VStack>
          </Box>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={bgColor}
      py={12}
      px={4}
    >
      <Container maxW="md">
        <Box
          bg={cardBg}
          p={8}
          rounded="lg"
          shadow="md"
          border="1px"
          borderColor={borderColor}
        >
          <VStack gap={6}>
            {/* Logo and Branding */}
            <VStack gap={3} textAlign="center">
              {logo && (
                <Image
                  src={logo}
                  alt={`${companyName} logo`}
                  h={12}
                  objectFit="contain"
                />
              )}
              <Heading size="lg" fontWeight="bold">
                {companyName}
              </Heading>
              <Text color="gray.600" fontSize="md">
                {subtitle}
              </Text>
            </VStack>

            {/* Login Form */}
            <Box width="100%">
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onLoginError={onLoginError}
                showForgotPassword={true}
              />
            </Box>

            {/* Footer */}
            <VStack gap={2} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
};