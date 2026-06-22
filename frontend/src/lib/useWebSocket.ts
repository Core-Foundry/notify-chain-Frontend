import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionState = 'connected' | 'reconnecting' | 'offline';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (data: any) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('offline');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManualClose = useRef(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState('reconnecting');
    
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnectionState('connected');
        setReconnectAttempt(0);
        isManualClose.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch {
          onMessage?.(event.data);
        }
      };

      ws.onclose = () => {
        setConnectionState('offline');
        wsRef.current = null;
        
        // Auto-reconnect if not manually closed
        if (!isManualClose.current && reconnectAttempt < maxReconnectAttempts) {
          setReconnectAttempt((prev) => prev + 1);
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionState('offline');
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts, reconnectAttempt]);

  const disconnect = useCallback(() => {
    isManualClose.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState('offline');
    setReconnectAttempt(0);
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connectionState,
    reconnectAttempt,
    sendMessage,
    connect,
    disconnect,
  };
}
