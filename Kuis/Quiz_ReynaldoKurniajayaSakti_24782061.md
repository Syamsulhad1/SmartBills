# Laporan Kuis 1: Interconnecting between Digital Awareness and Application Design

**Mata Kuliah:** Pemrograman Internet II (PIE 1516)  
**Program Studi:** Teknologi Rekayasa Internet, Politeknik Negeri Lampung  

---

## Bagian 1. Identitas dan Topik Proyek Aplikasi

### Identitas Mahasiswa
* **Nama:** Reynaldo Kurnia Jaya Sakti
* **NPM:** 24782061
* **Program Studi:** Teknologi Rekayasa Internet (IET)
* **Anggota Kelompok:**
  1. Muhammad Sahrul Ikhsan (NPM: 23758018)
  2. Muhammad Aldi Prasetyo (NPM: 24782019)
  3. Syamsul Hadi (NPM: 24782031)
  4. Reynaldo Kurnia Jaya Sakti (NPM: 24782061)

---

### Topik Proyek Aplikasi
* **Nama Aplikasi:** Smartbills (MyBills)
* **Deskripsi Singkat dan Tujuan Utama Aplikasi:**  
  Smartbills adalah sistem pencatatan keuangan multimodal berbasis AI Agent terpusat. Aplikasi ini dirancang untuk mengatasi masalah utama masyarakat yang sering kesulitan mencatat pengeluaran dan pemasukan harian secara konsisten serta memantau saldo terkini secara akurat karena proses pencatatan manual yang memakan waktu dan rentan *human error*. Solusi digital yang ditawarkan adalah otomatisasi ekstraksi data dari foto struk belanja/nota fisik atau bukti transfer menggunakan kombinasi OCR (Google Cloud Vision) dan LLM Agent (Google Gemini 1.5), yang secara otomatis memutakhirkan saldo pengguna dan menyajikan analitik rekapitulasi keuangan secara *real-time*.
* **Target Pengguna Utama:**  
  Masyarakat umum, pekerja, mahasiswa, dan pemilik usaha kecil/UMKM yang membutuhkan pencatatan kas harian yang serba otomatis, praktis, dan akurat.

---

## Bagian 2. Resume Modul Digital Awareness

### Modul 1 — There's a Whole New World Out There!
Modul ini mengulas tentang evolusi konektivitas digital dan dampaknya terhadap konvergensi dunia fisik (analog) dan maya (digital). Perkembangan internet yang awalnya berfokus pada pertukaran teks statis di dekade 1990-an kini telah bertransisi menjadi ekosistem Web 2.0 yang dinamis, interaktif, serta didukung oleh jaringan Internet of Things (IoT). Konsep IoT memungkinkan perangkat fisik sehari-hari (seperti termostat pintar atau kontrol suhu otomatis) saling bertukar data secara *real-time* untuk membantu otomatisasi aktivitas manusia.

Integrasi ini mentransformasi operasional pada berbagai sektor utama, mulai dari otomatisasi transaksi perbankan secara *online*, fleksibilitas sistem pendidikan berbasis *e-learning* tanpa batas geografis, hingga pemanfaatan platform publik dan administratif pemerintah. Selain itu, teknologi digital mempermudah alur kerja harian pengguna melalui berbagai aplikasi khusus, seperti pemesanan kebutuhan harian (*e-commerce*), pembayaran tagihan otomatis, komunikasi interaktif jarak jauh, pemantauan kesehatan serta keuangan, hingga sistem navigasi peta berbasis *real-time traffic updates*. Modul ini juga memetakan lanskap layanan web berdasarkan model kepemilikan dan kontennya—mulai dari platform publik/pemerintah, berbasis komunitas (*repository* seperti Wikipedia), media sosial yang didukung iklan, hingga platform hiburan dan langganan komersial.

### Modul 2 — You'll Need Some Basic Tools
Modul ini mengulas perangkat dasar dan keahlian esensial yang dibutuhkan untuk beroperasi di lingkungan digital secara efektif dan aman. Pembahasan dimulai dari pengenalan fondasi perangkat keras (*hardware*), yang membedakan perangkat masukan (*input devices* seperti *keyboard* dan *mouse*) dengan perangkat keluaran (*output devices* seperti monitor, *speaker*, dan proyektor), serta pemanfaatan antarmuka konektivitas seperti USB untuk data/daya, HDMI untuk transmisi audio-video, dan Ethernet/RJ-45 untuk koneksi jaringan kabel.

