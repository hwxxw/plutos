'use client';

import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import Link from 'next/link';

/* ── 색상 팔레트 ───────────────────────────── */
const C = {
  bg:      '#0d0d14',
  card:    '#120a0e',
  border:  '#2a1515',
  borderA: '#660000',
  red:     '#cc1a1a',
  redDim:  '#880000',
  redDeep: '#4A0404',
  text:    '#e8e8e8',
  sub:     '#888888',
  muted:   '#4a3535',
  cinzel:  'Cinzel, serif',
  ibm:     "'IBM Plex Sans KR', sans-serif",
};

const spring28 = { type: 'spring' as const, stiffness: 220, damping: 28 };
const spring20 = { type: 'spring' as const, stiffness: 300, damping: 20 };

type RevealFrom = 'up' | 'left' | 'right' | 'scale' | 'flip';
type MotionValues = { opacity: number; y?: number; x?: number; scale?: number; rotateX?: number };

function getInit(from: RevealFrom, distance: number): MotionValues {
  switch (from) {
    case 'left':  return { opacity: 0, x: -distance };
    case 'right': return { opacity: 0, x: distance };
    case 'scale': return { opacity: 0, scale: 0.82 };
    case 'flip':  return { opacity: 0, rotateX: 30, y: 20 };
    default:      return { opacity: 0, y: distance };
  }
}

/* ── InView 트리거 래퍼 ──────────────────── */
function Reveal({
  children, delay = 0, className = '',
  from = 'up', distance = 40,
}: {
  children: React.ReactNode; delay?: number; className?: string;
  from?: RevealFrom; distance?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  const init = getInit(from, distance);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={init}
      animate={inView ? { opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0 } : init}
      transition={{ ...spring28, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── 섹션 구분선 ──────────────────────────── */
function Divider({ label }: { label?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  return (
    <div ref={ref} className="flex items-center gap-4 my-20">
      <motion.div
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="h-px flex-1 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${C.redDim})` }}
      />
      {label ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.75 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, ...spring20 }}
          className="text-[9px] uppercase tracking-[0.3em] px-3 py-1 rounded-sm border flex-shrink-0"
          style={{ color: C.redDim, borderColor: C.border, backgroundColor: C.card, fontFamily: C.cinzel }}
        >
          {label}
        </motion.span>
      ) : (
        <motion.div
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.4, ...spring20 }}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: C.redDim }}
        />
      )}
      <motion.div
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="h-px flex-1 origin-right"
        style={{ background: `linear-gradient(90deg, ${C.redDim}, transparent)` }}
      />
    </div>
  );
}

/* ── 기하학 장식 ──────────────────────────── */
function Geo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <rect x="8" y="8" width="36" height="36" stroke="#330000" strokeWidth="0.8" />
      <rect x="26" y="26" width="36" height="36" stroke="#440000" strokeWidth="0.6" />
      <rect x="56" y="56" width="36" height="36" stroke="#330000" strokeWidth="0.8" />
      <line x1="8" y1="8" x2="92" y2="92" stroke="#220000" strokeWidth="0.4" />
      <circle cx="50" cy="50" r="18" stroke="#330000" strokeWidth="0.5" />
    </svg>
  );
}

/* ── [섹션 1] 페인포인트 카드 ──────────────── */
function PainCard({ icon, title, stat, desc, delay }: {
  icon: React.ReactNode; title: string; stat: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: 12 }}
      animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ ...spring28, delay }}
      whileHover={{ scale: 1.05, y: -6, borderColor: C.borderA, boxShadow: '0 20px 48px rgba(100,0,0,0.25)' }}
      className="rounded-2xl p-5"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, perspective: '800px' }}
    >
      <div style={{ color: C.redDim }} className="mb-3">{icon}</div>
      <div className="text-2xl font-black mb-1" style={{ color: C.red, fontFamily: C.cinzel }}>{stat}</div>
      <div className="text-xs font-semibold mb-2" style={{ color: C.text, fontFamily: C.cinzel, letterSpacing: '0.05em' }}>{title}</div>
      <p className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</p>
    </motion.div>
  );
}

/* ── [섹션 2] 솔루션 행 — 왼쪽 슬라이드 ─── */
function SolutionRow({ num, title, desc, delay }: {
  num: string; title: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...spring28, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex gap-5 items-start py-5 border-b cursor-default"
      style={{ borderColor: C.border }}
    >
      <motion.span
        animate={{ color: hovered ? C.red : C.redDim, scale: hovered ? 1.15 : 1 }}
        transition={spring20}
        className="text-xs font-black mt-0.5 flex-shrink-0 tabular-nums"
        style={{ fontFamily: C.cinzel }}
      >
        {num}
      </motion.span>
      <div>
        <motion.div
          animate={{ color: hovered ? C.text : '#cccccc' }}
          className="text-sm font-semibold mb-1"
          style={{ fontFamily: C.cinzel, letterSpacing: '0.05em' }}
        >
          {title}
        </motion.div>
        <div className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</div>
      </div>
    </motion.div>
  );
}

