# SmartBills Frontend

Frontend web SmartBills menggunakan React + Vite, React Router, Bootstrap 5, dan Chart.js. Disesuaikan dengan backend Express 5 + PostgreSQL.

## Kebutuhan
- Node.js 20+ (disarankan)
- Backend SmartBills aktif pada `http://localhost:5000`
- Akun yang sudah terdaftar melalui endpoint backend

## Menjalankan
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```
Buka URL Vite yang ditampilkan di terminal (umumnya `http://localhost:5173`).

Atur `VITE_API_BASE_URL` di `.env` bila backend berada di host/port lain. Setelah mengubah `.env`, restart Vite.

## Yang sudah dihubungkan
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/me`
- `GET /api/categories`
- `GET /api/transactions?limit=50&offset=0`
- `GET /api/transactions/:transactionId`
- `POST /api/transactions` dengan `multipart/form-data`
- `GET /api/transactions/:transactionId/receipt` untuk bukti privat

API privat mengirim `Authorization: Bearer <JWT>`. Token disimpan di `sessionStorage` agar sesi berakhir saat tab/sesi browser ditutup. Untuk produksi, tinjau ulang strategi penyimpanan token sesuai model ancaman aplikasi.

## Catatan status fitur
Backend yang dijelaskan saat ini belum menjalankan OCR/AI, belum memperbarui saldo otomatis, dan belum memiliki endpoint analitik khusus atau harga komoditas. Karena itu:
- Dashboard hanya menghitung ringkasan sederhana dari transaksi yang berhasil dimuat (maksimum 50 data pada permintaan awal), bukan laporan keuangan lengkap.
- Pemindai struk di halaman transaksi hanya menyediakan upload bukti dan input manual; tidak menampilkan hasil OCR palsu.
- Kartu saldo tidak ditampilkan karena API saldo belum dikonfirmasi tersedia.
- Grafik hanya merangkum transaksi yang telah dimuat di browser.

## Struktur
```text
src/
  components/       # sidebar, stat card, protected route
  layouts/          # dashboard shell
  pages/            # login, register, dashboard, transaksi, detail, scanner, profil
  services/         # fetch client dan service API
  utils/            # format mata uang/tanggal
  App.jsx
  main.jsx
  index.css
```
