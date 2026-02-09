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
    required: [true, 'Judul tugas wajib diisi'],
    trim: true,
    minlength: [3, 'Judul minimal 3 karakter'],
    maxlength: [200, 'Judul maksimal 200 karakter']
  },
  deskripsi: {
    type: String,
    required: [true, 'Deskripsi tugas wajib diisi'],
    minlength: [5, 'Deskripsi minimal 5 karakter'],
    maxlength: [2000, 'Deskripsi maksimal 2000 karakter']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline wajib diisi'],
    validate: {
      validator: function(v: Date) {
        // Deadline must be in the future (at least 1 hour from now)
        const oneHourFromNow = new Date();
        oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
        return v >= oneHourFromNow;
      },
      message: 'Deadline harus minimal 1 jam dari sekarang'
    }
  },
  mata_pelajaran: {
    type: String,
    required: [true, 'Mata pelajaran wajib diisi'],
    trim: true,
    minlength: [2, 'Mata pelajaran minimal 2 karakter'],
    maxlength: [100, 'Mata pelajaran maksimal 100 karakter']
  },
  tipe: {
    type: String,
    required: [true, 'Tipe tugas wajib dipilih'],
    enum: {
      values: ['individu', 'kelompok', 'ujian'],
      message: 'Tipe harus individu, kelompok, atau ujian'
    }
  },
  prioritas: {
    type: String,
    required: [true, 'Prioritas wajib diisi'],
    enum: {
      values: ['urgent', 'penting', 'normal'],
      message: 'Prioritas harus urgent, penting, atau normal'
    },
    default: 'normal'
  },
  status: {
    type: String,
    required: [true, 'Status wajib diisi'],
    enum: {
      values: ['aktif', 'selesai'],
      message: 'Status harus aktif atau selesai'
    },
    default: 'aktif'
  },
  notion_id: {
    type: String,
    trim: true
  },
  created_by: {
    type: String,
    required: [true, 'Created by wajib diisi'],
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
  
  // Normalize mata_pelajaran: capitalize first letter
  if (this.mata_pelajaran) {
    this.mata_pelajaran = this.mata_pelajaran
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  next();
});

export default mongoose.model<ITask>('Task', TaskSchema);
