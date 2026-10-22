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

Swagger UI tersedia di `http://localhost:5000/api-docs` setelah server berjalan.
Gunakan `POST /api/auth/register` untuk membuat akun, lalu `POST /api/auth/login`
untuk mendapatkan token. Klik **Authorize** dan masukkan token JWT sebelum
mencoba endpoint transaksi. Pada `POST /api/transactions`, pilih
`multipart/form-data`, isi `type` dan `amount`, lalu pilih file pada field
`receipt` (opsional).

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

Setelah database tersedia, tambahkan role dengan migration berikut:

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

Jalankan migration transaksi sebelum memakai model `transactions`:

```bash
npm run migrate:transactions
```

Kolom `source` menerima `MANUAL`, `OCR`, atau `AI`. Query detail transaksi selalu
dibatasi dengan `user_id` agar transaksi pengguna lain tidak dapat diakses.

## Setup Database Dan Bukti Transaksi

Untuk membuat skema lengkap dari database kosong, termasuk foreign key, indeks,
dan kategori awal, jalankan:

```bash
npm run db:setup
```

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
bukti tidak tersedia sebagai URL publik. Endpoint ini tidak memperbarui saldo
pengguna dan belum menjalankan OCR/AI.

## Langkah implementasi berikutnya

1. Hubungkan layar upload dan galeri frontend ke endpoint transaksi di atas.
2. Tambahkan pengujian integrasi menggunakan PostgreSQL untuk upload, akses
   lintas pengguna, dan kegagalan penyimpanan.
3. Implementasikan pembaruan saldo serta integrasi OCR/AI secara transaksional.
