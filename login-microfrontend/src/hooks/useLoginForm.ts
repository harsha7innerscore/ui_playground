import { useState, useCallback } from 'react';
import { validateLoginForm } from '../services/authPresenter';
import type { LoginCredentials, FormValidationErrors } from '../types';

export interface UseLoginFormReturn {
  // Form data
  credentials: LoginCredentials;
  
  // Validation
  errors: FormValidationErrors;
  isValid: boolean;
  
  // Actions
  updateField: (field: keyof LoginCredentials, value: string) => void;
  updateCredentials: (updates: Partial<LoginCredentials>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  clearErrors: () => void;
}

const initialCredentials: LoginCredentials = {
  username: '',
  password: '',
};

export const useLoginForm = (): UseLoginFormReturn => {
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials);
  const [errors, setErrors] = useState<FormValidationErrors>({});

  const updateField = useCallback((field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [errors]);

  const updateCredentials = useCallback((updates: Partial<LoginCredentials>) => {
    setCredentials(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateLoginForm(credentials);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [credentials]);

  const resetForm = useCallback(() => {
    setCredentials(initialCredentials);
    setErrors({});
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0 && 
                  credentials.username?.trim() !== '' && 
                  credentials.password?.trim() !== '';

  return {
    credentials,
    errors,
    isValid,
    updateField,
    updateCredentials,
    validateForm,
    resetForm,
    clearErrors,
  };
};