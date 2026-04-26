'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatKRW } from '@/lib/format';
import type { PublicApp } from '@/lib/supabase/types';

const MotionLink = motion(Link);

export function AppCard({ app }: { app: PublicApp }) {
  return (
    <MotionLink
      href={`/apps/${app.slug}`}
      className="block group rounded-xl p-4"
      style={{
        backgroundColor: '#1a1010',
        border: '1px solid #3a1818',
      }}
      whileHover={{
        scale: 1.04,
        y: -4,
        backgroundColor: '#220e0e',
        borderColor: '#880000',
        boxShadow: '0 12px 40px rgba(100,0,0,0.3)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      <div className="flex items-start gap-3">
        {app.icon_url ? (
          <Image
            src={app.icon_url}
            alt={app.name}
            width={48}
            height={48}
            className="rounded-xl object-cover flex-shrink-0"
            style={{ backgroundColor: '#2a1010' }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: '#2a1010' }} />
        )}
        <div className="flex-1 min-w-0">
          {/* App name */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3
              className="font-semibold truncate text-sm"
              style={{
                color: '#e8e8e8',
                fontFamily: "'IBM Plex Sans KR', 'Space Grotesk', sans-serif",
                transition: 'color 150ms',
              }}
            >
              {app.name}
            </h3>
            {app.developer_is_pro && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ color: '#cc1a1a', backgroundColor: '#1a0505', border: '1px solid #550000' }}
              >
                PRO
              </span>
            )}
          </div>

          {/* Tagline */}
          <p
            className="text-xs line-clamp-1 mb-2"
            style={{
              color: '#888888',
              fontFamily: "'IBM Plex Sans KR', sans-serif",
              fontWeight: 300,
            }}
          >
            {app.tagline || app.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs">
            {app.rating_count > 0 ? (
              <span style={{ color: '#777777' }}>
                ★ {app.rating_avg.toFixed(1)}
                <span style={{ color: '#555555' }}> ({app.rating_count})</span>
              </span>
            ) : (
              <span style={{ color: '#555555' }}>리뷰 없음</span>
            )}
            {app.tier_count > 1 && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: '#cc8800', backgroundColor: '#1a1000', border: '1px solid #3a2a00' }}
              >
                {app.tier_count}티어
              </span>
            )}
            <span
              className="ml-auto font-bold"
              style={{ color: '#e8e8e8', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {app.tier_count > 1 && (
                <span className="text-xs font-normal mr-0.5" style={{ color: '#666666' }}>
                  최저
                </span>
              )}
              {formatKRW(app.min_price_krw)}
            </span>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}
