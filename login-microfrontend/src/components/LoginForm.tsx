import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Alert,
  AlertIcon,
  Text,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth, useLoginForm } from '../hooks';

export interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  showForgotPassword?: boolean;
  showRememberMe?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  showForgotPassword = false,
  showRememberMe = false,
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
      <VStack spacing={4}>
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <FormControl isInvalid={!!errors.email}>
          <FormLabel htmlFor="username">Username</FormLabel>
          <Input
            id="username"
            type="text"
            value={credentials.username || ''}
            onChange={handleInputChange('username')}
            onFocus={handleFocus}
            placeholder="Enter your username"
            aria-describedby={errors.email ? 'username-error' : undefined}
            disabled={isLoading}
          />
          <FormErrorMessage id="username-error">
            {errors.email}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputGroup>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password || ''}
              onChange={handleInputChange('password')}
              onFocus={handleFocus}
              placeholder="Enter your password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={togglePasswordVisibility}
                variant="ghost"
                size="sm"
                disabled={isLoading}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage id="password-error">
            {errors.password}
          </FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          width="100%"
          isLoading={isLoading}
          loadingText="Signing in..."
          disabled={!isValid || isLoading}
        >
          Sign In
        </Button>

        {showForgotPassword && (
          <Button
            variant="link"
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