Pada tataran perangkat lunak (*software*) dan manajemen sistem operasi, modul ini menjelaskan interaksi antarmuka pengguna (*user interface*), manajemen pengelolaan berkas (*file & folder management*), serta penggunaan komunikasi elektronik seperti surel (*email*). Penamaan berkas yang terstruktur dan rinci dinilai sangat krusial untuk memudahkan pencarian sistematis (*search indexing*) serta mendukung kolaborasi antar-pengguna. Selain itu, modul ini menekankan pentingnya mekanisme pengamanan akun dan identitas. Penggunaan kata sandi yang kuat—dengan mengombinasikan panjang karakter, variasi huruf (*alphanumeric*), simbol, *passphrase*, atau *system-generated passwords*—serta menghindari pola yang mudah ditebak (*dictionary words*, *sequential numbers*, atau data pribadi) menjadi benteng utama dalam mencegah serangan siber (*dictionary attack*). Pengamanan ini juga dapat diperkuat melalui autentikasi biometrik (*fingerprint/face recognition*) dan penerapan kata sandi unik untuk setiap akun yang berbeda.

### Modul 3 — Searching and Navigating Information
Modul ini berfokus pada teknik pencarian informasi secara efektif, navigasi web yang aman, serta pemahaman regulasi kekayaan intelektual dalam penggunaan sumber daya digital. Pada aspek pencarian dan navigasi, pengguna dibekali strategi *advanced search* menggunakan operator logika seperti tanda petik (`""`) untuk frasa spesifik, tanda minus (`-`) untuk mengeklusi kata kunci, serta operator `AND`/`OR` guna menyesuaikan cakupan hasil pencarian. Selain itu, evaluasi kritis terhadap hasil pencarian sangat ditekankan untuk membedakan antara informasi bereputasi (relevan dan *up-to-date*), konten irelevan yang memanipulasi algoritma mesin pencari (*gaming the search engines*), serta tautan berbahaya (*malicious links*). Modul ini juga mengulas navigasi antarmuka peramban—seperti penggunaan pintasan tombol (*shortcut keys*), fitur *find/search* halaman (`Ctrl+F`), penyimpanan situs langganan melalui *bookmark*, hingga dampak privasi dari penggunaan *cookies* yang merekam preferensi pengguna.

Pada aspek hukum dan sitasi digital, modul ini membahas tantangan hak cipta (*copyright*) dan kekayaan intelektual (*intellectual property*) di era perbanyakan data yang masif. Modul ini memperkenalkan opsi lisensi fleksibel seperti Creative Commons, domain publik, serta doktrin penggunaan wajar (*Fair Use/Fair Dealing*) yang memungkinkan akademisi atau jurnalis memanfaatkan karya berhak cipta untuk wacana publik. Terakhir, diuraikan pula tata cara pengerjaan bibliografi dan pencatatan sumber digital yang benar (seperti format Harvard) dengan memperhatikan elemen kunci: nama penulis/organisasi, judul halaman, penanda "n.d." jika tanpa tahun terbit, URL aktif, dan tanggal akses (*access date*).

### Modul 4 — The Evolution of Digital Technologies
Modul ini mengulas perkembangan teknologi digital mutakhir, norma etika dalam berinteraksi di ruang siber, serta tanggung jawab pengguna terhadap dampak teknologi bagi diri sendiri, masyarakat, dan lingkungan. Pada aspek evolusi teknologi, modul ini menyoroti sejarah kecerdasan buatan (*Artificial Intelligence/AI*) yang dicetuskan sejak 1950-an, perkembangan *Machine Learning*, hingga era *Deep Learning* yang melahirkan *Large Language Models* (LLM) seperti model bahasa besar modern. Modul ini juga membedakan antara *Narrow AI* (AI spesifik untuk satu tugas) dan *General AI* (AI dengan kecerdasan menyeluruh setara manusia), sembari mengingatkan risiko bias algoritma dan penyalahgunaan AI akibat prasangka manusia (*human bias*).

