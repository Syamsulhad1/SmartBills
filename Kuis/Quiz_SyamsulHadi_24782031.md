# Laporan Kuis Internet Programming II

**Topik:** Digital Awareness dan Desain Aplikasi

## Identitas Mahasiswa
| Nama               | Syamsul Hadi 
| NPM                | 24782031      
| Program Studi      | Teknologi Rekayasa Internet, Jurusan Teknologi Informasi 
| Institusi          | Politeknik Negeri Lampung 
| Proyek             | Smartbill (proyek kelompok) 

## Bagian 1: Identitas dan Topik Proyek Aplikasi

Nama aplikasi:
Smartbill: Sistem Pencatatan Keuangan Multimodal Berbasis AI Agent

Masalah yang diselesaikan:
Pengguna sulit mencatat pemasukan dan pengeluaran secara konsisten, sehingga saldo aktual sering tidak diketahui. Pencatatan manual menyita waktu dan rentan salah input.

Tujuan utama: 
Mengubah foto struk, nota, atau bukti transfer menjadi catatan transaksi terstruktur secara otomatis, memperbarui saldo, dan menyajikan rekapitulasi keuangan dalam bentuk grafik.

Target pengguna:
Masyarakat umum, pekerja, mahasiswa, dan pemilik usaha kecil yang membutuhkan pencatatan kas harian yang praktis. 

Komponen utama:
Aplikasi mobile (React Native Expo), dashboard web (React.js), backend REST API (Node.js Express), basis data PostgreSQL, OCR (Google Cloud Vision), dan LLM (Google Gemini). 

---

### Modul 1: There's a Whole New World Out There!

Teknologi digital mempersingkat jarak dan waktu dalam pekerjaan sehari-hari: berkomunikasi, bertransaksi, dan belajar dapat dilakukan tanpa kehadiran fisik. Manfaat tersebut memiliki konsekuensi, yaitu gangguan kesehatan akibat pemakaian berlebihan, risiko privasi dan keamanan, serta kesenjangan akses antarkelompok masyarakat (*digital divide*).
Ekosistem digital berdiri di atas tiga unsur: sistem operasi sebagai fondasi perangkat, peramban sebagai pintu menuju web, dan aplikasi sebagai alat untuk tugas tertentu. Transisi analog ke digital tampak pada perubahan web dari halaman statis berbasis teks menjadi Web 2.0 yang interaktif, lalu meluas ke *Internet of Things* ketika benda sehari-hari ikut terhubung dan bertukar data. Layanan online dapat dikelompokkan menjadi layanan publik, layanan privat berbayar, dan layanan berbasis komunitas.

### Modul 2: You'll Need Some Basic Tools

Perangkat keras dibedakan menjadi perangkat masukan dan keluaran, yang terhubung melalui kabel atau nirkabel. Sistem operasi menyediakan antarmuka grafis, menjalankan aplikasi, dan mengelola penyimpanan, sehingga kemampuan menavigasi pengaturan, penjelajah berkas, dan bilah tugas menjadi keterampilan dasar. Berkas sebaiknya disusun dalam struktur folder dengan penamaan yang konsisten agar isinya dikenali tanpa dibuka dan mudah dicari.
Keamanan perangkat dan akun bertumpu pada kata sandi yang kuat seperti cukup panjang, memadukan berbagai jenis karakter, tidak memuat data pribadi atau pola yang mudah ditebak, dan idealnya berupa frasa sandi atau hasil pembangkit acak. PIN dan biometrik melengkapi pengamanan perangkat.

### Modul 3: This Is How You Get Around and Find What You're Looking For

Peramban dan mesin pencari adalah sarana utama menemukan informasi, tetapi hasilnya harus dinilai: ada yang relevan dan kredibel, ada yang hanya tampak relevan, dan ada yang berbahaya karena meniru situs resmi atau memicu unduhan tanpa kejelasan. Pencarian efektif memanfaatkan operator seperti frasa persis, pengecualian kata, pembatasan situs, jenis berkas, dan rentang waktu. Di dalam dokumen atau halaman, fitur *Find* dengan pintasan papan ketik mempercepat penelusuran kata. Tautan dan *cookies* perlu dipahami karena keduanya memengaruhi navigasi dan pelacakan aktivitas pengguna. Pada sisi hukum, hak cipta melindungi karya secara otomatis, sedangkan lisensi Creative Commons, domain publik, penggunaan wajar, dan lisensi *open source* mengatur kapan karya boleh dipakai ulang dan dengan syarat apa.

