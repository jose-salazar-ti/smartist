import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "designs"; // "vouchers" | "designs" | "products" | "models"

    if (!file) {
      return NextResponse.json({ error: "No se encontró ningún archivo para cargar." }, { status: 400 });
    }

    // 1. File size validation (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo permitido (10MB)." }, { status: 400 });
    }

    // 2. MIME type validation based on target type
    const allowedImageMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
    const allowedDocMimeTypes = ["application/pdf"];
    const allowedAudioMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-m4a", "audio/mp4", "audio/ogg", "audio/quicktime", "video/mp4"];

    if (type === "vouchers") {
      // Allow only images (including HEIC/HEIF for mobile devices)
      const isMobileImage = file.type.startsWith("image/") || 
                            file.name.toLowerCase().endsWith(".heic") || 
                            file.name.toLowerCase().endsWith(".heif");

      const isValid = allowedImageMimeTypes.includes(file.type) || isMobileImage;
      if (!isValid) {
        return NextResponse.json({ error: "Formato de comprobante no válido. Use PNG, JPG, JPEG, WEBP o HEIC." }, { status: 400 });
      }
    } else if (type === "designs" || type === "disenos-personalizados") {
      const isValid = allowedImageMimeTypes.includes(file.type);
      if (!isValid) {
        return NextResponse.json({ error: "Formato de diseño no válido. Solo se permiten imágenes (PNG, JPG, WEBP)." }, { status: 400 });
      }
    } else if (type === "audio") {
      const isValid = allowedAudioMimeTypes.includes(file.type) || 
                      file.name.toLowerCase().endsWith(".mp3") || 
                      file.name.toLowerCase().endsWith(".m4a") || 
                      file.name.toLowerCase().endsWith(".wav") || 
                      file.name.toLowerCase().endsWith(".mp4") ||
                      file.name.toLowerCase().endsWith(".mov");
      if (!isValid) {
        return NextResponse.json({ error: "Formato de audio no válido. Solo se permiten MP3, WAV o M4A." }, { status: 400 });
      }
    }

    // 3. Authorization check for admin assets (products, models)
    if (type === "products" || type === "productos" || type === "models") {
      const auth = await verifyAdmin();
      if (!auth.isAdmin) {
        return NextResponse.json(
          { error: "Acceso denegado. Se requieren privilegios de administrador para subir recursos del catálogo." },
          { status: 403 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. File signature integrity check (anti-vulnerability validation)
    if (!isValidFileSignature(buffer, file.name)) {
      return NextResponse.json(
        { error: "La firma digital del archivo no coincide con un formato de imagen válido. El archivo podría estar dañado o alterado." },
        { status: 400 }
      );
    }

    // Determine the target bucket in Supabase Storage
    let bucketName = "productos";
    if (type === "vouchers") {
      bucketName = "vouchers";
    } else if (type === "designs" || type === "disenos-personalizados" || type === "audio") {
      bucketName = "disenos-personalizados";
    } else if (type === "products" || type === "productos") {
      bucketName = "productos";
    }

    // Generate unique file name
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${timestamp}_${safeName}`;

    // Determine content type
    let contentType = file.type;
    if (file.name.toLowerCase().endsWith(".heic")) {
      contentType = "image/heic";
    } else if (file.name.toLowerCase().endsWith(".heif")) {
      contentType = "image/heif";
    } else if (!contentType) {
      if (file.name.toLowerCase().endsWith(".png")) contentType = "image/png";
      else if (file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
      else if (file.name.toLowerCase().endsWith(".webp")) contentType = "image/webp";
      else if (file.name.toLowerCase().endsWith(".gif")) contentType = "image/gif";
      else if (file.name.toLowerCase().endsWith(".svg")) contentType = "image/svg+xml";
    }

    // Upload to Supabase Storage
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: contentType || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return NextResponse.json(
        { error: `Error al subir a almacenamiento: ${error.message}` },
        { status: 500 }
      );
    }

    // Return the public-accessible web URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;
    
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Error interno al guardar el archivo." }, { status: 500 });
  }
}

// Security Helper: Checks file headers (magic bytes) to ensure authenticity and prevent executable uploads
function isValidFileSignature(buffer: Buffer, filename: string): boolean {
  const hex = buffer.toString("hex", 0, 16).toLowerCase();
  const name = filename.toLowerCase();

  // PNG: 89504e47...
  if (hex.startsWith("89504e47")) return true;

  // JPEG/JPG: ffd8ff
  if (hex.startsWith("ffd8ff")) return true;

  // WEBP: RIFF (52494646) at start, WEBP (57454250) at offset 8
  if (hex.startsWith("52494646") && hex.substring(16, 24) === "57454250") return true;

  // GIF: 47494638
  if (hex.startsWith("47494638")) return true;

  // HEIC/HEIF: "ftyp" at offset 4 (66747970), followed by "heic", "heif", "mif1", "msf1" etc.
  const isHeic = hex.substring(8, 16) === "66747970" && 
                 (hex.substring(16, 24) === "68656963" || 
                  hex.substring(16, 24) === "68656966" ||
                  hex.substring(16, 24) === "6d696631" ||
                  hex.substring(16, 24) === "6d736631");
  if (isHeic) return true;

  // SVG / XML / TXT: checks if file starts with '<' and contains SVG structure
  const firstChar = buffer.toString("utf8", 0, 1).trim();
  if (firstChar === "<" && (name.endsWith(".svg") || name.endsWith(".xml"))) {
    const content = buffer.toString("utf8", 0, 2000).toLowerCase();
    if (content.includes("<svg") || content.includes("<?xml")) {
      return true;
    }
  }

  // MP3 Audio: ID3 (494433) or frames sync (fffb, fffa)
  if (hex.startsWith("494433") || hex.startsWith("fffb") || hex.startsWith("fffa")) return true;

  // WAV Audio: RIFF (52494646) and WAVE (57415645)
  if (hex.startsWith("52494646") && hex.substring(16, 24) === "57415645") return true;

  // M4A / MP4 / QuickTime Audio: ftyp (66747970) at offset 4
  if (hex.substring(8, 16) === "66747970" && (name.endsWith(".m4a") || name.endsWith(".mp4") || name.endsWith(".mov"))) return true;

  return false;
}

