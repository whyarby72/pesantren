import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {default:'IMTAQ — Sistem Manajemen Pesantren',template:'%s | IMTAQ'},
  description: 'Pratinjau dashboard Sistem Manajemen Pesantren — data sintetis, belum operasional.',
  robots:{index:false,follow:false}
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id"><body><a className="skip-link" href="#main-content">Lewati ke konten</a>{children}</body></html>;
}
