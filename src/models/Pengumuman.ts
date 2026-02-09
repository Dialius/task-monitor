/**
 * Pengumuman Model
 * Requirements: 5.1
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPengumuman extends Document {
  tanggal: Date;
  judul: string;
  keterangan: string;
  tipe: 'acara' | 'perubahan_jadwal' | 'praktikum' | 'lainnya';
  is_active: boolean;
  created_at: Date;
}

const PengumumanSchema = new Schema<IPengumuman>({
  tanggal: {
    type: Date,
    required: true
  },
  judul: {
    type: String,
    required: true,
    trim: true
  },
  keterangan: {
    type: String,
    required: true
  },
  tipe: {
    type: String,
    required: true,
    enum: ['acara', 'perubahan_jadwal', 'praktikum', 'lainnya']
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

// Index for tanggal (Requirement 15.6)
PengumumanSchema.index({ tanggal: 1 });

export default mongoose.model<IPengumuman>('Pengumuman', PengumumanSchema);
