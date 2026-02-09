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
    required: true,
    unique: true,
    trim: true
  },
  nama_siswa: {
    type: [String],
    required: true,
    default: []
  },
  nomor_wa: {
    type: [String],
    required: true,
    default: []
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
  next();
});

export default mongoose.model<IPiket>('Piket', PiketSchema);