### Modul 4: It Just Keeps Getting Better

Kecerdasan buatan adalah upaya membuat mesin meniru kemampuan belajar dan menyelesaikan masalah berdasarkan data, dengan model bahasa besar sebagai perkembangan terkininya. AI pada dasarnya netral, tetapi keluarannya dibentuk oleh data latih, rancangan, dan niat pengembangnya, sehingga bias manusia dapat terbawa ke sistem otomatis. Dalam berinteraksi daring, netiket menuntut sikap hormat, kehati-hatian sebelum mengunggah, kewaspadaan terhadap humor yang mudah disalahpahami, serta penghormatan atas privasi orang lain. Tantangan lain meliputi kecanduan digital, miss informasi yang harus diverifikasi lintas sumber, konsumsi energi perangkat, dan jejak digital yang perlu dikelola melalui pengaturan privasi serta pembatasan akses pihak ketiga.

### Modul 5: Even Though It's Digital, It Is Real, With Real Consequences

Aktivitas daring membentuk persona digital (profesional, sosial, dan konsumen) yang bersifat permanen karena konten mudah disalin dan disebarkan. Informasi yang dapat mengidentifikasi individu (PII) harus dijaga agar tidak dipakai untuk pencurian identitas dan penipuan finansial. Menghadapi komunikasi negatif, pengguna dianjurkan memberi jeda sebelum membalas, mengabaikan pemancing reaksi (*trolling*), dan pada perundungan siber menyimpan bukti, memblokir, serta melaporkan.
Anonimitas memberi ruang berekspresi sekaligus dapat disalahgunakan misalnya alat seperti VPN, mode privat, autentikasi dua faktor, dan sandi kuat membantu melindungi diri. Ancaman utamanya adalah *phishing* massal maupun bertarget, penipuan berkedok hubungan atau investasi (*pig butchering*), dan pembajakan perangkat lunak, musik, film, serta buku.

### Modul 6: Learn About Anything and Everything

Kesenjangan keterampilan dapat ditutup secara mandiri melalui kursus daring, video tutorial, MOOC, buku elektronik, seminar web, serta forum komunitas. Platform kursus umumnya meminta akun untuk melacak kemajuan dan menyediakan materi berupa video, bacaan, kuis, forum diskusi, dan sertifikat. Untuk masalah teknis, pemecahan dilakukan bertahap dari penyebab paling sederhana: memeriksa daya, membebaskan penyimpanan dan memulai ulang perangkat saat lambat, memeriksa jaringan dan router saat koneksi bermasalah, memakai pemulihan sandi saat akun terkunci, memperbarui atau memasang ulang aplikasi, serta memeriksa ekstensi dan aplikasi yang kompatibel saat format berkas tidak dikenali.

---

##  Hubungan dan Implementasi pada Topik Proyek

### 3.1 Kemudahan tugas sehari-hari dan transisi dari analog ke digital

Transformasi Pembukuan Manual Menjadi Digital dengan Smartbill
Selama ini, pembukuan keuangan pribadi atau usaha kecil sering kali dilakukan secara manual dan melelahkan. pengguna harus menyimpan banyak struk kertas yang mudah hilang, menuliskan nominal satu per satu ke buku kas, menghitung saldo menggunakan kalkulator, hingga meluangkan waktu untuk merekap semuanya ke dalam spreadsheet di akhir bulan. Melalui Smartbill, seluruh proses yang rumit dan memakan waktu tersebut diringkas menjadi satu langkah praktis: cukup memotret bukti transaksi.

Smartbill hadir untuk mengatasi berbagai kendala pembukuan konvensional dengan cara kerja yang cerdas seperti:
Struk Fisik yang Berantakan: Daripada khawatir struk hilang atau tulisannya pudar, pengguna tinggal memotretnya. Foto bukti akan tersimpan aman di server dan dapat dilihat kapan saja melalui galeri audit.

Pencatatan yang Lambat: pengguna tidak perlu lagi menulis manual di buku kas yang rawan salah. Teknologi otomatis seperti OCR dan LLM akan langsung membaca foto dan mengubahnya menjadi data yang rapi.

Perhitungan Saldo Manual: Kalkulator tidak lagi diperlukan. Setiap kali transaksi tersimpan, saldo pengguna akan otomatis diperbarui secara akurat tanpa takut salah hitung.

Rekapan Bulanan yang Melelahkan: pengguna tidak perlu repot membuat tabel rekap setiap akhir bulan, karena dashboard web Smartbill akan menyajikan grafik mingguan dan bulanan secara otomatis.

