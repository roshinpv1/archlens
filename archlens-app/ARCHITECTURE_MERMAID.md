# ArchLens Application Architecture - Mermaid Diagram

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer - Next.js 15"
        UI[React UI Components]
        Pages[Pages]
        Dashboard[Dashboard Page]
        Analyses[Analyses Page]
        Library[Library Page]
        Config[Configuration Page]
        
        UI --> Pages
        Pages --> Dashboard
        Pages --> Analyses
        Pages --> Library
        Pages --> Config
    end
    
    subgraph "API Layer - Next.js API Routes"
        AnalyzeAPI[/api/analyze]
        BlueprintAPI[/api/blueprints]
        AnalysisAPI[/api/analysis]
        ChecklistAPI[/api/checklist]
        DashboardAPI[/api/dashboard]
        ConfigAPI[/api/config]
        
        AnalyzeAPI --> AnalysisService
        BlueprintAPI --> BlueprintService
        AnalysisAPI --> AnalysisService
        ChecklistAPI --> ChecklistService
        DashboardAPI --> DashboardService
        ConfigAPI --> ConfigService
    end
    
    subgraph "Service Layer"
        AnalysisService[Analysis Service]
        BlueprintService[Blueprint Analysis Service]
        EmbeddingService[Embedding Service]
        SimilarityService[Similarity Service]
        ChecklistService[Checklist Service]
        ImageOptimizer[Image Optimizer]
        AnalysisCache[Analysis Cache]
        
        AnalysisService --> LLMClient
        AnalysisService --> EmbeddingService
        AnalysisService --> SimilarityService
        AnalysisService --> ImageOptimizer
        AnalysisService --> AnalysisCache
        
        BlueprintService --> LLMClient
        BlueprintService --> EmbeddingService
        BlueprintService --> SimilarityService
        
        SimilarityService --> EmbeddingService
        SimilarityService --> VectorStore
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB)]
        VectorStore[Vector Store]
        Qdrant[(Qdrant)]
        FAISS[(FAISS In-Memory)]
        
        AnalysisService --> MongoDB
        BlueprintService --> MongoDB
        ChecklistService --> MongoDB
        
        VectorStore --> Qdrant
        VectorStore --> FAISS
        EmbeddingService --> VectorStore
    end
    
    subgraph "External Services"
        LLMClient[LLM Client Factory]
        EmbeddingClient[Embedding Client]
        
        LLMClient --> OpenAI[OpenAI]
        LLMClient --> Anthropic[Anthropic]
        LLMClient --> Gemini[Google Gemini]
        LLMClient --> Apigee[Apigee]
        LLMClient --> Enterprise[Enterprise LLM]
        LLMClient --> Local[Local LLM]
        LLMClient --> Ollama[Ollama]
        
        EmbeddingClient --> LocalEmbed[Local Embeddings]
        EmbeddingClient --> OpenAIEmbed[OpenAI Embeddings]
        EmbeddingClient --> CustomEmbed[Custom Provider]
    end
    
    subgraph "Models"
        AnalysisModel[Analysis Model]
        BlueprintModel[Blueprint Model]
        ChecklistModel[Checklist Model]
        BlueprintVectorModel[Blueprint Vector Model]
        
        AnalysisModel --> MongoDB
        BlueprintModel --> MongoDB
        ChecklistModel --> MongoDB
        BlueprintVectorModel --> VectorStore
    end
    
    UI --> AnalyzeAPI
    UI --> BlueprintAPI
    UI --> AnalysisAPI
    UI --> ChecklistAPI
    UI --> DashboardAPI
    UI --> ConfigAPI
    
    EmbeddingService --> EmbeddingClient
    
    style UI fill:#e1f5ff
    style Pages fill:#e1f5ff
    style AnalyzeAPI fill:#fff4e1
    style BlueprintAPI fill:#fff4e1
    style AnalysisService fill:#e8f5e9
    style BlueprintService fill:#e8f5e9
    style MongoDB fill:#f3e5f5
    style VectorStore fill:#f3e5f5
    style LLMClient fill:#ffe0e0
    style EmbeddingClient fill:#ffe0e0
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AnalysisService
    participant ImageOptimizer
    participant LLMClient
    participant EmbeddingService
    participant VectorStore
    participant SimilarityService
    participant MongoDB
    
    User->>Frontend: Upload Architecture File
    Frontend->>API: POST /api/analyze
    API->>ImageOptimizer: Optimize Image
    ImageOptimizer-->>API: Optimized Base64
    
    API->>LLMClient: Stage 1: Component Extraction
    LLMClient-->>API: Extracted Components
    
    API->>LLMClient: Stage 2: Deep Analysis
    LLMClient-->>API: Analysis Results
    
    API->>EmbeddingService: Generate Analysis Embedding
    EmbeddingService-->>API: Embedding Vector
    
    API->>SimilarityService: Find Similar Blueprints
    SimilarityService->>VectorStore: Search Similar Vectors
    VectorStore-->>SimilarityService: Similar Blueprints
    SimilarityService-->>API: Top 3 Similar Blueprints
    
    API->>MongoDB: Save Analysis
    MongoDB-->>API: Analysis Saved
    
    API-->>Frontend: Analysis Results
    Frontend-->>User: Display Results
