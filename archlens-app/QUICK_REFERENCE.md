# ArchLens - Quick Reference Guide

## 🚀 Quick Start

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start services
npm run dev
```

### Required Services

- **MongoDB**: `mongodb://localhost:27017/CloudArc`
- **Qdrant**: `http://localhost:6333` (or embedded)
- **Ollama** (optional): `http://localhost:1234` (for local LLM/embeddings)

---

## 📋 Key API Endpoints

### Architecture Analysis
- `POST /api/analyze` - Analyze architecture file

### Blueprint Management
- `GET /api/blueprints` - List blueprints
- `POST /api/blueprints` - Upload blueprint
- `GET /api/blueprints/[id]` - Get blueprint
- `PUT /api/blueprints/[id]` - Update blueprint
- `DELETE /api/blueprints/[id]` - Delete blueprint
- `GET /api/blueprints/[id]/analyze` - Get analysis
- `POST /api/blueprints/[id]/analyze` - Run analysis

### AI Search
- `POST /api/blueprints/[id]/query` - Query specific blueprint
- `POST /api/blueprints/query` - Search all blueprints

### Similarity Search
- `POST /api/blueprints/similarity-search` - Find similar blueprints

---

## 🔧 Configuration Quick Reference

### Minimum Required Variables

```bash
# LLM
LLM_PROVIDER=local
LOCAL_LLM_URL=http://localhost:1234
LOCAL_LLM_MODEL=gemma3:27b

# Embeddings
EMBEDDINGS_PROVIDER=local
EMBEDDINGS_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDINGS_BASE_URL=http://localhost:1234
EMBEDDINGS_DIMENSIONS=1024

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_VECTOR_SIZE=1024
QDRANT_AUTO_FIX_DIMENSIONS=true

# MongoDB
MONGODB_URI=mongodb://localhost:27017/CloudArc
```

---

## 📊 Data Flow Summary

### Blueprint Upload
```
File → Extract Components → Store Metadata (MongoDB) 
     → Generate Embedding → Store in Qdrant
     → Run Analysis → Store Analysis (MongoDB)
     → Generate Analysis Embedding → Store in Qdrant
```

### Architecture Analysis
```
File → Extract Components → Analyze → Generate Embedding
     → Find Similar Blueprints (Qdrant) → Store (MongoDB)
```

### AI Search
```
Query → Generate Embedding → Search Qdrant → Fetch Data (MongoDB)
     → Build Context → LLM Processing → Return Answer
```

---

## 🎯 Component Types (36 Total)

**Core**: database, api, service, storage, network, security, monitoring  
**Infrastructure**: cache, queue, gateway, compute, load-balancer, cdn, firewall, vpn, dns  
**Identity**: identity, authentication, authorization  
**Operations**: logging, analytics, messaging, event-bus, workflow, scheduler  
**DevOps**: container, orchestration, registry, build, deployment, testing  
**Other**: user, backup, documentation, utility, other

---

## 🔍 Similarity Search

- **Metric**: Cosine Similarity
- **Default Threshold**: 0.7
- **Default Limit**: 2 (top matches)
- **Search Types**: blueprint, blueprint_analysis

---

## 📝 Common Tasks

### Upload Blueprint
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('name', 'My Blueprint');
formData.append('description', 'Description');
formData.append('type', 'architecture');
formData.append('category', 'Web Development');

const response = await fetch('/api/blueprints', {
  method: 'POST',
  body: formData
});
```

### Query Blueprint
```typescript
const response = await fetch(`/api/blueprints/${blueprintId}/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'What are the security recommendations?' })
});
```

### Analyze Architecture
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('appId', 'app-123');
formData.append('componentName', 'My App');
formData.append('description', 'Description');
formData.append('environment', 'production');
formData.append('version', '1.0.0');

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
```

---

## 🐛 Troubleshooting

### Qdrant Dimension Mismatch
```bash
# Set auto-fix
QDRANT_AUTO_FIX_DIMENSIONS=true

# Or manually delete collection
curl -X DELETE http://localhost:6333/collections/blueprints
```

### Embedding Service Not Available
- Check `EMBEDDINGS_PROVIDER` and `EMBEDDINGS_BASE_URL`
- Verify Ollama is running (if using local)
- Check model name matches installed model

### LLM Not Responding
- Verify `LLM_PROVIDER` is set correctly
- Check API keys (if using cloud providers)
- Verify local LLM is running (if using local)

### Analysis Validation Errors
- Check component types match enum values
- Verify all required fields are present
- Check enum values in `BlueprintAnalysis.ts`

---

## 📚 File Structure

```
archlens-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts          # Architecture analysis
│   │   │   ├── blueprints/
│   │   │   │   ├── route.ts              # Blueprint CRUD
│   │   │   │   ├── [id]/route.ts         # Blueprint operations
│   │   │   │   ├── [id]/query/route.ts   # Blueprint AI search
│   │   │   │   └── query/route.ts        # General blueprint search
│   │   │   └── ...
│   │   ├── library/page.tsx              # Blueprint library page
│   │   └── ...
│   ├── components/
│   │   ├── BlueprintViewer.tsx           # Blueprint viewer modal
│   │   ├── BlueprintManager.tsx         # Blueprint management
│   │   └── ...
│   ├── services/
│   │   ├── embeddingService.ts           # Embedding generation
│   │   ├── similarityService.ts          # Similarity search
│   │   ├── blueprintAnalysisService.ts    # Blueprint analysis
│   │   └── ...
│   ├── lib/
│   │   ├── qdrant-client.ts              # Qdrant client
│   │   ├── embeddings-client.ts          # Embeddings client
│   │   ├── llm-client.ts                 # LLM client
│   │   └── ...
│   ├── models/
│   │   ├── Blueprint.ts                  # Blueprint model
│   │   ├── BlueprintAnalysis.ts          # Analysis model
│   │   └── ...
│   └── types/
│       ├── blueprint.ts                   # Blueprint types
│       └── ...
└── ...
```

---

## 🎨 UI Components

### BlueprintViewer
- **Tabs**: Details, Analysis, AI Search, Preview, Versions
- **Features**: Full blueprint information, analysis display, AI search

### BlueprintManager
- **Features**: List, upload, edit, delete blueprints
- **Actions**: View, edit, delete, download, rate, analyze

### AnalysisResults
- **Features**: Display analysis scores, risks, recommendations
- **Includes**: Blueprint insights, similar blueprints

---

## 🔄 Workflow Examples

### Complete Blueprint Workflow
1. User uploads blueprint → Component extraction
2. Embedding generated → Stored in Qdrant
3. Analysis performed → Stored in MongoDB
4. Analysis embedding generated → Stored in Qdrant
5. User views blueprint → All data displayed
6. User queries blueprint → AI search returns answer

### Architecture Analysis Workflow
1. User uploads architecture → Component extraction
2. Comprehensive analysis → Scores calculated
3. Similarity search → Finds similar blueprints
4. Blueprint insights generated → Displayed in results
5. Analysis stored → Available for future reference

---

**For detailed documentation, see `ARCHLENS_DOCUMENTATION.md`**