/* ── [섹션 3] 보안 레이어 — 순차 팝 ────────── */
function LayerCard({ n, title, desc, delay }: {
  n: number; title: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.7, y: 40 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      whileHover={{ scale: 1.06, y: -6, borderColor: C.redDim, boxShadow: '0 16px 40px rgba(100,0,0,0.28)' }}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${n === 1 ? C.red : n === 2 ? C.redDim : '#550000'}, transparent)` }}
      />
      <div className="text-[10px] font-black mb-3 tracking-widest" style={{ color: C.redDim, fontFamily: C.cinzel }}>
        LAYER {n}
      </div>
      <div className="text-sm font-semibold mb-2" style={{ color: C.text, fontFamily: C.cinzel }}>{title}</div>
      <div className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</div>
    </motion.div>
  );
}

/* ── [섹션 4] 로드맵 타임라인 ───────────────── */
function Phase({ tag, label, items, delay, active }: {
  tag: string; label: string; items: string[]; delay: number; active?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...spring28, delay }}
      className="relative pl-8"
    >
      <motion.div
        initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.7, delay: delay + 0.15, ease: 'easeOut' }}
        className="absolute left-0 top-2 bottom-0 w-px origin-top"
        style={{ backgroundColor: active ? C.red : C.border }}
      />
      <motion.div
        initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
        transition={{ ...spring20, delay: delay + 0.25 }}
        className="absolute left-[-4px] top-2 w-2 h-2 rounded-full"
        style={{ backgroundColor: active ? C.red : C.muted, boxShadow: active ? `0 0 8px ${C.red}` : 'none' }}
      />
      <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: active ? C.red : C.muted, fontFamily: C.cinzel }}>{tag}</div>
      <div className="text-sm font-semibold mb-3" style={{ color: active ? C.text : C.sub, fontFamily: C.cinzel }}>{label}</div>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...spring28, delay: delay + 0.3 + idx * 0.06 }}
            className="flex items-start gap-2 text-xs"
            style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}
          >
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: active ? C.red : C.muted }} />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── 숫자 카운트업 ────────────────────────── */
function CountUp({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '100px' });
  const count = useRef(0);
  const [display, setDisplay] = useState(0);
  if (inView && count.current === 0) {
    count.current = 1;
    const step = Math.ceil(to / 40);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, to);
      setDisplay(cur);
      if (cur >= to) clearInterval(timer);
    }, 30);
  }
  return <span ref={ref}>{prefix}{inView ? display : 0}{suffix}</span>;
}

/* ── 메인 ─────────────────────────────────── */
export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div style={{ color: C.text, backgroundColor: C.bg }}>

      {/* ══ HERO ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[96vh] flex flex-col justify-center overflow-hidden -mt-6 -mx-4 px-8">

        {/* 배경 글로우 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 90% 55% at 50% -5%, rgba(130,0,0,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 45% 50% at 85% 90%, rgba(60,0,0,0.14) 0%, transparent 55%)
          `,
        }} />

        {/* 기하학 장식 */}
        <Geo className="absolute top-4 right-4 w-44 h-44 opacity-[0.13]" />
        <Geo className="absolute bottom-16 left-0 w-28 h-28 opacity-[0.07] rotate-45" />

        {/* 왼쪽 수직선 */}
        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
          className="absolute left-8 top-0 bottom-0 w-px origin-top"
          style={{ background: `linear-gradient(180deg, transparent, ${C.redDim} 25%, ${C.redDim} 75%, transparent)` }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-2xl">
          {/* 태그 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-8 h-px" style={{ backgroundColor: C.redDim }} />
            <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: C.redDim, fontFamily: C.cinzel }}>
              PWA Marketplace
            </span>
          </motion.div>

          {/* 타이틀 라인별 등장 */}
          {['PLUTOS', '웹 앱 유통의'].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }} animate={{ y: 0 }}
                transition={{ ...spring28, delay: 0.38 + i * 0.13 }}
                className={i === 0 ? 'text-[80px] font-black leading-none mb-1' : 'text-2xl font-light leading-snug mb-2'}
                style={{ fontFamily: C.cinzel, color: i === 0 ? C.text : C.redDim }}
              >
                {line}
              </motion.div>
            </div>
          ))}
          <div className="overflow-hidden mb-12">
            <motion.div
              initial={{ y: '110%' }} animate={{ y: 0 }}
              transition={{ ...spring28, delay: 0.64 }}
              className="text-2xl font-light leading-snug"
              style={{ fontFamily: C.cinzel, color: C.redDim }}
            >
              새로운 표준
            </motion.div>
          </div>

          {/* 설명 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-sm leading-8 max-w-xl mb-12"
            style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}
          >
            기존 앱 유통 생태계의 한계를 극복하고,<br />
            웹 기술의 개방성과 앱의 사용자 경험을 결합한<br />
            PWA 마켓플레이스입니다.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="flex items-center gap-4"
          >
            {[
              { href: '/', label: '마켓 둘러보기 →', primary: true },
              { href: '/developer/survey', label: '개발자 등록', primary: false },
            ].map(({ href, label, primary }) => (
              <motion.div key={href} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <Link href={href} className={primary ? 'btn-primary px-6 py-3 text-sm' : 'btn-secondary px-6 py-3 text-sm'}>
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 스크롤 힌트 */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          className="absolute bottom-8 left-8 flex items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10" style={{ background: `linear-gradient(180deg, transparent, ${C.redDeep})` }}
          />
          <span className="text-[9px] uppercase tracking-widest" style={{ color: '#440000', fontFamily: C.cinzel }}>Scroll</span>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4">

        {/* ══ 섹션 1: MARKET CONTEXT ══════════════════
            애니메이션: 카드 3D 플립 진입 */}
        <Divider label="01 · Market Context" />

        <Reveal from="left" className="mb-3">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>
            시장의 페인 포인트와 기회
          </div>
          <h2 className="text-3xl font-bold leading-snug mb-6" style={{ fontFamily: C.cinzel, color: C.text }}>
            앱 유통의 구조적 문제,<br />
            <span style={{ color: C.red }}>이제 해결합니다.</span>
          </h2>
        </Reveal>

        <Reveal from="up" delay={0.1}>
          <p className="text-sm leading-8 mb-10" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>
            현재 모바일 앱 생태계는 높은 진입 장벽과 사용자 이탈이라는 구조적 문제에 직면해 있습니다.
            PLUTOS는 PWA 기술로 이 장벽을 정면 돌파합니다.
          </p>
        </Reveal>

        {/* 통계 숫자 — 카운트업 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { stat: 87, suffix: '%', label: '설치 저항', sub: '신규 앱 설치 거부율' },
            { stat: 30, suffix: '%', label: '수수료 착취', sub: '주요 앱스토어 평균' },
            { stat: 6,  suffix: '배', label: '비용 차이', sub: 'PLUTOS vs 기존 스토어' },
          ].map((item, i) => (
            <Reveal key={item.label} from="scale" delay={i * 0.1}>
              <div className="rounded-xl p-5 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                <div className="text-3xl font-black mb-1" style={{ color: C.red, fontFamily: C.cinzel }}>
                  <CountUp to={item.stat} suffix={item.suffix} />
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.text, fontFamily: C.cinzel }}>{item.label}</div>
                <div className="text-[10px]" style={{ color: C.sub, fontFamily: C.ibm }}>{item.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <PainCard delay={0}    stat="87%"  title="설치 저항"
            icon={<IconUser />}
            desc="사용자 중 87%가 신규 앱 설치에 소극적. 즉각적인 서비스 접근을 선호합니다." />
          <PainCard delay={0.1} stat="30%"  title="수수료 착취"
            icon={<IconStore />}
            desc="주요 앱 스토어의 수수료 30%와 불투명한 심사 정책이 개발자 수익성을 해칩니다." />
          <PainCard delay={0.2} stat="N×"   title="유지보수 비용"
            icon={<IconDevice />}
            desc="OS별 파편화와 저장 공간 한계로 유지보수 비용이 플랫폼마다 중복 발생합니다." />
        </div>


        {/* ══ 섹션 2: CORE SOLUTIONS ═════════════════
            애니메이션: 좌→우 슬라이드 인, hover 시 숫자 확대 */}
        <Divider label="02 · Core Solutions" />

        <Reveal from="right">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>핵심 솔루션</div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: C.cinzel, color: C.text }}>
            설치 없는 앱 경험
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>
            4대 핵심 기능으로 웹의 개방성을 앱의 성능으로 전환합니다.
          </p>
        </Reveal>

        <div>
          {[
            { num: '01', title: 'Instant Access',
              desc: '별도의 설치 과정 없이 URL 클릭만으로 즉시 서비스를 실행합니다. 홈화면에 추가하면 앱과 동일한 경험.' },
            { num: '02', title: 'Cross-Platform',
              desc: '단일 코드베이스로 iOS, Android, Desktop 등 모든 환경에서 동일한 성능을 보장합니다.' },
            { num: '03', title: 'Discovery Engine',
              desc: '사용자 데이터 분석을 기반으로 최적화된 앱 추천 알고리즘을 제공합니다.' },
            { num: '04', title: 'Unified Payment',
              desc: '글로벌 표준 결제 인프라를 통합하여 원클릭 결제 및 구독 관리를 지원합니다.' },
          ].map((s, i) => <SolutionRow key={s.num} {...s} delay={i * 0.08} />)}
        </div>


        {/* ══ 섹션 3: TECHNICAL MOAT ═════════════════
            애니메이션: 스케일 팝 + 순차 등장 */}
        <Divider label="03 · Technical Moat" />

        <Reveal from="left">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>기술적 해자와 수익 모델</div>
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: C.cinzel, color: C.text }}>
            3중 보안으로<br />
            <span style={{ color: C.red }}>개발자를 보호합니다</span>
          </h2>
        </Reveal>

        <div className="text-[10px] uppercase tracking-[0.28em] mb-5" style={{ color: C.muted, fontFamily: C.cinzel }}>
          Triple Layer Security
        </div>
        <div className="grid grid-cols-3 gap-3">
          <LayerCard n={1} delay={0}    title="Secure Proxy"
            desc="소스 코드 노출을 방지하고 모든 트래픽을 실시간으로 제어합니다." />
          <LayerCard n={2} delay={0.1} title="Advanced Obfuscation"
            desc="독자적 난독화 기술로 역공학(Reverse Engineering)을 원천 차단합니다." />
          <LayerCard n={3} delay={0.2} title="Device Binding"
            desc="하드웨어 기반 인증으로 무단 복제 및 부정 사용을 방지합니다." />
        </div>


        {/* ══ 섹션 4: ROADMAP ═════════════════════════
            애니메이션: 오른쪽 슬라이드 + 타임라인 드로우 */}
        <Divider label="04 · Roadmap" />

        <Reveal from="flip">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>로드맵 및 비전</div>
          <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: C.cinzel, color: C.text }}>
            2027년까지<br />
            <span style={{ color: C.red }}>시장을 재정의합니다</span>
          </h2>
        </Reveal>

        <div className="space-y-10">
          <Phase active tag="Phase 1 · 2026 Q2" label="클로즈 베타 & 핵심 검증" delay={0}
            items={['클로즈 베타 운영', '핵심 보안 기술 안정성 검증', '초기 개발자 파트너 온보딩']} />
          <Phase tag="Phase 2 · 2026 Q4" label="글로벌 오픈 베타" delay={0.1}
            items={['글로벌 결제 인프라 통합', '오픈 베타 서비스 전환', '멀티 언어 지원']} />
          <Phase tag="Phase 3 · 2027" label="AI 고도화 & Enterprise" delay={0.2}
            items={['AI 추천 엔진 고도화', '기업용(Enterprise) 솔루션 확장', '웹 앱 유통 시장 선두 확보']} />
        </div>


        {/* ══ VISION ════════════════════════════════
            애니메이션: 중앙 확장 스케일 */}
        <Divider />

        <Reveal from="scale">
          <div className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, #1a0404 0%, ${C.bg} 70%)`, border: `1px solid #3a1515` }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(100,0,0,0.22), transparent)' }} />
            <Geo className="absolute top-0 right-0 w-32 h-32 opacity-[0.12]" />
            <div className="relative z-10">
              <div className="text-[9px] uppercase tracking-[0.35em] mb-6" style={{ color: C.redDim, fontFamily: C.cinzel }}>Vision</div>
              <blockquote
                className="text-xl font-semibold leading-relaxed mb-10"
                style={{ color: C.text, fontFamily: C.cinzel }}
              >
                "설치의 장벽을 허물고,<br />
                웹의 개방성이 앱의 성능이 되는<br />
                유통 생태계를 구축합니다."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                {[
                  { href: '/', label: '마켓 바로가기', primary: true },
                  { href: '/developer/survey', label: '개발자 시작', primary: false },
                ].map(({ href, label, primary }) => (
                  <motion.div key={href} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                    <Link href={href} className={primary ? 'btn-primary px-7 py-3 text-sm' : 'btn-secondary px-7 py-3 text-sm'}>
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="pb-24" />
      </div>
    </div>
  );
}

/* ── 인라인 아이콘 ─────────────────────────── */
function IconUser() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}
function IconDevice() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2.5} />
    </svg>
  );
}
