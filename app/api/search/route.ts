import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const VALID_CATEGORIES = ['writing', 'data', 'automation', 'design', 'learning', 'business', 'marketing', 'dev'];

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ apps: [] });

  const supabase = createClient();

  let keywords = q;
  let category: string | null = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `앱 마켓 검색 분석. 사용자 검색어: "${q}"

카테고리 목록: writing(글쓰기), data(데이터/분석), automation(자동화), design(디자인), learning(학습), business(비즈니스), marketing(마케팅), dev(개발)

JSON만 응답:
{"keywords": "검색에 쓸 핵심 키워드들 (공백 구분, 영어 포함)", "category": "가장 관련된 카테고리 키 또는 null"}`,
          },
        ],
      });
      const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
      const match = text.match(/\{[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.keywords?.trim()) keywords = parsed.keywords.trim();
        if (parsed.category && VALID_CATEGORIES.includes(parsed.category)) {
          category = parsed.category;
        }
      }
    } catch {
      // fallback to raw query
    }
  }

  const kwList = keywords.split(/\s+/).filter(Boolean);
  const orClauses = kwList.flatMap((kw) => [
    `name.ilike.%${kw}%`,
    `tagline.ilike.%${kw}%`,
    `description.ilike.%${kw}%`,
  ]).join(',');

  let query = supabase
    .from('apps_public')
    .select('*')
    .or(orClauses)
    .limit(24);

  if (category) query = query.eq('category', category);

  const { data: apps } = await query;
  return NextResponse.json({ apps: apps || [], category, keywords });
}
