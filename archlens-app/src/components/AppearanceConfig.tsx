"use client";

import { useState } from 'react';
import { 
  Palette, 
  Save, 
  Upload, 
  Eye, 
  Image,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
}

interface Branding {
  logo: string | null;
  favicon: string | null;
  companyName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  customCSS: string;
}

export function AppearanceConfig() {
  const [theme, setTheme] = useState<Theme>({
    id: 'default',
    name: 'Default Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      foreground: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: '0.5rem'
  });

  const [branding, setBranding] = useState<Branding>({
    logo: null,
    favicon: null,
    companyName: 'CloudArc',
    tagline: 'Enterprise Cloud Architecture Review',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    customCSS: ''
  });

  const [activeTab, setActiveTab] = useState<'theme' | 'branding' | 'preview'>('theme');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const predefinedThemes: Theme[] = [
    {
      id: 'default',
      name: 'Default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        foreground: '#0f172a',
        muted: '#64748b',
        border: '#e2e8f0'
      },
      fonts: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
      borderRadius: '0.5rem'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      colors: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        accent: '#fbbf24',
        background: '#0f172a',
        surface: '#1e293b',
        foreground: '#f1f5f9',
        muted: '#94a3b8',
        border: '#334155'
      },
      fonts: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
      borderRadius: '0.5rem'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      colors: {
        primary: '#1e40af',
        secondary: '#475569',
        accent: '#dc2626',
        background: '#ffffff',
        surface: '#f1f5f9',
        foreground: '#0f172a',
        muted: '#475569',
        border: '#cbd5e1'
      },
      fonts: { heading: 'Roboto', body: 'Roboto', mono: 'Fira Code' },
      spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
      borderRadius: '0.25rem'
    }
  ];

  const handleColorChange = (colorKey: keyof Theme['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleFontChange = (fontKey: keyof Theme['fonts'], value: string) => {
    setTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value
      }
    }));
  };

  const handleSpacingChange = (spacingKey: keyof Theme['spacing'], value: string) => {
    setTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [spacingKey]: value
      }
    }));
  };

  const handleBrandingChange = (key: keyof Branding, value: string | null) => {
    setBranding(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleBrandingChange('logo', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleBrandingChange('favicon', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, this would save to your configuration API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({ type: 'success', text: 'Appearance settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save appearance settings' });
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appearance & Branding</h2>
          <p className="text-foreground-muted">
            Customize the look and feel of your CloudArc instance
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={clearMessage} className="text-current hover:opacity-70">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { id: 'theme', name: 'Theme', icon: Palette },
          { id: 'branding', name: 'Branding', icon: Image },
          { id: 'preview', name: 'Preview', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'theme' | 'branding' | 'preview')}
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

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Predefined Themes */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Predefined Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predefinedThemes.map((predefinedTheme) => (
                <div
                  key={predefinedTheme.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    theme.id === predefinedTheme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => applyTheme(predefinedTheme)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: predefinedTheme.colors.primary }}
                    ></div>
                    <h4 className="font-medium text-foreground">{predefinedTheme.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    {Object.values(predefinedTheme.colors).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Color Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(theme.colors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground w-24 capitalize">
                    {key}:
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                      className="w-12 h-8 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof Theme['colors'], e.target.value)}
                      className="flex-1 px-3 py-1 bg-surface border border-border rounded text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Typography</h3>
            <div className="space-y-4">
              {Object.entries(theme.fonts).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground w-24 capitalize">
                    {key}:
                  </label>
                  <select
                    value={value}
                    onChange={(e) => handleFontChange(key as keyof Theme['fonts'], e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Spacing</h3>
            <div className="space-y-4">
              {Object.entries(theme.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground w-24 uppercase">
                    {key}:
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSpacingChange(key as keyof Theme['spacing'], e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Border Radius</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground w-24">
                Radius:
              </label>
              <input
                type="text"
                value={theme.borderRadius}
                onChange={(e) => setTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                className="flex-1 px-3 py-2 bg-surface border border-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={branding.companyName}
                  onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Logo</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  {branding.logo ? (
                    <img src={branding.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Image className="w-8 h-8 text-foreground-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </label>
                  <p className="text-sm text-foreground-muted mt-2">
                    Recommended: 200x60px, PNG or SVG format
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Favicon</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  {branding.favicon ? (
                    <img src={branding.favicon} alt="Favicon" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Image className="w-6 h-6 text-foreground-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Favicon
                  </label>
                  <p className="text-sm text-foreground-muted mt-2">
                    Recommended: 32x32px, ICO or PNG format
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Custom CSS</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional CSS Styles
              </label>
              <textarea
                value={branding.customCSS}
                onChange={(e) => handleBrandingChange('customCSS', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="/* Add your custom CSS here */"
              />
              <p className="text-sm text-foreground-muted mt-2">
                Add custom CSS to further customize the appearance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Theme Preview</h3>
            <div className="space-y-4">
              {/* Header Preview */}
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {branding.logo && (
                      <img src={branding.logo} alt="Logo" className="h-8" />
                    )}
                    <div>
                      <h1 className="text-xl font-bold" style={{ color: theme.colors.foreground }}>
                        {branding.companyName}
                      </h1>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>
                        {branding.tagline}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.background
                    }}
                  >
                    Action Button
                  </button>
                </div>
              </div>

              {/* Card Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius
                  }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>
                    Sample Card
                  </h3>
                  <p className="text-sm mb-3" style={{ color: theme.colors.muted }}>
                    This is a preview of how your theme will look
                  </p>
                  <div className="flex gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.background
                      }}
                    >
                      Primary
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.background
                      }}
                    >
                      Secondary
                    </span>
                  </div>
                </div>

                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius
                  }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: theme.colors.foreground }}>
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: value }}
                        ></div>
                        <span className="text-xs capitalize" style={{ color: theme.colors.muted }}>
                          {key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
