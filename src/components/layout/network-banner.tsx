"use client";

import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function NetworkBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline ? (
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          className="sticky top-0 z-50 border-b border-warning/20 bg-warning/10"
        >
          <div className="container flex items-center gap-2 py-3 text-sm text-warning">
            <WifiOff className="h-4 w-4" />
            You are offline. TrimLink will retry requests when the network returns.
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
