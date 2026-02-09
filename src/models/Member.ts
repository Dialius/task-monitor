/**
 * Member Model
 * Requirements: 1.6, 18.1, 18.2
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  nama: string;
  user_identifier: string;
  platform: 'discord' | 'whatsapp';
  kelas: string;
  is_active: boolean;
  created_at: Date;
}

const MemberSchema = new Schema<IMember>({
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
  kelas: {
    type: String,
    required: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index on user_identifier + platform (Requirement 15.6, 18.1, 18.2)
MemberSchema.index({ user_identifier: 1, platform: 1 }, { unique: true });

export default mongoose.model<IMember>('Member', MemberSchema);
