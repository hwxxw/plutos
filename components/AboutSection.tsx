'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from './LanguageProvider';

const C = {
  bg:     '#0d0d14',
  card:   '#120a0e',
  border: '#2a1515',
  borderA:'#660000',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif',
  ibm:    "'IBM Plex Sans KR', sans-serif",
};

const spring = { type: 'spring' as const, stiffness: 220, damping: 28 };
const springPop = { type: 'spring' as const, stiffness: 300, damping: 20 };

/* ── InView 래퍼 — 화면 들어오면 바로 실행 ── */
type From = 'up' | 'left' | 'right' | 'scale';

function Reveal({ children, from = 'up', delay = 0, className = '' }: {
  children: React.ReactNode; from?: From; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });

  const hidden =
    from === 'left'  ? { opacity: 0, x: -48 } :
    from === 'right' ? { opacity: 0, x: 48 }  :
    from === 'scale' ? { opacity: 0, scale: 0.85 } :
                       { opacity: 0, y: 36 };

  return (
    <motion.div ref={ref} className={className}
      initial={hidden}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : hidden}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── 섹션 구분선 ── */
function Divider({ label }: { label?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  return (
    <div ref={ref} className="flex items-center gap-4 my-16">
      <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-px flex-1 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${C.redDim})` }} />
      {label ? (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, ...springPop }}
          className="text-[9px] uppercase tracking-[0.3em] px-3 py-1 rounded-sm border flex-shrink-0"
          style={{ color: C.redDim, borderColor: C.border, backgroundColor: C.card, fontFamily: C.cinzel }}>
          {label}
        </motion.span>
      ) : (
        <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.3, ...springPop }}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: C.redDim }} />
      )}
      <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-px flex-1 origin-right"
        style={{ background: `linear-gradient(90deg, ${C.redDim}, transparent)` }} />
    </div>
  );
}

/* ── 숫자 카운트업 ── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const step = Math.ceil(to / 40);
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, to);
      setDisplay(cur);
      if (cur >= to) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── 페인포인트 카드 ── */
function PainCard({ icon, title, stat, desc, delay }: {
  icon: React.ReactNode; title: string; stat: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay }}
      whileHover={{ scale: 1.04, y: -5, borderColor: C.borderA, boxShadow: '0 16px 40px rgba(100,0,0,0.2)' }}
      className="rounded-2xl p-5"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div style={{ color: C.redDim }} className="mb-3">{icon}</div>
      <div className="text-2xl font-black mb-1" style={{ color: C.red, fontFamily: C.cinzel }}>{stat}</div>
      <div className="text-xs font-semibold mb-2" style={{ color: C.text, fontFamily: C.cinzel }}>{title}</div>
      <p className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</p>
    </motion.div>
  );
}

/* ── 솔루션 행 ── */
function SolutionRow({ num, title, desc, delay }: {
  num: string; title: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...spring, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex gap-5 items-start py-5 border-b cursor-default"
      style={{ borderColor: C.border }}
    >
      <motion.span animate={{ color: hovered ? C.red : C.redDim, scale: hovered ? 1.2 : 1 }}
        transition={springPop}
        className="text-xs font-black mt-0.5 flex-shrink-0 tabular-nums"
        style={{ fontFamily: C.cinzel }}>
        {num}
      </motion.span>
      <div>
        <motion.div animate={{ color: hovered ? C.text : '#cccccc' }}
          className="text-sm font-semibold mb-1"
          style={{ fontFamily: C.cinzel, letterSpacing: '0.05em' }}>
          {title}
        </motion.div>
        <div className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</div>
      </div>
    </motion.div>
  );
}

/* ── 보안 레이어 카드 ── */
function LayerCard({ n, title, desc, delay }: {
  n: number; title: string; desc: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.75, y: 30 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      whileHover={{ scale: 1.05, y: -5, borderColor: C.redDim, boxShadow: '0 14px 36px rgba(100,0,0,0.25)' }}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${n === 1 ? C.red : n === 2 ? C.redDim : '#550000'}, transparent)` }} />
      <div className="text-[10px] font-black mb-3 tracking-widest" style={{ color: C.redDim, fontFamily: C.cinzel }}>LAYER {n}</div>
      <div className="text-sm font-semibold mb-2" style={{ color: C.text, fontFamily: C.cinzel }}>{title}</div>
      <div className="text-xs leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{desc}</div>
    </motion.div>
  );
}

