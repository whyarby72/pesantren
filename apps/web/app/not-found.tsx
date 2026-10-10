import Link from 'next/link';
import { Shell } from '../components/shell';
export default function NotFound(){return <Shell><div className="missing"><span>404</span><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka belum tersedia pada pratinjau IMTAQ.</p><Link href="/" className="hero-action">Kembali ke ringkasan →</Link></div></Shell>}
