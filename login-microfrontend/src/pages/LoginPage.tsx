import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Flex,
  Text,
} from '@chakra-ui/react';
import { LoginForm } from '../components';
import { useAuth } from '../hooks';

export interface LoginPageProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
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
      bg="linear-gradient(135deg, #a8e6cf 0%, #dcedc8 50%, #f8ffd6 100%)"
      py={8}
      px={4}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='3'/%3E%3Ccircle cx='53' cy='53' r='3'/%3E%3Ccircle cx='23' cy='43' r='2'/%3E%3Ccircle cx='37' cy='17' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        zIndex: 0
      }}
    >
      <Box width="100%" maxW="100vw" position="relative" zIndex={1}>
        {/* Coschool Branding - Outside the card */}
        <VStack gap={6} textAlign="center" mb={12}>
          <Box
            w={16}
            h={16}
            bg="rgba(255, 255, 255, 0.4)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid rgba(255, 255, 255, 0.3)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
          >
            <Box
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
            >
              C
            </Box>
          </Box>
          
          <Heading 
            size="xl" 
            fontWeight="bold"
            color="gray.800"
            letterSpacing="tight"
          >
            Coschool
          </Heading>
        </VStack>

        {/* Login Card - Now taking full width */}
        <Container maxW="sm">
          <Box
            bg="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            border="1px solid rgba(255, 255, 255, 0.3)"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            p={12}
            position="relative"
            width="100%"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
              borderRadius: '3xl',
              pointerEvents: 'none'
            }}
          >
            <VStack gap={8} align="stretch" position="relative" zIndex={2}>
              {/* Login Form */}
              <Box>
                <LoginForm
                  onLoginSuccess={onLoginSuccess}
                  onLoginError={onLoginError}
                  showForgotPassword={true}
                />
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Flex>
  );
};