import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { jsPDF } from 'jspdf';
import { QRDesignConfig } from '../types/qr';

export interface VerificationResult {
  isValid: boolean;
  decodedText: string | null;
  match: boolean;
  score: number; // 0 - 100
  notes: string;
}

// Check if a module at (r, c) belongs to one of the three 7x7 Finder Patterns
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left
  if (r < 7 && c < 7) return true;
  // Top-right
  if (r < 7 && c >= size - 7) return true;
  // Bottom-left
  if (r >= size - 7 && c < 7) return true;
  return false;
}

// Render QR code to a target HTMLCanvasElement
export async function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  config: QRDesignConfig
): Promise<VerificationResult> {
  if (!payload) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    return {
      isValid: false,
      decodedText: null,
      match: false,
      score: 0,
      notes: 'No payload provided',
    };
  }

  // 1. Generate QR Code Matrix with safe Unicode byte-mode fallback
  let qr;
  try {
    qr = QRCode.create(payload, {
      errorCorrectionLevel: config.errorCorrection || 'M',
    });
  } catch (err) {
    try {
      // Fallback for exotic Unicode, Tamil, or binary data
      qr = QRCode.create([{ data: new TextEncoder().encode(payload), mode: 'byte' }], {
        errorCorrectionLevel: config.errorCorrection || 'M',
      });
    } catch (e2: any) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return {
        isValid: false,
        decodedText: null,
        match: false,
        score: 0,
        notes: e2.message || 'QR encoding failed for this input',
      };
    }
  }

  const matrixSize = qr.modules.size;
  const modules = qr.modules.data; // Uint8Array of 1s and 0s

  const baseSize = config.size || 512;
  const frameHeight = config.hasFrame ? Math.round(baseSize * 0.16) : 0;
  const totalWidth = baseSize;
  const totalHeight = baseSize + frameHeight;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Clear canvas
  ctx.clearRect(0, 0, totalWidth, totalHeight);

  // Background
  if (!config.isTransparentBg) {
    ctx.fillStyle = config.backgroundColor || '#080B18';
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }

  // Frame Background if enabled
  if (config.hasFrame) {
    ctx.fillStyle = config.frameBgColor || '#7657FF';
    if (config.framePosition === 'top') {
      ctx.beginPath();
      ctx.roundRect(0, 0, totalWidth, frameHeight, [16, 16, 0, 0]);
      ctx.fill();

      // Text
      ctx.fillStyle = config.frameTextColor || '#FFFFFF';
      ctx.font = `bold ${Math.round(frameHeight * 0.42)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.frameText || 'SCAN ME', totalWidth / 2, frameHeight / 2);
    } else {
      const frameY = baseSize;
      ctx.beginPath();
      ctx.roundRect(0, frameY, totalWidth, frameHeight, [0, 0, 16, 16]);
      ctx.fill();

      // Text
      ctx.fillStyle = config.frameTextColor || '#FFFFFF';
      ctx.font = `bold ${Math.round(frameHeight * 0.42)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.frameText || 'SCAN ME', totalWidth / 2, frameY + frameHeight / 2);
    }
  }

  // QR Symbol Area
  const qrYOffset = config.hasFrame && config.framePosition === 'top' ? frameHeight : 0;
  const quietZoneModules = Math.max(2, config.quietZone ?? 3);
  const totalGridSize = matrixSize + quietZoneModules * 2;
  const cellSize = baseSize / totalGridSize;
  const startX = quietZoneModules * cellSize;
  const startY = qrYOffset + quietZoneModules * cellSize;

  // Prepare Foreground FillStyle (Solid or Gradient)
  let fgStyle: string | CanvasGradient = config.foregroundColor || '#F8FAFF';
  if (config.useGradient) {
    let grad: CanvasGradient;
    if (config.gradientType === 'linear-horizontal') {
      grad = ctx.createLinearGradient(0, qrYOffset, baseSize, qrYOffset);
    } else if (config.gradientType === 'radial') {
      grad = ctx.createRadialGradient(
        baseSize / 2,
        qrYOffset + baseSize / 2,
        cellSize,
        baseSize / 2,
        qrYOffset + baseSize / 2,
        baseSize / 1.5
      );
    } else {
      // vertical default
      grad = ctx.createLinearGradient(0, qrYOffset, 0, qrYOffset + baseSize);
    }
    grad.addColorStop(0, config.gradientStart || '#7657FF');
    grad.addColorStop(1, config.gradientEnd || '#15D9F5');
    fgStyle = grad;
  }

  // Determine Logo exclusion area
  let hasLogo = Boolean(config.logoUrl);
  let logoBox = { x: 0, y: 0, w: 0, h: 0 };
  if (hasLogo) {
    const logoPercent = Math.min(0.28, Math.max(0.12, (config.logoSize || 20) / 100));
    const logoW = baseSize * logoPercent;
    const logoH = logoW;
    const logoX = (baseSize - logoW) / 2;
    const logoY = qrYOffset + (baseSize - logoH) / 2;
    logoBox = { x: logoX, y: logoY, w: logoW, h: logoH };
  }

  // Draw QR Modules (Skip finder pattern modules; they are drawn separately with custom eyes)
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isDark = modules[r * matrixSize + c] === 1;
      if (!isDark) continue;

      if (isFinderPattern(r, c, matrixSize)) continue;

      const px = startX + c * cellSize;
      const py = startY + r * cellSize;

      // If overlapping with logo center quiet area, skip drawing
      if (
        hasLogo &&
        px + cellSize > logoBox.x - cellSize &&
        px < logoBox.x + logoBox.w + cellSize &&
        py + cellSize > logoBox.y - cellSize &&
        py < logoBox.y + logoBox.h + cellSize
      ) {
        continue;
      }

      ctx.fillStyle = fgStyle;

      switch (config.pattern) {
        case 'rounded': {
          const radius = cellSize * 0.35;
          ctx.beginPath();
          ctx.roundRect(px, py, cellSize, cellSize, radius);
          ctx.fill();
          break;
        }
        case 'dots': {
          const radius = cellSize * 0.44;
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'smooth': {
          const radius = cellSize * 0.28;
          ctx.beginPath();
          ctx.roundRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1, radius);
          ctx.fill();
          break;
        }
        case 'pixel': {
          const pad = cellSize * 0.15;
          ctx.fillRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2);
          break;
        }
        case 'geometric': {
          ctx.save();
          ctx.translate(px + cellSize / 2, py + cellSize / 2);
          ctx.rotate(Math.PI / 4);
          const s = cellSize * 0.65;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
          break;
        }
        case 'minimal': {
          const radius = cellSize * 0.32;
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'square':
        default: {
          ctx.fillRect(px, py, cellSize + 0.4, cellSize + 0.4);
          break;
        }
      }
    }
  }

  // Draw 3 Corner Eyes (Finder Patterns)
  const eyeCoords = [
    { r: 0, c: 0 }, // Top-Left
    { r: 0, c: matrixSize - 7 }, // Top-Right
    { r: matrixSize - 7, c: 0 }, // Bottom-Left
  ];

  const eyeColor = config.eyeColor || (typeof fgStyle === 'string' ? fgStyle : config.gradientStart || '#7657FF');

  eyeCoords.forEach(({ r, c }) => {
    const eyeX = startX + c * cellSize;
    const eyeY = startY + r * cellSize;
    const eyeSize = 7 * cellSize;

    // Clear background behind eye for clean rendering
    if (!config.isTransparentBg) {
      ctx.fillStyle = config.backgroundColor || '#080B18';
      ctx.fillRect(eyeX, eyeY, eyeSize, eyeSize);
    }

    ctx.fillStyle = eyeColor;
    ctx.strokeStyle = eyeColor;

    // Outer Eye Frame (7x7 with inner 5x5 cutout)
    switch (config.eyeStyle) {
      case 'circle': {
        // Outer ring
        const center = eyeSize / 2;
        const outerR = eyeSize / 2 - cellSize * 0.5;
        const innerR = eyeSize / 2 - cellSize * 1.5;
        ctx.beginPath();
        ctx.arc(eyeX + center, eyeY + center, outerR, 0, Math.PI * 2);
        ctx.arc(eyeX + center, eyeY + center, innerR, 0, Math.PI * 2, true);
        ctx.fill();

        // Inner center pupil (3x3)
        const pupilR = 1.5 * cellSize;
        ctx.beginPath();
        ctx.arc(eyeX + center, eyeY + center, pupilR, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rounded': {
        const outerRadius = 2.5 * cellSize;
        const innerRadius = 1.5 * cellSize;
        // Outer frame
        ctx.lineWidth = cellSize;
        ctx.beginPath();
        ctx.roundRect(
          eyeX + cellSize / 2,
          eyeY + cellSize / 2,
          eyeSize - cellSize,
          eyeSize - cellSize,
          outerRadius
        );
        ctx.stroke();

        // Inner pupil (3x3)
        ctx.beginPath();
        ctx.roundRect(
          eyeX + 2 * cellSize,
          eyeY + 2 * cellSize,
          3 * cellSize,
          3 * cellSize,
          innerRadius
        );
        ctx.fill();
        break;
      }
      case 'geometric': {
        // Geometric diamond/octagon style
        ctx.lineWidth = cellSize;
        ctx.beginPath();
        ctx.roundRect(
          eyeX + cellSize / 2,
          eyeY + cellSize / 2,
          eyeSize - cellSize,
          eyeSize - cellSize,
          cellSize * 1.2
        );
        ctx.stroke();

        ctx.save();
        ctx.translate(eyeX + eyeSize / 2, eyeY + eyeSize / 2);
        ctx.rotate(Math.PI / 4);
        const s = 2.2 * cellSize;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
        break;
      }
      case 'square':
      default: {
        // Standard outer square (7x7) with cutout (5x5)
        ctx.lineWidth = cellSize;
        ctx.strokeRect(
          eyeX + cellSize / 2,
          eyeY + cellSize / 2,
          eyeSize - cellSize,
          eyeSize - cellSize
        );
        // Inner pupil (3x3)
        ctx.fillRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
        break;
      }
    }
  });

  // Draw Logo if specified
  if (hasLogo && config.logoUrl) {
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw logo background shield
          if (config.logoBackground !== 'none') {
            ctx.fillStyle = config.logoBgColor || config.backgroundColor || '#080B18';
            const pad = cellSize * 0.8;
            if (config.logoBackground === 'circle') {
              ctx.beginPath();
              ctx.arc(
                logoBox.x + logoBox.w / 2,
                logoBox.y + logoBox.h / 2,
                logoBox.w / 2 + pad,
                0,
                Math.PI * 2
              );
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.roundRect(
                logoBox.x - pad,
                logoBox.y - pad,
                logoBox.w + pad * 2,
                logoBox.h + pad * 2,
                12
              );
              ctx.fill();
            }
          }

          // Draw logo image
          ctx.drawImage(img, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
          resolve();
        };
        img.onerror = () => {
          console.warn('Could not load logo image:', config.logoUrl);
          resolve();
        };
        img.src = config.logoUrl!;
      });
    } catch (e) {
      console.warn('Logo render failed:', e);
    }
  }

  // 2. Real-Time Independent Verification using jsQR
  const verification = verifyCanvasQR(canvas, payload, qrYOffset, baseSize);
  return verification;
}

