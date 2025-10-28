"use client";

import { useState } from 'react';
import { 
  Lightbulb, 
  ExternalLink, 
  TrendingUp, 
  Shield, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Star,
  Info
} from 'lucide-react';

interface BlueprintInsight {
  blueprintId: string;
  blueprintName: string;
  similarityScore: number;
  insights: string[];
  recommendations: string[];
}

interface BlueprintInsightsProps {
  insights: BlueprintInsight[];
  className?: string;
}

export default function BlueprintInsights({ insights, className = "" }: BlueprintInsightsProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleInsight = (blueprintId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(blueprintId)) {
      newExpanded.delete(blueprintId);
    } else {
      newExpanded.add(blueprintId);
    }
    setExpandedInsights(newExpanded);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Very High';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Blueprint Insights</h3>
            <p className="text-sm text-gray-600">
              Recommendations based on similar successful architectures
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const isExpanded = expandedInsights.has(insight.blueprintId);
            const similarityColor = getSimilarityColor(insight.similarityScore);
            const similarityLabel = getSimilarityLabel(insight.similarityScore);

            return (
              <div 
                key={insight.blueprintId}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleInsight(insight.blueprintId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900">
                          {insight.blueprintName}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${similarityColor}`}>
                        {similarityLabel} Similarity ({Math.round(insight.similarityScore * 100)}%)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Insights */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900">Key Insights</h4>
                        </div>
                        <ul className="space-y-1">
                          {insight.insights.map((insightText, insightIndex) => (
                            <li key={insightIndex} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              <span>{insightText}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <h4 className="font-medium text-gray-900">Recommendations</h4>
                        </div>
                        <ul className="space-y-1">
                          {insight.recommendations.map((recommendation, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          View Blueprint
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                          <Shield className="w-3 h-3" />
                          Apply Patterns
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Summary</h4>
          </div>
          <p className="text-sm text-blue-800">
            Found {insights.length} similar blueprint{insights.length !== 1 ? 's' : ''} with proven 
            architecture patterns that can inform your design decisions. 
            Consider implementing the recommended patterns for improved architecture quality.
          </p>
        </div>
      </div>
    </div>
  );
}
