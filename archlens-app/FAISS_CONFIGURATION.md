# FAISS In-Memory Vector Store Configuration

## Overview

ArchLens now supports **FAISS-like in-memory vector storage** as an alternative to Qdrant. This provides a local, serverless solution for vector embeddings that works entirely in-memory.

## Vector Store Options

### Option 1: FAISS (In-Memory) - Recommended for Local Development
- **No server required** - Runs entirely in-process
- **Fast** - No network overhead
- **Simple** - No Docker or external services needed
- **Limitations**: Data is lost on restart (in-memory only)

### Option 2: Qdrant (Server-Based) - Recommended for Production
- **Persistent storage** - Data survives restarts
- **Scalable** - Can handle large datasets
- **Requires**: Qdrant server (Docker or remote)
- **Better for**: Production deployments

## Configuration

### Using FAISS (In-Memory)

Set the following environment variables:

```bash
# Use FAISS instead of Qdrant
VECTOR_STORE_TYPE=faiss

# FAISS Configuration (optional, uses Qdrant defaults if not set)
FAISS_COLLECTION_NAME=blueprints
FAISS_VECTOR_SIZE=1024
FAISS_DISTANCE=Cosine
```

**Note**: If `VECTOR_STORE_TYPE` is not set, it defaults to `qdrant`.

### Using Qdrant (Server-Based)

```bash
# Use Qdrant (default)
VECTOR_STORE_TYPE=qdrant

# Or simply don't set VECTOR_STORE_TYPE

# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=blueprints
QDRANT_VECTOR_SIZE=1024
QDRANT_DISTANCE=Cosine
QDRANT_AUTO_FIX_DIMENSIONS=true
```

## Environment Variables

### Vector Store Selection

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `VECTOR_STORE_TYPE` | `faiss` or `qdrant` | `qdrant` | Selects which vector store to use |

### FAISS Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FAISS_COLLECTION_NAME` | `blueprints` | Collection name for FAISS |
| `FAISS_VECTOR_SIZE` | `1024` | Vector dimensions (must match embedding model) |
| `FAISS_DISTANCE` | `Cosine` | Similarity metric: `Cosine`, `Euclidean`, or `Dot` |

**Note**: If FAISS variables are not set, FAISS will use Qdrant environment variables as fallback.

### Qdrant Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `QDRANT_URL` | `http://localhost:6333` | Qdrant server URL |
| `QDRANT_API_KEY` | (optional) | API key for Qdrant |
| `QDRANT_COLLECTION_NAME` | `blueprints` | Collection name |
| `QDRANT_VECTOR_SIZE` | `1024` | Vector dimensions |
| `QDRANT_DISTANCE` | `Cosine` | Similarity metric |
| `QDRANT_AUTO_FIX_DIMENSIONS` | `false` | Auto-fix dimension mismatches |

## Quick Start

### Using FAISS (No Server Required)

1. **Set environment variable**:
   ```bash
   export VECTOR_STORE_TYPE=faiss
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

3. **That's it!** No Docker, no Qdrant server needed.

### Using Qdrant (With Server)

1. **Start Qdrant server**:
   ```bash
   npm run start-services
   # Or manually:
   docker run -d --name qdrant-archlens -p 6333:6333 qdrant/qdrant
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

## Features Comparison

| Feature | FAISS (In-Memory) | Qdrant (Server) |
|---------|-------------------|-----------------|
| **Setup** | ✅ No server needed | ⚠️ Requires server |
| **Persistence** | ❌ Lost on restart | ✅ Persistent |
| **Performance** | ✅ Very fast (in-process) | ✅ Fast (network) |
| **Scalability** | ⚠️ Limited by memory | ✅ Highly scalable |
| **Production Ready** | ⚠️ For small datasets | ✅ Yes |
| **Data Size** | ⚠️ Limited by RAM | ✅ Large datasets |

## When to Use Each

### Use FAISS When:
- ✅ Local development
- ✅ Small to medium datasets (< 10K vectors)
- ✅ Quick prototyping
- ✅ No persistence needed
- ✅ Want to avoid Docker/server setup

### Use Qdrant When:
- ✅ Production deployments
- ✅ Large datasets (> 10K vectors)
- ✅ Need data persistence
- ✅ Need scalability
- ✅ Multi-instance deployments

## Implementation Details

### FAISS Client (`src/lib/faiss-client.ts`)
- Pure TypeScript implementation
- In-memory storage using Map
- Cosine, Euclidean, and Dot product similarity
- Filter support for type-based searches
- No external dependencies (beyond TypeScript)

### Unified Vector Store (`src/lib/vector-store.ts`)
- Abstraction layer for both FAISS and Qdrant
- Automatic selection based on `VECTOR_STORE_TYPE`
- Same interface for both implementations
- Seamless switching between stores

## Migration

### Switching from Qdrant to FAISS

1. **Set environment variable**:
   ```bash
   export VECTOR_STORE_TYPE=faiss
   ```

2. **Restart application** - FAISS will be used automatically

3. **Note**: FAISS starts with empty data (in-memory). Existing Qdrant data won't be migrated automatically.

### Switching from FAISS to Qdrant

1. **Set environment variable** (or remove it):
   ```bash
   export VECTOR_STORE_TYPE=qdrant
   # Or unset it
   ```

2. **Ensure Qdrant server is running**

3. **Restart application** - Qdrant will be used automatically

## Performance Notes

### FAISS Performance
- **Search Speed**: O(n) where n = number of vectors
- **Memory Usage**: ~4KB per vector (1024 dimensions)
- **Best For**: < 10,000 vectors for optimal performance
- **Scaling**: Performance degrades linearly with dataset size

### Qdrant Performance
- **Search Speed**: Optimized with indexes
- **Memory Usage**: Server-managed
- **Best For**: Any dataset size
- **Scaling**: Handles millions of vectors efficiently

## Troubleshooting

### FAISS Issues

**Problem**: "Vector dimension mismatch"
- **Solution**: Ensure `FAISS_VECTOR_SIZE` matches your embedding model dimensions

**Problem**: "Out of memory"
- **Solution**: Reduce dataset size or switch to Qdrant for larger datasets

**Problem**: "Data lost on restart"
- **Solution**: This is expected behavior. Use Qdrant for persistence.

### Qdrant Issues

**Problem**: "Connection refused"
- **Solution**: Ensure Qdrant server is running (`npm run start-services`)

**Problem**: "Dimension mismatch"
- **Solution**: Set `QDRANT_AUTO_FIX_DIMENSIONS=true` or manually delete collection

## Example Configuration

### `.env` for FAISS
```bash
# Vector Store
VECTOR_STORE_TYPE=faiss
FAISS_VECTOR_SIZE=1024
FAISS_DISTANCE=Cosine

# Embeddings
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDINGS_DIMENSIONS=1024
```

### `.env` for Qdrant
```bash
# Vector Store
VECTOR_STORE_TYPE=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_VECTOR_SIZE=1024
QDRANT_DISTANCE=Cosine
QDRANT_AUTO_FIX_DIMENSIONS=true

# Embeddings
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDINGS_DIMENSIONS=1024
```

## Summary

✅ **FAISS is now available** as an in-memory alternative to Qdrant  
✅ **Easy configuration** via `VECTOR_STORE_TYPE` environment variable  
✅ **Same interface** - code works with both stores  
✅ **No server required** for FAISS - perfect for local development  
✅ **Automatic selection** - system chooses based on configuration  

Choose FAISS for simplicity and local development, or Qdrant for production and scalability!

