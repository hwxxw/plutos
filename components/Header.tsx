import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoImage } from './LogoImage';
import { NavDrawer } from './NavDrawer';

export async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isDeveloper = false;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    isDeveloper = data?.role === 'developer' || data?.role === 'admin';
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(13,13,20,0.92)', borderBottom: '1px solid #2a1515' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* 좌측: 햄버거 + 로고 */}
        <div className="flex items-center gap-3">
          <NavDrawer />
          <Link href="/" className="flex items-center gap-2 group">
            <LogoImage />
            <span
              className="font-black text-lg tracking-widest"
              style={{ color: '#f0ece4', fontFamily: 'Cinzel, serif' }}
            >
              PLUTOS
            </span>
          </Link>
        </div>

        {/* 우측: 유저 네비게이션 */}
        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <Link
                href="/my-apps"
                className="transition-colors duration-150 text-sm hidden sm:block"
                style={{ color: '#7a6060' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#f0ece4')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7a6060')}
              >
                내 앱
              </Link>
              {isDeveloper ? (
                <Link
                  href="/developer"
                  className="transition-colors duration-150 text-sm hidden sm:block"
                  style={{ color: '#7a6060' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#f0ece4')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7a6060')}
                >
                  대시보드
                </Link>
              ) : (
                <Link
                  href="/developer/register"
                  className="transition-colors duration-150 text-sm hidden sm:block"
                  style={{ color: '#7a6060' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#C9A84C')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7a6060')}
                >
                  개발자 등록
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#4a3535' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#7a6060')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4a3535')}
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-xs px-4 py-2">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
