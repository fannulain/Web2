import { useEffect, useRef, useCallback, useState } from 'react';
import { TOKEN_KEY } from '../utils/constants';

export default function useWebSocket(onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isIntentionalCloseRef = useRef(false);

  const connect = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.warn('[WebSocket] No auth token found. Cannot connect.');
      return;
    }
    const wsUrl = `ws://localhost:3000/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      window.dispatchEvent(new CustomEvent('ws-status', { detail: true }));
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error('[WebSocket] Failed to parse message', err);
      }
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected', event.reason);
      setIsConnected(false);
      window.dispatchEvent(new CustomEvent('ws-status', { detail: false }));

      if (!isIntentionalCloseRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, [onMessage]);

  useEffect(() => {
    isIntentionalCloseRef.current = false;
    connect();

    return () => {
      isIntentionalCloseRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
  return { isConnected };
}
