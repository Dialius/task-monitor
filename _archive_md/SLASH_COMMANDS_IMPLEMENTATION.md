# Slash Commands & Button Confirmation Implementation

Dokumentasi lengkap implementasi slash commands, permission system, dan button confirmation untuk `/add_tugas_cepat`.

## 📋 Yang Sudah Diimplementasikan

### 1. **Role-Based Permission System** ✅

#### Konfigurasi (.env)
```env
# Admin Roles (Koordinator) - Can use admin commands
DISCORD_ADMIN_ROLE_IDS=123456789,987654321

# Leader Roles (Ketua/Wakil) - Can use leader commands + admin commands
DISCORD_LEADER_ROLE_IDS=111111111,222222222
```

#### Permission Logic
- **Member Commands**: Semua orang di server bisa akses (tidak perlu role khusus)
- **Admin Commands**: Perlu role dari `DISCORD_ADMIN_ROLE_IDS` atau `DISCORD_LEADER_ROLE_IDS`
- **Leader Commands**: Hanya role dari `DISCORD_LEADER_ROLE_IDS`

#### Files Modified
- `src/services/PermissionService.ts` - Added `checkDiscordRoles()` method
- `.env` & `.env.example` - Added role configuration

### 2. **Slash Commands Registration** ✅

#### 21 Commands Registered
**Member Commands (10):**
- `/tugas` - Lihat semua tugas aktif
- `/tugas_hari_ini` - Lihat tugas hari ini
- `/tugas_minggu_ini` - Lihat tugas minggu ini
- `/jadwal` - Lihat jadwal hari ini
- `/jadwal_besok` - Lihat jadwal besok
- `/jadwal_minggu_ini` - Lihat jadwal minggu ini
- `/piket` - Lihat jadwal piket hari ini
- `/piket_minggu_ini` - Lihat jadwal piket minggu ini
- `/help` - Lihat daftar perintah
- `/status` - Lihat status bot

**Admin Commands (9):**
- `/add_tugas` - Tambah tugas baru (with options)
- `/add_tugas_cepat` - Tambah tugas dengan AI (natural language)
- `/edit_tugas` - Edit tugas
- `/hapus_tugas` - Hapus tugas
- `/tandai_selesai` - Tandai tugas selesai
- `/add_jadwal` - Tambah jadwal (with options)
- `/set_piket` - Atur jadwal piket
- `/add_pengumuman` - Tambah pengumuman
- `/test_reminder` - Test reminder system

**Leader Commands (2):**
- `/broadcast` - Broadcast pesan ke semua member
- `/broadcast_urgent` - Broadcast pesan urgent

#### Files Created/Modified
- `src/config/slashCommands.ts` - Command definitions
- `src/clients/DiscordClient.ts` - Updated `registerSlashCommands()`
- `src/bot.ts` - Call `registerSlashCommands()` on startup

### 3. **Button Confirmation System** ✅

#### Flow untuk `/add_tugas_cepat`
1. User mengetik: `/add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10`
2. AI parse input menjadi structured data
3. Bot menampilkan preview dengan 3 buttons:
   - ✅ **Yes** - Confirm dan save task
   - ❌ **No** - Cancel
   - ✏️ **Revise** - Edit via modal form

#### Button IDs
- `task_confirm_yes` - Confirm task
- `task_confirm_no` - Cancel task
- `task_confirm_revise` - Show revision modal

#### Files Created/Modified
- `src/services/discord/TaskConfirmationService.ts` - NEW: Manage confirmation state
- `src/handlers/AdminCommandHandler.ts` - Added button confirmation logic
- `src/services/discord/ButtonInteractionHandler.ts` - Added `handleTaskConfirmation()`
- `src/bot.ts` - Added button rendering in slash command response

### 4. **Modal Form for Revision** ✅

#### Modal Fields
1. **Judul** - Text input (short)
2. **Mata Pelajaran** - Text input (short)
3. **Deskripsi** - Text input (paragraph)
4. **Deadline** - Text input (format: YYYY-MM-DD HH:MM)
5. **Tipe** - Text input (individu/kelompok)

#### Modal Flow
1. User clicks "✏️ Revise" button
2. Modal appears with pre-filled values
3. User edits fields
4. Submit modal
5. Bot shows updated preview with confirmation buttons again

#### Files Modified
- `src/services/discord/ButtonInteractionHandler.ts` - Added `showRevisionModal()`
- `src/bot.ts` - Added modal submission handler

