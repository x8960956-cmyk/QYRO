import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data and uploads directory exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Serve uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// JSON File DB helper
const DB_FILE = path.join(DATA_DIR, 'qyro-store.json');

interface DynamicQR {
  id: string;
  code: string;
  title: string;
  destination: string;
  category: string;
  notes?: string;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  history: Array<{ destination: string; timestamp: string }>;
  scansCount: number;
}

interface ScanLog {
  id: string;
  qrId: string;
  code: string;
  timestamp: string;
  userAgent: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  referrer: string;
  ip: string;
}

interface UploadedFileRecord {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

interface QyroDB {
  dynamicQRs: DynamicQR[];
  scans: ScanLog[];
  files: UploadedFileRecord[];
  savedQRs: any[];
}

function loadDB(): QyroDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading DB:', err);
  }
  return {
    dynamicQRs: [
      {
        id: 'dyn-demo-1',
        code: 'qyro-launch',
        title: 'QYRO Official Portal',
        destination: 'https://github.com',
        category: 'website',
        notes: 'Launch demo dynamic QR',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: null,
        history: [{ destination: 'https://github.com', timestamp: new Date().toISOString() }],
        scansCount: 42,
      },
      {
        id: 'dyn-demo-2',
        code: 'summer-menu',
        title: 'Summer Bistro Menu',
        destination: 'https://example.com/menu',
        category: 'restaurant',
        notes: 'Table tent QR cards',
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: null,
        history: [{ destination: 'https://example.com/menu', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() }],
        scansCount: 118,
      }
    ],
    scans: [],
    files: [],
    savedQRs: [],
  };
}

