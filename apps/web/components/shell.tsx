import Link from 'next/link';
import { Icon } from './icon';
import { modules } from '../lib/modules';

function Navigation({active}:{active?:string}) {
  return <nav className="nav-group" aria-label="Navigasi utama">
    <span className="nav-heading">MENU UTAMA</span>
    <Link className={`nav-link ${!active?'is-active':''}`} href="/"><Icon name="home" size={19}/> <span>Ringkasan</span></Link>
    <span className="nav-heading nav-heading-spaced">EMPAT DOMAIN</span>
    {modules.map(m=><Link key={m.key} className={`nav-link ${active===m.key?'is-active':''}`} href={`/${m.key}`}><Icon name={m.icon} size={19}/><span>{m.label}</span><small>{m.code}</small></Link>)}
    <span className="nav-heading nav-heading-spaced">LAYANAN PENDUKUNG</span>
    <div className="nav-link is-disabled"><Icon name="shield" size={19}/><span>IAM & Audit</span><span className="nav-soon">Nanti</span></div>
    <div className="nav-link is-disabled"><Icon name="layers" size={19}/><span>Module Manager</span><span className="nav-soon">Nanti</span></div>
  </nav>;
}

export function Shell({active,children}:{active?:string;children:React.ReactNode}) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="IMTAQ — Beranda">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span className="brand-text"><strong>IMTAQ</strong><small>Pesantren Management</small></span>
      </Link>
      <div className="sidebar-scroll"><Navigation active={active}/></div>
      <div className="sidebar-bottom"><div className="sidebar-status"><span className="status-dot"/>Mode pratinjau</div><small>F0 • Tampilan awal, tanpa data nyata</small></div>
    </aside>
    <div className="content-shell">
      <header className="topbar">
        <details className="mobile-menu"><summary aria-label="Buka navigasi"><Icon name="menu"/></summary><div className="mobile-menu-panel"><Navigation active={active}/></div></details>
        <div className="breadcrumbs"><span>IMTAQ</span><Icon name="chevron" size={14}/><strong>{active ? modules.find(m=>m.key===active)?.label : 'Ringkasan'}</strong></div>
        <div className="topbar-right"><span className="preview-pill"><span className="status-dot"/>Pratinjau F0</span><div className="avatar" aria-label="Akun demo, tidak diautentikasi">D</div></div>
      </header>
      <main id="main-content" className="main-content">{children}</main>
      <footer className="footer">IMTAQ • Sistem Manajemen Pesantren <span>Demo sintetis — tidak untuk penggunaan operasional</span></footer>
    </div>
  </div>;
}
