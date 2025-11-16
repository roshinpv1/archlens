# ArchLens - Enterprise Cloud Architecture Analysis Platform

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Core Functionalities](#core-functionalities)
5. [Blueprint Management](#blueprint-management)
6. [Architecture Analysis](#architecture-analysis)
7. [AI-Powered Search](#ai-powered-search)
8. [Vector Database & Embeddings](#vector-database--embeddings)
9. [API Reference](#api-reference)
10. [Configuration](#configuration)
11. [Data Models](#data-models)
12. [Deployment](#deployment)

---

## 🎯 Overview

ArchLens is an enterprise-grade cloud architecture analysis platform that leverages AI and machine learning to analyze, compare, and optimize cloud architectures. The platform provides intelligent insights, recommendations, and similarity matching using vector embeddings and large language models (LLMs).

### Core Capabilities

- **Intelligent Architecture Analysis**: Automated analysis of cloud architectures with security, resiliency, cost, and compliance scoring
- **Blueprint Library**: Centralized repository for architecture blueprints with component extraction and analysis
- **Similarity Matching**: Find similar architectures and blueprints using vector embeddings
- **AI-Powered Search**: Natural language queries for blueprints and architectures
- **Component-Centric Analysis**: Deep analysis of individual components and their relationships
- **Multi-Cloud Support**: AWS, Azure, GCP, Kubernetes, and hybrid cloud architectures

---

## ✨ Key Features

### 1. **Intelligent Architecture Analysis**

- **Two-Stage Analysis Process**:
  - **Stage 1**: Component extraction and cloud provider detection
  - **Stage 2**: Comprehensive security, risk, and compliance assessment

- **Automated Scoring**:
  - Security Score (0-100)
  - Resiliency Score (0-100)
  - Cost Efficiency Score (0-100)
  - Compliance Score (0-100)

- **Detailed Insights**:
  - Risk identification and assessment
  - Compliance gap analysis
  - Cost optimization recommendations
  - Architecture pattern recognition

### 2. **Blueprint Management System**

- **Comprehensive Blueprint Processing**:
  - Automatic component extraction from diagrams and IAC files
  - Cloud provider detection (AWS, Azure, GCP, Kubernetes)
  - Metadata extraction and enrichment
  - Automatic analysis generation

- **Blueprint Features**:
  - Upload and manage architecture blueprints
  - Version control and history
  - Rating and download tracking
  - Public/private visibility controls
  - Category and tag management

### 3. **Vector Embeddings & Similarity Search**

- **Embedding Generation**:
  - Blueprint content embeddings
  - Analysis result embeddings
  - Architecture embeddings
  - Component-centric embeddings

- **Similarity Matching**:
  - Find similar blueprints during architecture analysis
  - Component-based similarity scoring
  - Top-K nearest neighbor search
  - Cosine similarity with configurable thresholds

### 4. **AI-Powered Natural Language Search**

- **Blueprint-Specific Queries**:
  - Ask questions about specific blueprints
  - Get answers based on components, analysis, and metadata
  - Context-aware responses using LLM

- **General Blueprint Search**:
  - Search across all blueprints
  - Find blueprints by description, components, or patterns
  - Get recommendations based on queries

### 5. **Component-Centric Analysis**

- **Deep Component Analysis**:
  - Component identification and classification
  - Dependency mapping
  - Criticality assessment
  - Scalability analysis
  - Security level evaluation
  - Cost impact analysis

- **Component Relationships**:
  - Relationship type identification
  - Data flow analysis
  - Protocol detection
  - Strength scoring

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Dashboard, Analyses, Library, Configuration             │
│  - Blueprint Manager, Analysis Results                      │
│  - AI Search Interface                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  API Layer (Next.js API Routes)              │
│  - /api/analyze          - Architecture analysis             │
│  - /api/blueprints       - Blueprint CRUD                   │
│  - /api/blueprints/[id]/query - Blueprint AI search         │
│  - /api/blueprints/similarity - Similarity search           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼────────┐
│   MongoDB    │ │  Qdrant  │ │  LLM Service │
│  (Metadata)  │ │ (Vectors) │ │  (Analysis)  │
└──────────────┘ └───────────┘ └──────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB (metadata, analysis results)
- **Vector Database**: Qdrant (embeddings, similarity search)
- **LLM**: Configurable (OpenAI, Anthropic, Local, Enterprise, Apigee)
- **Embeddings**: Local model (nomic-embed-text) or configurable provider
- **Image Processing**: Sharp (optimization, compression)

---

## 🔧 Core Functionalities

### 1. Architecture Analysis Flow

```
User Uploads Architecture
    ↓
File Preprocessing (Image optimization / IAC parsing)
    ↓
Stage 1: Component Extraction (LLM)
    - Extract components, connections, metadata
    - Detect cloud providers
    - Identify architecture patterns
    ↓
Stage 2: Comprehensive Analysis (LLM)
    - Security assessment
    - Risk identification
    - Compliance gap analysis
    - Cost optimization
    - Generate recommendations
    ↓
Generate Architecture Embedding
    ↓
Find Similar Blueprints (Qdrant)
    ↓
Store in MongoDB
    ↓
Return Analysis Results
```

### 2. Blueprint Upload Flow

```
User Uploads Blueprint
    ↓
File Preprocessing (Image optimization / IAC parsing)
    ↓
Component Extraction (LLM)
    - Extract components and connections
    - Detect cloud providers
    - Extract metadata
    ↓
Store Blueprint Metadata (MongoDB)
    ↓
Generate Blueprint Embedding → Store in Qdrant
    ↓
Perform Blueprint Analysis (LLM)
    - Component analysis
    - Architecture pattern identification
    - Technology stack analysis
    - Generate recommendations
    ↓
Generate Analysis Embedding → Store in Qdrant
    ↓
Store Analysis Results (MongoDB)
    ↓
Return Complete Blueprint with Analysis
```

### 3. Similarity Search Flow

```
User Analyzes Architecture
    ↓
Generate Analysis Embedding
    ↓
Search Qdrant:
    - Search blueprint embeddings
    - Search analysis embeddings
    ↓
Combine and Deduplicate Results
    ↓
Sort by Similarity Score
    ↓
Return Top-K Similar Blueprints
    ↓
Generate Blueprint Insights
    ↓
Display in Analysis Results
```

### 4. AI Search Flow

```
User Enters Query
    ↓
Generate Query Embedding
    ↓
Search Qdrant for Similar Blueprints
    ↓
Fetch Full Blueprint & Analysis Data (MongoDB)
    ↓
Build Context String
    ↓
Process Query with LLM (with context)
    ↓
Return Intelligent Answer
```

---

## 📚 Blueprint Management

### Blueprint Upload Process

1. **File Upload**:
   - Supports images (PNG, JPG, SVG) and IAC files (Terraform, CloudFormation, etc.)
   - Automatic image optimization (compression, resizing)
   - File validation and type detection

2. **Component Extraction**:
   - LLM-powered extraction of components and connections
   - Automatic cloud provider detection
   - Metadata extraction (architecture type, complexity, deployment model)

3. **Embedding Generation**:
   - Generate embedding from blueprint content
   - Store in Qdrant with metadata
   - Link to MongoDB document

4. **Automatic Analysis**:
   - Component-centric analysis
   - Architecture pattern identification
   - Technology stack analysis
   - Generate recommendations and insights

5. **Storage**:
   - Metadata stored in MongoDB
   - Embeddings stored in Qdrant
   - Analysis results stored in MongoDB

### Blueprint Viewer Features

- **Details Tab**:
  - Basic information (name, type, category, complexity)
  - File information
  - Description
  - Tags and cloud providers
  - Enhanced metadata
  - Extracted components list
  - Extracted connections list
  - Rating and author information

- **Analysis Tab**:
  - Analysis scores with visual progress bars
  - Architecture patterns and technology stack
  - Component complexity metrics
  - Analyzed components with details
  - Recommendations with priorities
  - Key insights

- **AI Search Tab**:
  - Natural language query interface
  - LLM-powered answers
  - Example questions
  - Context-aware responses

- **Preview Tab**:
  - File preview (images and IAC)

- **Versions Tab**:
  - Version history

---

## 🔍 Architecture Analysis

### Analysis Stages

#### Stage 1: Component Extraction

**Purpose**: Extract all architectural components, connections, and metadata from the uploaded file.

**Process**:
1. File preprocessing (image optimization or text parsing)
2. LLM analysis with enhanced cloud provider detection
3. Component extraction (compute, storage, database, network, etc.)
4. Connection extraction (API calls, data flows, dependencies)
5. Metadata extraction (architecture type, cloud providers, complexity)

**Output**:
- Components array with details
- Connections array with relationships
- Metadata object with architecture information

#### Stage 2: Comprehensive Analysis

**Purpose**: Provide detailed security, risk, and compliance assessment.

**Process**:
1. Evaluate against active checklist items
2. Identify risks and compliance gaps
3. Analyze cost optimization opportunities
4. Generate specific recommendations
5. Calculate scores for each dimension

**Output**:
- Risks array
- Compliance gaps array
- Cost issues array
- Recommendations array
- Scores (security, resiliency, cost, compliance)

### Analysis Features

- **Cloud Provider-Specific Analysis**:
  - AWS-specific considerations (IAM, VPC, S3, CloudTrail, etc.)
  - Azure-specific considerations (RBAC, NSG, Key Vault, etc.)
  - GCP-specific considerations (IAM, VPC, Cloud Storage, etc.)
  - Kubernetes-specific considerations (RBAC, Network Policies, etc.)

- **Hybrid & Multi-Cloud Support**:
  - Cross-cloud security analysis
  - Data sovereignty considerations
  - Network connectivity analysis

- **Checklist Integration**:
  - Evaluate against configurable checklist items
  - Map recommendations to checklist categories
  - Priority-based scoring

---

## 🤖 AI-Powered Search

### Blueprint-Specific Search

**Endpoint**: `POST /api/blueprints/[id]/query`

**Features**:
- Natural language queries about specific blueprints
- Context includes:
  - Blueprint metadata
  - Extracted components and connections
  - Analysis results (scores, recommendations, insights)
  - Component relationships
  - Technology stack

**Example Queries**:
- "What are the security recommendations for this blueprint?"
- "Which components are critical and why?"
- "What architecture patterns are used?"
- "What is the scalability score and what are the bottlenecks?"
- "What technologies are used in this blueprint?"

### General Blueprint Search

**Endpoint**: `POST /api/blueprints/query`

**Features**:
- Search across all blueprints
- Vector similarity search
- LLM-powered answer generation
- Returns relevant blueprints with context

---

## 🗄️ Vector Database & Embeddings

### Qdrant Configuration

- **Collection**: `blueprints`
- **Vector Dimensions**: 1024 (configurable)
- **Similarity Metric**: Cosine Similarity
- **Storage**: Embedded Qdrant (in-process) or remote Qdrant server

### Embedding Types

1. **Blueprint Embeddings**:
   - Generated from blueprint content
   - Includes: name, description, components, connections, metadata
   - Type: `blueprint`
   - Used for: Finding similar blueprints

2. **Blueprint Analysis Embeddings**:
   - Generated from analysis results
   - Includes: components, patterns, technology stack, scores, insights
   - Type: `blueprint_analysis`
   - Used for: Finding similar analyzed blueprints

3. **Architecture Embeddings** (Future):
   - Generated from architecture content
   - Type: `architecture`
   - Used for: Finding similar architectures

4. **Architecture Analysis Embeddings** (Future):
   - Generated from architecture analysis results
   - Type: `architecture_analysis`
   - Used for: Finding similar analyzed architectures

### Embedding Generation

**Model**: `text-embedding-qwen3-embedding-0.6b` (local) or configurable

**Process**:
1. Extract content from blueprint/analysis
2. Generate embedding using embeddings service
3. Store in Qdrant with metadata payload
4. Link to MongoDB document

### Similarity Search

**Process**:
1. Generate query embedding
2. Search Qdrant with similarity threshold (default: 0.7)
3. Filter by type (blueprint or analysis)
4. Combine and deduplicate results
5. Sort by similarity score
6. Return top-K matches

---

## 📡 API Reference

### Architecture Analysis

#### `POST /api/analyze`

Analyze an uploaded architecture file.

**Request**:
- `file`: File (image or IAC)
- `appId`: string
- `componentName`: string
- `description`: string
- `environment`: string
- `version`: string

**Response**:
```json
{
  "id": "analysis-123",
  "components": [...],
  "connections": [...],
  "risks": [...],
  "complianceGaps": [...],
  "costIssues": [...],
  "recommendations": [...],
  "securityScore": 85,
  "resiliencyScore": 78,
  "costEfficiencyScore": 82,
  "complianceScore": 90,
  "similarBlueprints": [...],
  "blueprintInsights": [...]
}
```

### Blueprint Management

#### `GET /api/blueprints`

Get all blueprints with filtering and pagination.

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string
- `type`: BlueprintType
- `category`: BlueprintCategory
- `cloudProvider`: string
- `complexity`: BlueprintComplexity

#### `POST /api/blueprints`

Upload a new blueprint.

**Request** (FormData):
- `file`: File
- `name`: string
- `description`: string
- `type`: BlueprintType
- `category`: BlueprintCategory
- `tags`: string (JSON array)
- `isPublic`: boolean
- `complexity`: BlueprintComplexity
- `cloudProviders`: string (JSON array)
- `estimatedCost`: number (optional)
- `deploymentTime`: string (optional)

**Response**:
```json
{
  "id": "blueprint-123",
  "name": "E-commerce Architecture",
  "hasEmbedding": true,
  "hasAnalysis": true,
  "extractedData": {
    "components": [...],
    "connections": [...],
    "metadata": {...}
  },
  "processingTime": 45.2
}
```

#### `GET /api/blueprints/[id]`

Get a specific blueprint.

#### `PUT /api/blueprints/[id]`

Update a blueprint.

#### `DELETE /api/blueprints/[id]`

Delete a blueprint (also removes embeddings from Qdrant).

#### `GET /api/blueprints/[id]/analyze`

Get analysis for a blueprint.

#### `POST /api/blueprints/[id]/analyze`

Trigger analysis for a blueprint.

### AI Search

#### `POST /api/blueprints/[id]/query`

Query a specific blueprint using natural language.

**Request**:
```json
{
  "query": "What are the security recommendations?"
}
```

**Response**:
```json
{
  "success": true,
  "query": "What are the security recommendations?",
  "answer": "Based on the blueprint analysis...",
  "blueprintId": "blueprint-123",
  "blueprintName": "E-commerce Architecture",
  "hasAnalysis": true
}
```

#### `POST /api/blueprints/query`

Search across all blueprints.

**Request**:
```json
{
  "query": "Show me microservices architectures on AWS",
  "limit": 5,
  "threshold": 0.7
}
```

**Response**:
```json
{
  "success": true,
  "query": "...",
  "answer": "...",
  "relevantBlueprints": [...],
  "totalResults": 5
}
```

### Similarity Search

#### `POST /api/blueprints/similarity-search`

Search for similar blueprints based on components.

**Request**:
```json
{
  "components": [...],
  "connections": [...],
  "limit": 2,
  "threshold": 0.7
}
```

---

## ⚙️ Configuration

### Environment Variables

#### LLM Configuration

```bash
# LLM Provider (openai, anthropic, gemini, ollama, local, enterprise, apigee)
LLM_PROVIDER=local

# Local LLM (Ollama)
LOCAL_LLM_URL=http://localhost:1234
LOCAL_LLM_MODEL=gemma3:27b
LOCAL_LLM_TEMPERATURE=0.1
LOCAL_LLM_MAX_TOKENS=4000

# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4-vision-preview

# Anthropic
ANTHROPIC_API_KEY=your_key
ANTHROPIC_MODEL=claude-3-opus-20240229

# Enterprise LLM
ENTERPRISE_LLM_URL=https://your-enterprise-llm.com
ENTERPRISE_LLM_API_KEY=your_key

# Apigee
APIGEE_BASE_URL=https://your-apigee-instance.com
APIGEE_API_KEY=your_key
```

#### Embeddings Configuration

```bash
# Embeddings Provider (local, openai, cohere, huggingface)
EMBEDDINGS_PROVIDER=local

# Local Embeddings (Ollama)
EMBEDDINGS_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDINGS_BASE_URL=http://localhost:1234
EMBEDDINGS_DIMENSIONS=1024

# OpenAI Embeddings
EMBEDDINGS_API_KEY=your_key
EMBEDDINGS_MODEL=text-embedding-3-large
```

#### Qdrant Configuration

```bash
# Qdrant Connection
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key (optional)
QDRANT_COLLECTION_NAME=blueprints

# Vector Configuration
QDRANT_VECTOR_SIZE=1024
QDRANT_DISTANCE=Cosine

# Auto-fix dimension mismatches
QDRANT_AUTO_FIX_DIMENSIONS=true
```

#### MongoDB Configuration

```bash
MONGODB_URI=mongodb://localhost:27017/CloudArc
```

#### Similarity Search Configuration

```bash
SIMILARITY_THRESHOLD=0.7
SIMILARITY_LIMIT=2
```

---

## 📊 Data Models

### Blueprint Model

```typescript
{
  id: string;
  name: string;
  description: string;
  type: "architecture" | "iac" | "template";
  category: BlueprintCategory;
  tags: string[];
  fileName: string;
  fileSize: number;
  fileType: string;
  cloudProviders: string[];
  complexity: "low" | "medium" | "high";
  metadata: {
    components: number;
    connections: number;
    estimatedCost?: number;
    deploymentTime?: string;
    architectureType?: string;
    hybridCloudModel?: string;
    primaryCloudProvider?: string;
    extractedComponents?: any[];
    extractedConnections?: any[];
  };
  embeddingId?: string;
  hasEmbedding: boolean;
  hasAnalysis: boolean;
  lastAnalysisId?: string;
  analysisScores?: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
    scalability: number;
    maintainability: number;
  };
}
```

### Blueprint Analysis Model

```typescript
{
  blueprintId: string;
  analysisId: string;
  components: Array<{
    name: string;
    type: string; // 36 valid types
    technology: string;
    criticality: "high" | "medium" | "low";
    dependencies: string[];
    scalability: "horizontal" | "vertical" | "both";
    securityLevel: "high" | "medium" | "low";
    costImpact: "high" | "medium" | "low";
    performanceCharacteristics: {
      latency: "low" | "medium" | "high";
      throughput: "low" | "medium" | "high";
      availability: number;
    };
  }>;
  componentRelationships: Array<{
    source: string;
    target: string;
    relationship: string;
    strength: number;
    dataFlow?: string;
    protocol?: string;
  }>;
  architecturePatterns: string[];
  technologyStack: string[];
  componentComplexity: {
    totalComponents: number;
    criticalComponents: number;
    highCouplingComponents: number;
    scalabilityBottlenecks: string[];
    integrationPoints: number;
  };
  scores: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
    scalability: number;
    maintainability: number;
  };
  recommendations: Array<{
    component: string;
    issue: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
    impact: "high" | "medium" | "low";
    effort: "high" | "medium" | "low";
    confidence: number;
  }>;
  insights: string[];
  bestPractices: string[];
  industryStandards: string[];
}
```

### Architecture Analysis Model

```typescript
{
  id: string;
  appId: string;
  componentName: string;
  description: string;
  environment: string;
  version: string;
  components: Array<Component>;
  connections: Array<Connection>;
  risks: Array<Risk>;
  complianceGaps: Array<ComplianceGap>;
  costIssues: Array<CostIssue>;
  recommendations: Array<Recommendation>;
  securityScore: number;
  resiliencyScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
  similarBlueprints: Array<SimilarBlueprint>;
  blueprintInsights: Array<BlueprintInsight>;
}
```

---

## 🚀 Deployment

### Prerequisites

1. **Node.js** 18+ and npm
2. **MongoDB** (local or remote)
3. **Qdrant** (embedded or remote server)
4. **Ollama** (for local LLM and embeddings) - optional
5. **LLM Provider** (OpenAI, Anthropic, or local)

### Setup Steps

1. **Clone and Install**:
   ```bash
   cd archlens-app
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Services**:
   ```bash
   # Start MongoDB (if local)
   mongod

   # Start Qdrant (if using remote)
   docker run -d -p 6333:6333 qdrant/qdrant

   # Start Ollama (if using local LLM/embeddings)
   ollama serve
   ```

4. **Start Application**:
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Start**:
   ```bash
   npm start
   ```

3. **Environment Variables**:
   - Set all required environment variables
   - Configure LLM provider
   - Configure embeddings provider
   - Set MongoDB connection string
   - Configure Qdrant connection

---

## 🔑 Key Functionalities Summary

### For Users

1. **Upload Architecture**: Upload diagrams or IAC files for analysis
2. **View Analysis**: See comprehensive security, cost, and compliance analysis
3. **Upload Blueprints**: Create a library of architecture blueprints
4. **Search Blueprints**: Find similar architectures using AI search
5. **Query Blueprints**: Ask questions about specific blueprints
6. **Compare Architectures**: See similar blueprints during analysis

### For Administrators

1. **Manage Checklists**: Configure evaluation criteria
2. **Manage Blueprints**: Organize and maintain blueprint library
3. **Configure LLM**: Set up LLM providers and models
4. **Monitor Performance**: Track analysis processing times
5. **Manage Users**: User and role management (future)

### Technical Features

1. **Component Extraction**: Automatic extraction from diagrams and code
2. **Cloud Provider Detection**: Multi-cloud and hybrid cloud support
3. **Vector Embeddings**: Semantic search using embeddings
4. **Similarity Matching**: Find similar architectures and blueprints
5. **LLM Integration**: Multiple LLM provider support
6. **Image Optimization**: Automatic compression and optimization
7. **Real-time Analysis**: Fast analysis with progress tracking

---

## 📈 Performance & Scalability

- **Embedding Dimensions**: 1024 (configurable)
- **Similarity Threshold**: 0.7 (configurable)
- **Top-K Results**: 2-5 (configurable)
- **Processing Time**: Typically 30-60 seconds per analysis
- **Concurrent Requests**: Supports multiple simultaneous analyses
- **Vector Search**: Sub-second similarity search performance

---

## 🔒 Security & Compliance

- **Data Storage**: All data stored securely in MongoDB
- **Vector Storage**: Embeddings stored in Qdrant with metadata
- **API Security**: Next.js API route protection
- **File Validation**: Strict file type and size validation
- **Error Handling**: Comprehensive error handling and logging

---

## 🎓 Best Practices

1. **Blueprint Upload**:
   - Use clear, high-quality diagrams
   - Include descriptive names and descriptions
   - Tag blueprints appropriately
   - Set correct complexity levels

2. **Analysis**:
   - Provide detailed descriptions
   - Specify correct environment
   - Include version information

3. **Search**:
   - Use specific, clear queries
   - Reference components by name when possible
   - Ask follow-up questions for clarification

---

## 📝 Notes

- All embeddings are generated automatically during upload/analysis
- Analysis results are cached in MongoDB for quick access
- Similarity search uses both blueprint and analysis embeddings
- Component types are validated against a comprehensive enum
- The system supports both embedded and remote Qdrant instances

---

## 🔄 Future Enhancements

- Architecture embedding generation and storage
- Architecture-to-blueprint tagging
- Advanced analytics and reporting
- Collaborative features
- Export capabilities
- Integration with CI/CD pipelines
- Real-time collaboration
- Advanced visualization

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-28  
**Maintained by**: ArchLens Team

