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
    required: [true, 'Config key wajib diisi'],
    // unique: true removed - defined in index below to avoid duplicate
    trim: true,
    minlength: [2, 'Config key minimal 2 karakter'],
    maxlength: [100, 'Config key maksimal 100 karakter'],
    validate: {
      validator: function(v: string) {
        // Key must be lowercase with underscores only
        return /^[a-z0-9_]+$/.test(v);
      },
      message: 'Config key harus lowercase dengan underscore (contoh: daily_reminder_time)'
    }
  },
  value: {
    type: String,
    required: [true, 'Config value wajib diisi'],
    maxlength: [500, 'Config value maksimal 500 karakter']
  },
  description: {
    type: String,
    default: '',
    maxlength: [200, 'Description maksimal 200 karakter']
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
  
  // Normalize key: lowercase
  if (this.key) {
    this.key = this.key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }
  
  next();
});

export default mongoose.model<IBotConfig>('BotConfig', BotConfigSchema);
