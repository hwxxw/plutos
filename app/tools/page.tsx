'use client';

import Link from 'next/link';

const TOOLS = [
  {
    num: '01',
    href: '/tools/revenue-simulator',
    title: '수익 역전 시뮬레이터',
    titleEn: 'Revenue Inversion Simulator',
    desc: '월 매출을 입력하면 PLUTOS vs 기존 스토어 순수익을 실시간 비교합니다.',
    tag: 'Interactive',
  },
  {
    num: '02',
    href: '/tools/localization-preview',
    title: 'AI 글로벌 현지화 미리보기',
    titleEn: 'AI Global Localization Preview',
    desc: 'Claude AI가 앱 이름·설명을 20개 언어로 문화 적응 번역합니다.',
    tag: 'AI-Powered',
  },
  {
    num: '03',
    href: '/tools/security-audit',
    title: '실시간 보안 감사',
    titleEn: 'Real-time Security Audit',
    desc: '8가지 보안 항목을 분석하고 S~D 등급으로 평가합니다.',
    tag: 'AI-Powered',
  },
  {
    num: '04',
    href: '/tools/fee-tracker',
    title: '수수료 리베이트 트래커',
    titleEn: 'Fee Rebate Tracker',
    desc: '개발자들이 기존 30% 수수료 대비 절감하는 금액을 실시간으로 추적합니다.',
    tag: 'Realtime',
  },
  {
    num: '05',
    href: '/tools/pwa-engine',
    title: '원클릭 PWA 엔진',
    titleEn: 'One-Click PWA Engine',
    desc: 'URL 하나로 manifest.json과 service-worker.js를 즉시 생성합니다.',
    tag: 'Generator',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Developer Tools
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          마케팅 도구 모음
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          PLUTOS가 제공하는 무료 개발자 도구를 체험해보세요.
        </p>
      </div>

      <div className="space-y-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.num}
            href={tool.href}
            className="block rounded-2xl p-5 transition-all"
            style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#660000';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(100,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#2a1515';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="text-xs font-black mt-0.5 flex-shrink-0" style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}>{tool.num}</span>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>{tool.title}</div>
                  <div className="text-[10px] mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>{tool.titleEn}</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{tool.desc}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="text-[9px] px-2 py-1 rounded" style={{ backgroundColor: '#1a0404', color: '#880000', border: '1px solid #330000', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap' }}>
                  {tool.tag}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
          개발자로 시작하기 →
        </Link>
      </div>
    </div>
  );
}
