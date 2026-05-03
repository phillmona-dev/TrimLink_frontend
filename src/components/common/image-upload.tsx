"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  label?: string;
  className?: string;
  shape?: "square" | "circle";
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  label = "Upload Image",
  className = "",
  shape = "square"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be smaller than 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      await onUpload(file);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload image");
      setPreview(currentImageUrl || null); // Revert on failure
    } finally {
      setIsUploading(false);
      // Clean up the object URL to avoid memory leaks
      URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <span className="text-sm font-medium text-white/70">{label}</span>}
      
      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${shape === "circle" ? "rounded-full w-32 h-32" : "rounded-xl w-full h-40"}
          ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-white/20 bg-white/5 hover:bg-white/10"}
          ${preview ? "border-transparent" : ""}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = ""; // Reset to allow selecting the same file again
          }}
        />

        {preview ? (
          <div className="absolute inset-0 w-full h-full group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className={`object-cover ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
              <UploadCloud className="text-white w-8 h-8" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/50">
            <ImageIcon className="w-8 h-8" />
            {shape !== "circle" && <span className="text-xs">Click or drag image</span>}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
      </div>
      
      {errorMsg && (
        <span className="text-xs text-red-500">{errorMsg}</span>
      )}
    </div>
  );
}
