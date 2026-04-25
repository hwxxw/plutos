'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PWAResult = {
  slug: string;
  manifest: object;
  serviceWorker: string;
  installInstructions: string;
};

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a1515' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1a0404', borderBottom: '1px solid #2a1515' }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>{label}</span>
        <button onClick={copy} className="text-[10px] px-3 py-1 rounded transition-all"
          style={{ backgroundColor: copied ? '#003300' : '#160d12', color: copied ? '#00aa44' : '#554444', border: '1px solid #2a1515' }}>
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <pre className="p-4 text-[11px] overflow-x-auto" style={{ backgroundColor: '#0d0a10', color: '#888888', fontFamily: 'monospace', maxHeight: 280 }}>
        {content}
      </pre>
    </div>
  );
}

export default function PWAEnginePage() {
  const [url, setUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [themeColor, setThemeColor] = useState('#0d0d14');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PWAResult | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'manifest' | 'sw' | 'install'>('manifest');

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/tools/pwa-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, appName, themeColor }),
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

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 05
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          원클릭 PWA 엔진
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          URL 하나로 manifest.json, service-worker.js를 즉시 생성합니다. 어떤 웹사이트도 PWA로 변환하세요.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>웹사이트 URL *</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourwebsite.com" required
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>앱 이름</label>
            <input value={appName} onChange={e => setAppName(e.target.value)} placeholder="My Awesome App"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>테마 색상</label>
            <div className="flex gap-2">
              <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
                className="h-12 w-12 rounded-lg cursor-pointer border-0 p-1"
                style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515' }} />
              <input value={themeColor} onChange={e => setThemeColor(e.target.value)}
                className="flex-1 rounded-lg px-4 py-3 text-sm outline-none"
                style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }} />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: loading ? '#330000' : '#cc1a1a', color: '#fff', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'PWA 파일 생성 중...' : 'PWA 파일 즉시 생성 →'}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          {['URL 분석', 'Manifest 생성', 'Service Worker 작성', '설치 가이드 작성'].map((step, i) => (
            <motion.div key={step}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.4, type: 'spring' }}
              className="flex items-center gap-3 text-xs" style={{ color: '#664444', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#cc1a1a' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.4 }} />
              {step}…
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
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="space-y-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#00aa44' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontFamily: 'Cinzel, serif' }}>PWA 파일 생성 완료 — {result.slug}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {(['manifest', 'sw', 'install'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-t text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: tab === t ? '#1a0404' : '#120a0e',
                    color: tab === t ? '#cc1a1a' : '#554444',
                    borderBottom: tab === t ? '2px solid #cc1a1a' : '2px solid transparent',
                    fontFamily: 'Cinzel, serif',
                  }}>
                  {t === 'manifest' ? 'manifest.json' : t === 'sw' ? 'service-worker.js' : '설치 가이드'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}>
                {tab === 'manifest' && (
                  <CopyBlock label="manifest.json" content={JSON.stringify(result.manifest, null, 2)} />
                )}
                {tab === 'sw' && (
                  <CopyBlock label="service-worker.js" content={result.serviceWorker} />
                )}
                {tab === 'install' && (
                  <div className="rounded-xl p-5" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#aaaaaa', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
                      {result.installInstructions}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="text-center pt-2">
              <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
                PLUTOS에 앱 올리기 →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