Pada aspek etika komunikasi (*Netiquette*), pembahasan ditekankan pada kesadaran bahwa interaksi di dunia maya melibatkan manusia nyata sehingga kesantunan tetap berlaku. Pengguna diingatkan untuk berhati-hati dalam memilih kata dan humor, mengingat keterbatasan penyampaian sarkasme serta batasan privasi komunitas digital. Terakhir, pada aspek tanggung jawab digital, modul ini mengulas pengelolaan *Digital Footprint* (jejak digital), pencegahan kecanduan perangkat digital (misalnya membatasi *screen time* pada sistem operasi seperti Android), serta sikap kritis terhadap popularitas konten di internet yang tidak menjamin kredibilitasnya. Modul ini juga menekankan pentingnya pemahaman privasi *online* untuk perlindungan diri serta penghematan konsumsi energi demi mengurangi dampak lingkungan dari penggunaan perangkat digital.

### Modul 5 — Navigating the Digital World: Persona, Safety, and Ethics
Modul ini mengulas tentang pembentukan dan pengelolaan identitas digital (*digital persona*), dinamika interaksi sosial di ruang siber, bentuk-bentuk kejahatan siber, serta etika dan aspek hukum terkait aktivitas *online*. Pada aspek identitas dan pengelolaan kehidupan digital (*Managing Digital Life*), modul ini menjelaskan bahwa persona digital terbentuk seiring waktu melalui jejak aktivitas *online* pengguna. Pengguna diingatkan untuk meninjau setelan privasi pada tiap platform yang berbeda, melakukan pembersihan konten lama secara berkala agar tetap mencerminkan kredibilitas profil, serta memastikan keamanan transaksi finansial. Modul ini juga mengulas peran anonimitas *online*—yang bermanfaat dalam situasi sensor ketat atau aksi pengungkapan fakta (*whistleblowing*)—namun juga dapat memicu dampak negatif terhadap penegakan hukum dan keamanan siber.

