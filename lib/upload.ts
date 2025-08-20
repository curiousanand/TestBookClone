/**
 * File Upload Utilities
 * 
 * Comprehensive file upload system with AWS S3 integration,
 * image optimization, file validation, and progress tracking.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { lookup } from 'mime-types';
import { z } from 'zod';

// =============================================================================
// CONFIGURATION
// =============================================================================

// AWS S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const s3Client = new S3Client(s3Config);

// Storage Configuration
export const UPLOAD_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET || 'testbook-clone-uploads',
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    document: 50 * 1024 * 1024, // 50MB
    audio: 100 * 1024 * 1024, // 100MB
  },
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  },
  imageOptimization: {
    thumbnail: { width: 300, height: 300, quality: 80 },
    medium: { width: 800, height: 600, quality: 85 },
    large: { width: 1920, height: 1080, quality: 90 },
  },
  folders: {
    profiles: 'profiles/',
    courses: 'courses/',
    lessons: 'lessons/',
    exams: 'exams/',
    documents: 'documents/',
    temp: 'temp/',
  },
} as const;

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type FileCategory = 'image' | 'video' | 'document' | 'audio';
export type ImageSize = 'thumbnail' | 'medium' | 'large' | 'original';
export type UploadFolder = keyof typeof UPLOAD_CONFIG.folders;

export interface FileUploadOptions {
  category: FileCategory;
  folder: UploadFolder;
  userId?: string;
  generateThumbnails?: boolean;
  customPath?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  thumbnails?: Record<ImageSize, string>;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, string>;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

export interface PresignedUrlOptions {
  folder: UploadFolder;
  fileName: string;
  contentType: string;
  expiresIn?: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const fileUploadSchema = z.object({
  category: z.enum(['image', 'video', 'document', 'audio']),
  folder: z.enum(['profiles', 'courses', 'lessons', 'exams', 'documents', 'temp']),
  userId: z.string().optional(),
  generateThumbnails: z.boolean().default(false),
  customPath: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

// =============================================================================
// FILE VALIDATION UTILITIES
// =============================================================================

/**
 * Validate file based on type, size, and category
 */
export function validateFile(file: File, category: FileCategory): FileValidationResult {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || lookup(file.name) || '';

    // Check if file type is allowed
    const allowedTypes = UPLOAD_CONFIG.allowedTypes[`${category}s` as keyof typeof UPLOAD_CONFIG.allowedTypes];
    if (!allowedTypes.includes(mimeType)) {
      return {
        isValid: false,
        error: `File type ${mimeType} is not allowed for ${category} uploads. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    const maxSize = UPLOAD_CONFIG.maxFileSize[category];
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size ${Math.round(file.size / (1024 * 1024))}MB exceeds maximum allowed size of ${maxSizeMB}MB for ${category} files`,
      };
    }

    return {
      isValid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: mimeType,
        extension: fileExtension,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate unique file name with timestamp and random string
 */
export function generateFileName(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9-_]/g, '');
  
  const userPrefix = userId ? `${userId}-` : '';
  return `${userPrefix}${baseName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Generate S3 object key with proper folder structure
 */
export function generateFileKey(options: FileUploadOptions, fileName: string): string {
  const { folder, customPath, userId } = options;
  const folderPath = UPLOAD_CONFIG.folders[folder];
  
  if (customPath) {
    return `${folderPath}${customPath}/${fileName}`;
  }
  
  if (userId) {
    return `${folderPath}${userId}/${fileName}`;
  }
  
  return `${folderPath}${fileName}`;
}

// =============================================================================
// IMAGE OPTIMIZATION
// =============================================================================

/**
 * Optimize and resize image using Sharp
 */
export async function optimizeImage(
  buffer: Buffer,
  size: ImageSize = 'original',
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Buffer> {
  try {
    let sharpInstance = sharp(buffer);

    // Apply size constraints
    if (size !== 'original') {
      const config = UPLOAD_CONFIG.imageOptimization[size];
      sharpInstance = sharpInstance.resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format and quality
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: UPLOAD_CONFIG.imageOptimization[size]?.quality || 90,
          progressive: true 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: UPLOAD_CONFIG.imageOptimization[size]?.quality || 90,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: UPLOAD_CONFIG.imageOptimization[size]?.quality || 90 
        });
        break;
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple image sizes for responsive loading
 */
export async function generateImageThumbnails(
  buffer: Buffer,
  baseKey: string,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Record<ImageSize, string>> {
  const thumbnails: Record<ImageSize, string> = {} as Record<ImageSize, string>;
  const sizes: ImageSize[] = ['thumbnail', 'medium', 'large'];

  try {
    // Upload original
    thumbnails.original = await uploadBufferToS3(buffer, baseKey);

    // Generate and upload thumbnails
    for (const size of sizes) {
      const optimizedBuffer = await optimizeImage(buffer, size, format);
      const thumbnailKey = baseKey.replace(/\.[^.]+$/, `-${size}.$1`);
      thumbnails[size] = await uploadBufferToS3(optimizedBuffer, thumbnailKey);
    }

    return thumbnails;
  } catch (error) {
    throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// S3 OPERATIONS
// =============================================================================

/**
 * Upload buffer to S3
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType?: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: UPLOAD_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      Metadata: metadata,
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);
    return `https://${UPLOAD_CONFIG.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;
  } catch (error) {
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file to S3 with optimization
 */
export async function uploadFileToS3(
  file: File,
  options: FileUploadOptions
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, options.category);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        fileKey: '',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    }

    // Generate file names and keys
    const fileName = generateFileName(file.name, options.userId);
    const fileKey = generateFileKey(options, fileName);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let fileUrl: string;
    let thumbnails: Record<ImageSize, string> | undefined;

    // Handle image uploads with optimization
    if (options.category === 'image' && options.generateThumbnails) {
      thumbnails = await generateImageThumbnails(buffer, fileKey, 'jpeg');
      fileUrl = thumbnails.original;
    } else {
      // Direct upload for non-image files or single image uploads
      fileUrl = await uploadBufferToS3(buffer, fileKey, file.type, options.metadata);
    }

    return {
      success: true,
      fileUrl,
      thumbnails,
      fileKey,
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      metadata: options.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      fileKey: '',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: UPLOAD_CONFIG.bucket,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete failed:', error);
    return false;
  }
}

/**
 * Generate presigned URL for direct upload
 */
export async function generatePresignedUrl(
  options: PresignedUrlOptions
): Promise<PresignedUrlResult> {
  try {
    const fileName = generateFileName(options.fileName);
    const fileKey = `${UPLOAD_CONFIG.folders[options.folder]}${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: UPLOAD_CONFIG.bucket,
      Key: fileKey,
      ContentType: options.contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: options.expiresIn || 3600, // 1 hour default
    });

    const fileUrl = `https://${UPLOAD_CONFIG.bucket}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
    };
  } catch (error) {
    throw new Error(`Presigned URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get signed download URL for private files
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: UPLOAD_CONFIG.bucket,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new Error(`Signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file category from MIME type
 */
export function getFileCategoryFromMimeType(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return UPLOAD_CONFIG.allowedTypes.images.includes(mimeType);
}

/**
 * Check if file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return UPLOAD_CONFIG.allowedTypes.videos.includes(mimeType);
}

/**
 * Validate environment variables
 */
export function validateUploadConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export const UPLOAD_ERRORS = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  OPTIMIZATION_FAILED: 'OPTIMIZATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  S3_CONFIG_MISSING: 'S3_CONFIG_MISSING',
} as const;

export type UploadErrorCode = typeof UPLOAD_ERRORS[keyof typeof UPLOAD_ERRORS];