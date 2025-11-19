# ArchLens API Specification

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. Future versions may implement JWT or OAuth2.

## Key Features

### 🎯 Deterministic Scoring
- **Temperature: 0** for all analysis calls
- **100% Consistent**: Same architecture → Same scores
- **Reproducible Results**: No variance between runs

### 💾 Result Caching
- **24-Hour TTL**: Cached results for identical inputs
- **Instant Responses**: Cached analyses return immediately
- **Cost Savings**: Reduces LLM API calls

### 🔍 Vector Search
- **Dual Vector Store**: Qdrant (server) or FAISS (in-memory)
- **Three Embedding Types**: Blueprints, Blueprint Analyses, Architecture Analyses
- **Unified Collection**: Single collection with type-based filtering

### 🤖 AI-Powered Analysis
- **Two-Stage Process**: Component extraction → Detailed analysis
- **Natural Language Queries**: AI search for blueprints and analyses
- **Similarity Matching**: Finds similar architectures automatically

### 📊 Comprehensive Scoring
- **Four Dimensions**: Security, Resiliency, Cost Efficiency, Compliance
- **Checklist-Driven**: Evaluates against active checklist items
- **Cloud Provider-Aware**: Considers AWS/Azure/GCP/Kubernetes best practices

---

## Table of Contents

