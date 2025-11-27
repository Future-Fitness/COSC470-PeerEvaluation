import cloudinary from './cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
}

/**
 * Upload a file stream to Cloudinary
 * @param fileStream - The readable stream of the file
 * @param folder - The folder path in Cloudinary
 * @param publicId - The public ID for the file
 * @returns Upload result with URL and metadata
 */
export async function uploadToCloudinary(
  fileStream: NodeJS.ReadableStream,
  folder: string,
  publicId: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: publicId,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
          });
        } else {
          reject(new Error('Cloudinary upload failed: No result returned'));
        }
      }
    );

    fileStream.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
}

/**
 * Generate a signed URL for secure file access
 * @param publicId - The public ID of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export function generateSignedUrl(publicId: string, expiresIn: number = 3600): string {
  const timestamp = Math.round(Date.now() / 1000) + expiresIn;
  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: timestamp,
  });
}
