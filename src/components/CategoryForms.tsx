import React, { useState } from 'react';
import { QRCategory } from '../types/qr';
import { PayloadData } from '../utils/qrPayloads';
import {
  Globe,
  FileText,
  Contact,
  Phone,
  Mail,
  MessageSquare,
  Wifi,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Send,
  MapPin,
  UtensilsCrossed,
  Package,
  CreditCard,
  Calendar,
  Upload,
  Code2,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface CategoryFormsProps {
  category: QRCategory;
  data: PayloadData;
  onChange: (newData: PayloadData) => void;
  onFileUploadSuccess?: (fileUrl: string) => void;
}

export const CategoryForms: React.FC<CategoryFormsProps> = ({
  category,
  data,
  onChange,
  onFileUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; size: number } | null>(null);

  const updateField = (field: keyof PayloadData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.data) {
        setUploadedFile({
          name: result.data.originalName,
          url: result.data.url,
          size: result.data.size,
        });
        updateField('url', result.data.url);
        if (onFileUploadSuccess) onFileUploadSuccess(result.data.url);
      } else {
        setUploadError(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Server error during upload');
    } finally {
      setUploading(false);
    }
  };

  // 1. Website URL
  if (category === 'url') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
            Target Website URL
          </label>
          <div className="flex rounded-lg overflow-hidden border border-[#25304B] bg-[#0D1428] focus-within:border-[#15D9F5]">
            <span className="px-3 py-2.5 bg-[#111A31] text-[#A8B4D0] text-sm select-none border-r border-[#25304B]">
              https://
            </span>
            <input
              type="text"
              value={(data.url || '').replace(/^https?:\/\//i, '')}
              onChange={(e) => updateField('url', `https://${e.target.value}`)}
              placeholder="example.com/campaign"
              className="w-full px-3 py-2.5 bg-transparent text-[#F8FAFF] text-sm placeholder-[#4B597B] focus:outline-none"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#A8B4D0]">
            Enter any valid web address. Query parameters and anchor tags are preserved.
          </p>
        </div>
      </div>
    );
  }

  // 2. Plain Text
  if (category === 'text') {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
              Plain Text & Multilingual Content
            </label>
            <span className="text-[11px] text-[#10B981] font-mono flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full UTF-8 & Tamil Supported</span>
            </span>
          </div>

          {/* Quick preset buttons to immediately test */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => updateField('text', 'Hello World! QYRO Plain Text QR code is working 100%.')}
              className="px-2.5 py-1 rounded-lg bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5] text-[11px] text-[#F8FAFF] font-medium transition-all"
            >
              + Test: English Short
            </button>
            <button
              type="button"
              onClick={() => updateField('text', 'வணக்கம்! இது க்யூரோ (QYRO) தமிழ் உரை க்யூஆர் குறியீடு. முழுமையான தமிழ் எழுத்துக்கள் வேலை செய்கிறது.')}
              className="px-2.5 py-1 rounded-lg bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5] text-[11px] text-[#15D9F5] font-medium transition-all"
            >
              + Test: தமிழ் (Tamil)
            </button>
            <button
              type="button"
              onClick={() => updateField('text', `Order #QY-9821\nCustomer: Alex Vance\nDate: 2026-11-01\nStatus: Verified Complete`)}
              className="px-2.5 py-1 rounded-lg bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5] text-[11px] text-[#A8B4D0] font-medium transition-all"
            >
              + Test: Multi-line Note
            </button>
          </div>

          <textarea
            rows={5}
            value={data.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Type or paste any text, notes, instructions, or foreign language script (e.g. தமிழ்: வணக்கம், नमस्ते, Bonjour)..."
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-[#F8FAFF] text-sm placeholder-[#4B597B] focus:outline-none focus:border-[#15D9F5] font-mono leading-relaxed"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#A8B4D0]">
            <span>Line breaks, spaces, emojis, and exact punctuation are preserved.</span>
            <span className="font-mono text-[#15D9F5] font-bold">
              {data.text?.length || 0} characters
            </span>
          </div>

          {/* Smartphone Scanning Notice */}
          <div className="mt-4 p-3.5 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-1.5 text-xs">
            <div className="font-semibold text-[#F8FAFF] flex items-center space-x-1.5">
              <span className="text-[#15D9F5]">📱 Smartphone Camera Behavior:</span>
            </div>
            <p className="text-[11px] text-[#A8B4D0] leading-relaxed">
              When scanning a Plain Text QR code with an iPhone Camera or Android Google Lens, your phone displays the text directly on the screen with options to <strong>Copy Text</strong> or <strong>Search Web</strong> (plain text does not automatically navigate to a website URL).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Contact vCard
  if (category === 'vcard') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
            vCard Contact Details
          </span>
          <button
            type="button"
            onClick={() => {
              onChange({
                ...data,
                firstName: 'Dhivya',
                lastName: 'Rajendran',
                organization: 'QYRO Universal Platform',
                jobTitle: 'Founder & Creator',
                email: 'dhivya@qyro.app',
                website: 'https://qyro.app',
                photoUrl: '/src/assets/images/founder_dhivya_photo_1793527997041.jpg',
                notes: 'Founder of QYRO · Class 11th PCMB (Bio-Maths) student innovator.',
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-[#7657FF]/20 border border-[#7657FF]/40 text-[#15D9F5] hover:text-white text-[11px] font-bold transition-all"
          >
            + Load Founder Card (Dhivya Rajendran)
          </button>
        </div>

        {/* Contact Photo Card Row */}
        <div className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Contact Avatar"
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#15D9F5] shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#111A31] border border-[#25304B] flex items-center justify-center text-[#A8B4D0]">
                <Contact className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-[#F8FAFF]">
                {data.photoUrl ? 'Contact Photo Attached' : 'Contact Card Photo (Optional)'}
              </div>
              <div className="text-[10px] text-[#A8B4D0]">
                {data.photoUrl
                  ? 'Encoded into vCard PHOTO metadata'
                  : 'Add a portrait photo to embed in the contact card'}
              </div>
            </div>
          </div>

          {data.photoUrl ? (
            <button
              type="button"
              onClick={() => updateField('photoUrl', undefined)}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1"
            >
              Remove Photo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => updateField('photoUrl', '/src/assets/images/founder_dhivya_photo_1793527997041.jpg')}
              className="px-3 py-1.5 rounded-lg bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5] text-[11px] text-[#15D9F5] font-semibold transition-all"
            >
              Use Founder Photo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">First Name *</label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Alex"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Last Name</label>
            <input
              type="text"
              value={data.lastName || ''}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Vance"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Organization / Company</label>
            <input
              type="text"
              value={data.organization || ''}
              onChange={(e) => updateField('organization', e.target.value)}
              placeholder="QYRO Inc."
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Job Title</label>
            <input
              type="text"
              value={data.jobTitle || ''}
              onChange={(e) => updateField('jobTitle', e.target.value)}
              placeholder="Creative Director"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Mobile Phone *</label>
            <input
              type="tel"
              value={data.mobile || ''}
              onChange={(e) => updateField('mobile', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Work / Office Phone</label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 987-6543"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Email Address</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="alex@qyro.app"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Website URL</label>
            <input
              type="text"
              value={data.website || ''}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://portfolio.me"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">City, State</label>
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Country</label>
            <input
              type="text"
              value={data.country || ''}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="USA"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Notes / Bio</label>
          <input
            type="text"
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Met at Tech Summit 2026"
            className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 4. Wi-Fi
  if (category === 'wifi') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Network Name (SSID) *</label>
          <input
            type="text"
            value={data.ssid || ''}
            onChange={(e) => updateField('ssid', e.target.value)}
            placeholder="MyHome_5GHz"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Security / Encryption</label>
            <select
              value={data.encryption || 'WPA'}
              onChange={(e) => updateField('encryption', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            >
              <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
              <option value="WEP">WEP (Legacy)</option>
              <option value="nopass">None (Open Network)</option>
            </select>
          </div>

          {data.encryption !== 'nopass' && (
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Wi-Fi Password *</label>
              <input
                type="text"
                value={data.password || ''}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="SuperSecretKey123"
                className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="hiddenWifi"
            checked={Boolean(data.hidden)}
            onChange={(e) => updateField('hidden', e.target.checked)}
            className="w-4 h-4 rounded border-[#25304B] bg-[#0D1428] text-[#7657FF] focus:ring-0"
          />
          <label htmlFor="hiddenWifi" className="text-xs text-[#A8B4D0] cursor-pointer">
            This is a hidden network (SSID is not broadcasted)
          </label>
        </div>
      </div>
    );
  }

  // 5. Phone
  if (category === 'phone') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
            Phone Number (with Country Code)
          </label>
          <input
            type="tel"
            value={data.telNumber || ''}
            onChange={(e) => updateField('telNumber', e.target.value)}
            placeholder="+1 (415) 555-0199"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-[#F8FAFF] text-sm focus:border-[#15D9F5] focus:outline-none"
          />
          <p className="mt-1.5 text-[11px] text-[#A8B4D0]">
            Scanning directly prompts mobile dialers to call this number without manual typing.
          </p>
        </div>
      </div>
    );
  }

  // 6. Email
  if (category === 'email') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Recipient Email *</label>
          <input
            type="email"
            value={data.emailTo || ''}
            onChange={(e) => updateField('emailTo', e.target.value)}
            placeholder="hello@company.com"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Subject Line</label>
          <input
            type="text"
            value={data.emailSubject || ''}
            onChange={(e) => updateField('emailSubject', e.target.value)}
            placeholder="Inquiry regarding partnership"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Prefilled Body Message</label>
          <textarea
            rows={3}
            value={data.emailBody || ''}
            onChange={(e) => updateField('emailBody', e.target.value)}
            placeholder="Hi there, I would like to learn more about..."
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 7. SMS
  if (category === 'sms') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Recipient Phone Number *</label>
          <input
            type="tel"
            value={data.smsPhone || ''}
            onChange={(e) => updateField('smsPhone', e.target.value)}
            placeholder="+1 555 123 4567"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Prefilled Text Message</label>
          <textarea
            rows={3}
            value={data.smsMessage || ''}
            onChange={(e) => updateField('smsMessage', e.target.value)}
            placeholder="JOIN VIP to receive updates"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 8. WhatsApp
  if (category === 'whatsapp') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
            WhatsApp Number with Country Code (No + or spaces) *
          </label>
          <input
            type="text"
            value={data.waPhone || ''}
            onChange={(e) => updateField('waPhone', e.target.value)}
            placeholder="14155550199"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Prefilled Chat Message</label>
          <textarea
            rows={3}
            value={data.waMessage || ''}
            onChange={(e) => updateField('waMessage', e.target.value)}
            placeholder="Hello! I would like to ask about your services..."
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 9. Social Media (Instagram, YouTube, etc.)
  if (['instagram', 'youtube', 'facebook', 'linkedin', 'twitter', 'tiktok', 'telegram'].includes(category)) {
    const titles: Record<string, { label: string; placeholder: string; prefix: string }> = {
      instagram: { label: 'Instagram Handle or Profile URL', placeholder: 'your_username', prefix: 'instagram.com/' },
      youtube: { label: 'YouTube Channel or Video URL', placeholder: '@YourChannel', prefix: 'youtube.com/' },
      facebook: { label: 'Facebook Page or Profile', placeholder: 'page_username', prefix: 'facebook.com/' },
      linkedin: { label: 'LinkedIn Profile or Company URL', placeholder: 'in/yourname', prefix: 'linkedin.com/' },
      twitter: { label: 'X (Twitter) Username or Link', placeholder: 'handle', prefix: 'x.com/' },
      tiktok: { label: 'TikTok Username', placeholder: 'username', prefix: 'tiktok.com/@' },
      telegram: { label: 'Telegram Username or Channel', placeholder: 'channel_name', prefix: 't.me/' },
    };

    const info = titles[category] || { label: 'Social Username', placeholder: 'user', prefix: '' };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">{info.label} *</label>
          <div className="flex rounded-lg overflow-hidden border border-[#25304B] bg-[#0D1428] focus-within:border-[#15D9F5]">
            <span className="px-3 py-2.5 bg-[#111A31] text-[#A8B4D0] text-sm select-none border-r border-[#25304B]">
              {info.prefix}
            </span>
            <input
              type="text"
              value={data.socialUsername || ''}
              onChange={(e) => updateField('socialUsername', e.target.value)}
              placeholder={info.placeholder}
              className="w-full px-3 py-2.5 bg-transparent text-[#F8FAFF] text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // 10. Payment (UPI, PayPal, Crypto, Stripe)
  if (category === 'payment') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-2">Payment Protocol</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'upi', label: 'UPI / GPay' },
              { id: 'paypal', label: 'PayPal.Me' },
              { id: 'crypto', label: 'Crypto (BTC/ETH)' },
              { id: 'stripe', label: 'Stripe Payment' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => updateField('paymentType', p.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  (data.paymentType || 'upi') === p.id
                    ? 'bg-[#7657FF] text-white border-[#7657FF]'
                    : 'bg-[#111A31] text-[#A8B4D0] border-[#25304B] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {data.paymentType === 'upi' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">UPI ID (VPA) *</label>
              <input
                type="text"
                value={data.upiId || ''}
                onChange={(e) => updateField('upiId', e.target.value)}
                placeholder="merchant@okhdfcbank"
                className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Payee Name</label>
                <input
                  type="text"
                  value={data.upiName || ''}
                  onChange={(e) => updateField('upiName', e.target.value)}
                  placeholder="Store / Person Name"
                  className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Optional Amount (INR)</label>
                <input
                  type="number"
                  value={data.upiAmount || ''}
                  onChange={(e) => updateField('upiAmount', e.target.value)}
                  placeholder="499.00"
                  className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {data.paymentType === 'paypal' && (
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">PayPal.Me Username *</label>
            <div className="flex rounded-lg overflow-hidden border border-[#25304B] bg-[#0D1428] focus-within:border-[#15D9F5]">
              <span className="px-3 py-2 bg-[#111A31] text-[#A8B4D0] text-sm border-r border-[#25304B]">
                paypal.me/
              </span>
              <input
                type="text"
                value={data.paypalUser || ''}
                onChange={(e) => updateField('paypalUser', e.target.value)}
                placeholder="johnsmith"
                className="w-full px-3 py-2 bg-transparent text-[#F8FAFF] text-sm focus:outline-none"
              />
            </div>
          </div>
        )}

        {data.paymentType === 'crypto' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Cryptocurrency</label>
              <select
                value={data.cryptoCoin || 'bitcoin'}
                onChange={(e) => updateField('cryptoCoin', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
              >
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="solana">Solana (SOL)</option>
                <option value="litecoin">Litecoin (LTC)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Wallet Address *</label>
              <input
                type="text"
                value={data.cryptoAddress || ''}
                onChange={(e) => updateField('cryptoAddress', e.target.value)}
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {data.paymentType === 'stripe' && (
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Stripe Payment Link URL *</label>
            <input
              type="text"
              value={data.stripeUrl || ''}
              onChange={(e) => updateField('stripeUrl', e.target.value)}
              placeholder="https://buy.stripe.com/..."
              className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        )}
      </div>
    );
  }

  // 11. Location / Google Maps
  if (category === 'maps') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Address / Landmark / Place Name</label>
          <input
            type="text"
            value={data.locationAddress || ''}
            onChange={(e) => updateField('locationAddress', e.target.value)}
            placeholder="Eiffel Tower, Paris or 123 Tech Blvd, Austin"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div className="text-center text-xs text-[#4B597B] font-mono">— OR SPECIFY COORDINATES —</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Latitude</label>
            <input
              type="text"
              value={data.latitude || ''}
              onChange={(e) => updateField('latitude', e.target.value)}
              placeholder="37.7749"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Longitude</label>
            <input
              type="text"
              value={data.longitude || ''}
              onChange={(e) => updateField('longitude', e.target.value)}
              placeholder="-122.4194"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // 12. File Upload to QR (PDF, Image, Document)
  if (['file-pdf', 'file-image', 'document', 'audio', 'video'].includes(category)) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
            Upload File to Secure Cloud Storage
          </label>

          <div className="border-2 border-dashed border-[#25304B] hover:border-[#15D9F5] rounded-xl p-6 text-center bg-[#0D1428]/60 transition-all cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              accept={category === 'file-pdf' ? '.pdf' : category === 'file-image' ? 'image/*' : '*/*'}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#111A31] border border-[#25304B] flex items-center justify-center text-[#15D9F5]">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-[#15D9F5] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div className="text-sm font-semibold text-[#F8FAFF]">
                {uploading ? 'Uploading to secure storage...' : 'Click to upload or drag & drop'}
              </div>
              <p className="text-xs text-[#A8B4D0]">
                {category === 'file-pdf'
                  ? 'PDF documents up to 25MB'
                  : category === 'file-image'
                  ? 'PNG, JPG, SVG, WebP up to 25MB'
                  : 'Documents, Audio, Media up to 25MB'}
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="mt-2 text-xs text-red-400 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadedFile && (
            <div className="mt-3 p-3 bg-[#111A31] border border-[#10B981]/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-xs text-[#F8FAFF] font-medium truncate">{uploadedFile.name}</span>
                <span className="text-[10px] text-[#A8B4D0]">
                  ({Math.round(uploadedFile.size / 1024)} KB)
                </span>
              </div>
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#15D9F5] hover:underline shrink-0 ml-2"
              >
                View
              </a>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
              Or specify an existing public file URL:
            </label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // 13. Event (vEvent)
  if (category === 'event') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Event Title *</label>
          <input
            type="text"
            value={data.eventTitle || ''}
            onChange={(e) => updateField('eventTitle', e.target.value)}
            placeholder="Product Launch Keynote"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              value={data.eventStart || ''}
              onChange={(e) => updateField('eventStart', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              value={data.eventEnd || ''}
              onChange={(e) => updateField('eventEnd', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Location / Venue</label>
          <input
            type="text"
            value={data.eventLocation || ''}
            onChange={(e) => updateField('eventLocation', e.target.value)}
            placeholder="Moscone Center, SF & Live Stream"
            className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Description</label>
          <textarea
            rows={2}
            value={data.eventDescription || ''}
            onChange={(e) => updateField('eventDescription', e.target.value)}
            placeholder="Join us for the live unveiling of next-gen features."
            className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 14. Restaurant Menu
  if (category === 'restaurant') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Restaurant / Cafe Name *</label>
          <input
            type="text"
            value={data.restaurantName || ''}
            onChange={(e) => updateField('restaurantName', e.target.value)}
            placeholder="Cyber Bites Bistro"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Online Menu URL</label>
          <input
            type="text"
            value={data.menuUrl || ''}
            onChange={(e) => updateField('menuUrl', e.target.value)}
            placeholder="https://example.com/menu"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Cuisine / Speciality</label>
          <input
            type="text"
            value={data.cuisine || ''}
            onChange={(e) => updateField('cuisine', e.target.value)}
            placeholder="Artisan Coffee, Pastries & Fusion Bowls"
            className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // 15. Product SKU / Info
  if (category === 'product') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Product Name *</label>
          <input
            type="text"
            value={data.productName || ''}
            onChange={(e) => updateField('productName', e.target.value)}
            placeholder="Aura Cyber Sound Headset"
            className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Price</label>
            <input
              type="text"
              value={data.productPrice || ''}
              onChange={(e) => updateField('productPrice', e.target.value)}
              placeholder="$199.00"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">SKU / Serial No.</label>
            <input
              type="text"
              value={data.productSku || ''}
              onChange={(e) => updateField('productSku', e.target.value)}
              placeholder="QY-AUD-9000"
              className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Product Buy / Details URL</label>
          <input
            type="text"
            value={data.productUrl || ''}
            onChange={(e) => updateField('productUrl', e.target.value)}
            placeholder="https://store.example.com/items/headset"
            className="w-full px-3 py-2 rounded-lg border border-[#25304B] bg-[#0D1428] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // Fallback: Custom Payload
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
          Custom Raw QR Payload
        </label>
        <textarea
          rows={4}
          value={data.customPayload || data.text || data.url || ''}
          onChange={(e) => updateField('customPayload', e.target.value)}
          placeholder="Enter custom URI schema, JSON string, or deep link..."
          className="w-full px-3 py-2.5 rounded-lg border border-[#25304B] bg-[#0D1428] text-[#F8FAFF] text-sm placeholder-[#4B597B] focus:outline-none focus:border-[#15D9F5] font-mono"
        />
      </div>
    </div>
  );
};
