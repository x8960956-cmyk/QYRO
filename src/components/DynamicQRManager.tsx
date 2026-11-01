import React, { useState, useEffect } from 'react';
import { DynamicQRItem } from '../types/qr';
import {
  Zap,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  BarChart2,
  Calendar,
  Clock,
  History,
  CheckCircle,
  PauseCircle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';

interface DynamicQRManagerProps {
  onViewAnalytics: (qrId: string) => void;
  onOpenInGenerator: (destination: string, title: string) => void;
}

export const DynamicQRManager: React.FC<DynamicQRManagerProps> = ({
  onViewAnalytics,
  onOpenInGenerator,
}) => {
  const [qrs, setQrs] = useState<DynamicQRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQR, setEditingQR] = useState<DynamicQRItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDest, setFormDest] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('website');
  const [formNotes, setFormNotes] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dynamic-qrs');
      const data = await res.json();
      if (data.success) {
        setQrs(data.data);
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch dynamic QRs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const openCreateModal = () => {
    setEditingQR(null);
    setFormTitle('');
    setFormDest('');
    setFormCode('');
    setFormCategory('website');
    setFormNotes('');
    setFormExpiresAt('');
    setIsModalOpen(true);
  };

  const openEditModal = (qr: DynamicQRItem) => {
    setEditingQR(qr);
    setFormTitle(qr.title);
    setFormDest(qr.destination);
    setFormCode(qr.code);
    setFormCategory(qr.category);
    setFormNotes(qr.notes || '');
    setFormExpiresAt(qr.expiresAt || '');
    setIsModalOpen(true);
  };

  const handleSaveQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDest) return;

    setSubmitting(true);
    try {
      if (editingQR) {
        // Update
        const res = await fetch(`/api/dynamic-qrs/${editingQR.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            destination: formDest,
            notes: formNotes,
            expiresAt: formExpiresAt || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          fetchQRs();
          setIsModalOpen(false);
        } else {
          alert(result.error);
        }
      } else {
        // Create
        const res = await fetch('/api/dynamic-qrs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            destination: formDest,
            customCode: formCode,
            category: formCategory,
            notes: formNotes,
            expiresAt: formExpiresAt || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          fetchQRs();
          setIsModalOpen(false);
        } else {
          alert(result.error);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (qr: DynamicQRItem) => {
    const nextStatus = qr.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/dynamic-qrs/${qr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setQrs((prev) => prev.map((q) => (q.id === qr.id ? { ...q, status: nextStatus } : q)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dynamic QR? All redirect data and scan metrics will be removed.')) return;
    try {
      const res = await fetch(`/api/dynamic-qrs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQrs((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRedirectUrl = (code: string) => {
    const origin = window.location.origin;
    return `${origin}/r/${code}`;
  };

  const handleCopyLink = (code: string, id: string) => {
    navigator.clipboard.writeText(getRedirectUrl(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#15D9F5]/10 border border-[#15D9F5]/30 text-xs font-semibold text-[#15D9F5] mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Server-Authoritative Dynamic Routing</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Dynamic QR Codes
          </h1>
          <p className="text-sm text-[#A8B4D0]">
            Change destinations anytime without re-printing posters or packaging. Track every scan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:from-[#896DFF] hover:to-[#387BFE] text-white font-bold text-xs shadow-lg glow-violet flex items-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Dynamic QR</span>
        </button>
      </div>

      {/* Grid of Dynamic QRs */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-3 border-[#15D9F5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : qrs.length === 0 ? (
        <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#080B18] border border-[#25304B] flex items-center justify-center text-[#7657FF] mx-auto">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#F8FAFF]">No Dynamic QRs Yet</h3>
          <p className="text-xs text-[#A8B4D0]">
            Create a dynamic QR code with an editable destination URL, scan analytics, and pause controls.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#7657FF] hover:bg-[#896DFF] text-white rounded-xl text-xs font-bold"
          >
            Create Your First Dynamic QR
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrs.map((qr) => {
            const redirectUrl = getRedirectUrl(qr.code);
            const isPaused = qr.status === 'paused';
            return (
              <div
                key={qr.id}
                className="bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5]/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        isPaused
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                      }`}
                    >
                      {isPaused ? <PauseCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      <span>{isPaused ? 'PAUSED' : 'ACTIVE'}</span>
                    </span>

                    <span className="text-xs text-[#A8B4D0] font-mono flex items-center space-x-1">
                      <BarChart2 className="w-3.5 h-3.5 text-[#15D9F5]" />
                      <strong className="text-[#F8FAFF]">{qr.scansCount || 0}</strong> scans
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFF] font-heading line-clamp-1">
                    {qr.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs text-[#15D9F5] font-mono break-all line-clamp-1">
                      /r/{qr.code}
                    </span>
                  </div>
                </div>

                {/* Destination info */}
                <div className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-[#A8B4D0]">
                    <span>Current Destination</span>
                    <span>{qr.history?.length || 1} revision(s)</span>
                  </div>
                  <a
                    href={qr.destination}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#F8FAFF] hover:text-[#15D9F5] flex items-center space-x-1.5 truncate group/link"
                  >
                    <span className="truncate">{qr.destination}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover/link:opacity-100" />
                  </a>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-[#25304B] flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyLink(qr.code, qr.id)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-[#F8FAFF] transition-all"
                      title="Copy Short URL"
                    >
                      {copiedId === qr.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenInGenerator(redirectUrl, qr.title)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-[#15D9F5] transition-all"
                      title="Design & Download QR"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onViewAnalytics(qr.id)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-[#7657FF] transition-all"
                      title="View Scan Analytics"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(qr)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-white transition-all"
                      title={isPaused ? 'Resume Redirect' : 'Pause Redirect'}
                    >
                      {isPaused ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <PauseCircle className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(qr)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-white transition-all"
                      title="Edit Destination"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="p-2 rounded-lg bg-[#0D1428] text-[#A8B4D0] hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111A31] border border-[#25304B] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#25304B]">
              <h3 className="text-base font-bold text-[#F8FAFF] font-heading">
                {editingQR ? 'Edit Destination URL' : 'Create Dynamic QR'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-[#A8B4D0] hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveQR} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Title / Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Summer Promo 2026 Table Tents"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={formDest}
                  onChange={(e) => setFormDest(e.target.value)}
                  placeholder="https://mywebsite.com/landing"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#A8B4D0]">
                  You can change this target address at any time in the future.
                </p>
              </div>

              {!editingQR && (
                <div>
                  <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                    Custom Shortcode (Optional)
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-[#25304B] bg-[#0D1428]">
                    <span className="px-3 py-2 bg-[#111A31] text-[#A8B4D0] text-xs border-r border-[#25304B]">
                      /r/
                    </span>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="summer-vip"
                      className="w-full px-3 py-2 bg-transparent text-sm text-[#F8FAFF] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Optional Expiration Date
                </label>
                <input
                  type="datetime-local"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-xs text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Printed on 500 flyers by print shop"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-xs text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#25304B] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0D1428] text-xs text-[#A8B4D0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white text-xs font-bold shadow-lg"
                >
                  {submitting ? 'Saving...' : editingQR ? 'Update Destination' : 'Create Dynamic QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
