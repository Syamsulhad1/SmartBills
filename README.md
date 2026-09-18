# LAPORAN SMART DIGITAL PRODUCT: [Nama Produk]

## 1. Ringkasan Eksekutif (Executive Summary)
*   **Masalah:**  Pengguna kesulitan mencatat pengeluaran dan pemasukan harian secara konsisten serta memantau saldo terkini secara akurat karena proses pencatatan    manual yang memakan waktu.

*   **Solusi Digital:** : Sistem pencatatan keuangan multimodal berbasis AI Agent terpusat yang secara otomatis menganalisis foto struk/nota (OCR + LLM), mengutak-atik saldo, dan menyajikan analytics rekapitulasi keuangan secara real-time.

*   **Target Pengguna:** : Masyarakat umum, pekerja, mahasiswa, dan pemilik usaha kecil yang membutuhkan pencatatan kas harian serba otomatis dan praktis.

## 2. Arsitektur Sistem (System Architecture)


*   **Diagram Arsitektur:**
+-----------------------------------------------------------------------------------+
|                                   CLIENT LAYER                                    |
|                                                                                   |
|   +------------------------------------+   +----------------------------------+   |
|   |            MOBILE APP              |   |          WEB DASHBOARD           |   |
|   |  - React Native (Expo)             |   |  - React.js                      |   |
|   |  - Camera & Image Picker Module    |   |  - Chart.js                      |   |
|   |  - Balance & Manual Input Form     |   |  - Financial Analytics & Audit   |   |
|   +-----------------+------------------+   +----------------+-----------------+   |
+---------------------|---------------------------------------|---------------------+
                      |                                       |
                      | HTTPS / REST API                      | HTTPS / REST API
                      v                                       v
+-----------------------------------------------------------------------------------+
|                                  BACKEND LAYER                                    |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                         CENTRALIZED REST API SERVER                       |   |
|   |                         (          Node.js          )                     |   |
|   |                                                                           |   |
|   |   [ Auth Service ]  [ Balance Service ]  [ AI Transaction Orchestrator ]  |   |
|   +--------------------------------------+------------------------------------+   |
+------------------------------------------|----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v Internal API Call                             v Database Driver
+------------------------------------+           +----------------------------------+
|              AI ENGINE             |           |          DATABASE LAYER          |
|                                    |           |                                  |
|  - OCR Module:                     |           |  - PostgreSQL                    |
|    Google Vision                   |           |  - User Balance & Profiles       |
|  - LLM Agent:                      |           |  - Transactions & Items          |
|    Gemini 1.5                      |           |  - Categories & Master Prices    |
+------------------------------------+           +----------------------------------+


*   **Spesifikasi Teknologi (Tech Stack):**
    *   **Perangkat Keras/Sensor:**  Kamera Smartphone & Storage Media: Digunakan untuk mengambil foto bukti fisik transaksi (struk belanjaan atau nota/bukti transfer) serta mengakses galeri perangkat.

    *   **Backend & API:**  Node.js (Express.js) : Menyediakan layanan REST API terpusat untuk autentikasi (JWT), manajemen saldo, orchestrator AI, dan pengolahan transaksi.

    *   **Kecerdasan Buatan/Algoritma/Model/Dataset:**
    OCR Engine (Google Cloud Vision ): Ekstraksi teks mentah (raw text) dari citra foto bukti transaksi.
    LLM Agent (Google Gemini 1.5 ): Prompt engineering terstruktur untuk parsing teks OCR menjadi JSON (memilih tipe INCOME/EXPENSE, nominal total, kategori, dan rincian item).
    Dataset: Master Kategori Keuangan (Pangan Pokok, Kebersihan, F&B, Kesehatan, BBM) dan Master Data Acuan Harga Pangan Lokal.

    *   **Frontend/Antarmuka:** 
    Mobile App:  React Native (Expo) dengan Fetch API/Axios untuk input saldo, pengambilan foto bukti, dan tampilan status saldo real-time.
    Web Dashboard: React.js / Vue.js terintegrasi dengan Chart.js (atau Recharts) untuk visualisasi rekapitulasi grafik mingguan/bulanan dan galeri audit transaksi.

