# ArchLens - Enterprise Cloud Architecture Analysis Platform

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Core Functionalities](#core-functionalities)
5. [Blueprint Management](#blueprint-management)
6. [Architecture Analysis](#architecture-analysis)
7. [Checklist Management](#checklist-management)
8. [AI-Powered Search](#ai-powered-search)
9. [Vector Database & Embeddings](#vector-database--embeddings)
10. [Automatic Blueprint Assignment](#automatic-blueprint-assignment)
11. [API Reference](#api-reference)
12. [Configuration](#configuration)
13. [Data Models](#data-models)
14. [Deployment](#deployment)
15. [Architecture Diagrams](#architecture-diagrams)

---

## 🎯 Overview

ArchLens is an enterprise-grade cloud architecture analysis platform that leverages AI and machine learning to analyze, compare, and optimize cloud architectures. The platform provides intelligent insights, recommendations, and similarity matching using vector embeddings and large language models (LLMs).

### Core Capabilities

- **Intelligent Architecture Analysis**: Automated analysis of cloud architectures with security, resiliency, cost, and compliance scoring
- **Blueprint Library**: Centralized repository for architecture blueprints with component extraction and analysis
- **Automatic Blueprint Matching**: Automatically finds and assigns the top 3 most similar blueprints to each analysis
- **Similarity Matching**: Find similar architectures and blueprints using vector embeddings
- **AI-Powered Search**: Natural language queries for blueprints and architectures
- **Component-Centric Analysis**: Deep analysis of individual components and their relationships
- **Multi-Cloud Support**: AWS, Azure, GCP, Kubernetes, and hybrid cloud architectures
- **On-Premises Detection**: Intelligent detection of on-premises and private cloud deployments

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

- **Automatic Blueprint Assignment**:
  - Automatically finds the top 3 most similar blueprints
  - Displays blueprint images and details in analysis results
  - Provides insights based on similar blueprints

### 2. **Blueprint Management System**

- **Comprehensive Blueprint Processing**:
  - Automatic component extraction from diagrams and IAC files
  - Cloud provider detection (AWS, Azure, GCP, Kubernetes, On-Premises)
  - Metadata extraction and enrichment
  - Automatic analysis generation
  - Image storage and display

- **Blueprint Features**:
  - Upload and manage architecture blueprints
  - Version control and history
  - Rating and download tracking
  - Category and tag management
  - Image preview and download
  - Full blueprint viewer with multiple tabs

### 3. **Vector Embeddings & Similarity Search**

- **Embedding Generation**:
  - Blueprint content embeddings
  - Analysis result embeddings
  - Architecture embeddings
  - Component-centric embeddings

- **Similarity Matching**:
  - Find similar blueprints during architecture analysis
  - Component-based similarity scoring
  - Top-K nearest neighbor search (default: top 3)
  - Cosine similarity with configurable thresholds (default: 0.7)
  - Automatic deduplication

- **Vector Store Support**:
  - Qdrant (server-based or embedded)
  - FAISS (in-memory, for development)
  - Automatic selection based on configuration

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
  - Component identification and classification (36 types)
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

### 6. **Cloud Provider Detection**

- **Intelligent Detection**:
  - Explicit cloud provider detection from labels and text
  - Provider-specific naming convention recognition
  - Resource type and configuration pattern analysis
  - **Default to On-Premises**: Components without explicit cloud specification are treated as on-premises/private cloud
  - Visual icon analysis (low confidence, used sparingly)

- **Supported Providers**:
  - AWS (Amazon Web Services)
  - Azure (Microsoft Azure)
  - GCP (Google Cloud Platform)
  - Kubernetes
  - On-Premises/Private Cloud (default for unspecified deployments)

### 7. **Checklist Management System**

- **Configurable Evaluation Criteria**:
  - Create, edit, and manage custom checklist items
  - Organize by categories (Security, Reliability, Performance, Cost, Compliance)
  - Assign priority levels (High, Medium, Low)
  - Enable/disable items without deletion

- **Default Checklist**:
  - Pre-populated with 100+ cloud security and best practice items
  - Covers major compliance frameworks (SOC 2, ISO 27001, PCI-DSS, HIPAA, GDPR)
  - CIS benchmarks included
  - Customizable for organization-specific needs

- **Analysis Integration**:
  - Automatically evaluates architectures against enabled checklist items
  - Identifies compliance gaps and violations
  - Generates recommendations based on checklist items
  - Affects compliance scoring

- **Management Features**:
  - Full CRUD operations for checklist items
  - Search and filter capabilities
  - Statistics and reporting
  - Bulk operations support

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
│  - /api/blueprints/[id]/file - Blueprint image serving     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼────────┐
│   MongoDB    │ │  Vector  │ │  LLM Service │
│  (Metadata)  │ │  Store   │ │  (Analysis)  │
│              │ │(Qdrant/  │ │              │
│              │ │ FAISS)   │ │              │
└──────────────┘ └───────────┘ └──────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB (metadata, analysis results, blueprint images)
- **Vector Database**: Qdrant (embeddings, similarity search) or FAISS (in-memory)
- **LLM**: Configurable (OpenAI, Anthropic, Gemini, Local, Enterprise, Apigee, Ollama)
- **Embeddings**: Local model (nomic-embed-text) or configurable provider
- **Image Processing**: Sharp (optimization, compression)

### Architecture Diagram

See `architecture-block-diagram.mmd` for a detailed Mermaid block diagram of the system architecture.

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
    - Detect cloud providers (with on-premises default)
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
Find Similar Blueprints (Vector Store)
    - Search blueprint embeddings
    - Deduplicate results
    - Select top 3 matches
    ↓
Store in MongoDB (with similarBlueprints)
    ↓
Return Analysis Results (with blueprint images)
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
    - Store original image file (base64)
    ↓
Generate Blueprint Embedding → Store in Vector Store
    ↓
Perform Blueprint Analysis (LLM)
    - Component analysis
    - Architecture pattern identification
    - Technology stack analysis
    - Generate recommendations
    ↓
Generate Analysis Embedding → Store in Vector Store
    ↓
Store Analysis Results (MongoDB)
    ↓
Return Complete Blueprint with Analysis
```

### 3. Automatic Blueprint Assignment Flow

```
Architecture Analysis Generated
    ↓
Generate Analysis Embedding
    ↓
Search Vector Store:
    - Search blueprint embeddings only
    - Use similarity threshold (0.7)
    - Search for top 5 candidates
    ↓
Deduplicate Results
    - Remove duplicate blueprints
    - Keep highest similarity score
    ↓
Sort by Similarity Score
    ↓
Select Top 3 Blueprints
    ↓
Format Blueprint Data
    - Include blueprint metadata
    - Include similarity scores
    ↓
Store in Analysis Document
    ↓
Display in Analysis Results
    - Show blueprint images
    - Show similarity scores
    - Provide insights
```

### 4. AI Search Flow

```
User Enters Query
    ↓
Generate Query Embedding
    ↓
Search Vector Store for Similar Blueprints
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
   - Original image stored in MongoDB (base64) for viewing

2. **Component Extraction**:
   - LLM-powered extraction of components and connections
   - Automatic cloud provider detection (with on-premises default)
   - Metadata extraction (architecture type, complexity, deployment model)

3. **Embedding Generation**:
   - Generate embedding from blueprint content
   - Store in Vector Store (Qdrant or FAISS) with metadata
   - Link to MongoDB document

4. **Automatic Analysis**:
   - Component-centric analysis
   - Architecture pattern identification
   - Technology stack analysis
   - Generate recommendations and insights

5. **Storage**:
   - Metadata stored in MongoDB
   - Original image stored in MongoDB (base64)
   - Embeddings stored in Vector Store
   - Analysis results stored in MongoDB

### Blueprint Viewer Features

- **Overview Tab**:
  - Basic information (name, type, category, complexity)
  - File information
  - Description
  - Tags and cloud providers
  - Enhanced metadata
  - **Blueprint Image Display**: View and download blueprint images
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

**Cloud Provider Detection Rules**:
1. **First**: Examine component labels and text for explicit cloud provider/service names
2. **Second**: Check for provider-specific naming conventions
3. **Third**: Look for resource types or configuration patterns
4. **Fourth**: If deployment location is not explicitly specified within a cloud block or boundary, consider it on-premises/private cloud
5. **Last Resort**: Only if no text/label exists, consider visual icons (with low confidence)
6. **Default**: If no clear cloud provider is found, mark as "on-premises"

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
- Similar blueprints (top 3)

### Analysis Features

- **Cloud Provider-Specific Analysis**:
  - AWS-specific considerations (IAM, VPC, S3, CloudTrail, etc.)
  - Azure-specific considerations (RBAC, NSG, Key Vault, etc.)
  - GCP-specific considerations (IAM, VPC, Cloud Storage, etc.)
  - Kubernetes-specific considerations (RBAC, Network Policies, etc.)
  - On-Premises considerations (private cloud, data center, etc.)

- **Hybrid & Multi-Cloud Support**:
  - Cross-cloud security analysis
  - Data sovereignty considerations
  - Network connectivity analysis

- **Checklist Integration**:
  - Evaluate against configurable checklist items
  - Map recommendations to checklist categories
  - Priority-based scoring

---

## ✅ Checklist Management

### Overview

ArchLens includes a comprehensive checklist system that allows organizations to define custom evaluation criteria for architecture analysis. The checklist is used during Stage 2 analysis to identify compliance gaps, security issues, and best practice violations.

### Checklist Features

- **Configurable Items**: Create, edit, and manage checklist items
- **Categories**: Organize items by category (Security, Reliability, Performance, Cost, Compliance)
- **Priority Levels**: Assign priority (High, Medium, Low) to each item
- **Enable/Disable**: Toggle items on/off without deleting them
- **Default Checklist**: Pre-populated with comprehensive cloud security and best practice items
- **Statistics**: Track checklist usage and coverage

### Checklist Categories

1. **Security**:
   - Authentication and authorization
   - Encryption (at rest and in transit)
   - Network security
   - Access controls
   - Security monitoring

2. **Reliability**:
   - High availability
   - Disaster recovery
   - Backup and restore
   - Fault tolerance
   - Redundancy

3. **Performance**:
   - Scalability
   - Load balancing
   - Caching strategies
   - Resource optimization
   - Latency optimization

4. **Cost**:
   - Resource optimization
   - Cost monitoring
   - Reserved instances
   - Auto-scaling
   - Cost allocation

5. **Compliance**:
   - SOC 2 compliance
   - ISO 27001 compliance
   - PCI-DSS compliance
   - HIPAA compliance
   - GDPR compliance
   - CIS benchmarks

### Checklist Item Structure

Each checklist item includes:
- **Category**: One of the five categories above
- **Item**: Short description of the check
- **Description**: Detailed explanation
- **Recommended Action**: What should be done to address the item
- **Owner**: Responsible team or person
- **Priority**: High, Medium, or Low
- **Enabled**: Whether the item is active in evaluations

### How Checklist is Used in Analysis

During Stage 2 analysis:
1. **Evaluation**: The LLM evaluates the architecture against all enabled checklist items
2. **Gap Identification**: Identifies which checklist items are not met
3. **Compliance Gaps**: Creates compliance gap entries for unmet items
4. **Recommendations**: Generates recommendations based on checklist items
5. **Scoring**: Checklist compliance affects the overall compliance score

### Checklist Management UI

The Checklist Manager component provides:
- **View All Items**: List all checklist items with filtering
- **Search**: Search items by keyword
- **Filter by Category**: Filter by Security, Reliability, Performance, Cost, or Compliance
- **Filter by Priority**: Filter by High, Medium, or Low priority
- **Filter by Status**: Show enabled, disabled, or all items
- **Create New Item**: Add custom checklist items
- **Edit Item**: Modify existing items
- **Delete Item**: Remove items from the checklist
- **Toggle Enable/Disable**: Activate or deactivate items
- **Statistics**: View checklist statistics and coverage

### Checklist API

#### `GET /api/checklist`

Get all checklist items.

**Query Parameters**:
- `action=stats`: Get checklist statistics
- `action=init`: Initialize default checklist

**Response**:
```json
[
  {
    "id": "item-123",
    "category": "security",
    "item": "Encryption at Rest",
    "description": "All data should be encrypted at rest",
    "recommendedAction": "Enable encryption for all storage services",
    "owner": "Security Team",
    "priority": "High",
    "enabled": true,
    "createdAt": "2025-01-28T00:00:00Z",
    "updatedAt": "2025-01-28T00:00:00Z"
  }
]
```

#### `POST /api/checklist`

Create a new checklist item.

**Request**:
```json
{
  "category": "security",
  "item": "Multi-Factor Authentication",
  "description": "All user accounts should have MFA enabled",
  "recommendedAction": "Enable MFA for all user accounts",
  "owner": "Security Team",
  "priority": "High",
  "enabled": true
}
```

#### `PATCH /api/checklist/[id]`

Update a checklist item.

**Request**:
```json
{
  "item": "Updated item name",
  "description": "Updated description",
  "enabled": false
}
```

#### `DELETE /api/checklist/[id]`

Delete a checklist item.

#### `GET /api/checklist?action=stats`

Get checklist statistics.

**Response**:
```json
{
  "totalItems": 150,
  "enabledItems": 142,
  "disabledItems": 8,
  "categoryStats": [
    {
      "_id": "security",
      "count": 45,
      "enabled": 42
    }
  ],
  "priorityStats": [
    {
      "_id": "High",
      "count": 50,
      "enabled": 48
    }
  ]
}
```

### Default Checklist

The system includes a default checklist with 100+ items covering:
- Cloud security best practices
- Compliance requirements (SOC 2, ISO 27001, PCI-DSS, HIPAA, GDPR)
- CIS benchmarks
- Performance optimization
- Cost optimization
- Reliability patterns

Initialize the default checklist using:
```
GET /api/checklist?action=init
```

### Best Practices

1. **Customize for Your Organization**: Add organization-specific checklist items
2. **Regular Updates**: Keep checklist items up to date with latest best practices
3. **Priority Management**: Set appropriate priorities based on business impact
4. **Category Organization**: Use categories to organize and filter items effectively
5. **Enable/Disable**: Disable items that don't apply to your environment
6. **Owner Assignment**: Assign owners to ensure accountability

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

### Vector Store Configuration

- **Supported Stores**:
  - **Qdrant**: Server-based or embedded (default)
  - **FAISS**: In-memory (for development/testing)
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

3. **Architecture Analysis Embeddings**:
   - Generated from architecture analysis results
   - Type: `architecture_analysis`
   - Used for: Finding similar analyzed architectures

### Embedding Generation

**Model**: `text-embedding-qwen3-embedding-0.6b` (local) or configurable

**Process**:
1. Extract content from blueprint/analysis
2. Generate embedding using embeddings service
3. Store in Vector Store with metadata payload
4. Link to MongoDB document

### Similarity Search

**Process**:
1. Generate query embedding
2. Search Vector Store with similarity threshold (default: 0.7)
3. Filter by type (blueprint or analysis)
4. Deduplicate results (remove duplicate blueprints)
5. Sort by similarity score
6. Return top-K matches (default: top 3 for analysis assignment)

---

## 🎯 Automatic Blueprint Assignment

### Overview

When an architecture analysis is generated, ArchLens automatically finds and assigns the top 3 most similar blueprints from the blueprint library. This helps users discover relevant reference architectures and learn from similar implementations.

### How It Works

1. **Embedding Generation**: After analysis is complete, an embedding is generated from the analysis content
2. **Vector Search**: The system searches the Vector Store for similar blueprint embeddings
3. **Deduplication**: Duplicate blueprints are removed, keeping the one with the highest similarity score
4. **Top-K Selection**: The top 3 blueprints with the highest similarity scores (above threshold) are selected
5. **Storage**: The selected blueprints are stored in the analysis document under `similarBlueprints`
6. **Display**: Blueprints are displayed in the analysis results with:
   - Blueprint images
   - Similarity scores
   - Blueprint metadata
   - Insights and recommendations

### Configuration

- **Similarity Threshold**: 0.7 (configurable via `SIMILARITY_THRESHOLD`)
- **Number of Blueprints**: Top 3 (hardcoded for analysis assignment)
- **Search Limit**: Searches for top 5 candidates to ensure enough results after deduplication

### Benefits

- **Discover Similar Architectures**: Automatically find relevant reference architectures
- **Learn from Best Practices**: See how similar architectures were implemented
- **Compare Approaches**: Compare your architecture with proven patterns
- **Get Insights**: Receive insights based on similar blueprints

### Display in Analysis Results

The assigned blueprints are displayed in the analysis results page with:
- **Blueprint Images**: Visual representation of similar blueprints
- **Similarity Scores**: Shows how similar each blueprint is (0-1 scale)
- **Blueprint Details**: Name, type, category, cloud provider, complexity
- **Click to View**: Click on a blueprint to view full details

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
  "similarBlueprints": [
    {
      "id": "blueprint-1",
      "name": "E-commerce Architecture",
      "type": "architecture",
      "category": "e-commerce",
      "cloudProvider": "AWS",
      "complexity": "high",
      "tags": ["microservices", "api-gateway"],
      "score": 0.89
    }
  ],
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

#### `GET /api/blueprints/[id]/file`

Get blueprint image file for viewing.

**Response**: Image file with appropriate Content-Type headers

#### `PUT /api/blueprints/[id]`

Update a blueprint.

#### `DELETE /api/blueprints/[id]`

Delete a blueprint (also removes embeddings from Vector Store).

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

#### Vector Store Configuration

```bash
# Vector Store Type (qdrant or faiss)
VECTOR_STORE_TYPE=qdrant

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
  originalFile: {
    data: string; // base64 encoded
    mimeType: string;
  };
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
  similarBlueprints: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    cloudProvider: string;
    complexity: string;
    tags: string[];
    score: number; // similarity score (0-1)
  }>;
  blueprintInsights: Array<BlueprintInsight>;
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

---

## 🚀 Deployment

### Prerequisites

1. **Node.js** 18+ and npm
2. **MongoDB** (local or remote)
3. **Vector Store**:
   - Qdrant (embedded or remote server)
   - Or FAISS (in-memory, for development)
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
   - Configure Vector Store (Qdrant or FAISS)

---

## 📐 Architecture Diagrams

The following Mermaid diagrams are available:

1. **`architecture-block-diagram.mmd`**: Block diagram showing system architecture
2. **`architecture-diagram.mmd`**: Detailed architecture diagram
3. **`architecture-diagram-simple.mmd`**: Simplified high-level diagram
4. **`architecture.mmd`**: Medium-level architecture diagram

These diagrams can be viewed in:
- GitHub/GitLab (Mermaid support)
- Mermaid Live Editor (https://mermaid.live)
- VS Code with Mermaid extensions
- Documentation tools that support Mermaid

---

## 🔑 Key Functionalities Summary

### For Users

1. **Upload Architecture**: Upload diagrams or IAC files for analysis
2. **View Analysis**: See comprehensive security, cost, and compliance analysis
3. **View Similar Blueprints**: Automatically see the top 3 most similar blueprints
4. **Upload Blueprints**: Create a library of architecture blueprints
5. **Search Blueprints**: Find similar architectures using AI search
6. **Query Blueprints**: Ask questions about specific blueprints
7. **Compare Architectures**: See similar blueprints during analysis

### For Administrators

1. **Manage Checklists**: Configure evaluation criteria
2. **Manage Blueprints**: Organize and maintain blueprint library
3. **Configure LLM**: Set up LLM providers and models
4. **Configure Vector Store**: Choose between Qdrant and FAISS
5. **Monitor Performance**: Track analysis processing times
6. **Manage Users**: User and role management (future)

### Technical Features

1. **Component Extraction**: Automatic extraction from diagrams and code
2. **Cloud Provider Detection**: Multi-cloud and hybrid cloud support with on-premises default
3. **Vector Embeddings**: Semantic search using embeddings
4. **Automatic Blueprint Assignment**: Top 3 similar blueprints automatically assigned
5. **Similarity Matching**: Find similar architectures and blueprints
6. **LLM Integration**: Multiple LLM provider support
7. **Image Optimization**: Automatic compression and optimization
8. **Image Storage**: Original images stored for viewing and download
9. **Real-time Analysis**: Fast analysis with progress tracking

---

## 📈 Performance & Scalability

- **Embedding Dimensions**: 1024 (configurable)
- **Similarity Threshold**: 0.7 (configurable)
- **Top-K Results**: Top 3 for analysis assignment (configurable for search)
- **Processing Time**: Typically 30-60 seconds per analysis
- **Concurrent Requests**: Supports multiple simultaneous analyses
- **Vector Search**: Sub-second similarity search performance
- **Image Storage**: Base64 encoding in MongoDB for fast retrieval

---

## 🔒 Security & Compliance

- **Data Storage**: All data stored securely in MongoDB
- **Vector Storage**: Embeddings stored in Vector Store with metadata
- **API Security**: Next.js API route protection
- **File Validation**: Strict file type and size validation
- **Error Handling**: Comprehensive error handling and logging
- **Image Security**: Images stored securely with proper access controls

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
   - Review assigned similar blueprints for insights

3. **Search**:
   - Use specific, clear queries
   - Reference components by name when possible
   - Ask follow-up questions for clarification

---

## 📝 Notes

- All embeddings are generated automatically during upload/analysis
- Analysis results are cached in MongoDB for quick access
- Similarity search uses blueprint embeddings only (for blueprint assignment)
- Component types are validated against a comprehensive enum
- The system supports both embedded and remote Qdrant instances
- FAISS is available for development/testing (in-memory)
- Blueprint images are stored in MongoDB as base64 for fast retrieval
- On-premises/private cloud is the default for unspecified deployment locations

---

## 🔄 Recent Updates

### Latest Features (2025-01-28)

1. **Automatic Blueprint Assignment**:
   - Automatically finds and assigns top 3 similar blueprints to each analysis
   - Displays blueprint images and details in analysis results
   - Provides insights based on similar blueprints

2. **Blueprint Image Display**:
   - Blueprint images displayed in analysis results
   - Blueprint images displayed in blueprint viewer overview
   - Image serving API endpoint for efficient image delivery

3. **Enhanced Cloud Provider Detection**:
   - Default to on-premises/private cloud for unspecified deployments
   - Improved detection rules and confidence levels
   - Better handling of hybrid and multi-cloud architectures

4. **Vector Store Flexibility**:
   - Support for both Qdrant and FAISS
   - Automatic selection based on configuration
   - Better error handling and fallback mechanisms

---

## 🔮 Future Enhancements

- Advanced analytics and reporting
- Collaborative features
- Export capabilities
- Integration with CI/CD pipelines
- Real-time collaboration
- Advanced visualization
- Blueprint version comparison
- Architecture pattern library
- Cost estimation improvements
- Compliance framework updates

---

**Version**: 2.0.0  
**Last Updated**: 2025-01-28  
**Maintained by**: ArchLens Team