Uang Tunai Tanpa Bukti: Bagi transaksi tanpa struk, pengguna tetap bisa mencatatnya dengan mudah menggunakan formulir manual yang dilengkapi pilihan kategori siap pakai.

Pendekatan ini sejalan dengan prinsip memadukan kebiasaan lama dan teknologi digital. Smartbill tidak memaksa pengguna membuang kebiasaan menerima struk kertas, melainkan menjadikannya pintu masuk data yang mudah. Selain itu, bagi pengguna awam, hasil bacaan kecerdasan buatan (AI) akan selalu ditampilkan sebagai draf terlebih dahulu, sehingga pengguna tetap bisa memeriksa dan mengoreksinya sebelum data benar-benar disimpan.

### 3.2 Struktur penyimpanan berkas, pendaftaran akun, dan kata sandi aman

**Struktur penyimpanan yang intuitif.** Pengguna awam tidak perlu memahami folder. Foto bukti dikelompokkan otomatis pada tampilan galeri berdasarkan bulan, lalu kategori (misalnya pangan pokok, F&B, kesehatan, BBM). Di sisi server, berkas diberi nama terstruktur mengikuti prinsip penamaan konsisten dari Modul 2, misalnya tahun-bulan-tanggal_namatoko_total.jpg, dan disimpan pada direktori privat per pengguna sehingga tidak ada berkas yang bercampur antarakun. Setiap transaksi menautkan langsung ke fotonya, dan galeri dapat difilter serta dicari.

**Keamanan Akun dan Pendaftaran yang Mudah di Smartbill**
Proses pendaftaran akun dirancang agar sangat ringkas dan aman. pengguna hanya diminta memasukkan data dasar seperti nama, email, dan kata sandi.
Untuk memastikan akun pengguna terlindungi dengan baik tanpa membuat pengguna repot, Smartbill menyediakan berbagai fitur keamanan yang praktis:

Panduan Membuat Sandi Kuat: Saat mengetik kata sandi, indikator kekuatan akan langsung merespons dan mencentang syarat-syarat keamanan secara real-time. pengguna juga bisa menggunakan tombol tampil/sembunyikan sandi untuk menghindari salah ketik.

Fitur Bantu Sandi: Jika bingung membuat sandi, aplikasi menyediakan saran frasa panjang yang mudah diingat atau tombol pembuat sandi acak otomatis.
Penyaringan Keamanan: Sistem secara otomatis menolak sandi yang terlalu lemah, seperti kata sandi umum, urutan angka, pola keyboard, atau sandi yang mengandung nama dan surel pengguna.

Enkripsi Tingkat Tinggi: Kata sandi pengguna aman karena disimpan dalam bentuk hash terenkripsi (bcrypt), sehingga tidak ada pihak yang bisa melihat kata sandi asli pengguna.

Fitur Masuk Tambahan: Pada perangkat seluler, pengguna bisa mengunci aplikasi menggunakan biometrik (sidik jari/wajah) atau PIN. Jika lupa sandi, tersedia juga tautan pemulihan yang dikirimkan melalui surel.

Rancangan Standar Keamanan Sistem
Panjang Minimal Sandi: Minimal 12 karakter.

Pembatasan Login: Akun akan dibatasi sementara jika terjadi 5 kali kesalahan berturut-turut saat masuk.
Masa Berlaku Sesi (JWT): Token akses aktif selama 15 menit demi keamanan sesi pengguna.
Batas Waktu Pemulihan: Tautan lupa kata sandi hanya berlaku selama 30 menit.

### 3.3 Fitur pencarian dan aset eksternal

1. Mencari Data Menjadi Lebih Mudah dan Cepat
Smartbill menyediakan satu kotak pencarian praktis untuk membantu pengguna menemukan riwayat transaksi atau foto bukti dengan cepat. Sistem ini dirancang agar terasa natural seperti:

Cari Sekaligus: Cukup ketik satu kata kunci, dan sistem secara otomatis akan mencarinya di semua tempat sekaligus—baik itu nama toko, nama barang, kategori, jumlah uang, maupun catatan.

Filter Instan: Pengguna bisa menggunakan tombol pintas (filter chips) di bawah kotak pencarian untuk menyaring data berdasarkan tanggal, jenis transaksi (pemasukan atau pengeluaran), atau kategori tertentu.

