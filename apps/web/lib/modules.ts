export type ModuleKey = 'akademik' | 'ketahfizhan' | 'kesantrian' | 'keuangan';
export type IconName = 'home' | 'book' | 'spark' | 'users' | 'wallet' | 'shield' | 'layers' | 'activity' | 'arrow' | 'lock' | 'menu' | 'calendar' | 'check' | 'clock' | 'info' | 'chevron';
export type ModuleInfo = {
  key: ModuleKey;
  code: 'AKD' | 'THF' | 'SAN' | 'FIN';
  label: string;
  subtitle: string;
  description: string;
  icon: IconName;
  tone: string;
  features: readonly string[];
};
export const modules: readonly ModuleInfo[] = [
  { key: 'akademik', code: 'AKD', label: 'Akademik', subtitle: 'Pembelajaran & Rapor', description: 'Pengelolaan kurikulum, kelas, jadwal, nilai, dan rapor sebagai satu domain Akademik.', icon: 'book', tone: 'teal', features: ['Tahun ajaran & kelas', 'Jadwal pembelajaran', 'Penilaian & rapor'] },
  { key: 'ketahfizhan', code: 'THF', label: 'Ketahfizhan', subtitle: 'Halaqah & Hafalan', description: 'Ruang kerja untuk halaqah, setoran hafalan, murajaah, dan evaluasi tahfizh.', icon: 'spark', tone: 'gold', features: ['Halaqah santri', 'Setoran & murajaah', 'Evaluasi hafalan'] },
  { key: 'kesantrian', code: 'SAN', label: 'Kesantrian', subtitle: 'Data & Pembinaan', description: 'Manajemen data santri dan wali, unit, asrama, izin, serta aktivitas kesantrian.', icon: 'users', tone: 'blue', features: ['Direktori santri', 'Wali & relasi', 'Asrama dan perizinan'] },
  { key: 'keuangan', code: 'FIN', label: 'Keuangan', subtitle: 'Administrasi Keuangan', description: 'Rencana pengelolaan tagihan, penerimaan, jurnal, dan wallet di bawah domain Keuangan.', icon: 'wallet', tone: 'violet', features: ['Tagihan & pembayaran', 'Jurnal keuangan', 'Wallet (tahap lanjutan)'] }
] as const;
export function isModuleKey(value: string): value is ModuleKey {
  return modules.some((item) => item.key === value);
}
export function findModule(value: string): ModuleInfo | undefined {
  return modules.find((item) => item.key === value);
}