function saveDB(data: QyroDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Device detection helper
function parseUserAgent(ua: string) {
  let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android/i.test(ua)) {
    device = 'mobile';
  }

  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

// ==========================================
// 1. Dynamic QR Redirect Handler (/r/:code)
// ==========================================
app.get('/r/:code', (req, res) => {
  const code = req.params.code;
  const db = loadDB();
  const qr = db.dynamicQRs.find(
    (item) => item.code.toLowerCase() === code.toLowerCase() || item.id === code
  );

  if (!qr) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>QR Code Not Found — QYRO</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #080B18; color: #F8FAFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #111A31; border: 1px solid #25304B; padding: 40px; border-radius: 16px; max-width: 440px; }
          h1 { color: #15D9F5; margin-bottom: 12px; }
          p { color: #A8B4D0; font-size: 15px; line-height: 1.5; }
          a { color: #7657FF; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>QR Code Not Found</h1>
          <p>The dynamic QR code <code>${code}</code> does not exist or has been removed.</p>
          <p><a href="/">Return to QYRO</a></p>
        </div>
      </body>
      </html>
    `);
  }

  // Check paused or expired
  const now = new Date();
  const isExpired = qr.expiresAt && new Date(qr.expiresAt) < now;
  if (qr.status === 'paused' || isExpired) {
    return res.status(410).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>QR Code Inactive — QYRO</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #080B18; color: #F8FAFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #111A31; border: 1px solid #25304B; padding: 40px; border-radius: 16px; max-width: 440px; }
          .badge { display: inline-block; background: #7657FF20; color: #7657FF; border: 1px solid #7657FF50; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
          h1 { color: #F8FAFF; font-size: 24px; margin-bottom: 12px; }
          p { color: #A8B4D0; font-size: 15px; line-height: 1.5; }
          a { color: #15D9F5; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">${isExpired ? 'EXPIRED' : 'PAUSED'}</div>
          <h1>QR Code Inactive</h1>
          <p>${isExpired ? 'This dynamic QR code reached its expiration date.' : 'The creator of this QR code has temporarily paused access.'}</p>
          <p style="margin-top: 24px;"><a href="/">Powered by QYRO Platform</a></p>
        </div>
      </body>
      </html>
    `);
  }

  // Record scan
  const ua = req.headers['user-agent'] || '';
  const { device, browser, os } = parseUserAgent(ua);
  const scanLog: ScanLog = {
    id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    qrId: qr.id,
    code: qr.code,
    timestamp: new Date().toISOString(),
    userAgent: ua,
    device,
    browser,
    os,
    referrer: req.headers['referer'] || req.headers['referrer'] as string || 'Direct Scan',
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
  };

  qr.scansCount = (qr.scansCount || 0) + 1;
  db.scans.push(scanLog);
  saveDB(db);

  // Normalize destination URL
  let dest = qr.destination.trim();
  if (!/^https?:\/\//i.test(dest)) {
    dest = 'https://' + dest;
  }

  return res.redirect(302, dest);
});

// ==========================================
// 2. Dynamic QR API Endpoints
// ==========================================
app.get('/api/dynamic-qrs', (_req, res) => {
  const db = loadDB();
  res.json({ success: true, data: db.dynamicQRs });
});

app.post('/api/dynamic-qrs', (req, res) => {
  const { title, destination, category, notes, customCode, expiresAt } = req.body;
  if (!destination) {
    return res.status(400).json({ success: false, error: 'Destination URL is required' });
  }

  const db = loadDB();
  let code = (customCode || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!code) {
    code = 'qr-' + Math.random().toString(36).substring(2, 9);
  }

  // Ensure unique code
  const existing = db.dynamicQRs.find((item) => item.code.toLowerCase() === code);
  if (existing) {
    code = code + '-' + Math.random().toString(36).substring(2, 6);
  }

  const newQR: DynamicQR = {
    id: 'dyn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    code,
    title: title || 'Untitled Dynamic QR',
    destination: destination.trim(),
    category: category || 'website',
    notes: notes || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    history: [{ destination: destination.trim(), timestamp: new Date().toISOString() }],
    scansCount: 0,
  };

  db.dynamicQRs.unshift(newQR);
  saveDB(db);

  res.json({ success: true, data: newQR });
});

app.put('/api/dynamic-qrs/:id', (req, res) => {
  const id = req.params.id;
  const { title, destination, status, notes, expiresAt } = req.body;
  const db = loadDB();
  const qr = db.dynamicQRs.find((item) => item.id === id);

  if (!qr) {
    return res.status(404).json({ success: false, error: 'Dynamic QR not found' });
  }

  if (title !== undefined) qr.title = title;
  if (notes !== undefined) qr.notes = notes;
  if (status !== undefined) qr.status = status;
  if (expiresAt !== undefined) qr.expiresAt = expiresAt;

  if (destination && destination.trim() !== qr.destination) {
    qr.destination = destination.trim();
    qr.history.push({ destination: destination.trim(), timestamp: new Date().toISOString() });
  }
  qr.updatedAt = new Date().toISOString();

  saveDB(db);
  res.json({ success: true, data: qr });
});

app.delete('/api/dynamic-qrs/:id', (req, res) => {
  const id = req.params.id;
  const db = loadDB();
  const index = db.dynamicQRs.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Dynamic QR not found' });
  }

  db.dynamicQRs.splice(index, 1);
  db.scans = db.scans.filter((s) => s.qrId !== id);
  saveDB(db);

  res.json({ success: true, message: 'Dynamic QR deleted' });
});

// Analytics for dynamic QRs
app.get('/api/dynamic-qrs/:id/analytics', (req, res) => {
  const id = req.params.id;
  const db = loadDB();
  const qr = db.dynamicQRs.find((item) => item.id === id);
  if (!qr) {
    return res.status(404).json({ success: false, error: 'QR not found' });
  }

  const scans = db.scans.filter((s) => s.qrId === id);

  // Group by date
  const byDate: Record<string, number> = {};
  const byDevice: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
  const byBrowser: Record<string, number> = {};
  const byOS: Record<string, number> = {};

  scans.forEach((scan) => {
    const date = scan.timestamp.split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
    byDevice[scan.device] = (byDevice[scan.device] || 0) + 1;
    byBrowser[scan.browser] = (byBrowser[scan.browser] || 0) + 1;
    byOS[scan.os] = (byOS[scan.os] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      qr,
      totalScans: qr.scansCount,
      recentScans: scans.slice(-50).reverse(),
      byDate,
      byDevice,
      byBrowser,
      byOS,
    },
  });
});

// Global analytics summary
app.get('/api/analytics/overview', (_req, res) => {
  const db = loadDB();
  const totalQRs = db.dynamicQRs.length;
  const totalScans = db.dynamicQRs.reduce((acc, q) => acc + (q.scansCount || 0), 0);
  const activeQRs = db.dynamicQRs.filter((q) => q.status === 'active').length;

  // Aggregate device breakdown
  const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
  const browserCounts: Record<string, number> = {};
  const dateCounts: Record<string, number> = {};

  db.scans.forEach((s) => {
    deviceCounts[s.device] = (deviceCounts[s.device] || 0) + 1;
    browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1;
    const day = s.timestamp.split('T')[0];
    dateCounts[day] = (dateCounts[day] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalQRs,
      totalScans,
      activeQRs,
      deviceCounts,
      browserCounts,
      dateCounts,
    },
  });
});

// ==========================================
// 3. File-to-QR Upload API
// ==========================================
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided' });
  }

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  const record: UploadedFileRecord = {
    id: 'file-' + Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    url: fileUrl,
    uploadedAt: new Date().toISOString(),
  };

  const db = loadDB();
  db.files.unshift(record);
  saveDB(db);

  res.json({ success: true, data: record });
});

