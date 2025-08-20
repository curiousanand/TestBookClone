/**
 * File Upload Validation Schemas
 * 
 * Zod schemas for validating file upload requests and responses.
 */

import { z } from 'zod';

// =============================================================================
// CORE VALIDATION SCHEMAS
// =============================================================================

export const fileCategorySchema = z.enum(['image', 'video', 'document', 'audio'], {
  errorMap: () => ({ message: 'Please select a valid file category' }),
});

export const uploadFolderSchema = z.enum(['profiles', 'courses', 'lessons', 'exams', 'documents', 'temp'], {
  errorMap: () => ({ message: 'Please select a valid upload folder' }),
});

export const imageSizeSchema = z.enum(['thumbnail', 'medium', 'large', 'original'], {
  errorMap: () => ({ message: 'Please select a valid image size' }),
});

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const fileUploadRequestSchema = z.object({
  category: fileCategorySchema,
  folder: uploadFolderSchema,
  generateThumbnails: z.boolean().default(false),
  customPath: z
    .string()
    .regex(/^[a-zA-Z0-9\/_-]+$/, 'Custom path can only contain letters, numbers, slashes, hyphens, and underscores')
    .max(200, 'Custom path must not exceed 200 characters')
    .optional(),
  metadata: z
    .record(z.string().max(500, 'Metadata values must not exceed 500 characters'))
    .optional()
    .refine(
      (metadata) => !metadata || Object.keys(metadata).length <= 10,
      'Metadata cannot have more than 10 keys'
    ),
});

export const fileUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  file: z.object({
    url: z.string().url('Invalid file URL'),
    thumbnails: z.record(imageSizeSchema, z.string().url()).optional(),
    key: z.string().min(1, 'File key is required'),
    name: z.string().min(1, 'File name is required'),
    size: z.number().min(0, 'File size must be non-negative'),
    type: z.string().min(1, 'File type is required'),
    metadata: z.record(z.string()).optional(),
  }).optional(),
  error: z.string().optional(),
});

// =============================================================================
// PRESIGNED URL SCHEMAS
// =============================================================================

export const presignedUrlRequestSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters')
    .regex(/^[^<>:"/\\|?*\x00-\x1f]+$/, 'File name contains invalid characters'),
  contentType: z
    .string()
    .min(1, 'Content type is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/, 'Invalid MIME type format'),
  folder: uploadFolderSchema,
  expiresIn: z
    .number()
    .min(60, 'Expiration time must be at least 60 seconds')
    .max(86400, 'Expiration time must not exceed 24 hours')
    .default(3600),
});

export const presignedUrlResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uploadUrl: z.string().url('Invalid upload URL'),
  fileKey: z.string().min(1, 'File key is required'),
  fileUrl: z.string().url('Invalid file URL'),
  expiresIn: z.number().min(60),
});

// =============================================================================
// FILE VALIDATION SCHEMAS
// =============================================================================

export const fileValidationRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  mimeType: z.string().min(1, 'MIME type is required'),
  category: fileCategorySchema,
});

export const fileValidationResponseSchema = z.object({
  isValid: z.boolean(),
  error: z.string().optional(),
  fileInfo: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    extension: z.string(),
    category: fileCategorySchema,
    formattedSize: z.string(),
  }).optional(),
  recommendations: z.array(z.string()).optional(),
});

// =============================================================================
// FILE DELETION SCHEMAS
// =============================================================================

export const fileDeleteRequestSchema = z.object({
  fileKey: z
    .string()
    .min(1, 'File key is required')
    .max(1024, 'File key is too long'),
});

export const fileDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  fileKey: z.string(),
});

// =============================================================================
// UPLOAD CONFIGURATION SCHEMAS
// =============================================================================

export const uploadConfigResponseSchema = z.object({
  success: z.boolean(),
  config: z.object({
    maxFileSizes: z.record(fileCategorySchema, z.string()),
    allowedTypes: z.object({
      images: z.array(z.string()),
      videos: z.array(z.string()),
      documents: z.array(z.string()),
      audio: z.array(z.string()),
    }),
    folders: z.array(uploadFolderSchema),
    isConfigured: z.boolean(),
    missingConfig: z.array(z.string()).optional(),
  }),
});

// =============================================================================
// BULK UPLOAD SCHEMAS
// =============================================================================

export const bulkUploadRequestSchema = z.object({
  files: z
    .array(fileUploadRequestSchema)
    .min(1, 'At least one file is required')
    .max(10, 'Cannot upload more than 10 files at once'),
  folder: uploadFolderSchema,
  category: fileCategorySchema,
});

export const bulkUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  results: z.array(z.object({
    fileName: z.string(),
    success: z.boolean(),
    fileUrl: z.string().url().optional(),
    error: z.string().optional(),
  })),
  totalFiles: z.number(),
  successfulUploads: z.number(),
  failedUploads: z.number(),
});

// =============================================================================
// PROGRESS TRACKING SCHEMAS
// =============================================================================