Pada aspek dinamika interaksi dan risiko siber (*When Things Go Wrong*), modul ini menyoroti bahwa anonimitas dan jarak fisik sering kali memicu perilaku agresif, komunikasi destruktif seperti *trolling*, hingga perundungan siber (*cyberbullying*). Kurangnya petunjuk nonverbal dan bahasa tubuh menjadi penyebab utama kesalahpahaman dalam komunikasi digital. Modul ini menekankan pentingnya bersikap tenang sebelum merespons, tidak membalas provokasi, serta menerapkan prinsip untuk tidak mengatakan hal di dunia maya yang tidak akan diucapkan secara langsung. Terakhir, pada aspek perlindungan diri dan etika (*Don't Be a Victim*), modul ini membahas berbagai modus kejahatan siber seperti *phishing*, *spear phishing*, *catfishing*, hingga peretasan kata sandi yang dapat memicu kerugian finansial maupun emosional. Modul ini juga mengulas fenomena bajak laut digital (*online piracy*) yang marak terjadi karena kemudahan penggandaan konten, serta pentingnya kesadaran etis dan hukum untuk menanggulangi pelanggaran hak cipta tersebut.

### Modul 6 — Digital Problem Solving and Skill Development
Modul ini mengulas tentang langkah-langkah praktis dalam menangani masalah teknis (*troubleshooting*) pada perangkat digital, pemetaan celah keterampilan (*skills gap*), serta penyediaan berbagai sumber daya pembelajaran *online* untuk meningkatkan literasi digital secara mandiri. Pada aspek penyelesaian masalah teknis (*Fixing Common Issues*), modul ini memberikan panduan pemecahan masalah dasar pada perangkat komputer dan konektivitas. Langkah-langkah utama meliputi pemeriksaan kabel dan colokan listrik saat perangkat tidak mau menyala, penghapusan berkas tidak penting untuk mengatasi performa lambat, verifikasi aktifnya Wi-Fi dan pemilihan jaringan yang tepat saat terjadi masalah koneksi, identifikasi ekstensi berkas (`.pdf`, `.docx`) ketika dokumen gagal dibuka, serta tindakan *restart* komputer sebagai solusi paling umum untuk mengatasi berbagai gangguan teknis.

Pada aspek evaluasi dan penutupan celah keterampilan (*Skills Gap*), modul ini menyediakan kuis penilaian diri (*Self-Assessment Quiz*) untuk mengukur kecakapan digital di berbagai bidang—seperti operasi dasar komputer, penggunaan *browser* dan mesin pencari, keamanan privasi (HTTPS), komunikasi *email* dan *video call*, pembuatan konten digital, pemahaman jejak digital (*digital footprint*), hingga keterampilan tingkat lanjut seperti *cloud services* dan *programming*. Modul ini menekankan pentingnya mengenali kekurangan diri agar dapat menentukan fokus pembelajaran secara mandiri. Terakhir, pada aspek sumber daya pembelajaran mandiri (*Close the Skills Gap*), modul ini memaparkan platform dan media yang dapat dimanfaatkan untuk meningkatkan keterampilan digital. Platform yang diulas mencakup kursus *online* (Cisco Networking Academy, OpenEDG Edube), platform *streaming* video (YouTube), *Massive Open Online Courses* (MOOCs) dari universitas global, *e-book* dan artikel digital, *webinar* dan lokakarya interaktif, serta platform komunitas dan forum diskusi (tempat pengguna saling bertanya, membantu, dan memanfaatkan sistem *upvoting* untuk menemukan jawaban terbaik).

---

## Bagian 3. Hubungan dan Implementasi pada Topik Proyek

### 1. Bagaimana rancangan aplikasi dapat mempermudah tugas sehari-hari pengguna? Apa proses “analog/tradisional” dari topik proyekmu yang berhasil disederhanakan menjadi digital?

**Jawaban & Penjabaran:**  
Aplikasi **Smartbills** mempermudah tugas harian pengguna (seperti masyarakat umum, mahasiswa, hingga pemilik usaha kecil) dalam mencatat pengeluaran dan pemantauan arus kas agar terhindar dari kelalaian atau rasa malas saat melakukan pembukuan.

* **Proses Analog/Tradisional:**  
  Pengguna biasanya mencatat pengeluaran harian secara manual menggunakan buku catatan fisik atau mengetik satu per satu nominal dan rincian barang belanjaan ke dalam tabel *spreadsheet*. Proses ini memakan waktu, rawan kesalahan input (*human error*), serta sering kali ditinggalkan karena merepotkan. Selain itu, bukti struk fisik belanjaan atau struk transfer sering berserakan dan hilang.
* **Proses Digital yang Disederhanakan:**  
  Melalui **Smartbills**, proses tersebut ditransformasi menjadi otomatis berbasis foto multimodal. Pengguna cukup memfoto struk belanja atau mengunggah bukti transfer. Kombinasi mesin OCR (Google Cloud Vision) dan AI LLM Agent (Google Gemini 1.5) secara otomatis mengekstraksi teks, membaca nominal, mengategorikan jenis belanjaan, merinci daftar barang, serta memotong/menambah saldo pengguna secara *real-time*. Proses manual yang memakan waktu beberapa menit dipangkas menjadi beberapa detik saja.

---

### 2. Jika aplikasimu memiliki fitur penyimpanan file atau pendaftaran akun, bagaimana kamu merancang struktur penyimpanan file yang intuitif bagi pengguna awam? Bagaimana kamu membantu pengguna membuat kata sandi yang aman?

**Jawaban & Penjabaran:**

* **Struktur Penyimpanan File Intuitif:**  
  Di sisi *client* (Mobile React Native dan Web React.js), pengguna awam tidak perlu pusing memikirkan pengelolaan direktori berkas. Setelah foto struk/bukti transfer diunggah, sistem *backend* Node.js/Express.js secara otomatis menyimpan berkas ke dalam *File Storage* (Lokal/Cloud) dengan direktori terstruktur berdasarkan ID Pengguna, Tahun, dan Bulan (`/storage/receipts/{user_id}/{YYYY}/{MM}/`). Di sisi antarmuka, file-file tersebut disajikan secara intuitif berupa **Galeri Audit Visual** yang terhubung langsung dengan catatan transaksi. Pengguna cukup menekan tombol "Lihat Struk" pada riwayat transaksi tanpa harus mencari file manual.
* **Bantuan Pembuatan Kata Sandi Aman:**  
  Pada fitur *Authentication Service* (layanan daftar akun), sistem menyediakan penunjuk kekuatan kata sandi (*Password Strength Indicator*) secara *real-time* saat pengguna mengetik. Aplikasi menerapkan aturan validasi minimal (minimal 8 karakter, kombinasi huruf besar/kecil, angka, dan simbol). Jika kata sandi terlalu lemah, aplikasi akan menampilkan panduan visual langsung dan menonaktifkan tombol daftar hingga syarat keamanan terpenuhi.

---

### 3. Bagaimana kamu mendesain fitur pencarian (search bar) di dalam aplikasi agar pengguna dapat mencari informasi dengan mudah? Selain itu, sebutkan asset eksternal yang digunakan dalam aplikasi (library, API, gambar, icon). Apakah asset-aset tersebut berlisensi open-source, public domain, atau memiliki hak cipta khusus yang wajib dicantumkan?

**Jawaban & Penjabaran:**

* **Desain Fitur Pencarian (*Search Bar*):**  
  *Search bar* diletakkan di bagian atas halaman riwayat transaksi pada *Mobile App* maupun *Web Dashboard*. Pengguna dapat mengetikkan kata kunci nama toko, rincian item barang, atau kategori belanja. Sistem juga menyediakan filter cepat (*quick filter*) berdasarkan rentang tanggal, jenis transaksi (`INCOME`/`EXPENSE`), serta kategori. Pencarian dijalankan melalui panggilan REST API *backend* berbasis PostgreSQL dengan *query* pencarian teks yang efisien agar hasil muncul dengan cepat.
* **Aset Eksternal dan Status Lisensinya:**
  1. **Library & Framework Open-Source:**
     * **Node.js, Express.js, React.js, React Native (Expo), PostgreSQL:** Berlisensi *Open-Source* (MIT License / PostgreSQL License) yang bebas digunakan dalam pengembangan aplikasi.
     * **Chart.js / Recharts:** Library visualisasi grafik berlisensi *Open-Source* (MIT License).
  2. **API Pihak Ketiga (Layanan Komersial / Proprietary):**
     * **Google Cloud Vision API (OCR Engine):** Layanan API milik Google (Proprietary) yang diakses menggunakan kredensial Google Cloud API Key.
     * **Google Gemini 1.5 API (LLM Agent):** Layanan API model AI milik Google (Proprietary). Ketentuan penggunaan mengikuti syarat & lisensi API Google Cloud/Google AI Studio.
  3. **Ikon & Gambar UI:**
     * **Lucide React / Material Icons / FontAwesome Free:** Berlisensi *Open-Source* (MIT / SIL OFL).
     * Aset ilustrasi antarmuka menggunakan gambar publik/bebas lisensi (Freepik/Unsplash Free License) dengan tetap menyantumkan kredit apabila diwajibkan.

---

### 4. Jika aplikasimu memiliki fitur interaksi social, bagaimana kamu mencegah pelanggaran etika digital di dalamnya? Jika aplikasi menggunakan fitur pintar berbasis AI, bagaimana kamu memastikan AI tersebut bekerja secara etis dan bertanggung jawab bagi pengguna?

**Jawaban & Penjabaran:**

* **Mencegah Pelanggaran Etika Digital (Fitur Sosial/Komunitas):**  
  Apabila dikembangkan fitur interaksi (seperti perbandingan harga barang antar pengguna pada *Commodity Price Tracker* atau berbagi *insight* keuangan), sistem menerapkan filter teks otomatis (*profanity filter*) untuk menyaring kata-kata tidak sopan, ujaran kebencian, atau *spam*. Selain itu, disediakan tombol *Report* (Laporkan Konten) agar komunitas dapat melaporkan pelanggaran yang akan ditinjau oleh administrator.
* **Penerapan AI secara Etis dan Bertanggung Jawab (*Ethical AI*):**
  1. **Prinsip *Human-in-the-Loop* (Verifikasi Pengguna):** AI Agent (Gemini 1.5) tidak langsung mengeksekusi dan mengunci data secara sepihak. Setelah AI selesai mengekstraksi struk, sistem menyajikan layar *User Review & Confirmation* agar pengguna dapat memeriksa dan mengoreksi jika ada kesalahan pembacaan sebelum data disimpan permanen ke database.
  2. **Transparansi & Akuntabilitas Data:** Sistem memberi tahu pengguna secara terbuka bahwa pemrosesan struk dilakukan oleh AI.
  3. **Privasi Prompt AI:** *Prompt engineering* yang dikirim ke Google Gemini API hanya memuat teks hasil OCR dari struk belanja (nama toko, barang, nominal) tanpa melampirkan identitas pribadi sensitif pengguna (seperti nomor NIK atau nama pemilik akun).

---

### 5. Data pribadi sensitive (PII) apa saja yang dikumpulkan oleh aplikasimu? Bagaimana cara kamu melindungi data tersebut agar tidak bocor atau disalahgunakan? Bagaimana aplikasi meminimalkan Risiko pengguna menjadi korban penipuan siber di platform mu?

**Jawaban & Penjabaran:**

* **Data Pribadi Sensitif (PII) yang Dikumpulkan:**
  * **Data Identitas Pengguna:** Nama lengkap, alamat *email*, dan kata sandi (tersimpan di tabel `users`).
  * **Data Finansial:** Catatan transaksi keuangan harian, riwayat saldo kas (`current_balance`), serta citra foto struk belanja/bukti transfer.
* **Skema Perlindungan Data dari Kebocoran:**
  * **Enkripsi Komunikasi:** Seluruh lalu lintas data antara Mobile/Web App dan REST API *Backend* dilindungi oleh enkripsi protokol HTTPS/SSL.
  * **Autentikasi Aman:** Penggunaan JSON Web Token (JWT) untuk mengamankan setiap panggilan API. Token disimpan secara aman pada penyimpanan internal perangkat (*Secure Store* / *HTTP-Only Cookie*).
  * **Hashing Kata Sandi:** Kata sandi pengguna di-*hash* menggunakan algoritma kriptografi kuat (seperti `bcrypt`) sebelum disimpan ke basis data PostgreSQL.
  * **Isolasi Akses Data:** Menerapkan *Role-Based Access Control* (RBAC) pada PostgreSQL sehingga pengguna hanya dapat membaca dan mengedit data transaksi milik mereka sendiri.
* **Meminimalkan Risiko Penipuan Siber:**
  * Aplikasi memberikan edukasi dan peringatan resmi di dalam antarmuka bahwa pihak Smartbills tidak pernah meminta rincian kredensial akun, kode OTP, atau PIN perbankan pengguna.
  * Aplikasi berfokus sebagai pencatat transaksi (bukan dompet digital penyimpan uang sungguhan), sehingga mengurangi risiko kerugian materi secara langsung jika terjadi kelalaian pengguna pada perangkat mereka.

---

### 6. Ketika aplikasi mengalami masalah teknis (misalnya kehilangan koneksi internet atau kegagalan memuat data), bagaimana aplikasi mengomunikasikannya kepada pengguna? Tuliskan contoh rancangan pesan error ramah pengguna yang memandu pengguna melakukan troubleshooting mandiri secara mudah.

**Jawaban & Penjabaran:**  
Ketika aplikasi mengalami kendala teknis (seperti koneksi terputus, gambar struk terlalu buram, atau *rate-limit* API AI tercapai), aplikasi Smartbills menghindari tampilan kode *error* teknis yang rumit (seperti `500 Internal Server Error` atau `ECONNREFUSED`). Sebagai gantinya, aplikasi menampilkan modal/pop-up interaktif berbasis UI Bootstrap/React Native yang ramah pengguna dengan solusi *troubleshooting* mandiri.

#### Contoh Rancangan Pesan Error 1 (Kehilangan Koneksi Internet)

**Sambungan Internet Terputus**  
Kami tidak dapat menghubungkan aplikasi ke server Smartbills untuk memproses struk Anda.  

**Langkah Penyelesaian:**  
1. Pastikan koneksi Wi-Fi atau data seluler Anda dalam keadaan aktif.  
2. Coba nyalakan lalu matikan Mode Pesawat (*Airplane Mode*) sejenak.  
3. Tekan tombol **"Coba Lagi"** di bawah ini.  

*[ Tombol: Coba Lagi ]* | *[ Tombol: Simpan Foto ke Galeri ]*

#### Contoh Rancangan Pesan Error 2 (Kegagalan Pembacaan Gambar oleh AI/OCR)

**Gagal Membaca Struk Belanja**  
Sistem AI kami kesulitan membaca tulisan pada foto struk yang Anda unggah karena gambar terlalu buram atau pencahayaan kurang.  

**Langkah Penyelesaian:**  
1. Ambil ulang foto dengan posisi struk datar dan cahaya yang cukup.  
2. Pastikan seluruh teks pada struk terlihat jelas dan tidak terpotong.  
3. Atau gunakan opsi **"Input Manual"** untuk memasukkan data secara langsung.  

*[ Tombol: Foto Ulang Struk ]* | *[ Tombol: Input Manual ]*