app.get('/api/files', (_req, res) => {
  const db = loadDB();
  res.json({ success: true, data: db.files });
});

app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to unlink file:', err);
    }
  }

  const db = loadDB();
  db.files = db.files.filter((f) => f.filename !== filename);
  saveDB(db);

  res.json({ success: true, message: 'File deleted' });
});

// ==========================================
// 4. Saved User QRs API
// ==========================================
app.get('/api/saved-qrs', (_req, res) => {
  const db = loadDB();
  res.json({ success: true, data: db.savedQRs || [] });
});

app.post('/api/saved-qrs', (req, res) => {
  const db = loadDB();
  const item = {
    id: 'saved-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.savedQRs = db.savedQRs || [];
  db.savedQRs.unshift(item);
  saveDB(db);
  res.json({ success: true, data: item });
});

app.delete('/api/saved-qrs/:id', (req, res) => {
  const db = loadDB();
  db.savedQRs = (db.savedQRs || []).filter((item: any) => item.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Saved QR deleted' });
});

// ==========================================
// 5. AI QR Art Studio API (Gemini Integration)
// ==========================================
app.post('/api/ai-art', async (req, res) => {
  try {
    const { prompt, style, destinationUrl, colorPalette } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in the environment.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate artistic design composition prompt, color harmonization, and visual effects parameters
    const promptEngineering = `You are the lead generative art director for QYRO Art Studio.
Create an avant-garde, scannable QR code visual theme specification for:
- Destination URL: ${destinationUrl || 'https://qyro.app'}
- User Art Prompt: "${prompt || 'Cyberpunk digital nexus'}"
- Style Selected: "${style || 'Cyberpunk'}"
- Palette Preference: "${colorPalette || 'Electric Violet and Neon Cyan'}"

Respond strictly with valid JSON conforming to this schema:
{
  "themeName": "Short futuristic name",
  "style": "${style}",
  "colorPalette": {
    "foreground": "#HEX",
    "background": "#HEX",
    "gradient": ["#HEX", "#HEX"],
    "accentColor": "#HEX",
    "eyeColor": "#HEX"
  },
  "patternType": "dots" | "rounded" | "smooth" | "pixel" | "geometric",
  "eyeShape": "rounded square" | "circle" | "square" | "geometric",
  "ambientVibe": "1 sentence visual description of the artistic atmosphere",
  "contrastRatio": 9.2,
  "artisticOverlaySvg": "<svg viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'><!-- subtle stylized futuristic cyber corner borders or geometric accents with high transparency so QR center remains 100% scannable --></svg>"
}
Ensure background and foreground have extreme contrast (dark background with vibrant neon foreground or vice versa) so that any QR decoder can scan it with 100% reliability.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptEngineering,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('AI Art Generation Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI QR art theme',
    });
  }
});

// ==========================================
// 6. SPA and Vite Setup
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QYRO Server listening on port ${PORT}`);
  });
}

startServer();
