/**
 * Task Formatter Utility
 * Format tasks for WhatsApp and Discord display
 */

import { ITask } from '../models/Task';
import { EmbedBuilder } from 'discord.js';

/**
 * Format task for WhatsApp message
 */
export function formatTaskForWhatsApp(task: ITask): string {
  const priorityEmoji = {
    urgent: '🔴',
    penting: '🟡',
    normal: '🟢'
  };

  const tipeEmoji = {
    individu: '👤',
    kelompok: '👥',
    ujian: '📝'
  };

  const deadline = new Date(task.deadline);
  const deadlineStr = deadline.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `📚 *${task.judul}*\n\n`;
  message += `📖 Mata Pelajaran: ${task.mata_pelajaran}\n`;
  message += `${tipeEmoji[task.tipe]} Tipe: ${task.tipe.charAt(0).toUpperCase() + task.tipe.slice(1)}\n`;
  message += `${priorityEmoji[task.prioritas]} Prioritas: ${task.prioritas.charAt(0).toUpperCase() + task.prioritas.slice(1)}\n`;
  message += `📅 Deadline: ${deadlineStr}\n\n`;
  message += `📝 Deskripsi:\n${task.deskripsi}\n`;

  if (task.link_pengumpulan) {
    message += `\n🔗 Link: ${task.link_pengumpulan}`;
  }

  if (task.catatan) {
    message += `\n\n💡 Catatan: ${task.catatan}`;
  }

  message += `\n\n🆔 ID: ${task._id}`;

  return message;
}

/**
 * Format task embed for Discord
 */
export function formatTaskEmbedForDiscord(task: ITask): EmbedBuilder {
  const priorityEmoji = {
    urgent: '🔴',
    penting: '🟡',
    normal: '🟢'
  };

  const tipeEmoji = {
    individu: '👤',
    kelompok: '👥',
    ujian: '📝'
  };

  const priorityColor = {
    urgent: 0xFF0000, // Red
    penting: 0xFFFF00, // Yellow
    normal: 0x00FF00  // Green
  };

  const deadline = new Date(task.deadline);
  const deadlineStr = deadline.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const embed = new EmbedBuilder()
    .setTitle(`📚 ${task.judul}`)
    .setColor(priorityColor[task.prioritas])
    .addFields(
      { name: '📖 Mata Pelajaran', value: task.mata_pelajaran, inline: true },
      { name: `${tipeEmoji[task.tipe]} Tipe`, value: task.tipe.charAt(0).toUpperCase() + task.tipe.slice(1), inline: true },
      { name: `${priorityEmoji[task.prioritas]} Prioritas`, value: task.prioritas.charAt(0).toUpperCase() + task.prioritas.slice(1), inline: true },
      { name: '📅 Deadline', value: deadlineStr, inline: false },
      { name: '📝 Deskripsi', value: task.deskripsi || 'Tidak ada deskripsi', inline: false }
    )
    .setFooter({ text: `ID: ${task._id}` })
    .setTimestamp();

  if (task.link_pengumpulan) {
    embed.addFields({ name: '🔗 Link Pengumpulan', value: task.link_pengumpulan, inline: false });
  }

  if (task.catatan) {
    embed.addFields({ name: '💡 Catatan', value: task.catatan, inline: false });
  }

  return embed;
}

/**
 * Format task list for WhatsApp
 */
export function formatTaskListForWhatsApp(tasks: ITask[]): string {
  if (tasks.length === 0) {
    return '📭 Tidak ada tugas aktif saat ini.';
  }

  let message = `📚 *DAFTAR TUGAS AKTIF* (${tasks.length})\n\n`;

  tasks.forEach((task, index) => {
    const priorityEmoji = {
      urgent: '🔴',
      penting: '🟡',
      normal: '🟢'
    };

    const deadline = new Date(task.deadline);
    const deadlineStr = deadline.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });

    message += `${index + 1}. ${priorityEmoji[task.prioritas]} *${task.judul}*\n`;
    message += `   📖 ${task.mata_pelajaran} | 📅 ${deadlineStr}\n`;
    message += `   🆔 ${task._id}\n\n`;
  });

  return message;
}
