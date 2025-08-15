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
      return <HiPhotograph className="h-6 w-6 text-green-500" />;
    } else if (['pdf'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-red-500" />;
    } else if (['doc', 'docx'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-blue-500" />;
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      return <HiDocument className="h-6 w-6 text-green-600" />;
    } else {
      return <HiDocument className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="File Management" icon={HiUpload} />
      
      {/* File Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">File Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">General Files</option>
            <option value="avatars">User Avatars</option>
            <option value="tasks">Task Attachments</option>
            <option value="customers">Customer Documents</option>
          </select>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <HiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {uploading ? (
            <p className="text-gray-600">Uploading files...</p>
          ) : isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: Images, PDFs, Documents, Spreadsheets, Text files
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 10MB, Maximum files: 5
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No files found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getFileIcon(file.filename)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                          <div className="text-sm text-gray-500">{file.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(file.created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(file.modified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="View File"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(file.filename)}
                          className="text-green-600 hover:text-green-900"
                          title="Download File"
                        >
                          <HiDownload className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.filename)}
                          className="text-red-600 hover:text-red-900"
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
