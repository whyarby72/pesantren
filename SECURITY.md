# Security Policy

## Baseline rules

- Repository harus private.
- Secret hanya boleh disediakan melalui secret manager atau environment runtime; jangan menyimpan `.env`, token, private key, password, atau API key di Git.
- Data test harus sintetis dan tidak boleh memuat identitas santri nyata.
- Backend harus default-deny dan setiap perubahan absensi wajib memiliki actor, reason, timestamp, serta audit trail.
- Ownership canonical antar-domain dijaga melalui contract/API; consumer tidak boleh direct-write ke data domain lain.
- Tidak ada migrasi database produksi, deployment produksi, atau eksekusi ZIP arbitrer pada tahap bootstrap.

## Pelaporan

Laporkan dugaan secret atau data pribadi melalui kanal pemelihara repository. Jangan menyalin secret ke issue, commit message, atau log.
