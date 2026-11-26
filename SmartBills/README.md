# SmartBills local development

## Jalankan semua aplikasi

Persiapan satu kali:

1. Jalankan service PostgreSQL dan pastikan database serta skema SmartBills
   sudah disiapkan. Lihat `backend/README.md` untuk konfigurasi database dan
   perintah setup skema.
2. Pastikan konfigurasi lokal `backend/.env` sudah lengkap, termasuk konfigurasi
   PostgreSQL, JWT, dan token/URL OCR. Jangan membagikan atau meng-commit file
   `.env`.
3. Pasang dependency tiap bagian satu kali:

   ```powershell
   npm install
   npm --prefix backend install
   npm --prefix backend/ocr-service install
   npm --prefix frontend install
   npm --prefix mobile install
   ```

4. Buat konfigurasi mobile dari template:

   ```powershell
   Copy-Item mobile\.env.example mobile\.env
   ```

   Alamat default cocok untuk Android Emulator (`10.0.2.2`). Untuk perangkat
   fisik, ubah `EXPO_PUBLIC_API_URL` di `mobile/.env` ke alamat IP LAN komputer,
   misalnya `http://192.168.1.10:5000/api`; pastikan ponsel dan komputer berada
   di jaringan yang sama dan firewall mengizinkan koneksi.

Setelah itu, dari folder proyek ini jalankan satu perintah:

```powershell
npm run dev
```

Perintah tersebut menjalankan API, OCR, frontend web, dan Expo/Metro dalam satu
terminal dengan label log untuk setiap proses. Expo menampilkan QR code untuk
dibuka di Expo Go. Akses web di `http://localhost:5173`, API di
`http://localhost:5000`, dan dokumentasi API di `http://localhost:5000/api-docs`.
Tekan `Ctrl+C` untuk menghentikan semua proses yang dimulai oleh perintah ini.

Database PostgreSQL tetap perlu berjalan sebagai service lokal. Jika port API,
OCR, atau web sudah dipakai proses lain, hentikan proses lama sebelum menjalankan
stack ini agar tidak terjadi konflik port.

## Uji dan build

Jalankan pengujian backend dan mobile:

```powershell
npm test
```

Tes integrasi backend yang memerlukan database khusus akan dilewati sampai
`backend/.env.test` dikonfigurasi dengan kredensial database pengujian.

Build frontend web dan export bundle Android:

```powershell
npm run build:web
npm run build:mobile:android
```
