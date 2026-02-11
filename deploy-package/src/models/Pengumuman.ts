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
    required: [true, 'Tanggal pengumuman wajib diisi']
  },
  judul: {
    type: String,
    required: [true, 'Judul pengumuman wajib diisi'],
    trim: true,
    minlength: [3, 'Judul minimal 3 karakter'],
    maxlength: [200, 'Judul maksimal 200 karakter']
  },
  keterangan: {
    type: String,
    required: [true, 'Keterangan pengumuman wajib diisi'],
    minlength: [5, 'Keterangan minimal 5 karakter'],
    maxlength: [2000, 'Keterangan maksimal 2000 karakter']
  },
  tipe: {
    type: String,
    required: [true, 'Tipe pengumuman wajib dipilih'],
    enum: {
      values: ['acara', 'perubahan_jadwal', 'praktikum', 'lainnya'],
      message: 'Tipe harus acara, perubahan_jadwal, praktikum, atau lainnya'
    }
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

// Pre-save hook for data normalization
PengumumanSchema.pre('save', function(next) {
  // Normalize judul: capitalize first letter
  if (this.judul) {
    this.judul = this.judul.charAt(0).toUpperCase() + this.judul.slice(1);
  }
  
  next();
});

export default mongoose.model<IPengumuman>('Pengumuman', PengumumanSchema);
