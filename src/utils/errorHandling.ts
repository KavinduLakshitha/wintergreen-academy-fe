/**
 * Utility functions for handling API errors and validation messages
 */

export interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ValidationError[];
  validationFailed?: boolean;
}

/**
 * Extract and format error messages from API response
 */
export const getErrorMessage = (error: any): string => {
  // If it's a validation error with detailed messages
  if (error?.validationFailed && error?.errors?.length > 0) {
    const validationMessages = error.errors.map((err: ValidationError) => err.msg);
    return validationMessages.join(', ');
  }
  
  // If it's a regular error with a message
  if (error?.message) {
    return error.message;
  }
  
  // Fallback for unknown error formats
  return 'An unexpected error occurred';
};

/**
 * Extract validation errors for specific fields
 */
export const getFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (error?.validationFailed && error?.errors?.length > 0) {
    error.errors.forEach((err: ValidationError) => {
      if (err.path && !fieldErrors[err.path]) {
        fieldErrors[err.path] = err.msg;
      }
    });
  }
  
  return fieldErrors;
};

/**
 * Check if an error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.validationFailed === true;
};

/**
 * Format multiple validation errors into a readable message
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].msg;
  
  const groupedErrors: Record<string, string[]> = {};
  
  errors.forEach(error => {
    const field = error.path || 'general';
    if (!groupedErrors[field]) {
      groupedErrors[field] = [];
    }
    groupedErrors[field].push(error.msg);
  });
  
  const formattedMessages = Object.entries(groupedErrors).map(([field, messages]) => {
    if (field === 'general') {
      return messages.join(', ');
    }
    return `${field}: ${messages.join(', ')}`;
  });
  
  return formattedMessages.join('; ');
};
