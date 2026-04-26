import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif',
  ibm:    "'IBM Plex Sans KR', sans-serif",
};

export default async function CustomersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userRow } = await supabase.from('users').select('role, is_pro').eq('id', user.id).maybeSingle();
  if (!userRow || userRow.role !== 'developer') redirect('/developer');

  if (!userRow.is_pro) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="rounded-2xl p-8 text-center space-y-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth={1.5} strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
          </div>
          <h2 className="font-black" style={{ color: C.text, fontFamily: C.cinzel }}>CRM은 Pro 개발자 전용</h2>
          <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>
            고객 데이터 접근, 마케팅 이메일 기능 등을 이용하려면 Pro 구독이 필요합니다.
          </p>
          <Link href="/developer/pro"
            className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: C.red, color: '#fff', fontFamily: C.cinzel }}>
            Pro 구독하기 (월 ₩29,000) →
          </Link>
        </div>
      </div>
    );
  }

  const { data: customers } = await supabase
    .from('developer_customers')
    .select('*')
    .eq('developer_id', user.id)
    .order('purchased_at', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/developer" className="flex items-center gap-1 text-xs mb-2" style={{ color: C.muted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            대시보드
          </Link>
          <div className="text-[11px] uppercase tracking-[0.25em] mb-1" style={{ color: C.redDim, fontFamily: C.cinzel }}>CRM</div>
          <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>내 고객</h1>
          <p className="text-xs mt-1" style={{ color: C.sub, fontFamily: C.ibm }}>
            마케팅 수신에 동의한 고객만 표시됩니다. 법적 고지 없이 외부 발송 금지.
          </p>
        </div>
        {(customers || []).length > 0 && (
          <a href="/api/developer/customers/export" download
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#0d0a10', color: C.sub, border: `1px solid ${C.border}`, fontFamily: C.cinzel }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            CSV
          </a>
        )}
      </div>

      {(customers || []).length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
          <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>아직 마케팅 수신 동의 고객이 없습니다.</p>
          <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: C.ibm }}>구매 시 유저가 동의해야 여기에 표시됩니다.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <span className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>
              <span className="font-black" style={{ color: C.text }}>{customers!.length}</span>명의 동의 고객
            </span>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {customers!.map((c: any, i: number) => (
              <div key={`${c.app_id}-${c.customer_id}`}
                className="flex items-start justify-between gap-3 px-4 py-4"
                style={{ backgroundColor: C.card, borderBottom: i < customers!.length - 1 ? '1px solid #1a1018' : 'none' }}>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate" style={{ color: C.text, fontFamily: C.cinzel }}>
                    {c.customer_name ?? c.customer_email}
                  </div>
                  <a href={`mailto:${c.customer_email}`}
                    className="text-xs mt-0.5 hover:underline block truncate"
                    style={{ color: C.muted, fontFamily: C.ibm }}>
                    {c.customer_email}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: C.muted, fontFamily: C.ibm }}>
                    <span className="font-semibold" style={{ color: C.sub }}>{c.app_name}</span>
                    <span>· {c.tier}</span>
                    <span>· {formatKRW(c.amount_paid_krw)}</span>
                  </div>
                </div>
                <div className="text-right text-xs flex-shrink-0" style={{ color: C.muted, fontFamily: C.ibm }}>
                  {new Date(c.purchased_at).toLocaleDateString('ko-KR')}
                  {c.review_rating && (
                    <div className="mt-1" style={{ color: '#ccaa00' }}>★ {c.review_rating}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
