import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
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
  
  const bgColor = 'gray.50';
  const cardBg = 'white';
  const borderColor = 'gray.200';

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
      bg="gray.100"
      py={8}
      px={4}
    >
      <Container maxW="sm">
        <Box
          bg={cardBg}
          p={10}
          rounded="2xl"
          shadow="xl"
          border="1px"
          borderColor="gray.200"
          backdropFilter="blur(10px)"
        >
          <VStack gap={8} align="stretch">
            {/* Logo and Branding */}
            <VStack gap={4} textAlign="center">
              {logo && (
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="xl"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Image
                    src={logo}
                    alt={`${companyName} logo`}
                    h={10}
                    w={10}
                    objectFit="contain"
                  />
                </Box>
              )}
              <VStack gap={2}>
                <Heading 
                  size="xl" 
                  fontWeight="bold"
                  color="gray.900"
                  letterSpacing="tight"
                >
                  {companyName}
                </Heading>
                <Text 
                  color="gray.600" 
                  fontSize="md"
                  fontWeight="medium"
                >
                  {subtitle}
                </Text>
              </VStack>
            </VStack>

            {/* Login Form */}
            <Box>
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onLoginError={onLoginError}
                showForgotPassword={true}
              />
            </Box>

            {/* Footer */}
            <Box textAlign="center" pt={4}>
              <Text fontSize="xs" color="gray.500" lineHeight="1.5">
                By signing in, you agree to our{' '}
                <Text as="span" color="blue.600" textDecoration="underline" cursor="pointer" _hover={{ color: "blue.700" }}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text as="span" color="blue.600" textDecoration="underline" cursor="pointer" _hover={{ color: "blue.700" }}>
                  Privacy Policy
                </Text>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
};