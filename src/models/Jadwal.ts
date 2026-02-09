/**
 * Jadwal (Schedule) Model
 * Requirements: 3.1
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IJadwal extends Document {
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jam_mulai: string;
  jam_selesai: string;
  mata_pelajaran: string;
  ruangan: string;
  nama_guru: string;
  is_active: boolean;
  created_at: Date;
}

const JadwalSchema = new Schema<IJadwal>({
  hari: {
    type: String,
    required: [true, 'Hari wajib dipilih'],
    enum: {
      values: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      message: 'Hari harus Senin, Selasa, Rabu, Kamis, Jumat, atau Sabtu'
    }
  },
  jam_mulai: {
    type: String,
    required: [true, 'Jam mulai wajib diisi'],
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validate HH:MM format
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: 'Format jam mulai harus HH:MM (contoh: 08:00)'
    }
  },
  jam_selesai: {
    type: String,
    required: [true, 'Jam selesai wajib diisi'],
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validate HH:MM format
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(v)) {
          return false;
        }
        
        // Validate jam_selesai > jam_mulai
        const jadwal = this as IJadwal;
        if (jadwal.jam_mulai) {
          const [startHour, startMin] = jadwal.jam_mulai.split(':').map(Number);
          const [endHour, endMin] = v.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          return endMinutes > startMinutes;
        }
        return true;
      },
      message: 'Jam selesai harus lebih besar dari jam mulai dan format HH:MM'
    }
  },
  mata_pelajaran: {
    type: String,
    required: [true, 'Mata pelajaran wajib diisi'],
    trim: true,
    minlength: [2, 'Mata pelajaran minimal 2 karakter'],
    maxlength: [100, 'Mata pelajaran maksimal 100 karakter']
  },
  ruangan: {
    type: String,
    required: [true, 'Ruangan wajib diisi'],
    trim: true,
    maxlength: [50, 'Ruangan maksimal 50 karakter']
  },
  nama_guru: {
    type: String,
    required: [true, 'Nama guru wajib diisi'],
    trim: true,
    minlength: [2, 'Nama guru minimal 2 karakter'],
    maxlength: [100, 'Nama guru maksimal 100 karakter']
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

// Index for hari (Requirement 15.6)
JadwalSchema.index({ hari: 1 });

// Pre-save hook for data normalization
JadwalSchema.pre('save', function(next) {
  // Normalize mata_pelajaran and nama_guru
  if (this.mata_pelajaran) {
    this.mata_pelajaran = this.mata_pelajaran
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  if (this.nama_guru) {
    this.nama_guru = this.nama_guru
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  next();
});

export default mongoose.model<IJadwal>('Jadwal', JadwalSchema, 'jadwal_pelajaran');
