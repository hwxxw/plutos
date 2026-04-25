'use client';

import { useState } from 'react';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

type App = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  origin_url?: string;
  icon_url?: string;
  category?: string;
  status: string;
  created_at: string;
  developer_name?: string;
};

export default function AdminAppsClient({
  pendingApps,
  recentApps,
}: {
  pendingApps: App[];
  recentApps: App[];
}) {
  const [apps, setApps] = useState(pendingApps);
  const [recent, setRecent] = useState(recentApps);
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function review(id: string, action: 'approve' | 'reject', reason?: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/apps/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reject_reason: reason }),
      });
      if (!res.ok) throw new Error('실패');
      const app = apps.find((a) => a.id === id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (app) {
        setRecent((prev) => [{ ...app, status: action === 'approve' ? 'active' : 'rejected' }, ...prev].slice(0, 20));
      }
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(null);
      setRejectTarget(null);
      setRejectReason('');
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      {/* 헤더 */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          Admin · App Review
        </div>
        <h1 className="text-3xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>앱 심사</h1>
      </div>

      {/* 심사 대기 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-bold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>심사 대기</h2>
          {apps.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded"
              style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000' }}>
              {apps.length}건
            </span>
          )}
        </div>

        {apps.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>대기 중인 앱이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="rounded-2xl p-5 space-y-4"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                {/* 앱 기본 정보 */}
                <div className="flex items-start gap-4">
                  {app.icon_url
                    ? <img src={app.icon_url} alt={app.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ backgroundColor: '#1a0a0e' }} />
                    : <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{app.name}</div>
                    {app.tagline && (
                      <div className="text-xs mt-0.5" style={{ color: C.sub }}>{app.tagline}</div>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: C.muted }}>
                      <span>{app.category}</span>
                      <span>{new Date(app.created_at).toLocaleDateString('ko-KR')}</span>
                      {app.developer_name && <span>by {app.developer_name}</span>}
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                {app.description && (
                  <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ backgroundColor: '#0d0a10', border: '1px solid #1a1015', color: C.sub, fontFamily: C.ibm }}>
                    {app.description}
                  </div>
                )}

                {/* 원본 URL */}
                {app.origin_url && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <a href={app.origin_url} target="_blank" rel="noopener noreferrer"
                      className="truncate hover:underline" style={{ color: C.redDim }}>
                      {app.origin_url}
                    </a>
                  </div>
                )}

                {/* 반려 이유 입력 */}
                {rejectTarget === app.id && (
                  <div className="space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="반려 사유를 입력하세요 (선택)"
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
                      style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.ibm }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => review(app.id, 'reject', rejectReason)}
                        disabled={loading === app.id}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: '#330000', color: C.red, border: '1px solid #660000' }}>
                        {loading === app.id ? '처리 중...' : '반려 확정'}
                      </button>
                      <button onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                        className="px-4 py-2 rounded-lg text-xs"
                        style={{ backgroundColor: '#0d0a10', color: C.muted, border: `1px solid ${C.border}` }}>
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                {rejectTarget !== app.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => review(app.id, 'approve')}
                      disabled={loading === app.id}
                      className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ backgroundColor: '#0d1a0d', color: '#4ade80', border: '1px solid #1a4a1a' }}>
                      {loading === app.id ? '처리 중...' : '승인 — 마켓 게시'}
                    </button>
                    <button
                      onClick={() => setRejectTarget(app.id)}
                      disabled={loading === app.id}
                      className="flex-1 py-2.5 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000' }}>
                      반려
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 최근 처리 내역 */}
      {recent.length > 0 && (
        <section>
          <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>최근 처리 내역</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {recent.map((app, i) => (
              <div key={app.id} className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: C.card, borderBottom: i < recent.length - 1 ? '1px solid #1a1018' : 'none' }}>
                {app.icon_url
                  ? <img src={app.icon_url} alt={app.name} className="w-8 h-8 rounded-lg object-cover" />
                  : <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#1a0404' }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: C.text }}>{app.name}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{new Date(app.created_at).toLocaleDateString('ko-KR')}</div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:   { bg: '#0d1a0d', color: '#4ade80', label: '승인' },
    rejected: { bg: '#1a0404', color: '#cc1a1a', label: '반려' },
    pending:  { bg: '#1a1400', color: '#ccaa00', label: '심사중' },
  };
  const s = map[status] ?? { bg: '#0d0d14', color: '#888888', label: status };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      {s.label}
    </span>
  );
}
