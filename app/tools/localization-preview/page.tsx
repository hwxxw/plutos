'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LangResult = {
  code: string;
  name: string;
  flag: string;
  desc: string;
  tip: string;
};

export default function LocalizationPreviewPage() {
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LangResult[]>([]);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/tools/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, appDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setResults(data.languages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 02
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          AI 글로벌 현지화 미리보기
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          앱 이름과 설명을 입력하면 Claude AI가 20개 언어로 현지화 번역과 문화적 인사이트를 제공합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
            앱 이름 (한국어)
          </label>
          <input
            value={appName}
            onChange={e => setAppName(e.target.value)}
            placeholder="예: 스마트 일정 관리"
            required
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8', fontFamily: "'IBM Plex Sans KR', sans-serif" }}
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
            앱 설명 (한국어)
          </label>
          <textarea
            value={appDesc}
            onChange={e => setAppDesc(e.target.value)}
            placeholder="예: AI로 업무 일정을 자동 최적화하는 생산성 앱"
            required
            rows={3}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8', fontFamily: "'IBM Plex Sans KR', sans-serif" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: loading ? '#330000' : '#cc1a1a',
            color: '#fff',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.1em',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'AI 번역 중...' : '20개 언어로 현지화 →'}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center py-12 gap-4">
          <motion.div className="relative w-16 h-16">
            <motion.div className="absolute inset-0 rounded-full" style={{ border: '2px solid #330000' }}
              animate={{ rotate: 360 }} transition={{ duration: 2, ease: 'linear', repeat: Infinity }} />
            <motion.div className="absolute inset-2 rounded-full" style={{ border: '1.5px solid #cc1a1a', borderTopColor: 'transparent' }}
              animate={{ rotate: -360 }} transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }} />
          </motion.div>
          <div className="text-xs text-center" style={{ color: '#664444', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
            Claude AI가 20개 언어를 동시 분석 중입니다…
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#1a0404', border: '1px solid #660000', color: '#cc3333', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
            {results.length}개 언어 현지화 완료
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((lang, i) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>{lang.name}</div>
                    <div className="text-[10px]" style={{ color: '#664444' }}>{lang.code}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#cc1a1a', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{lang.name}</div>
                <div className="text-xs leading-relaxed mb-2" style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{lang.desc}</div>
                {lang.tip && (
                  <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: '#0d0a10', color: '#554444', border: '1px solid #1a1018' }}>
                    💡 {lang.tip}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
              글로벌 판매 시작하기 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
