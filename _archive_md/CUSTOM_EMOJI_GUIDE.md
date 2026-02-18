# Custom Emoji Guide - Pagination Buttons

## 🎨 Emoji yang Digunakan

Bot menggunakan custom animated emoji untuk pagination buttons:

### Previous Button (⏪)
- **Emoji Name:** `lastpage`
- **Emoji ID:** `1472405030584848599`
- **Format:** `<a:lastpage:1472405030584848599>`
- **Type:** Animated
- **Uploaded by:** vinthegreat

### Next Button (⏩)
- **Emoji Name:** `nextpage`
- **Emoji ID:** `1472405032594051104`
- **Format:** `<a:nextpage:1472405032594051104>`
- **Type:** Animated
- **Uploaded by:** vinthegreat

## 📝 Cara Menggunakan Custom Emoji

### Format Discord Custom Emoji:
```
<a:emoji_name:emoji_id>  // Untuk animated emoji
<:emoji_name:emoji_id>   // Untuk static emoji
```

### Contoh Penggunaan di Code:
```typescript
new ButtonBuilder()
  .setCustomId('prev')
  .setEmoji('<a:lastpage:1472405030584848599>')
  .setStyle(ButtonStyle.Primary)
```

## 🔧 Cara Mengganti Emoji

Jika ingin mengganti emoji pagination, edit file `src/utils/PaginationHelper.ts`:

```typescript
// Cari bagian ini:
const getButtons = (page: number) => {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('prev')
      .setEmoji('<a:lastpage:1472405030584848599>') // Ganti emoji ID di sini
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('page_info')
      .setLabel(`${page + 1} / ${embeds.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('next')
      .setEmoji('<a:nextpage:1472405032594051104>') // Ganti emoji ID di sini
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === embeds.length - 1)
  );
  return row;
};
```

## 📋 Cara Mendapatkan Emoji ID

### Method 1: Discord Developer Mode
1. Enable Developer Mode di Discord:
   - User Settings → Advanced → Developer Mode (ON)
2. Right-click emoji di chat atau emoji picker
3. Click "Copy ID"
4. Paste ID ke code

### Method 2: Escape Emoji
1. Ketik emoji di Discord dengan backslash: `\:emoji_name:`
2. Discord akan menampilkan format lengkap: `<a:emoji_name:emoji_id>`
3. Copy format lengkap ke code

### Method 3: Upload Emoji
1. Server Settings → Emoji → Upload Emoji
2. Setelah upload, right-click emoji
3. Copy ID atau escape emoji untuk mendapatkan format lengkap

## ⚠️ Catatan Penting

### 1. Bot Harus Ada di Server yang Sama
Bot harus berada di server yang sama dengan emoji custom yang digunakan. Jika tidak, emoji tidak akan tampil.

### 2. Emoji Limit
- Discord Nitro: 250 emoji per server
- Non-Nitro: 50 emoji per server
- Animated emoji membutuhkan Nitro untuk upload

### 3. Emoji Size
- Max file size: 256 KB
- Recommended size: 128x128 pixels
- Format: PNG, GIF (untuk animated)

### 4. Fallback untuk Emoji Tidak Tersedia
Jika emoji custom tidak tersedia (bot tidak di server yang sama), Discord akan menampilkan emoji name saja tanpa icon.

**Solusi:** Gunakan emoji Unicode sebagai fallback:
```typescript
.setEmoji('⬅️') // Unicode emoji sebagai fallback
```

## 🎯 Best Practices

### 1. Gunakan Emoji yang Jelas
- Pilih emoji yang mudah dipahami fungsinya
- Previous = panah kiri (⬅️, ⏪, ◀️)
- Next = panah kanan (➡️, ⏩, ▶️)

### 2. Konsisten dengan Theme
- Gunakan style emoji yang sama (semua animated atau semua static)
- Gunakan warna yang konsisten
- Ukuran emoji harus sama

### 3. Test di Multiple Devices
- Test di desktop
- Test di mobile
- Test di web browser
- Pastikan emoji tampil dengan baik di semua platform

### 4. Backup Emoji
- Simpan file emoji original
- Dokumentasikan emoji ID
- Buat backup di server lain jika perlu

## 🔄 Alternative Emoji Options

Jika ingin menggunakan emoji lain, berikut beberapa opsi:

### Unicode Emoji (No Custom Required):
```typescript
// Previous
.setEmoji('⬅️')  // Left arrow
.setEmoji('◀️')  // Left triangle
.setEmoji('⏪')  // Fast reverse
.setEmoji('👈')  // Pointing left

// Next
.setEmoji('➡️')  // Right arrow
.setEmoji('▶️')  // Right triangle
.setEmoji('⏩')  // Fast forward
.setEmoji('👉')  // Pointing right
```

### Custom Static Emoji:
```typescript
// Format: <:emoji_name:emoji_id>
.setEmoji('<:prev_button:123456789>')
.setEmoji('<:next_button:987654321>')
```

### Custom Animated Emoji (Current):
```typescript
// Format: <a:emoji_name:emoji_id>
.setEmoji('<a:lastpage:1472405030584848599>')
.setEmoji('<a:nextpage:1472405032594051104>')
```

## 📊 Emoji Performance

### Animated vs Static:
- **Animated:** Lebih menarik, tapi file size lebih besar
- **Static:** Lebih ringan, loading lebih cepat
- **Unicode:** Paling ringan, tidak perlu upload

### Recommendation:
- Untuk bot public: Gunakan Unicode emoji (universal)
- Untuk bot private: Gunakan custom animated emoji (lebih menarik)
- Untuk bot dengan banyak user: Gunakan static emoji (balance)

## 🛠️ Troubleshooting

### Emoji Tidak Tampil
**Problem:** Emoji custom tidak tampil, hanya nama emoji yang muncul

**Solution:**
1. Pastikan bot ada di server yang sama dengan emoji
2. Check emoji ID benar
3. Check format emoji benar (`<a:name:id>` untuk animated)
4. Pastikan emoji belum dihapus dari server

### Emoji Tampil Tapi Tidak Animated
**Problem:** Emoji tampil tapi tidak bergerak

**Solution:**
1. Check format menggunakan `<a:name:id>` bukan `<:name:id>`
2. Pastikan file emoji adalah GIF
3. Check di Discord apakah emoji memang animated
4. Restart bot

### Button Tidak Bisa Diklik
**Problem:** Button tampil tapi tidak bisa diklik

**Solution:**
1. Check apakah button disabled
2. Check apakah collector masih active (timeout)
3. Check console log untuk error
4. Pastikan interaction handler terdaftar

## 📚 Resources

- [Discord.js Button Documentation](https://discord.js.org/#/docs/discord.js/main/class/ButtonBuilder)
- [Discord Emoji Documentation](https://discord.com/developers/docs/resources/emoji)
- [Discord Developer Portal](https://discord.com/developers/applications)

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 15 Februari 2026  
**Emoji by:** vinthegreat  
**Status:** ✅ Active & Working
