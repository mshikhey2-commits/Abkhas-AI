/**
 * 🟥 CRITICAL_STATE_CONSOLIDATION: Consolidated File Operations Utilities
 * 
 * Centralizes common file reading and encoding patterns
 * Prevents code duplication across components
 * 
 * Usage:
 * const base64 = await readFileAsBase64(file);
 * const isValid = validateEntity(product);
 */

/**
 * Read file and convert to Base64 with error handling
 * @param file - HTML File object
 * @returns Promise<string> - Base64 encoded data
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: Centralized error handling for file operations
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          
          if (!base64) {
            reject(new Error('Failed to extract Base64 from file'));
            return;
          }
          
          resolve(base64);
        } catch (error) {
          reject(new Error(`Error processing file: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('FileReader error'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error(`Error initiating file read: ${error}`));
    }
  });
};

/**
 * Read file and return as Data URL (for image preview)
 * @param file - HTML File object
 * @returns Promise<string> - Data URL for preview
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: Centralized error handling
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('FileReader error'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error(`Error initiating file read: ${error}`));
    }
  });
};

/**
 * Validate that an entity exists and has required fields
 * @param entity - Any object to validate
 * @param requiredFields - Array of field names that must exist
 * @returns boolean
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: Safe null/undefined checking
 */
export const validateEntity = <T extends Record<string, any>>(
  entity: T | null | undefined,
  requiredFields: (keyof T)[] = []
): entity is T => {
  if (!entity) return false;
  
  return requiredFields.every(field => 
    entity[field] !== null && entity[field] !== undefined
  );
};

/**
 * Validate that a file is of allowed type
 * @param file - HTML File object
 * @param allowedMimeTypes - Array of allowed MIME types
 * @returns boolean
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: File type validation
 */
export const validateFileType = (
  file: File,
  allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): boolean => {
  if (!file) return false;
  
  return allowedMimeTypes.includes(file.type);
};

/**
 * Validate that a file size is within limits
 * @param file - HTML File object
 * @param maxSizeInMB - Maximum file size in megabytes
 * @returns boolean
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: File size validation
 */
export const validateFileSize = (
  file: File,
  maxSizeInMB: number = 10
): boolean => {
  if (!file) return false;
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Complete file validation (type + size)
 * @param file - HTML File object
 * @param options - Validation options
 * @returns object with isValid and errorMessage
 * 
 * 🟥 CRITICAL_ERROR_BOUNDARY: Comprehensive file validation
 */
export const validateFile = (
  file: File | null | undefined,
  options: {
    allowedMimeTypes?: string[];
    maxSizeInMB?: number;
  } = {}
): { isValid: boolean; errorMessage?: string } => {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeInMB = 10
  } = options;

  if (!file) {
    return { isValid: false, errorMessage: 'No file selected' };
  }

  if (!validateFileType(file, allowedMimeTypes)) {
    return { 
      isValid: false, 
      errorMessage: `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}` 
    };
  }

  if (!validateFileSize(file, maxSizeInMB)) {
    return { 
      isValid: false, 
      errorMessage: `File size exceeds ${maxSizeInMB}MB limit` 
    };
  }

  return { isValid: true };
};
