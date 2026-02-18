/**
 * Slash Command Definitions
 * Defines all Discord slash commands with their permissions
 */

import { SlashCommandBuilder } from 'discord.js';
import { getSubjectChoices } from './SubjectConfig';

export interface CommandDefinition {
  data: any; // Use any to avoid type issues with SlashCommandOptionsOnlyBuilder
  adminOnly: boolean;
  leaderOnly: boolean;
}

/**
 * Get all slash command definitions
 */
export function getSlashCommands(): CommandDefinition[] {
  return [
    // ============================================
    // MEMBER COMMANDS (Everyone can use)
    // ============================================
    {
      data: new SlashCommandBuilder()
        .setName('tugas')
        .setDescription('📝 Lihat semua tugas aktif'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('tugas_hari_ini')
        .setDescription('📅 Lihat tugas hari ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('tugas_minggu_ini')
        .setDescription('📊 Lihat tugas minggu ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('jadwal')
        .setDescription('📅 Lihat jadwal hari ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('jadwal_besok')
        .setDescription('📅 Lihat jadwal besok'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('jadwal_minggu_ini')
        .setDescription('📊 Lihat jadwal minggu ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('piket')
        .setDescription('🧹 Lihat jadwal piket hari ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('piket_minggu_ini')
        .setDescription('🧹 Lihat jadwal piket minggu ini'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📖 Lihat daftar perintah'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('🤖 Lihat status bot'),
      adminOnly: false,
      leaderOnly: false
    },

    // ============================================
    // ADMIN COMMANDS (Koordinator, Wakil, Ketua)
    // ============================================
    {
      data: new SlashCommandBuilder()
        .setName('add_tugas')
        .setDescription('➕ Tambah tugas baru')
        .addStringOption(option =>
          option.setName('judul')
            .setDescription('Judul tugas')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('mata_pelajaran')
            .setDescription('Mata pelajaran')
            .setRequired(true)
            .addChoices(
              ...getSubjectChoices()
            ))
        .addStringOption(option =>
          option.setName('deskripsi')
            .setDescription('Deskripsi tugas')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('deadline')
            .setDescription('Deadline (format: YYYY-MM-DD HH:MM)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('tipe')
            .setDescription('Tipe tugas')
            .setRequired(true)
            .addChoices(
              { name: 'Individu', value: 'individu' },
              { name: 'Kelompok', value: 'kelompok' }
            )),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('add_tugas_cepat')
        .setDescription('⚡ Tambah tugas dengan natural language (AI)')
        .addStringOption(option =>
          option.setName('deskripsi')
            .setDescription('Deskripsi tugas dalam bahasa natural')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('edit_tugas')
        .setDescription('✏️ Edit tugas')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID tugas')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('hapus_tugas')
        .setDescription('🗑️ Hapus tugas')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID tugas')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('tandai_selesai')
        .setDescription('✅ Tandai tugas selesai')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID tugas')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('add_jadwal')
        .setDescription('➕ Tambah jadwal')
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
              { name: 'Sabtu', value: 'Sabtu' }
            ))
        .addStringOption(option =>
          option.setName('mata_pelajaran')
            .setDescription('Mata pelajaran')
            .setRequired(true)
            .addChoices(
              ...getSubjectChoices()
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
          option.setName('ruangan')
            .setDescription('Ruangan')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('nama_guru')
            .setDescription('Nama guru')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('set_piket')
        .setDescription('🧹 Atur jadwal piket')
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
              { name: 'Sabtu', value: 'Sabtu' }
            ))
        .addStringOption(option =>
          option.setName('nama_siswa')
            .setDescription('Nama siswa (pisahkan dengan koma)')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('add_pengumuman')
        .setDescription('📢 Tambah pengumuman')
        .addStringOption(option =>
          option.setName('judul')
            .setDescription('Judul pengumuman')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('isi')
            .setDescription('Isi pengumuman')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('test_reminder')
        .setDescription('🧪 Test reminder system')
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Tipe reminder')
            .setRequired(false)
            .addChoices(
              { name: 'Daily (Besok)', value: 'daily' },
              { name: 'Weekly (Minggu Depan)', value: 'weekly' }
            )),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('sync_now')
        .setDescription('🔄 Manual sync (Notion <-> MongoDB)'),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('edit_jadwal')
        .setDescription('✏️ Edit jadwal pelajaran')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID jadwal')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('hapus_jadwal')
        .setDescription('🗑️ Hapus jadwal pelajaran')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID jadwal')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('ganti_jadwal')
        .setDescription('🔄 Ganti jadwal + buat pengumuman')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID jadwal')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('edit_piket')
        .setDescription('✏️ Edit jadwal piket')
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
              { name: 'Sabtu', value: 'Sabtu' }
            ))
        .addStringOption(option =>
          option.setName('nama_siswa')
            .setDescription('Nama siswa baru (pisahkan dengan koma)')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('hapus_pengumuman')
        .setDescription('🗑️ Hapus pengumuman')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('ID pengumuman')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('atur_libur')
        .setDescription('📅 Atur hari libur via AI')
        .addStringOption(option =>
          option.setName('pesan')
            .setDescription('Pesan natural, e.g. "Minggu depan libur kenaikan kelas"')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('cek_libur')
        .setDescription('📅 Cek daftar hari libur mendatang'),
      adminOnly: false,
      leaderOnly: false
    },
    {
      data: new SlashCommandBuilder()
        .setName('hapus_libur')
        .setDescription('🗑️ Hapus hari libur')
        .addStringOption(option =>
          option.setName('pesan')
            .setDescription('Pesan natural, e.g. "Hapus libur minggu depan"')
            .setRequired(true)),
      adminOnly: true,
      leaderOnly: false
    },

    // ============================================
    // LEADER COMMANDS (Ketua, Wakil only)
    // ============================================
    {
      data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('📣 Broadcast pesan ke semua member')
        .addStringOption(option =>
          option.setName('pesan')
            .setDescription('Pesan yang akan di-broadcast')
            .setRequired(true)),
      adminOnly: false,
      leaderOnly: true
    },
    {
      data: new SlashCommandBuilder()
        .setName('broadcast_urgent')
        .setDescription('🚨 Broadcast pesan urgent')
        .addStringOption(option =>
          option.setName('pesan')
            .setDescription('Pesan urgent')
            .setRequired(true)),
      adminOnly: false,
      leaderOnly: true
    }
  ];
}

/**
 * Get command names for permission checking
 */
export function getAdminCommandNames(): string[] {
  return getSlashCommands()
    .filter(cmd => cmd.adminOnly)
    .map(cmd => cmd.data.name);
}

export function getLeaderCommandNames(): string[] {
  return getSlashCommands()
    .filter(cmd => cmd.leaderOnly)
    .map(cmd => cmd.data.name);
}

export function getMemberCommandNames(): string[] {
  return getSlashCommands()
    .filter(cmd => !cmd.adminOnly && !cmd.leaderOnly)
    .map(cmd => cmd.data.name);
}
