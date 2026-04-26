'use client';

import { useState } from 'react';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

export function ReviewForm({ appId, onSuccess }: { appId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [title, setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError('별점을 선택해주세요.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, rating, title: title || undefined, content: content || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          already_reviewed: '이미 리뷰를 작성하셨습니다.',
          no_license: '구매한 경우에만 리뷰를 작성할 수 있습니다.',
          invalid_params: '별점은 필수입니다.',
        };
        throw new Error(msgs[data.error] ?? '오류가 발생했습니다.');
      }
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: '#0a2a0a', border: '1px solid #1a4a1a' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2} strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className="text-sm font-bold" style={{ color: '#4ade80', fontFamily: C.cinzel }}>리뷰가 등록되었습니다</div>
        <div className="text-xs mt-1" style={{ color: '#6a9a6a', fontFamily: C.ibm }}>감사합니다! 다른 사용자에게 큰 도움이 됩니다.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5 space-y-4"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <h3 className="font-bold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>리뷰 작성</h3>

      {/* 별점 선택 */}
      <div>
        <div className="text-xs mb-2" style={{ color: C.muted, fontFamily: C.ibm }}>별점 *</div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl leading-none transition-all duration-100 hover:scale-125">
              <span style={{ color: s <= (hover || rating) ? '#f59e0b' : '#2a2020' }}>★</span>
            </button>
          ))}
          {(hover || rating) > 0 && (
            <span className="text-xs self-center ml-1" style={{ color: C.sub, fontFamily: C.ibm }}>
              {['', '별로예요', '아쉬워요', '괜찮아요', '좋아요', '최고예요'][hover || rating]}
            </span>
          )}
        </div>
      </div>

      {/* 제목 */}
      <div>
        <div className="text-xs mb-1.5" style={{ color: C.muted, fontFamily: C.ibm }}>제목 (선택)</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="한 줄 요약"
          maxLength={80}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.ibm }}
        />
      </div>

      {/* 내용 */}
      <div>
        <div className="text-xs mb-1.5" style={{ color: C.muted, fontFamily: C.ibm }}>내용 (선택)</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 앱에 대한 솔직한 리뷰를 남겨주세요."
          rows={4}
          maxLength={1000}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
          style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.ibm }}
        />
        <div className="text-right text-[10px] mt-0.5" style={{ color: C.muted }}>{content.length}/1000</div>
      </div>

      {error && (
        <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#1a0404', border: '1px solid #330000', color: C.red }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading || !rating}
        className="w-full py-2.5 rounded-xl text-sm font-black disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: C.red, color: '#fff', fontFamily: C.cinzel }}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            등록 중...
          </span>
        ) : '리뷰 등록'}
      </button>
    </form>
  );
}
