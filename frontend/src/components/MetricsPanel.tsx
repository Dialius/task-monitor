/**
 * Metrics Panel Component
 * Display CPU, Memory, and other metrics
 */

import { useEffect, useState } from 'react';
import { useBotStore } from '../stores/botStore';
import { Cpu, HardDrive, Clock, Activity } from 'lucide-react';

export function MetricsPanel() {
  const { metrics, fetchMetrics } = useBotStore();
  const [history, setHistory] = useState<{ cpu: number[]; memory: number[] }>({
    cpu: [],
    memory: [],
  });

  useEffect(() => {
    // Fetch metrics every 5 seconds
    const interval = setInterval(() => {
      fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  useEffect(() => {
    // Update history (keep last 20 data points)
    setHistory((prev) => ({
      cpu: [...prev.cpu.slice(-19), metrics.cpu],
      memory: [...prev.memory.slice(-19), metrics.memory],
    }));
  }, [metrics]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getColorClass = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-error';
    if (value >= thresholds.warning) return 'text-warning';
    return 'text-success';
  };

  const cpuColor = getColorClass(metrics.cpu, { warning: 60, danger: 80 });
  const memoryColor = getColorClass(metrics.memory, { warning: 70, danger: 85 });

  return (
    <div className="bg-bg-secondary rounded-lg border border-border p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        System Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Usage */}
        <div className="bg-bg-tertiary p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">CPU Usage</span>
          </div>
          <div className={`text-3xl font-bold ${cpuColor}`}>
            {metrics.cpu.toFixed(1)}%
          </div>
          
          {/* Mini chart */}
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {history.cpu.map((value, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  value >= 80 ? 'bg-error' : value >= 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ height: `${Math.max(value, 5)}%`, opacity: 0.3 + (index / history.cpu.length) * 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-bg-tertiary p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Memory Usage</span>
          </div>
          <div className={`text-3xl font-bold ${memoryColor}`}>
            {metrics.memory.toFixed(1)}%
          </div>
          
          {/* Mini chart */}
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {history.memory.map((value, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  value >= 85 ? 'bg-error' : value >= 70 ? 'bg-warning' : 'bg-info'
                }`}
                style={{ height: `${Math.max(value, 5)}%`, opacity: 0.3 + (index / history.memory.length) * 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-bg-tertiary p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Uptime</span>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {formatUptime(metrics.uptime)}
          </div>
          <div className="mt-3 text-xs text-text-muted">
            {new Date(Date.now() - metrics.uptime * 1000).toLocaleString()}
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-bg-tertiary p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Health Status</span>
          </div>
          <div className="text-3xl font-bold">
            {metrics.cpu < 80 && metrics.memory < 85 ? (
              <span className="text-success">✓ Healthy</span>
            ) : metrics.cpu >= 90 || metrics.memory >= 95 ? (
              <span className="text-error">⚠ Critical</span>
            ) : (
              <span className="text-warning">⚡ High Load</span>
            )}
          </div>
          <div className="mt-3 text-xs text-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      {(metrics.cpu >= 80 || metrics.memory >= 85) && (
        <div className="mt-4 bg-warning/10 border border-warning text-warning px-4 py-3 rounded-lg text-sm">
          <strong>Performance Warning:</strong> High resource usage detected. Consider restarting the bot or checking for memory leaks.
        </div>
      )}
    </div>
  );
}