## 🔧 Cara Menggunakan

### Setup Role IDs

1. **Enable Developer Mode di Discord:**
   - User Settings → Advanced → Developer Mode (ON)

2. **Get Role IDs:**
   - Server Settings → Roles
   - Klik kanan role → Copy Role ID

3. **Update .env:**
   ```env
   # Admin roles (comma-separated)
   DISCORD_ADMIN_ROLE_IDS=1234567890,0987654321
   
   # Leader roles (comma-separated)
   DISCORD_LEADER_ROLE_IDS=1111111111,2222222222
   ```

4. **Restart bot**

### Testing Commands

#### Test Member Commands (Anyone can use)
```
/tugas
/jadwal
/piket
/help
/status
```

#### Test Admin Commands (Need admin role)
```
/add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10
```

Expected flow:
1. Bot shows preview embed
2. 3 buttons appear: Yes, No, Revise
3. Click "Yes" → Task created
4. Click "No" → Cancelled
5. Click "Revise" → Modal appears → Edit → Submit → Preview again

#### Test Leader Commands (Need leader role)
```
/broadcast Test message
/broadcast_urgent Urgent announcement
```

## 📁 File Structure

```
src/
├── config/
│   └── slashCommands.ts          # NEW: Command definitions
├── services/
│   ├── PermissionService.ts      # UPDATED: Discord role check
│   └── discord/
│       ├── TaskConfirmationService.ts  # NEW: Confirmation state
│       └── ButtonInteractionHandler.ts # UPDATED: Button handling
├── handlers/
│   └── AdminCommandHandler.ts    # UPDATED: Button confirmation
├── clients/
│   └── DiscordClient.ts          # UPDATED: Register commands
└── bot.ts                        # UPDATED: Modal handler
```

## 🐛 Troubleshooting

### Commands tidak muncul di Discord
- Pastikan bot sudah restart setelah update code
- Check log: "✓ 21 slash commands registered"
- Tunggu 1-2 menit untuk Discord sync commands

### Permission denied untuk admin commands
- Check role IDs di `.env` sudah benar
- Pastikan user punya role yang sesuai
- Check log untuk error permission

### Button tidak berfungsi
- Check ButtonInteractionHandler di log
- Pastikan button IDs match: `task_confirm_yes`, `task_confirm_no`, `task_confirm_revise`

### Modal tidak muncul
- Modal hanya bisa muncul sebelum interaction di-defer
- Check log untuk error "Failed to show modal"

### Confirmation expired
- Timeout: 5 minutes
- User harus klik button dalam 5 menit
- Jika expired, jalankan `/add_tugas_cepat` lagi

## 🔄 Button ID Convention

Updated convention dengan confirmation buttons:

| Button ID | Handler | Fungsi |
|-----------|---------|--------|
| `cmd_page_prev` | PaginationHelper | Previous page (command pagination) |
| `cmd_page_next` | PaginationHelper | Next page (command pagination) |
| `tasks_week` | ButtonInteractionHandler | Show tasks this week |
| `tasks_tomorrow` | ButtonInteractionHandler | Show tasks tomorrow |
| `task_page_prev_*` | ButtonInteractionHandler | Previous page (ephemeral) |
| `task_page_next_*` | ButtonInteractionHandler | Next page (ephemeral) |
| `task_confirm_yes` | ButtonInteractionHandler | Confirm task creation |
| `task_confirm_no` | ButtonInteractionHandler | Cancel task creation |
| `task_confirm_revise` | ButtonInteractionHandler | Show revision modal |

## ✅ Testing Checklist

- [ ] Slash commands terdaftar di Discord
- [ ] Member commands bisa diakses semua orang
- [ ] Admin commands hanya bisa diakses role admin
- [ ] Leader commands hanya bisa diakses role leader
- [ ] `/add_tugas_cepat` menampilkan preview dengan buttons
- [ ] Button "Yes" membuat task
- [ ] Button "No" membatalkan
- [ ] Button "Revise" menampilkan modal
- [ ] Modal bisa di-submit dan update preview
- [ ] Confirmation expired setelah 5 menit

## 📝 Notes

- Slash commands auto-register saat bot startup
- Permission check menggunakan Discord roles (bukan database)
- Fallback ke database jika role tidak ditemukan
- WhatsApp tetap menggunakan text confirmation (bukan buttons)
- Modal hanya tersedia di Discord (tidak di WhatsApp)
