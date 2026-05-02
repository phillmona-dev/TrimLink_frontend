import { useEffect, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketConfig {
  url: string;
  topic: string;
  onMessage: (message: any) => void;
  enabled?: boolean;
}

export function useWebSocket({ url, topic, onMessage, enabled = true }: WebSocketConfig) {
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const client = new Client({
      brokerURL: url,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        setConnected(true);
        client.subscribe(topic, (message: IMessage) => {
          if (message.body) {
            try {
              const parsed = JSON.parse(message.body);
              onMessage(parsed);
            } catch (err) {
              console.error('[WebSocket] Failed to parse message', err);
            }
          }
        });
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Broker reported error: ' + frame.headers['message']);
        console.error('[WebSocket] Additional details: ' + frame.body);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [url, topic, enabled]); // Intentionally omitting onMessage to avoid reconnects on every render if not memoized

  return { connected, stompClient };
}
