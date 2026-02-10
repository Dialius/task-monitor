/**
 * Add Sample Tasks to Notion
 * This will add multiple sample tasks directly to Notion database
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Sample tasks to add
const sampleTasks = [
  {
    judul: 'Laporan Praktikum Kimia',
    mata_pelajaran: 'KIK-A',
    deskripsi: 'Buat laporan praktikum tentang reaksi asam basa. Include data pengamatan, analisis, dan kesimpulan.',
    deadline: '2026-02-15',
    tipe: 'Tugas',
    prioritas: 'Tinggi',
    link_pengumpulan: 'https://classroom.google.com/c/example1',
    catatan: 'Format laporan sesuai template yang sudah diberikan'
  },
  {
    judul: 'Soal Latihan Matematika Bab 3',
    mata_pelajaran: 'MTK',
    deskripsi: 'Kerjakan soal latihan halaman 45-50, nomor 1-20. Tulis cara penyelesaiannya dengan lengkap.',
    deadline: '2026-02-12',
    tipe: 'PR',
    prioritas: 'Normal',
    catatan: 'Boleh dikerjakan berkelompok maksimal 3 orang'
  },
  {
    judul: 'Presentasi Sejarah Kemerdekaan',
    mata_pelajaran: 'Sejarah',
    deskripsi: 'Presentasi kelompok tentang peristiwa menjelang kemerdekaan Indonesia. Durasi 15-20 menit.',
    deadline: '2026-02-18',
    tipe: 'Presentasi',
    prioritas: 'Tinggi',
    link_pengumpulan: 'https://drive.google.com/example',
    catatan: 'Presentasi menggunakan PowerPoint atau Canva. Sertakan video/gambar.'
  },
  {
    judul: 'Essay Bahasa Indonesia',
    mata_pelajaran: 'B. Indonesia',
    deskripsi: 'Tulis essay argumentatif dengan tema "Dampak Media Sosial bagi Remaja". Minimal 500 kata.',
    deadline: '2026-02-14',
    tipe: 'Tugas',
    prioritas: 'Normal',
    link_pengumpulan: 'https://classroom.google.com/c/example2'
  },
  {
    judul: 'Ulangan Harian Bahasa Inggris',
    mata_pelajaran: 'B. Inggris',
    deskripsi: 'Ulangan harian materi Chapter 1-3: Grammar (Present Perfect, Past Continuous) dan Reading Comprehension.',
    deadline: '2026-02-13',
    tipe: 'UH',
    prioritas: 'Tinggi',
    catatan: 'Pelajari materi dari buku paket dan catatan. Bawa kamus jika perlu.'
  },
  {
    judul: 'Proyek Pemrograman Web',
    mata_pelajaran: 'MK-2',
    deskripsi: 'Buat website portfolio pribadi menggunakan HTML, CSS, dan JavaScript. Include minimal 5 halaman.',
    deadline: '2026-02-20',
    tipe: 'Tugas',
    prioritas: 'Tinggi',
    link_pengumpulan: 'https://github.com/example',
    catatan: 'Upload ke GitHub dan submit link repository. Pastikan responsive design.'
  },
  {
    judul: 'Tugas PJOK - Video Senam',
    mata_pelajaran: 'PJOK',
    deskripsi: 'Rekam video melakukan senam SKJ (Senam Kesegaran Jasmani) lengkap. Durasi minimal 10 menit.',
    deadline: '2026-02-16',
    tipe: 'Tugas',
    prioritas: 'Normal',
    link_pengumpulan: 'https://drive.google.com/example2',
    catatan: 'Video harus jelas, pakaian olahraga, dan gerakan sesuai panduan.'
  },
  {
    judul: 'Analisis Database',
    mata_pelajaran: 'MK-3',
    deskripsi: 'Buat ERD (Entity Relationship Diagram) untuk sistem perpustakaan sekolah. Include minimal 5 entitas.',
    deadline: '2026-02-17',
    tipe: 'Tugas',
    prioritas: 'Normal',
    catatan: 'Gunakan tools seperti Draw.io atau Lucidchart. Export ke PDF.'
  }
];

async function addSampleTasks() {
  try {
    console.log('\n📝 Adding Sample Tasks to Notion...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      process.exit(1);
    }
    
    console.log(`📊 Database ID: ${databaseId}`);
    console.log(`📋 Tasks to add: ${sampleTasks.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let added = 0;
    let failed = 0;
    
    for (const task of sampleTasks) {
      try {
        console.log(`📝 Adding: ${task.judul}...`);
        
        const properties = {
          'Judul': {
            title: [
              {
                text: {
                  content: task.judul
                }
              }
            ]
          },
          'Mata Pelajaran': {
            select: {
              name: task.mata_pelajaran
            }
          },
          'Deskripsi': {
            rich_text: [
              {
                text: {
                  content: task.deskripsi
                }
              }
            ]
          },
          'Deadline': {
            date: {
              start: task.deadline
            }
          },
          'Tipe': {
            select: {
              name: task.tipe
            }
          },
          'Prioritas': {
            select: {
              name: task.prioritas
            }
          },
          'Status': {
            select: {
              name: 'Aktif'
            }
          },
          'Created By': {
            rich_text: [
              {
                text: {
                  content: 'script'
                }
              }
            ]
          }
        };
        
        // Add optional fields
        if (task.link_pengumpulan) {
          properties['Link Pengumpulan'] = {
            url: task.link_pengumpulan
          };
        }
        
        if (task.catatan) {
          properties['Catatan'] = {
            rich_text: [
              {
                text: {
                  content: task.catatan
                }
              }
            ]
          };
        }
        
        const response = await notion.pages.create({
          parent: {
            database_id: databaseId
          },
          properties
        });
        
        console.log(`   ✅ Added: ${task.judul}`);
        console.log(`   📊 Page ID: ${response.id}`);
        console.log(`   📅 Deadline: ${task.deadline}`);
        console.log(`   🎯 Prioritas: ${task.prioritas}\n`);
        
        added++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`   ❌ Failed: ${task.judul}`);
        console.error(`   Error: ${error.message}\n`);
        failed++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary:');
    console.log(`   Total tasks: ${sampleTasks.length}`);
    console.log(`   Added: ${added}`);
    console.log(`   Failed: ${failed}`);
    console.log('\n✅ Done!\n');
    console.log('💡 Check your Notion database: https://www.notion.so/' + databaseId.replace(/-/g, ''));
    console.log('💡 Run sync script to import to MongoDB: node scripts/sync-from-notion.js\n');
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addSampleTasks();
