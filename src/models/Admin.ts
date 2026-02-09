/**
 * Admin Model
 * Requirements: 1.5, 18.1, 18.2
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  nama: string;
  user_identifier: string;
  platform: 'discord' | 'whatsapp';
  role: 'ketua' | 'wakil' | 'koordinator';
  created_at: Date;
}

const AdminSchema = new Schema<IAdmin>({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  user_identifier: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['discord', 'whatsapp']
  },
  role: {
    type: String,
    required: true,
    enum: ['ketua', 'wakil', 'koordinator']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index on user_identifier + platform (Requirement 15.6, 18.1)
AdminSchema.index({ user_identifier: 1, platform: 1 }, { unique: true });

export default mongoose.model<IAdmin>('Admin', AdminSchema);
