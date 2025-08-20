/**
 * ImageUpload Component
 * 
 * Specialized image upload component with preview, cropping,
 * automatic optimization, and responsive image generation.
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RotateCw, ZoomIn, ZoomOut, Move, Check, AlertCircle, Loader2 } from 'lucide-react';
import { type UploadFolder } from '@/lib/validations/upload';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageUploadResult {
  original: string;
  thumbnails?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface ImageUploadProps {
  // Configuration
  folder: UploadFolder;
  disabled?: boolean;
  
  // Image constraints
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number; // width/height
  cropAspectRatio?: number;
  maxFileSize?: number; // in bytes
  
  // Features
  allowCrop?: boolean;
  allowRotation?: boolean;
  generateThumbnails?: boolean;
  autoOptimize?: boolean;
  showPreview?: boolean;
  
  // Styling
  className?: string;
  previewClassName?: string;
  cropperClassName?: string;
  
  // Upload area customization
  uploadAreaStyle?: 'card' | 'circle' | 'banner';
  placeholder?: string;
  showUploadIcon?: boolean;
  
  // Callbacks
  onImageSelect?: (file: File) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (result: ImageUploadResult) => void;
  onUploadError?: (error: string) => void;
  onImageChange?: (imageUrl: string | null) => void;
  
  // Initial value
  initialImage?: string;
  
  // Validation
  acceptedFormats?: string[];
  customValidation?: (file: File) => Promise<{ isValid: boolean; error?: string }>;
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

const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getImageDimensions = (imageUrl: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = imageUrl;
  });
};

const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ImageUpload: React.FC<ImageUploadProps> = ({
  folder,
  disabled = false,
  maxWidth = 1920,
  maxHeight = 1080,
  minWidth = 100,
  minHeight = 100,
  aspectRatio,
  cropAspectRatio,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowCrop = false,
  allowRotation = false,
  generateThumbnails = true,
  autoOptimize = true,
  showPreview = true,
  className = '',
  previewClassName = '',
  cropperClassName = '',
  uploadAreaStyle = 'card',
  placeholder,
  showUploadIcon = true,
  onImageSelect,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onImageChange,
  initialImage,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  customValidation,
}) => {
  // =============================================================================
  // STATE
  // =============================================================================
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [rotation, setRotation] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
      onImageChange?.(initialImage);
    }
  }, [initialImage, onImageChange]);

  useEffect(() => {
    if (previewUrl && previewUrl.startsWith('data:')) {
      getImageDimensions(previewUrl)
        .then(setImageDimensions)
        .catch(console.error);
    }
  }, [previewUrl]);

  // =============================================================================
  // VALIDATION
  // =============================================================================

  const validateImage = useCallback(async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxFileSize)}`,
      };
    }

    // Create preview to check dimensions
    try {
      const preview = await createImagePreview(file);
      const dimensions = await getImageDimensions(preview);

      // Check minimum dimensions
      if (dimensions.width < minWidth || dimensions.height < minHeight) {
        return {
          isValid: false,
          error: `Image dimensions ${dimensions.width}×${dimensions.height} are too small. Minimum required: ${minWidth}×${minHeight}`,
        };
      }

      // Check aspect ratio if specified
      if (aspectRatio) {
        const fileAspectRatio = dimensions.width / dimensions.height;
        const tolerance = 0.1;
        if (Math.abs(fileAspectRatio - aspectRatio) > tolerance) {
          return {
            isValid: false,
            error: `Image aspect ratio ${fileAspectRatio.toFixed(2)} doesn't match required ratio ${aspectRatio.toFixed(2)}`,
          };
        }
      }

      // Custom validation
      if (customValidation) {
        return await customValidation(file);
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to process image',
      };
    }
  }, [acceptedFormats, maxFileSize, minWidth, minHeight, aspectRatio, customValidation]);

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    const validation = await validateImage(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid image');
      return;
    }

    setSelectedFile(file);
    onImageSelect?.(file);

    try {
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);
      
      const dimensions = await getImageDimensions(preview);
      setImageDimensions(dimensions);

      // Show cropper if enabled and image needs cropping
      if (allowCrop && (cropAspectRatio || dimensions.width > maxWidth || dimensions.height > maxHeight)) {
        setShowCropper(true);
      } else {
        // Auto-upload if no cropping needed
        await uploadImage(file);
      }
    } catch (error) {
      setError('Failed to process image');
    }
  }, [validateImage, allowCrop, cropAspectRatio, maxWidth, maxHeight, onImageSelect]);

  const uploadImage = useCallback(async (file: File, croppedBlob?: Blob) => {
    if (!file && !croppedBlob) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    onUploadStart?.();

    try {
      let uploadFile = file;

      // Use cropped blob if available
      if (croppedBlob) {
        uploadFile = new File([croppedBlob], file.name, { type: file.type });
      }

      // Auto-optimize if enabled
      if (autoOptimize && (imageDimensions?.width || 0) > maxWidth) {
        const optimizedBlob = await resizeImage(uploadFile, maxWidth, maxHeight);
        if (optimizedBlob) {
          uploadFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('options', JSON.stringify({
        category: 'image',
        folder,
        generateThumbnails,
      }));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 20, 90);
          onUploadProgress?.(newProgress);
          return newProgress;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadProgress(100);
      setPreviewUrl(result.file.url);
      setShowCropper(false);

      const uploadResult: ImageUploadResult = {
        original: result.file.url,
        thumbnails: result.file.thumbnails,
        metadata: {
          width: imageDimensions?.width || 0,
          height: imageDimensions?.height || 0,
          size: uploadFile.size,
          format: uploadFile.type,
        },
      };

      onUploadComplete?.(uploadResult);
      onImageChange?.(result.file.url);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [
    imageDimensions,
    autoOptimize,
    maxWidth,
    maxHeight,
    folder,
    generateThumbnails,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    onImageChange,
  ]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleBrowse = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setError(null);
    setShowCropper(false);
    onImageChange?.(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);

  const handleCropComplete = useCallback(async () => {
    if (!selectedFile || !imageRef.current) return;

    // This is a simplified crop implementation
    // In a real app, you'd use a proper cropping library like react-image-crop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    ctx.drawImage(
      img,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );

    canvas.toBlob(async (blob) => {
      if (blob) {
        await uploadImage(selectedFile, blob);
      }
    }, selectedFile.type);
  }, [selectedFile, cropArea, uploadImage]);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderUploadArea = () => {
    const baseClasses = `
      relative cursor-pointer transition-all duration-200
      border-2 border-dashed border-gray-300 hover:border-gray-400
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    const styleClasses = {
      card: 'rounded-lg p-6',
      circle: 'rounded-full aspect-square p-4',
      banner: 'rounded-md p-4 aspect-[3/1]',
    };

    return (
      <div
        className={`${baseClasses} ${styleClasses[uploadAreaStyle]} ${className}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleBrowse}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center h-full text-center">
          {showUploadIcon && (
            <div className="mb-3">
              {uploadAreaStyle === 'circle' ? (
                <Camera className="w-8 h-8 text-gray-400" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {placeholder || 'Upload an image'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()} up to {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (!previewUrl || !showPreview) return null;

    return (
      <div className={`relative ${previewClassName}`}>
        <img
          ref={imageRef}
          src={previewUrl}
          alt="Preview"
          className={`
            w-full h-auto rounded-lg
            ${uploadAreaStyle === 'circle' ? 'aspect-square object-cover rounded-full' : ''}
            ${uploadAreaStyle === 'banner' ? 'aspect-[3/1] object-cover' : ''}
          `}
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        {/* Controls overlay */}
        <div className="absolute top-2 right-2 flex gap-1">
          {allowRotation && (
            <button
              onClick={handleRotate}
              className="p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={handleRemove}
            className="p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Image info */}
        {imageDimensions && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
            {imageDimensions.width} × {imageDimensions.height}
          </div>
        )}
      </div>
    );
  };

  const renderCropper = () => {
    if (!showCropper || !previewUrl) return null;

    return (
      <div className={`mt-4 p-4 border border-gray-200 rounded-lg ${cropperClassName}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Crop Image</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCropper(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
          </div>
        </div>

        {/* Simplified crop area - in production, use a proper cropping library */}
        <div className="relative">
          <img
            src={previewUrl}
            alt="Crop preview"
            className="w-full h-auto max-h-64 object-contain"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-white text-sm">
              Cropping functionality requires a proper cropping library like react-image-crop
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="image-upload">
      {previewUrl ? renderPreview() : renderUploadArea()}
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {renderCropper()}

      {isUploading && (
        <div className="mt-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;