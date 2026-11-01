import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  Copy,
  ExternalLink,
  Flashlight,
  RefreshCw,
  Check,
  ShieldCheck,
  AlertTriangle,
  History,
  Trash2,
  FileText,
  Globe,
  Wifi,
  Contact,
  Phone,
  Mail,
  Share2,
  Maximize2
} from 'lucide-react';

interface ScanHistoryItem {
  id: string;
  content: string;
  category: string;
  timestamp: string;
}

export const QRScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'history'>('camera');
  const [decodedResult, setDecodedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('qyro_scan_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCopied, setIsCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      localStorage.setItem('qyro_scan_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save scan history:', e);
    }
  }, [history]);

  // Enumerate video devices
  const getCameraDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        // Prefer back / environment camera
        const backCam = videoInputs.find((d) => /back|environment|rear/i.test(d.label));
        setSelectedDeviceId(backCam ? backCam.deviceId : videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Enumerate devices error:', e);
    }
  };

  // Start Camera Stream
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanVideoFrame();
      }

      // Check flashlight support
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      setHasTorch(Boolean(capabilities?.torch));

      getCameraDevices();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not start camera stream: ' + (err.message || 'Unknown device error')
      );
      setIsScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const next = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: next }],
        });
        setTorchOn(next);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Video Scan Loop
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data && code.data.trim()) {
        handleCodeDetected(code.data.trim());
        return; // stop scanning after detect
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Handle Detected QR code
  const handleCodeDetected = (content: string) => {
    setDecodedResult(content);
    stopCamera();

    // Determine category
    let cat = 'Plain Text';
    if (/^https?:\/\//i.test(content)) cat = 'Website Link';
    else if (/^BEGIN:VCARD/i.test(content)) cat = 'Contact vCard';
    else if (/^WIFI:/i.test(content)) cat = 'Wi-Fi Configuration';
    else if (/^tel:/i.test(content)) cat = 'Phone Number';
    else if (/^mailto:/i.test(content)) cat = 'Email';
    else if (/^sms:/i.test(content)) cat = 'SMS Text';

    const newItem: ScanHistoryItem = {
      id: 'scan-' + Date.now(),
      content,
      category: cat,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  // Handle Image Upload Scanning
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            handleCodeDetected(code.data);
          } else {
            alert('No QR code could be detected in this image. Ensure the image is clear with good contrast.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, selectedDeviceId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isUrl = decodedResult && /^https?:\/\//i.test(decodedResult);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#F8FAFF] font-heading">
          QYRO High-Speed Scanner
        </h1>
        <p className="text-sm text-[#A8B4D0]">
          Scan with zero lag using your camera or upload any QR image. Decodes instantly with client-side privacy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#111A31] border border-[#25304B] p-1.5 rounded-2xl flex space-x-1">
          <button
            onClick={() => {
              setActiveTab('camera');
              setDecodedResult(null);
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md glow-violet'
                : 'text-[#A8B4D0] hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md glow-violet'
                : 'text-[#A8B4D0] hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              stopCamera();
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md glow-violet'
                : 'text-[#A8B4D0] hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Scan History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CAMERA */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          <div className="relative max-w-lg mx-auto aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black border-2 border-[#25304B] shadow-2xl flex items-center justify-center">
            {/* Hidden canvas for jsQR analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Preview */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />

            {/* Scanning Overlay Reticle */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Viewfinder Target */}
                <div className="relative w-64 h-64 border-2 border-[#15D9F5]/40 rounded-2xl flex items-center justify-center">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#15D9F5] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#15D9F5] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#15D9F5] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#15D9F5] rounded-br-lg" />

                  {/* Pulsing Scan Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#15D9F5] to-transparent shadow-[0_0_12px_#15D9F5] animate-bounce" />
                </div>
                <span className="mt-4 text-xs font-mono text-[#F8FAFF]/80 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  Align QR code within frame
                </span>
              </div>
            )}

            {/* Camera Controls Bar */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    torchOn ? 'bg-[#15D9F5] text-black shadow-lg' : 'bg-black/50 text-white hover:bg-black/80'
                  }`}
                  title="Toggle Torch"
                >
                  <Flashlight className="w-4 h-4" />
                </button>
              )}

              {devices.length > 1 && (
                <button
                  onClick={() => {
                    const nextIndex =
                      (devices.findIndex((d) => d.deviceId === selectedDeviceId) + 1) % devices.length;
                    setSelectedDeviceId(devices[nextIndex].deviceId);
                  }}
                  className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="absolute inset-0 bg-[#080B18]/95 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <h3 className="text-base font-bold text-[#F8FAFF]">Camera Unavailable</h3>
                <p className="text-xs text-[#A8B4D0] max-w-sm">{cameraError}</p>
                <button
                  onClick={() => startCamera(selectedDeviceId)}
                  className="px-4 py-2 bg-[#7657FF] text-white rounded-lg text-xs font-bold"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD IMAGE */}
      {activeTab === 'upload' && (
        <div className="max-w-lg mx-auto">
          <div className="border-2 border-dashed border-[#25304B] hover:border-[#15D9F5] rounded-3xl p-10 text-center bg-[#111A31] transition-all relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#080B18] border border-[#25304B] flex items-center justify-center text-[#15D9F5] group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-[#F8FAFF]">
                Drop QR code screenshot or image here
              </div>
              <p className="text-xs text-[#A8B4D0]">
                Supports PNG, JPEG, SVG, WebP. Decoded directly on your device.
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-[#7657FF] text-white rounded-lg text-xs font-semibold"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECODED RESULT MODAL / CARD */}
      {decodedResult && (
        <div className="max-w-lg mx-auto bg-[#111A31] border-2 border-[#15D9F5] rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-[#25304B]">
            <div className="flex items-center space-x-2 text-[#10B981]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-bold">QR Decoded Successfully</span>
            </div>
            <button
              onClick={() => {
                setDecodedResult(null);
                if (activeTab === 'camera') startCamera(selectedDeviceId);
              }}
              className="text-xs text-[#A8B4D0] hover:text-white font-semibold"
            >
              Scan Another
            </button>
          </div>

          {/* Decoded Text Content */}
          <div className="space-y-2">
            <span className="text-xs text-[#A8B4D0] font-semibold uppercase tracking-wider">
              Decoded Content
            </span>
            <div className="p-3 bg-[#080B18] rounded-xl border border-[#25304B] text-xs font-mono text-[#F8FAFF] break-all max-h-40 overflow-y-auto">
              {decodedResult}
            </div>
          </div>

          {/* Safety Check Notice */}
          {isUrl ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Safety First:</strong> QYRO never automatically redirects you to unknown websites. Inspect the destination above before proceeding.
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Safe local payload. No network request required.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleCopy(decodedResult)}
              className="py-2.5 px-4 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#F8FAFF] border border-[#25304B] text-xs font-bold flex items-center justify-center space-x-2 transition-all"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Copied!' : 'Copy Content'}</span>
            </button>

            {isUrl && (
              <a
                href={decodedResult}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:opacity-95 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open URL</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCAN HISTORY */}
      {activeTab === 'history' && (
        <div className="max-w-2xl mx-auto bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#25304B]">
            <h3 className="text-sm font-bold text-[#F8FAFF]">Recent Scans ({history.length})</h3>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A8B4D0]">
              No scans recorded yet. Use the camera or upload an image to begin.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] flex items-center justify-between space-x-3 hover:border-[#15D9F5]/40 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7657FF]/20 text-[#15D9F5]">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#A8B4D0]">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#F8FAFF] font-mono truncate">{item.content}</p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(item.content)}
                      className="p-2 rounded-lg bg-[#111A31] text-[#A8B4D0] hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {item.content.startsWith('http') && (
                      <a
                        href={item.content}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-[#111A31] text-[#15D9F5] hover:text-white"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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
