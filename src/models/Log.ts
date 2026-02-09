/**
 * Log Model
 * Requirements: 13.1
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  action: string;
  user_wa: string;
  details: Record<string, any>;
  status: 'success' | 'error';
  created_at: Date;
}

const LogSchema = new Schema<ILog>({
  action: {
    type: String,
    required: [true, 'Action wajib diisi'],
    trim: true,
    minlength: [2, 'Action minimal 2 karakter'],
    maxlength: [100, 'Action maksimal 100 karakter']
  },
  user_wa: {
    type: String,
    required: [true, 'User identifier wajib diisi'],
    trim: true,
    maxlength: [50, 'User identifier maksimal 50 karakter']
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: [true, 'Status wajib diisi'],
    enum: {
      values: ['success', 'error'],
      message: 'Status harus success atau error'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for created_at (Requirement 15.6)
LogSchema.index({ created_at: -1 });
LogSchema.index({ action: 1 });
LogSchema.index({ status: 1 });

export default mongoose.model<ILog>('Log', LogSchema);
