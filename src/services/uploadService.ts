const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface UploadedFile {
  name: string;
  url: string;
  publicId: string;
  type: 'image' | 'pdf' | 'document';
  size: number;
  format: string;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
}

export interface MultipleUploadResponse {
  message: string;
  files: UploadedFile[];
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Handle API response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Upload single file
 */
export const uploadSingleFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload/single`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files: File[]): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/api/upload/multiple`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (publicId: string): Promise<{ message: string }> => {
  const encodedPublicId = encodeURIComponent(publicId);
  
  const response = await fetch(`${API_URL}/api/upload/${encodedPublicId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only images, PDFs, and documents are allowed.' };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon
 */
export const getFileTypeIcon = (type: string): string => {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'document':
      return '📝';
    default:
      return '📎';
  }
};
