# 🔍 **Embeddings Debugging Guide**

## 🎯 **Issue: Embeddings Not Being Generated During Blueprint Upload**

### **✅ What We've Implemented:**

1. **Enhanced Logging**: Added comprehensive logging to blueprint upload process
2. **Test Endpoint**: Created `/api/test-embeddings` to test embedding service
3. **Environment Variables**: Added detailed environment variable logging
4. **Error Handling**: Enhanced error handling and debugging information

### **🔍 How to Debug:**

#### **Step 1: Check Environment Variables**
```bash
# Create .env.local file with:
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_BASE_URL=http://localhost:11434
EMBEDDINGS_DIMENSIONS=786
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=blueprints
```

#### **Step 2: Start Required Services**
```bash
# Start Ollama
ollama serve

# Pull the embedding model
ollama pull sentence-transformers/all-MiniLM-L6-v2

# Start Qdrant
docker run -d --name qdrant-archlens -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Start MongoDB
docker run -d --name mongodb-archlens -p 27017:27017 mongo:latest
```

#### **Step 3: Test Embedding Service**
```bash
# Test the embedding service
curl http://localhost:3000/api/test-embeddings
```

#### **Step 4: Upload a Blueprint**
1. Go to Library → Blueprints
2. Click "Upload Blueprint"
3. Fill in the form and upload a file
4. Check the console logs for embedding generation

### **📊 Expected Logs During Upload:**

```
🔄 Starting embedding generation process for blueprint: My Blueprint
📊 Embedding service available: true
🔄 Generating embedding for blueprint: My Blueprint
📝 Blueprint content for embedding: { name: 'My Blueprint', description: '...', ... }
📊 Embedding result: { success: true, vectorId: 'blueprint_1234567890' }
✅ Blueprint embedding generated and stored in Qdrant: blueprint_1234567890
```

### **🚨 Common Issues & Solutions:**

#### **Issue 1: "Embedding service not available"**
**Cause**: Environment variables not set or services not running
**Solution**: 
- Check `.env.local` file
- Start Ollama and Qdrant
- Test with `/api/test-embeddings`

#### **Issue 2: "No embeddings client available"**
**Cause**: Environment variables not configured
**Solution**:
```bash
# Add to .env.local
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_BASE_URL=http://localhost:11434
```

#### **Issue 3: "Embeddings client not available"**
**Cause**: Ollama not running or model not pulled
**Solution**:
```bash
# Start Ollama
ollama serve

# Pull the model
ollama pull sentence-transformers/all-MiniLM-L6-v2
```

#### **Issue 4: "Qdrant connection failed"**
**Cause**: Qdrant not running
**Solution**:
```bash
# Start Qdrant
docker run -d --name qdrant-archlens -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

### **🔧 Debugging Steps:**

#### **1. Check Service Status**
```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Check Qdrant
curl http://localhost:6333/collections

# Check MongoDB
mongosh --eval "db.runCommand('ping')"
```

#### **2. Test Embedding Service**
```bash
# Test the embedding service
curl http://localhost:3000/api/test-embeddings
```

#### **3. Check Console Logs**
When uploading a blueprint, look for:
- `🔄 Starting embedding generation process`
- `📊 Embedding service available: true`
- `✅ Blueprint embedding generated and stored in Qdrant`

#### **4. Check Environment Variables**
The logs will show:
```
📊 Environment variables: {
  EMBEDDINGS_PROVIDER: 'local',
  EMBEDDINGS_MODEL: 'sentence-transformers/all-MiniLM-L6-v2',
  EMBEDDINGS_BASE_URL: 'http://localhost:11434',
  EMBEDDINGS_API_KEY: 'NOT_SET',
  EMBEDDINGS_DIMENSIONS: '786'
}
```

### **🎯 Success Indicators:**

- ✅ Ollama responds to health checks
- ✅ Qdrant responds to health checks
- ✅ Test endpoint returns success
- ✅ Console logs show embedding generation
- ✅ Blueprint upload completes with embedding

### **📝 Quick Test Script:**

```bash
#!/bin/bash
echo "🔍 Testing embedding setup..."

# Test Ollama
echo "Testing Ollama..."
curl -s http://localhost:11434/api/tags > /dev/null && echo "✅ Ollama is running" || echo "❌ Ollama is not running"

# Test Qdrant
echo "Testing Qdrant..."
curl -s http://localhost:6333/collections > /dev/null && echo "✅ Qdrant is running" || echo "❌ Qdrant is not running"

# Test MongoDB
echo "Testing MongoDB..."
mongosh --eval "db.runCommand('ping')" > /dev/null && echo "✅ MongoDB is running" || echo "❌ MongoDB is not running"

# Test embedding service
echo "Testing embedding service..."
curl -s http://localhost:3000/api/test-embeddings | jq '.embeddingService.available' && echo "✅ Embedding service is available" || echo "❌ Embedding service is not available"
```

### **🚀 Next Steps:**

1. **Set up environment variables** in `.env.local`
2. **Start all required services** (Ollama, Qdrant, MongoDB)
3. **Test the embedding service** with `/api/test-embeddings`
4. **Upload a blueprint** and check console logs
5. **Verify embedding generation** in the logs

The embedding generation should now work properly with comprehensive logging to help debug any issues! 🎉
