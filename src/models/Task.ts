/**
 * Task Model
 * Requirements: 2.1
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  judul: string;
  deskripsi: string;
  deadline: Date;
  mata_pelajaran: string;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
  status: 'aktif' | 'selesai';
  notion_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

const TaskSchema = new Schema<ITask>({
  judul: {
    type: String,
    required: true,
    trim: true
  },
  deskripsi: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  mata_pelajaran: {
    type: String,
    required: true,
    trim: true
  },
  tipe: {
    type: String,
    required: true,
    enum: ['individu', 'kelompok', 'ujian']
  },
  prioritas: {
    type: String,
    required: true,
    enum: ['urgent', 'penting', 'normal'],
    default: 'normal'
  },
  status: {
    type: String,
    required: true,
    enum: ['aktif', 'selesai'],
    default: 'aktif'
  },
  notion_id: {
    type: String,
    trim: true
  },
  created_by: {
    type: String,
    required: true,
    trim: true
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

// Indexes (Requirement 15.6)
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ status: 1 });

// Update updated_at on save
TaskSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<ITask>('Task', TaskSchema);
