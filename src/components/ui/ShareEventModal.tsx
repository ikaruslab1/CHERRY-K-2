'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Copy, Check, QrCode, ImageDown, Link2 } from 'lucide-react';
import { Conference } from '@/types';

interface ShareEventModalProps {
  conference: Conference;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareEventModal({ conference, isOpen, onClose }: ShareEventModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Build the shareable URL for this specific conference
  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login?event=${conference.id}`
    : `/login?event=${conference.id}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = eventUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [eventUrl]);

  // Download just the QR code PNG from the canvas
  const handleDownloadQR = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#share-qr-canvas canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${conference.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }, [conference.title]);

  // Download the full card (QR + event name) using native Canvas composition
  const handleDownloadCard = useCallback(async () => {
    setDownloadingCard(true);
    try {
      const qrCanvas = document.querySelector<HTMLCanvasElement>('#share-qr-canvas canvas');
      if (!qrCanvas) return;

      const CARD_W = 800;
      const CARD_H = 800;
      const PADDING = 60;
      const QR_SIZE = 380;

      const canvas = document.createElement('canvas');
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background — clean white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      // Accent top bar
      ctx.fillStyle = '#DBF227';
      ctx.fillRect(0, 0, CARD_W, 12);

      // Draw QR centered
      const qrX = (CARD_W - QR_SIZE) / 2;
      const qrY = PADDING + 40;
      ctx.drawImage(qrCanvas, qrX, qrY, QR_SIZE, QR_SIZE);

      // Subtle QR border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8);

      // Conference title
      const titleY = qrY + QR_SIZE + 44;
      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';

      // Auto-size font based on title length
      const maxWidth = CARD_W - PADDING * 2;
      let fontSize = 36;
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(conference.title).width > maxWidth && fontSize > 18) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      }

      // Word wrap title
      const words = conference.title.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = fontSize * 1.3;
      lines.forEach((line, i) => {
        ctx.fillText(line, CARD_W / 2, titleY + i * lineHeight);
      });

      // Instruction text
      const subtitleY = titleY + lines.length * lineHeight + 24;
      ctx.fillStyle = '#6b7280';
      ctx.font = `500 18px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Escanea este código QR para acceder al evento', CARD_W / 2, subtitleY);

      // Bottom bar
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, CARD_H - 48, CARD_W, 48);
      ctx.fillStyle = '#DBF227';
      ctx.font = `bold 14px system-ui, -apple-system, sans-serif`;
      ctx.fillText('Cherry-K-2 · Plataforma de Gestión Académica', CARD_W / 2, CARD_H - 18);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `evento-${conference.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    } finally {
      setDownloadingCard(false);
    }
  }, [conference.title]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DBF227] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-[#111]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 font-syne tracking-tight">
                    Compartir Evento
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{conference.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* QR + Name Preview Card */}
            <div className="p-6 space-y-5">
              {/* Shareable card preview */}
              <div
                ref={cardRef}
                className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                {/* Accent top stripe */}
                <div className="h-2 bg-[#DBF227]" />

                {/* QR Code centered */}
                <div id="share-qr-canvas" className="flex flex-col items-center gap-4 px-6 py-8">
                  <div className="p-3 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <QRCodeCanvas
                      value={eventUrl}
                      size={200}
                      level="M"
                      marginSize={1}
                      fgColor="#111827"
                      bgColor="#ffffff"
                    />
                  </div>

                  {/* Event name */}
                  <div className="text-center space-y-1 max-w-[260px]">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                      Escanea para acceder
                    </p>
                    <h4 className="text-base font-bold text-gray-900 font-syne leading-tight text-balance">
                      {conference.title}
                    </h4>
                  </div>
                </div>

                {/* Bottom brand bar */}
                <div className="px-4 py-2.5 bg-gray-900 flex justify-center">
                  <span className="text-[10px] font-mono font-bold text-[#DBF227] tracking-widest uppercase">
                    Cherry-K-2 · Plataforma Académica
                  </span>
                </div>
              </div>

              {/* URL Preview */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-mono truncate flex-1">{eventUrl}</span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                {/* Download full card */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDownloadCard}
                  disabled={downloadingCard}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#DBF227] transition-all group disabled:opacity-60"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#DBF227] flex items-center justify-center transition-colors">
                    <ImageDown className="w-4 h-4 text-gray-600 group-hover:text-black" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight text-center">
                    {downloadingCard ? 'Guardando…' : 'Guardar tarjeta'}
                  </span>
                </motion.button>

                {/* Download QR only */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDownloadQR}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#DBF227] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#DBF227] flex items-center justify-center transition-colors">
                    <QrCode className="w-4 h-4 text-gray-600 group-hover:text-black" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-tight text-center">
                    Guardar QR
                  </span>
                </motion.button>

                {/* Copy link */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#DBF227] transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-[#DBF227]'}`}>
                    {copied
                      ? <Check className="w-4 h-4 text-green-600" />
                      : <Copy className="w-4 h-4 text-gray-600 group-hover:text-black" />
                    }
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight text-center transition-colors ${copied ? 'text-green-600' : 'text-gray-600'}`}>
                    {copied ? '¡Copiado!' : 'Copiar enlace'}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
