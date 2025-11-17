# Vector Store Collections Structure

## Overview

ArchLens uses a **single collection** for all vector embeddings, but distinguishes between different types using a `type` field in the payload. This design allows for efficient similarity searches across all stored embeddings while maintaining clear separation between different data types.

## Collection Structure

### Single Collection: `blueprints` (default)

All embeddings are stored in the same collection, regardless of type. The collection name can be configured via:
- `QDRANT_COLLECTION_NAME` (for Qdrant)
- `FAISS_COLLECTION_NAME` (for FAISS)

**Default**: `blueprints`

## Embedding Types

The system stores three types of embeddings, distinguished by the `type` field in the payload:

### 1. Blueprint Embeddings
- **Type**: `'blueprint'`
- **Point ID Format**: `blueprint_{blueprintId}`
- **Stored When**: Blueprint is uploaded
- **Purpose**: Find similar blueprints based on architecture diagrams or IAC code

**Payload Structure**:
```typescript
{
  blueprintId: string;
  name: string;
  type: 'blueprint';
  blueprintType: string; // Original blueprint type (diagram, iac, etc.)
  category: string;
  cloudProvider: string;
  complexity: string;
  tags: string[];
  content: string; // Extracted content for embedding
  createdAt: string;
  updatedAt: string;
}
```

### 2. Blueprint Analysis Embeddings
- **Type**: `'blueprint_analysis'`
- **Point ID Format**: `analysis_{analysisId}`
- **Stored When**: Blueprint analysis is performed
- **Purpose**: Find similar blueprint analyses based on component analysis, patterns, and recommendations

**Payload Structure**:
```typescript
{
  blueprintId: string;
  blueprintName: string;
  analysisId: string;
  type: 'blueprint_analysis';
  componentCount: number;
  architecturePatterns: string[];
  technologyStack: string[];
  scores: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
    scalability: number;
    maintainability: number;
  };
  componentTypes: string[];
  componentTechnologies: string[];
  criticalComponents: string[];
  scalabilityPatterns: string[];
  securityLevels: string[];
  createdAt: string;
}
```

### 3. Architecture Analysis Embeddings (NEW)
- **Type**: `'architecture_analysis'`
- **Point ID Format**: `architecture_analysis_{analysisId}`
- **Stored When**: Architecture analysis is completed
- **Purpose**: Find similar architecture analyses based on components, connections, and metadata

**Payload Structure**:
```typescript
{
  analysisId: string;
  analysisName: string;
  type: 'architecture_analysis';
  componentCount: number;
  connectionCount: number;
  architectureType: string;
  cloudProviders: string[];
  scores: {
    security: number;
    resiliency: number;
    costEfficiency: number;
    compliance: number;
  };
  architecturePatterns: string[];
  technologyStack: string[];
  createdAt: string;
  appId: string;
  environment: string;
}
```

## Search Methods

### 1. `searchSimilarBlueprints()`
- **Filters**: `type === 'blueprint'`
- **Returns**: Similar blueprints based on architecture diagrams/IAC
- **Use Case**: Find similar blueprints when analyzing a new architecture

### 2. `searchSimilarAnalysis()`
- **Filters**: `type === 'blueprint_analysis' OR type === 'architecture_analysis'`
- **Returns**: Similar blueprint analyses AND architecture analyses
- **Use Case**: Find similar analyses (both blueprint and architecture) when analyzing a new architecture

## Why Single Collection?

### Advantages:
1. **Unified Search**: Can search across all embeddings in one query
2. **Simplified Management**: One collection to manage, backup, and monitor
3. **Efficient Filtering**: Type-based filtering is fast and efficient
4. **Cross-Type Similarity**: Can find similar items across different types if needed

### Disadvantages:
1. **No Physical Separation**: All embeddings in one collection (but logically separated by type)
2. **Collection Size**: Single collection can grow large (but both Qdrant and FAISS handle this well)

## Collection Configuration

### Qdrant
```bash
QDRANT_COLLECTION_NAME=blueprints
QDRANT_VECTOR_SIZE=1024
QDRANT_DISTANCE=Cosine
```

### FAISS
```bash
FAISS_COLLECTION_NAME=blueprints
FAISS_VECTOR_SIZE=1024
FAISS_DISTANCE=Cosine
```

## Data Flow

### Blueprint Upload
1. Blueprint uploaded → Extract content
2. Generate embedding → Store with `type: 'blueprint'`
3. Perform analysis → Generate analysis embedding
4. Store analysis embedding → Store with `type: 'blueprint_analysis'`

### Architecture Analysis
1. Architecture uploaded → Analyze components
2. Generate embedding → Store with `type: 'architecture_analysis'`
3. Search for similar blueprints → Use `searchSimilarBlueprints()`
4. Search for similar analyses → Use `searchSimilarAnalysis()`

## Filtering Examples

### Search Only Blueprints
```typescript
const results = await vectorStore.searchSimilarBlueprints(queryVector, 5, 0.7);
// Returns only embeddings with type: 'blueprint'
```

### Search Only Analyses
```typescript
const results = await vectorStore.searchSimilarAnalysis(queryVector, 5, 0.7);
// Returns embeddings with type: 'blueprint_analysis' OR 'architecture_analysis'
```

### Search All (Custom)
```typescript
// In FAISS, you can use a custom filter:
const results = await faissClient.search(queryVector, 10, 0.7, () => true);
// Returns all embeddings regardless of type
```

## Summary

✅ **Single Collection**: All embeddings in one collection (`blueprints`)  
✅ **Type-Based Filtering**: Distinguished by `type` field in payload  
✅ **Three Types**: `blueprint`, `blueprint_analysis`, `architecture_analysis`  
✅ **Efficient Search**: Type-based filtering for targeted searches  
✅ **Unified Interface**: Same collection, different types, same search methods  

This design provides flexibility while maintaining clear logical separation between different embedding types!

