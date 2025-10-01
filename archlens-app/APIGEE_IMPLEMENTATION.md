# Apigee LLM Implementation Guide

## Overview
The Apigee LLM implementation provides enterprise-grade LLM access through Apigee API Gateway with OAuth 2.0 authentication.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│  Apigee Gateway  │───▶│  Enterprise LLM │
│                 │    │                  │    │                 │
│ • OAuth Client  │    │ • Token Exchange │    │ • GPT-4/Claude  │
│ • Request Headers│    │ • Rate Limiting  │    │ • Model Access  │
│ • Error Handling│    │ • Monitoring     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Environment Variables

### Required Variables
```bash
# Apigee OAuth Configuration
APIGEE_NONPROD_LOGIN_URL=https://your-org.apigee.net/oauth/token
APIGEE_CONSUMER_KEY=your_consumer_key
APIGEE_CONSUMER_SECRET=your_consumer_secret

# Enterprise LLM Endpoint
ENTERPRISE_BASE_URL=https://your-enterprise-llm.com/api

# Workflow Configuration
WF_USE_CASE_ID=your_use_case_id
WF_CLIENT_ID=your_client_id
WF_API_KEY=your_api_key

# Optional Configuration
APIGEE_MODEL=gpt-4
APIGEE_TEMPERATURE=0.1
APIGEE_MAX_TOKENS=4000
APIGEE_TIMEOUT=600000
```

## OAuth 2.0 Flow

### 1. Token Acquisition
```typescript
// Client Credentials Grant
POST /oauth/token
Authorization: Basic {base64(consumer_key:consumer_secret)}
Content-Type: application/x-www-form-urlencoded

Body: grant_type=client_credentials
```

### 2. Token Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 3. LLM Request
```typescript
POST /v1/chat/completions
Authorization: Bearer {access_token}
x-w-request-date: 2024-01-01T00:00:00.000Z
x-request-id: {uuid}
x-correlation-id: {uuid}
X-YY-client-id: {wf_client_id}
X-YY-api-key: {wf_api_key}
X-YY-usecase-id: {wf_use_case_id}
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [{"role": "user", "content": "prompt"}],
  "temperature": 0.1,
  "max_tokens": 4000
}
```

## Implementation Details

### ApigeeTokenManager
- **Token Caching**: 1-hour cache with automatic refresh
- **OAuth Flow**: Client credentials grant type
- **Error Handling**: Comprehensive error messages
- **Retry Logic**: Automatic token refresh on expiry

### Request Headers
- **Authorization**: Bearer token from OAuth
- **x-w-request-date**: ISO timestamp
- **x-request-id**: UUID for request tracking
- **x-correlation-id**: UUID for correlation
- **X-YY-***: Enterprise-specific headers

### Error Handling
- **OAuth Errors**: Invalid credentials, network issues
- **API Errors**: Rate limiting, model unavailability
- **Timeout Errors**: Request timeout handling
- **Token Errors**: Expired/invalid token refresh

## Usage Example

```typescript
import { createLLMClientFromEnv } from './llm-factory';

// Auto-detects Apigee if environment variables are set
const llmClient = createLLMClientFromEnv();

if (llmClient) {
  const response = await llmClient.callLLM("Analyze this architecture...");
  console.log(response);
}
```

## Security Considerations

1. **Token Storage**: Tokens are cached in memory only
2. **Credential Protection**: Consumer key/secret in environment variables
3. **Request Tracking**: UUIDs for audit trails
4. **Timeout Protection**: Configurable request timeouts
5. **Error Sanitization**: No sensitive data in error messages

## Monitoring & Debugging

### Logging
- OAuth token acquisition attempts
- Request/response correlation IDs
- Error details with status codes
- Token refresh events

### Health Checks
- Environment variable validation
- OAuth endpoint connectivity
- Enterprise LLM availability
- Token validity verification

## Troubleshooting

### Common Issues

1. **"Apigee OAuth credentials not configured"**
   - Check: APIGEE_NONPROD_LOGIN_URL, APIGEE_CONSUMER_KEY, APIGEE_CONSUMER_SECRET

2. **"Apigee enterprise configuration incomplete"**
   - Check: ENTERPRISE_BASE_URL, WF_USE_CASE_ID, WF_CLIENT_ID, WF_API_KEY

3. **"Apigee OAuth failed: 401"**
   - Verify consumer key/secret are correct
   - Check OAuth endpoint URL

4. **"Apigee API error: 429"**
   - Rate limiting - implement backoff strategy
   - Check enterprise LLM quotas

### Debug Mode
```bash
# Enable debug logging
DEBUG=apigee:*
npm run dev
```

## Testing

### Unit Tests
```typescript
// Test OAuth flow
const tokenManager = new ApigeeTokenManager();
const token = await tokenManager.getApigeeToken();

// Test LLM call
const client = new LLMClient(apigeeConfig);
const response = await client.callLLM("test prompt");
```

### Integration Tests
- End-to-end OAuth flow
- Enterprise LLM connectivity
- Error handling scenarios
- Token refresh logic

## Performance Optimization

1. **Token Caching**: Reduces OAuth calls
2. **Connection Pooling**: Reuse HTTP connections
3. **Request Batching**: Multiple prompts in single request
4. **Timeout Tuning**: Optimize for enterprise latency

## Future Enhancements

1. **Token Refresh**: Automatic refresh before expiry
2. **Circuit Breaker**: Fail-fast on repeated errors
3. **Metrics**: Request latency and success rates
4. **Retry Logic**: Exponential backoff for transient failures
