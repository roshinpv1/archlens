# 🚀 Blueprint Embeddings Setup Guide

This guide explains how to set up the blueprint embeddings system with Qdrant vector database and local embedding models.

## 📋 Prerequisites

1. **Ollama** (for local embeddings)
2. **Qdrant** (vector database)
3. **Node.js** dependencies

## 🔧 Installation Steps

### 1. Install Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the embedding model
ollama pull sentence-transformers/all-MiniLM-L6-v2
```

### 2. Install Qdrant
```bash
# Using Docker (recommended)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Or install locally
# Follow instructions at: https://qdrant.tech/documentation/quick-start/
```

### 3. Install Node.js Dependencies
```bash
npm install @qdrant/js-client-rest
```

## ⚙️ Environment Configuration

Add these variables to your `.env.local` file:

```bash
# Embeddings Configuration
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_BASE_URL=http://localhost:11434
EMBEDDINGS_API_KEY=not-needed
EMBEDDINGS_DIMENSIONS=786

# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=blueprints
QDRANT_VECTOR_SIZE=786
QDRANT_DISTANCE=Cosine
```

## 🚀 Usage

### 1. Start Services
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Terminal 3: Start the application
npm run dev
```

### 2. Upload Blueprints
- Blueprints are automatically embedded when uploaded
- Embeddings are stored in Qdrant
- Similarity search is available via API

### 3. Analysis with Similarity
- When analyzing architecture diagrams
- System automatically finds similar blueprints
- Results include similarity scores and recommendations

## 📊 API Endpoints

### Similarity Search
```bash
# Find similar blueprints for analysis
POST /api/blueprints/similarity
{
  "analysisContent": {
    "components": [...],
    "connections": [...],
    "description": "...",
    "metadata": {...}
  }
}

# Find similar blueprints for a blueprint
GET /api/blueprints/similarity?blueprintId=123

# Get detailed similarity info
GET /api/blueprints/123/similarity?detailed=true
```

## 🔍 How It Works

1. **Blueprint Upload**: 
   - Blueprint content is extracted
   - Embedding is generated using local model
   - Vector is stored in Qdrant

2. **Analysis Process**:
   - Analysis content is embedded
   - Similar blueprints are found via vector search
   - Top 2 matches are returned with similarity scores

3. **Similarity Matching**:
   - Cosine similarity is used for distance calculation
   - 70% threshold for blueprint matching
   - 786-dimensional vectors for comprehensive matching

## 🛠️ Troubleshooting

### Common Issues

1. **Ollama not running**
   ```bash
   ollama serve
   ```

2. **Qdrant connection failed**
   ```bash
   docker ps | grep qdrant
   ```

3. **Embedding generation fails**
   - Check Ollama model is pulled
   - Verify EMBEDDINGS_BASE_URL is correct

4. **Vector search returns no results**
   - Ensure blueprints have been uploaded
   - Check Qdrant collection exists
   - Verify vector dimensions match

### Debug Commands

```bash
# Check Ollama models
ollama list

# Test Qdrant connection
curl http://localhost:6333/collections

# Check application logs
npm run dev
```

## 📈 Performance

- **Embedding Generation**: ~2-5 seconds per blueprint
- **Vector Search**: ~100-500ms for similarity search
- **Memory Usage**: ~50MB for Qdrant, ~200MB for Ollama
- **Storage**: ~1KB per blueprint vector

## 🔒 Security Notes

- Embeddings are stored locally in Qdrant
- No external API calls for embedding generation
- Vector data is not exposed in API responses
- Similarity scores are calculated server-side

## 📚 Next Steps

1. **Production Setup**: Use Qdrant Cloud for production
2. **Scaling**: Consider multiple embedding models
3. **Monitoring**: Add metrics for embedding performance
4. **Caching**: Implement vector search result caching
