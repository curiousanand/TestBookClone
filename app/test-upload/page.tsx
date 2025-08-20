/**
 * File Upload Test Page
 * 
 * Test page to demonstrate file upload functionality
 * including FileUpload and ImageUpload components.
 */

'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { type ImageUploadResult } from '@/components/ui/ImageUpload';
import { type UploadedFile } from '@/components/ui/FileUpload';

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">File Upload System Test</h1>
          <p className="mt-2 text-gray-600">
            Test the file upload functionality with different file types and configurations.
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic File Upload</h2>
            <p className="text-gray-600 mb-4">
              Upload any type of file with drag & drop support and progress tracking.
            </p>
            
            <FileUpload
              category="document"
              folder="temp"
              multiple={true}
              maxFiles={5}
              onFilesChange={setUploadedFiles}
              onUploadComplete={(fileId, result) => {
                console.log('File uploaded:', fileId, result);
              }}
              onUploadError={(fileId, error) => {
                console.error('Upload error:', fileId, error);
              }}
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{file.file.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          file.status === 'completed' ? 'bg-green-100 text-green-800' :
                          file.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      {file.url && (
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Upload - Card Style */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Upload - Card Style</h2>
            <p className="text-gray-600 mb-4">
              Upload images with automatic optimization and thumbnail generation.
            </p>
            
            <ImageUpload
              folder="temp"
              generateThumbnails={true}
              autoOptimize={true}
              uploadAreaStyle="card"
              placeholder="Upload course thumbnail"
              onUploadComplete={(result) => {
                console.log('Image uploaded:', result);
                setUploadedImages(prev => [...prev, result]);
              }}
              onUploadError={(error) => {
                console.error('Image upload error:', error);
              }}
            />
          </div>

          {/* Image Upload - Circle Style (Profile Picture) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture Upload</h2>
            <p className="text-gray-600 mb-4">
              Circular image upload for profile pictures with 1:1 aspect ratio.
            </p>
            
            <div className="flex justify-center">
              <ImageUpload
                folder="profiles"
                generateThumbnails={true}
                autoOptimize={true}
                uploadAreaStyle="circle"
                aspectRatio={1}
                maxWidth={400}
                maxHeight={400}
                placeholder="Upload profile picture"
                className="w-32 h-32"
                onUploadComplete={(result) => {
                  console.log('Profile picture uploaded:', result);
                }}
              />
            </div>
          </div>

          {/* Compact File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Compact File Upload</h2>
            <p className="text-gray-600 mb-4">
              Compact upload button for forms and tight spaces.
            </p>
            
            <FileUpload
              category="document"
              folder="documents"
              compact={true}
              multiple={false}
              labels={{
                browse: "Choose Document"
              }}
            />
          </div>

          {/* Video Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Upload</h2>
            <p className="text-gray-600 mb-4">
              Upload video files for lessons and courses.
            </p>
            
            <FileUpload
              category="video"
              folder="lessons"
              multiple={false}
              acceptedTypes={['video/mp4', 'video/webm']}
              onUploadComplete={(fileId, result) => {
                console.log('Video uploaded:', fileId, result);
              }}
            />
          </div>

          {/* Banner Image Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Image Upload</h2>
            <p className="text-gray-600 mb-4">
              Wide banner image upload with 3:1 aspect ratio.
            </p>
            
            <ImageUpload
              folder="courses"
              generateThumbnails={true}
              uploadAreaStyle="banner"
              aspectRatio={3}
              placeholder="Upload course banner"
              onUploadComplete={(result) => {
                console.log('Banner uploaded:', result);
              }}
            />
          </div>

          {/* Upload Results */}
          {uploadedImages.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <img 
                      src={image.original} 
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <div className="text-sm text-gray-600">
                      <p>Size: {image.metadata.width} × {image.metadata.height}</p>
                      <p>Format: {image.metadata.format}</p>
                      <p>File Size: {Math.round(image.metadata.size / 1024)} KB</p>
                    </div>
                    {image.thumbnails && (
                      <div className="mt-2 flex gap-1">
                        <a 
                          href={image.thumbnails.thumbnail} 
                          target="_blank"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Thumb
                        </a>
                        <a 
                          href={image.thumbnails.medium} 
                          target="_blank"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Medium
                        </a>
                        <a 
                          href={image.thumbnails.large} 
                          target="_blank"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Large
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Info */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Configuration</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Note:</strong> This test page requires AWS S3 configuration.</p>
              <p>Required environment variables:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>AWS_ACCESS_KEY_ID</li>
                <li>AWS_SECRET_ACCESS_KEY</li>
                <li>AWS_REGION</li>
                <li>AWS_S3_BUCKET</li>
              </ul>
              <p className="mt-3">
                Without proper AWS configuration, uploads will fail. 
                Check the browser console for detailed error messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}