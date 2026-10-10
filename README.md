# Sistem Manajemen Pesantren Modern

Repository private untuk pengembangan Sistem Manajemen Pesantren Modern dengan arsitektur Modular Monolith.

## Status baseline

Repository ini berisi baseline struktur minimal yang disiapkan karena artefak bootstrap resmi berikut belum ditemukan di workspace:

- `PESANTREN_GITHUB_BOOTSTRAP_SOURCE_v0_1_0.zip`
- `PESANTREN_GITHUB_BOOTSTRAP_v0_1_0.bundle`
- `PESANTREN_GITHUB_BOOTSTRAP_EVIDENCE_v0_1_0.json`

Handoff dokumentasi sumber-only yang tersedia telah disalin byte-identical ke `docs/product-sources/`. Commit referensi `39e6518bbaf354161d49828c1784492fb8d223f7` belum terverifikasi dari artefak yang tersedia.

## Stack dan arsitektur

- TypeScript strict
- NestJS untuk API (belum diimplementasikan)
- Next.js/React untuk web (belum diimplementasikan)
- PostgreSQL (belum diintegrasikan)
- Modular Monolith dengan ownership lintas-domain melalui API/contract

Empat domain utama dipertahankan tepat sebagai berikut:

- `AKD` — Akademik, termasuk `AKD/RAPOR`
- `THF` — Ketahfizhan
- `SAN` — Kesantrian
- `FIN` — Keuangan, termasuk `FIN/WALLET`

POS, ATT, RFID, WhatsApp, Portal Wali, IAM, Audit, AI, dan Module Manager adalah supporting/shared contexts.

## Vertical slice pertama

Jalur implementasi pertama adalah `AKD → Absensi Kehadiran Santri`. Kontrak operasionalnya mencakup input digital oleh wali kelas untuk kelas yang ditugaskan, sesi dengan durasi/jam berbeda, sesi gabungan, sejarah tahun ajaran/semester/kelas, histori perubahan, audit, dan backend default-deny.

Baseline ini bukan backend produksi dan tidak menyertakan migrasi database, deployment, autentikasi nyata, atau UI role switching sebagai bukti autentikasi.

## Perintah lokal

```text
npm run typecheck
npm test
```

Perintah tersebut hanya memeriksa artefak yang benar-benar tersedia di checkout ini.
