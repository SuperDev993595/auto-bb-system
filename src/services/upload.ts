import api, { apiResponse } from './api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename?: string;
    originalName?: string;
    path?: string;
    size?: number;
    mimetype?: string;
    url?: string;
    files?: UploadedFile[];
  };
}

export interface FileListResponse {
  success: boolean;
  data: {
    files: Array<{
      filename: string;
      size: number;
      created: string;
      modified: string;
      url: string;
    }>;
  };
}

export const uploadService = {
  // Upload single file
  async uploadSingle(file: File, type: 'avatar' | 'task-attachment' | 'customer-document' = 'task-attachment'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiResponse(api.post<UploadResponse>(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    return response;
  },

  // Upload multiple files
  async uploadMultiple(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiResponse(api.post<UploadResponse>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    return response;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<UploadResponse> {
    return this.uploadSingle(file, 'avatar');
  },

  // Upload task attachment
  async uploadTaskAttachment(file: File): Promise<UploadResponse> {
    return this.uploadSingle(file, 'task-attachment');
  },

  // Upload customer document
  async uploadCustomerDocument(file: File): Promise<UploadResponse> {
    return this.uploadSingle(file, 'customer-document');
  },

  // Download file
  async downloadFile(filename: string, type: string = 'general'): Promise<Blob> {
    const response = await api.get(`/upload/download/${filename}?type=${type}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete file
  async deleteFile(filename: string, type: string = 'general'): Promise<{ success: boolean; message: string }> {
    const response = await apiResponse(api.delete<{ success: boolean; message: string }>(`/upload/${filename}?type=${type}`));
    return response;
  },

  // List files
  async listFiles(type: string = 'general'): Promise<FileListResponse> {
    const response = await apiResponse(api.get<FileListResponse>(`/upload/list?type=${type}`));
    return response;
  },

  // Get file URL
  getFileUrl(filename: string, type: string = 'general'): string {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${type}/${filename}`;
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileTypeIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📄';
      case 'csv':
        return '📊';
      default:
        return '📎';
    }
  },

  // Validate file
  validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`
      };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only images, PDFs, documents, and text files are allowed.'
      };
    }

    return { valid: true };
  }
};
