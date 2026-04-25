'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Check = { id: string; label: string; pass: boolean; detail: string };
type AuditResult = { score: number; grade: string; checks: Check[]; recommendation: string };

const GRADE_COLOR: Record<string, string> = {
  S: '#00cc66', A: '#88cc00', B: '#ccaa00', C: '#cc6600', D: '#cc1a1a',
};

export default function SecurityAuditPage() {
  const [appUrl, setAppUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/tools/security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appUrl, appName, appDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const gradeColor = result ? (GRADE_COLOR[result.grade] || '#cc1a1a') : '#cc1a1a';

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 03
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          실시간 보안 감사
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          앱 URL을 입력하면 AI가 8가지 보안 항목을 점검하고 S~D 등급으로 평가합니다.
        </p>
      </div>

      <form onSubmit={handleAudit} className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>앱 URL *</label>
          <input value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="https://yourapp.com" required
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>앱 이름</label>
            <input value={appName} onChange={e => setAppName(e.target.value)} placeholder="My App"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>앱 설명</label>
            <input value={appDesc} onChange={e => setAppDesc(e.target.value)} placeholder="간략한 설명"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: loading ? '#330000' : '#cc1a1a', color: '#fff', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', opacity: loading ? 0.7 : 1 }}>
          {loading ? '보안 분석 중...' : '보안 감사 시작 →'}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center py-10 gap-4">
          {['HTTPS', 'CSP', 'Headers', 'CORS', 'PWA', 'Auth', 'Deps', 'XSS'].map((item, i) => (
            <motion.div key={item}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              className="flex items-center gap-3 text-xs" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
              <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#cc1a1a' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
              Scanning {item}…
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#1a0404', border: '1px solid #660000', color: '#cc3333' }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="space-y-4">
            {/* Grade + Score */}
            <div className="rounded-2xl p-8 flex items-center justify-between" style={{ backgroundColor: '#120a0e', border: `1px solid ${gradeColor}33` }}>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>Security Score</div>
                <div className="text-6xl font-black" style={{ color: gradeColor, fontFamily: 'Cinzel, serif' }}>{result.score}</div>
                <div className="text-sm mt-1" style={{ color: '#666666' }}>/100</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>Grade</div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                  className="text-8xl font-black" style={{ color: gradeColor, fontFamily: 'Cinzel, serif', lineHeight: 1 }}>
                  {result.grade}
                </motion.div>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1a0a0e' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full" style={{ backgroundColor: gradeColor }} />
            </div>

            {/* Checks */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a1515' }}>
              {result.checks.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, type: 'spring' }}
                  className="flex items-start gap-4 px-5 py-3 border-b"
                  style={{ backgroundColor: '#120a0e', borderColor: '#1a1018' }}>
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: c.pass ? '#0d1a0d' : '#1a0404', border: `1px solid ${c.pass ? '#1a4a1a' : '#4a1a1a'}` }}>
                    {c.pass
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cc1a1a" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-0.5" style={{ color: c.pass ? '#e8e8e8' : '#888888', fontFamily: 'Cinzel, serif' }}>{c.label}</div>
                    <div className="text-[11px]" style={{ color: '#554444', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{c.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>개선 권고사항</div>
              <p className="text-sm leading-relaxed" style={{ color: '#aaaaaa', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{result.recommendation}</p>
            </div>

            <div className="text-center">
              <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
                PLUTOS 보안 인프라로 보호받기 →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
