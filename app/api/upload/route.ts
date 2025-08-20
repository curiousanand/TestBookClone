/**
 * File Upload API Route
 * 
 * Handles file uploads with validation, optimization, and S3 storage.
 * Supports images, videos, documents, and audio files.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  uploadFileToS3, 
  generatePresignedUrl, 
  deleteFileFromS3,
  validateUploadConfig,
  fileUploadSchema,
  type FileUploadOptions,
  type PresignedUrlOptions,
  UPLOAD_ERRORS,
  UploadError
} from '@/lib/upload';
import { createApiRoute, sendSuccess, sendError } from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const uploadRequestSchema = z.object({
  category: z.enum(['image', 'video', 'document', 'audio']),
  folder: z.enum(['profiles', 'courses', 'lessons', 'exams', 'documents', 'temp']),
  generateThumbnails: z.boolean().default(false),
  customPath: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

const presignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  folder: z.enum(['profiles', 'courses', 'lessons', 'exams', 'documents', 'temp']),
  expiresIn: z.number().min(60).max(86400).default(3600), // 1 minute to 24 hours
});

const deleteFileSchema = z.object({
  fileKey: z.string().min(1, 'File key is required'),
});

// =============================================================================
// UPLOAD HANDLERS
// =============================================================================

/**
 * POST - Direct file upload
 */
const postHandler = createApiRoute({
  requireAuth: true,
});

export const POST = postHandler(async (request: NextRequest) => {
  try {
    // Validate upload configuration
    const configValidation = validateUploadConfig();
    if (!configValidation.isValid) {
      return sendError(
        `Upload configuration incomplete. Missing: ${configValidation.missingVars.join(', ')}`,
        500
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return sendError('No file provided', 400);
    }

    // Parse upload options
    const optionsData = formData.get('options');
    let uploadOptions: FileUploadOptions;

    try {
      const parsedOptions = optionsData ? JSON.parse(optionsData as string) : {};
      uploadOptions = uploadRequestSchema.parse(parsedOptions);
    } catch (error) {
      return sendError('Invalid upload options', 400);
    }

    // Add user ID to options
    const finalOptions: FileUploadOptions = {
      ...uploadOptions,
      userId: request.user?.id,
    };

    // Upload file
    const result = await uploadFileToS3(file, finalOptions);

    if (!result.success) {
      return sendError(result.error || 'Upload failed', 400);
    }

    return sendSuccess({
      message: 'File uploaded successfully',
      file: {
        url: result.fileUrl,
        thumbnails: result.thumbnails,
        key: result.fileKey,
        name: result.fileName,
        size: result.fileSize,
        type: result.mimeType,
        metadata: result.metadata,
      },
    }, undefined, 201);

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof UploadError) {
      return sendError(error.message, error.statusCode);
    }
    
    return sendError('Internal server error during upload', 500);
  }
});

/**
 * PUT - Generate presigned URL for direct client upload
 */
const putHandler = createApiRoute({
  requireAuth: true,
  validation: {
    body: presignedUrlSchema,
  },
});

export const PUT = putHandler(async (request: NextRequest) => {
  try {
    // Validate upload configuration
    const configValidation = validateUploadConfig();
    if (!configValidation.isValid) {
      return sendError(
        `Upload configuration incomplete. Missing: ${configValidation.missingVars.join(', ')}`,
        500
      );
    }

    const { fileName, contentType, folder, expiresIn } = request.body!;

    const options: PresignedUrlOptions = {
      fileName,
      contentType,
      folder,
      expiresIn,
    };

    const result = await generatePresignedUrl(options);

    return sendSuccess({
      message: 'Presigned URL generated successfully',
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
      fileUrl: result.fileUrl,
      expiresIn,
    });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return sendError(
      error instanceof Error ? error.message : 'Failed to generate presigned URL',
      500
    );
  }
});

/**
 * DELETE - Delete uploaded file
 */
const deleteHandler = createApiRoute({
  requireAuth: true,
  validation: {
    body: deleteFileSchema,
  },
});

export const DELETE = deleteHandler(async (request: NextRequest) => {
  try {
    const { fileKey } = request.body!;

    // TODO: Add permission check - users should only be able to delete their own files
    // or files they have permission to manage

    const success = await deleteFileFromS3(fileKey);

    if (!success) {
      return sendError('Failed to delete file', 500);
    }

    return sendSuccess({
      message: 'File deleted successfully',
      fileKey,
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return sendError(
      error instanceof Error ? error.message : 'Failed to delete file',
      500
    );
  }
});

// =============================================================================
// ADDITIONAL ENDPOINTS
// =============================================================================

/**
 * GET - Get upload configuration and limits
 */
const getHandler = createApiRoute({
  requireAuth: true,
});

export const GET = getHandler(async () => {
  try {
    const configValidation = validateUploadConfig();
    
    return sendSuccess({
      config: {
        maxFileSizes: {
          image: '10 MB',
          video: '500 MB', 
          document: '50 MB',
          audio: '100 MB',
        },
        allowedTypes: {
          images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
          documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        },
        folders: ['profiles', 'courses', 'lessons', 'exams', 'documents', 'temp'],
        isConfigured: configValidation.isValid,
        missingConfig: configValidation.missingVars,
      },
    });

  } catch (error) {
    console.error('Config retrieval error:', error);
    return sendError('Failed to retrieve upload configuration', 500);
  }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * PATCH - Validate file before upload
 */
const patchHandler = createApiRoute({
  requireAuth: true,
});

export const PATCH = patchHandler(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file || !category) {
      return sendError('File and category are required', 400);
    }

    if (!['image', 'video', 'document', 'audio'].includes(category)) {
      return sendError('Invalid category', 400);
    }

    // Validate file without uploading
    const { validateFile } = await import('@/lib/upload');
    const validation = validateFile(file, category as any);

    if (!validation.isValid) {
      return sendError(validation.error || 'File validation failed', 400);
    }

    return sendSuccess({
      message: 'File validation successful',
      fileInfo: validation.fileInfo,
      isValid: true,
    });

  } catch (error) {
    console.error('File validation error:', error);
    return sendError('File validation failed', 500);
  }
});