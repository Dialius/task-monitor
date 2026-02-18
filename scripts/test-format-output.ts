/**
 * Test Script for RecapFormatter
 * Generates examples of the new format
 */

import { formatDailyUpdateRecap, formatDailyAgendaRecap } from '../src/utils/RecapFormatter';
import { ITask } from '../src/models/Task';
import { IJadwal } from '../src/models/Jadwal';

// Mock Data
const mockDate = new Date('2026-02-04T07:00:00'); // Rabu, 4 Feb 2026

const tasks: ITask[] = [
    // PPC (Kelompok)
    {
        judul: 'LKPD 3',
        deskripsi: 'Mengerjakan LKPD 3',
        mata_pelajaran: 'PPc/PKN',
        tipe: 'kelompok',
        link_pengumpulan: 'https://drive.google.com/drive/folders/1jqS2FJu6r9TPbMEqZu9Y1wjKU-zP6OEZ',
        deadline: new Date('2026-02-05'),
        priority: 'normal',
        status: 'aktif',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'Admin'
    } as any,
    // PPC (Individu)
    {
        judul: 'LKPD 4',
        deskripsi: 'Mengerjakan LKPD 4',
        mata_pelajaran: 'PPc/PKN',
        tipe: 'individu',
        link_pengumpulan: 'menyusul', // Will be handled
        deadline: new Date('2026-02-05'),
        priority: 'normal',
        status: 'aktif',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'Admin'
    } as any,
    // MK1 (Info)
    {
        judul: 'Info Ujian Lisan',
        deskripsi: 'Buat yang belum maju ujian lisan, silakan mempelajari:',
        mata_pelajaran: 'MK-1',
        tipe: 'individu',
        catatan: '– Modul Praktikum 1\n– Penugasan mandiri',
        deadline: new Date('2026-02-05'),
        priority: 'normal',
        status: 'aktif',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'Admin'
    } as any,
    // MK4 (Tugas Sekolah + Modul)
    {
        judul: 'Tugas Sekolah',
        deskripsi: 'Buat yang belum menyelesaikan tugas di sekolah\n• Menyelesaikan tugas Firestore Get & Add\n• Dikerjakan sesuai petunjuk di modul',
        mata_pelajaran: 'MK-4',
        tipe: 'individu',
        link_pengumpulan: 'tersedia di LMS',
        catatan: 'https://drive.google.com/drive/folders/1sdBCWZStUtacHCWnA2fABcEKfMcEJJxn', // Modul link
        deadline: new Date('2026-02-05'),
        priority: 'normal',
        status: 'aktif',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'Admin'
    } as any
];

const schedules: IJadwal[] = [
    { mata_pelajaran: 'MK-1', hari: 'Rabu', jam_mulai: '07:00', jam_selesai: '09:00', kode_guru: 'GR1' } as any,
    { mata_pelajaran: 'PPc/PKN', hari: 'Rabu', jam_mulai: '09:00', jam_selesai: '11:00', kode_guru: 'GR2' } as any
];

console.log('--- CONTOH FORMAT BARU (UPDATE HARIAN) ---');
console.log(formatDailyUpdateRecap({
    date: mockDate,
    tasks: tasks,
    schedules: [], // Not used for update recap
    context: 'kemarin'
}));

console.log('\n\n' + '='.repeat(50) + '\n\n');

console.log('--- CONTOH FORMAT BARU (AGENDA HARIAN) ---');
console.log(formatDailyAgendaRecap({
    date: mockDate,
    tasks: tasks,
    schedules: schedules
}));
