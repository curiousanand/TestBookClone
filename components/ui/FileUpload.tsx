/**
 * FileUpload Component
 * 
 * Reusable file upload component with drag & drop, progress tracking,
 * file validation, and multiple upload modes.
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { type FileCategory, type UploadFolder } from '@/lib/validations/upload';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface FileUploadOptions {
  category: FileCategory;
  folder: UploadFolder;
  generateThumbnails?: boolean;
  customPath?: string;
  metadata?: Record<string, string>;
}

export interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  thumbnails?: Record<string, string>;
  error?: string;
  size: string;
  type: string;
}

export interface FileUploadProps {
  // Configuration
  category: FileCategory;
  folder: UploadFolder;
  multiple?: boolean;
  disabled?: boolean;
  
  // Customization
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  generateThumbnails?: boolean;
  customPath?: string;
  metadata?: Record<string, string>;
  
  // Styling
  className?: string;
  dropzoneClassName?: string;
  uploadAreaClassName?: string;
  
  // Callbacks
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string, result: any) => void;
  onUploadError?: (fileId: string, error: string) => void;
  onFilesChange?: (files: UploadedFile[]) => void;
  onRemoveFile?: (fileId: string) => void;
  
  // UI Options
  showProgress?: boolean;
  showPreview?: boolean;
  showFileList?: boolean;
  compact?: boolean;
  
  // Labels and text
  labels?: {
    dropzone?: string;
    browse?: string;
    uploading?: string;
    completed?: string;
    failed?: string;
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateFileId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const getFileIcon = (type: string): React.ReactNode => {
  if (type.startsWith('image/')) {
    return <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm font-medium">IMG</div>;
  }
  if (type.startsWith('video/')) {
    return <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-sm font-medium">VID</div>;
  }
  if (type.startsWith('audio/')) {
    return <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-green-600 text-sm font-medium">AUD</div>;
  }
  return <File className="w-8 h-8 text-gray-400" />;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const FileUpload: React.FC<FileUploadProps> = ({
  category,
  folder,
  multiple = false,
  disabled = false,
  maxFiles = 10,
  maxFileSize,
  acceptedTypes,
  generateThumbnails = false,
  customPath,
  metadata,
  className = '',
  dropzoneClassName = '',
  uploadAreaClassName = '',
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onFilesChange,
  onRemoveFile,
  showProgress = true,
  showPreview = true,
  showFileList = true,
  compact = false,
  labels = {},
}) => {
  // =============================================================================
  // STATE
  // =============================================================================
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Fetch upload configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/upload');
        if (response.ok) {
          const data = await response.json();
          setUploadConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to fetch upload config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Notify parent of file changes
  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  // =============================================================================
  // FILE VALIDATION
  // =============================================================================

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const maxSize = maxFileSize || (uploadConfig?.maxFileSizes?.[category] ? 
      parseInt(uploadConfig.maxFileSizes[category]) * 1024 * 1024 : 
      50 * 1024 * 1024);
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
      };
    }

    // Check file type
    const allowedTypes = acceptedTypes || uploadConfig?.allowedTypes?.[`${category}s`] || [];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }, [category, maxFileSize, acceptedTypes, uploadConfig]);

  // =============================================================================
  // FILE UPLOAD LOGIC
  // =============================================================================

  const uploadFile = useCallback(async (uploadedFile: UploadedFile): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('options', JSON.stringify({
        category,
        folder,
        generateThumbnails,
        customPath,
        metadata,
      }));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Update file status to completed
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100, 
              url: result.file.url,
              thumbnails: result.file.thumbnails 
            }
          : f
      ));

      onUploadComplete?.(uploadedFile.id, result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Update file status to failed
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'failed', error: errorMessage }
          : f
      ));

      onUploadError?.(uploadedFile.id, errorMessage);
    }
  }, [category, folder, generateThumbnails, customPath, metadata, onUploadComplete, onUploadError]);

  const processFiles = useCallback(async (fileList: File[]) => {
    if (disabled || isUploading) return;

    // Check file count limit
    if (!multiple && fileList.length > 1) {
      fileList = [fileList[0]];
    }

    if (files.length + fileList.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Validate and create UploadedFile objects
    const newUploadedFiles: UploadedFile[] = [];
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: generateFileId(),
        file,
        status: 'pending',
        progress: 0,
        size: formatFileSize(file.size),
        type: file.type,
      };

      newUploadedFiles.push(uploadedFile);
    }

    if (newUploadedFiles.length === 0) return;

    // Add files to state
    setFiles(prev => [...prev, ...newUploadedFiles]);
    setIsUploading(true);

    onUploadStart?.(newUploadedFiles.map(f => f.file));

    // Start uploads
    for (const uploadedFile of newUploadedFiles) {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'uploading', progress: 10 }
          : f
      ));

      onUploadProgress?.(uploadedFile.id, 10);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === uploadedFile.id && f.status === 'uploading' && f.progress < 90) {
            const newProgress = Math.min(f.progress + Math.random() * 20, 90);
            onUploadProgress?.(f.id, newProgress);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      // Upload file
      await uploadFile(uploadedFile);
      clearInterval(progressInterval);
    }

    setIsUploading(false);
  }, [
    disabled,
    isUploading,
    multiple,
    files.length,
    maxFiles,
    validateFile,
    onUploadStart,
    onUploadProgress,
    uploadFile,
  ]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onRemoveFile?.(fileId);
  }, [onRemoveFile]);

  const handleBrowseClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // =============================================================================
  // RENDER
  // =============================================================================

  const defaultLabels = {
    dropzone: multiple ? 'Drop files here or click to browse' : 'Drop file here or click to browse',
    browse: 'Browse Files',
    uploading: 'Uploading...',
    completed: 'Completed',
    failed: 'Failed',
    ...labels,
  };

  if (compact) {
    return (
      <div className={`file-upload-compact ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          accept={acceptedTypes?.join(',')}
        />
        
        <button
          onClick={handleBrowseClick}
          disabled={disabled}
          className={`
            inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md
            text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${uploadAreaClassName}
          `}
        >
          <Upload className="w-4 h-4" />
          {defaultLabels.browse}
        </button>

        {files.length > 0 && showFileList && (
          <div className="mt-2 space-y-1">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-2 text-sm">
                <div className="flex-1 truncate">{file.file.name}</div>
                {file.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {file.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                {file.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        accept={acceptedTypes?.join(',')}
      />

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${dropzoneClassName}
        `}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {defaultLabels.dropzone}
          </p>
          
          {uploadConfig && (
            <p className="text-sm text-gray-500">
              Maximum file size: {uploadConfig.maxFileSizes?.[category] || '50 MB'}
            </p>
          )}
          
          {acceptedTypes && (
            <p className="text-xs text-gray-400">
              Supported formats: {acceptedTypes.join(', ')}
            </p>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-gray-900">{defaultLabels.uploading}</span>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && showFileList && (
        <div className="mt-4 space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              {/* File Icon */}
              {showPreview && getFileIcon(file.type)}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {file.size} • {file.type}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    {file.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">{defaultLabels.completed}</span>
                      </div>
                    )}
                    
                    {file.status === 'failed' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-xs">{defaultLabels.failed}</span>
                      </div>
                    )}
                    
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">{Math.round(file.progress)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {showProgress && file.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'failed' && file.error && (
                  <p className="mt-1 text-xs text-red-600">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;