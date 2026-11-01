import React from 'react';
import {
  Globe,
  FileText,
  Contact,
  Wifi,
  Phone,
  Mail,
  Send,
  FileCheck,
  Building,
  Scan,
  Sparkles,
  Zap,
  Layers,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { QRCategory } from '../types/qr';

interface SEOLandingPagesProps {
  pageId: string;
  onLaunchGenerator: (category: QRCategory) => void;
}

export const SEOLandingPages: React.FC<SEOLandingPagesProps> = ({ pageId, onLaunchGenerator }) => {
  const landingData: Record<
    string,
    {
      title: string;
      subtitle: string;
      category: QRCategory;
      icon: any;
      features: string[];
      standard: string;
      faq: { q: string; a: string };
    }
  > = {
    'text-to-qr': {
      title: 'Free Text to QR Code Generator (Unicode & Tamil Supported)',
      subtitle:
        'Encode plain text, multi-line instructions, and international languages including Tamil (தமிழ்), Hindi, and Arabic without silent truncation or corruption.',
      category: 'text',
      icon: FileText,
      features: [
        'Full UTF-8 byte-mode preservation with 0 data loss',
        'Preserves line breaks, indentations, and punctuation',
        'Directly readable by all iOS Camera and Android Lens scanners',
        'Real-time byte capacity counter and error-correction control',
      ],
      standard: 'ISO/IEC 18004 Byte-Mode UTF-8 Standard',
      faq: {
        q: 'How many characters can a Text QR code hold?',
        a: 'Up to 2,953 bytes in standard Version 40 QR with Low error correction, or around 1,273 bytes with High error correction.',
      },
    },
    'wifi-to-qr': {
      title: 'Wi-Fi to QR Code Generator (Zero-Typing Connection)',
      subtitle:
        'Allow guests, customers, and team members to join your Wi-Fi network instantly with their phone camera without typing long passwords.',
      category: 'wifi',
      icon: Wifi,
      features: [
        'Supports WPA, WPA2, WPA3, WEP, and Open Networks',
        'Escapes special characters (\\, ;, :, ") according to ZXing specifications',
        'Hidden network SSID toggle option',
        'Compatible with Apple iOS 11+ and Android 10+ native cameras',
      ],
      standard: 'WIFI:S:<SSID>;T:<TYPE>;P:<PASS>;H:<HIDDEN>;; Syntax',
      faq: {
        q: 'Does the guest need to install an app to connect to Wi-Fi?',
        a: 'No. Modern iPhone and Android cameras automatically detect the Wi-Fi QR and display a "Join Network" prompt immediately.',
      },
    },
    'contact-to-qr': {
      title: 'vCard QR Code Generator for Business Cards',
      subtitle:
        'Create scannable contact cards containing your full name, organization, direct phone numbers, email, address, and portfolio link.',
      category: 'vcard',
      icon: Contact,
      features: [
        'Strict vCard 3.0 RFC standard formatting',
        'Allows one-tap "Save to Contacts" on iPhone and Android',
        'High Error Correction recommended for business card printing',
        'Includes work phone, mobile, physical address, and notes',
      ],
      standard: 'vCard 3.0 / RFC 2426 Contact Specification',
      faq: {
        q: 'Will scanning this add my contact directly to their address book?',
        a: 'Yes. Smartphone cameras parse the vCard format and offer a single-tap "Add to Contacts" or "Create New Contact" prompt.',
      },
    },
    'website-to-qr': {
      title: 'Website URL to QR Code Generator',
      subtitle:
        'Connect visitors directly to landing pages, campaigns, ecommerce stores, and digital menus with high-resolution vector exports.',
      category: 'url',
      icon: Globe,
      features: [
        'Preserves UTM tracking parameters and query strings',
        'High-resolution PNG and scalable vector SVG exports',
        'Optionally convertible to editable dynamic QR with analytics',
        'Compatible with custom frames ("SCAN ME", "VISIT WEBSITE")',
      ],
      standard: 'RFC 3986 Uniform Resource Identifier Specification',
      faq: {
        q: 'Can I track how many people scanned my website QR?',
        a: 'Yes. Use our Dynamic QR feature to track real-time scans, mobile vs desktop breakdown, and browsers.',
      },
    },
    'pdf-to-qr': {
      title: 'PDF to QR Code Generator (Cloud Hosted)',
      subtitle:
        'Upload brochures, restaurant menus, user manuals, and whitepapers up to 25MB. Generates an instant shareable cloud link encoded into a QR code.',
      category: 'file-pdf',
      icon: FileCheck,
      features: [
        'Secure multi-region cloud storage',
        'Instant mobile viewing in browser without file download barriers',
        'Manage and delete files from your personal vault at any time',
        'Vector and high-resolution print exports',
      ],
      standard: 'Secure HTTPS File URL Encoding',
      faq: {
        q: 'Does the QR code store the entire PDF file inside it?',
        a: 'No. QR codes store URLs because a PDF file is far too large for barcode bitmatrices. QYRO hosts the PDF securely and encodes its direct sharing link.',
      },
    },
  };

  const item = landingData[pageId] || landingData['text-to-qr'];
  const Icon = item.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fadeIn">
      {/* Top Banner */}
      <div className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7657FF] to-[#15D9F5] p-[2px] mx-auto">
          <div className="w-full h-full bg-[#080B18] rounded-[14px] flex items-center justify-center text-[#15D9F5]">
            <Icon className="w-7 h-7" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFF] font-heading leading-tight">
          {item.title}
        </h1>

        <p className="text-sm text-[#A8B4D0] max-w-2xl mx-auto leading-relaxed">
          {item.subtitle}
        </p>

        <div className="pt-2">
          <button
            onClick={() => onLaunchGenerator(item.category)}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7657FF] via-[#246BFD] to-[#15D9F5] hover:opacity-95 text-white font-bold text-sm shadow-xl glow-violet inline-flex items-center space-x-2 transition-all"
          >
            <span>Launch Generator for this Type</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-[#F8FAFF] font-heading">
          Technical Capabilities & Standards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {item.features.map((feat, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-xs text-[#F8FAFF]">{feat}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#25304B] flex items-center justify-between text-xs">
          <span className="text-[#A8B4D0]">Encoding Standard:</span>
          <span className="font-mono text-[#15D9F5]">{item.standard}</span>
        </div>
      </div>

      {/* FAQ Snippet */}
      <div className="bg-[#0D1428] border border-[#25304B] rounded-2xl p-6 space-y-2">
        <h4 className="text-xs font-bold text-[#F8FAFF] uppercase tracking-wider">
          {item.faq.q}
        </h4>
        <p className="text-xs text-[#A8B4D0] leading-relaxed">
          {item.faq.a}
        </p>
      </div>
    </div>
  );
};