## 3. Rancangan Fitur Inti (Core Features)
    Otomatisasi Transaksi Multimodal (AI Receipt & Transfer Scanner):
    Deskripsi: Pengguna cukup mengambil foto struk belanjaan fisik atau tangkapan layar (screenshot) bukti transfer. Sistem secara otomatis mengekstrak teks menggunakan OCR dan diurai oleh LLM Agent untuk membedakan jenis transaksi (EXPENSE atau INCOME), menarik total nominal, menentukan kategori belanja, serta merinci setiap baris barang belanjaan.
    Nilai Smart: Menghilangkan kebutuhan penginputan data keuangan secara manual per item, mengurangi potensi kesalahan manusia (human error), serta memproses dokumen fisik menjadi data terstruktur dalam hitungan detik.

    Logika Pemutakhiran Saldo Otomatis (Real-Time Balance Synchronizer):
    Deskripsi: Modul backend terpusat yang mengeksekusi kalkulasi saldo secara real-time dan atomik. Begitu AI Engine berhasil memvalidasi bukti transaksi, saldo utama pengguna (current_balance) langsung bertambah (jika INCOME) atau terpotong (jika EXPENSE) tanpa perlu konfirmasi berulang.
    Nilai Smart: Menjamin konsistensi data finansial kas pengguna secara instan dan tepercaya (ACID compliance) antara input di Mobile App dan tampilan di Web Dashboard.

    Audit & Visualisasi Rekapitulasi Keuangan (Smart Analytics Dashboard):
    Deskripsi: Dashboard berbasis web yang menyajikan analisis rekapitulasi keuangan mingguan dan bulanan. Dilengkapi dengan agregasi data visual (grafik alokasi kategori & arus kas) serta galeri audit foto bukti transaksi yang terhubung langsung dengan rincian item belanjaan.
    Nilai Smart: Memberikan pemahaman visual (financial insight) kepada pengguna mengenai pola pengeluaran terbesar mereka secara otomatis tanpa perlu melakukan rekap manual di spreadsheet.

### [Nama Fitur 1 - AI Multimodal Receipt & Transfer Scanner]
*   **Fungsi:**Memproses dan mengekstrak data keuangan secara otomatis dari dokumen fisik atau digital 
    (struk belanja dan bukti transfer) tanpa penginputan manual     peritem.
*   **Input Data:** Citra/foto bukti transaksi (Image/Photo dari kamera atau galeri).
*   **Output/Aksi:** Ekstraksi data terstruktur berformat JSON yang berisi jenis transaksi (INCOME / EXPENSE),
    total nominal, kategori belanja, serta daftar rincian   item barang beserta harganya.

### [Nama Fitur 2 - Real-Time Balance Synchronizer & Auto-Deduction]
*   **Fungsi:** Mengelola dan memperbarui saldo kas utama pengguna secara atomik dan real-time begitu transaksi tervalidasi oleh AI Engine.
*   **Input Data:** Hasil ekstraksi JSON dari AI Engine (jenis transaksi INCOME/EXPENSE dan nominal total) serta data saldo terkini pengguna (current_balance).
*   **Output/Aksi:** Pembaruan nilai saldo secara otomatis pada database terpusat
    (penambahan atau pemotongan saldo) dan pencatatan riwayat transaksi ke dalam tabel basis data.

### [Nama Fitur 2 - Smart Analytics & Visual Audit Dashboard]
*   **Fungsi:** Menyajikan rekapitulasi, analisis pola pengeluaran, serta audit visual bukti transaksi secara otomatis untuk pemantauan kesehatan finansial.
*   **Input Data:** Riwayat transaksi historis harian, mingguan, dan bulanan, data kategori, serta berkas foto bukti fisik yang tersimpan di server.
*   **Output/Aksi:** Visualisasi grafik alokasi keuangan (Pie Chart & Bar Chart),
    rekapitulasi statistik arus kas, dan galeri interaktif untuk kebutuhan audit bukti belanja.


## 4. Alur Data & Cara Kerja (System Workflow)

