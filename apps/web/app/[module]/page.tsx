import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '../../components/shell';
import { Icon } from '../../components/icon';
import { findModule, modules } from '../../lib/modules';
export function generateStaticParams(){return modules.map(m=>({module:m.key}));}
export default async function ModulePage({params}:{params:Promise<{module:string}>}){
 const {module:key}=await params;const m=findModule(key);if(!m)notFound();
 return <Shell active={m.key}>
  <div className="page-eyebrow"><span className="eyebrow-dot"/>DOMAIN UTAMA · {m.code}</div>
  <div className="module-page-title"><div><Link href="/" className="back-link">← Kembali ke ringkasan</Link><h1>{m.label}</h1><p>{m.description}</p></div><div className={`module-banner-icon tone-${m.tone}`}><Icon name={m.icon} size={32}/></div></div>
  <div className="notice-banner"><Icon name="info" size={20}/><div><strong>Mode pratinjau — fitur belum diaktifkan</strong><p>Halaman ini memperlihatkan rancangan area kerja, bukan data asli dan bukan bukti bahwa layanan sudah tersedia.</p></div></div>
  <div className="section-header"><div><span className="section-kicker">RUANG LINGKUP {m.code}</span><h2>Komponen yang direncanakan</h2><p>Pengembangan akan dilakukan secara bertahap setelah kontrak terkait divalidasi.</p></div></div>
  <div className="features-grid">{m.features.map((title,index)=><div key={title} className="feature-box"><span className="feature-index">0{index+1}</span><div className="feature-mark"><Icon name="layers" size={22}/></div><h3>{title}</h3><p>Belum tersedia pada F0. Memerlukan implementasi, pengujian, dan persetujuan.</p><span className="planned-label"><span className="planned-dot"/> Dalam perencanaan</span></div>)}</div>
  <div className="module-footer"><Icon name="shield" size={21}/><div><strong>Kepemilikan data tetap mengikuti domain {m.code}</strong><p>Integrasi antardomain hanya melalui kontrak API/event. Layanan IAM dan audit adalah fondasi bersama.</p></div></div>
 </Shell>
}
