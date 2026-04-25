'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { formatKRW } from '@/lib/format';

type AdApp = {
  id: string;
  name: string;
  tagline: string | null;
  icon_url: string;
  slug: string;
  min_price_krw: number;
};

export function DevAdBanner({ apps }: { apps: AdApp[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // DB에 앱이 없으면 데모 플레이스홀더 표시
  const DEMO: AdApp[] = [
    { id: 'd1', name: 'AI 문서 요약기', tagline: 'PDF·웹페이지를 3줄로 압축', icon_url: '', slug: '#', min_price_krw: 9900 },
    { id: 'd2', name: '코드 리뷰 봇',  tagline: 'PR 자동 리뷰 & 버그 탐지',  icon_url: '', slug: '#', min_price_krw: 14900 },
    { id: 'd3', name: '마케팅 카피 AI', tagline: '클릭률 높은 카피 즉시 생성', icon_url: '', slug: '#', min_price_krw: 7900 },
    { id: 'd4', name: 'SEO 분석기',    tagline: '키워드·경쟁사 실시간 분석', icon_url: '', slug: '#', min_price_krw: 12900 },
    { id: 'd5', name: '회의록 자동화', tagline: '음성→텍스트→액션아이템',   icon_url: '', slug: '#', min_price_krw: 19900 },
    { id: 'd6', name: '이미지 리터처', tagline: 'AI 보정·배경 제거 1초',    icon_url: '', slug: '#', min_price_krw: 5900 },
  ];
  const displayApps = (!apps || apps.length === 0) ? DEMO : apps;
  const doubled = [...displayApps, ...displayApps];

  return (
    <div ref={ref} className="overflow-hidden">
      {/* Header entrance */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.1 }}
        className="flex items-center gap-4 mb-5 px-1"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="h-px flex-1 origin-left"
          style={{ background: 'linear-gradient(90deg, #660000, transparent)' }}
        />
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={isInView ? { opacity: 1, letterSpacing: '0.25em' } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-[10px] uppercase font-semibold flex-shrink-0"
          style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}
        >
          Featured on Plutos
        </motion.span>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="h-px flex-1 origin-right"
          style={{ background: 'linear-gradient(90deg, transparent, #660000)' }}
        />
      </motion.div>

      {/* Banner box entrance */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.6, y: 40 }}
        animate={isInView ? { opacity: 1, scaleY: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.2 }}
        className="rounded-2xl overflow-hidden relative py-5"
        style={{
          background: 'linear-gradient(180deg, #120a0e 0%, #1a0404 50%, #120a0e 100%)',
          border: '1px solid #2a1515',
          boxShadow: '0 0 60px rgba(74,4,4,0.3), inset 0 1px 0 rgba(201,168,76,0.05)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #660000, #cc1a1a, #660000, transparent)' }}
        />

        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-4 w-max px-6">
            {doubled.map((app, i) => (
              <motion.div
                key={`${app.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.03, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <Link
                  href={`/apps/${app.slug}`}
                  className="flex-shrink-0 w-44 rounded-2xl p-3 block group transition-all duration-200"
                  style={{
                    backgroundColor: '#0d0d14',
                    border: '1px solid #2a1515',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#660000';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(102,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2a1515';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name}
                      className="w-10 h-10 rounded-xl object-cover mb-2"
                      style={{ backgroundColor: '#1a0a0e' }} />
                  ) : (
                    <div className="w-10 h-10 rounded-xl mb-2"
                      style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
                  )}
                  <div
                    className="font-semibold text-xs truncate mb-0.5 group-hover:text-[#cc1a1a] transition-colors"
                    style={{ color: '#f0ece4' }}
                  >
                    {app.name}
                  </div>
                  <div
                    className="text-[10px] line-clamp-2 leading-tight mb-2"
                    style={{ color: '#4a3535' }}
                  >
                    {app.tagline || ''}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: '#cc1a1a' }}>
                    {formatKRW(app.min_price_krw)}~
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
            style={{ background: 'linear-gradient(90deg, #120a0e, transparent)' }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
            style={{ background: 'linear-gradient(90deg, transparent, #120a0e)' }}
          />
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #4A0404, transparent)' }}
        />
      </motion.div>

      {/* Sub label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="text-center mt-3"
      >
        <Link
          href="/developer/register"
          className="text-[11px] transition-colors"
          style={{ color: '#4a3535' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#cc1a1a')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4a3535')}
        >
          개발자로 등록하면 여기에 앱을 올릴 수 있습니다 →
        </Link>
      </motion.div>
    </div>
  );
}
