# SmartBills Backend

REST API untuk aplikasi SmartBills (pencatatan transaksi, kategori, harga komoditas,
analitik, dan fitur AI/OCR). Dibangun dengan Express 5 + PostgreSQL.

## Status

Backend menyediakan autentikasi JWT, health check, daftar kategori, pencatatan
transaksi beserta item, unggah bukti transaksi privat, sinkronisasi saldo
transaksional, analytics historis, galeri receipt privat, dan dokumentasi API
melalui Swagger UI. Dashboard juga menampilkan berita harga pangan dan IHSG
dari feed RSS CNBC Indonesia. Parsing teks OCR melalui Gemini menghasilkan draft untuk
ditinjau. OCR gambar lokal memakai Tesseract.js pada service terpisah. Draft AI
tidak disimpan otomatis atau mengubah saldo.

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
`DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET` dengan mesin lokal Anda. Untuk
frontend Vite lokal, pastikan `CLIENT_URL` dan `CORS_ORIGIN` menunjuk ke
`http://localhost:5173`. Jangan commit atau membagikan `.env` karena berisi konfigurasi rahasia. Bila
`DATABASE_URL` diisi, koneksi itu akan digunakan sebagai pengganti konfigurasi
database terpisah.

OCR lokal memerlukan `OCR_SERVICE_TOKEN` yang sama antara backend dan service
OCR. Gunakan token acak minimal 32 karakter, lalu isi `OCR_SERVICE_URL` dengan
`http://localhost:8080`. Dari PowerShell, token acak dapat dibuat dengan:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Salin hasilnya ke `OCR_SERVICE_TOKEN` dalam `.env` lokal; jangan commit atau
membagikan token tersebut.

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

Berita dashboard dimuat melalui `GET /api/news` (JWT required), berasal dari
feed RSS CNBC Indonesia, dan di-cache sementara di backend. Artikel selalu
ditautkan ke sumber aslinya; gambar ditampilkan dari URL gambar feed jika
tersedia. Ketersediaan dan gambar artikel mengikuti feed penyedia.

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

Endpoint berikut menerima `multipart/form-data` dan memerlukan JWT:

- `POST /api/transactions/income` hanya menyimpan pemasukan (`type=INCOME`).
- `POST /api/transactions/expense` hanya menyimpan pengeluaran (`type=EXPENSE`).
- `POST /api/transactions` tetap tersedia untuk kompatibilitas dan menerima
  kedua jenis transaksi.

Field `receipt` bersifat opsional; `type` dan `amount` wajib. Field opsional:
`categoryId`, `merchantName`, `notes`, `transactionDate`, dan `items` (JSON
array). Setiap item berisi `itemName`, `quantity`, `unitPrice`, dan `totalPrice`;
`totalPrice` boleh dihitung dari `quantity * unitPrice`. Endpoint khusus akan
menolak `type` yang tidak sesuai dengan URL.

Contoh:

```bash
curl -X POST http://localhost:5000/api/transactions/expense \
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
- `PUT /api/transactions/income/:transactionId` hanya memperbarui transaksi
  pemasukan (`type=INCOME`).
- `PUT /api/transactions/expense/:transactionId` hanya memperbarui transaksi
  pengeluaran (`type=EXPENSE`).
- `PUT /api/transactions/:transactionId` memperbarui transaksi dan daftar item
  menggunakan body JSON dan tetap tersedia untuk kompatibilitas.
- `DELETE /api/transactions/:transactionId` menghapus transaksi dan
  membalikkan dampaknya pada saldo.
- `GET /api/transactions/:transactionId/receipt` mengirim gambar privat setelah
  memverifikasi JWT dan kepemilikan transaksi.

Galeri web/mobile harus meminta `receipt_url` dengan token JWT (misalnya memakai
`fetch` lalu membuat object URL dari respons gambar). Path filesystem dan file bukti tidak tersedia sebagai URL publik.

### Menjalankan OCR Lokal

Service Tesseract berjalan terpisah dari API backend. Pasang dependency OCR
satu kali dari folder `backend\ocr-service`:

```powershell
Set-Location .\ocr-service
npm ci
Set-Location ..
```

Isi `OCR_SERVICE_TOKEN` dan `OCR_SERVICE_URL` di `.env` backend, lalu jalankan
OCR dan API pada dua terminal:

```powershell
npm run start:ocr
```

```powershell
npm run dev
```

Service OCR memakai port `8080` secara default; API backend tetap di `5000`.
Keduanya memakai token internal yang sama untuk mengamankan panggilan OCR.

Endpoint `POST /api/ai/ocr` memerlukan JWT dan `multipart/form-data` dengan
field `receipt`. Gambar JPEG/PNG/WebP dibatasi maksimal 4 MB. Respons berisi
teks OCR mentah saja; gambar tidak disimpan oleh endpoint OCR.

### Parsing Teks Bukti Dengan Gemini

Isi `AI_API_KEY` di `.env`; model default aplikasi adalah
`gemini-3.5-flash-lite`, yang ditujukan untuk ekstraksi data berlatensi rendah.
Ubah `AI_MODEL` bila perlu menggunakan model lain yang tersedia untuk proyek
Google AI Studio Anda. Request parsing dibatasi 30 detik dan respons dibatasi
4096 token. Jangan pernah mengirim API key dari frontend. Endpoint terlindungi JWT:

- `POST /api/ai/parse-transaction` menerima JSON `{"text":"..."}`.
- Gunakan teks dari `POST /api/ai/ocr` sebagai masukan parser.
- Teks OCR dikirim ke Google Gemini untuk menghasilkan jenis, nominal,
  merchant, tanggal, kategori, item, dan warnings.
- Hasil hanya draft (`ready_for_review` atau `needs_review`). Periksa dan
  koreksi draft sebelum secara terpisah mengirim transaksi ke endpoint transaksi.
- Endpoint parsing tidak menyimpan data dan tidak mengubah saldo. Teks yang
  dikirim diproses oleh Google; hapus/samarkan informasi sensitif yang tidak
  diperlukan.
- Error provider hanya mencatat status HTTP dan kode provider yang dibatasi;
  body respons dan teks OCR tidak dimasukkan ke log.

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

1. Uji alur OCR dan parsing terintegrasi dengan beberapa struk yang sudah
  disamarkan; akurasi hasil OCR lama tidak perlu diuji ulang.
2. Tambahkan pengujian integrasi PostgreSQL untuk sinkronisasi saldo bersamaan,
  agregasi analytics, akses lintas pengguna, dan galeri receipt.
