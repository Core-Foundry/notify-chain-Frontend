'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, ConnectionState } from './useWebSocket';

interface WebSocketContextType {
  connectionState: ConnectionState;
  sendMessage: (data: any) => boolean;
  reconnectAttempt: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({
  children,
  url,
}: {
  children: ReactNode;
  url: string;
}) {
  const ws = useWebSocket({ url });

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
