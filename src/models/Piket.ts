/**
 * Piket Model
 * Requirements: 4.1
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPiket extends Document {
  hari: string;
  nama_siswa: string[];
  nomor_wa: string[];
  created_at: Date;
  updated_at: Date;
}

const PiketSchema = new Schema<IPiket>({
  hari: {
    type: String,
    required: [true, 'Hari wajib dipilih'],
    // unique: true removed - defined in index below to avoid duplicate
    trim: true,
    enum: {
      values: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      message: 'Hari harus Senin, Selasa, Rabu, Kamis, Jumat, atau Sabtu'
    }
  },
  nama_siswa: {
    type: [String],
    required: [true, 'Nama siswa wajib diisi'],
    default: [],
    validate: {
      validator: function(v: string[]) {
        // Must have at least 1 student
        if (v.length === 0) {
          return false;
        }
        // Each name must be at least 2 characters
        return v.every(name => name.trim().length >= 2);
      },
      message: 'Minimal 1 siswa dan setiap nama minimal 2 karakter'
    }
  },
  nomor_wa: {
    type: [String],
    required: [true, 'Nomor WhatsApp wajib diisi'],
    default: [],
    validate: [
      {
        validator: function(v: string[]) {
          // Array length must match nama_siswa length
          const piket = this as IPiket;
          return v.length === piket.nama_siswa.length;
        },
        message: 'Jumlah nomor WhatsApp harus sama dengan jumlah nama siswa'
      },
      {
        validator: function(v: string[]) {
          // Each phone number must be valid format
          return v.every(phone => /^[0-9]{10,15}$/.test(phone));
        },
        message: 'Format nomor WhatsApp tidak valid (harus 10-15 digit angka)'
      }
    ]
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for unique hari (Requirement 15.6)
PiketSchema.index({ hari: 1 }, { unique: true });

// Update updated_at on save
PiketSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Normalize nama_siswa: capitalize first letter
  if (this.nama_siswa && this.nama_siswa.length > 0) {
    this.nama_siswa = this.nama_siswa.map(nama => 
      nama.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    );
  }
  
  // Normalize nomor_wa: remove non-digits
  if (this.nomor_wa && this.nomor_wa.length > 0) {
    this.nomor_wa = this.nomor_wa.map(nomor => nomor.replace(/[^0-9]/g, ''));
  }
  
  next();
});

export default mongoose.model<IPiket>('Piket', PiketSchema);
