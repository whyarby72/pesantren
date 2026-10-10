import Link from 'next/link';
import { Shell } from '../components/shell';
import { Icon } from '../components/icon';
import { modules } from '../lib/modules';
export default function Dashboard(){
return <Shell>
  <div className="page-eyebrow"><span className="eyebrow-dot"/>RUANG KERJA DIGITAL PESANTREN</div>
  <div className="page-intro"><div><h1>Assalamu’alaikum <span className="wave">✦</span></h1><p>Selamat datang di IMTAQ. Semua domain tersedia sebagai navigasi pratinjau; belum ada data operasional yang ditampilkan.</p></div><span className="date-chip"><Icon name="calendar" size={17}/>Versi pratinjau F0</span></div>
  <section className="hero" aria-labelledby="hero-title">
    <div className="hero-content"><span className="hero-kicker"><span className="hero-diamond">✦</span> IMTAQ · PLATFORM PESANTREN</span><h2 id="hero-title">Satu ruang kerja,<br/><em>empat domain utama.</em></h2><p>Fondasi pengelolaan akademik, hafalan, kesantrian, dan keuangan yang modular, terukur, serta berorientasi keamanan data.</p><Link href="/akademik/absensi" className="hero-action">Coba absensi akademik <Icon name="arrow" size={17}/></Link></div>
    <div className="hero-art" aria-hidden="true"><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><div className="hero-ring ring-three"/><div className="hero-glyph">✦</div><span className="hero-art-caption">أَهْلًا وَسَهْلًا</span></div>
  </section>
  <div className="section-header"><div><span className="section-kicker">GAMBARAN PLATFORM</span><h2>Empat domain, satu ekosistem</h2><p>Setiap domain memiliki kepemilikan data dan tahapan pengembangan sendiri.</p></div><span className="small-note"><Icon name="info" size={15}/> Data belum tersedia</span></div>
  <section className="module-grid" aria-label="Empat domain utama">
    {modules.map(m=><Link href={`/${m.key}`} className={`module-card tone-${m.tone}`} key={m.key}><div className="module-card-top"><span className="module-icon"><Icon name={m.icon} size={25}/></span><span className="module-code">{m.code}</span></div><h3>{m.label}</h3><p>{m.subtitle}</p><span className="module-card-bottom">Lihat rancangan <Icon name="arrow" size={17}/></span></Link>)}
  </section>
  <section className="lower-grid">
    <div className="surface-card roadmap"><div className="surface-heading"><div><span className="section-kicker">TAHAP IMPLEMENTASI</span><h2>Roadmap pengembangan</h2></div><span className="muted-mini">Status perencanaan</span></div>
      <ol className="timeline"><li><span className="timeline-icon is-current"><Icon name="check" size={17}/></span><div><strong>F0 — Fondasi bersama</strong><p>Repository, CI, kandidat IAM, dan pratinjau antarmuka.</p></div><span className="timeline-state current">Berjalan</span></li><li><span className="timeline-icon"><Icon name="clock" size={16}/></span><div><strong>F1 — Kesantrian</strong><p>Data inti santri, wali, unit, dan perizinan.</p></div><span className="timeline-state">Direncanakan</span></li><li><span className="timeline-icon"><Icon name="clock" size={16}/></span><div><strong>F2–F4 — Domain lanjutan</strong><p>Akademik, ketahfizhan, dan keuangan bertahap.</p></div><span className="timeline-state">Direncanakan</span></li></ol>
    </div>
    <div className="surface-card safety-card"><div className="surface-heading"><div><span className="section-kicker">PENGAMAN DATA</span><h2>Dirancang bertahap</h2></div><div className="safety-icon"><Icon name="shield" size={23}/></div></div><p className="safety-description">Pratinjau ini tidak terhubung ke database santri, transaksi, atau autentikasi sebenarnya.</p><div className="safety-list"><span><Icon name="check" size={16}/>Data ilustrasi saja</span><span><Icon name="check" size={16}/>Tanpa akun pengguna nyata</span><span><Icon name="check" size={16}/>Otorisasi produksi belum aktif</span></div><div className="safety-footnote"><Icon name="lock" size={17}/> Login akan diaktifkan setelah kontrak IAM dan privasi disahkan.</div></div>
  </section>
</Shell>
}
