import { supabase } from "@/integrations/supabase/client";

export interface Attachment {
  id: string;
  url: string;
  mime_type: string;
  filename: string;
  size: number;
  uploaded_at: string;
  uploader_id: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

// Validation constants
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150MB

/**
 * Validate file based on type and size
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.map((t) => t.split("/")[1]).join(", ")} for images, ${ALLOWED_VIDEO_TYPES.map((t) => t.split("/")[1]).join(", ")} for videos`,
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image too large. Maximum size: 10MB (your file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video too large. Maximum size: 150MB (your file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  return { valid: true };
};

/**
 * Generate a unique attachment ID
 */
const generateAttachmentId = (): string => {
  return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Upload file to Supabase storage
 */
export const uploadFileToStorage = async (
  file: File,
  userId: string
): Promise<{ url: string; path: string } | null> => {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "file";
    const filename = `${timestamp}-${file.name}`;
    const storagePath = `users/${userId}/${filename}`;

    const { error, data } = await supabase.storage.from("media").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(storagePath);

    return { url: publicUrl, path: storagePath };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Get image dimensions
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Generate video thumbnail
 */
const generateVideoThumbnail = (file: File): Promise<{ thumbnail: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    video.onloadedmetadata = () => {
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to middle of video for thumbnail
      video.currentTime = Math.min(video.duration / 2, 5);
    };

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              thumbnail: blob,
              width: video.videoWidth,
              height: video.videoHeight,
            });
          } else {
            reject(new Error("Failed to generate thumbnail"));
          }
        },
        "image/jpeg",
        0.8
      );
    };

    video.onerror = () => {
      reject(new Error("Failed to load video"));
    };

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
  });
};

/**
 * Create attachment object from file
 */
export const createAttachmentFromFile = async (
  file: File,
  userId: string,
  uploadedUrl: string
): Promise<Attachment> => {
  const id = generateAttachmentId();
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  let dimensions: { width?: number; height?: number } = {};
  let thumbnail_url: string | undefined;

  try {
    if (isImage) {
      const imageDims = await getImageDimensions(file);
      dimensions = imageDims;
    } else if (isVideo) {
      const { thumbnail, width, height } = await generateVideoThumbnail(file);
      dimensions = { width, height };

      // Upload thumbnail
      const thumbTimestamp = Date.now();
      const thumbPath = `users/${userId}/thumb_${thumbTimestamp}_${file.name}.jpg`;
      const { error: thumbError } = await supabase.storage.from("media").upload(thumbPath, thumbnail, {
        cacheControl: "3600",
        upsert: false,
      });

      if (!thumbError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(thumbPath);
        thumbnail_url = publicUrl;
      }
    }
  } catch (error) {
    console.warn("Failed to generate dimensions/thumbnail:", error);
  }

  return {
    id,
    url: uploadedUrl,
    mime_type: file.type,
    filename: file.name,
    size: file.size,
    uploaded_at: new Date().toISOString(),
    uploader_id: userId,
    thumbnail_url,
    width: dimensions.width,
    height: dimensions.height,
  };
};

/**
 * Process and upload multiple files
 */
export const processFilesForUpload = async (files: File[], userId: string): Promise<Attachment[]> => {
  const attachments: Attachment[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      const { url } = await uploadFileToStorage(file, userId);
      const attachment = await createAttachmentFromFile(file, userId, url);
      attachments.push(attachment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${file.name}: ${errorMessage}`);
    }
  }

  if (errors.length > 0) {
    console.warn("Upload errors:", errors);
  }

  return attachments;
};

/**
 * Get preview URL for attachment (thumbnail for videos, url for images)
 */
export const getAttachmentPreviewUrl = (attachment: Attachment): string => {
  if (attachment.mime_type.startsWith("video/")) {
    return attachment.thumbnail_url || attachment.url;
  }
  return attachment.url;
};

/**
 * Check if attachment is video
 */
export const isVideoAttachment = (attachment: Attachment): boolean => {
  return attachment.mime_type.startsWith("video/");
};

/**
 * Check if attachment is image
 */
export const isImageAttachment = (attachment: Attachment): boolean => {
  return attachment.mime_type.startsWith("image/");
};
