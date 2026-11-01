import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  Check,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Globe,
  UploadCloud
} from 'lucide-react';

interface MyVaultProps {
  onOpenInGenerator: (category: string, data: any, design: any) => void;
}

export const MyVault: React.FC<MyVaultProps> = ({ onOpenInGenerator }) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'files'>('saved');
  const [savedQRs, setSavedQRs] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load saved QRs from backend or localStorage
  const loadSaved = async () => {
    try {
      const res = await fetch('/api/saved-qrs');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setSavedQRs(data.data);
      } else {
        const local = localStorage.getItem('qyro_saved_qrs');
        if (local) setSavedQRs(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem('qyro_saved_qrs');
      if (local) setSavedQRs(JSON.parse(local));
    }
  };

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.success) {
        setUploadedFiles(data.data);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    loadSaved();
    loadFiles();
  }, []);

  const handleDeleteSaved = async (id: string) => {
    if (!confirm('Remove this saved QR from your vault?')) return;
    try {
      await fetch(`/api/saved-qrs/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const updated = savedQRs.filter((item) => item.id !== id);
    setSavedQRs(updated);
    localStorage.setItem('qyro_saved_qrs', JSON.stringify(updated));
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm('Delete this uploaded file?')) return;
    try {
      await fetch(`/api/files/${filename}`, { method: 'DELETE' });
      setUploadedFiles((prev) => prev.filter((f) => f.filename !== filename));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQRs = savedQRs.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payload?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#7657FF]/10 border border-[#7657FF]/30 text-xs font-semibold text-[#15D9F5] mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Encrypted Personal Storage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFF] font-heading">
            My QR Vault
          </h1>
          <p className="text-sm text-[#A8B4D0]">
            Manage saved static codes, custom design presets, and uploaded assets.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-[#111A31] border border-[#25304B] p-1.5 rounded-2xl flex space-x-1">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md'
                : 'text-[#A8B4D0] hover:text-white'
            }`}
          >
            Saved QR Codes ({savedQRs.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md'
                : 'text-[#A8B4D0] hover:text-white'
            }`}
          >
            Uploaded Files ({uploadedFiles.length})
          </button>
        </div>
      </div>

      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#A8B4D0] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, payload or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#111A31] border border-[#25304B] rounded-xl text-xs text-[#F8FAFF] placeholder-[#4B597B] focus:border-[#15D9F5] focus:outline-none"
            />
          </div>

          {filteredQRs.length === 0 ? (
            <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#080B18] border border-[#25304B] flex items-center justify-center text-[#7657FF] mx-auto">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFF]">Vault is Empty</h3>
              <p className="text-xs text-[#A8B4D0]">
                When generating QR codes in the Generator, click "Save QR to Vault" to keep them organized here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQRs.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5]/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7657FF]/20 text-[#15D9F5] uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#A8B4D0]">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F8FAFF] font-heading line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="mt-2 p-2.5 bg-[#080B18] rounded-xl border border-[#25304B] text-xs font-mono text-[#A8B4D0] break-all line-clamp-2">
                      {item.payload}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#25304B] flex items-center justify-between">
                    <button
                      onClick={() => onOpenInGenerator(item.category, item.data, item.design)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D1428] hover:bg-[#1A2646] text-[#15D9F5] text-xs font-semibold transition-all"
                    >
                      Open in Studio
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(item.payload, item.id)}
                        className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-white"
                        title="Copy Payload"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSaved(item.id)}
                        className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {uploadedFiles.length === 0 ? (
            <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#080B18] border border-[#25304B] flex items-center justify-center text-[#15D9F5] mx-auto">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFF]">No Files Uploaded Yet</h3>
              <p className="text-xs text-[#A8B4D0]">
                Use the File-to-QR feature in the Generator to upload PDFs, images, or documents.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#080B18] border border-[#25304B] flex items-center justify-center text-[#15D9F5]">
                        {file.mimeType?.includes('pdf') ? (
                          <FileCheck className="w-5 h-5 text-red-400" />
                        ) : file.mimeType?.includes('image') ? (
                          <ImageIcon className="w-5 h-5 text-[#10B981]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#7657FF]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#F8FAFF] truncate">
                          {file.originalName}
                        </h4>
                        <span className="text-[10px] text-[#A8B4D0]">
                          {Math.round(file.size / 1024)} KB · {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-[#080B18] rounded-lg border border-[#25304B] text-[11px] font-mono text-[#A8B4D0] truncate">
                      {file.url}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#25304B] flex items-center justify-between">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#15D9F5] hover:underline flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </a>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(file.url, file.id)}
                        className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-white"
                        title="Copy URL"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.filename)}
                        className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
