/**
 * Home Page / Dashboard
 */

import { useEffect } from 'react';
import { useBotStore } from '../stores/botStore';
import { ControlPanel } from '../components/ControlPanel';
import { Terminal } from '../components/Terminal';
import { MetricsPanel } from '../components/MetricsPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { Wifi, WifiOff } from 'lucide-react';

export function HomePage() {
  const { fetchStatus, connections, uptime } = useBotStore();
  const { isConnected: wsConnected, error: wsError } = useWebSocket();

  useEffect(() => {
    // Fetch initial status
    fetchStatus();

    // Poll status every 10 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            🤖 Task Monitor Bot Dashboard
          </h1>
          <p className="text-text-secondary">
            Monitor and control your WhatsApp Class Reminder Bot
          </p>
        </div>

        {/* WebSocket Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg">
          {wsConnected ? (
            <>
              <Wifi className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-error" />
              <span className="text-sm text-error">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* WebSocket Error */}
      {wsError && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
          WebSocket Error: {wsError}
        </div>
      )}

      {/* Control Panel */}
      <ControlPanel />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uptime */}
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Uptime</div>
          <div className="text-2xl font-bold text-text-primary">
            {formatUptime(uptime)}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">WhatsApp</div>
          <div className={`text-2xl font-bold ${connections.whatsapp ? 'text-success' : 'text-error'}`}>
            {connections.whatsapp ? '✅ Connected' : '❌ Disconnected'}
          </div>
        </div>

        {/* Discord */}
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Discord</div>
          <div className={`text-2xl font-bold ${connections.discord ? 'text-success' : 'text-text-muted'}`}>
            {connections.discord ? '✅ Connected' : '⚪ Disabled'}
          </div>
        </div>

        {/* MongoDB */}
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">MongoDB</div>
          <div className={`text-2xl font-bold ${connections.mongodb ? 'text-success' : 'text-error'}`}>
            {connections.mongodb ? '✅ Connected' : '❌ Disconnected'}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">📝 Quick Guide</h2>
        <div className="space-y-2 text-text-secondary">
          <p>• <span className="text-success">Start</span>: Launch the bot process</p>
          <p>• <span className="text-error">Stop</span>: Gracefully shut down the bot</p>
          <p>• <span className="text-warning">Restart</span>: Stop and start the bot</p>
          <p>• <span className="text-info">Pause</span>: Temporarily suspend bot operations</p>
          <p>• <span className="text-success">Resume</span>: Continue paused bot</p>
        </div>
      </div>

      {/* Metrics Panel */}
      <MetricsPanel />

      {/* Terminal */}
      <Terminal />
    </div>
  );
}
