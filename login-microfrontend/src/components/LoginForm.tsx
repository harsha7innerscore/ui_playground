import React from 'react';
import {
  Box,
  Button,
  Field,
  Input,
  VStack,
  Text,
  IconButton,
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

  const [showPassword, setShowPassword] = React.useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            bg="red.50" 
            color="red.700" 
            p={4} 
            borderRadius="lg" 
            borderWidth="1px"
            borderColor="red.200"
            width="100%"
          >
            <Text fontSize="sm" fontWeight="medium">{error}</Text>
          </Box>
        )}

        <VStack gap={5} align="stretch">
          <Field.Root invalid={!!errors.username}>
            <Field.Label 
              htmlFor="username"
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              mb={2}
            >
              Username
            </Field.Label>
            <Input
              id="username"
              type="text"
              value={credentials.username || ''}
              onChange={handleInputChange('username')}
              onFocus={handleFocus}
              placeholder="Enter your username"
              disabled={isLoading}
              size="lg"
              borderColor="gray.300"
              borderRadius="lg"
              bg="white"
              _hover={{
                borderColor: "gray.400"
              }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce"
              }}
              _disabled={{
                bg: "gray.50",
                opacity: 0.6
              }}
            />
            {errors.username && (
              <Field.ErrorText id="username-error" fontSize="sm" mt={1}>
                {errors.username}
              </Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label 
              htmlFor="password"
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              mb={2}
            >
              Password
            </Field.Label>
            <Box position="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password || ''}
                onChange={handleInputChange('password')}
                onFocus={handleFocus}
                placeholder="Enter your password"
                disabled={isLoading}
                size="lg"
                borderColor="gray.300"
                borderRadius="lg"
                bg="white"
                pr="3.5rem"
                _hover={{
                  borderColor: "gray.400"
                }}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce"
                }}
                _disabled={{
                  bg: "gray.50",
                  opacity: 0.6
                }}
              />
              <Box
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
              >
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  color="gray.500"
                  _hover={{ color: "gray.700" }}
                  fontSize="lg"
                >
                  {showPassword ? '🙈' : '👁'}
                </IconButton>
              </Box>
            </Box>
            {errors.password && (
              <Field.ErrorText id="password-error" fontSize="sm" mt={1}>
                {errors.password}
              </Field.ErrorText>
            )}
          </Field.Root>
        </VStack>

        <VStack gap={4} align="stretch">
          <Button
            type="submit"
            size="lg"
            width="100%"
            loading={isLoading}
            loadingText="Signing in..."
            disabled={!isValid || isLoading}
            bg="blue.600"
            color="white"
            borderRadius="lg"
            fontWeight="semibold"
            _hover={{
              bg: "blue.700",
              transform: "translateY(-1px)",
              boxShadow: "lg"
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "md"
            }}
            _disabled={{
              bg: "gray.300",
              color: "gray.500",
              cursor: "not-allowed",
              transform: "none",
              boxShadow: "none"
            }}
            transition="all 0.2s"
          >
            Sign In
          </Button>

          {showForgotPassword && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              color="blue.600"
              fontWeight="medium"
              _hover={{
                color: "blue.700",
                bg: "blue.50"
              }}
            >
              Forgot Password?
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};