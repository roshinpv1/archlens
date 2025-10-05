"use client";

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Lock,
  Key,
  Users,
  Globe,
  Clock,
  Settings
} from 'lucide-react';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'authentication' | 'authorization' | 'encryption' | 'network' | 'audit' | 'compliance';
  enabled: boolean;
  rules: SecurityRule[];
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

interface AccessControl {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users: string[];
  groups: string[];
  resources: string[];
  expiresAt?: Date;
}

export function SecurityConfig() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'policies' | 'access' | 'encryption' | 'audit'>('policies');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Partial<SecurityPolicy>>({
    name: '',
    description: '',
    type: 'authentication',
    enabled: true,
    rules: []
  });

  // Mock data
  useEffect(() => {
    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Password Policy',
        description: 'Enforce strong password requirements for all user accounts',
        type: 'authentication',
        enabled: true,
        rules: [
          {
            id: '1',
            name: 'Minimum Length',
            condition: 'password.length >= 8',
            action: 'reject',
            priority: 1,
            enabled: true
          },
          {
            id: '2',
            name: 'Complexity Requirements',
            condition: 'password.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/)',
            action: 'reject',
            priority: 2,
            enabled: true
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Session Management',
        description: 'Control user session timeouts and concurrent sessions',
        type: 'authentication',
        enabled: true,
        rules: [
          {
            id: '3',
            name: 'Session Timeout',
            condition: 'session.inactive > 30 minutes',
            action: 'terminate',
            priority: 1,
            enabled: true
          },
          {
            id: '4',
            name: 'Concurrent Sessions',
            condition: 'user.sessions > 3',
            action: 'terminate_oldest',
            priority: 2,
            enabled: true
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '3',
        name: 'Data Encryption',
        description: 'Enforce encryption for data at rest and in transit',
        type: 'encryption',
        enabled: true,
        rules: [
          {
            id: '5',
            name: 'Database Encryption',
            condition: 'database.encryption != enabled',
            action: 'enable_encryption',
            priority: 1,
            enabled: true
          },
          {
            id: '6',
            name: 'File Storage Encryption',
            condition: 'storage.encryption != enabled',
            action: 'enable_encryption',
            priority: 2,
            enabled: true
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    const mockAccessControls: AccessControl[] = [
      {
        id: '1',
        name: 'Admin Access',
        description: 'Full administrative access to all system resources',
        permissions: ['read', 'write', 'delete', 'admin'],
        users: ['admin@company.com'],
        groups: ['administrators'],
        resources: ['*']
      },
      {
        id: '2',
        name: 'Analyst Access',
        description: 'Read-only access to analysis data and reports',
        permissions: ['read'],
        users: ['analyst1@company.com', 'analyst2@company.com'],
        groups: ['analysts'],
        resources: ['analyses', 'reports', 'blueprints']
      },
      {
        id: '3',
        name: 'Viewer Access',
        description: 'Limited read access to public resources only',
        permissions: ['read'],
        users: [],
        groups: ['viewers'],
        resources: ['public_analyses', 'public_blueprints']
      }
    ];

    setTimeout(() => {
      setPolicies(mockPolicies);
      setAccessControls(mockAccessControls);
      setLoading(false);
    }, 1000);
  }, []);

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication':
        return <Key className="w-4 h-4" />;
      case 'authorization':
        return <Users className="w-4 h-4" />;
      case 'encryption':
        return <Lock className="w-4 h-4" />;
      case 'network':
        return <Globe className="w-4 h-4" />;
      case 'audit':
        return <Eye className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'authentication':
        return 'bg-blue-100 text-blue-800';
      case 'authorization':
        return 'bg-green-100 text-green-800';
      case 'encryption':
        return 'bg-purple-100 text-purple-800';
      case 'network':
        return 'bg-orange-100 text-orange-800';
      case 'audit':
        return 'bg-yellow-100 text-yellow-800';
      case 'compliance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === id 
        ? { ...policy, enabled: !policy.enabled, updatedAt: new Date() }
        : policy
    ));
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm('Are you sure you want to delete this security policy?')) {
      setPolicies(prev => prev.filter(policy => policy.id !== id));
    }
  };

  const handleEditPolicy = (policy: SecurityPolicy) => {
    setEditingPolicy(policy);
    setNewPolicy(policy);
    setShowPolicyModal(true);
  };

  const handleSavePolicy = () => {
    if (editingPolicy) {
      setPolicies(prev => prev.map(policy => 
        policy.id === editingPolicy.id 
          ? { ...policy, ...newPolicy, updatedAt: new Date() }
          : policy
      ));
    } else {
      const policy: SecurityPolicy = {
        id: Date.now().toString(),
        name: newPolicy.name!,
        description: newPolicy.description!,
        type: newPolicy.type as SecurityPolicy['type'],
        enabled: newPolicy.enabled!,
        rules: newPolicy.rules || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPolicies(prev => [policy, ...prev]);
    }
    setShowPolicyModal(false);
    setEditingPolicy(null);
    setNewPolicy({
      name: '',
      description: '',
      type: 'authentication',
      enabled: true,
      rules: []
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
          <h2 className="text-2xl font-bold text-foreground">Security Policies</h2>
          <p className="text-foreground-muted">
            Configure security policies, access controls, and compliance settings
          </p>
        </div>
        <button
          onClick={() => setShowPolicyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { id: 'policies', name: 'Security Policies', icon: Shield },
          { id: 'access', name: 'Access Control', icon: Users },
          { id: 'encryption', name: 'Encryption', icon: Lock },
          { id: 'audit', name: 'Audit Logs', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'policies' | 'access' | 'encryption' | 'audit')}
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

      {/* Security Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleTogglePolicy(policy.id)}
                    className="mt-1 text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {policy.enabled ? <CheckCircle className="w-5 h-5 text-green-600" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{policy.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPolicyTypeColor(policy.type)}`}>
                        {getPolicyTypeIcon(policy.type)}
                        <span className="ml-1 capitalize">{policy.type}</span>
                      </span>
                    </div>
                    <p className="text-foreground-muted text-sm mb-3">{policy.description}</p>
                    <div className="space-y-2">
                      {policy.rules.map((rule) => (
                        <div key={rule.id} className="bg-muted rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground text-sm">{rule.name}</h4>
                              <p className="text-xs text-foreground-muted">{rule.condition}</p>
                            </div>
                            <span className="text-xs text-foreground-muted">Action: {rule.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPolicy(policy)}
                    className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Access Control Tab */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          {accessControls.map((access) => (
            <div key={access.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{access.name}</h3>
                  <p className="text-foreground-muted text-sm mb-3">{access.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {access.permissions.map((permission) => (
                          <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-2">Users</h4>
                      <div className="text-xs text-foreground-muted">
                        {access.users.length > 0 ? access.users.join(', ') : 'No specific users'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-2">Groups</h4>
                      <div className="flex flex-wrap gap-1">
                        {access.groups.map((group) => (
                          <span key={group} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-foreground-muted hover:text-error hover:bg-error-light rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Encryption Tab */}
      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-foreground">Encryption Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Data at Rest Encryption</h4>
                  <p className="text-sm text-foreground-muted">Encrypt all stored data using AES-256</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Data in Transit Encryption</h4>
                  <p className="text-sm text-foreground-muted">Use TLS 1.3 for all communications</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Key Management</h4>
                  <p className="text-sm text-foreground-muted">Use cloud provider KMS for key management</p>
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

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Audit Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Login/Logout Events</h4>
                  <p className="text-sm text-foreground-muted">Track all authentication events</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Data Access Events</h4>
                  <p className="text-sm text-foreground-muted">Log all data read/write operations</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Configuration Changes</h4>
                  <p className="text-sm text-foreground-muted">Track all system configuration modifications</p>
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

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {editingPolicy ? 'Edit Security Policy' : 'Add Security Policy'}
              </h2>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Policy Name *
                </label>
                <input
                  type="text"
                  value={newPolicy.name || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter policy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={newPolicy.description || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe what this policy does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Policy Type *
                </label>
                <select
                  value={newPolicy.type || 'authentication'}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, type: e.target.value as SecurityPolicy['type'] }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="authentication">Authentication</option>
                  <option value="authorization">Authorization</option>
                  <option value="encryption">Encryption</option>
                  <option value="network">Network</option>
                  <option value="audit">Audit</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newPolicy.enabled || false}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="enabled" className="text-sm text-foreground">
                  Enable this policy
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolicy}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingPolicy ? 'Update' : 'Add'} Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
