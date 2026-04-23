"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ImageIcon, Zap, X, FileImage, AlertCircle, CheckCircle2,
  ArrowRight, Info, BarChart3, RefreshCw, Wifi, WifiOff, Maximize2, Download,
} from "lucide-react";
import { denoiseImage, DenoiseResponse, checkHealth } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

type AnimationStage = "idle" | "scanning_original" | "scanning_noise" | "done" | "error";

import dicomParser from "dicom-parser";

/* ============================================
   DICOM → canvas preview helper (client-side)
   Uses dicom-parser to safely extract metadata
   ============================================ */
async function dicomFileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const byteArray = new Uint8Array(buf);

  let dataSet;
  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err) {
    throw new Error("Invalid or unsupported DICOM file format");
  }

  // Extract dimensions (Tags: 0028,0010 and 0028,0011)
  const rows = dataSet.uint16("x00280010") || 512;
  const cols = dataSet.uint16("x00280011") || 512;

  // Locate pixel data (Tag: 7FE0,0010)
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) {
    throw new Error("Pixel data tag not found in DICOM");
  }

  // Safely get the pixel data array offset and length
  const pixelData = new Uint16Array(
    buf,
    pixelDataElement.dataOffset,
    pixelDataElement.length / 2
  );

  // Normalize 16-bit values to 8-bit for canvas display
  let minVal = 65535, maxVal = 0;
  for (let i = 0; i < pixelData.length; i++) {
    if (pixelData[i] < minVal) minVal = pixelData[i];
    if (pixelData[i] > maxVal) maxVal = pixelData[i];
  }
  const range = maxVal - minVal || 1;

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(cols, rows);

  for (let i = 0; i < pixelData.length; i++) {
    const v = Math.round(((pixelData[i] - minVal) / range) * 255);
    imgData.data[i * 4]     = v;
    imgData.data[i * 4 + 1] = v;
    imgData.data[i * 4 + 2] = v;
    imgData.data[i * 4 + 3] = 255;
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/* ============================================
   UPLOAD ZONE
   ============================================ */
function UploadZone({ onFile, file, onClear, disabled }: {
  onFile: (f: File) => void; file: File | null;
  onClear: () => void; disabled: boolean;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted[0]) onFile(accepted[0]); },
    [onFile]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"], "application/dicom": [".dcm", ".dicom"] },
    maxFiles: 1,
    disabled: !!file || disabled,
  });

  if (file) {
    return (
      <div className="rounded-2xl border border-[#2563EB]/40 bg-[#0d0d0d] p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#1a2744] flex items-center justify-center flex-shrink-0">
          <FileImage className="w-5 h-5 text-[#22D3EE]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#E5E7EB] text-sm truncate">{file.name}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {(file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
            {file.name.toLowerCase().endsWith(".dcm") || file.name.toLowerCase().endsWith(".dicom") ? "DICOM" : "Image"}
          </p>
        </div>
        <button id="clear-file-btn" onClick={onClear} disabled={disabled}
          className="w-8 h-8 rounded-lg hover:bg-red-900/30 disabled:opacity-50 flex items-center justify-center text-[#6B7280] hover:text-red-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} id="drop-zone" className={`
      relative rounded-2xl border-2 border-dashed transition-all duration-200
      p-10 flex flex-col items-center justify-center gap-4 text-center
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${isDragActive ? "border-[#2563EB] bg-[#0d0d0d]" : "border-[#1a1a1a] bg-black hover:border-[#2563EB]/50 hover:bg-[#0d0d0d]"}
    `}>
      <input {...getInputProps()} id="file-input" />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? "bg-[#2563EB] scale-110" : "bg-[#1a2744]"}`}>
        <Upload className={`w-6 h-6 ${isDragActive ? "text-white" : "text-[#22D3EE]"}`} />
      </div>
      <div>
        <p className="text-[#E5E7EB] font-semibold text-base">{isDragActive ? "Drop your X-ray here" : "Upload X-ray or DICOM"}</p>
        <p className="text-sm text-[#6B7280] mt-1">Drag & drop or click · PNG, JPG, DCM, DICOM</p>
      </div>
    </div>
  );
}

/* ============================================
   SCANNING LASER
   ============================================ */
const ScanningLaser = ({ color }: { color: string }) => (
  <>
    <motion.div className="absolute left-0 right-0 h-1 z-20"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 20px ${color}, 0 0 40px ${color}` }}
      initial={{ top: "0%" }} animate={{ top: "100%" }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
    <motion.div className="absolute inset-0 z-10 pointer-events-none opacity-20"
      style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)`, backgroundSize: "100% 200%" }}
      initial={{ backgroundPosition: "0% 0%" }} animate={{ backgroundPosition: "0% 100%" }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
  </>
);

