# ⚠️ Hostinger Domain Issue

## Masalah

Domain `rosybrown-horse-106773.hostingersite.com` tidak bisa diakses dengan error:
```
ERR_HTTP2_PROTOCOL_ERROR
```

## Penyebab

Subdomain default Hostinger (`*.hostingersite.com`) kadang memiliki masalah:
1. Domain baru belum fully propagated (butuh 24-48 jam)
2. SSL certificate belum ready
3. Konfigurasi HTTP/2 di server Hostinger
4. Pembatasan akses dari Hostinger untuk subdomain gratis

## Status Saat Ini

✅ Backend running di server (PM2)
✅ MongoDB connected
✅ Frontend files sudah di-upload
✅ File structure benar
❌ Domain tidak bisa diakses dari browser

## Solusi

### Opsi 1: Gunakan Domain Custom (Recommended)

Jika kamu punya domain sendiri (contoh: `jastiphype.shop`):

1. **Login ke hPanel Hostinger**
   - URL: https://hpanel.hostinger.com/

2. **Tambah Domain**
   - Websites → Manage → Domains
   - Add Domain → Pilih domain kamu
   - Point DNS ke Hostinger

3. **Update Frontend .env**
   ```bash
   VITE_API_URL=https://yourdomain.com
   VITE_WS_URL=wss://yourdomain.com
   ```

4. **Rebuild dan Deploy**
   ```bash
   cd frontend
   npm run build
   scp -P 65002 -r dist/* u909490256@153.92.9.187:~/domains/yourdomain.com/public_html/
   ```

### Opsi 2: Tunggu Propagasi

Kadang domain baru butuh waktu 24-48 jam untuk fully active. Coba akses lagi besok.

### Opsi 3: Cek Konfigurasi di hPanel

1. Login ke hPanel: https://hpanel.hostinger.com/
2. Pilih website: rosybrown-horse-106773
3. Cek:
   - SSL Certificate status (harus Active)
   - Domain status (harus Active)
   - PHP version (set ke 8.x)

### Opsi 4: Gunakan IP Address (Temporary)

Akses menggunakan IP server (tidak recommended untuk production):
```
http://153.92.9.187/
```

Tapi ini mungkin tidak work karena Hostinger menggunakan virtual hosts.

## Test Backend API

Backend API bisa ditest dari server langsung:

```bash
ssh -p 65002 u909490256@153.92.9.187
curl http://localhost:3001/health
```

Output seharusnya:
```json
{"status":"ok","timestamp":"2026-02-11T..."}
```

## Alternatif: Deploy ke VPS

Jika masalah domain Hostinger tidak bisa diselesaikan, pertimbangkan deploy ke VPS seperti:
- DigitalOcean ($5/month)
- Vultr ($5/month)
- Linode ($5/month)

Di VPS, kamu punya full control dan bisa gunakan domain apapun.

## Next Steps

1. Cek hPanel Hostinger untuk status domain dan SSL
2. Jika punya domain custom, gunakan itu
3. Jika tidak, tunggu 24-48 jam untuk propagasi
4. Jika masih tidak work, hubungi Hostinger support

## Contact Hostinger Support

Jika masalah berlanjut, hubungi Hostinger support dengan info:
- Domain: rosybrown-horse-106773.hostingersite.com
- Error: ERR_HTTP2_PROTOCOL_ERROR
- Request: Tolong cek kenapa domain tidak bisa diakses
