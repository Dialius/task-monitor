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
    required: true,
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  },
  jam_mulai: {
    type: String,
    required: true,
    trim: true
  },
  jam_selesai: {
    type: String,
    required: true,
    trim: true
  },
  mata_pelajaran: {
    type: String,
    required: true,
    trim: true
  },
  ruangan: {
    type: String,
    required: true,
    trim: true
  },
  nama_guru: {
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

// Index for hari (Requirement 15.6)
JadwalSchema.index({ hari: 1 });

export default mongoose.model<IJadwal>('Jadwal', JadwalSchema, 'jadwal_pelajaran');
