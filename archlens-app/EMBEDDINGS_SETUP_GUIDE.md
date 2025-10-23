# 🔧 **Embeddings Setup Guide**

## 📋 **Required Environment Variables**

Create a `.env.local` file in your project root with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/archlens
MONGODB_DB_NAME=archlens

# Embeddings Configuration
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_BASE_URL=http://localhost:11434
EMBEDDINGS_API_KEY=
EMBEDDINGS_DIMENSIONS=786

# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=blueprints

# Similarity Search Configuration
SIMILARITY_THRESHOLD=0.7
SIMILARITY_LIMIT=2

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_BASE_URL=http://localhost:11434

# File Storage (for production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 **Setup Steps**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Ollama (for local embeddings)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull the embedding model
ollama pull sentence-transformers/all-MiniLM-L6-v2
```

### **3. Start Qdrant (for vector storage)**
```bash
# Using Docker
docker run -d --name qdrant-archlens -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Or using Docker Compose
docker-compose up -d qdrant
```

### **4. Start MongoDB**
```bash
# Using Docker
docker run -d --name mongodb-archlens -p 27017:27017 mongo:latest

# Or using local installation
mongod
```

### **5. Test the Setup**
```bash
# Test embeddings service
curl http://localhost:3000/api/test-embeddings

# Test blueprint upload
# Upload a blueprint through the UI and check console logs
```

## 🔍 **Troubleshooting**

### **Embeddings Not Working?**
1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. Check if the model is pulled: `ollama list`
3. Check environment variables in `.env.local`
4. Check the test endpoint: `curl http://localhost:3000/api/test-embeddings`

### **Qdrant Not Working?**
1. Check if Qdrant is running: `curl http://localhost:6333/collections`
2. Check if the collection exists: `curl http://localhost:6333/collections/blueprints`

### **MongoDB Not Working?**
1. Check if MongoDB is running: `mongosh --eval "db.runCommand('ping')"`
2. Check the connection string in `.env.local`

## 📊 **Expected Logs**

When uploading a blueprint, you should see:

```
🔄 Starting embedding generation process for blueprint: My Blueprint
📊 Embedding service available: true
🔄 Generating embedding for blueprint: My Blueprint
📝 Blueprint content for embedding: { name: 'My Blueprint', description: '...', ... }
📊 Embedding result: { success: true, vectorId: 'blueprint_1234567890' }
✅ Blueprint embedding generated and stored in Qdrant: blueprint_1234567890
```

## 🎯 **Quick Test**

1. Start all services (Ollama, Qdrant, MongoDB)
2. Set environment variables
3. Start the application: `npm run dev`
4. Test embeddings: `curl http://localhost:3000/api/test-embeddings`
5. Upload a blueprint through the UI
6. Check console logs for embedding generation

## 🚨 **Common Issues**

### **"Embedding service not available"**
- Check if Ollama is running
- Check if the model is pulled
- Check environment variables

### **"Qdrant connection failed"**
- Check if Qdrant is running
- Check QDRANT_URL environment variable

### **"MongoDB connection failed"**
- Check if MongoDB is running
- Check MONGODB_URI environment variable

## ✅ **Success Indicators**

- ✅ Ollama responds to health checks
- ✅ Qdrant responds to health checks
- ✅ MongoDB responds to health checks
- ✅ Test endpoint returns success
- ✅ Blueprint upload generates embeddings
- ✅ Console logs show embedding generation