/* ============================================
   RESULT PANEL
   ============================================ */
function ResultPanel({ label, accentColor, imageSrc, isEmpty, description, isScanning }: {
  label: string; accentColor: string; imageSrc?: string | null;
  isEmpty: boolean; description: string; isScanning?: boolean;
}) {
  const [enlarged, setEnlarged] = useState(false);

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = `${label.replace(/\s+/g, "_").toLowerCase()}.png`;
    a.click();
  };

  return (
    <>
      <div className="relative group w-full">
        <AnimatePresence>
          {isScanning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="absolute -inset-[3px] rounded-2xl z-0 blur-md"
              style={{ backgroundColor: accentColor }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }} />
          )}
        </AnimatePresence>

        <div className={`rounded-2xl overflow-hidden flex flex-col h-[42vh] sm:h-[55vh] md:h-[60vh] min-h-[280px] sm:min-h-[380px] relative z-10 border transition-all duration-300 bg-[#0a0a0a] ${isScanning ? "border-transparent" : "border-[#1a1a1a]"}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-black/60 backdrop-blur-md z-20 flex-shrink-0">
            <span className="font-bold text-sm text-[#E5E7EB]">{label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: accentColor + "22", color: accentColor }}>
                {label.toUpperCase()}
              </span>
              {!isEmpty && imageSrc && (
                <>
                  <button onClick={handleDownload}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1a1a1a] transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5 text-[#6B7280] hover:text-[#22D3EE]" />
                  </button>
                  <button onClick={() => setEnlarged(true)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#1a1a1a] transition-colors" title="Expand">
                    <Maximize2 className="w-3.5 h-3.5 text-[#6B7280] hover:text-[#22D3EE]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 bg-[#050505] relative flex items-center justify-center overflow-hidden">
            {isEmpty ? (
              <div className="flex flex-col items-center gap-4 text-center p-6 z-20">
                {isScanning ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
                    <p className="text-sm font-medium animate-pulse" style={{ color: accentColor }}>Processing {label}...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-9 h-9 text-[#2a2a2a]" />
                    <p className="text-xs text-[#4B5563]">{description}</p>
                  </>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {imageSrc && (
                  <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }} src={imageSrc} alt={label}
                    className="w-full h-full object-contain z-10" />
                )}
              </AnimatePresence>
            )}
            {isScanning && !isEmpty && <ScanningLaser color={accentColor} />}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-xs text-[#6B7280] border-t border-[#1a1a1a] truncate bg-black/60 z-20 flex-shrink-0">
            {description}
          </div>
        </div>
      </div>

      {/* Lightbox — fully responsive */}
      {enlarged && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
          onClick={() => setEnlarged(false)}>
          <div className="relative w-full max-w-5xl flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-[#9CA3AF] text-sm font-medium">{label} — {description}</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2563EB] text-[#9CA3AF] hover:text-white text-xs font-medium transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => setEnlarged(false)}
                  className="w-8 h-8 bg-[#1a1a1a] hover:bg-[#1a1a1a]/80 text-white rounded-lg flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt={label}
              className="w-auto h-auto rounded-xl object-contain shadow-2xl"
              style={{ maxWidth: "100%", maxHeight: "calc(100vh - 120px)" }} />
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================
   ROUTING BANNER
   ============================================ */
function RoutingBanner({ result }: { result: DenoiseResponse }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 flex items-start gap-3 border mb-6 ${
        result.was_bypassed ? "bg-emerald-950/30 border-emerald-800/40" : "bg-[#0d0d0d] border-[#1a2744]"
      }`}>
      {result.was_bypassed
        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        : <Zap className="w-5 h-5 text-[#22D3EE] flex-shrink-0 mt-0.5" />}
      <div>
        <p className={`font-semibold text-sm ${result.was_bypassed ? "text-emerald-300" : "text-[#22D3EE]"}`}>
          {result.routing_message}
        </p>
        <p className="text-xs mt-0.5 text-[#6B7280]">
          Noise variance: <strong className="text-[#9CA3AF]">{result.noise_variance.toFixed(2)}</strong>
          {" · "}Image: {result.width} × {result.height} px
        </p>
      </div>
    </motion.div>
  );
}

