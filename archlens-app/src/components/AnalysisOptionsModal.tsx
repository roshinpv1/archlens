"use client";

import { useState, useEffect } from 'react';
import { X, Check, CheckSquare, Square } from 'lucide-react';
import { ARCHITECTURE_REVIEW_OPTIONS, ArchitectureReviewOption } from '@/lib/architectureReviewOptions';

export type { ArchitectureReviewOption };
export { ARCHITECTURE_REVIEW_OPTIONS };

interface AnalysisOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: string[]) => void;
  defaultSelected?: string[];
}

export function AnalysisOptionsModal({
  isOpen,
  onClose,
  onConfirm,
  defaultSelected
}: AnalysisOptionsModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    defaultSelected || ARCHITECTURE_REVIEW_OPTIONS.map(opt => opt.id)
  );

  useEffect(() => {
    if (isOpen) {
      // Reset to all selected when modal opens
      setSelectedOptions(defaultSelected || ARCHITECTURE_REVIEW_OPTIONS.map(opt => opt.id));
    }
  }, [isOpen, defaultSelected]);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleAll = () => {
    if (selectedOptions.length === ARCHITECTURE_REVIEW_OPTIONS.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(ARCHITECTURE_REVIEW_OPTIONS.map(opt => opt.id));
    }
  };

  const handleConfirm = () => {
    if (selectedOptions.length === 0) {
      alert('Please select at least one review option');
      return;
    }
    onConfirm(selectedOptions);
  };

  if (!isOpen) return null;

  const categories = {
    functional: ARCHITECTURE_REVIEW_OPTIONS.filter(opt => opt.category === 'functional'),
    structural: ARCHITECTURE_REVIEW_OPTIONS.filter(opt => opt.category === 'structural'),
    operational: ARCHITECTURE_REVIEW_OPTIONS.filter(opt => opt.category === 'operational'),
    quality: ARCHITECTURE_REVIEW_OPTIONS.filter(opt => opt.category === 'quality')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Architecture Review Options</h2>
            <p className="text-sm text-foreground-muted mt-1">
              Select the aspects you want to analyze in your architecture (cloud, non-cloud, or hybrid)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Select All Toggle */}
          <div className="mb-6 pb-4 border-b border-border">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover rounded-lg transition-colors"
            >
              {selectedOptions.length === ARCHITECTURE_REVIEW_OPTIONS.length ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5 text-foreground-muted" />
              )}
              <span className="font-medium text-foreground">
                {selectedOptions.length === ARCHITECTURE_REVIEW_OPTIONS.length
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
              <span className="text-sm text-foreground-muted">
                ({selectedOptions.length} of {ARCHITECTURE_REVIEW_OPTIONS.length} selected)
              </span>
            </button>
          </div>

          {/* Options by Category */}
          <div className="space-y-6">
            {/* Functional */}
            {categories.functional.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Functional</h3>
                <div className="space-y-2">
                  {categories.functional.map(option => (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(option.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary border-border hover:bg-secondary-hover'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedOptions.includes(option.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{option.name}</h4>
                        <p className="text-sm text-foreground-muted mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structural */}
            {categories.structural.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Structural</h3>
                <div className="space-y-2">
                  {categories.structural.map(option => (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(option.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary border-border hover:bg-secondary-hover'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedOptions.includes(option.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{option.name}</h4>
                        <p className="text-sm text-foreground-muted mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operational */}
            {categories.operational.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Operational</h3>
                <div className="space-y-2">
                  {categories.operational.map(option => (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(option.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary border-border hover:bg-secondary-hover'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedOptions.includes(option.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{option.name}</h4>
                        <p className="text-sm text-foreground-muted mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality */}
            {categories.quality.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Quality</h3>
                <div className="space-y-2">
                  {categories.quality.map(option => (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(option.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary border-border hover:bg-secondary-hover'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedOptions.includes(option.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-foreground-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{option.name}</h4>
                        <p className="text-sm text-foreground-muted mt-1">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-foreground-muted">
            {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-foreground rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