/* ── 로드맵 Phase ── */
function Phase({ tag, label, items, delay, active }: {
  tag: string; label: string; items: string[]; delay: number; active?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '120px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...spring, delay }}
      className="relative pl-8"
    >
      <motion.div initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        className="absolute left-0 top-2 bottom-0 w-px origin-top"
        style={{ backgroundColor: active ? C.red : C.border }} />
      <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
        transition={{ ...springPop, delay: delay + 0.2 }}
        className="absolute left-[-4px] top-2 w-2 h-2 rounded-full"
        style={{ backgroundColor: active ? C.red : C.muted, boxShadow: active ? `0 0 8px ${C.red}` : 'none' }} />
      <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: active ? C.red : C.muted, fontFamily: C.cinzel }}>{tag}</div>
      <div className="text-sm font-semibold mb-3" style={{ color: active ? C.text : C.sub, fontFamily: C.cinzel }}>{label}</div>
      <ul className="space-y-1.5">
        {items.map((item, idx) => (
          <motion.li key={item}
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...spring, delay: delay + 0.25 + idx * 0.06 }}
            className="flex items-start gap-2 text-xs"
            style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>
            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: active ? C.red : C.muted }} />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── 기하학 장식 ── */
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

/* ══ 번역 데이터 ══════════════════════════ */
const T = {
  ko: {
    eyebrow: 'About PLUTOS',
    h2a: '웹 앱 유통의',
    h2b: '새로운 표준',
    div01: '01 · Market Context',
    painEyebrow: '시장의 페인 포인트',
    painH3a: '앱 유통의 구조적 문제,',
    painH3b: '이제 해결합니다.',
    painP: '모바일 앱 생태계는 높은 이탈률과 불균형한 수익 구조라는 문제에 직면해 있습니다. PLUTOS는 PWA 기술로 이 장벽을 정면 돌파합니다.',
    stats: [
      { label: '앱 1일차 이탈률', sub: '첫날 재방문하지 않는 사용자 비율 ①' },
      { label: '기존 스토어 수수료', sub: 'Apple·Google 공식 기본 수수료율' },
      { label: 'PLUTOS 기본 수수료', sub: '정기결제 시 최저 5%까지 인하' },
    ],
    painCards: [
      { stat: '77%', title: '이탈 위기',    desc: '앱 설치 첫날 77%의 사용자가 재방문하지 않습니다. PWA는 URL 접근으로 이 장벽을 제거합니다. ①' },
      { stat: '30%', title: '기존 수수료',  desc: 'Apple·Google 앱스토어 공식 기본 수수료 30%. PLUTOS 기본 수수료는 20%로 즉시 10%p 절감됩니다.' },
      { stat: '5%',  title: '정기결제 요금', desc: '정기결제 플랜 가입 시 수수료 5%. 기존 스토어 대비 최대 25%p 절감, 수익을 최대한 개발자에게.' },
    ],
    footnote: '① 출처: Localytics Mobile Benchmarks Report (2019)  |  PLUTOS 기본 수수료 20%, 정기결제 시 5%',
    div02: '02 · Core Solutions',
    solEyebrow: '핵심 솔루션',
    solH3: '설치 없는 앱 경험',
    solP: '4대 핵심 기능으로 웹의 개방성을 앱의 성능으로 전환합니다.',
    solutions: [
      { title: 'Instant Access',   desc: '별도의 설치 없이 URL 클릭만으로 즉시 실행. 홈화면에 추가하면 앱과 동일한 경험.' },
      { title: 'Cross-Platform',   desc: '단일 코드베이스로 iOS, Android, Desktop 모든 환경에서 동일한 성능을 보장.' },
      { title: 'Discovery Engine', desc: '사용자 데이터 분석 기반의 최적화된 앱 추천 알고리즘으로 원하는 툴을 즉시 발견.' },
      { title: 'Unified Payment',  desc: '글로벌 결제 인프라(Stripe) 통합으로 원클릭 결제 및 라이선스 관리 지원.' },
    ],
    div03: '03 · Technical Moat',
    techEyebrow: '기술적 해자',
    techH3a: '3중 보안으로',
    techH3b: '개발자를 보호합니다',
    layers: [
      { title: 'Secure Proxy',         desc: '소스 코드 노출 방지 및 실시간 트래픽 제어.' },
      { title: 'Advanced Obfuscation', desc: '독자적 난독화 기술로 역공학을 원천 차단.' },
      { title: 'Device Binding',       desc: '하드웨어 기반 인증으로 무단 복제 방지.' },
    ],
    div04: '04 · Roadmap',
    roadEyebrow: '로드맵',
    roadH3a: '2027년까지',
    roadH3b: '시장을 재정의합니다',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: '클로즈 베타 & 핵심 검증', items: ['클로즈 베타 운영', '핵심 보안 기술 안정성 검증', '초기 개발자 파트너 온보딩'] },
      { tag: 'Phase 2 · 2026 Q4', label: '글로벌 오픈 베타',         items: ['글로벌 결제 인프라 통합', '오픈 베타 전환', '멀티 언어 지원'] },
      { tag: 'Phase 3 · 2027',    label: 'AI 고도화 & Enterprise',   items: ['AI 추천 엔진 고도화', '기업용 솔루션 확장', '웹 앱 유통 시장 선두 확보'] },
    ],
    visionLines: ['"설치의 장벽을 허물고,', '웹의 개방성이 앱의 성능이 되는', '유통 생태계를 구축합니다."'],
    ctaDev: '개발자로 시작하기',
    ctaLogin: '로그인',
  },
  en: {
    eyebrow: 'About PLUTOS',
    h2a: 'The New Standard for',
    h2b: 'Web App Distribution',
    div01: '01 · Market Context',
    painEyebrow: 'Market Pain Points',
    painH3a: 'Structural Problems in App Distribution,',
    painH3b: 'Solved.',
    painP: 'The mobile app ecosystem faces persistent challenges: steep user drop-off and a lopsided revenue structure. PLUTOS uses PWA technology to break through these barriers.',
    stats: [
      { label: 'Day-1 Drop-off',      sub: 'Users who never return after day one ①' },
      { label: 'Store Commission',     sub: 'Apple & Google official standard rate' },
      { label: 'PLUTOS Base Fee',      sub: 'Down to 5% with a subscription plan' },
    ],
    painCards: [
      { stat: '77%', title: 'Retention Crisis',     desc: '77% of users never return to an app after day one. PWA removes this barrier with URL-based access. ①' },
      { stat: '30%', title: 'Legacy Commission',    desc: 'Apple & Google\'s official 30% fee eats directly into developer revenue. PLUTOS base rate is 20% — an immediate 10%p saving.' },
      { stat: '5%',  title: 'Subscription Rate',    desc: 'Subscribe to a PLUTOS plan and your fee drops to 5% — up to 25%p less than traditional stores.' },
    ],
    footnote: '① Source: Localytics Mobile Benchmarks Report (2019)  |  PLUTOS base fee 20%, subscription plan 5%',
    div02: '02 · Core Solutions',
    solEyebrow: 'Core Solutions',
    solH3: 'App Experience Without Installation',
    solP: 'Four core capabilities that transform web openness into app-grade performance.',
    solutions: [
      { title: 'Instant Access',   desc: 'Launch immediately from any URL — no install required. Add to home screen for a native-app feel.' },
      { title: 'Cross-Platform',   desc: 'A single codebase delivers identical performance across iOS, Android, and Desktop.' },
      { title: 'Discovery Engine', desc: 'Data-driven recommendation algorithms surface the right tools for every user, instantly.' },
      { title: 'Unified Payment',  desc: 'Global Stripe integration for one-click checkout and automated license management.' },
    ],
    div03: '03 · Technical Moat',
    techEyebrow: 'Technical Moat',
    techH3a: 'Triple-Layer Security',
    techH3b: 'Protecting Every Developer',
    layers: [
      { title: 'Secure Proxy',         desc: 'Prevents source code exposure and enables real-time traffic control.' },
      { title: 'Advanced Obfuscation', desc: 'Proprietary obfuscation blocks reverse engineering at the root.' },
      { title: 'Device Binding',       desc: 'Hardware-level authentication prevents unauthorized duplication.' },
    ],
    div04: '04 · Roadmap',
    roadEyebrow: 'Roadmap',
    roadH3a: 'Redefining the Market',
    roadH3b: 'by 2027',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: 'Closed Beta & Core Validation', items: ['Closed beta operations', 'Security technology stability validation', 'Early developer partner onboarding'] },
      { tag: 'Phase 2 · 2026 Q4', label: 'Global Open Beta',              items: ['Global payment infrastructure integration', 'Transition to open beta', 'Multi-language support'] },
      { tag: 'Phase 3 · 2027',    label: 'AI Enhancement & Enterprise',   items: ['Advanced AI recommendation engine', 'Enterprise solution expansion', 'Market leadership in web app distribution'] },
    ],
    visionLines: ['"Break down the barrier of installation.', 'Build a distribution ecosystem where', 'the openness of the web becomes the power of an app."'],
    ctaDev: 'Start as a Developer',
    ctaLogin: 'Log In',
  },
  ja: {
    eyebrow: 'About PLUTOS',
    h2a: 'ウェブアプリ流通の',
    h2b: '新しいスタンダード',
    div01: '01 · 市場背景',
    painEyebrow: '市場のペインポイント',
    painH3a: 'アプリ流通の構造的問題を、',
    painH3b: '解決します。',
    painP: 'モバイルアプリ市場は高い離脱率と不均衡な収益構造に直面しています。PLUTOSはPWA技術でこの壁を正面突破します。',
    stats: [
      { label: '初日離脱率',        sub: '初日に再訪しないユーザー割合 ①' },
      { label: '既存ストア手数料',   sub: 'Apple・Google公式基本手数料率' },
      { label: 'PLUTOS基本手数料',  sub: '定期プラン加入で最低5%まで低下' },
    ],
    painCards: [
      { stat: '77%', title: '離脱危機',     desc: '初日に77%のユーザーが再訪しません。PWAはURLアクセスでこの壁を除去します。①' },
      { stat: '30%', title: '既存手数料',   desc: 'Apple・Googleの公式30%手数料。PLUTOS基本手数料は20%で即座に10%p節約できます。' },
      { stat: '5%',  title: '定期プラン料', desc: '定期プラン加入で手数料5%。既存ストア比最大25%p削減、収益を最大限開発者へ。' },
    ],
    footnote: '① 出典: Localytics Mobile Benchmarks Report (2019)  |  PLUTOS基本手数料20%、定期プラン時5%',
    div02: '02 · コアソリューション',
    solEyebrow: 'コアソリューション',
    solH3: 'インストール不要のアプリ体験',
    solP: '4つのコア機能でウェブの開放性をアプリ性能に変換します。',
    solutions: [
      { title: 'Instant Access',   desc: 'URLクリックだけで即時起動。ホーム画面追加でアプリと同じ体験。' },
      { title: 'Cross-Platform',   desc: '単一コードベースでiOS・Android・Desktop全環境で同等性能を保証。' },
      { title: 'Discovery Engine', desc: 'ユーザーデータ分析による最適化されたアプリ推薦アルゴリズム。' },
      { title: 'Unified Payment',  desc: 'Stripe統合によるワンクリック決済とライセンス管理。' },
    ],
    div03: '03 · 技術的優位性',
    techEyebrow: '技術的優位性',
    techH3a: '3重セキュリティで',
    techH3b: '開発者を守ります',
    layers: [
      { title: 'Secure Proxy',         desc: 'ソースコード露出防止とリアルタイムトラフィック制御。' },
      { title: 'Advanced Obfuscation', desc: '独自難読化技術でリバースエンジニアリングを根本から防止。' },
      { title: 'Device Binding',       desc: 'ハードウェアベース認証で不正複製を防止。' },
    ],
    div04: '04 · ロードマップ',
    roadEyebrow: 'ロードマップ',
    roadH3a: '2027年までに',
    roadH3b: '市場を再定義します',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: 'クローズドベータ & コア検証', items: ['クローズドベータ運営', 'コアセキュリティ技術の安定性検証', '初期開発者パートナーオンボーディング'] },
      { tag: 'Phase 2 · 2026 Q4', label: 'グローバルオープンベータ',    items: ['グローバル決済インフラ統合', 'オープンベータ移行', 'マルチ言語対応'] },
      { tag: 'Phase 3 · 2027',    label: 'AI高度化 & Enterprise',       items: ['AI推薦エンジン高度化', 'エンタープライズソリューション拡張', 'ウェブアプリ流通市場のリード確保'] },
    ],
    visionLines: ['"インストールの壁を取り払い、', 'ウェブの開放性がアプリの性能になる', '流通エコシステムを構築します。"'],
    ctaDev: '開発者として始める',
    ctaLogin: 'ログイン',
  },
  zh: {
    eyebrow: 'About PLUTOS',
    h2a: 'Web应用分发的',
    h2b: '全新标准',
    div01: '01 · 市场背景',
    painEyebrow: '市场痛点',
    painH3a: '应用分发的结构性问题，',
    painH3b: '现已解决。',
    painP: '移动应用市场面临高流失率和不平衡的收益结构问题。PLUTOS利用PWA技术正面突破这些壁垒。',
    stats: [
      { label: '首日流失率',      sub: '首日未再次访问的用户比例 ①' },
      { label: '现有商店手续费', sub: 'Apple·Google官方基本手续费率' },
      { label: 'PLUTOS基本费率', sub: '订阅计划最低可降至5%' },
    ],
    painCards: [
      { stat: '77%', title: '流失危机',   desc: '77%的用户在首日后不再回访。PWA通过URL访问消除了这一壁垒。①' },
      { stat: '30%', title: '现有手续费', desc: 'Apple·Google官方30%手续费。PLUTOS基本费率为20%，立即节省10%p。' },
      { stat: '5%',  title: '订阅计划费', desc: '订阅计划手续费5%。与现有商店相比最多节省25%p，收益最大化归开发者。' },
    ],
    footnote: '① 来源: Localytics Mobile Benchmarks Report (2019)  |  PLUTOS基本费率20%，订阅计划时5%',
    div02: '02 · 核心解决方案',
    solEyebrow: '核心解决方案',
    solH3: '无需安装的应用体验',
    solP: '四大核心功能将Web的开放性转化为应用级性能。',
    solutions: [
      { title: 'Instant Access',   desc: '只需点击URL即可立即启动。添加到主屏幕获得与原生应用相同的体验。' },
      { title: 'Cross-Platform',   desc: '单一代码库在iOS、Android、Desktop所有环境中保证相同性能。' },
      { title: 'Discovery Engine', desc: '基于用户数据分析的优化应用推荐算法，立即找到所需工具。' },
      { title: 'Unified Payment',  desc: 'Stripe全球支付集成，支持一键支付和许可证管理。' },
    ],
    div03: '03 · 技术护城河',
    techEyebrow: '技术护城河',
    techH3a: '三重安全防护',
    techH3b: '保护每位开发者',
    layers: [
      { title: 'Secure Proxy',         desc: '防止源代码泄露并实现实时流量控制。' },
      { title: 'Advanced Obfuscation', desc: '独特混淆技术从根本上阻止逆向工程。' },
      { title: 'Device Binding',       desc: '基于硬件的身份验证防止未授权复制。' },
    ],
    div04: '04 · 路线图',
    roadEyebrow: '路线图',
    roadH3a: '到2027年',
    roadH3b: '重新定义市场',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: '封闭测试 & 核心验证', items: ['封闭测试运营', '核心安全技术稳定性验证', '初期开发者合作伙伴入驻'] },
      { tag: 'Phase 2 · 2026 Q4', label: '全球公开测试',        items: ['全球支付基础设施集成', '过渡到公开测试', '多语言支持'] },
      { tag: 'Phase 3 · 2027',    label: 'AI深化 & 企业版',     items: ['AI推荐引擎深化', '企业解决方案扩展', 'Web应用分发市场领先地位'] },
    ],
    visionLines: ['"打破安装壁垒，', '构建Web开放性成为应用性能的', '分发生态系统。"'],
    ctaDev: '以开发者身份开始',
    ctaLogin: '登录',
  },
  es: {
    eyebrow: 'About PLUTOS',
    h2a: 'El Nuevo Estándar para',
    h2b: 'la Distribución de Web Apps',
    div01: '01 · Contexto de Mercado',
    painEyebrow: 'Puntos de Dolor del Mercado',
    painH3a: 'Problemas Estructurales en la Distribución de Apps,',
    painH3b: 'Resueltos.',
    painP: 'El ecosistema de apps móviles enfrenta alta deserción y una estructura de ingresos desequilibrada. PLUTOS usa tecnología PWA para romper estas barreras.',
    stats: [
      { label: 'Deserción Día 1',   sub: 'Usuarios que no regresan después del primer día ①' },
      { label: 'Comisión de Tienda', sub: 'Tarifa oficial estándar de Apple y Google' },
      { label: 'Tarifa PLUTOS',     sub: 'Hasta 5% con plan de suscripción' },
    ],
    painCards: [
      { stat: '77%', title: 'Crisis de Retención', desc: '77% de los usuarios no regresan después del primer día. PWA elimina esta barrera con acceso por URL. ①' },
      { stat: '30%', title: 'Comisión Heredada',   desc: 'La tarifa oficial del 30% de Apple y Google recorta directamente los ingresos. PLUTOS cobra 20% base, ahorrando 10%p.' },
      { stat: '5%',  title: 'Plan Suscripción',    desc: 'Suscríbete a PLUTOS y tu comisión baja al 5%, hasta 25%p menos que las tiendas tradicionales.' },
    ],
    footnote: '① Fuente: Localytics Mobile Benchmarks Report (2019)  |  Tarifa base PLUTOS 20%, plan suscripción 5%',
    div02: '02 · Soluciones Clave',
    solEyebrow: 'Soluciones Clave',
    solH3: 'Experiencia de App Sin Instalación',
    solP: 'Cuatro capacidades principales que transforman la apertura web en rendimiento de nivel app.',
    solutions: [
      { title: 'Instant Access',   desc: 'Lanza al instante desde cualquier URL, sin instalación. Añade a la pantalla de inicio para una experiencia nativa.' },
      { title: 'Cross-Platform',   desc: 'Un único código base ofrece rendimiento idéntico en iOS, Android y Desktop.' },
      { title: 'Discovery Engine', desc: 'Algoritmos de recomendación basados en datos para encontrar las herramientas correctas al instante.' },
      { title: 'Unified Payment',  desc: 'Integración global con Stripe para pago con un clic y gestión de licencias.' },
    ],
    div03: '03 · Ventaja Técnica',
    techEyebrow: 'Ventaja Técnica',
    techH3a: 'Seguridad Triple Capa',
    techH3b: 'Protegiendo a Cada Desarrollador',
    layers: [
      { title: 'Secure Proxy',         desc: 'Previene la exposición del código fuente y permite control de tráfico en tiempo real.' },
      { title: 'Advanced Obfuscation', desc: 'Ofuscación propietaria que bloquea la ingeniería inversa desde la raíz.' },
      { title: 'Device Binding',       desc: 'Autenticación a nivel de hardware que previene la duplicación no autorizada.' },
    ],
    div04: '04 · Hoja de Ruta',
    roadEyebrow: 'Hoja de Ruta',
    roadH3a: 'Redefiniendo el Mercado',
    roadH3b: 'para 2027',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: 'Beta Cerrada & Validación Core', items: ['Operaciones beta cerrada', 'Validación de estabilidad de seguridad', 'Incorporación de socios desarrolladores iniciales'] },
      { tag: 'Phase 2 · 2026 Q4', label: 'Beta Abierta Global',            items: ['Integración de infraestructura de pago global', 'Transición a beta abierta', 'Soporte multilingüe'] },
      { tag: 'Phase 3 · 2027',    label: 'IA Avanzada & Enterprise',       items: ['Motor de recomendación IA avanzado', 'Expansión de soluciones empresariales', 'Liderazgo en distribución de web apps'] },
    ],
    visionLines: ['"Romper la barrera de la instalación.', 'Construir un ecosistema de distribución donde', 'la apertura de la web se convierte en el poder de una app."'],
    ctaDev: 'Comenzar como Desarrollador',
    ctaLogin: 'Iniciar Sesión',
  },
  fr: {
    eyebrow: 'About PLUTOS',
    h2a: 'Le Nouveau Standard pour',
    h2b: 'la Distribution d\'Apps Web',
    div01: '01 · Contexte du Marché',
    painEyebrow: 'Points de Douleur du Marché',
    painH3a: 'Problèmes Structurels dans la Distribution d\'Apps,',
    painH3b: 'Résolus.',
    painP: 'L\'écosystème des apps mobiles souffre d\'un taux d\'abandon élevé et d\'une structure de revenus déséquilibrée. PLUTOS utilise la technologie PWA pour briser ces barrières.',
    stats: [
      { label: 'Abandon Jour 1',      sub: 'Utilisateurs ne revenant pas après le premier jour ①' },
      { label: 'Commission de Store', sub: 'Taux standard officiel Apple et Google' },
      { label: 'Frais PLUTOS',        sub: 'Jusqu\'à 5% avec un plan d\'abonnement' },
    ],
    painCards: [
      { stat: '77%', title: 'Crise de Rétention',  desc: '77% des utilisateurs ne reviennent pas après le premier jour. Le PWA élimine cette barrière via l\'accès URL. ①' },
      { stat: '30%', title: 'Commission Héritée',   desc: 'La commission officielle de 30% d\'Apple et Google réduit directement les revenus. PLUTOS facture 20% de base, économisant 10%p.' },
      { stat: '5%',  title: 'Plan Abonnement',      desc: 'Abonnez-vous à PLUTOS et votre commission tombe à 5%, jusqu\'à 25%p de moins que les stores traditionnels.' },
    ],
    footnote: '① Source: Localytics Mobile Benchmarks Report (2019)  |  Frais de base PLUTOS 20%, plan abonnement 5%',
    div02: '02 · Solutions Principales',
    solEyebrow: 'Solutions Principales',
    solH3: 'Expérience App Sans Installation',
    solP: 'Quatre capacités clés qui transforment l\'ouverture web en performances de niveau app.',
    solutions: [
      { title: 'Instant Access',   desc: 'Lancement immédiat depuis n\'importe quelle URL. Ajoutez à l\'écran d\'accueil pour une expérience native.' },
      { title: 'Cross-Platform',   desc: 'Un seul code base offre des performances identiques sur iOS, Android et Desktop.' },
      { title: 'Discovery Engine', desc: 'Algorithmes de recommandation basés sur les données pour trouver les bons outils instantanément.' },
      { title: 'Unified Payment',  desc: 'Intégration Stripe mondiale pour paiement en un clic et gestion des licences.' },
    ],
    div03: '03 · Avantage Technique',
    techEyebrow: 'Avantage Technique',
    techH3a: 'Sécurité Triple Couche',
    techH3b: 'Protégeant Chaque Développeur',
    layers: [
      { title: 'Secure Proxy',         desc: 'Prévient l\'exposition du code source et permet le contrôle du trafic en temps réel.' },
      { title: 'Advanced Obfuscation', desc: 'Obfuscation propriétaire bloquant l\'ingénierie inverse à la racine.' },
      { title: 'Device Binding',       desc: 'Authentification au niveau matériel empêchant la duplication non autorisée.' },
    ],
    div04: '04 · Feuille de Route',
    roadEyebrow: 'Feuille de Route',
    roadH3a: 'Redéfinir le Marché',
    roadH3b: 'd\'ici 2027',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: 'Bêta Fermée & Validation Core', items: ['Opérations bêta fermée', 'Validation de la stabilité de sécurité', 'Intégration des partenaires développeurs initiaux'] },
      { tag: 'Phase 2 · 2026 Q4', label: 'Bêta Ouverte Mondiale',         items: ['Intégration de l\'infrastructure de paiement mondiale', 'Transition vers bêta ouverte', 'Support multilingue'] },
      { tag: 'Phase 3 · 2027',    label: 'IA Avancée & Enterprise',        items: ['Moteur de recommandation IA avancé', 'Expansion des solutions entreprise', 'Leadership dans la distribution d\'apps web'] },
    ],
    visionLines: ['"Briser la barrière de l\'installation.', 'Construire un écosystème de distribution où', 'l\'ouverture du web devient la puissance d\'une app."'],
    ctaDev: 'Commencer en tant que Développeur',
    ctaLogin: 'Se Connecter',
  },
  de: {
    eyebrow: 'About PLUTOS',
    h2a: 'Der neue Standard für',
    h2b: 'Web-App-Distribution',
    div01: '01 · Marktkontext',
    painEyebrow: 'Marktprobleme',
    painH3a: 'Strukturelle Probleme in der App-Distribution,',
    painH3b: 'gelöst.',
    painP: 'Das mobile App-Ökosystem kämpft mit hoher Abwanderung und unausgewogener Erlösstruktur. PLUTOS nutzt PWA-Technologie, um diese Barrieren zu durchbrechen.',
    stats: [
      { label: 'Tag-1-Abwanderung', sub: 'Nutzer, die nach dem ersten Tag nicht zurückkehren ①' },
      { label: 'Store-Provision',   sub: 'Offizieller Standardsatz von Apple und Google' },
      { label: 'PLUTOS-Grundgebühr', sub: 'Bis zu 5% mit einem Abonnementplan' },
    ],
    painCards: [
      { stat: '77%', title: 'Retentionskrise',   desc: '77% der Nutzer kehren nach dem ersten Tag nicht zurück. PWA beseitigt diese Barriere durch URL-Zugang. ①' },
      { stat: '30%', title: 'Legacy-Provision',  desc: 'Apples und Googles offizielle 30% kürzen direkt die Entwicklereinnahmen. PLUTOS berechnet 20% Basis — 10%p Einsparung.' },
      { stat: '5%',  title: 'Abonnement-Tarif', desc: 'Mit PLUTOS-Abonnement sinkt die Provision auf 5% — bis zu 25%p weniger als traditionelle Stores.' },
    ],
    footnote: '① Quelle: Localytics Mobile Benchmarks Report (2019)  |  PLUTOS-Grundgebühr 20%, Abonnementplan 5%',
    div02: '02 · Kernlösungen',
    solEyebrow: 'Kernlösungen',
    solH3: 'App-Erlebnis ohne Installation',
    solP: 'Vier Kernfähigkeiten, die Web-Offenheit in App-Performance verwandeln.',
    solutions: [
      { title: 'Instant Access',   desc: 'Sofortiger Start von jeder URL — keine Installation erforderlich. Zum Startbildschirm hinzufügen für natives App-Gefühl.' },
      { title: 'Cross-Platform',   desc: 'Eine einzige Codebasis liefert identische Performance auf iOS, Android und Desktop.' },
      { title: 'Discovery Engine', desc: 'Datengetriebene Empfehlungsalgorithmen zeigen die richtigen Tools sofort.' },
      { title: 'Unified Payment',  desc: 'Globale Stripe-Integration für Ein-Klick-Checkout und automatisierte Lizenzverwaltung.' },
    ],
    div03: '03 · Technischer Vorteil',
    techEyebrow: 'Technischer Vorteil',
    techH3a: 'Dreifach-Sicherheit',
    techH3b: 'Schützt jeden Entwickler',
    layers: [
      { title: 'Secure Proxy',         desc: 'Verhindert Quellcode-Exposition und ermöglicht Echtzeit-Traffic-Kontrolle.' },
      { title: 'Advanced Obfuscation', desc: 'Proprietäre Verschleierung blockiert Reverse Engineering an der Wurzel.' },
      { title: 'Device Binding',       desc: 'Hardware-basierte Authentifizierung verhindert unbefugte Vervielfältigung.' },
    ],
    div04: '04 · Roadmap',
    roadEyebrow: 'Roadmap',
    roadH3a: 'Den Markt neu definieren',
    roadH3b: 'bis 2027',
    phases: [
      { tag: 'Phase 1 · 2026 Q2', label: 'Geschlossene Beta & Kernvalidierung', items: ['Geschlossener Beta-Betrieb', 'Sicherheitstechnologie-Stabilitätsvalidierung', 'Onboarding früher Entwicklerpartner'] },
      { tag: 'Phase 2 · 2026 Q4', label: 'Globale Open Beta',                  items: ['Integration globaler Zahlungsinfrastruktur', 'Übergang zu Open Beta', 'Mehrsprachige Unterstützung'] },
      { tag: 'Phase 3 · 2027',    label: 'KI-Verbesserung & Enterprise',        items: ['Erweiterter KI-Empfehlungsmotor', 'Enterprise-Lösungserweiterung', 'Marktführerschaft in Web-App-Distribution'] },
    ],
    visionLines: ['"Die Installationsbarriere abbauen.', 'Ein Distributions-Ökosystem aufbauen, in dem', 'die Offenheit des Webs zur Stärke einer App wird."'],
    ctaDev: 'Als Entwickler beginnen',
    ctaLogin: 'Anmelden',
  },
};

