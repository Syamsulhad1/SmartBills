# SmartBills Backend

REST API untuk aplikasi SmartBills (pencatatan transaksi, kategori, harga komoditas,
analitik, dan fitur AI/OCR). Dibangun dengan Express 5 + PostgreSQL.

## Status

Repo ini masih berupa **kerangka (scaffold)**: seluruh folder dan file sudah dibuat,
namun isinya masih placeholder berisi komentar `TODO` yang perlu diimplementasikan.

## Struktur

```
backend/
├── src/
│   ├── config/         # database.js, environment.js
│   ├── controllers/    # handler HTTP per domain
│   ├── middleware/     # auth, error, validation
│   ├── models/         # akses data (query SQL)
│   ├── routes/         # definisi endpoint per domain
│   ├── services/       # logika bisnis & integrasi eksternal
│   ├── validators/     # aturan validasi payload
│   ├── utils/          # helper response & logger
│   ├── app.js          # konfigurasi instance Express
│   └── server.js       # entry point (listen)
├── tests/              # pengujian
├── .env                # konfigurasi lokal (tidak di-commit)
├── .env.example        # contoh konfigurasi
├── .gitignore
├── package.json
└── README.md
```

Alur pemanggilan: `routes` → `middleware` (auth/validation) → `controllers` → `services` → `models`.

## Menjalankan

```bash
npm install
cp .env.example .env   # lalu sesuaikan nilainya
npm run dev            # nodemon
npm start              # mode produksi
```

## Ketergantungan utama

| Paket | Fungsi |
| --- | --- |
| `express` | HTTP framework |
| `pg` | driver PostgreSQL |
| `jsonwebtoken` | autentikasi JWT |
| `bcryptjs` | hashing password |
| `multer` | unggah file (nota/struk) |
| `cors`, `dotenv` | CORS & environment |

## Langkah implementasi berikutnya

1. Implementasikan `src/config/database.js` dan `src/config/environment.js`.
2. Buat skema tabel (users, categories, transactions, transaction_items, commodity_prices).
3. Implementasikan `authService` + `authMiddleware`, lalu pasang `authRoutes`.
4. Lanjutkan ke transaksi, kategori, analitik, harga, dan AI/OCR.