1.  **Pengumpulan Data (Data Collection):** 
Pengumpulan Data (Data Collection):
Sistem memperoleh data dari dua sumber utama di aplikasi mobile:
-Direct User Input: Pengguna memasukkan nilai saldo awal (initial balance) atau form transaksi manual melalui antarmuka aplikasi mobile.
-Media Capture (Multimodal Input): Pengguna mengambil foto atau mengunggah gambar bukti fisik transaksi (struk belanjaan atau bukti transfer/nota) menggunakan modul kamera dan galeri perangkat.
2.  **Transmisi & Komunikasi (Transmission):** 
Data dikirimkan dari aplikasi mobile ke server backend terpusat (Centralized Backend) menggunakan protokol HTTPS berbasis REST API:
-Gambar/bukti transaksi dikirimkan dalam format Multipart/Form-Data ke endpoint upload backend.
-Data teks atau form transaksi dikirimkan dalam format payload JSON menggunakan metode HTTP POST.
-Seluruh permintaan API dilengkapi dengan header enkripsi token JWT (JSON Web Token) untuk autentikasi keamanan pengguna.
3.  **Pemrosesan (Processing):** 
Setelah request diterima oleh server backend, proses pengolahan data berlangsung melalui tahapan berikut:
-OCR Extraction: Gambar bukti transaksi diproses oleh modul OCR (Google Cloud Vision / Tesseract) untuk mengekstrak seluruh teks mentah (raw text).
-LLM Parsing & Categorization: Teks mentah diteruskan ke LLM Agent (Gemini/GPT-4o) dengan structured prompt untuk mengklasifikasikan jenis transaksi (INCOME/EXPENSE), mengekstrak total nominal, mengategorikan belanjaan, serta merinci baris item barang.
-Atomic Database Execution: Backend mengeksekusi database transaction secara atomik: menyimpan header transaksi ke tabel transactions, merinci item ke transaction_items, dan secara otomatis memotong atau menambah current_balance pada tabel users.
4.  **Eksekusi/Tampilan (Action/Display):** 
Hasil pemrosesan backend dikembalikan dan disajikan kepada pengguna secara real-time:
-Mobile App: Mengembalikan respon JSON berisi status transaksi dan pembaruan saldo terkini yang langsung direfleksikan di antarmuka aplikasi.
-Web Dashboard: Memanggil REST API backend menggunakan HTTP GET untuk menarik riwayat transaksi, menampilkan visualisasi grafik rekapitulasi keuangan (Pie Chart & Bar Chart), serta menyajikan galeri foto bukti transaksi untuk kebutuhan audit.

## 5. Pengujian & Limitasi (Testing & Limitations)
*   **Metrik Pengujian:** 
Metrik Pengujian:
-Response Time API Backend: Diukur berdasarkan kecepatan waktu tanggap (latency) server backend dalam memproses permintaan HTTP REST API (target $\le 200$ ms untuk endpoint transaksi standar dan \le 3 detik untuk pemrosesan AI multimodal lengkap).
-Akurasi AI Parsing (OCR + LLM): Diukur berdasarkan persentase keberhasilan LLM dalam mengekstrak data dari teks OCR secara presisi, mencakup ketepatan klasifikasi jenis transaksi (INCOME/EXPENSE), nominal total, serta pemetaan kategori belanja.
-Konsistensi Saldo & Transaksi Atomik (ACID Test): Diuji dengan memastikan bahwa kalkulasi otomatis saldo utama pengguna (current_balance) selalu sesuai $100\%$ tanpa ada kecacatan data (race condition) saat terjadi transaksi bersamaan.
-Integrasi End-to-End (Mobile & Web): Menguji keberhasilan alur data dari pengunggahan foto di aplikasi mobile hingga pembaruan grafik dan galeri foto bukti secara real-time di Web Dashboard.
*   **Limitasi Saat Ini:** 
Limitasi Saat Ini:
-Kualitas Gambar & Tulisan Tangan: Akurasi ekstraksi OCR menurun apabila foto struk belanja yang diunggah tampak buram (blurry), memiliki pencahayaan sangat minim, atau menggunakan nota tulisan tangan yang tidak rapi.
-Ketergantungan Kuota & Latensi API Pihak Ketiga: Waktu pemrosesan AI sangat bergantung pada ketersediaan, kecepatan jaringan, serta batasan kuota (rate limit) layanan API eksternal (Google Cloud Vision & Gemini/OpenAI).
-Struktur Struk Non-Standar: Struk belanja yang memiliki tata letak (layout) atau format teks yang sangat tidak lazim terkadang memerlukan penyesuaian kategori manual oleh pengguna.