/* ══ 메인 내보내기 ══════════════════════════ */
export function AboutSection() {
  const { lang } = useLang();
  const t = T[lang as keyof typeof T] ?? T.en;

  return (
    <section id="about" className="mt-24">
      <div className="max-w-3xl mx-auto">

        {/* ── 섹션 헤더 ── */}
        <Reveal from="up">
          <div className="text-center mb-4">
            <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>
              {t.eyebrow}
            </div>
            <AnimatePresence mode="wait">
              <motion.h2 key={lang}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-black leading-tight" style={{ fontFamily: C.cinzel, color: C.text }}>
                {t.h2a}<br /><span style={{ color: C.red }}>{t.h2b}</span>
              </motion.h2>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* ── 01 Market Context ── */}
        <Divider label={t.div01} />

        <Reveal from="left" className="mb-3">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>{t.painEyebrow}</div>
          <AnimatePresence mode="wait">
            <motion.h3 key={lang}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold leading-snug mb-5" style={{ fontFamily: C.cinzel, color: C.text }}>
              {t.painH3a}<br /><span style={{ color: C.red }}>{t.painH3b}</span>
            </motion.h3>
          </AnimatePresence>
          <p className="text-sm leading-8 mb-8" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{t.painP}</p>
        </Reveal>

        {/* 통계 카운트업 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { to: 77, suffix: '%' },
            { to: 30, suffix: '%' },
            { to: 20, suffix: '%' },
          ].map((item, i) => (
            <Reveal key={i} from="scale" delay={i * 0.08}>
              <div className="rounded-xl p-5 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                <div className="text-3xl font-black mb-1" style={{ color: C.red, fontFamily: C.cinzel }}>
                  <CountUp to={item.to} suffix={item.suffix} />
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: C.text, fontFamily: C.cinzel }}>{t.stats[i].label}</div>
                <div className="text-[10px]" style={{ color: C.sub, fontFamily: C.ibm }}>{t.stats[i].sub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-2">
          {t.painCards.map((card, i) => (
            <PainCard key={i} delay={i * 0.08}
              stat={card.stat} title={card.title} desc={card.desc}
              icon={i === 0 ? <IconUser /> : i === 1 ? <IconStore /> : <IconDevice />} />
          ))}
        </div>

        <div className="mb-8 px-1">
          <p className="text-[10px]" style={{ color: C.muted, fontFamily: C.ibm }}>{t.footnote}</p>
        </div>

        {/* ── 02 Core Solutions ── */}
        <Divider label={t.div02} />

        <Reveal from="right">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>{t.solEyebrow}</div>
          <AnimatePresence mode="wait">
            <motion.h3 key={lang}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold mb-2" style={{ fontFamily: C.cinzel, color: C.text }}>
              {t.solH3}
            </motion.h3>
          </AnimatePresence>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm, fontWeight: 300 }}>{t.solP}</p>
        </Reveal>

        <div>
          {t.solutions.map((s, i) => (
            <SolutionRow key={s.title} num={`0${i + 1}`} title={s.title} desc={s.desc} delay={i * 0.07} />
          ))}
        </div>

        {/* ── 03 Technical Moat ── */}
        <Divider label={t.div03} />

        <Reveal from="left">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>{t.techEyebrow}</div>
          <AnimatePresence mode="wait">
            <motion.h3 key={lang}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold mb-6" style={{ fontFamily: C.cinzel, color: C.text }}>
              {t.techH3a}<br /><span style={{ color: C.red }}>{t.techH3b}</span>
            </motion.h3>
          </AnimatePresence>
        </Reveal>

        <div className="text-[10px] uppercase tracking-[0.28em] mb-4" style={{ color: C.muted, fontFamily: C.cinzel }}>Triple Layer Security</div>
        <div className="grid grid-cols-3 gap-3">
          {t.layers.map((l, i) => (
            <LayerCard key={l.title} n={i + 1} delay={i * 0.09} title={l.title} desc={l.desc} />
          ))}
        </div>

        {/* ── 04 Roadmap ── */}
        <Divider label={t.div04} />

        <Reveal from="up">
          <div className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>{t.roadEyebrow}</div>
          <AnimatePresence mode="wait">
            <motion.h3 key={lang}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold mb-10" style={{ fontFamily: C.cinzel, color: C.text }}>
              {t.roadH3a}<br /><span style={{ color: C.red }}>{t.roadH3b}</span>
            </motion.h3>
          </AnimatePresence>
        </Reveal>

        <div className="space-y-10">
          {t.phases.map((p, i) => (
            <Phase key={p.tag} active={i === 0} tag={p.tag} label={p.label} items={p.items} delay={i * 0.08} />
          ))}
        </div>

        {/* ── Vision ── */}
        <Divider />

        <Reveal from="scale">
          <div className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, #1a0404 0%, ${C.bg} 70%)`, border: '1px solid #3a1515' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(100,0,0,0.2), transparent)' }} />
            <Geo className="absolute top-0 right-0 w-32 h-32 opacity-[0.12]" />
            <div className="relative z-10">
              <div className="text-[9px] uppercase tracking-[0.35em] mb-6" style={{ color: C.redDim, fontFamily: C.cinzel }}>Vision</div>
              <AnimatePresence mode="wait">
                <motion.blockquote key={lang}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-xl font-semibold leading-relaxed mb-10" style={{ color: C.text, fontFamily: C.cinzel }}>
                  {t.visionLines.map((line, i) => (
                    <span key={i}>{line}{i < t.visionLines.length - 1 && <br />}</span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
              <div className="flex items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                  <Link href="/developer/survey" className="btn-primary px-7 py-3 text-sm">{t.ctaDev}</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                  <Link href="/login" className="btn-secondary px-7 py-3 text-sm">{t.ctaLogin}</Link>
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="pb-20" />
      </div>
    </section>
  );
}

/* ── 아이콘 ── */
function IconUser() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}
function IconDevice() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2.5} />
    </svg>
  );
}
