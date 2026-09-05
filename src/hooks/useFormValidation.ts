import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash-es';
import * as yup from 'yup';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  fieldStrengths: Record<string, number>;
  overallStrength: number;
}

export interface UseFormValidationOptions {
  debounceMs?: number;
  enableRealTime?: boolean;
  showWarnings?: boolean;
  strengthCalculation?: boolean;
}

export function useFormValidation(
  schema: yup.AnyObjectSchema,
  options: UseFormValidationOptions = {}
) {
  const {
    debounceMs = 300,
    enableRealTime = true,
    showWarnings = true,
    strengthCalculation = true
  } = options;

  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: false,
    errors: {},
    warnings: {},
    fieldStrengths: {},
    overallStrength: 0
  });

  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce(async (data: any) => {
      setIsValidating(true);
      
      try {
        await schema.validate(data, { abortEarly: false });
        
        const fieldStrengths = strengthCalculation ? calculateFieldStrengths(data) : {};
        const overallStrength = strengthCalculation ? calculateOverallStrength(fieldStrengths) : 0;
        const warnings = showWarnings ? generateWarnings(data) : {};

        setValidationState({
          isValid: true,
          errors: {},
          warnings,
          fieldStrengths,
          overallStrength
        });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const errors: Record<string, string> = {};
          
          error.inner.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });

          const fieldStrengths = strengthCalculation ? calculateFieldStrengths(data) : {};
          const overallStrength = strengthCalculation ? calculateOverallStrength(fieldStrengths) : 0;
          const warnings = showWarnings ? generateWarnings(data) : {};

          setValidationState({
            isValid: false,
            errors,
            warnings,
            fieldStrengths,
            overallStrength
          });
        }
      } finally {
        setIsValidating(false);
      }
    }, debounceMs),
    [schema, debounceMs, showWarnings, strengthCalculation]
  );

  // Validate specific field
  const validateField = useCallback(async (fieldName: string, value: any) => {
    try {
      await schema.validateAt(fieldName, { [fieldName]: value });
      
      setValidationState(prev => ({
        ...prev,
        errors: { ...prev.errors, [fieldName]: '' }
      }));
      
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setValidationState(prev => ({
          ...prev,
          errors: { ...prev.errors, [fieldName]: error.message }
        }));
      }
      return false;
    }
  }, [schema]);

  // Validate all fields
  const validateAll = useCallback(async (data: any) => {
    if (enableRealTime) {
      debouncedValidate(data);
    } else {
      await debouncedValidate(data);
    }
  }, [debouncedValidate, enableRealTime]);

  // Calculate field strength (0-100)
  const calculateFieldStrengths = useCallback((data: any): Record<string, number> => {
    const strengths: Record<string, number> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        let strength = 0;
        
        // Length factor
        if (value.length > 0) strength += 20;
        if (value.length > 5) strength += 20;
        if (value.length > 10) strength += 20;
        
        // Complexity factor
        if (/[A-Z]/.test(value)) strength += 10;
        if (/[a-z]/.test(value)) strength += 10;
        if (/[0-9]/.test(value)) strength += 10;
        if (/[^A-Za-z0-9]/.test(value)) strength += 10;
        
        strengths[key] = Math.min(strength, 100);
      } else if (typeof value === 'number') {
        strengths[key] = value > 0 ? 100 : 0;
      } else if (Array.isArray(value)) {
        strengths[key] = value.length > 0 ? 100 : 0;
      } else {
        strengths[key] = value ? 100 : 0;
      }
    });
    
    return strengths;
  }, []);

  // Calculate overall form strength
  const calculateOverallStrength = useCallback((fieldStrengths: Record<string, number>): number => {
    const values = Object.values(fieldStrengths);
    if (values.length === 0) return 0;
    
    return Math.round(values.reduce((sum, strength) => sum + strength, 0) / values.length);
  }, []);

  // Generate warnings for form fields
  const generateWarnings = useCallback((data: any): Record<string, string> => {
    const warnings: Record<string, string> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value.length > 0 && value.length < 3) {
          warnings[key] = 'Nilai terlalu pendek';
        } else if (value.length > 100) {
          warnings[key] = 'Nilai mungkin terlalu panjang';
        }
      }
    });
    
    return warnings;
  }, []);

  // Get form completion percentage
  const getFormCompletion = useCallback((data: any): number => {
    const fields = Object.keys(schema.fields);
    const completedFields = fields.filter(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }, [schema]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const errorCount = Object.keys(validationState.errors).filter(
      key => validationState.errors[key]
    ).length;
    
    const warningCount = Object.keys(validationState.warnings).filter(
      key => validationState.warnings[key]
    ).length;

    return {
      isValid: validationState.isValid,
      errorCount,
      warningCount,
      overallStrength: validationState.overallStrength,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0
    };
  }, [validationState]);

  return {
    validationState,
    isValidating,
    validateField,
    validateAll,
    getFormCompletion,
    getValidationSummary,
    calculateFieldStrengths,
    calculateOverallStrength
  };
}

// Utility functions for enhanced validation
export function createPasswordStrengthValidator(minLength: number = 8) {
  return yup.string()
    .min(minLength, `Password minimal ${minLength} karakter`)
    .matches(/[a-z]/, 'Password harus mengandung huruf kecil')
    .matches(/[A-Z]/, 'Password harus mengandung huruf besar')
    .matches(/[0-9]/, 'Password harus mengandung angka')
    .matches(/[^A-Za-z0-9]/, 'Password harus mengandung karakter khusus');
}

export function createEmailValidator() {
  return yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi');
}

export function createUsernameValidator() {
  return yup.string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh mengandung huruf, angka, dan underscore')
    .required('Username wajib diisi');
}