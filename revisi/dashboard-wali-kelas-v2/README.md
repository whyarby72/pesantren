# Revisi Dashboard Wali Kelas v2 — Kelas, Apel, Seragam

**Status: DRAFT / BELUM DISETUJUI / BUKAN PRODUKSI.**

Buka [dashboard.html](./dashboard.html) untuk melihat prototipe HTML mandiri. Gunakan tampilan dan interaksi sebagai referensi UX; file ini **bukan** pengganti komponen Next.js dan tidak terhubung ke API/database IMTAQ.

## Ruang lingkup revisi
- Absensi tiap sesi: **Hadir / Izin / Sakit / Alpa**, pencarian, pemilihan sesi, pengecualian sebelum pengisian massal.
- Pemeriksaan harian: **Apel** (Ikut/Tidak Ikut/Terlambat) dan **Seragam** (Baju, Celana, Peci), masing-masing satu catatan per santri per hari.
- Santri eligible pemeriksaan harian **hanya setelah tercatat Hadir pada minimal satu sesi kelas yang telah disimpan**. Hadir kelas tidak otomatis berarti Ikut Apel atau Seragam Lengkap.
- Koreksi simulasi memerlukan alasan. Tombol Simpan dalam prototype hanya mengubah keadaan **sessionStorage browser**; tidak menyimpan ke server.
- 20 label `Santri 01` sampai `Santri 20` adalah **data sintetis anonim**, bukan data master santri.

## Kontrak implementasi kelak (tidak termasuk revisi ini)
1. Backend default-deny berdasar akun/kelas/session/record, termasuk pemisahan kelas gabungan 2B dan 3B.
2. Status `BELUM_DICATAT` tidak otomatis dianggap `ALPA`; bulk-Hadir tidak menimpa pengecualian.
3. Apel dan seragam dicatat **sekali per tanggal** untuk santri eligible dengan ringkasan yang terpisah dari absensi sesi.
4. Item seragam sebaiknya configurable, dengan default **baju, celana, peci**; tidak perlu menciptakan domain baru.
5. Penyimpanan memakai validasi server, transaksi, idempotensi, revision, CSRF, audit, dan read-back; **tidak memakai sessionStorage demo**.
6. Jangan menulis absensi operasional tanpa operator berwenang dan sumber jadwal yang valid.

## Cara kerja revisi
Perbaiki file ini sebanyak yang diperlukan di folder `revisi/`. Jika rancangan sudah diterima, buat versi arsip non-sensitif di `hasil-disetujui/`, dan implementasikan perubahan aplikasi pada `apps/web` serta backend terkait melalui tes terpisah.

**Keamanan:** Repository public. Jangan memasukkan nama santri asli, data kehadiran individu, kredensial, arsip database, atau backup ke folder ini.
