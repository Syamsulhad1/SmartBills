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

Panduan Membuat Sandi Kuat: Saat mengetik kata sandi, indikator kekuatan akan langsung merespons dan mencentang syarat-syarat keamanan secara real-time. kita juga bisa menggunakan tombol tampil/sembunyikan sandi untuk menghindari salah ketik.

Fitur Bantu Sandi: Jika bingung membuat sandi, aplikasi menyediakan saran frasa panjang yang mudah diingat atau tombol pembuat sandi acak otomatis.

Penyaringan Keamanan: Sistem secara otomatis menolak sandi yang terlalu lemah, seperti kata sandi umum, urutan angka, pola keyboard, atau sandi yang mengandung nama dan surel kita.

Enkripsi Tingkat Tinggi: Kata sandi kita aman karena disimpan dalam bentuk hash terenkripsi (bcrypt), sehingga tidak ada pihak yang bisa melihat kata sandi asli kita.

Fitur Masuk Tambahan: Pada perangkat seluler, kita bisa mengunci aplikasi menggunakan biometrik (sidik jari/wajah) atau PIN. Jika lupa sandi, tersedia juga tautan pemulihan yang dikirimkan melalui surel.

Rancangan Standar Keamanan Sistem
Panjang Minimal Sandi: Minimal 12 karakter.

Pembatasan Login: Akun akan dibatasi sementara jika terjadi 5 kali kesalahan berturut-turut saat masuk.

Masa Berlaku Sesi (JWT): Token akses aktif selama 15 menit demi keamanan sesi kita.

Batas Waktu Pemulihan: Tautan lupa kata sandi hanya berlaku selama 30 menit.
### 3.3 Fitur pencarian dan aset eksternal

**Desain pencarian.** Smartbill menyediakan satu bilah pencarian pada riwayat transaksi dan galeri bukti. Rancangannya mengadopsi prinsip pencarian efektif dari Modul 3:

