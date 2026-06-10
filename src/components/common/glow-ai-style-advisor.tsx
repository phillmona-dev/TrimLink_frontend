"use client";

/**
 * GlowLink AI Style Advisor
 *
 * Cream/rose-gold themed variant of the AI Style Advisor for GlowLink.
 * Three-step experience:
 *   Step 1 — Capture  : camera or file upload
 *   Step 2 — Analysing: loading animation while AI processes
 *   Step 3 — Results  : face shape + 3 recommended styles
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Camera, Upload, RefreshCw, Sparkles,
  ChevronRight, AlertCircle, Check, Zap,
  MessageSquare, Send, Flower,
} from "lucide-react";
import {
  analyzeAndRecommend,
  type StyleItem,
  type AIRecommendationResult,
} from "@/api/aiStyleService";
import {
  sendChatMessage,
  type ChatMessage,
} from "@/api/aiChatService";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface GlowAIStyleAdvisorProps {
  open: boolean;
  onClose: () => void;
  styles: StyleItem[];
  onStyleSelect?: (style: StyleItem) => void;
}

type Step = "capture" | "analysing" | "results";
type Mode = "face" | "chat";

/* ─── GlowLink brand palette ─────────────────────────────────────────── */

const ACCENT      = "#D4864A";          // warm amber-orange
const ACCENT_SOFT = "#F5B07B";
const BG_CARD     = "#FBF7F3";          // warm cream
const BG_MODAL    = "#FDF9F6";
const BORDER      = "#F0E4D8";
const TEXT_MAIN   = "#5C3D2E";
const TEXT_MUTED  = "#B5A090";

/* ─── Face-shape tint mapping ────────────────────────────────────────── */

const FACE_SHAPE_COLORS: Record<string, string> = {
  oval:     "#D4864A",
  round:    "#c084fc",
  square:   "#60a5fa",
  heart:    "#f472b6",
  oblong:   "#34d399",
  diamond:  "#fbbf24",
  triangle: "#4ade80",
};

function faceShapeColor(shape: string): string {
  return FACE_SHAPE_COLORS[shape.toLowerCase()] ?? ACCENT;
}

/* ─── Spinner ────────────────────────────────────────────────────────── */

