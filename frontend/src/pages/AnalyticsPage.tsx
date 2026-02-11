/**
 * Analytics Page
 * Charts and statistics
 */

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import api from '../services/api';

export function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/analytics?range=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-text-muted py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">📊 Analytics</h1>
          <p className="text-text-secondary">Bot performance and usage statistics</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-bg-secondary border border-border rounded-lg p-1">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              timeRange === '7d' 
                ? 'bg-accent text-white' 
                : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              timeRange === '30d' 
                ? 'bg-accent text-white' 
                : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              timeRange === '90d' 
                ? 'bg-accent text-white' 
                : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="text-text-muted text-sm">Total Messages</div>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.totalMessages || 0}
          </div>
          <div className="text-xs text-success mt-2">
            ↑ {stats?.messageGrowth || 0}% from last period
          </div>
        </div>

        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div className="text-text-muted text-sm">Tasks Created</div>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.totalTasks || 0}
          </div>
          <div className="text-xs text-success mt-2">
            ↑ {stats?.taskGrowth || 0}% from last period
          </div>
        </div>

        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="text-text-muted text-sm">Completion Rate</div>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.completionRate || 0}%
          </div>
          <div className="text-xs text-success mt-2">
            ↑ {stats?.completionGrowth || 0}% from last period
          </div>
        </div>

        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-warning" />
            </div>
            <div className="text-text-muted text-sm">Active Users</div>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.activeUsers || 0}
          </div>
          <div className="text-xs text-success mt-2">
            ↑ {stats?.userGrowth || 0}% from last period
          </div>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Task Distribution by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-bg-tertiary rounded-lg">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-text-primary">
              {stats?.tasksByType?.tugas || 0}
            </div>
            <div className="text-sm text-text-muted">Tugas</div>
          </div>
          <div className="text-center p-4 bg-bg-tertiary rounded-lg">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-text-primary">
              {stats?.tasksByType?.ujian || 0}
            </div>
            <div className="text-sm text-text-muted">Ujian</div>
          </div>
          <div className="text-center p-4 bg-bg-tertiary rounded-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-text-primary">
              {stats?.tasksByType?.kelompok || 0}
            </div>
            <div className="text-sm text-text-muted">Kelompok</div>
          </div>
          <div className="text-center p-4 bg-bg-tertiary rounded-lg">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-text-primary">
              {stats?.tasksByType?.lainnya || 0}
            </div>
            <div className="text-sm text-text-muted">Lainnya</div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Task Priority Distribution</h2>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Urgent</span>
              <span className="text-sm font-bold text-error">
                {stats?.tasksByPriority?.urgent || 0}
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-error rounded-full"
                style={{ width: `${((stats?.tasksByPriority?.urgent || 0) / (stats?.totalTasks || 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Tinggi</span>
              <span className="text-sm font-bold text-warning">
                {stats?.tasksByPriority?.tinggi || 0}
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-warning rounded-full"
                style={{ width: `${((stats?.tasksByPriority?.tinggi || 0) / (stats?.totalTasks || 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Sedang</span>
              <span className="text-sm font-bold text-info">
                {stats?.tasksByPriority?.sedang || 0}
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-info rounded-full"
                style={{ width: `${((stats?.tasksByPriority?.sedang || 0) / (stats?.totalTasks || 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Rendah</span>
              <span className="text-sm font-bold text-success">
                {stats?.tasksByPriority?.rendah || 0}
              </span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full"
                style={{ width: `${((stats?.tasksByPriority?.rendah || 0) / (stats?.totalTasks || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">WhatsApp Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Messages Sent</span>
              <span className="text-text-primary font-bold">
                {stats?.whatsapp?.messagesSent || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Commands Processed</span>
              <span className="text-text-primary font-bold">
                {stats?.whatsapp?.commandsProcessed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Active Groups</span>
              <span className="text-text-primary font-bold">
                {stats?.whatsapp?.activeGroups || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary p-6 rounded-lg border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Discord Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Messages Sent</span>
              <span className="text-text-primary font-bold">
                {stats?.discord?.messagesSent || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Commands Processed</span>
              <span className="text-text-primary font-bold">
                {stats?.discord?.commandsProcessed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Active Channels</span>
              <span className="text-text-primary font-bold">
                {stats?.discord?.activeChannels || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
