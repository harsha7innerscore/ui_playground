import React from 'react';
import {
  Box,
  Button,
  Field,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useAuth, useLoginForm } from '../hooks';

export interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  showForgotPassword?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  showForgotPassword = false,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const {
    credentials,
    errors,
    isValid,
    updateField,
    validateForm,
    resetForm,
    clearErrors,
  } = useLoginForm();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await login(credentials);
    
    if (result.success) {
      resetForm();
      onLoginSuccess?.();
    } else {
      if (result.errors) {
        // Form validation errors are already handled by useLoginForm
      } else {
        onLoginError?.(error || 'Login failed');
      }
    }
  };


  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateField(field, e.target.value);
  };

  const handleFocus = () => {
    if (error) {
      clearError();
    }
    clearErrors();
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack gap={6} align="stretch">
        {error && (
          <Box 
            bg="rgba(239, 68, 68, 0.1)" 
            color="red.700" 
            p={4} 
            borderRadius="xl" 
            borderWidth="1px"
            borderColor="rgba(239, 68, 68, 0.2)"
            backdropFilter="blur(10px)"
            width="100%"
          >
            <Text fontSize="sm" fontWeight="medium">{error}</Text>
          </Box>
        )}

        <VStack gap={4} align="stretch">
          <Field.Root invalid={!!errors.username}>
            <Box position="relative">
              <Input
                id="username"
                type="text"
                value={credentials.username || ''}
                onChange={handleInputChange('username')}
                onFocus={handleFocus}
                placeholder="Username"
                disabled={isLoading}
                size="lg"
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                borderRadius="xl"
                color="gray.800"
                fontSize="md"
                py={6}
                pl={6}
                pr={6}
                _placeholder={{
                  color: "gray.500"
                }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(255, 255, 255, 0.4)"
                }}
                _focus={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                  outline: "none"
                }}
                _disabled={{
                  opacity: 0.6
                }}
              />
            </Box>
            {errors.username && (
              <Field.ErrorText id="username-error" fontSize="sm" mt={1} color="red.600">
                {errors.username}
              </Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Box position="relative">
              <Input
                id="password"
                type="password"
                value={credentials.password || ''}
                onChange={handleInputChange('password')}
                onFocus={handleFocus}
                placeholder="Password"
                disabled={isLoading}
                size="lg"
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                borderRadius="xl"
                color="gray.800"
                fontSize="md"
                py={6}
                pl={6}
                pr={6}
                _placeholder={{
                  color: "gray.500"
                }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(255, 255, 255, 0.4)"
                }}
                _focus={{
                  bg: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                  outline: "none"
                }}
                _disabled={{
                  opacity: 0.6
                }}
              />
            </Box>
            {errors.password && (
              <Field.ErrorText id="password-error" fontSize="sm" mt={1} color="red.600">
                {errors.password}
              </Field.ErrorText>
            )}
          </Field.Root>
        </VStack>

        <VStack gap={3} align="stretch">
          {showForgotPassword && (
            <Box textAlign="right">
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
                color="gray.600"
                fontWeight="medium"
                fontSize="sm"
                p={1}
                h="auto"
                _hover={{
                  color: "gray.800",
                  bg: "rgba(255, 255, 255, 0.2)"
                }}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          <Button
            type="submit"
            size="lg"
            width="100%"
            loading={isLoading}
            loadingText="Signing in..."
            disabled={!isValid || isLoading}
            bg="gray.800"
            color="white"
            borderRadius="xl"
            fontWeight="semibold"
            fontSize="md"
            py={6}
            _hover={{
              bg: "gray.700",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
            }}
            _disabled={{
              bg: "gray.400",
              color: "gray.200",
              cursor: "not-allowed",
              transform: "none",
              boxShadow: "none"
            }}
            transition="all 0.2s ease"
          >
            Login
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};