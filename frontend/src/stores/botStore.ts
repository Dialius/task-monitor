/**
 * Bot Store
 * Zustand store for bot state
 */

import { create } from 'zustand';
import api from '../services/api';

type BotStatus = 'online' | 'stopped' | 'errored' | 'unknown';

interface BotState {
  status: BotStatus;
  pid?: number;
  uptime: number;
  restarts: number;
  connections: {
    whatsapp: boolean;
    discord: boolean;
    mongodb: boolean;
    notion: boolean;
  };
  metrics: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  startBot: () => Promise<void>;
  stopBot: () => Promise<void>;
  restartBot: () => Promise<void>;
  pauseBot: () => Promise<void>;
  resumeBot: () => Promise<void>;
  updateStatus: (status: Partial<BotState>) => void;
  updateMetrics: (metrics: BotState['metrics']) => void;
}

export const useBotStore = create<BotState>((set) => ({
  status: 'unknown',
  uptime: 0,
  restarts: 0,
  connections: {
    whatsapp: false,
    discord: false,
    mongodb: false,
    notion: false,
  },
  metrics: {
    cpu: 0,
    memory: 0,
    uptime: 0,
  },
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/bot/status');
      const { status, pid, uptime, restarts, connections } = response.data;
      set({
        status,
        pid,
        uptime,
        restarts,
        connections,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch status',
        isLoading: false,
      });
    }
  },

  fetchMetrics: async () => {
    try {
      const response = await api.get('/api/bot/metrics');
      set({ metrics: response.data });
    } catch (error: any) {
      console.error('Failed to fetch metrics:', error);
    }
  },

  startBot: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/bot/start');
      set({ isLoading: false });
      // Fetch updated status
      setTimeout(() => useBotStore.getState().fetchStatus(), 1000);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to start bot',
        isLoading: false,
      });
      throw error;
    }
  },

  stopBot: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/bot/stop');
      set({ isLoading: false });
      // Fetch updated status
      setTimeout(() => useBotStore.getState().fetchStatus(), 1000);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to stop bot',
        isLoading: false,
      });
      throw error;
    }
  },

  restartBot: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/bot/restart');
      set({ isLoading: false });
      // Fetch updated status
      setTimeout(() => useBotStore.getState().fetchStatus(), 2000);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to restart bot',
        isLoading: false,
      });
      throw error;
    }
  },

  pauseBot: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/bot/pause');
      set({ isLoading: false });
      // Fetch updated status
      setTimeout(() => useBotStore.getState().fetchStatus(), 1000);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to pause bot',
        isLoading: false,
      });
      throw error;
    }
  },

  resumeBot: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/bot/resume');
      set({ isLoading: false });
      // Fetch updated status
      setTimeout(() => useBotStore.getState().fetchStatus(), 1000);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to resume bot',
        isLoading: false,
      });
      throw error;
    }
  },

  updateStatus: (newStatus) => {
    set((state) => ({ ...state, ...newStatus }));
  },

  updateMetrics: (metrics) => {
    set({ metrics });
  },
}));
