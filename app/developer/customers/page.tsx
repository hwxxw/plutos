import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';

export default async function CustomersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userRow } = await supabase
    .from('users').select('role, is_pro').eq('id', user.id).maybeSingle();

  if (!userRow || userRow.role !== 'developer') redirect('/developer');

  if (!userRow.is_pro) {
    return (
      <div className="card text-center py-10">
        <h2 className="font-bold">CRM은 Pro 개발자 전용입니다</h2>
        <p className="text-sm text-slate-500 mt-2">
          고객 데이터 접근, 마케팅 이메일 기능 등을 이용하려면 Pro 구독이 필요합니다.
        </p>
        <Link href="/developer/pro" className="btn-primary mt-4 inline-flex">
          Pro 구독하기 (월 ₩29,000)
        </Link>
      </div>
    );
  }

  const { data: customers } = await supabase
    .from('developer_customers')
    .select('*')
    .eq('developer_id', user.id)
    .order('purchased_at', { ascending: false });

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">내 고객</h1>
          <Link href="/developer" className="text-xs text-brand-600">← 대시보드</Link>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          마케팅 수신에 동의한 고객만 표시됩니다. 법적 고지 없이 외부 발송 금지.
        </p>
      </section>

      {(customers || []).length === 0 ? (
        <div className="card text-center py-10 text-slate-500 text-sm">
          <p>아직 마케팅 수신 동의 고객이 없습니다.</p>
          <p className="text-xs mt-2">구매 시 유저가 동의해야 여기에 표시됩니다.</p>
        </div>
      ) : (
        <>
          <div className="card p-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">{customers!.length}</span> 명의 동의 고객
            </div>
            <a
              href="/api/developer/customers/export"
              download
              className="btn-secondary text-xs"
            >
              CSV 내보내기
            </a>
          </div>

          <div className="card divide-y divide-slate-100">
            {customers!.map((c: any) => (
              <div key={`${c.app_id}-${c.customer_id}`} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {c.customer_name ?? c.customer_email}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <a href={`mailto:${c.customer_email}`} className="hover:text-brand-600">
                        {c.customer_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold">{c.app_name}</span>
                      <span>· {c.tier}</span>
                      <span>· {formatKRW(c.amount_paid_krw)}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(c.purchased_at).toLocaleDateString('ko-KR')}
                    {c.review_rating && (
                      <div className="mt-1 text-amber-600">★ {c.review_rating}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
