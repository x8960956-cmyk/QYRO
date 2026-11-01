import { QRCategory } from '../types/qr';

// Wi-Fi escape helper according to ZXing / standard Wi-Fi barcode syntax
function escapeWifi(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

export interface PayloadData {
  // URL
  url?: string;
  // Text
  text?: string;
  // Contact
  firstName?: string;
  lastName?: string;
  organization?: string;
  jobTitle?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  photoUrl?: string;
  // Wi-Fi
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
  // SMS
  smsPhone?: string;
  smsMessage?: string;
  // Email
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  // Phone
  telNumber?: string;
  // WhatsApp
  waPhone?: string;
  waMessage?: string;
  // Social
  socialUsername?: string;
  socialCustomUrl?: string;
  // Maps / Location
  latitude?: string;
  longitude?: string;
  locationAddress?: string;
  // Event
  eventTitle?: string;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  eventDescription?: string;
  // Payment
  paymentType?: 'upi' | 'paypal' | 'crypto' | 'stripe';
  upiId?: string;
  upiName?: string;
  upiAmount?: string;
  paypalUser?: string;
  cryptoAddress?: string;
  cryptoCoin?: string;
  stripeUrl?: string;
  // Business / Product
  businessName?: string;
  businessCategory?: string;
  businessAddress?: string;
  businessHours?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessDescription?: string;
  // Product
  productName?: string;
  productPrice?: string;
  productSku?: string;
  productUrl?: string;
  // Restaurant Menu
  restaurantName?: string;
  menuUrl?: string;
  cuisine?: string;
  // Custom Raw
  customPayload?: string;
}

export function formatQRPayload(category: QRCategory, data: PayloadData): string {
  switch (category) {
    case 'url': {
      let u = (data.url || '').trim();
      if (!u) return 'https://qyro.app';
      if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
      }
      return u;
    }

    case 'text': {
      // Must preserve full spaces, newlines, Unicode, Tamil, punctuation without truncation
      const t = data.text !== undefined && data.text !== null ? data.text : '';
      return t.trim() ? t : 'Scan Different. Connect Everything. QYRO Plain Text QR Test';
    }

    case 'vcard': {
      const fn = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim() || 'Contact';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${fn}`,
        `N:${(data.lastName || '').trim()};${(data.firstName || '').trim()};;;`,
      ];
      if (data.organization) lines.push(`ORG:${data.organization.trim()}`);
      if (data.jobTitle) lines.push(`TITLE:${data.jobTitle.trim()}`);
      if (data.mobile) lines.push(`TEL;TYPE=CELL:${data.mobile.trim()}`);
      if (data.phone) lines.push(`TEL;TYPE=WORK,VOICE:${data.phone.trim()}`);
      if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
      if (data.website) lines.push(`URL:${data.website.trim()}`);
      
      const adr = [
        '',
        '',
        (data.street || '').trim(),
        (data.city || '').trim(),
        (data.state || '').trim(),
        (data.zip || '').trim(),
        (data.country || '').trim()
      ].join(';');
      if (data.street || data.city || data.state || data.zip || data.country) {
        lines.push(`ADR;TYPE=HOME:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}`);
      }
      if (data.notes) lines.push(`NOTE:${data.notes.trim()}`);
      if (data.photoUrl) lines.push(`PHOTO;VALUE=uri:${data.photoUrl.trim()}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'wifi': {
      const ssid = escapeWifi(data.ssid || '');
      const type = data.encryption || 'WPA';
      const pass = escapeWifi(data.password || '');
      const hidden = data.hidden ? 'true' : 'false';
      if (type === 'nopass') {
        return `WIFI:S:${ssid};T:nopass;H:${hidden};;`;
      }
      return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
    }

    case 'phone': {
      const p = (data.telNumber || '').trim();
      return `tel:${p}`;
    }

    case 'email': {
      const to = (data.emailTo || '').trim();
      const params: string[] = [];
      if (data.emailSubject) params.push(`subject=${encodeURIComponent(data.emailSubject)}`);
      if (data.emailBody) params.push(`body=${encodeURIComponent(data.emailBody)}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      return `mailto:${to}${query}`;
    }

    case 'sms': {
      const num = (data.smsPhone || '').trim();
      const body = data.smsMessage ? `?body=${encodeURIComponent(data.smsMessage)}` : '';
      return `sms:${num}${body}`;
    }

    case 'whatsapp': {
      const cleanPhone = (data.waPhone || '').replace(/\D/g, '');
      const textParam = data.waMessage ? `?text=${encodeURIComponent(data.waMessage)}` : '';
      return `https://wa.me/${cleanPhone}${textParam}`;
    }

    case 'instagram': {
      const u = (data.socialUsername || '').replace(/^@/, '').trim();
      return u.startsWith('http') ? u : `https://instagram.com/${u}`;
    }

    case 'youtube': {
      const u = (data.socialUsername || '').trim();
      if (u.startsWith('http')) return u;
      return `https://youtube.com/@${u.replace(/^@/, '')}`;
    }

    case 'facebook': {
      const u = (data.socialUsername || '').trim();
      return u.startsWith('http') ? u : `https://facebook.com/${u}`;
    }

    case 'linkedin': {
      const u = (data.socialUsername || '').trim();
      return u.startsWith('http') ? u : `https://linkedin.com/in/${u}`;
    }

    case 'twitter': {
      const u = (data.socialUsername || '').replace(/^@/, '').trim();
      return u.startsWith('http') ? u : `https://x.com/${u}`;
    }

    case 'tiktok': {
      const u = (data.socialUsername || '').replace(/^@/, '').trim();
      return u.startsWith('http') ? u : `https://tiktok.com/@${u}`;
    }

    case 'telegram': {
      const u = (data.socialUsername || '').replace(/^@/, '').trim();
      return u.startsWith('http') ? u : `https://t.me/${u}`;
    }

    case 'portfolio': {
      let u = (data.url || '').trim();
      if (!u) return 'https://qyro.app';
      return /^https?:\/\//i.test(u) ? u : 'https://' + u;
    }

    case 'maps': {
      if (data.latitude && data.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${data.latitude.trim()},${data.longitude.trim()}`;
      }
      if (data.locationAddress) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.locationAddress.trim())}`;
      }
      return 'https://maps.google.com';
    }

    case 'payment': {
      if (data.paymentType === 'upi' && data.upiId) {
        const pn = data.upiName ? `&pn=${encodeURIComponent(data.upiName)}` : '';
        const am = data.upiAmount ? `&am=${encodeURIComponent(data.upiAmount)}` : '';
        return `upi://pay?pa=${encodeURIComponent(data.upiId.trim())}${pn}${am}&cu=INR`;
      }
      if (data.paymentType === 'paypal' && data.paypalUser) {
        const cleanUser = data.paypalUser.replace(/^@/, '').trim();
        return `https://paypal.me/${cleanUser}`;
      }
      if (data.paymentType === 'crypto' && data.cryptoAddress) {
        const coin = (data.cryptoCoin || 'bitcoin').toLowerCase();
        return `${coin}:${data.cryptoAddress.trim()}`;
      }
      if (data.paymentType === 'stripe' && data.stripeUrl) {
        return data.stripeUrl.trim();
      }
      return data.url || 'https://qyro.app/pay';
    }

    case 'event': {
      const start = data.eventStart ? data.eventStart.replace(/[-:]/g, '') : '';
      const end = data.eventEnd ? data.eventEnd.replace(/[-:]/g, '') : '';
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${data.eventTitle || 'Event'}`,
      ];
      if (start) lines.push(`DTSTART:${start}`);
      if (end) lines.push(`DTEND:${end}`);
      if (data.eventLocation) lines.push(`LOCATION:${data.eventLocation}`);
      if (data.eventDescription) lines.push(`DESCRIPTION:${data.eventDescription}`);
      lines.push('END:VEVENT', 'END:VCALENDAR');
      return lines.join('\n');
    }

    case 'business': {
      // Create rich vCard or web link for business
      if (data.businessWebsite) {
        return data.businessWebsite.startsWith('http') ? data.businessWebsite : 'https://' + data.businessWebsite;
      }
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.businessName || 'Business'}`,
        `ORG:${data.businessName || 'Business'}`,
      ];
      if (data.businessPhone) lines.push(`TEL;TYPE=WORK:${data.businessPhone}`);
      if (data.businessAddress) lines.push(`ADR;TYPE=WORK:;;${data.businessAddress};;;;`);
      if (data.businessDescription) lines.push(`NOTE:${data.businessDescription}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'product': {
      if (data.productUrl) return data.productUrl;
      return `PRODUCT: ${data.productName || 'Item'}\nPRICE: ${data.productPrice || 'N/A'}\nSKU: ${data.productSku || 'N/A'}`;
    }

    case 'restaurant': {
      if (data.menuUrl) return data.menuUrl;
      return `MENU: ${data.restaurantName || 'Restaurant'}\nCUISINE: ${data.cuisine || 'Gourmet'}`;
    }

    case 'support': {
      if (data.emailTo) {
        return `mailto:${data.emailTo}?subject=${encodeURIComponent(data.emailSubject || 'Customer Support Request')}`;
      }
      if (data.telNumber) return `tel:${data.telNumber}`;
      return data.url || 'https://qyro.app/support';
    }

    case 'review': {
      return data.url || 'https://qyro.app';
    }

    case 'file-pdf':
    case 'file-image':
    case 'audio':
    case 'video':
    case 'document': {
      return data.url || 'https://qyro.app';
    }

    case 'custom':
    default: {
      return data.customPayload || data.text || data.url || 'https://qyro.app';
    }
  }
}

// Compute byte size with UTF-8 support
export function getPayloadByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

// Check QR capacity: version 40 binary limit is ~2953 bytes with Low error correction, ~1273 with High
export function getQRCapacityStatus(byteLength: number, errorCorrection: 'L' | 'M' | 'Q' | 'H') {
  const maxBytes = {
    L: 2953,
    M: 2331,
    Q: 1663,
    H: 1273,
  }[errorCorrection];

  const percentage = Math.min(100, Math.round((byteLength / maxBytes) * 100));
  const isOverLimit = byteLength > maxBytes;
  const isNearLimit = percentage > 85;

  return {
    byteLength,
    maxBytes,
    percentage,
    isOverLimit,
    isNearLimit,
  };
}
