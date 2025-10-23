# CloudArc - Cloud Architecture Review System

A comprehensive AI-powered cloud architecture analysis and review system that supports multiple cloud platforms and provides detailed analysis of architecture diagrams and Infrastructure as Code (IaC) files.

## Features

- **Multi-Platform Support**: Analyzes architectures for AWS, Azure, GCP, and generic cloud platforms
- **File Upload**: Supports architecture images (PNG, JPG, GIF, WebP) and IaC files (Terraform, YAML, JSON, XML)
- **Component Detection**: Automatically identifies and classifies cloud components
- **Risk Assessment**: Detects security vulnerabilities, compliance gaps, and reliability issues
- **Cost Analysis**: Identifies cost optimization opportunities
- **Compliance Checking**: Supports CIS, PCI-DSS, HIPAA, GDPR, SOC2, and ISO27001 frameworks
- **Structured Output**: Provides both human-readable reports and structured JSON exports
- **Multiple LLM Providers**: Supports OpenAI, Anthropic, Gemini, Ollama, Local, Enterprise, and Apigee LLM providers
- **Advanced LLM Management**: Real-time provider status monitoring, automatic fallback, and retry logic
- **Provider Testing**: Built-in endpoints for testing LLM connectivity and performance
- **Configuration Monitoring**: Comprehensive configuration validation and environment checking

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- An LLM provider API key (OpenAI, Anthropic, Gemini, or local setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CloudArc-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and configure your preferred LLM provider:

**For OpenAI:**
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
```

**For Anthropic:**
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

**For Google Gemini:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

**For Local LLM (Ollama):**
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama-3.2-3b-instruct
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload File**: Drag and drop or click to upload an architecture diagram or IaC file
2. **Analysis**: The system will automatically analyze the file and provide comprehensive insights
3. **Review Results**: View detailed analysis including:
   - Component identification and mapping
   - Risk assessment and security gaps
   - Compliance gaps and remediation steps
   - Cost optimization recommendations
   - Architecture description and summary
4. **Export**: Download results as structured JSON for further processing

## Analysis Capabilities

### Component Detection
- **Compute**: EC2, VM instances, containers, serverless functions
- **Storage**: S3, Blob Storage, Cloud Storage, databases
- **Networking**: VPCs, load balancers, CDNs, firewalls
- **Security**: IAM, security groups, encryption services
- **Monitoring**: CloudWatch, monitoring tools, logging services

### Risk Assessment
- **Security**: Unencrypted data, exposed services, weak authentication
- **Reliability**: Single points of failure, missing redundancy
- **Performance**: Bottlenecks, scalability issues
- **Cost**: Overprovisioned resources, unused services

### Compliance Frameworks
- **CIS**: Center for Internet Security benchmarks
- **PCI-DSS**: Payment Card Industry standards
- **HIPAA**: Healthcare compliance requirements
- **GDPR**: General Data Protection Regulation
- **SOC2**: Service Organization Control 2
- **ISO27001**: Information security management

## API Endpoints

### POST /api/analyze
Analyzes uploaded architecture files using configured LLM providers.

**Request:**
- `file`: Architecture file (image or IaC)
- `options`: Analysis configuration (optional)

**Response:**
- Structured analysis results in JSON format
- Includes LLM provider and model information
- Enhanced error handling with provider fallback

### GET /api/status
Returns comprehensive LLM system status and health information.

**Response:**
```json
{
  "status": "healthy|warning|error",
  "message": "System status message",
  "availableProviders": ["openai", "anthropic", ...],
  "providerCount": 2,
  "currentClient": {
    "provider": "openai",
    "model": "gpt-4",
    "available": true
  },
  "providerStatus": [...],
  "environmentStatus": {...}
}
```

### GET /api/config
Returns detailed configuration information for all LLM providers.

**Response:**
- Complete provider configuration details
- Environment variable status (sensitive data masked)
- Provider availability and error information

### POST /api/test-llm
Tests connectivity and functionality of specific LLM providers.

**Request:**
```json
{
  "provider": "openai|anthropic|gemini|ollama|local|enterprise|apigee",
  "testPrompt": "Optional custom test prompt"
}
```

**Response:**
- Test results with response time metrics
- Provider-specific error details
- Connection status and model information

### GET /api/test-llm
Returns information about available providers for testing.

## Configuration

### LLM Provider Priority
The system checks for LLM providers in this order:
1. OpenAI
2. Anthropic  
3. Gemini
4. Apigee
5. Enterprise
6. Local
7. Ollama

### Analysis Options
- `includeCostAnalysis`: Enable cost optimization analysis
- `includeComplianceCheck`: Enable compliance gap detection
- `frameworks`: Specific compliance frameworks to check
- `focusAreas`: Areas of focus (security, reliability, cost, etc.)

## Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── FileUpload.tsx  # File upload component
│   ├── AnalysisResults.tsx # Results display
│   └── Header.tsx      # Header component
└── types/              # TypeScript types
    └── architecture.ts # Architecture analysis types
```

### Key Components
- **FileUpload**: Handles file upload and validation
- **AnalysisResults**: Displays analysis results with tabs
- **Header**: Application header with branding
- **API Route**: Handles file processing and LLM integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
