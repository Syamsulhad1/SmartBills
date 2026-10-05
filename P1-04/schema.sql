-- =========================================================
-- MyBills - Database Schema
-- PostgreSQL
-- =========================================================

-- =========================================================
-- 1. TABEL USERS
-- Menyimpan data pengguna MyBills
-- =========================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
        CHECK (current_balance >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. TABEL CATEGORIES
-- Menyimpan kategori pemasukan dan pengeluaran
-- Contoh:
-- F&B, Pangan Pokok, Kebersihan, BBM, Gaji, dll.
-- =========================================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL
        CHECK (type IN ('INCOME', 'EXPENSE')),

    -- Mencegah kategori dengan nama dan tipe yang sama
    UNIQUE (name, type)
);


-- =========================================================
-- 3. TABEL TRANSACTIONS
-- Menyimpan data utama/header transaksi
-- =========================================================

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,

    -- Pemilik transaksi
    user_id INT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- Kategori transaksi
    category_id INT
        REFERENCES categories(category_id)
        ON DELETE SET NULL,

    -- Jenis transaksi
    type VARCHAR(10) NOT NULL
        CHECK (type IN ('INCOME', 'EXPENSE')),

    -- Nominal transaksi harus lebih besar dari 0
    amount DECIMAL(15, 2) NOT NULL
        CHECK (amount > 0),

    -- Nama toko/merchant
    merchant_name VARCHAR(100),

    -- URL foto struk/bukti transaksi
    image_url TEXT,

    -- Waktu transaksi
    transaction_date TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    -- Waktu data dimasukkan ke database
    created_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 4. TABEL TRANSACTION_ITEMS
-- Menyimpan rincian barang yang diekstrak oleh AI
-- dari foto struk
-- =========================================================

CREATE TABLE transaction_items (
    item_id SERIAL PRIMARY KEY,

    -- Transaksi induk
    transaction_id INT NOT NULL
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE,

    -- Nama barang
    item_name VARCHAR(150) NOT NULL,

    -- Jumlah barang
    quantity INT NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    -- Harga satuan
    unit_price DECIMAL(15, 2)
        CHECK (unit_price >= 0),

    -- Total harga item
    total_price DECIMAL(15, 2) NOT NULL
        CHECK (total_price >= 0)
);


-- =========================================================
-- 5. TABEL MASTER_COMMODITY_PRICES
-- Menyimpan data acuan harga komoditas pangan lokal
-- untuk kebutuhan analytics/perbandingan harga
-- =========================================================

CREATE TABLE master_commodity_prices (
    commodity_id SERIAL PRIMARY KEY,

    -- Nama komoditas
    commodity_name VARCHAR(100) NOT NULL,

    -- Satuan komoditas
    -- Contoh: kg, liter, pcs, gram
    unit VARCHAR(30) NOT NULL,

    -- Harga acuan
    reference_price DECIMAL(15, 2) NOT NULL
        CHECK (reference_price >= 0),

    -- Wilayah harga
    region VARCHAR(100),

    -- Tanggal pencatatan harga
    recorded_date DATE NOT NULL
        DEFAULT CURRENT_DATE
);

