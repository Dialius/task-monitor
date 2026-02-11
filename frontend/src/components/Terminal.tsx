/**
 * Terminal Component
 * Display bot logs with xterm.js styling
 */

import { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Trash2, Download } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any;
}

export function Terminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { socket } = useWebSocket();

  // Subscribe to logs from WebSocket
  useEffect(() => {
    if (!socket) {
      console.log('[Terminal] No socket available yet');
      return;
    }

    console.log('[Terminal] Setting up log listeners');

    // Handle log history (buffered logs)
    const handleLogHistory = (history: LogEntry[]) => {
      console.log('[Terminal] Received log history:', history.length, 'entries');
      setLogs(history);
    };

    // Handle new log entries
    const handleLogEntry = (entry: LogEntry) => {
      console.log('[Terminal] New log entry:', entry);
      setLogs((prev) => {
        const newLogs = [...prev, entry];
        // Keep only last 500 logs in memory
        if (newLogs.length > 500) {
          return newLogs.slice(-500);
        }
        return newLogs;
      });
    };

    socket.on('log:history', handleLogHistory);
    socket.on('log:entry', handleLogEntry);

    console.log('[Terminal] Log listeners registered');

    return () => {
      console.log('[Terminal] Cleaning up log listeners');
      socket.off('log:history', handleLogHistory);
      socket.off('log:entry', handleLogEntry);
    };
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const content = logs
      .map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-error';
      case 'warn':
        return 'text-warning';
      case 'info':
        return 'text-info';
      case 'debug':
        return 'text-text-muted';
      default:
        return 'text-text-secondary';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'debug':
        return '🔍';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-bg-tertiary px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-text-primary" />
          <span className="text-sm font-medium text-text-primary">Terminal</span>
          <span className="text-xs text-text-muted">({logs.length} logs)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            Auto-scroll
          </label>

          {/* Download logs */}
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-1.5 hover:bg-bg-elevated rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download logs"
          >
            <Download className="w-4 h-4 text-text-secondary" />
          </button>

          {/* Clear logs */}
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="p-1.5 hover:bg-bg-elevated rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="h-96 overflow-y-auto p-4 font-mono text-sm bg-black/30"
        style={{ scrollBehavior: autoScroll ? 'smooth' : 'auto' }}
      >
        {logs.length === 0 ? (
          <div className="text-text-muted text-center py-8">
            No logs yet. Waiting for bot activity...
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 hover:bg-bg-tertiary/30 px-2 py-1 rounded">
                <span className="text-text-muted text-xs whitespace-nowrap">
                  {log.timestamp}
                </span>
                <span className="text-xs">{getLevelIcon(log.level)}</span>
                <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-text-secondary text-xs flex-1 break-all">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