export const uploadProgressSchema = z.object({
  fileName: z.string(),
  uploadId: z.string(),
  bytesUploaded: z.number().min(0),
  totalBytes: z.number().min(1),
  percentage: z.number().min(0).max(100),
  status: z.enum(['pending', 'uploading', 'processing', 'completed', 'failed']),
  startTime: z.date(),
  estimatedTimeRemaining: z.number().min(0).optional(),
  speed: z.number().min(0).optional(), // bytes per second
});

export const uploadProgressUpdateSchema = z.object({
  uploadId: z.string().min(1, 'Upload ID is required'),
  bytesUploaded: z.number().min(0),
  status: uploadProgressSchema.shape.status.optional(),
});

// =============================================================================
// IMAGE OPTIMIZATION SCHEMAS
// =============================================================================

export const imageOptimizationRequestSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
  sizes: z.array(imageSizeSchema).default(['thumbnail', 'medium', 'large']),
  format: z.enum(['jpeg', 'png', 'webp']).default('jpeg'),
  quality: z.number().min(1).max(100).default(85),
});

export const imageOptimizationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  originalUrl: z.string().url(),
  optimizedImages: z.record(imageSizeSchema, z.object({
    url: z.string().url(),
    width: z.number(),
    height: z.number(),
    size: z.number(),
    format: z.string(),
  })),
});

// =============================================================================
// ERROR SCHEMAS
// =============================================================================

export const uploadErrorSchema = z.object({
  code: z.enum([
    'INVALID_FILE_TYPE',
    'FILE_TOO_LARGE',
    'UPLOAD_FAILED',
    'OPTIMIZATION_FAILED',
    'VALIDATION_FAILED',
    'S3_CONFIG_MISSING',
    'PERMISSION_DENIED',
    'QUOTA_EXCEEDED',
    'NETWORK_ERROR',
  ]),
  message: z.string(),
  details: z.record(z.any()).optional(),
  suggestions: z.array(z.string()).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type FileCategory = z.infer<typeof fileCategorySchema>;
export type UploadFolder = z.infer<typeof uploadFolderSchema>;
export type ImageSize = z.infer<typeof imageSizeSchema>;

export type FileUploadRequest = z.infer<typeof fileUploadRequestSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;

export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;
export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;

export type FileValidationRequest = z.infer<typeof fileValidationRequestSchema>;
export type FileValidationResponse = z.infer<typeof fileValidationResponseSchema>;

export type FileDeleteRequest = z.infer<typeof fileDeleteRequestSchema>;
export type FileDeleteResponse = z.infer<typeof fileDeleteResponseSchema>;

export type UploadConfigResponse = z.infer<typeof uploadConfigResponseSchema>;

export type BulkUploadRequest = z.infer<typeof bulkUploadRequestSchema>;
export type BulkUploadResponse = z.infer<typeof bulkUploadResponseSchema>;

export type UploadProgress = z.infer<typeof uploadProgressSchema>;
export type UploadProgressUpdate = z.infer<typeof uploadProgressUpdateSchema>;

export type ImageOptimizationRequest = z.infer<typeof imageOptimizationRequestSchema>;
export type ImageOptimizationResponse = z.infer<typeof imageOptimizationResponseSchema>;

export type UploadError = z.infer<typeof uploadErrorSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate file size against category limits
 */
export function validateFileSize(size: number, category: FileCategory): { isValid: boolean; maxSize?: string } {
  const limits = {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    document: 50 * 1024 * 1024, // 50MB
    audio: 100 * 1024 * 1024, // 100MB
  };

  const maxSize = limits[category];
  const isValid = size <= maxSize;
  
  return {
    isValid,
    maxSize: `${Math.round(maxSize / (1024 * 1024))} MB`,
  };
}

/**
 * Validate MIME type against category
 */
export function validateMimeType(mimeType: string, category: FileCategory): { isValid: boolean; allowedTypes?: string[] } {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  };

  const categoryTypes = allowedTypes[category];
  const isValid = categoryTypes.includes(mimeType);
  
  return {
    isValid,
    allowedTypes: categoryTypes,
  };
}

/**
 * Generate upload recommendations based on file properties
 */
export function generateUploadRecommendations(
  fileName: string,
  fileSize: number,
  mimeType: string,
  category: FileCategory
): string[] {
  const recommendations: string[] = [];

  // Size recommendations
  if (category === 'image' && fileSize > 5 * 1024 * 1024) {
    recommendations.push('Consider compressing the image to reduce file size');
  }

  if (category === 'video' && fileSize > 100 * 1024 * 1024) {
    recommendations.push('Large video files may take longer to upload and process');
  }

  // Format recommendations
  if (category === 'image' && mimeType === 'image/png' && fileSize > 2 * 1024 * 1024) {
    recommendations.push('Consider converting PNG to JPEG for better compression');
  }

  if (category === 'document' && mimeType === 'application/msword') {
    recommendations.push('Consider using PDF format for better compatibility');
  }

  // Naming recommendations
  if (fileName.length > 100) {
    recommendations.push('Consider using a shorter file name');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    recommendations.push('File name should only contain letters, numbers, dots, hyphens, and underscores');
  }

  return recommendations;
}