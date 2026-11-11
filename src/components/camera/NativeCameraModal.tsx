'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface CapturedPhoto {
  dataUrl: string;
  sizeKb: number;
  isDirectCapture: boolean;
}

interface NativeCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: CapturedPhoto) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// Client-side Canvas Image Compression (< 500KB target)
export function compressCanvas(
  source: HTMLImageElement | HTMLVideoElement,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.78
): { dataUrl: string; sizeKb: number } {
  const srcWidth = 'videoWidth' in source ? source.videoWidth || 1280 : source.naturalWidth || source.width || 1280;
  const srcHeight = 'videoHeight' in source ? source.videoHeight || 720 : source.naturalHeight || source.height || 720;

  const isPortrait = srcHeight > srcWidth;
  const boundW = isPortrait ? maxHeight : maxWidth;
  const boundH = isPortrait ? maxWidth : maxHeight;
  const scale = Math.min(boundW / srcWidth, boundH / srcHeight, 1);
  const targetW = Math.max(1, Math.round(srcWidth * scale));
  const targetH = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context tidak tersedia');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetW, targetH);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64Content = dataUrl.split(',')[1] || '';
  const sizeBytes = Math.round((base64Content.length * 3) / 4);
  const sizeKb = Math.max(1, Math.round(sizeBytes / 1024));

  return { dataUrl, sizeKb };
}

export function compressFile(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.78
): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = compressCanvas(img, maxWidth, maxHeight, quality);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Gagal memuat berkas gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsDataURL(file);
  });
}

