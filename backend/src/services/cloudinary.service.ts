import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return (
    name &&
    name !== 'your-cloudinary-cloud-name' &&
    key &&
    key !== 'your-cloudinary-api-key' &&
    secret &&
    secret !== 'your-cloudinary-api-secret'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage successfully configured.');
} else {
  console.warn('Cloudinary config keys are missing or placeholders. Using mock image upload fallback.');
}

export class CloudinaryService {
  /**
   * Uploads a base64 image string to Cloudinary.
   * If Cloudinary is not configured, it returns a mockup Unsplash category image URL.
   */
  static async uploadImage(base64Image: string, folder: string = 'civiclink'): Promise<string> {
    if (!isCloudinaryConfigured()) {
      // Mock Upload Fallback: return a realistic mockup image matching typical category
      const mockImages = [
        'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600', // Roads
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600', // Water
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600', // Electricity
        'https://images.unsplash.com/photo-1616979266853-9307bdf10e6e?auto=format&fit=crop&q=80&w=600', // Sanitation
      ];
      const randomIndex = Math.floor(Math.random() * mockImages.length);
      return mockImages[randomIndex];
    }

    try {
      // If it's a data URL, upload it directly. If it's already a http link, return it.
      if (base64Image.startsWith('http')) {
        return base64Image;
      }

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: folder,
        resource_type: 'image',
      });

      return uploadResponse.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failure:', error);
      throw new Error('Image uploading failed.');
    }
  }
}
