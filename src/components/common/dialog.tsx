"use client";

import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-md transform transition-all">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-[2.5rem] bg-[#1a1a1a] border border-white/10 shadow-2xl p-8 ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-2xl font-black text-white ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={`mt-2 text-sm text-white/40 leading-relaxed ${className}`}>{children}</p>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`mt-8 flex items-center justify-end gap-3 ${className}`}>{children}</div>;
}
