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
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="400px">
      <VStack gap={4}>
        {error && (
          <Box 
            bg="red.500" 
            color="white" 
            p={3} 
            borderRadius="md" 
            width="100%"
          >
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}

        <Field.Root invalid={!!errors.username}>
          <Field.Label htmlFor="username">Username</Field.Label>
          <Input
            id="username"
            type="text"
            value={credentials.username || ''}
            onChange={handleInputChange('username')}
            onFocus={handleFocus}
            placeholder="Enter your username"
            disabled={isLoading}
          />
          {errors.username && (
            <Field.ErrorText id="username-error">
              {errors.username}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.password}>
          <Field.Label htmlFor="password">Password</Field.Label>
          <Box position="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password || ''}
              onChange={handleInputChange('password')}
              onFocus={handleFocus}
              placeholder="Enter your password"
              disabled={isLoading}
              pr="3rem"
            />
            <Box
              position="absolute"
              right="0.75rem"
              top="50%"
              transform="translateY(-50%)"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                p={1}
                h="auto"
                minW="auto"
              >
                {showPassword ? '🙈' : '👁'}
              </Button>
            </Box>
          </Box>
          {errors.password && (
            <Field.ErrorText id="password-error">
              {errors.password}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="100%"
          loading={isLoading}
          loadingText="Signing in..."
          disabled={!isValid || isLoading}
        >
          Sign In
        </Button>

        {showForgotPassword && (
          <Button
            variant="plain"
            size="sm"
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
        )}
      </VStack>
    </Box>
  );
};