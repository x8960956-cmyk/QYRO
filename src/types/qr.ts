export type QRCategory =
  // Personal
  | 'url'
  | 'text'
  | 'vcard'
  | 'phone'
  | 'email'
  | 'sms'
  | 'wifi'
  | 'portfolio'
  // Social
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'linkedin'
  | 'whatsapp'
  | 'twitter'
  | 'tiktok'
  | 'telegram'
  // Business
  | 'business'
  | 'product'
  | 'restaurant'
  | 'maps'
  | 'support'
  | 'payment'
  | 'review'
  // Files
  | 'file-pdf'
  | 'file-image'
  | 'audio'
  | 'video'
  | 'document'
  // Events & Other
  | 'event'
  | 'custom';

export type PatternStyle = 'square' | 'rounded' | 'dots' | 'smooth' | 'pixel' | 'geometric' | 'minimal';
export type EyeStyle = 'square' | 'rounded' | 'circle' | 'geometric';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRDesignConfig {
  pattern: PatternStyle;
  eyeStyle: EyeStyle;
  foregroundColor: string;
  backgroundColor: string;
  isTransparentBg: boolean;
  useGradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientType: 'linear-vertical' | 'linear-horizontal' | 'radial';
  eyeColor: string;
  errorCorrection: ErrorCorrectionLevel;
  size: number;
  quietZone: number;
  // Logo
  logoUrl?: string;
  logoSize: number; // percentage 10 - 30%
  logoBackground: 'none' | 'circle' | 'rounded';
  logoBgColor: string;
  // Frame
  hasFrame: boolean;
  frameText: string;
  framePosition: 'top' | 'bottom';
  frameBgColor: string;
  frameTextColor: string;
}

export interface DynamicQRItem {
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

export interface ScanItem {
  id: string;
  content: string;
  format: string;
  type: string;
  timestamp: string;
}

export interface QRTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  qrCategory: QRCategory;
  defaultData: any;
  design: Partial<QRDesignConfig>;
  badge?: string;
}