- pencarian lintas kolom sekaligus: nama toko, nama barang, kategori, nominal, dan catatan;
- filter cepat berupa *chip* untuk rentang tanggal, jenis transaksi (pemasukan atau pengeluaran), dan kategori, sebagai padanan alat penyaring waktu pada mesin pencari;
- dukungan frasa persis dengan tanda kutip dan penyaring berbentuk kategori:F&` bagi pengguna mahir;
- toleransi salah ketik menggunakan pencocokan trigram PostgreSQL, serta penundaan (*debounce*) agar server tidak terbebani;
- sorotan kata yang cocok pada hasil, riwayat pencarian terakhir, dan pesan "tidak ditemukan" yang menyarankan longgarkan filter;
- setiap kueri dibatasi pada data milik pengguna yang sedang login, sehingga pencarian tidak dapat menyingkap data akun lain.

**Aset eksternal dan lisensinya.** Daftar berikut merujuk pada rancangan teknologi proyek dan perlu diverifikasi ulang terhadap `package.json` serta berkas lisensi pada versi yang benar-benar dipakai.

| Aset                                         | Fungsi                             | Status lisensi                    | Kewajiban 
| React, React Native, Expo                    | Antarmuka web dan mobile           | *Open source* (MIT)               | Menyertakan pemberitahuan hak cipta dan teks 
|                                              |                                    |                                   | lisensi 
| Express, Multer, jsonwebtoken, bcrypt        | Server, unggah berkas, autentikasi | *Open source* (MIT)               | Sama seperti di atas 
| PostgreSQL                                   | Basis data                         | *Open source*                     |
|                                              |                                    |(lisensi PostgreSQL yang permisif) | Menyertakan pemberitahuan hak cipta 
| Chart.js atau Recharts                       | Grafik dashboard                   | *Open source* (MIT)               | Menyertakan pemberitahuan hak cipta
| Google Cloud Vision API                      | OCR                                | Layanan komersial berpemilik      | Mematuhi syarat layanan Google; kunci API
|                                              |                                    |                                   | dirahasiakan 
| Google Gemini API                            | Parsing dan kategorisasi           | Layanan komersial berpemilik      | Mematuhi syarat layanan dan kebijakan
|                                              |                                    |                                   | penggunaan yang berlaku 
| Ikon (misalnya Lucide atau Material Symbols) | Antarmuka                          | *Open source* (ISC atau Apache)   | Mencantumkan lisensi sesuai ketentuan paket
| Logo dan ilustrasi aplikasi                  | Identitas visual                   | Karya orisinal tim                | Tidak ada; bila memakai gambar luar, hanya
|                                              |                                    |                                   | dari sumber CC0 atau domain publik 

Seluruh atribusi dikumpulkan pada halaman "Tentang dan Lisensi" di aplikasi serta berkas `THIRD_PARTY_LICENSES` di repositori. Khusus fitur pelacak harga komoditas yang mengambil data dari platform UMKM, pengambilan data (*scraping*) berpotensi melanggar ketentuan layanan dan hak atas basis data pihak lain. Karena itu rancangannya mengutamakan API resmi atau kerja sama dengan mitra, bukan penyalinan halaman secara sepihak.

### 3.4 Etika digital dan AI yang bertanggung jawab

**Interaksi sosial.** Versi saat ini tidak memiliki fitur sosial antarpengguna, sehingga risiko perundungan dan *trolling* rendah. Titik sentuh yang tersisa adalah rekomendasi toko atau UMKM pada pelacak harga. Pencegahannya: hanya mitra terverifikasi yang tampil, disediakan tombol laporkan konten yang keliru atau menyesatkan, dan tautan keluar diberi peringatan bahwa pengguna meninggalkan Smartcill. Apabila fitur bersama (misalnya anggaran keluarga atau kolom komentar) ditambahkan kelak, aturan netiket dipasang sejak awal: pedoman komunitas yang singkat, tombol blokir dan laporkan, penyaringan kata kasar, serta pengaturan privasi bawaan yang paling tertutup.

**AI yang etis dan bertanggung jawab.** Rancangan mengikuti prinsip bahwa hasil AI dipengaruhi data dan desain, sehingga perlu kendali manusia dan transparansi:

| Prinsip               | Penerapan 
| Transparansi          | Setiap hasil ekstraksi diberi label "dihasilkan AI, mohon periksa" 
| Kendali manusia       | Pengguna meninjau dan dapat mengedit sebelum transaksi dikonfirmasi; ada fitur koreksi dan reset 
| Akurasi dan kejujuran | Bila keyakinan rendah atau teks tidak terbaca, sistem meminta foto ulang atau input manual, bukan menebak 
| Keadilan              | Kategori memiliki opsi "Lainnya" agar struk non-standar tidak dipaksa ke kategori keliru 
| Keamanan masukan      | Teks hasil OCR diperlakukan sebagai data, bukan perintah; keluaran LLM divalidasi terhadap skema JSON dan batas nilai yang wajar 
| Privasi               | Pengguna diminta persetujuan sebelum gambar dikirim ke layanan pihak ketiga, dan konfigurasi API dipilih agar data pengguna tidak dipakai 
|                       | melatih model 
| Akuntabilitas         | Riwayat perubahan transaksi dicatat sehingga koreksi dapat ditelusuri 

### 3.5 Data pribadi (PII), perlindungan, dan pencegahan penipuan

| Data                          | Tujuan                   | Tingkat sensitivitas       | Perlindungan 
| Nama dan surel                | Akun dan pemulihan sandi | Sedang                     | Validasi surel, akses hanya lewat API terautentikasi 
| Kata sandi                    | Autentikasi              | Tinggi                     | Hash bergaram, tidak pernah disimpan atau dicatat sebagai teks asli 
| Saldo dan riwayat transaksi   | Fungsi inti              | Tinggi                     |Transaksi atomik, pengecekan 
|                               |                          |                            |kepemilikan data pada setiap permintaan 
| Foto struk dan bukti transfer | Ekstraksi dan audit      | Tinggi (dapat memuat nama, |
|                               |                          | nomor rekening,            |
|                               |                          | atau nomor kartu)          | Penyimpanan privat terenkripsi, akses lewat tautan bertanda tangan berumur 
|                               |                          |                            | pendek 
| Token sesi                    | Otorisasi                | Tinggi                     | JWT berumur pendek, dikirim hanya lewat HTTPS 

**Perlindungan data.**

- Seluruh komunikasi memakai HTTPS, dan basis data hanya menerima kueri berparameter untuk mencegah injeksi SQL.
- Prinsip minimalisasi: aplikasi tidak meminta NIK, PIN, kode OTP, atau kredensial perbankan, dan nomor rekening atau kartu pada hasil ekstraksi disamarkan sebelum disimpan.
- Teks mentah OCR tidak disimpan lebih lama dari yang dibutuhkan untuk proses verifikasi.
- Kunci API dan rahasia berada pada variabel lingkungan server, tidak pada kode sumber maupun aplikasi klien.
- Log sistem tidak memuat PII.
- Pengguna dapat mengekspor dan menghapus akun beserta seluruh fotonya, selaras dengan semangat Undang-Undang Pelindungan Data Pribadi.

**Meminimalkan risiko penipuan siber.** Smartbill hanya mencatat transaksi dan tidak memindahkan uang, sehingga permukaan serangan finansialnya sempit. Langkah tambahan: pengguna mendapat edukasi singkat di dalam aplikasi tentang *phishing* dan bukti transfer palsu, surel resmi tidak pernah meminta sandi atau menyertakan tautan masuk, tautan eksternal diberi peringatan, mitra UMKM harus terverifikasi, percobaan login yang mencurigakan dibatasi, dan pengguna dianjurkan mengaktifkan autentikasi dua faktor. Catatan penting bagi pengguna: sistem hanya membaca bukti transfer sebagai data, bukan sebagai bukti bahwa dana benar-benar diterima.

### 3.6 Komunikasi masalah teknis dan pesan error yang ramah

Prinsipnya, setiap pesan menjawab tiga hal: apa yang terjadi, mengapa (dalam bahasa awam), dan apa yang dapat dilakukan pengguna sekarang. Pesan tidak menampilkan kode internal atau jejak tumpukan, bahasanya tidak menyalahkan, dan selalu disertai tombol aksi. Untuk ketiadaan koneksi, aplikasi tetap menampilkan saldo terakhir yang tersimpan di perangkat dan menandainya sebagai data belum diperbarui; transaksi manual dan foto yang diambil masuk antrean lalu terkirim otomatis ketika jaringan pulih.

Saat terjadi gangguan koneksi internet, aplikasi akan menampilkan pesan "Kamu sedang offline. Catatanmu aman dan akan dikirim otomatis saat internet kembali. Coba periksa Wi-Fi atau data seluler, atau nyalakan lalu matikan mode pesawat," lengkap dengan tombol aksi Coba Lagi dan Buka Pengaturan Jaringan.

Jika terjadi kendala gagal memuat data, sistem akan memberikan informasi bahwa "Data belum berhasil dimuat. Ini biasanya karena sinyal lemah atau server sedang sibuk. Tarik layar ke bawah untuk memuat ulang, atau coba beberapa saat lagi" dengan tombol aksi Muat Ulang.

Untuk masalah foto struk yang buram, pengguna akan melihat pesan "Struk sulit dibaca. Coba foto ulang di tempat yang lebih terang, posisikan struk rata dan penuh di dalam bingkai," serta pilihan tombol Foto Ulang atau Isi Manual. Sementara itu, ketika ekstraksi AI tidak yakin dengan hasilnya, pesan yang muncul berbunyi "Beberapa bagian struk belum terbaca jelas. Periksa nominal dan kategori di bawah, lalu ubah bila perlu sebelum disimpan" dengan tombol aksi Periksa dan Edit.

Apabila layanan AI sibuk atau melewati batas, sistem menyampaikan bahwa "Layanan pemindai sedang padat. Kamu bisa mencoba lagi sebentar lagi atau mencatat transaksi ini secara manual," disertai tombol Coba Lagi dan Catat Manual. Saat sesi berakhir, pesan pengamanannya berbunyi "Demi keamananmu, sesi telah berakhir. Silakan masuk kembali; data yang belum tersimpan tetap aman di perangkat" dengan tombol aksi Masuk Kembali.

Untuk kendala lupa kata sandi, pesan yang ditampilkan bernada ramah yaitu "Tidak apa-apa, ini sering terjadi. Kami akan mengirim tautan untuk membuat sandi baru ke surelmu" dengan tombol Kirim Tautan Pemulihan. Terakhir, jika pengguna memakai aplikasi versi lama, pesannya adalah "Ada pembaruan yang memperbaiki masalah ini. Perbarui aplikasi lewat toko aplikasi; jika tetap gagal, pasang ulang aplikasi," yang dilengkapi tombol aksi Perbarui Sekarang.
Rangkaian pesan tersebut mengikuti urutan pemecahan masalah pada Modul 6: periksa penyebab yang paling sederhana lebih dahulu (koneksi, pembaruan), lalu langkah lanjutan (mulai ulang, pasang ulang), dan sediakan jalur pemulihan akun bila diperlukan.

---
