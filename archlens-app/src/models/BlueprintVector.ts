/**
 * Blueprint Vector Model for MongoDB
 * Stores metadata about blueprint vectors stored in Qdrant
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IBlueprintVector extends Document {
  blueprintId: string;
  vectorId: string;
  embeddingModel: string;
  vectorDimensions: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    name: string;
    type: string;
    category: string;
    cloudProvider: string;
    complexity: string;
    tags: string[];
    content: string;
  };
}

const BlueprintVectorSchema = new Schema<IBlueprintVector>({
  blueprintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vectorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  embeddingModel: {
    type: String,
    required: true,
    default: 'sentence-transformers/all-MiniLM-L6-v2'
  },
  vectorDimensions: {
    type: Number,
    required: true,
    default: 786
  },
  metadata: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    cloudProvider: {
      type: String,
      required: true
    },
    complexity: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }],
    content: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
BlueprintVectorSchema.index({ blueprintId: 1 });
BlueprintVectorSchema.index({ vectorId: 1 });
BlueprintVectorSchema.index({ 'metadata.type': 1 });
BlueprintVectorSchema.index({ 'metadata.category': 1 });
BlueprintVectorSchema.index({ 'metadata.cloudProvider': 1 });
BlueprintVectorSchema.index({ 'metadata.complexity': 1 });
BlueprintVectorSchema.index({ 'metadata.tags': 1 });
BlueprintVectorSchema.index({ createdAt: -1 });

// Ensure the model is only created once
const BlueprintVector = mongoose.models.BlueprintVector || mongoose.model<IBlueprintVector>('BlueprintVector', BlueprintVectorSchema);

export default BlueprintVector;
