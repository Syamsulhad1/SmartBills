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

## Membangun APK Android

`expo export --platform android` hanya menghasilkan bundle JavaScript, bukan APK
yang dapat dipasang. Berkas APK harus dibuat dengan EAS Build (cloud) atau
dengan Gradle lokal. Build APK tidak dijalankan di VPS: VPS hanya menjalankan
backend dan web, sedangkan APK adalah berkas aplikasi yang dibangun sekali lalu
dibagikan/dipasang di ponsel.

### Opsi 1 — EAS Build (disarankan, tanpa Android Studio)

1. Buat akun gratis di <https://expo.dev>.
2. Masuk dari folder `mobile`:

   ```bash
   npx eas-cli login
   npx eas-cli init
   ```

   `init` cukup sekali dan akan mengisi `extra.eas.projectId` pada `app.json`.
3. Bangun APK yang bisa langsung dipasang:

   ```bash
   npm run build:android
   ```

   Profil `preview` pada `eas.json` memakai `buildType: apk` dan distribusi
   internal, sehingga tautan unduhan APK muncul di akhir proses build.
   Untuk berkas unggahan Play Store, gunakan `npm run build:android:production`
   (AAB).

### Opsi 2 — Build lokal dengan Gradle

Membutuhkan JDK 17 dan Android SDK (misalnya lewat Android Studio), lalu:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK dihasilkan di `android/app/build/outputs/apk/release/app-release.apk`.
Untuk rilis, siapkan keystore dan isi `android/gradle.properties` /
`android/app/build.gradle` sesuai keystore tersebut. Folder `android/` adalah
hasil generate dan tidak perlu di-commit.

### Alamat API pada APK

`EXPO_PUBLIC_API_URL` ditanam saat build, bukan dibaca saat aplikasi berjalan.
Profil build di `eas.json` dan `.env.production` sudah menunjuk ke
`https://smartbill.iet-polinela.my.id/api`, sehingga APK hasil build dapat
dipakai di HP fisik dengan jaringan internet biasa (tidak lagi bergantung pada
`10.0.2.2` yang hanya berlaku untuk emulator). Jika alamat API berubah, APK harus
dibangun ulang. Untuk pengembangan lokal, `.env` tetap memakai alamat
emulator/LAN.

Naikkan `expo.android.versionCode` (dan `expo.version` bila perlu) setiap kali
membangun APK baru agar pemasangan di atas versi lama tidak ditolak.

### APK yang sudah dibangun

| Item | Nilai |
| --- | --- |
| Versi | 1.0.0 (versionCode 1) |
| Tanggal build | 28 November 2026 |
| Profil | `preview` (APK, distribusi internal) |
| Alamat API | `https://smartbill.iet-polinela.my.id/api` |
| Unduhan | <https://expo.dev/artifacts/eas/haujYxQliXQVGzO6QwrTmAmSZB7YIXgWey8rQl_Z754.apk> |
| Riwayat build | <https://expo.dev/accounts/sahrulssss/projects/smartbills/builds/cf3ae5a3-56a7-419c-81b5-fef424465e53> |

Berkas APK juga tersimpan lokal di `release/smartbills-1.0.0.apk` (tidak
di-commit karena berukuran sekitar 70 MB). Package name: `com.smartbills.mobile`.
APK meminta izin kamera dan internet saja; izin mikrofon dinonaktifkan karena
aplikasi hanya memotret struk.

Build 28 November 2026 sudah memuat perbaikan pemuatan dashboard: permintaan
GET dicoba ulang sekali sebelum pesan error ditampilkan, sehingga gangguan
jaringan sesaat saat aplikasi pertama dibuka tidak langsung memunculkan teks
merah di halaman Home.

## Sesi dan komunikasi API

- Login memakai `POST /api/auth/login`.
- Registrasi memakai `POST /api/auth/register`, lalu login untuk mendapatkan
  JWT. Kata sandi registrasi minimal 8 karakter serta harus mengandung huruf
  dan angka; aturan ini tidak diterapkan saat login agar akun lama tetap dapat
  masuk.
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
  maupun WebP dari galeri. Gambar maksimal 5 MB ditampilkan sebagai pratinjau,
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
