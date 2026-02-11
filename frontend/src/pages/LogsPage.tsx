/**
 * Logs Page
 * View and filter bot logs
 */

import { useState, useEffect } from 'react';
import { Terminal } from '../components/Terminal';
import { Download, RefreshCw, Filter } from 'lucide-react';

export function LogsPage() {
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual log fetching
      // const response = await api.get('/api/bot/logs');
      // setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">📋 Bot Logs</h1>
          <p className="text-text-secondary">View and analyze bot activity logs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-secondary rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {/* TODO: Download logs */}}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Total Logs</div>
          <div className="text-2xl font-bold text-text-primary">0</div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Errors</div>
          <div className="text-2xl font-bold text-error">0</div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Warnings</div>
          <div className="text-2xl font-bold text-warning">0</div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Info</div>
          <div className="text-2xl font-bold text-info">0</div>
        </div>
      </div>

      {/* Terminal Component */}
      <Terminal />
    </div>
  );
}
