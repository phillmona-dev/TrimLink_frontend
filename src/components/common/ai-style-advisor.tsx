"use client";

/**
 * AI Style Advisor Modal
 *
 * Modes:
 *   "face"  — Camera/upload → AI face-shape analysis → 3 style recommendations
 *   "chat"  — Conversational text chat with Trim AI barber expert
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Camera, Upload, RefreshCw, Sparkles, ChevronRight,
  AlertCircle, Check, Zap, MessageSquare, Send, Scissors,
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

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AIStyleAdvisorProps {
  open: boolean;
  onClose: () => void;
  styles: StyleItem[];
  onStyleSelect?: (style: StyleItem) => void;
}

type Step = "capture" | "analysing" | "results";
type Mode = "face" | "chat";

/* ─── Face-shape colour mapping ──────────────────────────────────────────── */

const FACE_SHAPE_COLORS: Record<string, string> = {
  oval: "#f97316",
  round: "#a855f7",
  square: "#3b82f6",
  heart: "#ec4899",
  oblong: "#14b8a6",
  diamond: "#eab308",
  triangle: "#22c55e",
};

function faceShapeColor(shape: string): string {
  return FACE_SHAPE_COLORS[shape.toLowerCase()] ?? "#f97316";
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SpinnerRing({ color = "#f97316" }: { color?: string }) {
  return (
    <svg className="animate-spin" width={56} height={56} viewBox="0 0 56 56" fill="none">
      <circle cx={28} cy={28} r={24} stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <path d="M28 4 a24 24 0 0 1 24 24" stroke={color} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/* ─── Chat Panel ─────────────────────────────────────────────────────────── */

function TrimChatPanel() {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "What cut suits an oval face? ✂️",
    "Best fade for coily hair? 💈",
    "How to maintain a taper at home?",
    "Recommend a style for a job interview",
    "How often should I get a trim?",
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
      const reply = await sendChatMessage(newMessages, "trimlink");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err.message ?? "Error — please try again."}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 520 }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 540 }}>
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <p className="text-sm font-black text-white mb-1">Hey! I'm Trim AI ✂️</p>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              Your personal barber expert. Ask me anything about haircuts, fades, beard care, and grooming!
            </p>
            {/* Quick suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all"
                  style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.2)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                <Scissors className="w-3 h-3 text-black" />
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
              style={m.role === "user" ? {
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#000", fontWeight: 600,
                borderBottomRightRadius: 4,
              } : {
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                borderBottomLeftRadius: 4,
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
              <Scissors className="w-3 h-3 text-black" />
            </div>
            <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about cuts, fades, beard care…"
            disabled={loading}
            className="flex-1 h-10 px-4 rounded-2xl text-xs font-medium text-white placeholder-white/25 focus:outline-none disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", boxShadow: input.trim() ? "0 0 14px rgba(249,115,22,0.4)" : "none" }}
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  style,
  reason,
  index,
  selected,
  onSelect,
}: {
  style: StyleItem;
  reason: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 280, damping: 24 }}
      className={`relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group ${
        selected
          ? "border-orange-500 shadow-[0_0_22px_rgba(249,115,22,0.4)]"
          : "border-white/10 hover:border-orange-500/50"
      }`}
      onClick={onSelect}
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={style.imageUrl}
          alt={style.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Selected badge */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
            >
              <Check className="w-4 h-4 text-black" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rank badge */}
        <div
          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-[10px] font-black text-white"
        >
          {index + 1}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5 flex-1 flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">
          {style.category}
        </span>
        <h4 className="text-xs font-black text-white leading-tight">{style.name}</h4>
        <p className="text-[10px] text-white/50 leading-relaxed flex-1">{reason}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`mt-2 w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
            selected
              ? "bg-orange-500 text-black"
              : "bg-white/5 text-white/60 hover:bg-orange-500/20 hover:text-orange-300"
          }`}
        >
          {selected ? "✓ Chosen" : "Choose"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function AIStyleAdvisor({
  open,
  onClose,
  styles,
  onStyleSelect,
}: AIStyleAdvisorProps) {
  const [mode, setMode] = useState<Mode>("face");
  const [step, setStep] = useState<Step>("capture");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false); // true once video frames are flowing
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Camera helpers */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 640 },
      });
      streamRef.current = stream;
      setCameraActive(true); // triggers re-render → <video> mounts → useEffect assigns stream
    } catch {
      setError("Camera access denied. Please use the Upload option instead.");
    }
  }, []);

  // Attach the stream to the video element AFTER it mounts
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

  // Called by the video element's onLoadedMetadata — guarantees dimensions > 0
  const handleVideoReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  const snapPhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Guard: video must have valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera feed isn't ready yet — please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the canvas so the snapshot matches the mirrored preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture photo. Please try again.");
          return;
        }
        stopCamera();
        setCapturedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92
    );
  }, [stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      stopCamera();
      setCapturedBlob(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset file input so same file can be re-selected
      e.target.value = "";
    },
    [stopCamera]
  );

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

  const handleClose = useCallback(() => {
    reset();
    setMode("face");
    onClose();
  }, [reset, onClose]);

  /* AI Analysis */
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

  /* Choose a style */
  const handleChoose = useCallback(
    (styleId: string) => {
      setSelectedId(styleId);
      const found = styles.find((s) => s.id === styleId);
      if (found && onStyleSelect) onStyleSelect(found);
    },
    [styles, onStyleSelect]
  );

  /* ── Render ── */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          style={{
            backgroundImage: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.8) 100%), url('/wood_desk_background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full rounded-[2rem] overflow-hidden flex flex-col"
            style={{
              maxWidth: mode === "chat" ? 640 : (step === "results" ? 860 : 520),
              maxHeight: "92vh",
              background: "linear-gradient(160deg, #111114 0%, #18181c 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(249,115,22,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white leading-none">AI Style Advisor</h2>
                  <p className="text-[10px] text-white/40 mt-0.5 font-medium">Powered by Llama 4 Vision</p>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex px-6 pt-3 gap-2 flex-shrink-0">
              {(["face", "chat"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                  style={mode === m ? {
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#000",
                    boxShadow: "0 0 12px rgba(249,115,22,0.35)",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                  {m === "face" ? <><Camera className="w-3 h-3" /> Face Analysis</> : <><MessageSquare className="w-3 h-3" /> Chat with Trim AI</>}
                </button>
              ))}
            </div>

            {/* Step indicator — only shown in face analysis mode */}
            <div className="flex items-center gap-1.5 px-6 py-3 border-b border-white/5 flex-shrink-0"
              style={{ display: mode === "face" ? "flex" : "none" }}>
              {(["capture", "analysing", "results"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: step === s ? 24 : 8,
                      background:
                        step === s
                          ? "#f97316"
                          : i < ["capture","analysing","results"].indexOf(step)
                          ? "rgba(249,115,22,0.4)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              ))}
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-white/30">
                {step === "capture" ? "Step 1 of 3 — Photo" : step === "analysing" ? "Step 2 of 3 — Analysing" : "Step 3 of 3 — Results"}
              </span>
            </div>


            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {/* ── CHAT MODE ── */}
              {mode === "chat" && <TrimChatPanel />}

              {/* ── FACE ANALYSIS MODE ── */}
              {mode === "face" && <>
              {/* ── STEP: CAPTURE ── */}
              {step === "capture" && (
                <div className="p-6 space-y-5">
                  {/* Error banner */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 rounded-2xl"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  {/* Camera / preview area */}
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: "1/1",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : cameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          onLoadedMetadata={handleVideoReady}
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        {/* Loading overlay until camera is ready */}
                        {!cameraReady && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] text-white/60 font-medium">Starting camera…</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}
                        >
                          <Camera className="w-7 h-7 text-orange-400" />
                        </div>
                        <p className="text-xs text-white/40 font-medium text-center px-8">
                          Take a selfie or upload a photo to get personalised style recommendations
                        </p>
                      </div>
                    )}

                    {/* Overlay guide lines when camera active */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div
                          className="rounded-full"
                          style={{
                            width: "60%",
                            height: "75%",
                            border: "2px dashed rgba(249,115,22,0.4)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {!previewUrl ? (
                    <div className="flex gap-3">
                      {cameraActive ? (
                        <>
                          <button
                            onClick={snapPhoto}
                            disabled={!cameraReady}
                            className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-wait"
                            style={{
                              background: "linear-gradient(135deg, #f97316, #fb923c)",
                              color: "#000",
                              boxShadow: cameraReady ? "0 0 20px rgba(249,115,22,0.4)" : "none",
                            }}
                          >
                            <Camera className="w-4 h-4" />
                            {cameraReady ? "Snap Photo" : "Starting camera…"}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="h-12 px-4 rounded-2xl font-bold text-sm text-white/60 hover:text-white transition"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={startCamera}
                            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-white"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            <Camera className="w-4 h-4 text-orange-400" />
                            Use Camera
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-white"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            <Upload className="w-4 h-4 text-orange-400" />
                            Upload Photo
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={reset}
                        className="h-12 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white/60 hover:text-white transition"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retake
                      </button>
                      <button
                        onClick={analyse}
                        className="flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: "linear-gradient(135deg, #f97316, #fb923c)",
                          color: "#000",
                          boxShadow: "0 0 20px rgba(249,115,22,0.4)",
                        }}
                      >
                        <Zap className="w-4 h-4" />
                        Analyse My Face Shape
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <p className="text-center text-[9px] text-white/25 font-medium">
                    Best results with a clear, front-facing photo in good lighting
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {/* ── STEP: ANALYSING ── */}
              {step === "analysing" && (
                <div className="p-10 flex flex-col items-center justify-center gap-8 min-h-[360px]">
                  {/* Preview thumbnail */}
                  {previewUrl && (
                    <div
                      className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-500/30"
                      style={{ boxShadow: "0 0 20px rgba(249,115,22,0.2)" }}
                    >
                      <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-4">
                    <SpinnerRing color="#f97316" />
                    <div className="text-center space-y-1">
                      <p className="text-base font-black text-white">Analysing Your Face Shape</p>
                      <p className="text-xs text-white/40">
                        Gemini is reading your facial structure and matching styles…
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    {[
                      "Detecting facial landmarks",
                      "Identifying face shape",
                      "Matching hairstyle catalogue",
                    ].map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.6 }}
                        className="flex items-center gap-2 text-xs text-white/30"
                      >
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-orange-500"
                        />
                        {label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP: RESULTS ── */}
              {step === "results" && result && (
                <div className="p-6 space-y-6">
                  {/* Face shape card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${faceShapeColor(result.faceShape)}18, ${faceShapeColor(result.faceShape)}08)`,
                      border: `1px solid ${faceShapeColor(result.faceShape)}30`,
                    }}
                  >
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Your photo"
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        style={{ border: `2px solid ${faceShapeColor(result.faceShape)}50` }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{
                            background: `${faceShapeColor(result.faceShape)}25`,
                            color: faceShapeColor(result.faceShape),
                            border: `1px solid ${faceShapeColor(result.faceShape)}40`,
                          }}
                        >
                          Face Shape
                        </span>
                      </div>
                      <h3
                        className="text-xl font-black"
                        style={{ color: faceShapeColor(result.faceShape) }}
                      >
                        {result.faceShape} Face
                      </h3>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                        {result.faceShapeDescription}
                      </p>
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">
                      Top 3 Recommended Styles for You
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {result.recommendations.map((rec, i) => {
                        const style = styles.find((s) => s.id === rec.id);
                        if (!style) return null;
                        return (
                          <RecommendationCard
                            key={rec.id}
                            style={style}
                            reason={rec.reason}
                            index={i}
                            selected={selectedId === rec.id}
                            onSelect={() => handleChoose(rec.id)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white transition"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try Another Photo
                    </button>
                    {selectedId && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleClose}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all"
                        style={{
                          background: "linear-gradient(135deg, #f97316, #fb923c)",
                          color: "#000",
                          boxShadow: "0 0 18px rgba(249,115,22,0.35)",
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
