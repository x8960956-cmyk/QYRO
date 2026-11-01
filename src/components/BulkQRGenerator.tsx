import React, { useState } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  Layers,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Archive,
  Eye
} from 'lucide-react';

interface BulkItem {
  id: number;
  name: string;
  payload: string;
  dataUrl?: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export const BulkQRGenerator: React.FC = () => {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColIndex, setNameColIndex] = useState<number>(0);
  const [payloadColIndex, setPayloadColIndex] = useState<number>(1);
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  // Sample CSV generator
  const loadSampleCSV = () => {
    const sample = `Label,URL_Or_Payload,Category
Team Alpha,https://company.com/team/alpha,Staff
Team Beta,https://company.com/team/beta,Staff
Guest Wifi,WIFI:S:GuestPass;T:WPA;P:Secret2026;;,Network
VIP Badge,https://conference.org/badge/VIP-881,Events
Product 101,https://store.com/item/101,Commerce`;
    parseCSVString(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        parseCSVString(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCSVString = (text: string) => {
    setCsvText(text);
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    const rows = lines.map((l) => {
      // Split by comma ignoring commas inside quotes
      const match = l.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (match) return match.map((val) => val.replace(/^"|"$/g, '').trim());
      return l.split(',').map((c) => c.trim());
    });

    if (rows.length > 0) {
      setHeaders(rows[0]);
      setParsedRows(rows.slice(1));
      setNameColIndex(0);
      setPayloadColIndex(rows[0].length > 1 ? 1 : 0);
    }
  };

  const handleStartGeneration = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const items: BulkItem[] = parsedRows.map((row, idx) => ({
      id: idx + 1,
      name: row[nameColIndex] || `QR-${idx + 1}`,
      payload: row[payloadColIndex] || '',
      status: 'pending',
    }));

    setBulkItems(items);

    const generated: BulkItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = { ...items[i] };
      if (!item.payload) {
        item.status = 'failed';
        item.error = 'Empty payload';
      } else {
        try {
          const dataUrl = await QRCode.toDataURL(item.payload, {
            errorCorrectionLevel: 'M',
            margin: 3,
            width: 512,
            color: {
              dark: '#F8FAFF',
              light: '#080B18',
            },
          });
          item.dataUrl = dataUrl;
          item.status = 'success';
        } catch (err: any) {
          item.status = 'failed';
          item.error = err.message || 'Encoding failed';
        }
      }
      generated.push(item);
      setProgress(Math.round(((i + 1) / items.length) * 100));
      // update state in chunks
      if (i % 5 === 0 || i === items.length - 1) {
        setBulkItems([...generated, ...items.slice(i + 1)]);
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    const successItems = bulkItems.filter((item) => item.status === 'success' && item.dataUrl);
    if (successItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('qyro-bulk-qr-codes');

      successItems.forEach((item) => {
        const base64Data = item.dataUrl!.replace(/^data:image\/png;base64,/, '');
        const filename = `${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}-${item.id}.png`;
        folder?.file(filename, base64Data, { base64: true });
      });

      // Add a manifest CSV
      const manifest = [
        'ID,Name,Payload,Status',
        ...bulkItems.map((b) => `${b.id},"${b.name}","${b.payload}",${b.status}`),
      ].join('\n');
      folder?.file('manifest.csv', manifest);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qyro-bulk-export-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP generation error:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingle = (item: BulkItem) => {
    if (!item.dataUrl) return;
    const link = document.createElement('a');
    link.href = item.dataUrl;
    link.download = `${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    link.click();
  };

  const successCount = bulkItems.filter((i) => i.status === 'success').length;
  const failedCount = bulkItems.filter((i) => i.status === 'failed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#246BFD]/10 border border-[#246BFD]/30 text-xs font-semibold text-[#15D9F5] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>High-Throughput Batch Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Bulk QR Generator
          </h1>
          <p className="text-sm text-[#A8B4D0]">
            Generate hundreds of QR codes simultaneously from a spreadsheet. Export individual PNGs or a single ZIP.
          </p>
        </div>

        <button
          onClick={loadSampleCSV}
          className="px-4 py-2 bg-[#111A31] hover:bg-[#1A2646] border border-[#25304B] text-xs font-semibold text-[#15D9F5] rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Load Sample CSV</span>
        </button>
      </div>

      {/* CSV Upload & Mapping Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFF] font-heading">
              1. Upload CSV Spreadsheet
            </h3>

            <div className="border-2 border-dashed border-[#25304B] hover:border-[#15D9F5] rounded-xl p-6 text-center bg-[#0D1428] transition-all relative cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-[#15D9F5]" />
                <span className="text-xs font-semibold text-[#F8FAFF]">
                  Choose .CSV file or drag here
                </span>
                <span className="text-[10px] text-[#A8B4D0]">
                  Comma-delimited with header row
                </span>
              </div>
            </div>

            {headers.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#25304B]">
                <h4 className="text-xs font-bold text-[#A8B4D0] uppercase tracking-wider">
                  2. Map Columns
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFF] mb-1">
                    Label / Filename Column
                  </label>
                  <select
                    value={nameColIndex}
                    onChange={(e) => setNameColIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-xs text-[#F8FAFF]"
                  >
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h} (Column {i + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFF] mb-1">
                    QR Payload / URL Column *
                  </label>
                  <select
                    value={payloadColIndex}
                    onChange={(e) => setPayloadColIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D1428] border border-[#25304B] text-xs text-[#F8FAFF]"
                  >
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h} (Column {i + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartGeneration}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:opacity-90 text-white font-bold text-xs shadow-lg glow-violet transition-all flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating {progress}%...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Generate {parsedRows.length} QR Codes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results / Preview Section */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#25304B]">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFF] font-heading">
                  Batch Generation Results
                </h3>
                {bulkItems.length > 0 && (
                  <div className="flex items-center space-x-3 text-xs mt-1">
                    <span className="text-[#10B981] font-semibold">{successCount} Ready</span>
                    {failedCount > 0 && <span className="text-red-400 font-semibold">{failedCount} Failed</span>}
                  </div>
                )}
              </div>

              {successCount > 0 && (
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] hover:opacity-90 text-[#080B18] font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isZipping ? 'Archiving...' : 'Download All (.ZIP)'}</span>
                </button>
              )}
            </div>

            {bulkItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#A8B4D0]">
                Upload a CSV file or load the sample above to preview and batch generate QR codes.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                {bulkItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] flex items-center justify-between space-x-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.dataUrl ? (
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg bg-black p-0.5 border border-[#25304B] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#111A31] border border-[#25304B] flex items-center justify-center shrink-0">
                          {item.status === 'failed' ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-[#15D9F5] border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#F8FAFF] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#A8B4D0] truncate max-w-sm">
                          {item.payload}
                        </div>
                        {item.error && (
                          <div className="text-[10px] text-red-400 mt-0.5">{item.error}</div>
                        )}
                      </div>
                    </div>

                    {item.dataUrl && (
                      <button
                        onClick={() => handleDownloadSingle(item)}
                        className="p-2 rounded-lg bg-[#111A31] hover:bg-[#1A2646] text-[#15D9F5] hover:text-white shrink-0"
                        title="Download PNG"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