Pintasan untuk Pengguna Mahir: Bagi yang sudah terbiasa, pencarian bisa dibuat lebih spesifik menggunakan tanda kutip untuk frasa yang sama persis (misalnya "kopi susu") atau mengetik perintah khusus seperti kategori:F&B.

Tahan Salah Ketik: Pengguna tidak perlu khawatir jika ada salah eja. Sistem memiliki teknologi pintar yang tetap bisa mengenali kata yang dimaksud. Proses pencarian juga diatur agar tetap ringan bagi server.

Tampilan yang Membantu: Kata kunci yang dicari akan diberi warna penyorot pada hasil pencarian, lengkap dengan riwayat pencarian terakhir dan saran jika data yang dicari tidak ditemukan.

Aman dan Privasi Terjaga: Setiap kali melakukan pencarian, sistem hanya akan menampilkan data milik akun yang sedang masuk saja, sehingga data pengguna lain tidak akan bisa dilihat.

2. Transparansi Komponen dan Lisensi Aplikasi
Dalam mengembangkan Smartbill, seluruh teknologi dan bahan pendukung digunakan secara jujur dan transparan. Daftarnya bisa dilihat pada halaman "Tentang dan Lisensi" di dalam aplikasi maupun pada berkas seperti:

Teknologi Terbuka (Open Source): Sebagian besar komponen utama aplikasi—seperti tampilan layar (React, Expo), sistem server (Express, Multer, JWT, bcrypt), basis data (PostgreSQL), hingga grafik dan ikon—menggunakan pustaka gratis berlisensi bebas. Aturannya cukup dengan mencantumkan pemberitahuan hak cipta pengembang aslinya.

Layanan Pendukung Pihak Ketiga: Smartbill juga menggunakan layanan profesional berbayar, seperti Google Cloud Vision API untuk membaca teks pada struk dan Google Gemini API untuk merapikan serta mengkategorikan data. Penggunaannya dijamin aman dan mematuhi aturan resmi yang berlaku.

Desain dan Identitas: Logo serta ilustrasi dibuat sendiri oleh tim. Jika ada gambar tambahan dari luar, hanya diambil dari sumber yang bebas hak cipta (CC0 atau domain publik).

Aturan Pengambilan Data Harga: Khusus untuk fitur pemantau harga komoditas, Smartbill menghindari cara-cara ilegal seperti menyalin data otomatis dari situs lain (scraping). Aplikasi ini mengutamakan penggunaan jalur resmi atau bekerja sama langsung dengan mitra demi menjaga etika dan hukum yang berlaku.

### 3.4 Etika digital dan AI yang bertanggung jawab

**Aspek Sosial dan Etika Kecerdasan Buatan (AI) di Smartbill**
1. Keamanan dan Kenyamanan Interaksi Sosial
Pada versi saat ini, Smartbill sengaja tidak menyediakan fitur interaksi antar-pengguna agar aplikasi tetap fokus pada pembukuan pribadi dan bebas dari risiko gangguan seperti perundungan. Satu-satunya titik interaksi luar adalah rekomendasi toko atau UMKM pada fitur pelacak harga. Untuk menjaga keamanan, Smartbill menerapkan langkah-langkah pencegahan sebagai berikut:

Mitra Terverifikasi: Hanya toko atau pelaku UMKM terverifikasi yang akan ditampilkan.

Tombol Pelaporan: Tersedia tombol khusus bagi pengguna untuk melaporkan informasi atau konten yang keliru dan menyesatkan.

Peringatan Tautan Keluar: Pengguna akan selalu mendapat peringatan saat akan mengklik tautan yang membawa mereka keluar dari aplikasi Smartbill.

Rancangan Masa Depan: Jika kelak fitur bersama (seperti anggaran keluarga atau kolom komunitas) ditambahkan, aturan perilaku (netiket) sudah disiapkan sejak awal, meliputi pedoman komunitas yang ringkas, tombol blokir dan lapor, sistem penyaringan kata kasar, serta pengaturan privasi yang secara otomatis diatur paling ketat.

2. Etika dan Tanggung Jawab Penggunaan AI
Smartbill menyadari bahwa hasil dari kecerdasan buatan sangat bergantung pada data dan cara perancangannya. Oleh karena itu, aplikasi menempatkan manusia sebagai pengendali utama dengan prinsip-prinsip keterbukaan sebagai berikut:

Transparansi: Setiap data hasil bacaan AI selalu diberi keterangan yang jelas agar pengguna tahu bahwa data tersebut perlu diperiksa kembali.

