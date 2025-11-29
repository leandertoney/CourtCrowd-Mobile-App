import {supabase} from '../lib/supabase';
import {decode} from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

/**
 * Upload an image to Supabase Storage
 * @param localPath - Local file path
 * @param storagePath - Path in storage bucket (e.g., "avatars/user123")
 * @param bucket - Storage bucket name (default: "media")
 * @returns Object with url and path, or throws error
 */
export async function uploadImage(
  localPath: string,
  storagePath: string,
  bucket: string = 'media',
): Promise<{url: string; path: string}> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine file extension
    const fileExt = localPath.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = getContentType(fileExt);
    const fullPath = `${storagePath}.${fileExt}`;

    // Upload to Supabase Storage
    const {data, error} = await supabase.storage
      .from(bucket)
      .upload(fullPath, decode(base64), {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: {publicUrl},
    } = supabase.storage.from(bucket).getPublicUrl(fullPath);

    return {
      url: publicUrl,
      path: fullPath,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - Path in storage bucket
 * @param bucket - Storage bucket name (default: "media")
 */
export async function deleteImage(
  path: string,
  bucket: string = 'media',
): Promise<void> {
  try {
    const {error} = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
  };
  return types[ext] || 'image/jpeg';
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(path: string, bucket: string = 'media'): string {
  const {
    data: {publicUrl},
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
