'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLang } from '@/components/LanguageProvider';
import type { Lang } from '@/components/LanguageProvider';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  input:  '#0d0a10',
  iborder:'#3a1515',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

const T: Record<Lang, {
  title: string; sub: string; aiLabel: string;
  steps: string[];
  cats: string[];
  prices: string[];
  users: string[];
  next: string; prev: string; submit: string; analyzing: string; retry: string; continueReg: string; goHome: string;
  approved: string; conditional: string; rejected: string;
  score: string; strengths: string; concerns: string; aiRec: string;
  fields: Record<string, string>; hints: Record<string, string>;
}> = {
  ko: {
    title: '앱 출시 가능성 진단', sub: 'AI가 귀하의 앱을 분석하여 PLUTOS 마켓 출시 가능성을 판단합니다.',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['기본 정보', '앱 설명', '대상 & 가격', '목표 & 제출'],
    cats: ['글쓰기', '데이터 분석', '자동화', '디자인', '학습/교육', '비즈니스', '마케팅', '개발 도구', '기타'],
    prices: ['₩4,900~₩14,900 (Basic)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', '무료 or 미정'],
    users: ['선택', '100명 미만', '100~500명', '500~2,000명', '2,000명 이상'],
    next: '다음 →', prev: '← 이전', submit: 'AI 분석 시작 →', analyzing: 'AI 분석 중...', retry: '다시 작성하기', continueReg: '개발자 등록 계속하기 →', goHome: '메인으로 돌아가기',
    approved: '출시 적합', conditional: '조건부 승인', rejected: '보완 필요',
    score: '적합도 점수', strengths: '강점', concerns: '보완 사항', aiRec: 'AI 권고',
    fields: { name: '앱 이름 *', url: '앱 URL', cat: '카테고리 *', desc: '앱 소개 * (30자 이상)', feat: '핵심 기능 *', tech: '기술 스택', target: '타깃 사용자 *', price: '예상 가격대 *', mau: '월 사용자 예상', goal: '출시 목표 *', summary: '제출 요약', appName: '앱명', category: '카테고리', pricing: '가격대' },
    hints: { name: '마켓에 표시될 앱 이름', url: '현재 운영 중인 URL (없으면 공란)', desc: '무엇을 하는 앱인지 자세히 설명해 주세요', feat: '가장 중요한 기능 하나', tech: '사용한 주요 기술 (선택)', target: '누가 사용하는 앱인가요?', mau: '현재 또는 목표 사용자 수 (선택)', goal: '왜 이 앱을 마켓에 등록하려 하나요? (10자 이상)', note: 'AI가 입력 내용을 분석하여 출시 가능성을 판단합니다. 결과에 따라 즉시 개발자 등록으로 연결됩니다.' },
  },
  en: {
    title: 'App Launch Readiness Diagnosis', sub: 'AI will analyze your app and assess its suitability for the PLUTOS market.',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['Basics', 'App Info', 'Target & Price', 'Goal & Submit'],
    cats: ['Writing', 'Data Analysis', 'Automation', 'Design', 'Learning', 'Business', 'Marketing', 'Dev Tools', 'Other'],
    prices: ['₩4,900~₩14,900 (Basic)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', 'Free / TBD'],
    users: ['Select', 'Under 100', '100~500', '500~2,000', '2,000+'],
    next: 'Next →', prev: '← Back', submit: 'Start AI Analysis →', analyzing: 'Analyzing...', retry: 'Try Again', continueReg: 'Continue Registration →', goHome: 'Back to Home',
    approved: 'Ready to Launch', conditional: 'Conditional', rejected: 'Needs Work',
    score: 'Readiness Score', strengths: 'Strengths', concerns: 'Concerns', aiRec: 'AI Recommendation',
    fields: { name: 'App Name *', url: 'App URL', cat: 'Category *', desc: 'Description * (30+ chars)', feat: 'Key Feature *', tech: 'Tech Stack', target: 'Target User *', price: 'Price Range *', mau: 'Monthly Users (est.)', goal: 'Launch Goal *', summary: 'Summary', appName: 'App', category: 'Category', pricing: 'Pricing' },
    hints: { name: 'Name displayed in the market', url: 'Current live URL (optional)', desc: 'What does your app do?', feat: 'The single most important feature', tech: 'Main technologies used (optional)', target: 'Who uses this app?', mau: 'Current or target users (optional)', goal: 'Why submit to PLUTOS? (10+ chars)', note: 'AI will analyze your submission and determine launch readiness.' },
  },
  ja: {
    title: 'アプリ出品可能性診断', sub: 'AIがあなたのアプリを分析し、PLUTOSマーケットへの適合性を判断します。',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['基本情報', 'アプリ説明', '対象と価格', '目標と提出'],
    cats: ['ライティング', 'データ分析', '自動化', 'デザイン', '学習', 'ビジネス', 'マーケティング', '開発ツール', 'その他'],
    prices: ['₩4,900~₩14,900 (Basic)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', '無料 / 未定'],
    users: ['選択', '100人未満', '100~500人', '500~2,000人', '2,000人以上'],
    next: '次へ →', prev: '← 戻る', submit: 'AI分析開始 →', analyzing: '分析中...', retry: '再入力', continueReg: '開発者登録を続ける →', goHome: 'ホームへ戻る',
    approved: '出品適合', conditional: '条件付き承認', rejected: '改善が必要',
    score: '適合スコア', strengths: '強み', concerns: '改善点', aiRec: 'AIアドバイス',
    fields: { name: 'アプリ名 *', url: 'アプリURL', cat: 'カテゴリ *', desc: '説明 * (30文字以上)', feat: 'キー機能 *', tech: '技術スタック', target: 'ターゲットユーザー *', price: '価格帯 *', mau: '月間ユーザー数(予想)', goal: '出品目標 *', summary: '提出サマリー', appName: 'アプリ名', category: 'カテゴリ', pricing: '価格' },
    hints: { name: 'マーケットに表示されるアプリ名', url: '現在のURL（任意）', desc: 'どんなアプリか詳しく教えてください', feat: '最も重要な機能一つ', tech: '主要技術（任意）', target: '誰が使うアプリですか？', mau: '現在または目標のユーザー数（任意）', goal: 'なぜPLUTOSに出品したいですか？（10文字以上）', note: 'AIが入力内容を分析し、出品適合性を判断します。' },
  },
  zh: {
    title: '应用上架可行性诊断', sub: 'AI将分析您的应用，判断其在PLUTOS市场的适合度。',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['基本信息', '应用说明', '目标与定价', '目标与提交'],
    cats: ['写作', '数据分析', '自动化', '设计', '学习教育', '商业', '营销', '开发工具', '其他'],
    prices: ['₩4,900~₩14,900 (基础版)', '₩19,900~₩79,900 (Plus版)', '₩79,000~₩499,000 (商业版)', '免费/待定'],
    users: ['请选择', '100人以下', '100~500人', '500~2,000人', '2,000人以上'],
    next: '下一步 →', prev: '← 上一步', submit: '开始AI分析 →', analyzing: '分析中...', retry: '重新填写', continueReg: '继续开发者注册 →', goHome: '返回首页',
    approved: '适合上架', conditional: '有条件批准', rejected: '需要改进',
    score: '适合分数', strengths: '优势', concerns: '待改进', aiRec: 'AI建议',
    fields: { name: '应用名称 *', url: '应用URL', cat: '分类 *', desc: '应用介绍 * (30字以上)', feat: '核心功能 *', tech: '技术栈', target: '目标用户 *', price: '预期价格范围 *', mau: '月用户数(预估)', goal: '上架目标 *', summary: '提交摘要', appName: '应用名', category: '分类', pricing: '价格' },
    hints: { name: '在市场上显示的应用名称', url: '当前上线URL（选填）', desc: '请详细描述您的应用', feat: '最重要的一个功能', tech: '使用的主要技术（选填）', target: '谁会使用这个应用？', mau: '当前或目标用户数（选填）', goal: '为什么要在PLUTOS上架？（10字以上）', note: 'AI将分析您的提交并判断上架适合性。' },
  },
  es: {
    title: 'Diagnóstico de viabilidad de lanzamiento', sub: 'La IA analizará tu app y evaluará su idoneidad para el mercado PLUTOS.',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['Lo básico', 'Info de app', 'Público y precio', 'Objetivo y envío'],
    cats: ['Escritura', 'Análisis de datos', 'Automatización', 'Diseño', 'Aprendizaje', 'Negocios', 'Marketing', 'Herramientas dev', 'Otro'],
    prices: ['₩4,900~₩14,900 (Básico)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', 'Gratis / Por definir'],
    users: ['Seleccionar', 'Menos de 100', '100~500', '500~2,000', 'Más de 2,000'],
    next: 'Siguiente →', prev: '← Atrás', submit: 'Iniciar análisis IA →', analyzing: 'Analizando...', retry: 'Volver a escribir', continueReg: 'Continuar registro →', goHome: 'Volver al inicio',
    approved: 'Listo para lanzar', conditional: 'Condicional', rejected: 'Necesita mejoras',
    score: 'Puntuación', strengths: 'Fortalezas', concerns: 'Preocupaciones', aiRec: 'Recomendación IA',
    fields: { name: 'Nombre de la app *', url: 'URL de la app', cat: 'Categoría *', desc: 'Descripción * (30+ chars)', feat: 'Función clave *', tech: 'Stack técnico', target: 'Usuario objetivo *', price: 'Rango de precio *', mau: 'Usuarios mensuales (est.)', goal: 'Objetivo de lanzamiento *', summary: 'Resumen', appName: 'App', category: 'Categoría', pricing: 'Precio' },
    hints: { name: 'Nombre que aparecerá en el mercado', url: 'URL actual (opcional)', desc: '¿Qué hace tu app?', feat: 'La función más importante', tech: 'Tecnologías principales (opcional)', target: '¿Quién usa esta app?', mau: 'Usuarios actuales o meta (opcional)', goal: '¿Por qué enviar a PLUTOS? (10+ chars)', note: 'La IA analizará tu envío y determinará la idoneidad.' },
  },
  fr: {
    title: 'Diagnostic de lancement', sub: "L'IA analysera votre app et évaluera son adéquation pour le marché PLUTOS.",
    aiLabel: 'PLUTOS Developer Program',
    steps: ['Informations de base', "Info de l'app", 'Cible et prix', 'Objectif et soumission'],
    cats: ['Écriture', 'Analyse de données', 'Automatisation', 'Design', 'Apprentissage', 'Business', 'Marketing', 'Outils dev', 'Autre'],
    prices: ['₩4,900~₩14,900 (Basique)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', 'Gratuit / À définir'],
    users: ['Sélectionner', 'Moins de 100', '100~500', '500~2,000', 'Plus de 2,000'],
    next: 'Suivant →', prev: '← Précédent', submit: "Lancer l'analyse IA →", analyzing: 'Analyse en cours...', retry: 'Réécrire', continueReg: "Continuer l'inscription →", goHome: "Retour à l'accueil",
    approved: 'Prêt au lancement', conditional: 'Conditionnel', rejected: 'À améliorer',
    score: 'Score', strengths: 'Points forts', concerns: 'Points faibles', aiRec: 'Recommandation IA',
    fields: { name: "Nom de l'app *", url: "URL de l'app", cat: 'Catégorie *', desc: 'Description * (30+ chars)', feat: 'Fonctionnalité clé *', tech: 'Stack technique', target: 'Utilisateur cible *', price: 'Gamme de prix *', mau: 'Utilisateurs mensuels (est.)', goal: 'Objectif de lancement *', summary: 'Résumé', appName: 'App', category: 'Catégorie', pricing: 'Prix' },
    hints: { name: 'Nom affiché sur le marché', url: 'URL actuelle (optionnel)', desc: 'Que fait votre app ?', feat: 'La fonctionnalité la plus importante', tech: 'Technologies principales (optionnel)', target: 'Qui utilise cette app ?', mau: 'Utilisateurs actuels ou cibles (optionnel)', goal: 'Pourquoi soumettre à PLUTOS ? (10+ chars)', note: "L'IA analysera votre soumission et déterminera l'adéquation." },
  },
  de: {
    title: 'App-Marktreife-Diagnose', sub: 'KI analysiert Ihre App und bewertet die Eignung für den PLUTOS-Markt.',
    aiLabel: 'PLUTOS Developer Program',
    steps: ['Grundinfos', 'App-Info', 'Zielgruppe & Preis', 'Ziel & Einreichen'],
    cats: ['Schreiben', 'Datenanalyse', 'Automatisierung', 'Design', 'Lernen', 'Business', 'Marketing', 'Dev-Tools', 'Sonstiges'],
    prices: ['₩4,900~₩14,900 (Basis)', '₩19,900~₩79,900 (Plus)', '₩79,000~₩499,000 (Business)', 'Kostenlos / Offen'],
    users: ['Auswählen', 'Unter 100', '100~500', '500~2.000', 'Über 2.000'],
    next: 'Weiter →', prev: '← Zurück', submit: 'KI-Analyse starten →', analyzing: 'Analyse läuft...', retry: 'Neu eingeben', continueReg: 'Registrierung fortsetzen →', goHome: 'Zurück zur Startseite',
    approved: 'Marktreif', conditional: 'Bedingt geeignet', rejected: 'Verbesserungsbedarf',
    score: 'Eignungspunktzahl', strengths: 'Stärken', concerns: 'Verbesserungsbedarf', aiRec: 'KI-Empfehlung',
    fields: { name: 'App-Name *', url: 'App-URL', cat: 'Kategorie *', desc: 'Beschreibung * (30+ Zeichen)', feat: 'Hauptfunktion *', tech: 'Technologien', target: 'Zielgruppe *', price: 'Preisrange *', mau: 'Monatliche Nutzer (geschätzt)', goal: 'Einreichungsziel *', summary: 'Zusammenfassung', appName: 'App', category: 'Kategorie', pricing: 'Preis' },
    hints: { name: 'Im Markt angezeigter App-Name', url: 'Aktuelle URL (optional)', desc: 'Was tut Ihre App?', feat: 'Die wichtigste Funktion', tech: 'Haupttechnologien (optional)', target: 'Wer nutzt diese App?', mau: 'Aktuelle oder Zielnútzerzahl (optional)', goal: 'Warum bei PLUTOS einreichen? (10+ Zeichen)', note: 'KI analysiert Ihre Eingaben und beurteilt die Marktreife.' },
  },
};

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };

