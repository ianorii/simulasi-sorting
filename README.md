# Simulasi Algoritma Pengurutan

Aplikasi web statis (HTML/CSS/JS murni) untuk memperlihatkan langkah demi
langkah Bubble Sort, Selection Sort, Insertion Sort, dan Quick Sort. Tanpa
framework, tanpa build, tanpa CDN, tanpa jaringan. Semua teks berbahasa
Indonesia untuk praktikum Dasar Pemrograman.

## Menjalankan

Buka `index.html` langsung di browser (didukung lewat `file://`), tanpa
server dan tanpa internet.

## Berkas

- `index.html` — struktur halaman.
- `css/style.css` — tampilan; semua warna lewat variable CSS, tema krem
  bersih dengan garis hitam dan aksen biru.
- `js/algorithms.js` — logika murni (tanpa DOM) dan data algoritma
  (variabel, legenda, opsi pivot).
- `js/player.js` — pemutar langkah: putar, jeda, maju, mundur, reset, scrub.
- `js/render.js` — menggambar batang, variabel, legenda, dan tumpukan.
- `js/app.js` — penghubung UI ke logika; membangun kontrol opsi dari data.
- `fonts/PatrickHand-Regular.ttf` — font lokal.

## Cara pakai

- Tab di atas untuk memilih algoritma.
- Kotak Data: tombol Acak, Preset (Acak, Sudah Urut, Terbalik, Hampir Urut,
  Banyak Duplikat), stepper Jumlah (5–20), input Manual (2–20 angka bulat,
  -99 sampai 99), tombol Terapkan.
- Kotak Kontrol: scrubber "Jelajahi langkah", lalu Reset, Mundur,
  Putar/Jeda, Maju, Akhir, dan Kecepatan (1–16 langkah/detik).
- Pintasan papan ketik: `Spasi` putar/jeda, `→` maju, `←` mundur, `R` reset.
- Panel kanan: Variabel (nilai berubah tiap langkah; "-" berarti belum ada
  nilai), Penghitung, Penjelasan langkah, dan Tumpukan rekursi (khusus
  Quick Sort).

## Opsi pivot Quick Sort

Kontrol "Pilihan pivot" muncul di kotak Data **hanya pada tab Quick Sort**
(tab lain menyembunyikannya). Bawaannya **Pivot kanan**.

- **Pivot kanan** (Lomuto, seperti sebelumnya): `pivot = a[high]`,
  `i = low - 1`; untuk `j` dari `low` sampai `high-1`: jika `a[j] < pivot`,
  `i` naik satu lalu `a[i]` dan `a[j]` ditukar. Terakhir `a[i+1]` dan
  `a[high]` ditukar; pivot final di `i+1`.
- **Pivot tengah** (Lomuto): `pivot = a[(low+high) div 2]`, lalu pivot
  dipindah ke `a[high]` agar aturan Lomuto bisa dipakai. Setelah itu proses
  partisinya sama dengan pivot kanan; pivot final ada di `i+1`. Pergerakan
  pivot ke ujung kanan dihitung sebagai satu pertukaran.
- **Pivot kiri** (versi cerminan): `pivot = a[low]`, `i = low`; untuk `j`
  dari `low+1` sampai `high`: jika `a[j] < pivot`, `i` naik satu lalu `a[i]`
  dan `a[j]` ditukar. Terakhir `a[low]` dan `a[i]` ditukar; pivot final di
  `i`.

Mengganti pilihan pivot:

- membangun ulang daftar langkah dari array yang sama (data tidak berubah),
- mengembalikan simulasi ke langkah 1 dan menolkan penghitung,
- menghentikan animasi yang sedang berjalan (tidak ada timer tersisa).

Ketiga varian memakai kondisi `<` yang sama (ketat), jadi nilai yang sama
dengan pivot tidak dipindah; perilaku pada data duplikat konsisten. Pivot
ditandai warna ungu, termasuk saat sudah berada di posisi finalnya, dan
penjelasan tiap langkah menyebut "pivot kiri", "pivot tengah", atau
"pivot kanan".

Pengujian yang sudah dilakukan (ketiga varian): seluruh preset + 200 array
acak per varian + kasus tepi (2 elemen, semua sama, banyak duplikat,
negatif) selalu terurut benar; langkah mundur menghasilkan tampilan yang
persis sama. Pada data naik tanpa duplikat, pivot ujung memakai tepat
`n(n-1)/2` perbandingan, sedangkan pivot tengah lebih hemat: untuk 20
elemen, pivot kanan 190 banding dan pivot tengah 54 banding.

