# SmartBills Mobile

Aplikasi Android dan iOS menggunakan Expo/React Native. Aplikasi menyediakan
registrasi, login, pemulihan sesi JWT, dashboard, navigasi bawah Home, Transaksi,
Scan, Riwayat, dan Akun, formulir saldo awal, pemindaian struk, indikator
loading, dan penanganan kesalahan jaringan.

## Menjalankan

1. Pastikan Android Studio dan Android Emulator sudah terpasang, lalu buat dan
   jalankan perangkat virtual dari Android Studio Device Manager.
2. Pastikan API SmartBills berjalan pada port `5000`.
3. Dari folder `mobile`, pasang dependency dan buat konfigurasi API lokal:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

4. Untuk Android Emulator, gunakan alamat
   `http://10.0.2.2:5000/api` pada `EXPO_PUBLIC_API_URL`. `10.0.2.2` adalah
   alamat khusus emulator untuk mengakses komputer host.
   - iOS Simulator: `http://localhost:5000/api`
   - Perangkat fisik: gunakan IP LAN komputer, misalnya `http://192.168.1.10:5000/api`.
     Pastikan ponsel dan komputer ada di jaringan yang sama dan firewall
     mengizinkan koneksi ke port `5000`.
5. Jalankan dari folder `mobile`:

   ```powershell
   npm run android
   ```

   Perintah ini menyalakan Metro dan membuka aplikasi di Android Emulator.
   Jika emulator tidak terbuka otomatis, jalankan `npm start` lalu tekan `a`
   di terminal. Restart Expo setelah mengubah `.env`.

Untuk Android Emulator, backend harus menerima koneksi dari emulator, bukan
hanya terikat ke `localhost`. Periksa konfigurasi host backend dan firewall
jika permintaan tidak tersambung.

## Sesi dan komunikasi API

- Login memakai `POST /api/auth/login`.
- Registrasi memakai `POST /api/auth/register`, lalu login untuk mendapatkan JWT.
- Sesi yang dipulihkan diverifikasi melalui `GET /api/users/me`.
- JWT disimpan dengan `expo-secure-store` dan dihapus saat pengguna keluar.
- Jika server tidak terjangkau, aplikasi menampilkan error dan opsi untuk mencoba
  kembali; kegagalan jaringan tidak menghapus token yang tersimpan.
- Dashboard meminta `GET /api/analytics` menggunakan JWT, menampilkan saldo,
  pemasukan/pengeluaran, grafik arus kas, dan grafik distribusi pengeluaran per
  kategori. Grafik arus kas membandingkan pemasukan dan pengeluaran per bucket
  waktu. Grafik kategori menampilkan lima kategori teratas dan menggabungkan
  sisanya sebagai “Lainnya”. API analitik juga menyertakan ringkasan pemasukan
  dan pengeluaran minggu berjalan serta bulan berjalan. Keduanya ditampilkan
  terpisah dari rentang tren yang dapat diubah antara 7 hari, 12 minggu, dan
  6 bulan; tarik layar ke bawah untuk memuat ulang.
- Navigasi bawah menyediakan Home (dashboard), Transaksi (input manual), Scan
  (kamera/galeri dan OCR/AI), Riwayat (50 transaksi terbaru; bukti privat dapat
  dibuka dengan JWT), dan Akun
  (profil, saldo awal, serta keluar).
- Jika saldo awal belum diatur, dashboard menampilkan formulir yang mengirim
  nominal ke `POST /api/users/me/initial-balance`. Backend hanya mengizinkan
  saldo awal ditetapkan satu kali.
- Bagian scan struk dapat mengambil foto dari kamera atau memilih JPEG, PNG,
  maupun WebP dari galeri. Gambar maksimal 4 MB ditampilkan sebagai pratinjau,
  lalu dikirim sebagai multipart ke `POST /api/ai/ocr`. Teks OCR ditampilkan
  untuk diperiksa sebelum pengguna memilih analisis AI. AI mengirim teks ke
  `POST /api/ai/parse-transaction` dan menampilkan draft serta peringatan untuk
  ditinjau. Field draft dapat dikoreksi, atau pengguna dapat memilih input
  transaksi manual dan kategori dari backend. Setelah dikonfirmasi, transaksi
  dikirim ke `POST /api/transactions`; aplikasi menampilkan status penyimpanan
  dan ID transaksi, atau pesan error backend. Saldo pada dashboard diperbarui
  langsung dari respons transaksi, lalu ringkasan dimuat ulang.

Jalankan pengujian client API dengan:

```powershell
npm test
```