function triggerHaptic(type: 'shutter' | 'light' | 'success' = 'shutter') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'shutter') navigator.vibrate?.(50);
      else if (type === 'light') navigator.vibrate?.(20);
      else if (type === 'success') navigator.vibrate?.([30, 40, 30]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

export default function NativeCameraModal({
  isOpen,
  onClose,
  onCapture,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.78,
}: NativeCameraModalProps) {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Preview state after capture
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);

  // Stop all media tracks immediately
  const stopTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop error
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Do not modify state here to avoid setState in effect
  }, []);

  // Effect to manage stream lifecycle when modal opens/closes or facingMode toggles
  useEffect(() => {
    let cancel = false;

    if (isOpen && !capturedPhoto) {
      const start = async () => {
        stopTracks();
        setCameraLoading(true);
        setCameraError(null);

        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          if (!cancel) {
            setCameraError('Peramban Anda tidak mendukung akses kamera langsung (getUserMedia). Silakan gunakan unggah foto.');
            setCameraLoading(false);
          }
          return;
        }

        try {
          const constraints: MediaStreamConstraints = {
            audio: false,
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: maxWidth },
              height: { ideal: maxHeight },
            },
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (cancel) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          mediaStreamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }

          const track = stream.getVideoTracks()[0];
          if (track && typeof track.getCapabilities === 'function') {
            const capabilities = track.getCapabilities() as { torch?: boolean };
            if (!cancel) setTorchSupported(Boolean(capabilities?.torch));
          } else {
            if (!cancel) setTorchSupported(false);
          }

          if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoInputs = devices.filter((d) => d.kind === 'videoinput');
              if (!cancel) setHasMultipleCameras(videoInputs.length > 1);
            } catch {
              if (!cancel) setHasMultipleCameras(true);
            }
          }

          if (!cancel) {
            setCameraLoading(false);
          }
        } catch (err: unknown) {
          if (cancel) return;
          console.warn('[Camera error]', err);
          let errorMsg = 'Tidak dapat mengakses kamera perangkat.';
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              errorMsg = 'Izin kamera ditolak oleh peramban. Berikan izin kamera atau gunakan tombol galeri/kamera bawaan di bawah.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
              errorMsg = 'Kamera tidak ditemukan pada perangkat Anda.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
              errorMsg = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba kembali.';
            }
          }
          setCameraError(errorMsg);
          setCameraLoading(false);
        }
      };

      start();
    } else {
      stopTracks();
    }

    return () => {
      cancel = true;
      stopTracks();
    };
  }, [isOpen, facingMode, capturedPhoto, retryCount, maxWidth, maxHeight, stopTracks]);

  // Toggle Torch
  async function handleToggleTorch() {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchOn;
      // Use advanced constraint for torch
      await (track as MediaStreamTrack & {
        applyConstraints: (c: Record<string, unknown>) => Promise<void>;
      }).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
      triggerHaptic('light');
    } catch (e) {
      console.warn('Torch toggle failed', e);
    }
  }

  // Toggle Camera Front / Back
  function handleFlipCamera() {
    triggerHaptic('light');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }

  // Snap Photo
  function handleShutter() {
    if (!videoRef.current || isProcessing) return;
    triggerHaptic('shutter');
    setIsProcessing(true);

    try {
      const { dataUrl, sizeKb } = compressCanvas(videoRef.current, maxWidth, maxHeight, quality);
      setCapturedPhoto({
        dataUrl,
        sizeKb,
        isDirectCapture: true,
      });
      // Stop tracks while previewing photo
      stopTracks();
    } catch (err) {
      console.error('Failed to capture frame', err);
      alert('Gagal mengambil frame foto dari sensor kamera.');
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Gallery or native camera file pick
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    setIsProcessing(true);

    try {
      const { dataUrl, sizeKb } = await compressFile(file, maxWidth, maxHeight, quality);
      setCapturedPhoto({
        dataUrl,
        sizeKb,
        isDirectCapture: false,
      });
      stopTracks();
    } catch {
      alert('Gagal memproses berkas gambar dari galeri.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (fallbackInputRef.current) fallbackInputRef.current.value = '';
    }
  }

  // Accept Captured Photo
  function handleAcceptPhoto() {
    if (!capturedPhoto) return;
    triggerHaptic('success');
    onCapture(capturedPhoto);
    setCapturedPhoto(null);
    onClose();
  }

  // Retake Photo
  function handleRetakePhoto() {
    triggerHaptic('light');
    setCapturedPhoto(null);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none touch-none overscroll-none"
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      {/* ── 1. Top Controls Overlay ────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1.25rem)] pb-4 bg-linear-to-b from-black/80 via-black/40 to-transparent">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            stopTracks();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all"
          aria-label="Tutup Kamera"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Viewfinder Badge / Title */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ASPIRA CAM • HD</span>
        </div>

        {/* Flash / Torch Toggle */}
        <div className="w-10 flex justify-end">
          {torchSupported && !capturedPhoto && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/50 scale-105'
                  : 'bg-black/50 text-white/90 border-white/20 hover:bg-black/70 active:scale-95'
              }`}
              title={torchOn ? 'Matikan Senter' : 'Nyalakan Senter'}
            >
              <svg className="w-5 h-5" fill={torchOn ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Fullscreen Viewfinder Area ───────────────────────────────── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
        {capturedPhoto ? (
          /* Captured Photo Review Mode */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedPhoto.dataUrl}
              alt="Hasil Bidikan Kamera"
              className="w-full h-full object-contain sm:object-cover"
            />
            {/* Badge overlay on top of review */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-200 border border-emerald-500/40 shadow-lg">
                <span>⚡</span>
                <span>Foto Terkompresi Otomatis (~{capturedPhoto.sizeKb} KB)</span>
              </span>
            </div>
          </div>
        ) : cameraError ? (
          /* Error / Permission Denied Fallback Screen */
          <div className="px-6 py-8 text-center max-w-sm text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
              📷
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Akses Kamera Terkendala</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {cameraError}
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>📁</span> Gunakan Kamera Bawaan / Galeri
              </button>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs active:scale-95 transition-all"
              >
                Coba Akses Kamera Lagi
              </button>
            </div>

            <input
              ref={fallbackInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>
        ) : (
          /* Live Video Stream with Rule-of-Thirds Grid */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Rule of Thirds Guide Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-25 grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-white/30" />
              <div className="border-r border-white/30" />
              <div />
            </div>

            {/* Reticle Focus Indicator Center */}
            <div className="absolute w-16 h-16 rounded-lg border border-white/40 pointer-events-none opacity-60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Loading Spinner */}
            {cameraLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold tracking-wide">Membuka sensor kamera...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Bottom Control Bar ───────────────────────────────────────── */}
      <div className="relative z-20 px-6 pt-5 pb-[max(env(safe-area-inset-bottom),1.75rem)] bg-linear-to-t from-black via-black/80 to-transparent">
        {capturedPhoto ? (
          /* Review Mode Bottom Actions */
          <div className="flex items-center justify-between gap-4 max-w-sm mx-auto">
            {/* Retake Button */}
            <button
              type="button"
              onClick={handleRetakePhoto}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Ulangi</span>
            </button>

            {/* Accept / Use Photo Button */}
            <button
              type="button"
              onClick={handleAcceptPhoto}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/80 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Gunakan Foto</span>
            </button>
          </div>
        ) : (
          /* Live Camera Shutter Controls */
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Gallery Upload Icon Shortcut */}
            <div className="w-14 flex items-center justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-90 transition-all border border-white/20 flex flex-col items-center justify-center text-white"
                title="Pilih dari Galeri"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-[9px] font-bold text-white/80 mt-0.5">Galeri</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            {/* Large Native Shutter Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                disabled={cameraLoading || Boolean(cameraError) || isProcessing}
                onClick={handleShutter}
                className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 transition-transform active:scale-90 disabled:opacity-40"
                aria-label="Ambil Foto"
              >
                <div className="w-full h-full rounded-full bg-white group-active:scale-95 group-active:bg-white/80 transition-all shadow-xl" />
              </button>
            </div>

            {/* Quick Flip Camera Icon */}
            <div className="w-14 flex items-center justify-center">
              <button
                type="button"
                disabled={!hasMultipleCameras && facingMode === 'environment'}
                onClick={handleFlipCamera}
                className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 transition-all border border-white/20 flex items-center justify-center text-white disabled:opacity-30"
                title="Putar Kamera Depan/Belakang"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
