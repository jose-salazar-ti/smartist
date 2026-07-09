import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Convierte un DataURL (Base64) a un Blob para subirlo a Storage
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Sube el diseño personalizado a Supabase Storage.
 * @param base64Image La imagen final del Canvas en Base64
 * @param fileName Nombre del archivo (ej. el ID temporal del carrito)
 * @returns La URL pública de la imagen
 */
export async function uploadCustomDesign(base64Image: string, fileName: string): Promise<string> {
  const blob = dataURLtoBlob(base64Image);
  
  const { data, error } = await supabase.storage
    .from('disenos-personalizados')
    .upload(`${fileName}.png`, blob, {
      contentType: 'image/png',
    });

  if (error) {
    console.error('Error subiendo diseño a Supabase:', error);
    throw new Error('No se pudo subir el diseño');
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('disenos-personalizados')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
