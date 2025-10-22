"use client";

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Save, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Webhook,
  CheckCircle,
  AlertCircle,
  Settings,
  Clock,
  Zap
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook' | 'in-app';
  enabled: boolean;
  config: Record<string, string | number | boolean>;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  event: string;
  channels: string[];
  conditions: string[];
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'in-app';
  variables: string[];
}

export function NotificationsConfig() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'rules' | 'templates' | 'settings'>('channels');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({
    name: '',
    type: 'email',
    enabled: true,
    config: {}
  });

  // Mock data
  useEffect(() => {
    const mockChannels: NotificationChannel[] = [
      {
        id: '1',
        name: 'Primary Email',
        type: 'email',
        enabled: true,
        config: {
          smtpHost: 'smtp.company.com',
          smtpPort: 587,
          username: 'noreply@company.com',
          fromAddress: 'CloudArc <noreply@company.com>'
        }
      },
      {
        id: '2',
        name: 'SMS Gateway',
        type: 'sms',
        enabled: true,
        config: {
          provider: 'twilio',
          accountSid: 'AC...',
          authToken: '***',
          fromNumber: '+1234567890'
        }
      },
      {
        id: '3',
        name: 'Slack Webhook',
        type: 'webhook',
        enabled: false,
        config: {
          url: 'https://hooks.slack.com/services/...',
          channel: '#cloudarc-alerts',
          username: 'CloudArc Bot'
        }
      },
      {
        id: '4',
        name: 'In-App Notifications',
        type: 'in-app',
        enabled: true,
        config: {
          sound: true,
          desktop: true,
          duration: 5000
        }
      }
    ];

    const mockRules: NotificationRule[] = [
      {
        id: '1',
        name: 'Analysis Complete',
        description: 'Notify when architecture analysis is completed',
        event: 'analysis.completed',
        channels: ['1', '4'],
        conditions: ['always'],
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: '2',
        name: 'High Priority Issues',
        description: 'Alert for high-priority security or compliance issues',
        event: 'issue.high_priority',
        channels: ['1', '2', '3', '4'],
        conditions: ['severity == high'],
        enabled: true,
        frequency: 'immediate'
      },
      {
        id: '3',
        name: 'Weekly Summary',
        description: 'Weekly summary of all analyses and issues',
        event: 'summary.weekly',
        channels: ['1'],
        conditions: ['always'],
        enabled: true,
        frequency: 'weekly'
      },
      {
        id: '4',
        name: 'System Alerts',
        description: 'Critical system errors and maintenance notifications',
        event: 'system.alert',
        channels: ['1', '2', '3'],
        conditions: ['level == critical'],
        enabled: true,
        frequency: 'immediate'
      }
    ];

    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Analysis Complete Email',
        type: 'email',
        subject: 'Analysis Complete: {{analysisName}}',
        body: 'Your architecture analysis for {{analysisName}} has been completed successfully.\n\nSummary: {{summary}}\nScore: {{score}}/100\n\nView full results: {{analysisUrl}}',
        variables: ['analysisName', 'summary', 'score', 'analysisUrl']
      },
      {
        id: '2',
        name: 'High Priority Alert',
        type: 'email',
        subject: 'URGENT: High Priority Issue Detected',
        body: 'A high priority issue has been detected in your architecture analysis.\n\nIssue: {{issueTitle}}\nSeverity: {{severity}}\nComponent: {{component}}\n\nPlease review immediately: {{analysisUrl}}',
        variables: ['issueTitle', 'severity', 'component', 'analysisUrl']
      },
      {
        id: '3',
        name: 'SMS Alert',
        type: 'sms',
        subject: '',
        body: 'CloudArc Alert: {{message}} - {{analysisUrl}}',
        variables: ['message', 'analysisUrl']
      }
    ];

    setTimeout(() => {
      setChannels(mockChannels);
      setRules(mockRules);
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'sms':
        return <Smartphone className="w-5 h-5" />;
      case 'webhook':
        return <Webhook className="w-5 h-5" />;
      case 'in-app':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'webhook':
        return 'bg-purple-100 text-purple-800';
      case 'in-app':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleChannel = (id: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  };

  const handleEditChannel = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setNewChannel(channel);
    setShowChannelModal(true);
  };

  const handleSaveChannel = () => {
    if (editingChannel) {
      setChannels(prev => prev.map(channel => 
        channel.id === editingChannel.id 
          ? { ...channel, ...newChannel }
          : channel
      ));
    } else {
      const channel: NotificationChannel = {
        id: Date.now().toString(),
        name: newChannel.name!,
        type: newChannel.type as NotificationChannel['type'],
        enabled: newChannel.enabled!,
        config: newChannel.config || {}
      };
      setChannels(prev => [channel, ...prev]);
    }
    setShowChannelModal(false);
    setEditingChannel(null);
    setNewChannel({
      name: '',
      type: 'email',
      enabled: true,
      config: {}
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
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
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-foreground-muted">
            Configure notification settings, alerts, and communication preferences
          </p>
        </div>
        <button
          onClick={() => setShowChannelModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { id: 'channels', name: 'Channels', icon: Bell },
          { id: 'rules', name: 'Rules', icon: Settings },
          { id: 'templates', name: 'Templates', icon: MessageSquare },
          { id: 'settings', name: 'Settings', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'channels' | 'rules' | 'templates' | 'settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getChannelColor(channel.type)}`}>
                    {getChannelIcon(channel.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{channel.name}</h3>
                    <p className="text-sm text-foreground-muted capitalize">{channel.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleChannel(channel.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      channel.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {channel.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {channel.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => handleEditChannel(channel)}
                    className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(channel.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-foreground-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-foreground font-mono">
                        {typeof value === 'string' && value.includes('***') ? '••••••••' : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {rule.frequency}
                    </span>
                  </div>
                  <p className="text-foreground-muted text-sm mb-3">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-2">Event</h4>
                      <p className="text-sm text-foreground-muted font-mono">{rule.event}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-2">Channels</h4>
                      <div className="flex flex-wrap gap-1">
                        {rule.channels.map((channelId) => {
                          const channel = channels.find(c => c.id === channelId);
                          return channel ? (
                            <span key={channelId} className={`px-2 py-1 rounded text-xs ${getChannelColor(channel.type)}`}>
                              {channel.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="font-medium text-foreground text-sm mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-1">
                      {rule.conditions.map((condition) => (
                        <span key={condition} className="px-2 py-1 bg-muted text-foreground-muted rounded text-xs font-mono">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(template.type)}`}>
                      {template.type}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {template.subject && (
                      <div>
                        <h4 className="font-medium text-foreground text-sm mb-1">Subject</h4>
                        <p className="text-sm text-foreground-muted bg-muted rounded p-2 font-mono">
                          {template.subject}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">Body</h4>
                      <p className="text-sm text-foreground-muted bg-muted rounded p-2 font-mono whitespace-pre-wrap">
                        {template.body}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">Variables</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable) => (
                          <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Global Notification Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Enable Notifications</h4>
                  <p className="text-sm text-foreground-muted">Allow all notification types</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Quiet Hours</h4>
                  <p className="text-sm text-foreground-muted">Suppress non-critical notifications during quiet hours</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-600">10 PM - 8 AM</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Digest Mode</h4>
                  <p className="text-sm text-foreground-muted">Group similar notifications into digest emails</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {editingChannel ? 'Edit Channel' : 'Add Channel'}
              </h2>
              <button
                onClick={() => setShowChannelModal(false)}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter channel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Channel Type *
                </label>
                <select
                  value={newChannel.type || 'email'}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, type: e.target.value as NotificationChannel['type'] }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="webhook">Webhook</option>
                  <option value="in-app">In-App</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newChannel.enabled || false}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="enabled" className="text-sm text-foreground">
                  Enable this channel
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={() => setShowChannelModal(false)}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChannel}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingChannel ? 'Update' : 'Add'} Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