```

## Blueprint Upload Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant ImageOptimizer
    participant LLMClient
    participant EmbeddingService
    participant VectorStore
    participant MongoDB
    
    User->>Frontend: Upload Blueprint
    Frontend->>API: POST /api/blueprints
    API->>ImageOptimizer: Optimize Image
    ImageOptimizer-->>API: Optimized Base64
    
    API->>LLMClient: Extract Blueprint Components
    LLMClient-->>API: Blueprint Metadata
    
    API->>MongoDB: Save Blueprint Metadata
    MongoDB-->>API: Blueprint Saved
    
    API->>EmbeddingService: Generate Blueprint Embedding
    EmbeddingService-->>API: Embedding Vector
    
    API->>VectorStore: Store Blueprint Vector
    VectorStore-->>API: Vector Stored
    
    API->>LLMClient: Analyze Blueprint
    LLMClient-->>API: Blueprint Analysis
    
    API->>MongoDB: Save Blueprint Analysis
    MongoDB-->>API: Analysis Saved
    
    API-->>Frontend: Complete Blueprint
    Frontend-->>User: Display Blueprint
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        Header[Header]
        FileUpload[FileUpload]
        AnalysisResults[AnalysisResults]
        BlueprintManager[BlueprintManager]
        BlueprintViewer[BlueprintViewer]
        DashboardStats[DashboardStats]
        ChecklistManager[ChecklistManager]
    end
    
    subgraph "API Endpoints"
        Analyze[/api/analyze]
        Blueprints[/api/blueprints]
        BlueprintID[/api/blueprints/[id]]
        AnalysisID[/api/analysis/[id]]
        Checklist[/api/checklist]
    end
    
    subgraph "Core Services"
        AnalysisSvc[Analysis Service]
        BlueprintSvc[Blueprint Service]
        EmbeddingSvc[Embedding Service]
        SimilaritySvc[Similarity Service]
        ChecklistSvc[Checklist Service]
    end
    
    subgraph "Libraries"
        LLMFactory[LLM Factory]
        VectorStoreLib[Vector Store]
        EmbeddingClientLib[Embedding Client]
        MongoDBLib[MongoDB Client]
    end
    
    FileUpload --> Analyze
    AnalysisResults --> AnalysisID
    BlueprintManager --> Blueprints
    BlueprintViewer --> BlueprintID
    ChecklistManager --> Checklist
    
    Analyze --> AnalysisSvc
    Blueprints --> BlueprintSvc
    AnalysisID --> AnalysisSvc
    Checklist --> ChecklistSvc
    
    AnalysisSvc --> LLMFactory
    AnalysisSvc --> EmbeddingSvc
    AnalysisSvc --> SimilaritySvc
    BlueprintSvc --> LLMFactory
    BlueprintSvc --> EmbeddingSvc
    
    EmbeddingSvc --> EmbeddingClientLib
    SimilaritySvc --> VectorStoreLib
    AnalysisSvc --> MongoDBLib
    BlueprintSvc --> MongoDBLib
```

