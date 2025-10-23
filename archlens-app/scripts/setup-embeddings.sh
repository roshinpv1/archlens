#!/bin/bash

# Blueprint Embeddings Setup Script
# This script helps set up the embeddings system for CloudArch

echo "🚀 Setting up Blueprint Embeddings System for CloudArch"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Ollama. Please install manually."
        echo "   Visit: https://ollama.ai/"
        exit 1
    fi
else
    echo "✅ Ollama is already installed"
fi

# Start Ollama service
echo "🔄 Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 5

# Pull the embedding model
echo "📥 Pulling embedding model..."
ollama pull sentence-transformers/all-MiniLM-L6-v2

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull embedding model"
    kill $OLLAMA_PID 2>/dev/null
    exit 1
fi

echo "✅ Embedding model pulled successfully"

# Start Qdrant
echo "🔄 Starting Qdrant vector database..."
docker run -d --name qdrant-archlens -p 6333:6333 -p 6334:6334 qdrant/qdrant

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Qdrant. Make sure Docker is running."
    kill $OLLAMA_PID 2>/dev/null
    exit 1
fi

echo "✅ Qdrant started successfully"

# Wait for Qdrant to be ready
echo "⏳ Waiting for Qdrant to be ready..."
sleep 10

# Test Qdrant connection
curl -s http://localhost:6333/collections > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Qdrant is ready"
else
    echo "❌ Qdrant is not responding"
    kill $OLLAMA_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "✅ Ollama is running (PID: $OLLAMA_PID)"
echo "✅ Qdrant is running on http://localhost:6333"
echo "✅ Embedding model: sentence-transformers/all-MiniLM-L6-v2"
echo ""
echo "🚀 Next steps:"
echo "1. Run 'npm run dev' to start the application"
echo "2. Upload blueprints to test embedding generation"
echo "3. Run analyses to test similarity matching"
echo ""
echo "📚 For more information, see: EMBEDDINGS_SETUP.md"
echo ""
echo "🛑 To stop services:"
echo "   kill $OLLAMA_PID"
echo "   docker stop qdrant-archlens"
echo "   docker rm qdrant-archlens"