1. [Architecture Analysis APIs](#architecture-analysis-apis)
2. [Blueprint Management APIs](#blueprint-management-apis)
3. [Blueprint Analysis APIs](#blueprint-analysis-apis)
4. [Blueprint Query & Search APIs](#blueprint-query--search-apis)
5. [Checklist APIs](#checklist-apis)
6. [Dashboard APIs](#dashboard-apis)
7. [System & Configuration APIs](#system--configuration-apis)
8. [Test & Utility APIs](#test--utility-apis)

---

## Architecture Analysis APIs

### POST `/api/analyze`

Analyze an architecture diagram or IAC file and generate comprehensive analysis.

**Features:**
- **Deterministic Scoring**: Uses `temperature: 0` for consistent, reproducible scores
- **Result Caching**: Identical inputs return cached results instantly (24-hour TTL)
- **Two-Stage Analysis**: Component extraction → Detailed analysis with scoring
- **Automatic Embedding**: Architecture analysis embeddings generated and stored in vector store
- **Similarity Matching**: Finds similar blueprints and previous analyses using vector search

**Request:**
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```typescript
  {
    file: File,                    // Architecture diagram (image) or IAC file
    appId: string,                 // Application ID
    componentName: string,         // Component name
    description?: string,          // Optional description
    environment?: string,          // Environment (dev, staging, prod)
    version?: string              // Version number
  }
  ```

**Response:**
```typescript
{
  id: string,
  timestamp: Date,
  fileName: string,
  fileType: 'image' | 'iac' | 'text',
  appId: string,
  componentName: string,
  description: string,
  environment: string,
  version: string,
  components: ArchitectureComponent[],
  connections: Connection[],
  risks: Risk[],
  complianceGaps: ComplianceGap[],
  costIssues: CostIssue[],
  recommendations: Recommendation[],
  resiliencyScore: number,        // 0-100 (deterministic)
  securityScore: number,          // 0-100 (deterministic)
  costEfficiencyScore: number,    // 0-100 (deterministic)
  complianceScore: number,        // 0-100 (deterministic)
  summary: string,
  architectureDescription: string,
  processingTime: number,         // Seconds
  llmProvider: string,
  llmModel: string,
  similarBlueprints: SimilarBlueprint[],
  blueprintInsights: BlueprintInsight[],
  _id: string,                    // MongoDB ID
  cached?: boolean,               // true if result was from cache
  cacheHash?: string              // First 16 chars of cache hash (for debugging)
}
```

**Status Codes:**
- `200`: Analysis completed successfully
- `400`: Invalid request (missing file, etc.)
- `500`: Analysis failed

**Caching Behavior:**
- **Cache Key**: SHA-256 hash of (file content + appId + componentName + environment + version)
- **Cache TTL**: 24 hours
- **Cache Hit**: Returns instantly with `cached: true`
- **Cache Miss**: Runs full analysis, caches result, returns with `cached: false`

**Consistency:**
- **Temperature: 0**: Ensures deterministic LLM responses
- **Same Input**: Always produces identical scores
- **Cached Results**: 100% consistent with original analysis

---

### GET `/api/analysis/[id]`

Get a specific architecture analysis by ID.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Analysis ID (MongoDB ObjectId or custom string ID like `analysis-1763456951096`)

**Response:**
```typescript
{
  _id: string,
  timestamp: Date,
  fileName: string,
  fileType: string,
  appId: string,
  componentName: string,
  description: string,
  environment: string,
  version: string,
  components: ArchitectureComponent[],
  connections: Connection[],
  risks: Risk[],
  complianceGaps: ComplianceGap[],
  costIssues: CostIssue[],
  recommendations: Recommendation[],
  resiliencyScore: number,
  securityScore: number,
  costEfficiencyScore: number,
  complianceScore: number,
  summary: string,
  architectureDescription: string,
  processingTime: number,
  llmProvider: string,
  llmModel: string,
  metadata: ArchitectureMetadata,
  similarBlueprints: SimilarBlueprint[],
  blueprintInsights: BlueprintInsight[]
}
```

**Status Codes:**
- `200`: Analysis found
- `400`: Invalid ID
- `404`: Analysis not found
- `500`: Server error

---

### GET `/api/analysis/[id]/file`

Download the original file used for analysis.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Analysis ID

**Response:**
- **Content-Type**: Based on original file type
- **Body**: File binary data

**Status Codes:**
- `200`: File retrieved
- `404`: Analysis or file not found
- `500`: Server error

---

### POST `/api/analysis/[id]/query`

Query an architecture analysis using natural language.

**Request:**
- **Method**: `POST`
- **Path Parameters**:
  - `id`: Analysis ID (MongoDB ObjectId or custom string ID like `analysis-1763456951096`)
- **Body**:
  ```typescript
  {
    query: string  // Natural language question about the analysis
  }
  ```

**Response:**
```typescript
{
  success: boolean,
  query: string,
  answer: string,              // LLM-generated answer
  analysisId: string,
  componentName: string,
  timestamp: string
}
```

**Status Codes:**
- `200`: Query processed successfully
- `400`: Invalid query
- `404`: Analysis not found
- `500`: Query processing failed

---

### GET `/api/analyses`

Get a list of all architecture analyses with filtering and pagination.

**Request:**
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `appId`: Filter by application ID
  - `environment`: Filter by environment
  - `status`: Filter by status
  - `dateFrom`: Filter from date (ISO string)
  - `dateTo`: Filter to date (ISO string)

**Response:**
```typescript
{
  analyses: Analysis[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

## Blueprint Management APIs

### GET `/api/blueprints`

Get a list of blueprints with filtering, sorting, and pagination.

**Request:**
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `search`: Search term (searches name, description, tags)
  - `type`: Filter by type (`diagram`, `iac`, `hybrid`)
  - `category`: Filter by category
  - `cloudProvider`: Filter by cloud provider
  - `complexity`: Filter by complexity (`low`, `medium`, `high`)
  - `isPublic`: Filter by public status (true/false)
  - `tags`: Comma-separated tags
  - `sortBy`: Sort field (`name`, `createdAt`, `downloadCount`, `rating`)
  - `sortOrder`: Sort order (`asc`, `desc`)

**Response:**
```typescript
{
  blueprints: Blueprint[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### POST `/api/blueprints`

Upload a new blueprint (diagram or IAC file).

**Request:**
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```typescript
  {
    file: File,                    // Blueprint file
    name: string,                  // Blueprint name
    description?: string,         // Optional description
    type: 'diagram' | 'iac',      // Blueprint type
    category: string,             // Category
    tags?: string[],             // Optional tags
    isPublic?: boolean           // Public visibility (default: false)
  }
  ```

**Response:**
```typescript
{
  id: string,
  name: string,
  description: string,
  type: string,
  category: string,
  cloudProviders: string[],
  complexity: string,
  tags: string[],
  fileName: string,
  fileSize: number,
  fileType: string,
  hasEmbedding: boolean,
  hasAnalysis: boolean,
  createdAt: Date,
  updatedAt: Date,
  // ... other blueprint fields
}
```

**Status Codes:**
- `201`: Blueprint created successfully
- `400`: Invalid request
- `500`: Upload failed

**Automatic Processing:**
This endpoint automatically performs:
1. **Component Extraction**: Extracts components and connections from the blueprint
2. **Embedding Generation**: Generates vector embeddings using configured embedding model
3. **Vector Storage**: Stores embeddings in vector store (Qdrant or FAISS based on `VECTOR_STORE_TYPE`)
4. **Blueprint Analysis**: Performs comprehensive analysis with scoring
5. **Analysis Embedding**: Generates and stores analysis embeddings for similarity matching
6. **MongoDB Storage**: Stores blueprint metadata and analysis results in MongoDB

**Vector Store Types:**
- **Qdrant**: Server-based, persistent storage (default)
- **FAISS**: In-memory, no server required (set `VECTOR_STORE_TYPE=faiss`)

---

### GET `/api/blueprints/[id]`

Get a specific blueprint by ID.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Blueprint ID

**Response:**
```typescript
{
  id: string,
  name: string,
  description: string,
  type: string,
  category: string,
  cloudProviders: string[],
  complexity: string,
  tags: string[],
  fileName: string,
  fileSize: number,
  fileType: string,
  hasEmbedding: boolean,
  hasAnalysis: boolean,
  lastAnalysisId?: string,
  lastAnalysisDate?: Date,
  analysisScores?: {
    security: number,
    resiliency: number,
    costEfficiency: number,
    compliance: number,
    scalability: number,
    maintainability: number
  },
  componentCount?: number,
  architecturePatterns?: string[],
  technologyStack?: string[],
  createdAt: Date,
  updatedAt: Date,
  // ... other fields
}
```

**Status Codes:**
- `200`: Blueprint found
- `404`: Blueprint not found
- `500`: Server error

---

### PUT `/api/blueprints/[id]`

Update a blueprint.

**Request:**
- **Method**: `PUT`
- **Path Parameters**:
  - `id`: Blueprint ID
- **Body**:
  ```typescript
  {
    name?: string,
    description?: string,
    category?: string,
    tags?: string[],
    isPublic?: boolean,
    // ... other updatable fields
  }
  ```

**Response:**
```typescript
{
  // Updated blueprint object
}
```

**Status Codes:**
- `200`: Blueprint updated
- `404`: Blueprint not found
- `500`: Update failed

**Note**: If blueprint content changes, embeddings are automatically updated.

---

### DELETE `/api/blueprints/[id]`

Delete a blueprint and its associated data.

**Request:**
- **Method**: `DELETE`
- **Path Parameters**:
  - `id`: Blueprint ID

**Response:**
```typescript
{
  message: "Blueprint deleted successfully"
}
```

**Status Codes:**
- `200`: Blueprint deleted
- `404`: Blueprint not found
- `500`: Deletion failed

**Automatic Cleanup:**
This endpoint automatically deletes:
- **Blueprint Embedding**: Removed from vector store (Qdrant/FAISS)
- **Blueprint Analysis Embedding**: Removed from vector store
- **Blueprint Analysis**: Removed from MongoDB
- **Blueprint Metadata**: Removed from MongoDB

---

### GET `/api/blueprints/[id]/download`

Download a blueprint file.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Blueprint ID

**Response:**
- **Content-Type**: Based on file type
- **Body**: File binary data
- **Headers**:
  - `Content-Disposition`: `attachment; filename="..."`
  - `Content-Length`: File size

**Status Codes:**
- `200`: File retrieved
- `404`: Blueprint not found
- `500`: Server error

---

### POST `/api/blueprints/[id]/rate`

Rate a blueprint.

**Request:**
- **Method**: `POST`
- **Path Parameters**:
  - `id`: Blueprint ID
- **Body**:
  ```typescript
  {
    rating: number  // 1-5
  }
  ```

**Response:**
```typescript
{
  id: string,
  rating: number,
  message: "Rating updated successfully"
}
```

**Status Codes:**
- `200`: Rating updated
- `400`: Invalid rating (must be 1-5)
- `404`: Blueprint not found
- `500`: Server error

---

## Blueprint Analysis APIs

### POST `/api/blueprints/[id]/analyze`

Analyze a specific blueprint.

**Request:**
- **Method**: `POST`
- **Path Parameters**:
  - `id`: Blueprint ID

**Response:**
```typescript
{
  success: boolean,
  analysis: {
    _id: string,
    blueprintId: string,
    analysisId: string,
    components: Component[],
    componentRelationships: ComponentRelationship[],
    architecturePatterns: string[],
    technologyStack: string[],
    componentComplexity: {
      totalComponents: number,
      criticalComponents: number,
      highCouplingComponents: number,
      scalabilityBottlenecks: string[],
      integrationPoints: number
    },
    scores: {
      security: number,
      resiliency: number,
      costEfficiency: number,
      compliance: number,
      scalability: number,
      maintainability: number
    },
    recommendations: Recommendation[],
    insights: string[],
    bestPractices: string[],
    industryStandards: string[],
    createdAt: Date,
    updatedAt: Date
  },
  similarBlueprints: SimilarBlueprint[],
  recommendations: Recommendation[],
  message: string
}
```

**Status Codes:**
- `200`: Analysis completed
- `400`: Invalid blueprint ID
- `404`: Blueprint not found
- `500`: Analysis failed

**Automatic Processing:**
- **Analysis Generation**: Comprehensive blueprint analysis with scoring
- **Embedding Storage**: Analysis embeddings stored in vector store for similarity matching
- **MongoDB Storage**: Analysis results saved to MongoDB
- **Similarity Search**: Automatically finds similar blueprints

**Note**: If analysis already exists, returns existing analysis (uses upsert to prevent duplicates).

---

### GET `/api/blueprints/[id]/analyze`

Get blueprint analysis results.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Blueprint ID

**Response:**
```typescript
{
  success: boolean,
  analysis: BlueprintAnalysis,
  similarBlueprints: SimilarBlueprint[]
}
```

**Status Codes:**
- `200`: Analysis found
- `404`: Analysis not found
- `500`: Server error

---

## Blueprint Query & Search APIs

### POST `/api/blueprints/query`

Query blueprints using natural language with AI-powered search.

**Search Scope:**
- Searches both **blueprint embeddings** and **blueprint analysis embeddings**
- Uses vector similarity search (Qdrant or FAISS)
- LLM processes results for intelligent answers

**Request:**
- **Method**: `POST`
- **Body**:
  ```typescript
  {
    query: string,        // Natural language query
    limit?: number,      // Max results (default: 5)
    threshold?: number   // Similarity threshold (default: 0.7)
  }
  ```

**Response:**
```typescript
{
  success: boolean,
  query: string,
  answer: string,        // LLM-generated answer
  relevantBlueprints: Array<{
    blueprint: {
      id: string,
      name: string,
      description: string,
      type: string,
      category: string,
      cloudProviders: string[],
      complexity: string,
      tags: string[]
    },
    analysis: {
      scores: {
        security: number,
        resiliency: number,
        costEfficiency: number,
        compliance: number,
        scalability: number,
        maintainability: number
      },
      architecturePatterns: string[],
      technologyStack: string[],
      insights: string[]
    } | null,
    similarityScore: number
  }>,
  totalResults: number,
  timestamp: string
}
```

**Status Codes:**
- `200`: Query processed successfully
- `400`: Invalid query
- `500`: Query processing failed

**Process:**
1. Generate embedding for query text
2. Search vector store for similar blueprints and analyses
3. Fetch full blueprint and analysis data from MongoDB
4. Build context from top matches
5. Use LLM to generate intelligent answer based on context

---

### POST `/api/blueprints/[id]/query`

Query a specific blueprint using natural language.

**Request:**
- **Method**: `POST`
- **Path Parameters**:
  - `id`: Blueprint ID
- **Body**:
  ```typescript
  {
    query: string  // Natural language question
  }
  ```

**Response:**
```typescript
{
  success: boolean,
  query: string,
  answer: string,        // LLM-generated answer
  blueprintId: string,
  timestamp: string
}
```

**Status Codes:**
- `200`: Query processed
- `400`: Invalid query
- `404`: Blueprint not found
- `500`: Query processing failed

---

### POST `/api/blueprints/similarity-search`

Search for similar blueprints using vector similarity.

**Search Scope:**
- Searches **blueprint embeddings** only (type: `blueprint`)
- Uses vector similarity (Cosine, Euclidean, or Dot product)
- Works with both Qdrant and FAISS vector stores

**Request:**
- **Method**: `POST`
- **Body**:
  ```typescript
  {
    queryVector?: number[],  // Optional: pre-computed vector
    queryText?: string,      // Optional: text to generate vector from
    limit?: number,          // Max results (default: 5)
    threshold?: number       // Similarity threshold (default: 0.7)
  }
  ```

**Response:**
```typescript
{
  success: boolean,
  similarBlueprints: SimilarBlueprint[],
  totalResults: number
}
```

**Status Codes:**
- `200`: Search completed
- `400`: Invalid request (must provide queryVector or queryText)
- `500`: Search failed

---

### POST `/api/blueprints/[id]/similarity`

Find blueprints similar to a specific blueprint.

**Request:**
- **Method**: `POST`
- **Path Parameters**:
  - `id`: Blueprint ID
- **Body**:
  ```typescript
  {
    limit?: number,      // Max results (default: 5)
    threshold?: number   // Similarity threshold (default: 0.7)
  }
  ```

**Response:**
```typescript
{
  success: boolean,
  similarBlueprints: SimilarBlueprint[],
  totalResults: number
}
```

**Status Codes:**
- `200`: Similarity search completed
- `404`: Blueprint not found
- `500`: Search failed

---

### GET `/api/blueprints/analytics`

Get blueprint analytics and statistics.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  totalBlueprints: number,
  totalDownloads: number,
  averageRating: number,
  mostPopularCategory: string,
  mostDownloadedBlueprint: string,
  recentUploads: number,
  topTags: Array<{
    tag: string,
    count: number
  }>,
  categoryDistribution: Array<{
    category: string,
    count: number,
    percentage: number
  }>,
  complexityDistribution: Array<{
    complexity: string,
    count: number,
    percentage: number
  }>,
  monthlyStats: Array<{
    month: string,
    uploads: number,
    downloads: number
  }>,
  topContributors: Array<{
    name: string,
    uploads: number,
    downloads: number
  }>
}
```

**Status Codes:**
- `200`: Analytics retrieved
- `500`: Server error

---

## Checklist APIs

### GET `/api/checklist`

Get checklist items or statistics.

**Request:**
- **Method**: `GET`
- **Query Parameters**:
  - `action`: Optional action (`stats`, `init`)

**Response (default):**
```typescript
ChecklistItem[]
```

**Response (action=stats):**
```typescript
{
  total: number,
  completed: number,
  pending: number,
  byCategory: Record<string, number>,
  byPriority: Record<string, number>
}
```

**Response (action=init):**
```typescript
{
  message: "Default checklist initialized successfully"
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### POST `/api/checklist`

Create a new checklist item.

**Request:**
- **Method**: `POST`
- **Body**:
  ```typescript
  {
    category: string,
    item: string,
    description: string,
    recommendedAction: string,
    owner: string,
    priority: 'low' | 'medium' | 'high',
    status?: 'pending' | 'in-progress' | 'completed',
    dueDate?: Date,
    tags?: string[]
  }
  ```

**Response:**
```typescript
{
  _id: string,
  category: string,
  item: string,
  description: string,
  recommendedAction: string,
  owner: string,
  priority: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Status Codes:**
- `201`: Item created
- `400`: Missing required fields
- `500`: Server error

---

### GET `/api/checklist/[id]`

Get a specific checklist item.

**Request:**
- **Method**: `GET`
- **Path Parameters**:
  - `id`: Checklist item ID

**Response:**
```typescript
{
  _id: string,
  category: string,
  item: string,
  description: string,
  recommendedAction: string,
  owner: string,
  priority: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Status Codes:**
- `200`: Item found
- `404`: Item not found
- `500`: Server error

---

## Dashboard APIs

### GET `/api/dashboard`

Get dashboard statistics and overview.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  totalAnalyses: number,
  totalBlueprints: number,
  totalChecklistItems: number,
  completedChecklistItems: number,
  recentAnalyses: Analysis[],
  recentBlueprints: Blueprint[],
  averageScores: {
    security: number,
    resiliency: number,
    costEfficiency: number,
    compliance: number
  },
  trends: {
    analysesByMonth: Array<{ month: string, count: number }>,
    blueprintsByMonth: Array<{ month: string, count: number }>
  }
}
```

**Status Codes:**
- `200`: Statistics retrieved
- `500`: Server error

---

## System & Configuration APIs

### GET `/api/status`

Get system status and LLM provider availability.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  status: 'healthy' | 'warning' | 'error',
  message: string,
  availableProviders: string[],
  providerCount: number,
  currentClient: {
    provider: string,
    model: string,
    baseUrl?: string
  } | null,
  providerStatus: Array<{
    provider: string,
    available: boolean,
    current: boolean
  }>,
  environmentStatus: {
    openai: boolean,
    anthropic: boolean,
    gemini: boolean,
    ollama: boolean,
    local: boolean,
    enterprise: boolean,
    apigee: boolean
  },
  timestamp: string
}
```

**Status Codes:**
- `200`: Status retrieved
- `500`: Server error

---

### GET `/api/config`

Get LLM configuration details.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  summary: {
    totalProviders: number,
    availableProviders: number,
    configuredProviders: number
  },
  availableProviders: string[],
  providerDetails: Array<{
    provider: string,
    available: boolean,
    config: {
      model: string,
      baseUrl?: string,
      temperature?: string,
      maxTokens?: string,
      apiKey?: string
    } | null,
    error: string | null
  }>,
  environmentVariables: {
    openai: { ... },
    anthropic: { ... },
    gemini: { ... },
    ollama: { ... },
    local: { ... },
    enterprise: { ... },
    apigee: { ... }
  },
  timestamp: string
}
```

**Status Codes:**
- `200`: Configuration retrieved
- `500`: Server error

---

## Test & Utility APIs

### GET `/api/test-llm`

Test LLM client initialization and functionality.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  success: boolean,
  provider: string,
  model: string,
  message: string,
  config: object
}
```

**Status Codes:**
- `200`: Test completed
- `500`: Test failed

---

### GET `/api/test-embeddings`

Test embedding service status and functionality.

**Request:**
- **Method**: `GET`

**Response:**
```typescript
{
  success: boolean,
  embeddingService: {
    available: boolean,
    provider: string,
    model: string,
    dimensions: number
  },
  vectorStore: {
    type: 'qdrant' | 'faiss',
    available: boolean,
    collectionName: string,
    vectorSize: number
  },
  testEmbedding: {
    success: boolean,
    dimensions: number,
    sample: number[]
  }
}
```

**Status Codes:**
- `200`: Test completed
- `500`: Test failed

---

## Data Types

### ArchitectureComponent
```typescript
{
  id: string,
  name: string,
  type: ComponentType,
  terraformCategory?: TerraformCategory,
  cloudService?: string,
  cloudProvider?: CloudProvider,
  cloudRegion?: string,
  cloudAvailabilityZone?: string,
  isManagedService?: boolean,
  isServerless?: boolean,
  description?: string,
  metadata?: Record<string, unknown>
}
```

### SimilarBlueprint
```typescript
{
  id: string,
  score: number,  // Similarity score (0-1)
  blueprint: {
    id: string,
    name: string,
    type: string,
    category: string,
    cloudProvider: string,
    complexity: string,
    tags: string[]
  }
}
```

### Blueprint
```typescript
{
  id: string,
  name: string,
  description: string,
  type: 'diagram' | 'iac' | 'hybrid',
  category: string,
  cloudProviders: string[],
  complexity: 'low' | 'medium' | 'high',
  tags: string[],
  fileName: string,
  fileSize: number,
  fileType: string,
  hasEmbedding: boolean,
  hasAnalysis: boolean,
  isPublic: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date,
  downloadCount: number,
  rating: number,
  version: string,
  metadata: BlueprintMetadata
}
```

### Risk
```typescript
{
  id: string,
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  category: string,
  impact: string,
  recommendation: string,
  components: string[]
}
```

### Recommendation
```typescript
{
  id: string,
  issue: string,
  fix: string,
  priority: 'low' | 'medium' | 'high',
  category: string,
  impact: string,
  effort: 'low' | 'medium' | 'high',
  components: string[]
}
```

---

## Error Responses

All error responses follow this format:

```typescript
{
  error: string,
  details?: string,
  timestamp?: string
}
```

**Common Status Codes:**
- `400`: Bad Request - Invalid input
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error

---

## Rate Limiting

Currently, there are no rate limits. Future versions may implement rate limiting based on API keys or user authentication.

---

## Versioning

Current API version: **v1** (implicit)

Future versions may use URL versioning: `/api/v2/...`

---

## Notes

1. **File Uploads**: Use `multipart/form-data` for file uploads
2. **Pagination**: Default page size is 20, maximum is 100
3. **Vector Search**: Similarity threshold ranges from 0.0 to 1.0 (higher = more similar)
4. **Embeddings**: Automatically generated for blueprints and architecture analyses
5. **Analysis**: Blueprint analysis is performed automatically on upload
6. **Vector Store**: Supports both Qdrant (server-based) and FAISS (in-memory) - configured via `VECTOR_STORE_TYPE`
7. **Deterministic Scoring**: Analysis uses `temperature: 0` for consistent, reproducible scores
8. **Result Caching**: Analysis results are cached for 24 hours based on file content hash
9. **Architecture Embeddings**: Architecture analysis embeddings are stored in vector store for similarity matching
10. **Score Consistency**: Same architecture diagram always produces identical scores (within cache TTL)

---

## Examples

### Upload and Analyze Architecture
```bash
# First request - runs analysis and caches result
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@architecture.png" \
  -F "appId=my-app" \
  -F "componentName=API Gateway" \
  -F "description=Production API Gateway" \
  -F "environment=production" \
  -F "version=1.0.0"

# Response includes:
# {
#   "cached": false,
#   "cacheHash": "a1b2c3d4e5f6g7h8",
#   "securityScore": 85,
#   ...
# }

# Second request (same file + metadata) - returns cached result instantly
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@architecture.png" \
  -F "appId=my-app" \
  -F "componentName=API Gateway" \
  -F "description=Production API Gateway" \
  -F "environment=production" \
  -F "version=1.0.0"

# Response includes:
# {
#   "cached": true,
#   "cacheHash": "a1b2c3d4e5f6g7h8",
#   "securityScore": 85,  // Identical to first request
#   ...
# }
```

### Query Blueprints
```bash
curl -X POST http://localhost:3000/api/blueprints/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find blueprints for microservices architecture on AWS",
    "limit": 5,
    "threshold": 0.7
  }'
```

### Get Blueprint Analysis
```bash
curl http://localhost:3000/api/blueprints/12345/analyze
```

### Query Architecture Analysis (with custom ID)
```bash
# Supports both MongoDB ObjectId and custom string IDs
curl -X POST http://localhost:3000/api/analysis/analysis-1763456951096/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the security risks?"}'
```

---

## Consistency & Caching

### Deterministic Scoring

All analysis endpoints use **temperature: 0** for deterministic LLM responses:
- **Stage 1 (Extraction)**: `temperature: 0` - Consistent component extraction
- **Stage 2 (Analysis)**: `temperature: 0` - Consistent scoring

**Benefits:**
- Same input → Same output (100% reproducible)
- No score variance between runs
- Reliable for auditing and comparison

### Result Caching

Analysis results are cached based on:
- **Cache Key**: SHA-256 hash of (file content + appId + componentName + environment + version)
- **TTL**: 24 hours
- **Storage**: In-memory (can be migrated to Redis for distributed deployments)

**Cache Behavior:**
- **First Request**: Runs full analysis, caches result, returns with `cached: false`
- **Subsequent Requests**: Returns cached result instantly with `cached: true`
- **Cache Hit Rate**: Improves performance and reduces LLM API costs

**Cache Response Fields:**
```typescript
{
  cached: boolean,      // true if from cache, false if newly analyzed
  cacheHash: string    // First 16 characters of cache hash (for debugging)
}
```

### Vector Store Configuration

**Qdrant (Server-Based)** - Default:
```bash
VECTOR_STORE_TYPE=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=blueprints
QDRANT_VECTOR_SIZE=1024
```

**FAISS (In-Memory)**:
```bash
VECTOR_STORE_TYPE=faiss
FAISS_COLLECTION_NAME=blueprints
FAISS_VECTOR_SIZE=1024
```

**Collection Structure:**
- **Single Collection**: `blueprints` (default, configurable via `QDRANT_COLLECTION_NAME` or `FAISS_COLLECTION_NAME`)
- **Type-Based Filtering**: All embeddings stored together, distinguished by `type` field:
  - `type: 'blueprint'` - Blueprint embeddings (diagrams/IAC)
  - `type: 'blueprint_analysis'` - Blueprint analysis embeddings
  - `type: 'architecture_analysis'` - Architecture analysis embeddings
- **Unified Search**: Can search across all types or filter by specific type
- **Point IDs**: 
  - Blueprints: `blueprint_{blueprintId}`
  - Blueprint Analysis: `analysis_{analysisId}`
  - Architecture Analysis: `architecture_analysis_{analysisId}`

**Embedding Storage:**
- **Blueprint Upload**: Generates and stores blueprint embedding
- **Blueprint Analysis**: Generates and stores analysis embedding
- **Architecture Analysis**: Generates and stores analysis embedding automatically
- **Vector Dimensions**: Configurable (default: 1024, must match embedding model)

---

**Last Updated**: 2025-01-24
**API Version**: 1.0
**Scoring Method**: Deterministic (temperature: 0)
**Caching**: Enabled (24-hour TTL)

