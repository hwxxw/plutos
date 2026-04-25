import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: '설정 | PLUTOS' };

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/settings');

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, role, is_pro')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-lg mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Settings
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>설정 개요</h1>
      </div>

      {/* 계정 정보 */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white">계정 정보</h2>
        <div className="space-y-3">
          <Row label="이메일" value={user.email ?? '-'} />
          <Row label="표시 이름" value={profile?.display_name ?? '-'} />
          <Row label="계정 유형" value={
            profile?.role === 'admin' ? '관리자' :
            profile?.role === 'developer' ? (profile?.is_pro ? '개발자 (Pro)' : '개발자') :
            '일반 회원'
          } />
          <Row label="가입일" value={new Date(user.created_at).toLocaleDateString('ko-KR')} />
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-white">바로가기</h2>
        <div className="space-y-2">
          {[
            { label: '내 앱 목록', href: '/my-apps' },
            { label: '개발자 대시보드', href: '/developer' },
            { label: '이용약관', href: '/legal/terms' },
            { label: '개인정보처리방침', href: '/legal/privacy' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-2 px-1 rounded text-sm transition-colors"
              style={{ color: '#888888' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f0ece4')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#888888')}
            >
              <span style={{ fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{item.label}</span>
              <span style={{ color: '#443333' }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 로그아웃 */}
      <form action="/auth/signout" method="post">
        <button type="submit"
          className="w-full py-3 rounded-lg text-sm border transition-colors"
          style={{ color: '#664444', borderColor: '#2a1515', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#660000'; (e.currentTarget as HTMLElement).style.color = '#cc3333'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a1515'; (e.currentTarget as HTMLElement).style.color = '#664444'; }}
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b" style={{ borderColor: '#1a1018' }}>
      <span style={{ color: '#555555', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{label}</span>
      <span style={{ color: '#cccccc' }}>{value}</span>
    </div>
  );
}
