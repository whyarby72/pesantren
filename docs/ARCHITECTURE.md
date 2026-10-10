# Repository Architecture Contract

## Top-level ownership

| Area | Peran |
| --- | --- |
| `apps/api` | Boundary API NestJS yang akan datang |
| `apps/web` | Boundary UI Next.js/React yang akan datang |
| `domains/akademik` | AKD, termasuk rapor dan absensi akademik |
| `domains/ketahfizhan` | THF |
| `domains/kesantrian` | SAN |
| `domains/keuangan` | FIN, termasuk wallet |
| `platform/` | Supporting/shared contexts dan platform services |
| `packages/contracts` | Contract/API types lintas konteks |

## Absensi Akademik

AKD adalah owner catatan absensi akademik. Wali kelas hanya boleh menginput kelas yang ditugaskan kepadanya melalui authorization backend yang default-deny. Sesi gabungan, jam/durasi berbeda, tahun ajaran, semester, dan riwayat kelas harus menjadi bagian dari model domain; tidak boleh disimpulkan dari UI.

Perubahan catatan harus menghasilkan histori dan audit record. ATT/ RFID hanya supporting context dan tidak menjadi owner keputusan kehadiran final tanpa contract yang disetujui.
