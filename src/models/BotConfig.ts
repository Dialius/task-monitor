/**
 * BotConfig Model
 * Requirements: 14.2
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IBotConfig extends Document {
  key: string;
  value: string;
  description: string;
  updated_at: Date;
}

const BotConfigSchema = new Schema<IBotConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for unique key (Requirement 15.6)
BotConfigSchema.index({ key: 1 }, { unique: true });

// Update updated_at on save
BotConfigSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<IBotConfig>('BotConfig', BotConfigSchema);