Kendali di Tangan Pengguna: Sebelum transaksi disimpan, pengguna wajib meninjau dan berhak mengedit data tersebut. Tersedia juga tombol koreksi dan reset.

Akurat dan Jujur: Jika sistem AI ragu atau teks pada foto tidak terbaca jelas, aplikasi tidak akan menebak-nebak, melainkan meminta pengguna memotret ulang atau mengisi data secara manual.

Keadilan Kategori: Untuk struk belanja yang tidak biasa, disediakan pilihan kategori "Lainnya" agar sistem tidak memaksakan pengelompokan yang salah.

Keamanan Data Masukan: Teks hasil pemindaian diperlakukan murni sebagai data informasi, bukan instruksi perintah. Hasil olahan AI juga selalu divalidasi keamanannya terhadap aturan format dan batas nilai yang wajar.

Menjaga Privasi: Pengguna akan selalu dimintai izin terlebih dahulu sebelum gambar struk dikirim ke pihak ketiga. Selain itu, sistem diatur agar data pengguna tidak digunakan untuk melatih kecerdasan buatan pihak luar.

Akuntabilitas (Jejak Riwayat): Setiap perubahan atau koreksi pada data transaksi akan selalu dicatat oleh sistem, sehingga riwayat perbaikannya dapat ditelusuri kembali kapan saja.

### 3.5 Data pribadi (PII), perlindungan, dan pencegahan penipuan

**Perlindungan Data dan Keamanan Pengguna di Smartbill**
1. Jenis Data dan Tingkat Perlindungan
Smartbill mengelola berbagai jenis data pribadi dan keuangan dengan tingkat pengamanan yang disesuaikan berdasarkan tingkat sensitivitasnya seperti:

Nama dan Surel: Memiliki tingkat sensitivitas Sedang dan digunakan untuk pengelolaan akun serta pemulihan sandi. Sistem melindunginya melalui validasi surel dan akses yang hanya diizinkan lewat API terautentikasi.

Kata Sandi: Masuk dalam kategori sensitivitas Tinggi khusus untuk autentikasi. Sandi diamankan menggunakan bentuk hash bergaram (salted hash) dan tidak pernah disimpan atau dicatat sebagai teks asli.

Saldo dan Riwayat Transaksi: Bersifat Tinggi sebagai fungsi inti aplikasi. Dilindungi melalui transaksi atomik serta pengecekan kepemilikan data yang ketat pada setiap permintaan (request).

Foto Struk dan Bukti Transfer: Memiliki sensitivitas Tinggi karena berpotensi memuat informasi pribadi seperti nama, nomor rekening, atau nomor kartu. Data ini disimpan dalam ruang privat yang terenkripsi, dan aksesnya menggunakan tautan bertanda tangan (signed URL) yang berumur pendek.

Token Sesi: Dinilai berhak atas tingkat keamanan Tinggi untuk keperluan otorisasi. Token menggunakan JWT berumur pendek dan hanya dikirimkan melalui jalur aman HTTPS.

2. Standar Perlindungan dan Privasi Data
Smartbill menerapkan berbagai langkah pengamanan teknis untuk menjaga kerahasiaan informasi pengguna:

Komunikasi dan Keamanan Server: Seluruh komunikasi wajib menggunakan HTTPS, dan basis data hanya memproses kueri berparameter guna mencegah celah serangan injeksi SQL.

Prinsip Minimalisasi Data: Aplikasi tidak meminta data pribadi yang berisiko tinggi seperti NIK, PIN, kode OTP, atau kredensial perbankan. Jika terdapat nomor rekening atau kartu pada hasil ekstraksi, data tersebut akan disamarkan terlebih dahulu sebelum disimpan.

Pemusnahan Data Mentah: Teks mentah hasil pemindaian OCR hanya disimpan seperlunya selama proses verifikasi berlangsung dan tidak disimpan selamanya.

Kerahasiaan Sistem: Kunci API dan data rahasia disimpan aman di dalam variabel lingkungan server, sehingga tersembunyi dari kode sumber maupun perangkat klien.

Penyaringan Log Sistem: Catatan aktivitas server (log sistem) dipastikan bersih dan tidak memuat informasi identitas pribadi (PII).

Hak Pengguna (UU PDP): Pengguna memiliki kendali penuh untuk mengekspor atau menghapus akun beserta seluruh foto dan datanya kapan saja, selaras dengan semangat Undang-Undang Pelindungan Data Pribadi.

