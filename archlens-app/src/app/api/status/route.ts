import { NextResponse } from 'next/server';
import { 
  getAvailableProviders, 
  isProviderAvailable, 
  getGlobalClientInfo, 
  createLLMClientFromEnv 
} from '../../../lib/llm-factory';
import { LLMProvider } from '../../../types/llm-types';

export async function GET() {
  try {
    // Get available providers
    const availableProviders = getAvailableProviders();
    
    // Get current global client info
    const currentClient = getGlobalClientInfo();
    
    // Test individual provider availability
    const providerStatus = Object.values(LLMProvider).map(provider => ({
      provider,
      available: isProviderAvailable(provider),
      current: currentClient?.provider === provider
    }));

    // Get environment configuration status
    const envStatus = {
      openai: !!(process.env.OPENAI_API_KEY),
      anthropic: !!(process.env.ANTHROPIC_API_KEY),
      gemini: !!(process.env.GEMINI_API_KEY),
      ollama: !!(process.env.OLLAMA_HOST),
      local: !!(process.env.LOCAL_LLM_URL),
      enterprise: !!(process.env.ENTERPRISE_LLM_TOKEN || process.env.ENTERPRISE_LLM_URL),
      apigee: !!(process.env.APIGEE_NONPROD_LOGIN_URL && process.env.APIGEE_CONSUMER_KEY)
    };

    // Try to initialize client to check overall status
    let systemStatus = 'healthy';
    let systemMessage = 'LLM system is operational';
    
    try {
      const client = createLLMClientFromEnv();
      if (!client) {
        systemStatus = 'warning';
        systemMessage = 'No LLM provider configured';
      }
    } catch (error) {
      systemStatus = 'error';
      systemMessage = `LLM system error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      status: systemStatus,
      message: systemMessage,
      availableProviders,
      providerCount: availableProviders.length,
      currentClient,
      providerStatus,
      environmentStatus: envStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to check system status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
