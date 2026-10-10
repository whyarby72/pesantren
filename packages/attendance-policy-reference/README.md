# Attendance Policy Reference

Referensi kebijakan untuk vertical slice AKD attendance. Ini bukan authorization runtime dan bukan pengganti policy enforcement pada backend.

- Sumber input awal: absensi cetak oleh guru.
- Input digital: wali kelas.
- Scope: hanya kelas yang ditugaskan kepada wali kelas.
- Sesi: jumlah, durasi, jam, dan gabungan kelas dapat berbeda.
- Mutasi: histori perubahan dan audit wajib.
- Backend: default-deny.
