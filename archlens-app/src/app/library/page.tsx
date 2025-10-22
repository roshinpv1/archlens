"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { BlueprintManager } from '@/components/BlueprintManager';
import { ChecklistManager } from '@/components/ChecklistManager';
import { Library, CheckSquare, FileText } from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('checklist');

  const librarySections = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Library className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Library</h1>
          </div>
          <p className="text-foreground-muted text-lg">
            Manage checklists, blueprints, and architecture templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Library Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Library Sections</h2>
              <nav className="space-y-2">
                {librarySections.map((section) => {
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

          {/* Library Content */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-border rounded-xl p-8">
              {activeTab === 'checklist' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-foreground">Checklist Management</h2>
                  </div>
                  <ChecklistManager />
                </div>
              )}

              {activeTab === 'blueprints' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-foreground">Blueprint Library</h2>
                  </div>
                  <BlueprintManager />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


