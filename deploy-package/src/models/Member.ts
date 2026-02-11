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
    required: [true, 'Nama member wajib diisi'],
    trim: true,
    minlength: [2, 'Nama minimal 2 karakter'],
    maxlength: [100, 'Nama maksimal 100 karakter']
  },
  user_identifier: {
    type: String,
    required: [true, 'User identifier wajib diisi'],
    trim: true,
    validate: {
      validator: function(v: string) {
        const member = this as IMember;
        if (member.platform === 'whatsapp') {
          return /^[0-9]{10,15}$/.test(v);
        } else if (member.platform === 'discord') {
          return /^[0-9]{17,19}$/.test(v);
        }
        return true;
      },
      message: 'Format user identifier tidak valid untuk platform yang dipilih'
    }
  },
  platform: {
    type: String,
    required: [true, 'Platform wajib dipilih'],
    enum: {
      values: ['discord', 'whatsapp'],
      message: 'Platform harus discord atau whatsapp'
    }
  },
  kelas: {
    type: String,
    required: [true, 'Kelas wajib diisi'],
    trim: true,
    maxlength: [50, 'Kelas maksimal 50 karakter']
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

// Pre-save hook for data normalization
MemberSchema.pre('save', function(next) {
  // Normalize nama
  if (this.nama) {
    this.nama = this.nama
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Normalize user_identifier
  if (this.user_identifier) {
    this.user_identifier = this.user_identifier.replace(/[^0-9]/g, '');
  }
  
  next();
});

export default mongoose.model<IMember>('Member', MemberSchema);
