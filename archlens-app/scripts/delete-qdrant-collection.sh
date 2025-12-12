#!/bin/bash

# Script to delete Qdrant collection
# Usage: ./scripts/delete-qdrant-collection.sh [collection-name]

QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
COLLECTION_NAME="${1:-${QDRANT_COLLECTION_NAME:-blueprints}}"

echo "🗑️  Deleting Qdrant collection: ${COLLECTION_NAME}"
echo "📍 Qdrant URL: ${QDRANT_URL}"

# Delete the collection
curl -X DELETE "${QDRANT_URL}/collections/${COLLECTION_NAME}"

echo ""
echo "✅ Collection '${COLLECTION_NAME}' deleted (if it existed)"
echo "🔄 Restart your application to recreate the collection with correct dimensions"