## Vector Store Architecture

```mermaid
graph TB
    subgraph "Vector Store Interface"
        UnifiedVectorStore[Unified Vector Store]
    end
    
    subgraph "Vector Store Implementations"
        QdrantClient[Qdrant Client]
        FaissClient[FAISS Client]
    end
    
    subgraph "Storage"
        QdrantServer[(Qdrant Server)]
        FaissMemory[(FAISS In-Memory)]
    end
    
    subgraph "Collections"
        BlueprintCollection[Blueprint Vectors]
        AnalysisCollection[Analysis Vectors]
    end
    
    UnifiedVectorStore --> QdrantClient
    UnifiedVectorStore --> FaissClient
    
    QdrantClient --> QdrantServer
    FaissClient --> FaissMemory
    
    QdrantServer --> BlueprintCollection
    QdrantServer --> AnalysisCollection
    FaissMemory --> BlueprintCollection
    FaissMemory --> AnalysisCollection
```

## LLM Provider Architecture

```mermaid
graph TB
    subgraph "LLM Factory"
        LLMFactory[LLM Factory]
        LLMClient[LLM Client]
    end
    
    subgraph "LLM Providers"
        OpenAI[OpenAI<br/>GPT-4, GPT-3.5]
        Anthropic[Anthropic<br/>Claude]
        Gemini[Google Gemini]
        Apigee[Apigee Enterprise]
        Enterprise[Enterprise LLM]
        Local[Local LLM]
        Ollama[Ollama]
    end
    
    subgraph "Token Management"
        OpenAITokens[OpenAI Token Manager]
        AnthropicTokens[Anthropic Token Manager]
        GenericTokens[Generic Token Manager]
    end
    
    LLMFactory --> LLMClient
    LLMClient --> OpenAI
    LLMClient --> Anthropic
    LLMClient --> Gemini
    LLMClient --> Apigee
    LLMClient --> Enterprise
    LLMClient --> Local
    LLMClient --> Ollama
    
    OpenAI --> OpenAITokens
    Anthropic --> AnthropicTokens
    Gemini --> GenericTokens
    Apigee --> GenericTokens
    Enterprise --> GenericTokens
    Local --> GenericTokens
    Ollama --> GenericTokens
```

## Database Schema Relationships

```mermaid
erDiagram
    ANALYSIS ||--o{ SIMILAR_BLUEPRINTS : has
    BLUEPRINT ||--o{ BLUEPRINT_ANALYSIS : has
    BLUEPRINT ||--o{ BLUEPRINT_VECTOR : has
    ANALYSIS ||--o{ ANALYSIS_VECTOR : has
    CHECKLIST ||--o{ CHECKLIST_ITEMS : contains
    
    ANALYSIS {
        string id
        string fileName
        object components
        object connections
        object analysis
        array similarBlueprints
        date createdAt
    }
    
    BLUEPRINT {
        string id
        string name
        string type
        string category
        string cloudProvider
        object originalFile
        date createdAt
    }
    
    BLUEPRINT_ANALYSIS {
        string id
        string blueprintId
        object analysis
        date createdAt
    }
    
    BLUEPRINT_VECTOR {
        string id
        string blueprintId
        array vector
        object payload
    }
    
    ANALYSIS_VECTOR {
        string id
        string analysisId
        array vector
        object payload
    }
    
    CHECKLIST {
        string id
        string name
        array items
        boolean active
    }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end
    
    subgraph "Edge/CDN"
        CDN[CDN<br/>Static Assets]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js Application<br/>Frontend + API Routes]
        LoadBalancer[Load Balancer]
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB<br/>Replica Set)]
        Qdrant[(Qdrant<br/>Vector Database)]
    end
    
    subgraph "External Services"
        LLMProviders[LLM Providers<br/>OpenAI, Anthropic, etc.]
        EmbeddingProviders[Embedding Providers]
    end
    
    Browser --> CDN
    Browser --> NextJS
    CDN --> NextJS
    LoadBalancer --> NextJS
    
    NextJS --> MongoDB
    NextJS --> Qdrant
    NextJS --> LLMProviders
    NextJS --> EmbeddingProviders
```

