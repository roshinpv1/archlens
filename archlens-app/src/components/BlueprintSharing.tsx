"use client";

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare, 
  Link, 
  Eye, 
  EyeOff, 
  Lock, 
  Globe,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Blueprint } from '@/types/blueprint';

interface BlueprintSharingProps {
  blueprint: Blueprint;
  isOpen: boolean;
  onClose: () => void;
  onVisibilityChange?: (isPublic: boolean) => void;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action: () => void;
}

export function BlueprintSharing({ 
  blueprint, 
  isOpen, 
  onClose, 
  onVisibilityChange 
}: BlueprintSharingProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Generate share URL and embed code when component opens
  useState(() => {
    if (isOpen) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/blueprints/${blueprint.id}`;
      setShareUrl(url);
      
      const embed = `<iframe src="${url}" width="100%" height="400" frameborder="0"></iframe>`;
      setEmbedCode(embed);
    }
  });

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleCopyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  const handleEmailShare = () => {
    const subject = `Check out this blueprint: ${blueprint.name}`;
    const body = `I found this interesting blueprint that might be useful for you:\n\n${blueprint.name}\n${blueprint.description}\n\nView it here: ${shareUrl}`;
    const mailtoUrl = `mailto:${emailData.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out this blueprint: ${blueprint.name}`;
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleVisibilityToggle = () => {
    const newVisibility = !blueprint.isPublic;
    onVisibilityChange?.(newVisibility);
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'copy-url',
      name: 'Copy Link',
      icon: Copy,
      description: 'Copy the blueprint URL to clipboard',
      action: handleCopyUrl
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Share via email',
      action: () => {} // Will be handled by email form
    },
    {
      id: 'embed',
      name: 'Embed Code',
      icon: Link,
      description: 'Get embed code for websites',
      action: handleCopyEmbedCode
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      description: 'Generate QR code for mobile sharing',
      action: () => setShowQRCode(true)
    }
  ];

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', color: 'text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', color: 'text-blue-600' },
    { id: 'facebook', name: 'Facebook', color: 'text-blue-700' },
    { id: 'reddit', name: 'Reddit', color: 'text-orange-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Share Blueprint</h2>
              <p className="text-sm text-foreground-muted">{blueprint.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Visibility Control */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {blueprint.isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
                <span className="font-medium text-foreground">
                  {blueprint.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <button
                onClick={handleVisibilityToggle}
                className="flex items-center gap-2 px-3 py-1 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
              >
                {blueprint.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {blueprint.isPublic ? 'Make Private' : 'Make Public'}
              </button>
            </div>
            <p className="text-sm text-foreground-muted">
              {blueprint.isPublic 
                ? 'This blueprint is visible to everyone and can be discovered in searches.'
                : 'This blueprint is only visible to you and people you share it with.'
              }
            </p>
          </div>

          {/* Share URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Share URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-foreground-muted"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Share Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className="flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">{option.name}</div>
                      <div className="text-sm text-foreground-muted">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Media Sharing */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Social Media</h3>
            <div className="flex flex-wrap gap-2">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleSocialShare(platform.id)}
                  className={`flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors ${platform.color}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Email Sharing */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Email Sharing</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Check out this blueprint"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a personal message..."
                />
              </div>
              <button
                onClick={handleEmailShare}
                disabled={!emailData.to}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Embed Code</h3>
            <div className="space-y-2">
              <textarea
                value={embedCode}
                readOnly
                rows={3}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground-muted font-mono text-sm"
              />
              <button
                onClick={handleCopyEmbedCode}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Access Control</p>
                <p>
                  {blueprint.isPublic 
                    ? 'Anyone with the link can view this blueprint. Consider making it private for sensitive content.'
                    : 'Only you can view this blueprint. Share the link to give others access.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
