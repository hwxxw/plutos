import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ClientProviders } from '@/components/ClientProviders';
import Link from 'next/link';
import { LogoImage } from '@/components/LogoImage';

export const metadata: Metadata = {
  title: 'PLUTOS — AI-Powered Web Tool Market',
  description: 'PWA 기반 AI 생산성 웹툴 마켓플레이스. 구독 없이 소유하고, 홈화면에 설치하세요.',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Google Fonts — preconnect으로 DNS+TLS 선행 처리 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d0d14' }}>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}` }} />
        <ClientProviders>
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">{children}</main>

        {/* Footer — 법적 고지 */}
        <footer className="border-t mt-16 py-8" style={{ borderColor: '#1e1010', backgroundColor: '#0a0a10' }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="PLUTOS" className="h-6 w-auto opacity-60" />
                <span className="text-xs font-bold tracking-widest" style={{ color: '#4a3535', fontFamily: 'Cinzel, serif' }}>
                  PLUTOS
                </span>
              </div>
              <nav className="flex items-center gap-5 text-[11px]" style={{ color: '#4a3535' }}>
                <Link href="/#about" className="hover:text-zinc-400 transition-colors">소개</Link>
                <Link href="/tools" className="hover:text-zinc-400 transition-colors">개발 도구</Link>
                <Link href="/legal/terms" className="hover:text-zinc-400 transition-colors">이용약관</Link>
                <Link href="/legal/privacy" className="hover:text-zinc-400 transition-colors">개인정보처리방침</Link>
                <a href="mailto:support@plutos.app" className="hover:text-zinc-400 transition-colors">고객센터</a>
              </nav>
            </div>
            <p className="text-center text-[10px] mt-6" style={{ color: '#2a2020' }}>
              © 2026 PLUTOS. All rights reserved.
            </p>
          </div>
        </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
