/**
 * WebSocket Hook
 * Real-time updates from backend
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useBotStore } from '../stores/botStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

interface WebSocketHookReturn {
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  socket: Socket | null;
}

export function useWebSocket(): WebSocketHookReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateStatus, updateMetrics } = useBotStore();

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token');
      return;
    }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Subscribe to updates
      socket.emit('subscribe:status');
      socket.emit('subscribe:metrics');
      socket.emit('subscribe:logs');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Status updates
    socket.on('status', (data) => {
      console.log('📡 Status update:', data);
      updateStatus({
        status: data.status,
        pid: data.pid,
        uptime: data.uptime,
        restarts: data.restarts
      });
    });

    // Metrics updates
    socket.on('metrics', (data) => {
      console.log('📊 Metrics update:', data);
      updateMetrics({
        cpu: data.cpu,
        memory: data.memory,
        uptime: data.uptime
      });
    });

    // Error messages
    socket.on('error', (data) => {
      console.error('❌ Error:', data);
      setError(data.message);
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const reconnect = () => {
    disconnect();
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    error,
    reconnect,
    socket: socketRef.current,
  };
}
