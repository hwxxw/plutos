'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };

interface SurveyData {
  appName: string;
  appUrl: string;
  category: string;
  description: string;
  targetUser: string;
  techStack: string;
  pricingIdea: string;
  monthlyUsers: string;
  mainFeature: string;
  devGoal: string;
}

interface AIResult {
  verdict: 'approved' | 'conditional' | 'rejected';
  score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

const CATEGORIES = ['글쓰기', '데이터 분석', '자동화', '디자인', '학습/교육', '비즈니스', '마케팅', '개발 도구', '기타'];
const STEPS = ['기본 정보', '앱 설명', '대상 & 가격', '목표 & 제출'];

export default function DeveloperSurveyPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    appName: '', appUrl: '', category: '', description: '',
    targetUser: '', techStack: '', pricingIdea: '',
    monthlyUsers: '', mainFeature: '', devGoal: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState('');

  function update(field: keyof SurveyData, value: string) {
    setData((p) => ({ ...p, [field]: value }));
  }

  function canNext() {
    if (step === 0) return data.appName.trim() && data.category;
    if (step === 1) return data.description.trim().length >= 30 && data.mainFeature.trim();
    if (step === 2) return data.targetUser.trim() && data.pricingIdea;
    return data.devGoal.trim().length >= 10;
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/developer/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('분석 실패');
      const json = await res.json();
      setResult(json);
    } catch {
      setError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <ResultView result={result} appName={data.appName} />;
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="text-[11px] text-brand-500 font-bold uppercase tracking-[0.2em] mb-3">
          PLUTOS Developer Program
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
          앱 <span className="text-brand-500">출시 가능성</span> 진단
        </h1>
        <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
          AI가 귀하의 앱을 분석하여 PLUTOS 마켓 출시 가능성을 판단합니다.
        </p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: i < step ? '#cc1a1a' : i === step ? '#991414' : '#1e1218',
                  borderColor: i <= step ? '#cc1a1a' : '#3a1515',
                  scale: i === step ? 1.15 : 1,
                }}
                transition={spring}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold"
                style={{ color: i <= step ? '#fff' : '#554444' }}
              >
                {i < step ? '✓' : i + 1}
              </motion.div>
              <span className="text-[9px] mt-1 text-center whitespace-nowrap"
                style={{ color: i === step ? '#cc1a1a' : '#444444' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: i < step ? '#cc1a1a' : '#2a1515' }}
                transition={{ duration: 0.4 }}
                className="flex-1 h-px mx-1 mb-4"
              />
            )}
          </div>
        ))}
      </div>

      {/* 스텝 폼 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={spring}
          className="card space-y-4"
        >
          {step === 0 && (
            <>
              <h2 className="text-base font-semibold text-white">기본 정보</h2>
              <Field label="앱 이름 *" hint="마켓에 표시될 앱 이름">
                <Input value={data.appName} onChange={(v) => update('appName', v)} placeholder="예: AI 문서 요약기" />
              </Field>
              <Field label="앱 URL" hint="현재 운영 중인 URL (없으면 공란)">
                <Input value={data.appUrl} onChange={(v) => update('appUrl', v)} placeholder="https://..." />
              </Field>
              <Field label="카테고리 *">
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      onClick={() => update('category', cat)}
                      whileTap={{ scale: 0.94 }}
                      className="py-1.5 px-2 rounded text-xs border transition-colors"
                      style={{
                        backgroundColor: data.category === cat ? '#2a0808' : '#160d12',
                        borderColor: data.category === cat ? '#cc1a1a' : '#3a1515',
                        color: data.category === cat ? '#fff' : '#888',
                      }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-base font-semibold text-white">앱 설명</h2>
              <Field label="앱 소개 * (30자 이상)" hint="무엇을 하는 앱인지 자세히 설명해 주세요">
                <Textarea
                  value={data.description}
                  onChange={(v) => update('description', v)}
                  placeholder="예: PDF, 이미지, 텍스트 등을 붙여넣으면 AI가 핵심만 요약해주는 웹 앱입니다..."
                  rows={4}
                />
                <div className="text-[10px] text-right mt-1" style={{ color: data.description.length >= 30 ? '#888' : '#cc4444' }}>
                  {data.description.length}자
                </div>
              </Field>
              <Field label="핵심 기능 *" hint="가장 중요한 기능 하나">
                <Input value={data.mainFeature} onChange={(v) => update('mainFeature', v)} placeholder="예: GPT-4 기반 실시간 문서 요약" />
              </Field>
              <Field label="기술 스택" hint="사용한 주요 기술 (선택)">
                <Input value={data.techStack} onChange={(v) => update('techStack', v)} placeholder="예: Next.js, OpenAI API, Supabase" />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-base font-semibold text-white">대상 & 가격</h2>
              <Field label="타깃 사용자 *" hint="누가 사용하는 앱인가요?">
                <Input value={data.targetUser} onChange={(v) => update('targetUser', v)} placeholder="예: 논문 작성하는 대학원생, 콘텐츠 마케터" />
              </Field>
              <Field label="예상 가격대 *">
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    '₩4,900 ~ ₩14,900 (Basic)',
                    '₩19,900 ~ ₩79,900 (Plus)',
                    '₩79,000 ~ ₩499,000 (Business)',
                    '무료 or 미정',
                  ].map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => update('pricingIdea', p)}
                      whileTap={{ scale: 0.94 }}
                      className="py-2 px-2 rounded text-[11px] border transition-colors text-left"
                      style={{
                        backgroundColor: data.pricingIdea === p ? '#2a0808' : '#160d12',
                        borderColor: data.pricingIdea === p ? '#cc1a1a' : '#3a1515',
                        color: data.pricingIdea === p ? '#fff' : '#888',
                      }}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </Field>
              <Field label="월 사용자 예상" hint="현재 또는 목표 사용자 수 (선택)">
                <select
                  value={data.monthlyUsers}
                  onChange={(e) => update('monthlyUsers', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">선택</option>
                  <option>100명 미만</option>
                  <option>100~500명</option>
                  <option>500~2,000명</option>
                  <option>2,000명 이상</option>
                </select>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-base font-semibold text-white">개발 목표 & 제출</h2>
              <Field label="출시 목표 *" hint="왜 이 앱을 마켓에 등록하려 하나요? (10자 이상)">
                <Textarea
                  value={data.devGoal}
                  onChange={(v) => update('devGoal', v)}
                  placeholder="예: 직접 만든 요약 툴을 수익화하고 싶습니다. 현재 베타 테스트 중이며..."
                  rows={3}
                />
              </Field>
              <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#160d12', border: '1px solid #2a1515' }}>
                <div className="font-semibold text-white mb-2">제출 요약</div>
                <div className="space-y-1 text-xs text-zinc-400">
                  <div><span className="text-zinc-300">앱명:</span> {data.appName}</div>
                  <div><span className="text-zinc-300">카테고리:</span> {data.category}</div>
                  <div><span className="text-zinc-300">가격대:</span> {data.pricingIdea}</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                AI가 입력 내용을 분석하여 출시 가능성을 판단합니다. 결과에 따라 즉시 개발자 등록으로 연결됩니다.
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 에러 */}
      {error && (
        <div className="mt-4 text-xs p-3 rounded-lg bg-brand-900/30 border border-brand-800 text-brand-400">
          {error}
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <button
            onClick={() => setStep((p) => p - 1)}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← 이전
          </button>
        ) : (
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-400">취소</Link>
        )}

        {step < STEPS.length - 1 ? (
          <motion.button
            onClick={() => setStep((p) => p + 1)}
            disabled={!canNext()}
            whileHover={canNext() ? { scale: 1.04 } : {}}
            whileTap={canNext() ? { scale: 0.96 } : {}}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40"
          >
            다음 →
          </motion.button>
        ) : (
          <motion.button
            onClick={handleSubmit}
            disabled={!canNext() || loading}
            whileHover={canNext() && !loading ? { scale: 1.04 } : {}}
            whileTap={canNext() && !loading ? { scale: 0.96 } : {}}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                AI 분석 중...
              </span>
            ) : (
              'AI 분석 시작 →'
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ── AI 결과 화면 ──────────────────────────── */
function ResultView({ result, appName }: { result: AIResult; appName: string }) {
  const verdictColor = result.verdict === 'approved' ? '#22c55e' : result.verdict === 'conditional' ? '#f59e0b' : '#ef4444';
  const verdictLabel = result.verdict === 'approved' ? '출시 적합' : result.verdict === 'conditional' ? '조건부 승인' : '보완 필요';
  const verdictIcon  = result.verdict === 'approved' ? '✓' : result.verdict === 'conditional' ? '△' : '✗';

  return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <div className="text-[11px] text-brand-500 font-bold uppercase tracking-[0.2em]">AI 분석 결과</div>
      <h1 className="text-2xl font-bold text-white">{appName}</h1>

      {/* 판정 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="card text-center py-8"
        style={{ borderColor: verdictColor + '44' }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
          style={{ backgroundColor: verdictColor + '22', border: `2px solid ${verdictColor}`, color: verdictColor }}>
          {verdictIcon}
        </div>
        <div className="text-xl font-bold mb-2" style={{ color: verdictColor }}>{verdictLabel}</div>
        <div className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">{result.summary}</div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-zinc-500">적합도 점수</span>
          <span className="text-lg font-bold" style={{ color: verdictColor }}>{result.score}/100</span>
        </div>
      </motion.div>

      {/* 강점 */}
      <div className="card">
        <div className="text-xs font-semibold text-green-400 mb-3 uppercase tracking-wider">강점</div>
        <ul className="space-y-2">
          {result.strengths.map((s, i) => (
            <motion.li key={i}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              className="flex items-start gap-2 text-sm text-zinc-300"
            >
              <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
              {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* 우려사항 */}
      {result.concerns.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider">보완 사항</div>
          <ul className="space-y-2">
            {result.concerns.map((c, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.2, type: 'spring', stiffness: 260, damping: 22 }}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <span className="text-amber-500 mt-0.5 flex-shrink-0">△</span>
                {c}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* 권고사항 */}
      <div className="card" style={{ borderColor: '#2a3a15' }}>
        <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">AI 권고</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{result.recommendation}</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        {result.verdict !== 'rejected' ? (
          <Link href="/developer/register" className="btn-primary w-full py-3 text-center text-sm">
            개발자 등록 계속하기 →
          </Link>
        ) : (
          <button onClick={() => window.location.reload()} className="btn-secondary w-full py-3 text-sm">
            다시 작성하기
          </button>
        )}
        <Link href="/" className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

/* ── 공통 폼 컴포넌트 ───────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[10px] text-zinc-600 mb-2">{hint}</p>}
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors duration-150"
    />
  );
}
function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors duration-150 resize-none"
    />
  );
}
