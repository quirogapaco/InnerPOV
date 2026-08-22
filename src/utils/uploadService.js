import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

/**
 * Comprime una imagen usando browser-image-compression
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1.5, // Tamaño máximo
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    throw error;
  }
}

/**
 * Obtiene la URL prefirmada desde la Edge Function de Supabase
 */
export async function getPresignedUrl(fileName, fileType, eventId) {
  try {
    const { data, error } = await supabase.functions.invoke('r2-presign', {
      body: { fileName, fileType, eventId },
    });

    if (error) throw error;
    if (!data?.url || !data?.key) throw new Error('No se recibió la URL o el Key de R2');

    return { url: data.url, key: data.key };
  } catch (error) {
    console.error('Error obteniendo presigned URL:', error);
    throw error;
  }
}

/**
 * Sube el archivo a Cloudflare R2 usando la URL prefirmada
 */
export async function uploadToR2(file, presignedUrl) {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Error subiendo a R2: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error subiendo el archivo:', error);
    throw error;
  }
}

/**
 * Flujo completo: Comprimir, obtener URL, subir y devolver los datos de la imagen
 */
export async function processAndUploadImage(file, eventId) {
    // 1. Comprimir
    const compressedFile = await compressImage(file);
    
    // 2. Obtener URL prefirmada
    const { url: presignedUrl, key: objectKey } = await getPresignedUrl(
        compressedFile.name || 'image.jpg', 
        compressedFile.type, 
        eventId
    );
    
    // 3. Subir a R2
    await uploadToR2(compressedFile, presignedUrl);
    
    // 4. Retornar los datos necesarios para guardar en la BD
    const r2PublicDomain = import.meta.env.VITE_R2_PUBLIC_URL || 'https://tu-dominio-r2.com'; // Por definir en el .env
    const publicUrl = `${r2PublicDomain}/${objectKey}`;
    
    return {
        publicUrl,
        filePath: objectKey,
        fileType: 'image',
        originalFile: compressedFile
    };
}
