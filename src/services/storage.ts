/**
 * Upload a file to the external CDN.
 * Drop-in replacement for the legacy Expo storage service — accepts standard
 * browser File / Blob objects instead of Expo ImagePicker results.
 */
export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL;
  const apiKey  = process.env.NEXT_PUBLIC_STORAGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('Storage API URL or key is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file, filename ?? 'upload');

  const res = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { url: string };
  return data.url;
}

/**
 * Compress and resize an image File before uploading.
 * Targets 1200px max-width at 0.82 JPEG quality — same as legacy mobile app.
 */
export async function compressImage(file: File): Promise<Blob> {
  const MAX_WIDTH = 1200;
  const QUALITY   = 0.82;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale  = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        QUALITY,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}