interface SurveyData {
  appName: string; appUrl: string; category: string; description: string;
  targetUser: string; techStack: string; pricingIdea: string;
  monthlyUsers: string; mainFeature: string; devGoal: string;
}
interface AIResult {
  verdict: 'approved' | 'conditional' | 'rejected';
  score: number; summary: string;
  strengths: string[]; concerns: string[]; recommendation: string;
}

function CheckSVG({ size = 14, color = '#4ade80' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}
function WarnSVG({ size = 14, color = '#ccaa00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  );
}
function CrossSVG({ size = 14, color = '#cc1a1a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export default function DeveloperSurveyPage() {
  const { lang } = useLang();
  const t = T[lang as Lang] ?? T.ko;

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
      setResult(await res.json());
    } catch {
      setError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  if (result) return <ResultView result={result} appName={data.appName} t={t} />;

  return (
    <div className="max-w-lg mx-auto py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          {t.aiLabel}
        </div>
        <h1 className="text-3xl font-black leading-tight" style={{ color: C.text, fontFamily: C.cinzel }}>
          {t.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm }}>{t.sub}</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-0 mb-8">
        {t.steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: i < step ? '#330000' : i === step ? '#1a0808' : '#0d0a10',
                  borderColor: i <= step ? C.red : '#2a1515',
                  scale: i === step ? 1.15 : 1,
                }}
                transition={spring}
                className="w-7 h-7 rounded-full border flex items-center justify-center"
                style={{ color: i <= step ? C.text : C.muted }}
              >
                {i < step
                  ? <CheckSVG size={12} color={C.red} />
                  : <span className="text-[10px] font-black">{i + 1}</span>
                }
              </motion.div>
              <span className="text-[9px] mt-1 text-center whitespace-nowrap"
                style={{ color: i === step ? C.red : C.muted, fontFamily: C.cinzel }}>
                {label}
              </span>
            </div>
            {i < t.steps.length - 1 && (
              <motion.div
                animate={{ backgroundColor: i < step ? C.red : '#2a1515' }}
                transition={{ duration: 0.4 }}
                className="flex-1 h-px mx-1 mb-4"
              />
            )}
          </div>
        ))}
      </div>

      {/* 폼 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={spring}
          className="rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          {step === 0 && (
            <>
              <h2 className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{t.steps[0]}</h2>
              <Field label={t.fields.name} hint={t.hints.name}>
                <DInput value={data.appName} onChange={(v) => update('appName', v)} placeholder="예: AI 문서 요약기" />
              </Field>
              <Field label={t.fields.url} hint={t.hints.url}>
                <DInput value={data.appUrl} onChange={(v) => update('appUrl', v)} placeholder="https://..." />
              </Field>
              <Field label={t.fields.cat}>
                <div className="grid grid-cols-3 gap-1.5">
                  {t.cats.map((cat) => (
                    <motion.button key={cat} type="button" onClick={() => update('category', cat)} whileTap={{ scale: 0.94 }}
                      className="py-1.5 px-2 rounded text-xs border transition-colors"
                      style={{ backgroundColor: data.category === cat ? '#2a0808' : C.input, borderColor: data.category === cat ? C.red : C.iborder, color: data.category === cat ? C.text : C.sub, fontFamily: C.ibm }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{t.steps[1]}</h2>
              <Field label={t.fields.desc} hint={t.hints.desc}>
                <DTextarea value={data.description} onChange={(v) => update('description', v)}
                  placeholder="예: PDF, 이미지, 텍스트를 붙여넣으면 AI가 핵심만 요약해주는 웹 앱입니다..." rows={4} />
                <div className="text-[10px] text-right mt-1" style={{ color: data.description.length >= 30 ? C.muted : C.red }}>
                  {data.description.length}자
                </div>
              </Field>
              <Field label={t.fields.feat} hint={t.hints.feat}>
                <DInput value={data.mainFeature} onChange={(v) => update('mainFeature', v)} placeholder="예: GPT-4 기반 실시간 문서 요약" />
              </Field>
              <Field label={t.fields.tech} hint={t.hints.tech}>
                <DInput value={data.techStack} onChange={(v) => update('techStack', v)} placeholder="예: Next.js, OpenAI API, Supabase" />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{t.steps[2]}</h2>
              <Field label={t.fields.target} hint={t.hints.target}>
                <DInput value={data.targetUser} onChange={(v) => update('targetUser', v)} placeholder="예: 논문 작성하는 대학원생, 콘텐츠 마케터" />
              </Field>
              <Field label={t.fields.price}>
                <div className="grid grid-cols-2 gap-1.5">
                  {t.prices.map((p) => (
                    <motion.button key={p} type="button" onClick={() => update('pricingIdea', p)} whileTap={{ scale: 0.94 }}
                      className="py-2 px-2 rounded text-[11px] border transition-colors text-left"
                      style={{ backgroundColor: data.pricingIdea === p ? '#2a0808' : C.input, borderColor: data.pricingIdea === p ? C.red : C.iborder, color: data.pricingIdea === p ? C.text : C.sub, fontFamily: C.ibm }}>
                      {p}
                    </motion.button>
                  ))}
                </div>
              </Field>
              <Field label={t.fields.mau} hint={t.hints.mau}>
                <select value={data.monthlyUsers} onChange={(e) => update('monthlyUsers', e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: C.input, border: `1px solid ${C.iborder}`, color: C.text, fontFamily: C.ibm }}>
                  {t.users.map((u) => <option key={u} value={u === t.users[0] ? '' : u}>{u}</option>)}
                </select>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{t.steps[3]}</h2>
              <Field label={t.fields.goal} hint={t.hints.goal}>
                <DTextarea value={data.devGoal} onChange={(v) => update('devGoal', v)}
                  placeholder="예: 직접 만든 요약 툴을 수익화하고 싶습니다..." rows={3} />
              </Field>
              <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: C.input, border: `1px solid ${C.iborder}` }}>
                <div className="font-bold text-xs mb-2" style={{ color: C.text, fontFamily: C.cinzel }}>{t.fields.summary}</div>
                {[
                  [t.fields.appName, data.appName],
                  [t.fields.category, data.category],
                  [t.fields.pricing, data.pricingIdea],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs" style={{ fontFamily: C.ibm }}>
                    <span style={{ color: C.muted }}>{k}:</span>
                    <span style={{ color: C.sub }}>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: C.muted, fontFamily: C.ibm }}>{t.hints.note}</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="mt-4 text-xs p-3 rounded-lg" style={{ backgroundColor: '#1a0404', border: '1px solid #330000', color: C.red }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        {step > 0
          ? <button onClick={() => setStep((p) => p - 1)} className="text-sm transition-colors" style={{ color: C.muted, fontFamily: C.cinzel }}>{t.prev}</button>
          : <Link href="/" className="text-sm" style={{ color: C.muted, fontFamily: C.cinzel }}>취소</Link>
        }
        {step < t.steps.length - 1 ? (
          <motion.button onClick={() => setStep((p) => p + 1)} disabled={!canNext()}
            whileHover={canNext() ? { scale: 1.04 } : {}} whileTap={canNext() ? { scale: 0.96 } : {}}
            className="px-6 py-2.5 text-sm font-bold rounded-xl"
            style={{ backgroundColor: canNext() ? '#1a0404' : '#0d0a10', color: canNext() ? C.red : C.muted, border: `1px solid ${canNext() ? '#330000' : C.iborder}`, opacity: canNext() ? 1 : 0.5, fontFamily: C.cinzel }}>
            {t.next}
          </motion.button>
        ) : (
          <motion.button onClick={handleSubmit} disabled={!canNext() || loading}
            whileHover={canNext() && !loading ? { scale: 1.04 } : {}} whileTap={canNext() && !loading ? { scale: 0.96 } : {}}
            className="px-6 py-2.5 text-sm font-bold rounded-xl"
            style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000', opacity: canNext() ? 1 : 0.5, fontFamily: C.cinzel }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: C.red, borderTopColor: 'transparent' }} />
                {t.analyzing}
              </span>
            ) : t.submit}
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ── AI 결과 화면 ── */
function ResultView({ result, appName, t }: { result: AIResult; appName: string; t: typeof T['ko'] }) {
  const verdictColor = result.verdict === 'approved' ? '#4ade80' : result.verdict === 'conditional' ? '#ccaa00' : C.red;
  const verdictLabel = result.verdict === 'approved' ? t.approved : result.verdict === 'conditional' ? t.conditional : t.rejected;
  const VerdictIcon = result.verdict === 'approved' ? CheckSVG : result.verdict === 'conditional' ? WarnSVG : CrossSVG;

  return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: C.redDim, fontFamily: C.cinzel }}>
        AI Analysis Result
      </div>
      <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>{appName}</h1>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-2xl text-center py-8 px-6"
        style={{ backgroundColor: C.card, border: `1px solid ${verdictColor}44` }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${verdictColor}22`, border: `2px solid ${verdictColor}` }}>
          <VerdictIcon size={28} color={verdictColor} />
        </div>
        <div className="text-xl font-black mb-2" style={{ color: verdictColor, fontFamily: C.cinzel }}>{verdictLabel}</div>
        <div className="text-sm leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm }}>{result.summary}</div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs" style={{ color: C.muted, fontFamily: C.cinzel }}>{t.score}</span>
          <span className="text-lg font-black" style={{ color: verdictColor, fontFamily: C.cinzel }}>{result.score}/100</span>
        </div>
      </motion.div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#4ade80', fontFamily: C.cinzel }}>{t.strengths}</div>
        <ul className="space-y-2">
          {result.strengths.map((s, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              className="flex items-start gap-2 text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>
              <span className="mt-0.5 flex-shrink-0"><CheckSVG size={13} color="#4ade80" /></span>
              {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {result.concerns.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#ccaa00', fontFamily: C.cinzel }}>{t.concerns}</div>
          <ul className="space-y-2">
            {result.concerns.map((c, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.2, type: 'spring', stiffness: 260, damping: 22 }}
                className="flex items-start gap-2 text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>
                <span className="mt-0.5 flex-shrink-0"><WarnSVG size={13} color="#ccaa00" /></span>
                {c}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted, fontFamily: C.cinzel }}>{t.aiRec}</div>
        <p className="text-sm leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm }}>{result.recommendation}</p>
      </div>

      <div className="flex flex-col gap-3">
        {result.verdict !== 'rejected' ? (
          <Link href="/developer/register"
            className="w-full py-3 text-center text-sm font-bold rounded-xl block"
            style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000', fontFamily: C.cinzel }}>
            {t.continueReg}
          </Link>
        ) : (
          <button onClick={() => window.location.reload()}
            className="w-full py-3 text-sm font-bold rounded-xl"
            style={{ backgroundColor: C.input, color: C.sub, border: `1px solid ${C.border}`, fontFamily: C.cinzel }}>
            {t.retry}
          </button>
        )}
        <Link href="/" className="text-center text-xs transition-colors" style={{ color: C.muted, fontFamily: C.ibm }}>
          {t.goHome}
        </Link>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: C.muted, fontFamily: C.cinzel }}>{label}</label>
      {hint && <p className="text-[10px] mb-2" style={{ color: C.muted, fontFamily: C.ibm }}>{hint}</p>}
      {children}
    </div>
  );
}
function DInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
      style={{ backgroundColor: C.input, border: `1px solid ${C.iborder}`, color: C.text, fontFamily: C.ibm }} />
  );
}
function DTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
      style={{ backgroundColor: C.input, border: `1px solid ${C.iborder}`, color: C.text, fontFamily: C.ibm }} />
  );
}
