'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LangResult = {
  code: string;
  langName: string;
  flag: string;
  translatedName: string;
  desc: string;
  marketing: string;
  tip: string;
};

export default function LocalizationPreviewPage() {
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LangResult[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string>('en');
  const [edited, setEdited] = useState<Record<string, LangResult>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setEdited({});
    try {
      const res = await fetch('/api/tools/localize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, appDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      const langs: LangResult[] = data.languages || [];
      setResults(langs);
      setSelected(langs[0]?.code || 'en');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getItem(code: string): LangResult | undefined {
    return edited[code] ?? results.find(r => r.code === code);
  }

  function updateField(code: string, field: keyof LangResult, value: string) {
    const base = getItem(code);
    if (!base) return;
    setEdited(prev => ({ ...prev, [code]: { ...base, [field]: value } }));
  }

  function handleDownload() {
    const json: Record<string, object> = {};
    results.forEach(r => {
      const item = edited[r.code] ?? r;
      json[r.code] = {
        name: item.translatedName,
        description: item.desc,
        marketing: item.marketing,
      };
    });
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName || 'app'}-i18n.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const current = selected ? getItem(selected) : null;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 02
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          AI 글로벌 진출 패키지
        </h1>
        <p className="text-sm" style={{ color: '#666666' }}>
          앱 이름과 설명을 입력하면 Claude AI가 20개 언어로 현지화 번역·마케팅 카피를 생성합니다.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
              앱 이름
            </label>
            <input
              value={appName}
              onChange={e => setAppName(e.target.value)}
              placeholder="예: 스마트 일정 관리"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
              앱 설명
            </label>
            <input
              value={appDesc}
              onChange={e => setAppDesc(e.target.value)}
              placeholder="예: AI로 업무 일정을 자동 최적화하는 생산성 앱"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }}
            />
          </div>
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
          {loading ? 'AI 분석 중...' : '20개 언어로 현지화 →'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12 gap-4">
          <motion.div className="relative w-16 h-16">
            <motion.div className="absolute inset-0 rounded-full" style={{ border: '2px solid #330000' }}
              animate={{ rotate: 360 }} transition={{ duration: 2, ease: 'linear', repeat: Infinity }} />
            <motion.div className="absolute inset-2 rounded-full" style={{ border: '1.5px solid #cc1a1a', borderTopColor: 'transparent' }}
              animate={{ rotate: -360 }} transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }} />
          </motion.div>
          <div className="text-xs text-center" style={{ color: '#664444' }}>
            Claude AI가 20개 언어 번역·마케팅 카피 생성 중…
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 text-sm text-center" style={{ backgroundColor: '#1a0404', border: '1px solid #660000', color: '#cc3333' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-widest" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
              {results.length}개 언어 현지화 완료
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a', color: '#4ade80' }}
            >
              ⬇ JSON 다운로드
            </button>
          </div>

          <div className="flex gap-4" style={{ minHeight: '600px' }}>
            {/* Language List Sidebar */}
            <div className="flex-shrink-0 w-36 overflow-y-auto space-y-1" style={{ maxHeight: '600px' }}>
              {results.map(r => (
                <button
                  key={r.code}
                  onClick={() => setSelected(r.code)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: selected === r.code ? '#2a0808' : '#0d0a10',
                    border: `1px solid ${selected === r.code ? '#660000' : '#1a1015'}`,
                    color: selected === r.code ? '#e8e8e8' : '#664444',
                  }}
                >
                  <span>{r.flag}</span>
                  <span className="truncate">{r.langName}</span>
                  {edited[r.code] && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#cc1a1a' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Preview Panel */}
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 space-y-4"
                >
                  {/* App Store Preview */}
                  <div className="rounded-2xl p-5" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
                    <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
                      {current.flag} {current.langName} — App Store Preview
                    </div>

                    {/* Simulated app store card */}
                    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#0d0a10', border: '1px solid #1a1015' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                          style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
                          🤖
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm mb-0.5 truncate" style={{ color: '#e8e8e8' }}>
                            {current.translatedName}
                          </div>
                          <div className="text-[11px] mb-2" style={{ color: '#cc1a1a' }}>
                            {current.marketing}
                          </div>
                          <div className="text-xs leading-relaxed" style={{ color: '#888888' }}>
                            {current.desc}
                          </div>
                        </div>
                      </div>
                    </div>

                    {current.tip && (
                      <div className="flex items-start gap-2 text-[11px] px-3 py-2 rounded-lg"
                        style={{ backgroundColor: '#0a0a14', border: '1px solid #1a1a2a', color: '#6666aa' }}>
                        💡 <span>{current.tip}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit Fields */}
                  <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#0d0a10', border: '1px solid #1a1015' }}>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
                      직접 편집
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#554444' }}>
                        앱 이름
                      </label>
                      <input
                        value={current.translatedName}
                        onChange={e => updateField(selected, 'translatedName', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: '#120a0e', border: '1px solid #3a1515', color: '#e8e8e8' }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#554444' }}>
                        마케팅 카피
                      </label>
                      <input
                        value={current.marketing}
                        onChange={e => updateField(selected, 'marketing', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: '#120a0e', border: '1px solid #3a1515', color: '#e8e8e8' }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#554444' }}>
                        설명
                      </label>
                      <textarea
                        value={current.desc}
                        onChange={e => updateField(selected, 'desc', e.target.value)}
                        rows={4}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        style={{ backgroundColor: '#120a0e', border: '1px solid #3a1515', color: '#e8e8e8' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-8">
            <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
              글로벌 판매 시작하기 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
