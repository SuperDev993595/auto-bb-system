import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { HiUpload, HiDownload, HiTrash, HiEye, HiFolder, HiDocument, HiPhotograph } from 'react-icons/hi';
import { useDropzone } from 'react-dropzone';
import PageTitle from '../components/Shared/PageTitle';
import api from '../services/api';

interface FileRecord {
  filename: string;
  size: number;
  created: string;
  modified: string;
  url: string;
}

export default function FileUploadPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('general');

  useEffect(() => {
    fetchFiles();
  }, [selectedType]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/upload/list?type=${selectedType}`);
      if (response.data.success) {
        setFiles(response.data.data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    acceptedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(`${response.data.data.files.length} files uploaded successfully`);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  });

  const handleDownload = async (filename: string) => {
    try {
      const response = await api.get(`/upload/download/${filename}?type=${selectedType}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await api.delete(`/upload/${filename}?type=${selectedType}`);
      if (response.data.success) {
        toast.success('File deleted successfully');
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) {
      return <HiPhotograph className="h-6 w-6 text-success-600" />;
    } else if (['pdf'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-error-600" />;
    } else if (['doc', 'docx'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-primary-600" />;
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-success-600" />;
    } else {
      return <HiDocument className="h-6 w-6 text-secondary-500" />;
    }
  };

  return (
    <div className="page-container">
      <PageTitle title="File Management" icon={HiUpload} />
      
      {/* File Type Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="form-label mb-0">File Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-field"
          >
            <option value="general">General Files</option>
            <option value="avatars">User Avatars</option>
            <option value="tasks">Task Attachments</option>
            <option value="customers">Customer Documents</option>
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <h3 className="page-subtitle">Upload Files</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-secondary-300 hover:border-secondary-400'
          }`}
        >
          <input {...getInputProps()} />
          <HiUpload className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          {uploading ? (
            <p className="text-secondary-600">Uploading files...</p>
          ) : isDragActive ? (
            <p className="text-primary-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-secondary-600 mb-2">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-secondary-500">
                Supported formats: Images, PDFs, Documents, Spreadsheets, Text files
              </p>
              <p className="text-sm text-secondary-500">
                Maximum file size: 10MB, Maximum files: 5
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className="card">
        <div className="border-b border-secondary-200 pb-4 mb-4">
          <h3 className="page-subtitle">Uploaded Files</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <HiFolder className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No files found</p>
            </div>
          ) : (
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">File</th>
                  <th className="table-header-cell">Size</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Modified</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {files.map((file) => (
                  <tr key={file.filename} className="table-row hover:bg-secondary-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getFileIcon(file.filename)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-secondary-900">{file.filename}</div>
                          <div className="text-sm text-secondary-500">{file.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-secondary-900">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="table-cell text-sm text-secondary-500">
                      {new Date(file.created).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-sm text-secondary-500">
                      {new Date(file.modified).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View File"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(file.filename)}
                          className="text-success-600 hover:text-success-900 transition-colors"
                          title="Download File"
                        >
                          <HiDownload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.filename)}
                          className="text-error-600 hover:text-error-900 transition-colors"
                          title="Delete File"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
