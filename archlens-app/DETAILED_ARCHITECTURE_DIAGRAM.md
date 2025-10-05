# CloudArch - Detailed Architecture Diagram
## Frontend & Backend Separation

---

## 🎨 Frontend Architecture (Next.js 15)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js 15 App Router                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Pages         │  │   Components    │  │   Services      │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • / (Dashboard) │  │ • Header.tsx    │  │ • API Client    │        │   │
│  │  │ • /analyses     │  │ • AnalysisResults│  │ • State Mgmt    │        │   │
│  │  │ • /configuration│  │ • BlueprintMgr  │  │ • File Upload   │        │   │
│  │  │ • /api/*        │  │ • ConfigMgr     │  │ • Image Opt.    │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        React Components Layer                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   UI Components │  │   Modals        │  │   Forms         │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • Button        │  │ • Evaluation    │  │ • File Upload   │        │   │
│  │  │ • Card          │  │   Modal         │  │ • Blueprint     │        │   │
│  │  │ • Table         │  │ • File Preview  │  │   Upload        │        │   │
│  │  │ • Badge         │  │ • Blueprint     │  │ • Configuration │        │   │
│  │  │ • Progress      │  │   Upload        │  │   Forms         │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        State Management                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   React State   │  │   Context API   │  │   Local Storage │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • useState      │  │ • Theme Context │  │ • User Prefs    │        │   │
│  │  │ • useEffect     │  │ • Auth Context  │  │ • Cache Data    │        │   │
│  │  │ • useReducer    │  │ • Config Context│  │ • Session Data  │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Client-Side Services                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   File Handling │  │   Image         │  │   API           │        │   │
│  │  │                 │  │   Processing    │  │   Communication │        │   │
│  │  │ • File Upload   │  │ • Preview       │  │ • HTTP Client   │        │   │
│  │  │ • Validation    │  │ • Compression   │  │ • Error Handling│        │   │
│  │  │ • Type Checking │  │ • Base64 Encode │  │ • Response      │        │   │
│  │  │ • Progress      │  │ • Format        │  │   Processing    │        │   │
│  │  │   Tracking      │  │   Conversion    │  │ • Retry Logic   │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Backend Architecture (Node.js/Next.js API)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        API Gateway Layer                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Route         │  │   Middleware    │  │   Authentication│        │   │
│  │  │   Handlers      │  │                 │  │                 │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • /api/analyze  │  │ • CORS          │  │ • JWT Validation│        │   │
│  │  │ • /api/analysis │  │ • Rate Limiting │  │ • Role Checking │        │   │
│  │  │ • /api/blueprint│  │ • Request       │  │ • Permission    │        │   │
│  │  │ • /api/config   │  │   Validation    │  │   Validation    │        │   │
│  │  │ • /api/dashboard│  │ • Error         │  │ • Audit Logging │        │   │
│  │  │                 │  │   Handling      │  │                 │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Business Logic Layer                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Analysis      │  │   Blueprint     │  │   Configuration │        │   │
│  │  │   Engine        │  │   Management    │  │   Management    │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • Two-Stage     │  │ • CRUD          │  │ • Checklist     │        │   │
│  │  │   Processing    │  │   Operations    │  │   Management    │        │   │
│  │  │ • Component     │  │ • File Upload   │  │ • User          │        │   │
│  │  │   Extraction    │  │ • Validation    │  │   Management    │        │   │
│  │  │ • Deep Analysis │  │ • Search/Filter │  │ • Security      │        │   │
│  │  │ • Result        │  │ • Version       │  │   Policies      │        │   │
│  │  │   Generation    │  │   Control       │  │ • Notifications │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        LLM Integration Layer                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   LLM Client    │  │   Token         │  │   Response      │        │   │
│  │  │   Factory       │  │   Management    │  │   Processing    │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • Provider      │  │ • OAuth 2.0     │  │ • JSON Parsing  │        │   │
│  │  │   Selection     │  │ • Token Caching │  │ • Validation    │        │   │
│  │  │ • Configuration │  │ • Refresh       │  │ • Error         │        │   │
│  │  │ • Fallback      │  │ • Enterprise    │  │   Handling      │        │   │
│  │  │   Logic         │  │   Headers       │  │ • Data          │        │   │
│  │  │                 │  │                 │  │   Sanitization  │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Data Processing Layer                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Image         │  │   File          │  │   Data          │        │   │
│  │  │   Processing    │  │   Processing    │  │   Validation    │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • Sharp.js      │  │ • IaC Parsing   │  │ • Schema        │        │   │
│  │  │ • Compression   │  │ • Format        │  │   Validation    │        │   │
│  │  │ • Resizing      │  │   Detection     │  │ • Type          │        │   │
│  │  │ • Base64        │  │ • Content       │  │   Checking      │        │   │
│  │  │   Encoding      │  │   Extraction    │  │ • Sanitization  │        │   │
│  │  │ • Format        │  │ • Metadata      │  │ • Transformation│        │   │
│  │  │   Conversion    │  │   Extraction    │  │                 │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Data Access Layer                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Database      │  │   File Storage  │  │   Cache Layer   │        │   │
│  │  │   Services      │  │   Services      │  │                 │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • MongoDB       │  │ • Base64        │  │ • Redis         │        │   │
│  │  │   Operations    │  │   Storage       │  │   (Future)      │        │   │
│  │  │ • Mongoose      │  │ • File          │  │ • Memory        │        │   │
│  │  │   ODM           │  │   Metadata      │  │   Cache         │        │   │
│  │  │ • Aggregation   │  │ • Versioning    │  │ • Session       │        │   │
│  │  │ • Indexing      │  │ • Compression   │  │   Storage       │        │   │
│  │  │ • Transactions  │  │ • Access        │  │ • API           │        │   │
│  │  │                 │  │   Control       │  │   Response      │        │   │
│  │  │                 │  │                 │  │   Cache         │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Frontend-Backend Communication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND ↔ BACKEND COMMUNICATION                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Frontend (Next.js)                    Backend (API Routes)                    │
│  ┌─────────────────┐                  ┌─────────────────┐                      │
│  │   User Action   │                  │   API Endpoint  │                      │
│  │                 │                  │                 │                      │
│  │ • File Upload   │ ────────────────►│ • /api/analyze  │                      │
│  │ • View Analysis │ ────────────────►│ • /api/analysis │                      │
│  │ • Manage Config │ ────────────────►│ • /api/config   │                      │
│  │ • Blueprint Ops │ ────────────────►│ • /api/blueprint│                      │
│  └─────────────────┘                  └─────────────────┘                      │
│           │                                       │                            │
│           │                                       ▼                            │
│  ┌─────────────────┐                  ┌─────────────────┐                      │
│  │   State Update  │                  │   Business      │                      │
│  │                 │                  │   Logic         │                      │
│  │ • Loading State │◄─────────────────│ • Validation    │                      │
│  │ • Success State │                  │ • Processing    │                      │
│  │ • Error State   │                  │ • LLM Calls     │                      │
│  │ • Data Update   │                  │ • DB Operations │                      │
│  └─────────────────┘                  └─────────────────┘                      │
│           │                                       │                            │
│           │                                       ▼                            │
│  ┌─────────────────┐                  ┌─────────────────┐                      │
│  │   UI Update     │                  │   Response      │                      │
│  │                 │                  │   Generation    │                      │
│  │ • Component     │◄─────────────────│ • JSON Response │                      │
│  │   Re-render     │                  │ • Error Codes   │                      │
│  │ • Modal Close   │                  │ • Status Codes  │                      │
│  │ • Navigation    │                  │ • Data Format   │                      │
│  └─────────────────┘                  └─────────────────┘                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Frontend      │    │   Backend       │    │   External      │            │
│  │   Data Layer    │    │   Data Layer    │    │   Services      │            │
│  │                 │    │                 │    │                 │            │
│  │ • Form Data     │    │ • Request       │    │ • LLM APIs      │            │
│  │ • File Upload   │    │   Processing    │    │ • OpenAI        │            │
│  │ • User Input    │    │ • Image         │    │ • Anthropic     │            │
│  │ • State Mgmt    │    │   Processing    │    │ • Local LLM     │            │
│  │                 │    │ • LLM           │    │ • Apigee        │            │
│  │                 │    │   Integration   │    │                 │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           │                       │                       │                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Client-Side   │    │   Server-Side   │    │   Data          │            │
│  │   Processing    │    │   Processing    │    │   Storage       │            │
│  │                 │    │                 │    │                 │            │
│  │ • Validation    │    │ • Business      │    │ • MongoDB       │            │
│  │ • Formatting    │    │   Logic         │    │ • File System   │            │
│  │ • Error         │    │ • Data          │    │ • Base64        │            │
│  │   Handling      │    │   Transformation│    │   Storage       │            │
│  │ • User          │    │ • Response      │    │ • Metadata      │            │
│  │   Feedback      │    │   Generation    │    │   Storage       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT INTERACTIONS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Frontend Components                Backend Services                           │
│  ┌─────────────────┐               ┌─────────────────┐                        │
│  │   Dashboard     │               │   Analysis      │                        │
│  │   Component     │◄─────────────►│   Service       │                        │
│  │                 │               │                 │                        │
│  │ • Display Stats │               │ • Save Analysis │                        │
│  │ • Show Recent   │               │ • Get Stats     │                        │
│  │   Analyses      │               │ • Dashboard     │                        │
│  │ • Quick Actions │               │   Data          │                        │
│  └─────────────────┘               └─────────────────┘                        │
│           │                                       │                            │
│  ┌─────────────────┐               ┌─────────────────┐                        │
│  │   Analysis      │               │   LLM           │                        │
│  │   Results       │◄─────────────►│   Client        │                        │
│  │   Component     │               │                 │                        │
│  │                 │               │ • Two-Stage     │                        │
│  │ • Display       │               │   Processing    │                        │
│  │   Results       │               │ • Provider      │                        │
│  │ • Risk          │               │   Selection     │                        │
│  │   Assessment    │               │ • Token Mgmt    │                        │
│  │ • Recommendations│              │ • Response      │                        │
│  │                 │               │   Processing    │                        │
│  └─────────────────┘               └─────────────────┘                        │
│           │                                       │                            │
│  ┌─────────────────┐               ┌─────────────────┐                        │
│  │   Blueprint     │               │   Blueprint     │                        │
│  │   Manager       │◄─────────────►│   Service       │                        │
│  │                 │               │                 │                        │
│  │ • List          │               │ • CRUD          │                        │
│  │   Blueprints    │               │   Operations    │                        │
│  │ • Upload        │               │ • File          │                        │
│  │   Management    │               │   Processing    │                        │
│  │ • Search/Filter │               │ • Validation    │                        │
│  │                 │               │ • Storage       │                        │
│  └─────────────────┘               └─────────────────┘                        │
│           │                                       │                            │
│  ┌─────────────────┐               ┌─────────────────┐                        │
│  │   Configuration │               │   Configuration │                        │
│  │   Manager       │◄─────────────►│   Service       │                        │
│  │                 │               │                 │                        │
│  │ • Checklist     │               │ • Checklist     │                        │
│  │   Management    │               │   CRUD          │                        │
│  │ • User          │               │ • User          │                        │
│  │   Management    │               │   Management    │                        │
│  │ • Security      │               │ • Security      │                        │
│  │   Policies      │               │   Policies      │                        │
│  │ • Notifications │               │ • Notifications │                        │
│  │                 │               │ • Database      │                        │
│  │                 │               │   Config        │                        │
│  └─────────────────┘               └─────────────────┘                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DEPLOYMENT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend Deployment                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   CDN           │  │   Static        │  │   Build         │        │   │
│  │  │   (CloudFlare)  │  │   Assets        │  │   Process       │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • Global Cache  │  │ • JavaScript    │  │ • Next.js       │        │   │
│  │  │ • DDoS          │  │   Bundles       │  │   Build         │        │   │
│  │  │   Protection    │  │ • CSS Files     │  │ • TypeScript    │        │   │
│  │  │ • Edge          │  │ • Images        │  │   Compilation   │        │   │
│  │  │   Computing     │  │ • Fonts         │  │ • Asset         │        │   │
│  │  │ • SSL/TLS       │  │ • Icons         │  │   Optimization  │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Backend Deployment                              │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   Load Balancer │  │   Application   │  │   Database      │        │   │
│  │  │   (NGINX)       │  │   Servers       │  │   Cluster       │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • SSL/TLS       │  │ • Node.js       │  │ • MongoDB       │        │   │
│  │  │ • Rate Limiting │  │   Processes     │  │   Replica Set   │        │   │
│  │  │ • Health Checks │  │ • Auto Scaling  │  │ • Sharding      │        │   │
│  │  │ • Failover      │  │ • Load          │  │ • Backup        │        │   │
│  │  │ • Caching       │  │   Distribution  │  │ • Recovery      │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        External Services                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │   LLM           │  │   File Storage  │  │   Monitoring    │        │   │
│  │  │   Providers     │  │   (S3/MinIO)   │  │   & Logging     │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • OpenAI        │  │ • Images        │  │ • Prometheus    │        │   │
│  │  │ • Anthropic     │  │ • Files         │  │ • Grafana       │        │   │
│  │  │ • Local LLM     │  │ • Backups       │  │ • ELK Stack     │        │   │
│  │  │ • Apigee        │  │ • Versioning    │  │ • Alerting      │        │   │
│  │  │ • Enterprise    │  │ • Encryption    │  │ • Metrics       │        │   │
│  │  │   APIs          │  │ • Access        │  │ • Dashboards    │        │   │
│  │  │                 │  │   Control       │  │                 │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

This detailed architecture diagram shows the clear separation between frontend and backend components, their internal structure, communication patterns, and deployment architecture. Each layer has specific responsibilities and well-defined interfaces for interaction.