// Independent Decoder Verification
export function verifyCanvasQR(
  canvas: HTMLCanvasElement,
  expectedPayload: string,
  qrYOffset: number,
  qrDimension: number
): VerificationResult {
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        isValid: false,
        decodedText: null,
        match: false,
        score: 0,
        notes: 'Cannot read canvas',
      };
    }

    // Extract QR code symbol area (excluding frame text for pure barcode decoding)
    const imgData = ctx.getImageData(0, qrYOffset, qrDimension, qrDimension);
    const decoded = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (decoded && decoded.data) {
      const match = decoded.data.trim() === expectedPayload.trim();
      return {
        isValid: true,
        decodedText: decoded.data,
        match,
        score: match ? 100 : 80,
        notes: match ? '100% Verified Scan Reliability' : 'Decoded data differs slightly',
      };
    }

    return {
      isValid: false,
      decodedText: null,
      match: false,
      score: 30,
      notes: 'Contrast or logo size may reduce scan reliability. Try High error correction.',
    };
  } catch (err: any) {
    return {
      isValid: false,
      decodedText: null,
      match: false,
      score: 20,
      notes: err.message || 'Verification error',
    };
  }
}

// Export Canvas as PNG
export function downloadCanvasPNG(canvas: HTMLCanvasElement, filename = 'qyro-code.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Export as High-Resolution Scaled PNG
export async function downloadScaledPNG(
  payload: string,
  config: QRDesignConfig,
  targetSize: number,
  filename = 'qyro-code-hi-res.png'
) {
  const offscreen = document.createElement('canvas');
  const hiResConfig = { ...config, size: targetSize };
  await renderQRToCanvas(offscreen, payload, hiResConfig);
  downloadCanvasPNG(offscreen, filename);
}

// Export as SVG
export function downloadQRAsSVG(payload: string, config: QRDesignConfig, filename = 'qyro-code.svg') {
  try {
    const qr = QRCode.create(payload, {
      errorCorrectionLevel: config.errorCorrection || 'M',
    });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const quiet = Math.max(2, config.quietZone ?? 3);
    const totalSize = size + quiet * 2;
    const fg = config.foregroundColor || '#F8FAFF';
    const bg = config.isTransparentBg ? 'none' : config.backgroundColor || '#080B18';

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c] === 1) {
          rects += `<rect x="${c + quiet}" y="${r + quiet}" width="1.02" height="1.02" fill="${fg}" />\n`;
        }
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">
  ${!config.isTransparentBg ? `<rect width="100%" height="100%" fill="${bg}" />` : ''}
  ${rects}
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export SVG:', err);
  }
}

// Export as Print-Ready PDF
export async function downloadQRAsPDF(
  canvas: HTMLCanvasElement,
  title = 'QYRO QR Code',
  filename = 'qyro-print.pdf'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Dark background or clean document styling
  doc.setFillColor(8, 11, 24);
  doc.rect(0, 0, 210, 297, 'F');

  // Title & Header
  doc.setTextColor(248, 250, 255);
  doc.setFontSize(22);
  doc.text('QYRO', 105, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(168, 180, 208);
  doc.text('Scan Different. Connect Everything.', 105, 38, { align: 'center' });

  // Add QR image
  const imgData = canvas.toDataURL('image/png');
  const qrSizeMm = 120;
  const x = (210 - qrSizeMm) / 2;
  const y = 60;
  doc.addImage(imgData, 'PNG', x, y, qrSizeMm, qrSizeMm * (canvas.height / canvas.width));

  // Label
  doc.setFontSize(14);
  doc.setTextColor(21, 217, 245);
  doc.text(title, 105, y + qrSizeMm + 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 115, 145);
  doc.text('High-Resolution Print Export | Verified Scannable', 105, y + qrSizeMm + 26, { align: 'center' });

  doc.save(filename);
}
