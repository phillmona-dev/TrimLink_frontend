import { useEffect, useRef } from "react";

type RealtimeOptions = {
  url?: string;
  onMessage?: (event: MessageEvent) => void;
  enabled?: boolean;
};

export function useRealtimeChannel({
  url,
  onMessage,
  enabled = true
}: RealtimeOptions) {
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url || !enabled) {
      return;
    }

    const source = new EventSource(url, { withCredentials: false });
    sourceRef.current = source;

    if (onMessage) {
      source.addEventListener("message", onMessage);
    }

    return () => {
      if (onMessage) {
        source.removeEventListener("message", onMessage);
      }
      source.close();
      sourceRef.current = null;
    };
  }, [enabled, onMessage, url]);

  return sourceRef;
}
