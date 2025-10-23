# 🚀 Quick Start: Blueprint Embeddings

Get the blueprint embeddings system up and running in minutes!

## ⚡ One-Command Setup

```bash
# Run the automated setup script
npm run setup-embeddings
```

This will:
- ✅ Install Ollama (if not already installed)
- ✅ Pull the embedding model
- ✅ Start Qdrant vector database
- ✅ Start Ollama service
- ✅ Verify everything is working

## 🎯 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Dependencies
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull embedding model
ollama pull sentence-transformers/all-MiniLM-L6-v2
```

### 2. Start Services
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Terminal 3: Start the app
npm run dev
```

## 🛠️ NPM Scripts

```bash
# Automated setup
npm run setup-embeddings

# Start services only
npm run start-services

# Stop services
npm run stop-services

# Start the application
npm run dev
```

## ✅ Verify Setup

1. **Check Ollama**: Visit http://localhost:11434
2. **Check Qdrant**: Visit http://localhost:6333
3. **Check App**: Visit http://localhost:3000

## 🧪 Test the System

1. **Upload a Blueprint**:
   - Go to Library → Blueprints
   - Upload an architecture diagram
   - Check console for embedding generation logs

2. **Run an Analysis**:
   - Go to Analyses
   - Upload an architecture diagram
   - Check for similar blueprints in the results

3. **Test API**:
   ```bash
   # Test similarity search
   curl http://localhost:3000/api/blueprints/similarity?query=microservices
   ```

## 🔧 Environment Variables

Add to your `.env.local`:

```bash
# Embeddings
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_BASE_URL=http://localhost:11434
EMBEDDINGS_DIMENSIONS=786

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=blueprints
QDRANT_VECTOR_SIZE=786
QDRANT_DISTANCE=Cosine
```

## 🎉 You're Ready!

The blueprint embeddings system is now active:
- ✅ Automatic embedding generation for blueprints
- ✅ Similarity matching during analysis
- ✅ Vector search API endpoints
- ✅ 786-dimensional embeddings
- ✅ Cosine similarity matching

## 🆘 Troubleshooting

### Ollama Issues
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
pkill ollama && ollama serve
```

### Qdrant Issues
```bash
# Check if Qdrant is running
docker ps | grep qdrant

# Restart Qdrant
docker stop qdrant-archlens && docker rm qdrant-archlens
docker run -d --name qdrant-archlens -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

### App Issues
```bash
# Check logs
npm run dev

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 More Information

- **Detailed Setup**: See `EMBEDDINGS_SETUP.md`
- **Implementation**: See `BLUEPRINT_EMBEDDINGS_SUMMARY.md`
- **API Documentation**: Check the API routes in `/src/app/api/`

Happy embedding! 🎯
