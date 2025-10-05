"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { BlueprintManager } from '@/components/BlueprintManager';
import { ChecklistManager } from '@/components/ChecklistManager';
import { DatabaseConfig } from '@/components/DatabaseConfig';
import { SecurityConfig } from '@/components/SecurityConfig';
import { UserManagement } from '@/components/UserManagement';
import { NotificationsConfig } from '@/components/NotificationsConfig';
import { AppearanceConfig } from '@/components/AppearanceConfig';
import { Settings, CheckSquare, FileText, Database, Shield, Users, Bell, Palette } from 'lucide-react';

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('checklist');

  const configurationSections = [
    {
      id: 'checklist',
      name: 'Checklist Management',
      description: 'Manage security and compliance checklist items',
      icon: CheckSquare,
      color: 'text-blue-600'
    },
    {
      id: 'blueprints',
      name: 'Blueprint Library',
      description: 'Manage architecture blueprints and IAC templates',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'database',
      name: 'Database Settings',
      description: 'Configure database connections and settings',
      icon: Database,
      color: 'text-purple-600'
    },
    {
      id: 'security',
      name: 'Security Policies',
      description: 'Configure security policies and access controls',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      id: 'users',
      name: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Configure notification settings and alerts',
      icon: Bell,
      color: 'text-yellow-600'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      description: 'Customize UI themes and branding',
      icon: Palette,
      color: 'text-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
          </div>
          <p className="text-foreground-muted text-lg">
            Manage system settings, policies, and enterprise configurations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Configuration Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Configuration Sections</h2>
              <nav className="space-y-2">
                {configurationSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        activeTab === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${activeTab === section.id ? 'text-primary-foreground' : section.color}`} />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className={`text-sm ${activeTab === section.id ? 'text-primary-foreground/80' : 'text-foreground-muted'}`}>
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Configuration Content */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-border rounded-xl p-8">
              {activeTab === 'checklist' && (
                <ChecklistManager />
              )}

              {activeTab === 'blueprints' && (
                <div>
                  <BlueprintManager />
                </div>
              )}

              {activeTab === 'database' && (
                <DatabaseConfig />
              )}

              {activeTab === 'security' && (
                <SecurityConfig />
              )}

              {activeTab === 'users' && (
                <UserManagement />
              )}

              {activeTab === 'notifications' && (
                <NotificationsConfig />
              )}

              {activeTab === 'appearance' && (
                <AppearanceConfig />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
