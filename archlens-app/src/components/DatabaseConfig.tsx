"use client";

import { useState, useEffect } from 'react';
import { 
  Database, 
  Save, 
  TestTube, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Shield,
  Clock,
  HardDrive,
  Activity
} from 'lucide-react';

interface DatabaseConfig {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  backupEnabled: boolean;
  backupFrequency: string;
  backupRetention: number;
  monitoringEnabled: boolean;
  slowQueryThreshold: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

interface DatabaseStatus {
  connected: boolean;
  responseTime: number;
  activeConnections: number;
  totalConnections: number;
  databaseSize: string;
  lastBackup: Date | null;
  uptime: string;
}

export function DatabaseConfig() {
  const [config, setConfig] = useState<DatabaseConfig>({
    connectionString: process.env.MONGODB_URI || '',
    host: 'localhost',
    port: 27017,
    database: 'CloudArc',
    username: '',
    password: '',
    ssl: false,
    maxConnections: 10,
    connectionTimeout: 30000,
    queryTimeout: 60000,
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    monitoringEnabled: true,
    slowQueryThreshold: 1000,
    logLevel: 'info'
  });

  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    responseTime: 0,
    activeConnections: 0,
    totalConnections: 0,
    databaseSize: '0 MB',
    lastBackup: null,
    uptime: '0 days'
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
    checkDatabaseStatus();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      // In production, this would fetch from your configuration API
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configuration' });
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      setTesting(true);
      // Simulate database connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus({
        connected: true,
        responseTime: Math.floor(Math.random() * 50) + 10,
        activeConnections: Math.floor(Math.random() * 5) + 1,
        totalConnections: 10,
        databaseSize: '2.3 GB',
        lastBackup: new Date(Date.now() - Math.random() * 86400000),
        uptime: '15 days'
      });
      
      setMessage({ type: 'success', text: 'Database connection successful' });
    } catch (error) {
      setStatus(prev => ({ ...prev, connected: false }));
      setMessage({ type: 'error', text: 'Database connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // In production, this would save to your configuration API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({ type: 'success', text: 'Configuration saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof DatabaseConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const clearMessage = () => {
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Database Configuration</h2>
          <p className="text-foreground-muted">
            Configure database connections, backup settings, and performance tuning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkDatabaseStatus}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            <TestTube className="w-4 h-4" />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           message.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
           <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={clearMessage} className="text-current hover:opacity-70">
            ×
          </button>
        </div>
      )}

      {/* Database Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-foreground-muted">Status</p>
              <p className="font-semibold text-foreground">
                {status.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-foreground-muted">Response Time</p>
              <p className="font-semibold text-foreground">{status.responseTime}ms</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-foreground-muted">Active Connections</p>
              <p className="font-semibold text-foreground">
                {status.activeConnections}/{status.totalConnections}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-foreground-muted">Database Size</p>
              <p className="font-semibold text-foreground">{status.databaseSize}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Settings */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground">Connection Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Connection String
              </label>
              <input
                type="text"
                value={config.connectionString}
                onChange={(e) => handleInputChange('connectionString', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="mongodb://localhost:27017/CloudArc"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Host
                </label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Database Name
              </label>
              <input
                type="text"
                value={config.database}
                onChange={(e) => handleInputChange('database', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ssl"
                checked={config.ssl}
                onChange={(e) => handleInputChange('ssl', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="ssl" className="text-sm text-foreground">
                Enable SSL/TLS
              </label>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-foreground">Performance Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Connections
              </label>
              <input
                type="number"
                value={config.maxConnections}
                onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Connection Timeout (ms)
              </label>
              <input
                type="number"
                value={config.connectionTimeout}
                onChange={(e) => handleInputChange('connectionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1000"
                max="300000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Query Timeout (ms)
              </label>
              <input
                type="number"
                value={config.queryTimeout}
                onChange={(e) => handleInputChange('queryTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1000"
                max="600000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slow Query Threshold (ms)
              </label>
              <input
                type="number"
                value={config.slowQueryThreshold}
                onChange={(e) => handleInputChange('slowQueryThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Log Level
              </label>
              <select
                value={config.logLevel}
                onChange={(e) => handleInputChange('logLevel', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="monitoring"
                checked={config.monitoringEnabled}
                onChange={(e) => handleInputChange('monitoringEnabled', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="monitoring" className="text-sm text-foreground">
                Enable Performance Monitoring
              </label>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-foreground">Backup Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="backupEnabled"
                checked={config.backupEnabled}
                onChange={(e) => handleInputChange('backupEnabled', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="backupEnabled" className="text-sm text-foreground">
                Enable Automated Backups
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Backup Frequency
              </label>
              <select
                value={config.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Backup Retention (days)
              </label>
              <input
                type="number"
                value={config.backupRetention}
                onChange={(e) => handleInputChange('backupRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
                max="365"
              />
            </div>

            {status.lastBackup && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm font-medium text-foreground">Last Backup</span>
                </div>
                <p className="text-sm text-foreground-muted">
                  {status.lastBackup.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-foreground">Database Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground-muted">Uptime</p>
                <p className="font-semibold text-foreground">{status.uptime}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">Database Size</p>
                <p className="font-semibold text-foreground">{status.databaseSize}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground-muted">Active Connections</p>
                <p className="font-semibold text-foreground">{status.activeConnections}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">Response Time</p>
                <p className="font-semibold text-foreground">{status.responseTime}ms</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={checkDatabaseStatus}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
