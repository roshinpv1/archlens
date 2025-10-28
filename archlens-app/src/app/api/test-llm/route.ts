import { NextRequest, NextResponse } from 'next/server';
import { createLLMClientFromEnv } from '@/lib/llm-factory';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing LLM client initialization...');
    console.log('Environment variables:');
    console.log('LOCAL_LLM_URL:', process.env.LOCAL_LLM_URL);
    console.log('OLLAMA_HOST:', process.env.OLLAMA_HOST);
    
    const llmClient = createLLMClientFromEnv();
    console.log('LLM Client created:', !!llmClient);
    
    if (llmClient) {
      console.log('LLM Client available:', llmClient.isAvailable());
      console.log('LLM Client config:', llmClient.getConfig());
      
      // Test a simple call
      try {
        const response = await llmClient.callLLM('Hello, are you working?', {
          temperature: 0.1,
          maxTokens: 100
        });
        console.log('LLM Response:', response);
        
        return NextResponse.json({
          success: true,
          available: llmClient.isAvailable(),
          response: response.substring(0, 100) + '...'
        });
      } catch (error) {
        console.error('LLM call failed:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          available: llmClient.isAvailable()
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'No LLM client could be created'
      });
    }
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
