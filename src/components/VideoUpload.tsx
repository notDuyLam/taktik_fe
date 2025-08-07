"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { videosAPI } from "@/lib/api";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PlayIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface VideoUploadProps {
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function VideoUpload({ onClose, onUploadSuccess }: VideoUploadProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file");
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setError("Video file size must be less than 50MB");
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file for thumbnail");
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("Thumbnail file size must be less than 5MB");
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to upload videos");
      return;
    }

    if (!videoFile) {
      setError("Please select a video file");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a video title");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("video", videoFile);
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("userId", user.id);

      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Simulate upload progress (since we can't track real progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const uploadedVideo = await videosAPI.uploadVideo(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clean up object URLs
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Close modal after short delay to show completion
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      setError(error.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={uploading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Video Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            {!videoFile ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 transition-colors"
              >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Click to upload video
                </p>
                <p className="text-sm text-gray-500">
                  MP4, MOV, AVI up to 50MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview || ""}
                    className="w-full h-48 object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayIcon className="w-16 h-16 text-white opacity-70" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <p className="text-sm text-gray-600 mt-2">{videoFile.name}</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail (Optional)
            </label>
            {!thumbnailFile ? (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-400 transition-colors"
              >
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Click to upload thumbnail
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview || ""}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <p className="text-sm text-gray-600 mt-2">{thumbnailFile.name}</p>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={100}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Enter video title"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-50"
              placeholder="Describe your video"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !videoFile || !formData.title.trim()}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
}
