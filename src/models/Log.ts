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
    required: true,
    trim: true
  },
  user_wa: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'error']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for created_at (Requirement 15.6)
LogSchema.index({ created_at: -1 });

export default mongoose.model<ILog>('Log', LogSchema);
