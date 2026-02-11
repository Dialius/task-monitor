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
    required: [true, 'Nama admin wajib diisi'],
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
        // Validate based on platform
        const admin = this as IAdmin;
        if (admin.platform === 'whatsapp') {
          // WhatsApp: must be phone number format (e.g., 628123456789)
          return /^[0-9]{10,15}$/.test(v);
        } else if (admin.platform === 'discord') {
          // Discord: must be snowflake ID (numeric string)
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
  role: {
    type: String,
    required: [true, 'Role wajib dipilih'],
    enum: {
      values: ['ketua', 'wakil', 'koordinator'],
      message: 'Role harus ketua, wakil, atau koordinator'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index on user_identifier + platform (Requirement 15.6, 18.1)
AdminSchema.index({ user_identifier: 1, platform: 1 }, { unique: true });

// Pre-save hook for data normalization
AdminSchema.pre('save', function(next) {
  // Normalize nama: capitalize first letter of each word
  if (this.nama) {
    this.nama = this.nama
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Normalize user_identifier: remove spaces and special chars
  if (this.user_identifier) {
    this.user_identifier = this.user_identifier.replace(/[^0-9]/g, '');
  }
  
  next();
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