function SpinnerRing({ color = ACCENT }: { color?: string }) {
  return (
    <svg className="animate-spin" width={52} height={52} viewBox="0 0 52 52" fill="none">
      <circle cx={26} cy={26} r={22} stroke={`${color}25`} strokeWidth={4} />
      <path d="M26 4 a22 22 0 0 1 22 22" stroke={color} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/* ─── Glow Chat Panel ─────────────────────────────────────────────── */

function GlowChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "Best braids for a heart face? 🌸",
    "How to moisturise 4c hair?",
    "Natural skincare for melanin skin ✨",
    "What style suits an oval face?",
    "How to reduce hyperpigmentation?",
    "Nail shapes for short fingers? 💅",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await sendChatMessage(newMessages, "glowlink");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err.message ?? "Error — please try again."}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 520 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 540 }}>
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
            >
              <Flower className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-black mb-1" style={{ color: TEXT_MAIN, fontFamily: "'Cormorant Garamond', serif" }}>
              Hi, I'm Glow AI 🌸
            </p>
            <p className="text-xs max-w-xs mx-auto" style={{ color: TEXT_MUTED }}>
              Your personal beauty & wellness expert! Ask me about hair, skincare, nails, makeup and more.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
                  style={{ background: `${ACCENT}14`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {m.role === "assistant" && (
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
              >
                <Flower className="w-3 h-3 text-white" />
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
              style={m.role === "user" ? {
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                color: "#fff", fontWeight: 600,
                borderBottomRightRadius: 4,
              } : {
                background: `${ACCENT}08`,
                border: `1px solid ${BORDER}`,
                color: TEXT_MAIN,
                borderBottomLeftRadius: 4,
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
            >
              <Flower className="w-3 h-3 text-white" />
            </div>
            <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: `${ACCENT}08`, border: `1px solid ${BORDER}` }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ACCENT }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about hair, skin, nails, makeup…"
            disabled={loading}
            className="flex-1 h-10 px-4 rounded-2xl text-xs font-medium focus:outline-none disabled:opacity-50"
            style={{ background: `${ACCENT}08`, border: `1.5px solid ${BORDER}`, color: TEXT_MAIN }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`, boxShadow: input.trim() ? `0 0 14px ${ACCENT}40` : "none" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Recommendation Card ────────────────────────────────────────────── */

function RecommendationCard({
  style, reason, index, selected, onSelect,
}: {
  style: StyleItem; reason: string; index: number; selected: boolean; onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 280, damping: 24 }}
      onClick={onSelect}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
      style={{
        border: selected ? `2px solid ${ACCENT}` : `2px solid ${BORDER}`,
        background: BG_CARD,
        boxShadow: selected ? `0 0 20px ${ACCENT}30` : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={style.imageUrl}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Selected badge */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: ACCENT }}
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rank badge */}
        <div
          className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
          style={{ background: "rgba(0,0,0,0.55)", border: "1.5px solid rgba(255,255,255,0.3)" }}
        >
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1 flex-1 flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: ACCENT }}>
          {style.category}
        </span>
        <h4 className="text-[11px] font-black leading-tight" style={{ color: TEXT_MAIN }}>{style.name}</h4>
        <p className="text-[10px] leading-relaxed flex-1" style={{ color: TEXT_MUTED }}>{reason}</p>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="mt-2 w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          style={{
            background: selected ? ACCENT : `${ACCENT}15`,
            color: selected ? "#fff" : ACCENT,
            border: `1px solid ${selected ? ACCENT : `${ACCENT}30`}`,
          }}
        >
          {selected ? "✓ Chosen" : "Choose"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export function GlowAIStyleAdvisor({
  open, onClose, styles, onStyleSelect,
}: GlowAIStyleAdvisorProps) {
  const [mode, setMode]               = useState<Mode>("face");
  const [step, setStep]               = useState<Step>("capture");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [result, setResult]           = useState<AIRecommendationResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Camera helpers */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 640 },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setError("Camera access denied. Please use the Upload option instead.");
    }
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const handleVideoReady = useCallback(() => setCameraReady(true), []);

  const snapPhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera feed isn't ready yet — please wait a moment and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) { setError("Could not capture photo. Please try again."); return; }
      stopCamera();
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCapturedBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  }, [stopCamera]);

  const reset = useCallback(() => {
    stopCamera();
    setCapturedBlob(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setSelectedId(null);
    setCameraReady(false);
    setStep("capture");
  }, [stopCamera]);

  const handleClose = useCallback(() => { reset(); setMode("face"); onClose(); }, [reset, onClose]);

  const analyse = useCallback(async () => {
    if (!capturedBlob) return;
    setError(null);
    setStep("analysing");
    try {
      const res = await analyzeAndRecommend(capturedBlob, styles);
      setResult(res);
      setStep("results");
    } catch (err: any) {
      setError(err.message ?? "Unknown error. Please try again.");
      setStep("capture");
    }
  }, [capturedBlob, styles]);

  const handleChoose = useCallback((styleId: string) => {
    setSelectedId(styleId);
    const found = styles.find((s) => s.id === styleId);
    if (found && onStyleSelect) onStyleSelect(found);
  }, [styles, onStyleSelect]);

  /* ── Render ── */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{
            backgroundImage: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(140,60,20,0.1) 20%, rgba(140,60,20,0.4) 100%), url('/glow/glow_desk_bg.png'), linear-gradient(135deg, #FDF6F0 0%, #F5E6D8 50%, #EDD5C0 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 28, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full rounded-[2rem] overflow-hidden flex flex-col"
            style={{
              maxWidth: mode === "chat" ? 640 : (step === "results" ? 860 : 520),
              maxHeight: "92vh",
              background: BG_MODAL,
              border: `1.5px solid ${BORDER}`,
              boxShadow: "0 40px 80px rgba(80,30,10,0.3), 0 0 0 1px rgba(212,134,74,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black leading-none" style={{ color: TEXT_MAIN, fontFamily: "'Cormorant Garamond', serif" }}>
                    Glow AI Beauty Advisor
                  </h2>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: TEXT_MUTED }}>
                    Powered by Llama 4 Vision
                  </p>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: `${ACCENT}12`, color: TEXT_MUTED }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex px-6 pt-3 gap-2 flex-shrink-0">
              {(["face", "chat"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                  style={mode === m ? {
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                    color: "#fff",
                    boxShadow: `0 0 12px ${ACCENT}35`,
                  } : {
                    background: `${ACCENT}10`,
                    color: TEXT_MUTED,
                    border: `1px solid ${BORDER}`,
                  }}>
                  {m === "face"
                    ? <><Camera className="w-3 h-3" /> Face Analysis</>
                    : <><MessageSquare className="w-3 h-3" /> Chat with Glow AI</>}
                </button>
              ))}
            </div>

            {/* Step indicator — only shown in face analysis mode */}
            <div
              className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${BORDER}`, display: mode === "face" ? "flex" : "none" }}
            >
              {(["capture", "analysing", "results"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: step === s ? 24 : 8,
                      background: step === s
                        ? ACCENT
                        : i < ["capture", "analysing", "results"].indexOf(step)
                        ? `${ACCENT}50`
                        : `${ACCENT}18`,
                    }}
                  />
                </div>
              ))}
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                {step === "capture" ? "Step 1 of 3 — Photo"
                  : step === "analysing" ? "Step 2 of 3 — Analysing"
                  : "Step 3 of 3 — Results"}
              </span>
            </div>


            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {/* Chat mode */}
              {mode === "chat" && <GlowChatPanel />}

              {/* Face analysis mode */}
              {mode === "face" && <>

              {/* ── STEP 1: CAPTURE ── */}
              {step === "capture" && (
                <div className="p-6 space-y-5">
                  {/* Error banner */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 rounded-2xl"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-500 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  {/* Camera / preview area */}
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{ aspectRatio: "1/1", background: `${ACCENT}08`, border: `1.5px solid ${BORDER}` }}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : cameraActive ? (
                      <>
                        <video
                          ref={videoRef} autoPlay playsInline muted
                          onLoadedMetadata={handleVideoReady}
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {!cameraReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-sm">
                            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
                            <p className="text-[10px] font-medium" style={{ color: TEXT_MUTED }}>Starting camera…</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}
                        >
                          <Camera className="w-7 h-7" style={{ color: ACCENT }} />
                        </div>
                        <p className="text-xs font-medium text-center px-8" style={{ color: TEXT_MUTED }}>
                          Take a selfie or upload a photo to get personalised beauty & style recommendations
                        </p>
                      </div>
                    )}

                    {/* Oval guide overlay */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="rounded-full" style={{ width: "60%", height: "75%", border: `2px dashed ${ACCENT}50` }} />
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {!previewUrl ? (
                    <div className="flex gap-3">
                      {cameraActive ? (
                        <>
                          <button
                            onClick={snapPhoto} disabled={!cameraReady}
                            className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait text-white"
                            style={{
                              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                              boxShadow: cameraReady ? `0 0 20px ${ACCENT}40` : "none",
                            }}
                          >
                            <Camera className="w-4 h-4" />
                            {cameraReady ? "Snap Photo" : "Starting…"}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="h-12 px-4 rounded-2xl font-bold text-sm transition"
                            style={{ background: `${ACCENT}10`, border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={startCamera}
                            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: `${ACCENT}10`, border: `1.5px solid ${BORDER}`, color: TEXT_MAIN }}
                          >
                            <Camera className="w-4 h-4" style={{ color: ACCENT }} />
                            Use Camera
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{ background: `${ACCENT}10`, border: `1.5px solid ${BORDER}`, color: TEXT_MAIN }}
                          >
                            <Upload className="w-4 h-4" style={{ color: ACCENT }} />
                            Upload Photo
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={reset}
                        className="h-12 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition"
                        style={{ background: `${ACCENT}10`, border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retake
                      </button>
                      <button
                        onClick={analyse}
                        className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all text-white"
                        style={{
                          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                          boxShadow: `0 0 20px ${ACCENT}40`,
                        }}
                      >
                        <Zap className="w-4 h-4" />
                        Analyse My Face Shape
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <p className="text-center text-[9px] font-medium" style={{ color: TEXT_MUTED }}>
                    Best results with a clear, front-facing photo in good lighting 🌸
                  </p>

                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              )}

              {/* ── STEP 2: ANALYSING ── */}
              {step === "analysing" && (
                <div className="p-10 flex flex-col items-center justify-center gap-8 min-h-[360px]">
                  {previewUrl && (
                    <div
                      className="w-24 h-24 rounded-2xl overflow-hidden"
                      style={{ border: `2px solid ${ACCENT}50`, boxShadow: `0 0 20px ${ACCENT}25` }}
                    >
                      <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-4">
                    <SpinnerRing color={ACCENT} />
                    <div className="text-center space-y-1">
                      <p className="text-base font-black" style={{ color: TEXT_MAIN, fontFamily: "'Cormorant Garamond', serif" }}>
                        Analysing Your Features
                      </p>
                      <p className="text-xs" style={{ color: TEXT_MUTED }}>
                        Our AI is reading your face shape & matching the perfect styles…
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    {["Detecting facial structure", "Identifying face shape", "Matching beauty catalogue"].map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6 }}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: TEXT_MUTED }}
                      >
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: ACCENT }}
                        />
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3: RESULTS ── */}
              {step === "results" && result && (
                <div className="p-6 space-y-6">
                  {/* Face shape card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${faceShapeColor(result.faceShape)}14, ${faceShapeColor(result.faceShape)}06)`,
                      border: `1px solid ${faceShapeColor(result.faceShape)}35`,
                    }}
                  >
                    {previewUrl && (
                      <img
                        src={previewUrl} alt="Your photo"
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        style={{ border: `2px solid ${faceShapeColor(result.faceShape)}50` }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{
                            background: `${faceShapeColor(result.faceShape)}20`,
                            color: faceShapeColor(result.faceShape),
                            border: `1px solid ${faceShapeColor(result.faceShape)}40`,
                          }}
                        >
                          Face Shape
                        </span>
                      </div>
                      <h3 className="text-xl font-black" style={{ color: faceShapeColor(result.faceShape), fontFamily: "'Cormorant Garamond', serif" }}>
                        {result.faceShape} Face
                      </h3>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: TEXT_MUTED }}>
                        {result.faceShapeDescription}
                      </p>
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: TEXT_MUTED }}>
                      Top 3 Recommended Styles for You 🌸
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {result.recommendations.map((rec, i) => {
                        const style = styles.find((s) => s.id === rec.id);
                        if (!style) return null;
                        return (
                          <RecommendationCard
                            key={rec.id} style={style} reason={rec.reason}
                            index={i} selected={selectedId === rec.id}
                            onSelect={() => handleChoose(rec.id)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition"
                      style={{ background: `${ACCENT}10`, border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try Another Photo
                    </button>
                    {selectedId && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={handleClose}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                          boxShadow: `0 0 18px ${ACCENT}40`,
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Done — View in Album
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
              </> /* end face mode */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
