/**
 * Seed Dummy Data Script
 * Menambahkan data dummy untuk testing bot
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Task = require('../dist/models/Task').default;
const Jadwal = require('../dist/models/Jadwal').default;
const Piket = require('../dist/models/Piket').default;
const Pengumuman = require('../dist/models/Pengumuman').default;

async function seedData() {
  try {
    console.log('🌱 Seeding dummy data...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Task.deleteMany({});
    await Jadwal.deleteMany({});
    await Piket.deleteMany({});
    await Pengumuman.deleteMany({});
    console.log('✅ Data cleared\n');

    // Seed Tasks
    console.log('📝 Creating tasks...');
    const tasks = await Task.insertMany([
      {
        judul: 'Soal Matematika Bab 5',
        deskripsi: 'Selesaikan soal integral di halaman 45-50',
        deadline: new Date('2026-02-10'),
        mata_pelajaran: 'Matematika',
        tipe: 'individu',
        prioritas: 'urgent',
        created_by: 'admin'
      },
      {
        judul: 'Laporan Praktikum Fisika',
        deskripsi: 'Buat laporan hasil praktikum tentang gerak parabola',
        deadline: new Date('2026-02-12'),
        mata_pelajaran: 'Fisika',
        tipe: 'kelompok',
        prioritas: 'penting',
        created_by: 'admin'
      },
      {
        judul: 'Essay Sejarah',
        deskripsi: 'Tulis essay 500 kata tentang kemerdekaan Indonesia',
        deadline: new Date('2026-02-15'),
        mata_pelajaran: 'Sejarah',
        tipe: 'individu',
        prioritas: 'normal',
        created_by: 'admin'
      }
    ]);
    console.log(`✅ Created ${tasks.length} tasks\n`);

    // Seed Jadwal
    console.log('📅 Creating schedules...');
    const jadwal = await Jadwal.insertMany([
      {
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '09:30',
        mata_pelajaran: 'Matematika',
        ruangan: 'R.101',
        nama_guru: 'Pak Budi'
      },
      {
        hari: 'Senin',
        jam_mulai: '09:45',
        jam_selesai: '11:15',
        mata_pelajaran: 'Fisika',
        ruangan: 'Lab Fisika',
        nama_guru: 'Bu Ani'
      },
      {
        hari: 'Selasa',
        jam_mulai: '08:00',
        jam_selesai: '09:30',
        mata_pelajaran: 'Bahasa Indonesia',
        ruangan: 'R.102',
        nama_guru: 'Bu Siti'
      }
    ]);
    console.log(`✅ Created ${jadwal.length} schedules\n`);

    // Seed Piket
    console.log('🧹 Creating piket...');
    const piket = await Piket.insertMany([
      {
        hari: 'Senin',
        nama_siswa: ['Budi', 'Ani', 'Citra'],
        nomor_wa: ['081234567890', '081234567891', '081234567892']
      },
      {
        hari: 'Selasa',
        nama_siswa: ['Dedi', 'Eka', 'Fani'],
        nomor_wa: ['081234567893', '081234567894', '081234567895']
      }
    ]);
    console.log(`✅ Created ${piket.length} piket schedules\n`);

    // Seed Pengumuman
    console.log('📢 Creating announcements...');
    const pengumuman = await Pengumuman.insertMany([
      {
        tanggal: new Date('2026-02-10'),
        judul: 'Libur Nasional',
        tipe: 'acara',
        keterangan: 'Sekolah libur untuk peringatan hari besar nasional'
      },
      {
        tanggal: new Date('2026-02-11'),
        judul: 'Perubahan Ruangan Matematika',
        tipe: 'perubahan_jadwal',
        keterangan: 'Kelas Matematika pindah ke R.201 karena renovasi'
      }
    ]);
    console.log(`✅ Created ${pengumuman.length} announcements\n`);

    console.log('🎉 Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Tasks: ${tasks.length}`);
    console.log(`   • Schedules: ${jadwal.length}`);
    console.log(`   • Piket: ${piket.length}`);
    console.log(`   • Announcements: ${pengumuman.length}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
