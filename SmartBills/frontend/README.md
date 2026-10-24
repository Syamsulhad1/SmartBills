# SmartBills Frontend

Frontend web SmartBills menggunakan React + Vite dan Bootstrap 5, terhubung ke
backend Express 5 + PostgreSQL.

## Kebutuhan

- Node.js 20+ (disarankan)
- Backend SmartBills aktif pada `http://localhost:5000`
- PostgreSQL sudah disiapkan dan backend dapat terhubung

## Menjalankan

Jalankan dari folder `frontend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Buka URL Vite yang ditampilkan di terminal (umumnya `http://localhost:5173`).
`VITE_API_BASE_URL` di `.env` mengarah ke `http://localhost:5000/api` secara
default. Restart Vite setelah mengubah `.env`.

## Fitur yang dihubungkan

- Login dan registrasi JWT.
- Dashboard dari `GET /api/analytics?period=monthly`.
- Profil serta penetapan saldo awal satu kali.
- Daftar, tambah, dan hapus transaksi; upload bukti privat.
- OCR gambar lokal melalui `POST /api/ai/ocr`, dilanjutkan parsing draft Gemini
  melalui `POST /api/ai/parse-transaction`.

API privat menggunakan `Authorization: Bearer <token>`. Token disimpan di
`sessionStorage` agar sesi berakhir saat tab ditutup. Untuk produksi, tinjau
ulang strategi penyimpanan token sesuai model ancaman aplikasi.

Untuk OCR lokal, backend API dan service Tesseract harus berjalan terpisah
(instruksi ada di README backend). Saat halaman Parsing bukti dibuka, aplikasi
meminta izin kamera dan menampilkan pratinjau; pengguna juga dapat memilih foto
sebagai alternatif. Foto diproses melalui OCR lalu teksnya dikirim ke Gemini.
Hasilnya langsung mengisi form transaksi bersama foto bukti, tanpa menampilkan
teks OCR atau JSON mentah. Hasil AI tetap draft: tinjau dan koreksi data
sebelum menyimpan. Hanya penyimpanan transaksi yang memperbarui saldo.

Ringkasan dashboard dihitung backend untuk seluruh periode, sedangkan tabel
transaksi menampilkan maksimum 50 data terbaru.

## Struktur

```text
src/
  api.js       # fetch client dengan autentikasi bearer
  App.jsx      # login, dashboard, transaksi, parsing bukti, akun
  index.css
  main.jsx
```
