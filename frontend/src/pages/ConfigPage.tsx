/**
 * Configuration Page
 * Edit bot configuration
 */

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings } from 'lucide-react';
import api from '../services/api';

export function ConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      await api.put('/api/config', config);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = () => {
    if (confirm('Are you sure you want to reset to default configuration?')) {
      fetchConfig();
      setMessage({ type: 'success', text: 'Configuration reset to defaults' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-text-muted py-12">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">⚙️ Configuration</h1>
          <p className="text-text-secondary">Manage bot settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetConfig}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-secondary rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-success/10 border-success text-success' 
            : 'bg-error/10 border-error text-error'
        }`}>
          {message.text}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Settings
        </h2>
        
        <div className="space-y-4">
          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
            <div>
              <div className="font-medium text-text-primary">WhatsApp Bot</div>
              <div className="text-sm text-text-muted">Enable WhatsApp integration</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.whatsapp?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-bg-elevated peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Discord */}
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Discord Bot</div>
              <div className="text-sm text-text-muted">Enable Discord integration</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.discord?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  discord: { ...config.discord, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-bg-elevated peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Scheduler Settings */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Scheduler Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Daily Reminder Time
            </label>
            <input
              type="time"
              value={config?.scheduler?.dailyReminderTime || '17:00'}
              onChange={(e) => setConfig({
                ...config,
                scheduler: { ...config.scheduler, dailyReminderTime: e.target.value }
              })}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Weekly Reminder Day
            </label>
            <select
              value={config?.scheduler?.weeklyReminderDay || 5}
              onChange={(e) => setConfig({
                ...config,
                scheduler: { ...config.scheduler, weeklyReminderDay: parseInt(e.target.value) }
              })}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Weekly Reminder Time
            </label>
            <input
              type="time"
              value={config?.scheduler?.weeklyReminderTime || '20:00'}
              onChange={(e) => setConfig({
                ...config,
                scheduler: { ...config.scheduler, weeklyReminderTime: e.target.value }
              })}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={config?.scheduler?.timezone || 'Asia/Jakarta'}
              onChange={(e) => setConfig({
                ...config,
                scheduler: { ...config.scheduler, timezone: e.target.value }
              })}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
              placeholder="Asia/Jakarta"
            />
          </div>
        </div>
      </div>

      {/* Logging Settings */}
      <div className="bg-bg-secondary p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Logging Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Log Level
            </label>
            <select
              value={config?.logging?.level || 'info'}
              onChange={(e) => setConfig({
                ...config,
                logging: { ...config.logging, level: e.target.value }
              })}
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-error/10 border border-error p-6 rounded-lg">
        <h2 className="text-xl font-bold text-error mb-4">⚠️ Danger Zone</h2>
        <p className="text-text-secondary mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
              // TODO: Implement clear logs
            }
          }}
          className="px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-colors"
        >
          Clear All Logs
        </button>
      </div>
    </div>
  );
}
