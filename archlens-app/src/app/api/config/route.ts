import { NextResponse } from 'next/server';
import { 
  getAvailableProviders, 
  isProviderAvailable, 
  createConfigForProvider 
} from '../../../lib/llm-factory';
import { LLMProvider } from '../../../types/llm-types';

export async function GET() {
  try {
    const availableProviders = getAvailableProviders();
    
    // Get detailed configuration for each provider
    const providerConfigs = Object.values(LLMProvider).map(provider => {
      try {
        const isAvailable = isProviderAvailable(provider);
        let config = null;
        let error = null;
        
        if (isAvailable) {
          try {
            config = createConfigForProvider(provider);
            // Remove sensitive information
            config = {
              ...config,
              apiKey: config.apiKey ? '***configured***' : undefined
            };
          } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
          }
        }
        
        return {
          provider,
          available: isAvailable,
          config,
          error
        };
      } catch (err) {
        return {
          provider,
          available: false,
          config: null,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    });

    // Environment variable status (masked)
    const envVars = {
      openai: {
        apiKey: !!process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        temperature: process.env.OPENAI_TEMPERATURE || '0.1',
        maxTokens: process.env.OPENAI_MAX_TOKENS || '4000'
      },
      anthropic: {
        apiKey: !!process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
        temperature: process.env.ANTHROPIC_TEMPERATURE || '0.1',
        maxTokens: process.env.ANTHROPIC_MAX_TOKENS || '4000'
      },
      gemini: {
        apiKey: !!process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
        temperature: process.env.GEMINI_TEMPERATURE || '0.1',
        maxTokens: process.env.GEMINI_MAX_TOKENS || '4000'
      },
      ollama: {
        configured: !!process.env.OLLAMA_HOST,
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama-3.2-3b-instruct',
        temperature: process.env.OLLAMA_TEMPERATURE || '0.1'
      },
      local: {
        configured: !!process.env.LOCAL_LLM_URL,
        url: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
        model: process.env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct',
        apiKey: !!process.env.LOCAL_LLM_API_KEY
      },
      enterprise: {
        configured: !!(process.env.ENTERPRISE_LLM_URL || process.env.ENTERPRISE_LLM_TOKEN),
        url: !!process.env.ENTERPRISE_LLM_URL,
        token: !!process.env.ENTERPRISE_LLM_TOKEN,
        refreshUrl: !!process.env.ENTERPRISE_LLM_REFRESH_URL,
        clientId: !!process.env.ENTERPRISE_LLM_CLIENT_ID
      },
      apigee: {
        configured: !!(process.env.APIGEE_NONPROD_LOGIN_URL && process.env.APIGEE_CONSUMER_KEY),
        loginUrl: !!process.env.APIGEE_NONPROD_LOGIN_URL,
        consumerKey: !!process.env.APIGEE_CONSUMER_KEY,
        consumerSecret: !!process.env.APIGEE_CONSUMER_SECRET,
        enterpriseBaseUrl: !!process.env.ENTERPRISE_BASE_URL
      }
    };

    return NextResponse.json({
      summary: {
        totalProviders: Object.values(LLMProvider).length,
        availableProviders: availableProviders.length,
        configuredProviders: providerConfigs.filter(p => p.available).length
      },
      availableProviders,
      providerDetails: providerConfigs,
      environmentVariables: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Config endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
