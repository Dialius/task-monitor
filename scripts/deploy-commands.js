/**
 * Deploy Discord Slash Commands
 * This script registers all slash commands for the bot
 */

require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('❌ Missing required environment variables!');
  console.error('   Please set: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID');
  process.exit(1);
}

// Define all commands for this bot
const commands = [
  // Member Commands
  new SlashCommandBuilder()
    .setName('tugas')
    .setDescription('Lihat semua tugas aktif'),

  new SlashCommandBuilder()
    .setName('tugas_hari_ini')
    .setDescription('Lihat tugas yang deadline-nya hari ini'),

  new SlashCommandBuilder()
    .setName('tugas_minggu_ini')
    .setDescription('Lihat tugas yang deadline-nya minggu ini'),

  new SlashCommandBuilder()
    .setName('jadwal')
    .setDescription('Lihat jadwal hari ini'),

  new SlashCommandBuilder()
    .setName('jadwal_besok')
    .setDescription('Lihat jadwal besok'),

  new SlashCommandBuilder()
    .setName('jadwal_minggu_ini')
    .setDescription('Lihat jadwal minggu ini'),

  new SlashCommandBuilder()
    .setName('piket')
    .setDescription('Lihat piket hari ini'),

  new SlashCommandBuilder()
    .setName('piket_minggu_ini')
    .setDescription('Lihat piket minggu ini'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lihat daftar command yang tersedia'),

  new SlashCommandBuilder()
    .setName('bantuan')
    .setDescription('Lihat daftar command yang tersedia'),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Lihat status bot'),

  // Admin Commands
  new SlashCommandBuilder()
    .setName('add_tugas')
    .setDescription('Tambah tugas baru')
    .addStringOption(option =>
      option.setName('judul')
        .setDescription('Judul tugas')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('deskripsi')
        .setDescription('Deskripsi tugas')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('deadline')
        .setDescription('Deadline (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mata_pelajaran')
        .setDescription('Mata pelajaran')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipe')
        .setDescription('Tipe tugas')
        .setRequired(true)
        .addChoices(
          { name: 'Ujian', value: 'ujian' }
        )),

  new SlashCommandBuilder()
    .setName('add_tugas_cepat')
    .setDescription('Tambah tugas dengan natural language (AI)')
    .addStringOption(option =>
      option.setName('deskripsi')
        .setDescription('Deskripsi tugas dalam bahasa natural')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('edit_tugas')
    .setDescription('Edit tugas yang sudah ada')
    .addStringOption(option =>
      option.setName('task_id')
        .setDescription('ID tugas')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('field')
        .setDescription('Field yang ingin diubah')
        .setRequired(true)
        .addChoices(
          { name: 'Judul', value: 'judul' },
          { name: 'Deskripsi', value: 'deskripsi' },
          { name: 'Deadline', value: 'deadline' },
          { name: 'Mata Pelajaran', value: 'mata_pelajaran' },
          { name: 'Tipe', value: 'tipe' }
        ))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Nilai baru')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('hapus_tugas')
    .setDescription('Hapus tugas')
    .addStringOption(option =>
      option.setName('task_id')
        .setDescription('ID tugas')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('tandai_selesai')
    .setDescription('Tandai tugas sebagai selesai')
    .addStringOption(option =>
      option.setName('task_id')
        .setDescription('ID tugas')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('add_jadwal')
    .setDescription('Tambah jadwal baru')
    .addStringOption(option =>
      option.setName('hari')
        .setDescription('Hari')
        .setRequired(true)
        .addChoices(
          { name: 'Senin', value: 'Senin' },
          { name: 'Selasa', value: 'Selasa' },
          { name: 'Rabu', value: 'Rabu' },
          { name: 'Kamis', value: 'Kamis' },
          { name: 'Jumat', value: 'Jumat' },
          { name: 'Sabtu', value: 'Sabtu' },
          { name: 'Minggu', value: 'Minggu' }
        ))
    .addStringOption(option =>
      option.setName('jam_mulai')
        .setDescription('Jam mulai (HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('jam_selesai')
        .setDescription('Jam selesai (HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mata_pelajaran')
        .setDescription('Mata pelajaran')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('ruangan')
        .setDescription('Ruangan')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nama_guru')
        .setDescription('Nama guru')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('edit_jadwal')
    .setDescription('Edit jadwal yang sudah ada')
    .addStringOption(option =>
      option.setName('schedule_id')
        .setDescription('ID jadwal')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('field')
        .setDescription('Field yang ingin diubah')
        .setRequired(true)
        .addChoices(
          { name: 'Jam Mulai', value: 'jam_mulai' },
          { name: 'Jam Selesai', value: 'jam_selesai' },
          { name: 'Mata Pelajaran', value: 'mata_pelajaran' },
          { name: 'Ruangan', value: 'ruangan' },
          { name: 'Nama Guru', value: 'nama_guru' }
        ))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Nilai baru')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('hapus_jadwal')
    .setDescription('Hapus jadwal')
    .addStringOption(option =>
      option.setName('schedule_id')
        .setDescription('ID jadwal')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('ganti_jadwal')
    .setDescription('Ganti jadwal dan buat pengumuman')
    .addStringOption(option =>
      option.setName('schedule_id')
        .setDescription('ID jadwal')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('field')
        .setDescription('Field yang ingin diubah')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('Nilai baru')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('alasan')
        .setDescription('Alasan perubahan')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('set_piket')
    .setDescription('Set piket untuk hari tertentu')
    .addStringOption(option =>
      option.setName('hari')
        .setDescription('Hari')
        .setRequired(true)
        .addChoices(
          { name: 'Senin', value: 'Senin' },
          { name: 'Selasa', value: 'Selasa' },
          { name: 'Rabu', value: 'Rabu' },
          { name: 'Kamis', value: 'Kamis' },
          { name: 'Jumat', value: 'Jumat' },
          { name: 'Sabtu', value: 'Sabtu' },
          { name: 'Minggu', value: 'Minggu' }
        ))
    .addStringOption(option =>
      option.setName('siswa')
        .setDescription('Daftar siswa (format: nama1,nomor1|nama2,nomor2)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('edit_piket')
    .setDescription('Edit piket yang sudah ada')
    .addStringOption(option =>
      option.setName('hari')
        .setDescription('Hari')
        .setRequired(true)
        .addChoices(
          { name: 'Senin', value: 'Senin' },
          { name: 'Selasa', value: 'Selasa' },
          { name: 'Rabu', value: 'Rabu' },
          { name: 'Kamis', value: 'Kamis' },
          { name: 'Jumat', value: 'Jumat' },
          { name: 'Sabtu', value: 'Sabtu' },
          { name: 'Minggu', value: 'Minggu' }
        ))
    .addStringOption(option =>
      option.setName('siswa')
        .setDescription('Daftar siswa (format: nama1,nomor1|nama2,nomor2)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('add_pengumuman')
    .setDescription('Tambah pengumuman baru')
    .addStringOption(option =>
      option.setName('tanggal')
        .setDescription('Tanggal (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('judul')
        .setDescription('Judul pengumuman')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipe')
        .setDescription('Tipe pengumuman')
        .setRequired(true)
        .addChoices(
          { name: 'Acara', value: 'acara' },
          { name: 'Perubahan Jadwal', value: 'perubahan_jadwal' },
          { name: 'Praktikum', value: 'praktikum' },
          { name: 'Lainnya', value: 'lainnya' }
        ))
    .addStringOption(option =>
      option.setName('keterangan')
        .setDescription('Keterangan pengumuman')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('hapus_pengumuman')
    .setDescription('Hapus pengumuman')
    .addStringOption(option =>
      option.setName('announcement_id')
        .setDescription('ID pengumuman')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Kirim broadcast pesan')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Pesan yang ingin dikirim')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('broadcast_urgent')
    .setDescription('Kirim broadcast pesan urgent')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Pesan urgent yang ingin dikirim')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('atur_libur')
    .setDescription('Set hari libur dengan bahasa natural (AI)')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Contoh: Libur kenaikan kelas dari senin sampai rabu besok')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('cek_libur')
    .setDescription('Cek daftar hari libur mendatang'),

  new SlashCommandBuilder()
    .setName('hapus_libur')
    .setDescription('Hapus hari libur (bisa tanggal spesifik atau rentang via AI)')
    .addStringOption(option =>
      option.setName('tanggal_atau_deskripsi')
        .setDescription('Tanggal (YYYY-MM-DD) atau deskripsi (contoh: hapus libur tgl 5-8)')
        .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST().setToken(token);

async function deployCommands() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   🤖 DISCORD SLASH COMMANDS DEPLOYMENT               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`📋 Step 1/3: Deleting old guild commands...`);
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [] }
    );
    console.log('✅ Old guild commands deleted\n');

    console.log(`📋 Step 2/3: Registering ${commands.length} new commands...`);
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log(`✅ Successfully registered ${data.length} slash commands\n`);

    console.log('📋 Step 3/3: Listing registered commands:');
    console.log('   Member Commands (11):');
    console.log('   • /tugas - Lihat semua tugas aktif');
    console.log('   • /tugas_hari_ini - Tugas deadline hari ini');
    console.log('   • /tugas_minggu_ini - Tugas deadline minggu ini');
    console.log('   • /jadwal - Jadwal hari ini');
    console.log('   • /jadwal_besok - Jadwal besok');
    console.log('   • /jadwal_minggu_ini - Jadwal minggu ini');
    console.log('   • /piket - Piket hari ini');
    console.log('   • /piket_minggu_ini - Piket minggu ini');
    console.log('   • /help atau /bantuan - Daftar command');
    console.log('   • /status - Status bot');
    console.log('');
    console.log('   Admin Commands (14):');
    console.log('   • /add_tugas - Tambah tugas');
    console.log('   • /edit_tugas - Edit tugas');
    console.log('   • /hapus_tugas - Hapus tugas');
    console.log('   • /tandai_selesai - Tandai selesai');
    console.log('   • /add_jadwal - Tambah jadwal');
    console.log('   • /edit_jadwal - Edit jadwal');
    console.log('   • /hapus_jadwal - Hapus jadwal');
    console.log('   • /ganti_jadwal - Ganti jadwal + announcement');
    console.log('   • /set_piket - Set piket');
    console.log('   • /edit_piket - Edit piket');
    console.log('   • /add_pengumuman - Tambah pengumuman');
    console.log('   • /hapus_pengumuman - Hapus pengumuman');
    console.log('   • /broadcast - Broadcast pesan');
    console.log('   • /broadcast_urgent - Broadcast urgent');
    console.log('');
    console.log('✅ Deployment complete!\n');

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    process.exit(1);
  }
}

deployCommands();