### Menambah varian pivot lain (mis. median-of-three)

1. Di `js/algorithms.js` tambahkan satu entri baru di `QUICK_VARIAN`:
   `nama` (dipakai di catatan langkah) dan `arah` (cara memilih pivot).
2. Sesuaikan fungsi `quickSteps`/`partisi` agar memakai data varian itu.
   Contoh median-of-three: hitung median dari `a[low]`, `a[tengah]`,
   `a[high]`, tukar elemen median itu ke ujung rentang, sisanya sama seperti
   varian yang sudah ada; catatan langkah `pilih` dapat berbunyi
   "Pivot = median dari a[low], a[tengah], a[high]".
3. Daftarkan di entri `quick` pada `REGISTRY`: tambahkan pasangan
   `['nilai', 'Label']` pada `opsi.pilihan`.

Tidak ada kode tampilan yang perlu diubah: kontrol opsi dibaca dari data
tersebut.

## Menambah algoritma baru

1. Tulis fungsi murni `namaSteps(input)` yang mengembalikan daftar langkah
   dengan format sama (`type`, `indices`, `array`, `sorted`, `vars`,
   `note`, `counters`). Jangan mengubah array masukan.
2. Daftarkan di `REGISTRY` dengan `nama`, `ide`, `kapan`, `kompleksitas`,
   `variabel` (pasangan `[kunci, label]` untuk panel Variabel), `legenda`
   (pasangan `[warna, label]`), dan `buatLangkah`. Algoritma tanpa opsi
   tidak perlu field `opsi`.
3. Kunci-kunci di `vars` tiap langkah harus memakai nama yang sama dengan
   `variabel` agar nilainya tampil di panel.

## Penghitung

Contoh hasil untuk data `[4, 3, 2, 1]` (sampai langkah terakhir):

| Algoritma      | Banding | Tukar | Tulis |
| -------------- | ------: | ----: | ----: |
| Bubble Sort    |       6 |     6 |     0 |
| Selection Sort |       6 |     2 |     0 |
| Insertion Sort |       6 |     0 |     9 |
| Quick Sort     |       6 |     2 |     0 |

Catatan konvensi:

- Insertion Sort: tiap geseran dihitung sebagai satu penulisan; penempatan
  `key` ikut dihitung penulisan hanya jika ada geseran.
- Quick Sort: penempatan pivot dihitung sebagai pertukaran hanya jika
  indeksnya benar-benar berubah.

## Font

Font utama: 'Patrick Hand' bobot 400 dari berkas lokal
`fonts/PatrickHand-Regular.ttf` (dimuat lewat `@font-face`, tanpa CDN).
STATUS: aktif; berkas dimuat lewat path lokal dan dipakai semua teks.

- Hanya ada satu bobot, jadi tidak ada `font-weight` tebal di mana pun;
  penekanan memakai ukuran/warna.
- Angka memakai `tabular-nums` agar tidak bergoyang.
- Mengganti font: timpa berkasnya, ubah `--font-body` di `css/style.css`,
  atau sesuaikan `src` pada `@font-face`.

## Tema tampilan

Tema awal krem/putih bersih: latar `#FEFDFB`, garis hitam, dan aksen biru.
Warna utama diatur lewat variabel di `:root` (`--bg`, `--ink`, `--primer`,
`--field`, dan warna peran batang). Warna batang tetap berbeda per status
(banding, tukar, key/minimum, pivot, final) agar mudah dibedakan.

## Jarak dan tata letak

- `--gap` (bawaan 28px) mengatur jarak horizontal antar kolom; jarak vertikal
  antar kotak ±30px mengikuti `--gap-vertikal`.
- `--sembul-label` mengompensasi label judul kotak yang menjorok setengah
  tinggi ke atas border, supaya jarak kotak tetap lega.
- Di bawah 900px semua kotak ditumpuk satu kolom; tidak ada gulir horizontal
  di lebar 360px.

## Asumsi

- Bahasa Indonesia untuk semua teks, catatan langkah, dan komentar kode.
- Nilai data manual dibatasi 2–20 angka bulat antara -99 dan 99.
- Batang bersumbu nilai 0; garis nol putus-putus muncul bila ada angka
  negatif.
- Aplikasi berjalan tanpa jaringan: seluruh aset (CSS, JS, font) lokal.
