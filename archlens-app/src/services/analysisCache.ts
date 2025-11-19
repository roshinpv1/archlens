/**
 * Analysis Cache Service
 * Caches analysis results for identical inputs to ensure consistency
 */

import crypto from 'crypto';

interface CachedAnalysis {
  hash: string;
  analysis: any;
  timestamp: Date;
  expiresAt: Date;
}

// In-memory cache (can be replaced with Redis in production)
const analysisCache = new Map<string, CachedAnalysis>();

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate hash from file content and metadata
 */
export function generateAnalysisHash(
  fileContent: string | Buffer,
  appId?: string,
  componentName?: string,
  environment?: string,
  version?: string
): string {
  const content = typeof fileContent === 'string' 
    ? fileContent 
    : fileContent.toString('base64');
  
  const metadata = JSON.stringify({
    appId: appId || '',
    componentName: componentName || '',
    environment: environment || '',
    version: version || ''
  });
  
  const hashInput = `${content}::${metadata}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Get cached analysis if available
 */
export function getCachedAnalysis(hash: string): any | null {
  const cached = analysisCache.get(hash);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache expired
  if (new Date() > cached.expiresAt) {
    analysisCache.delete(hash);
    return null;
  }
  
  console.log(`✅ Using cached analysis for hash: ${hash.substring(0, 8)}...`);
  return cached.analysis;
}

/**
 * Cache analysis result
 */
export function cacheAnalysis(hash: string, analysis: any): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);
  
  analysisCache.set(hash, {
    hash,
    analysis,
    timestamp: now,
    expiresAt
  });
  
  console.log(`💾 Cached analysis for hash: ${hash.substring(0, 8)}... (expires: ${expiresAt.toISOString()})`);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = new Date();
  let cleared = 0;
  
  for (const [hash, cached] of analysisCache.entries()) {
    if (now > cached.expiresAt) {
      analysisCache.delete(hash);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired cache entries`);
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  const size = analysisCache.size;
  analysisCache.clear();
  console.log(`🧹 Cleared all cache (${size} entries)`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{
    hash: string;
    timestamp: string;
    expiresAt: string;
  }>;
} {
  return {
    size: analysisCache.size,
    entries: Array.from(analysisCache.values()).map(cached => ({
      hash: cached.hash.substring(0, 16) + '...',
      timestamp: cached.timestamp.toISOString(),
      expiresAt: cached.expiresAt.toISOString()
    }))
  };
}

// Clean up expired entries every hour
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredCache, 60 * 60 * 1000);
}

