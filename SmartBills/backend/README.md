# SmartBills Backend

REST API untuk aplikasi SmartBills (pencatatan transaksi, kategori, harga komoditas,
analitik, dan fitur AI/OCR). Dibangun dengan Express 5 + PostgreSQL.

## Status

Backend menyediakan autentikasi JWT, health check, daftar kategori, pencatatan
transaksi beserta item, unggah bukti transaksi privat, sinkronisasi saldo
transaksional, analytics historis, galeri receipt privat, dan dokumentasi API
melalui Swagger UI. Integrasi OCR/AI eksternal belum tersedia; transaksi saat
ini dicatat melalui form manual.

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

## Menyiapkan Dan Menjalankan Backend

Persyaratan: Node.js/npm dan PostgreSQL sudah terpasang dan PostgreSQL sedang
berjalan.

### 1. Instal dependency

Jalankan perintah dari folder `backend`:

```powershell
npm install
```

### 2. Siapkan file environment

Jika belum memiliki `.env`, salin contoh:

```powershell
Copy-Item .env.example .env
```

Edit `.env` dan sesuaikan setidaknya `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET` dengan mesin lokal Anda. Jangan
commit atau membagikan `.env` karena berisi konfigurasi rahasia. Bila
`DATABASE_URL` diisi, koneksi itu akan digunakan sebagai pengganti konfigurasi
database terpisah.

Contoh pengaturan database pengembangan lokal:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartbills
DB_USER=postgres
DB_PASSWORD=password_postgres_lokal
JWT_SECRET=ganti_dengan_secret_lokal_yang_kuat
```

Pastikan database yang ditulis pada `DB_NAME` sudah dibuat di PostgreSQL.
Dalam workflow proyek ini, `smartbills` adalah database pengembangan utama.
Database bernama `smartbills_schema_test` hanya untuk pengujian setup dari
database kosong; gunakan hanya jika memang ingin menjalankan pengujian skema
terisolasi.

### 3. Buat skema database

Untuk database baru yang masih kosong, jalankan:

```powershell
npm run db:setup
```

Perintah ini membuat tabel, foreign key, indeks, dan kategori awal di database
yang sedang dikonfigurasi dalam `.env`. Pastikan `DB_NAME` atau `DATABASE_URL`
menunjuk ke database yang memang ingin disiapkan sebelum menjalankannya.

Jika database `smartbills` sudah berisi skema dan API berjalan, setup tidak
perlu dijalankan ulang. `IF NOT EXISTS` mencegah pembuatan ulang objek yang
sudah ada, tetapi skrip ini bukan migration dan tidak memperbarui struktur
tabel lama. Untuk database lama yang perlu perubahan skema, tinjau dan jalankan
migration yang sesuai. Selalu pastikan target database dan cadangkan data
penting sebelum mengubah skema.

### 4. Jalankan server

Mode pengembangan:

```powershell
npm run dev
```

Mode normal:

```powershell
npm start
```

Server menggunakan port `5000` secara default (dapat diubah dengan `PORT`).
Biarkan terminal server tetap berjalan.

### 5. Buka Swagger dan uji API

Setelah server aktif, buka:

- Swagger UI: <http://localhost:5000/api-docs>
- Health check API: <http://localhost:5000/api/health>
- Health check PostgreSQL: <http://localhost:5000/api/health/db>

Untuk mencoba endpoint yang memerlukan autentikasi, daftarkan akun lewat
`POST /api/auth/register`, kemudian login lewat `POST /api/auth/login`.
Salin `data.token` dari respons login, klik **Authorize** di Swagger, dan
tempel token JWT. `GET /api/categories` menampilkan ID dan nama kategori;
filter opsional tersedia melalui `?type=EXPENSE` atau `?type=INCOME`.
Untuk upload transaksi, gunakan `POST /api/transactions` dengan
`multipart/form-data`.

Jalankan tes otomatis dari folder `backend` dengan:

```powershell
npm test
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

## Role Pengguna

Untuk database lama yang belum memiliki kolom role, jalankan migration:

```bash
npm run migrate:roles
```

Setiap akun baru memiliki role `user`. Role `admin` hanya diberikan melalui perintah lokal:

```bash
npm run set-user-role -- user@example.com admin
```