/* ============================================
   BACKEND STATUS
   ============================================ */
function BackendStatus({ online }: { online: boolean | null }) {
  if (online === null) return null;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${
      online ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-400" : "bg-red-950/30 border-red-800/40 text-red-400"
    }`}>
      {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {online ? "Backend Online" : "Backend Offline"}
    </div>
  );
}

/* ============================================
   DENOISE PAGE
   ============================================ */
export default function DenoisePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Auth gate: redirect to sign-in if not authenticated ──
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/signin?redirect=/denoise");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<AnimationStage>("idle");
  const [result, setResult] = useState<DenoiseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const checkBackend = useCallback(async () => {
    try { await checkHealth(); setBackendOnline(true); }
    catch { setBackendOnline(false); }
  }, []);

  useEffect(() => { if (authChecked) checkBackend(); }, [authChecked, checkBackend]);

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null); setErrorMsg(""); setStage("idle");
    const isDicom = f.name.toLowerCase().endsWith(".dcm") || f.name.toLowerCase().endsWith(".dicom");
    if (isDicom) {
      try {
        const dataUrl = await dicomFileToDataUrl(f);
        setLocalPreview(dataUrl);
      } catch {
        // fallback: show object URL (will likely be blank for DICOM but not crash)
        setLocalPreview(URL.createObjectURL(f));
      }
    } else {
      setLocalPreview(URL.createObjectURL(f));
    }
  };

  const handleClear = () => {
    setFile(null); setLocalPreview(null);
    setResult(null); setErrorMsg(""); setStage("idle");
  };

  const handleProcess = async () => {
    if (!file) return;
    setResult(null); setErrorMsg("");
    setStage("scanning_original");
    const minWait = new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const apiPromise = denoiseImage(file);
      const [data] = await Promise.all([apiPromise, minWait]) as [DenoiseResponse, unknown];
      setResult(data);
      setStage("scanning_noise");
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStage("done");
      setBackendOnline(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg); setStage("error"); setBackendOnline(false);
    }
  };

  const isProcessing = stage === "scanning_original" || stage === "scanning_noise";
  const isDone = stage === "done";
  const isError = stage === "error";
  const showOriginal = stage !== "idle";
  const showNoise = stage === "scanning_noise" || stage === "done";
  const showEnhanced = stage === "done";

  // Show nothing while checking auth (prevents flash)
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
          <p className="text-sm text-[#6B7280]">Checking authentication…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black orb-bg pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 pt-24 sm:pt-28 flex flex-col gap-6 sm:gap-10">

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="pill-badge"><Zap className="w-3 h-3" />AI Inference Engine</div>
            <BackendStatus online={backendOnline} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#E5E7EB] mb-2 sm:mb-3">
            Use <span className="text-gradient">Denoise X</span>
          </h1>
          <p className="text-[#9CA3AF] text-sm sm:text-lg max-w-2xl">
            Upload your chest X-ray (DICOM, PNG, or JPEG) and the N2N U-Net engine delivers clinical outputs in seconds.
          </p>
        </div>

        {/* Upload & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#1a1a1a]">
            <h2 className="font-bold text-[#E5E7EB] mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#22D3EE]" />Upload Image
            </h2>
            <UploadZone onFile={handleFile} file={file} onClear={handleClear} disabled={isProcessing} />

            {file && !isProcessing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button id="process-btn" className="btn-purple w-full h-12 mt-5 rounded-xl text-base font-bold gap-2" onClick={handleProcess}>
                  {isDone ? <><RefreshCw className="w-4 h-4" /> Re-process</> : <><Zap className="w-4 h-4" /> Enhance X-Ray <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center gap-3 text-sm text-[#22D3EE] font-medium">
                <div className="w-4 h-4 rounded-full border-2 border-[#22D3EE] border-t-transparent animate-spin" />
                {stage === "scanning_original" ? "Initializing AI Engine & Analyzing Image..." : "Generating Noise Map & Enhancing..."}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 border border-[#1a1a1a]">
              <h3 className="font-bold text-[#E5E7EB] flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-[#22D3EE]" />Pipeline Steps
              </h3>
              {[
                { step: "1", text: "Smart Gateway measures noise variance in flat tissue" },
                { step: "2", text: "N2N U-Net denoising isolates residual noise map" },
                { step: "3", text: "CLAHE + soft unsharp masking applied to final output" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#1a2744] text-[#22D3EE] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {isDone && result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-[#1a1a1a]">
                  <h3 className="font-bold text-[#E5E7EB] flex items-center gap-2 text-sm mb-4">
                    <BarChart3 className="w-4 h-4 text-[#22D3EE]" />Inference Report
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Routing",     value: result.was_bypassed ? "Bypassed" : "Processed" },
                      { label: "Noise Var.",  value: result.noise_variance.toFixed(2) },
                      { label: "Enhancement", value: "CLAHE+USM" },
                      { label: "Time",        value: `${result.processing_time_ms.toFixed(0)} ms` },
                    ].map((s) => (
                      <div key={s.label} className="stat-card !py-3 !px-3 flex flex-col items-center justify-center text-center">
                        <div className="font-bold text-gradient text-sm md:text-base leading-tight">{s.value}</div>
                        <div className="text-[10px] md:text-xs text-[#6B7280] mt-1 uppercase tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300 text-base mb-1">Processing Failed</p>
              <p className="text-sm text-red-400">{errorMsg}</p>
              <p className="text-xs text-red-500 mt-2">
                Run <code className="bg-red-950/60 px-1.5 py-0.5 rounded font-mono text-red-300">uvicorn main:app --reload</code> in the{" "}
                <code className="bg-red-950/60 px-1.5 py-0.5 rounded font-mono text-red-300">backend/</code> directory.
              </p>
            </div>
          </motion.div>
        )}

        {/* Routing Banner */}
        {isDone && result && <RoutingBanner result={result} />}

        {/* 3 Card View */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#E5E7EB] flex items-center gap-3">
            <Maximize2 className="w-6 h-6 text-[#22D3EE]" />Analysis Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <ResultPanel label="Original Image" accentColor="#60a5fa"
              imageSrc={localPreview} isEmpty={!showOriginal}
              description="Raw uploaded scan" isScanning={stage === "scanning_original"} />
            <ResultPanel label="Noise Map" accentColor="#ef4444"
              imageSrc={result?.noise_map_b64} isEmpty={!showNoise}
              description="Isolated residual noise" isScanning={stage === "scanning_noise"} />
            <ResultPanel label="Enhanced Result" accentColor="#22D3EE"
              imageSrc={result?.enhanced_b64} isEmpty={!showEnhanced}
              description="Final clinical output" isScanning={false} />
          </div>
        </div>

      </div>
    </div>
  );
}