3. Langkah-Langkah Mencegah Risiko Penipuan Siber
Karena Smartbill hanya berfungsi untuk mencatat keuangan tanpa memindahkan atau mentransfer uang secara langsung, risiko serangan finansial pada aplikasi ini tergolong kecil. Meskipun demikian, berbagai langkah pencegahan tambahan tetap diterapkan:

Edukasi Pengguna: Pengguna dibekali edukasi singkat di dalam aplikasi mengenai ancaman penipuan seperti phishing dan modus bukti transfer palsu.

Komunikasi Resmi yang Aman: Surel resmi dari Smartbill tidak akan pernah meminta kata sandi pengguna atau menyertakan tautan langsung untuk masuk ke akun.

Peringatan Keamanan Eksternal: Setiap tautan keluar aplikasi akan selalu disertai peringatan bagi pengguna.

Verifikasi Mitra dan Pembatasan Akses: Mitra UMKM harus melalui proses verifikasi terlebih dahulu. Selain itu, percobaan login yang mencurigakan akan dibatasi secara otomatis, dan pengguna dianjurkan mengaktifkan autentikasi dua faktor.

### 3.6 Komunikasi masalah teknis dan pesan error yang ramah

Prinsipnya, setiap pesan menjawab tiga hal: apa yang terjadi, mengapa (dalam bahasa awam), dan apa yang dapat dilakukan pengguna sekarang. Pesan tidak menampilkan kode internal atau jejak tumpukan, bahasanya tidak menyalahkan, dan selalu disertai tombol aksi. Untuk ketiadaan koneksi, aplikasi tetap menampilkan saldo terakhir yang tersimpan di perangkat dan menandainya sebagai data belum diperbarui; transaksi manual dan foto yang diambil masuk antrean lalu terkirim otomatis ketika jaringan pulih.

Saat terjadi gangguan koneksi internet, aplikasi akan menampilkan pesan "Kamu sedang offline. Catatanmu aman dan akan dikirim otomatis saat internet kembali. Coba periksa Wi-Fi atau data seluler, atau nyalakan lalu matikan mode pesawat," lengkap dengan tombol aksi Coba Lagi dan Buka Pengaturan Jaringan.

Jika terjadi kendala gagal memuat data, sistem akan memberikan informasi bahwa "Data belum berhasil dimuat. Ini biasanya karena sinyal lemah atau server sedang sibuk. Tarik layar ke bawah untuk memuat ulang, atau coba beberapa saat lagi" dengan tombol aksi Muat Ulang.

Untuk masalah foto struk yang buram, pengguna akan melihat pesan "Struk sulit dibaca. Coba foto ulang di tempat yang lebih terang, posisikan struk rata dan penuh di dalam bingkai," serta pilihan tombol Foto Ulang atau Isi Manual. Sementara itu, ketika ekstraksi AI tidak yakin dengan hasilnya, pesan yang muncul berbunyi "Beberapa bagian struk belum terbaca jelas. Periksa nominal dan kategori di bawah, lalu ubah bila perlu sebelum disimpan" dengan tombol aksi Periksa dan Edit.

Apabila layanan AI sibuk atau melewati batas, sistem menyampaikan bahwa "Layanan pemindai sedang padat. Kamu bisa mencoba lagi sebentar lagi atau mencatat transaksi ini secara manual," disertai tombol Coba Lagi dan Catat Manual. Saat sesi berakhir, pesan pengamanannya berbunyi "Demi keamananmu, sesi telah berakhir. Silakan masuk kembali; data yang belum tersimpan tetap aman di perangkat" dengan tombol aksi Masuk Kembali.

Untuk kendala lupa kata sandi, pesan yang ditampilkan bernada ramah yaitu "Tidak apa-apa, ini sering terjadi. Kami akan mengirim tautan untuk membuat sandi baru ke surelmu" dengan tombol Kirim Tautan Pemulihan. Terakhir, jika pengguna memakai aplikasi versi lama, pesannya adalah "Ada pembaruan yang memperbaiki masalah ini. Perbarui aplikasi lewat toko aplikasi; jika tetap gagal, pasang ulang aplikasi," yang dilengkapi tombol aksi Perbarui Sekarang.
Rangkaian pesan tersebut mengikuti urutan pemecahan masalah pada Modul 6: periksa penyebab yang paling sederhana lebih dahulu (koneksi, pembaruan), lalu langkah lanjutan (mulai ulang, pasang ulang), dan sediakan jalur pemulihan akun bila diperlukan.

---
