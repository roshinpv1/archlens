import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChecklistItem extends Document {
  _id: string;
  category: string;
  item: string;
  description: string;
  recommendedAction: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>({
  category: { type: String, required: true, index: true },
  item: { type: String, required: true },
  description: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  owner: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    required: true,
    default: 'Medium'
  },
  enabled: { type: Boolean, default: true, index: true }
}, {
  timestamps: true,
  collection: 'checklist_items'
});

// Create indexes for better query performance
ChecklistItemSchema.index({ category: 1, enabled: 1 });
ChecklistItemSchema.index({ priority: 1, enabled: 1 });
ChecklistItemSchema.index({ owner: 1 });

// Export the model
let ChecklistItem: Model<IChecklistItem>;

try {
  ChecklistItem = mongoose.model<IChecklistItem>('ChecklistItem');
} catch {
  ChecklistItem = mongoose.model<IChecklistItem>('ChecklistItem', ChecklistItemSchema);
}

export default ChecklistItem;
