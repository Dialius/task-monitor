/**
 * Control Panel Component
 * Bot control buttons (Start/Stop/Restart/Pause/Resume)
 */

import { useState } from 'react';
import { useBotStore } from '../stores/botStore';
import { Play, Square, RotateCw, Pause, PlayCircle } from 'lucide-react';

export function ControlPanel() {
  const { status, isLoading, startBot, stopBot, restartBot, pauseBot, resumeBot } = useBotStore();
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    try {
      await fn();
      setShowConfirm(null);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'stopped':
        return 'text-error';
      case 'errored':
        return 'text-error';
      default:
        return 'text-text-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'errored':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-bg-secondary p-6 rounded-lg border border-border">
      <h2 className="text-xl font-bold text-text-primary mb-4">🎮 Bot Control Panel</h2>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Status:</span>
          <span className={`font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Start Button */}
        <button
          onClick={() => setShowConfirm('start')}
          disabled={isLoading || status === 'online'}
          className="flex flex-col items-center gap-2 p-4 bg-success/10 hover:bg-success/20 border border-success rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6 text-success" />
          <span className="text-sm font-medium text-success">Start</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={() => setShowConfirm('stop')}
          disabled={isLoading || status === 'stopped'}
          className="flex flex-col items-center gap-2 p-4 bg-error/10 hover:bg-error/20 border border-error rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square className="w-6 h-6 text-error" />
          <span className="text-sm font-medium text-error">Stop</span>
        </button>

        {/* Restart Button */}
        <button
          onClick={() => setShowConfirm('restart')}
          disabled={isLoading || status === 'stopped'}
          className="flex flex-col items-center gap-2 p-4 bg-warning/10 hover:bg-warning/20 border border-warning rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw className="w-6 h-6 text-warning" />
          <span className="text-sm font-medium text-warning">Restart</span>
        </button>

        {/* Pause Button */}
        <button
          onClick={() => setShowConfirm('pause')}
          disabled={isLoading || status !== 'online'}
          className="flex flex-col items-center gap-2 p-4 bg-info/10 hover:bg-info/20 border border-info rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="w-6 h-6 text-info" />
          <span className="text-sm font-medium text-info">Pause</span>
        </button>

        {/* Resume Button */}
        <button
          onClick={() => setShowConfirm('resume')}
          disabled={isLoading || status === 'online'}
          className="flex flex-col items-center gap-2 p-4 bg-success/10 hover:bg-success/20 border border-success rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayCircle className="w-6 h-6 text-success" />
          <span className="text-sm font-medium text-success">Resume</span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary p-6 rounded-lg border border-border max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Confirm {showConfirm.charAt(0).toUpperCase() + showConfirm.slice(1)}
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to {showConfirm} the bot?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-bg-tertiary hover:bg-bg-elevated border border-border rounded-md text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  switch (showConfirm) {
                    case 'start':
                      handleAction('start', startBot);
                      break;
                    case 'stop':
                      handleAction('stop', stopBot);
                      break;
                    case 'restart':
                      handleAction('restart', restartBot);
                      break;
                    case 'pause':
                      handleAction('pause', pauseBot);
                      break;
                    case 'resume':
                      handleAction('resume', resumeBot);
                      break;
                  }
                }}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
