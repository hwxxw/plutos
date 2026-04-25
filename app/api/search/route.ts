import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const VALID_CATEGORIES = ['writing', 'data', 'automation', 'design', 'learning', 'business', 'marketing', 'dev'];

// 모듈 레벨 싱글톤 — cold start 1회만 초기화
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// 검색어 파싱 결과 인메모리 캐시 (같은 쿼리 → Claude 재호출 방지)
type CachedParse = { keywords: string; category: string | null; expires: number };
const parseCache = new Map<string, CachedParse>();
const CACHE_TTL = 5 * 60 * 1000; // 5분
const CACHE_MAX = 300;

function getCached(q: string): CachedParse | null {
  const hit = parseCache.get(q);
  if (!hit) return null;
  if (hit.expires < Date.now()) { parseCache.delete(q); return null; }
  return hit;
}

function setCache(q: string, value: Omit<CachedParse, 'expires'>) {
  if (parseCache.size >= CACHE_MAX) {
    // 가장 오래된 항목 제거
    const first = parseCache.keys().next().value;
    if (first) parseCache.delete(first);
  }
  parseCache.set(q, { ...value, expires: Date.now() + CACHE_TTL });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ apps: [] });

  const supabase = createClient();

  let keywords = q;
  let category: string | null = null;

  // 캐시 히트 → Claude 스킵
  const cached = getCached(q);
  if (cached) {
    keywords = cached.keywords;
    category = cached.category;
  } else if (anthropic) {
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content: `앱 마켓 검색 분석. 검색어: "${q}"\n카테고리: writing, data, automation, design, learning, business, marketing, dev\nJSON만: {"keywords":"핵심 키워드 영어포함","category":"카테고리키 또는 null"}`,
        }],
      });
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
      const match = text.match(/\{[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.keywords?.trim()) keywords = parsed.keywords.trim();
        if (parsed.category && VALID_CATEGORIES.includes(parsed.category)) category = parsed.category;
      }
      setCache(q, { keywords, category });
    } catch {
      // fallback: 원본 쿼리 사용
    }
  }

  const kwList = keywords.split(/\s+/).filter(Boolean);
  const orClauses = kwList.flatMap((kw) => [
    `name.ilike.%${kw}%`,
    `tagline.ilike.%${kw}%`,
    `description.ilike.%${kw}%`,
  ]).join(',');

  let query = supabase.from('apps_public').select('*').or(orClauses).limit(24);
  if (category) query = query.eq('category', category);

  const { data: apps } = await query;
  return NextResponse.json({ apps: apps || [], category, keywords });
}