Endpoint `GET /api/users/me` tersedia untuk pengguna yang sudah login. Endpoint
`GET /api/users` hanya tersedia untuk role `admin` dan tidak mengembalikan saldo
pengguna lain.

## Model Transaksi

`npm run db:setup` membuat skema transaksi saat menyiapkan database kosong.
Migration berikut tersedia untuk database lama yang belum memiliki skema atau
kolom transaksi terkini:

```bash
npm run migrate:transactions
```

Kolom `source` menerima `MANUAL`, `OCR`, atau `AI`. Query detail transaksi selalu
dibatasi dengan `user_id` agar transaksi pengguna lain tidak dapat diakses.

Bukti transaksi disimpan secara privat di `uploads/receipts`. Database menyimpan
nama file acak di `transactions.image_url`; folder ini tidak dipublikasikan
sebagai static file. Upload hanya menerima JPEG, PNG, dan WebP hingga 5 MB.
Semua endpoint transaksi memerlukan header Authorization dengan JWT login.

### Upload Transaksi Dan Bukti

`POST /api/transactions` menerima `multipart/form-data`. Field `receipt` bersifat
opsional; `type` dan `amount` wajib. Field opsional: `categoryId`, `merchantName`,
`notes`, `transactionDate`, dan `items` (JSON array). Setiap item berisi
`itemName`, `quantity`, `unitPrice`, dan `totalPrice`; `totalPrice` boleh
dihitung dari `quantity * unitPrice`.

Contoh:

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "type=EXPENSE" \
  -F "amount=45000" \
  -F "merchantName=Warung" \
  -F 'items=[{"itemName":"Beras","quantity":1,"unitPrice":45000}]' \
  -F "receipt=@./struk.jpg"
```

Transaksi, item, dan referensi file disimpan secara atomik di PostgreSQL.
Jika validasi atau penyimpanan database gagal, file unggahan dibersihkan.

### Galeri Dan Akses Bukti

- `GET /api/transactions?limit=50&offset=0` mengembalikan transaksi milik
  pengguna yang login dan `receipt_url` untuk transaksi dengan bukti.
- `GET /api/transactions/:transactionId` mengembalikan detail transaksi beserta
  item.
- `GET /api/transactions/:transactionId/receipt` mengirim gambar privat setelah
  memverifikasi JWT dan kepemilikan transaksi.

Galeri web/mobile harus meminta `receipt_url` dengan token JWT (misalnya memakai
`fetch` lalu membuat object URL dari respons gambar). Path filesystem dan file
bukti tidak tersedia sebagai URL publik. Endpoint ini belum menjalankan OCR/AI.

### Sinkronisasi Saldo Dan Analytics

Pembuatan, pembaruan, dan penghapusan transaksi memperbarui `current_balance`
di dalam transaksi PostgreSQL yang sama dengan perubahan transaksi dan item.
Pemasukan menambah saldo, pengeluaran mengurangi saldo, dan operasi ditolak
apabila menghasilkan saldo negatif. Saldo awal yang ditetapkan setelah
pencatatan transaksi juga memperhitungkan net transaksi yang sudah ada.

Semua endpoint berikut memerlukan JWT:

- `GET /api/analytics?period=daily` merangkum 7 hari terakhir.
- `GET /api/analytics?period=weekly` merangkum 12 minggu terakhir.
- `GET /api/analytics?period=monthly` (default) merangkum 6 bulan terakhir.
- Overview berisi saldo terkini, total pemasukan/pengeluaran, arus kas bersih,
  jumlah transaksi, seri arus kas, dan breakdown pengeluaran per kategori.
- `GET /api/analytics/receipts?period=monthly&limit=12&offset=0` memberikan
  halaman receipt milik pengguna pada periode yang dipilih. Gambar tetap harus
  diminta melalui endpoint receipt transaksi yang memverifikasi JWT dan
  kepemilikan.

Rentang periode mencakup bucket kalender berjalan. Overview dihitung di backend
dari seluruh transaksi dalam rentang tersebut, bukan sampel transaksi terbaru.

## Langkah implementasi berikutnya

1. Implementasikan OCR dan LLM provider dengan validasi hasil sebelum data
  dikirim ke jalur transaksi yang sudah menjaga saldo secara atomik.
2. Tambahkan pengujian integrasi PostgreSQL untuk sinkronisasi saldo bersamaan,
  agregasi analytics, akses lintas pengguna, dan galeri receipt.
