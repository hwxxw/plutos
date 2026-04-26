import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TtlCache } from '@/lib/cache';

// 모듈 싱글톤
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 동일 입력 → Claude 재호출 방지 (10분 TTL, 최대 200건)
type SurveyResult = {
  verdict: string; score: number; summary: string;
  strengths: string[]; concerns: string[]; recommendation: string;
};
const surveyCache = new TtlCache<SurveyResult>(10 * 60_000, 200);

function makeCacheKey(body: Record<string, string>): string {
  return [body.appName, body.category, body.description, body.mainFeature].join('|').toLowerCase().slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appName, appUrl, category, description, targetUser, techStack, pricingIdea, monthlyUsers, mainFeature, devGoal } = body;

    if (!appName || !category || !description || !targetUser) {
      return NextResponse.json({ error: '필수 항목을 입력해 주세요.' }, { status: 400 });
    }

    // 캐시 히트
    const cacheKey = makeCacheKey(body);
    const cached = surveyCache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const prompt = `당신은 PWA 마켓플레이스(PLUTOS) 입점 심사 전문가입니다.
아래 개발자가 제출한 앱 정보를 분석하여 마켓 출시 가능성을 평가해 주세요.

## 제출된 앱 정보
- 앱 이름: ${appName}
- URL: ${appUrl || '없음'}
- 카테고리: ${category}
- 설명: ${description}
- 핵심 기능: ${mainFeature}
- 기술 스택: ${techStack || '미기재'}
- 타깃 사용자: ${targetUser}
- 예상 가격대: ${pricingIdea}
- 월 사용자: ${monthlyUsers || '미기재'}
- 개발 목표: ${devGoal}

## 평가 기준
1. 사용자 가치: 명확한 문제 해결 여부
2. 시장성: 타깃 명확성, 가격 적정성
3. 기술 완성도: PWA 구현 가능성
4. 수익 잠재력: 마켓 내 경쟁력
5. 운영 가능성: 지속 가능한 서비스인지

## 출력 형식 (반드시 JSON으로만 응답)
{"verdict":"approved"|"conditional"|"rejected","score":0~100,"summary":"2~3문장","strengths":["강점1","강점2","강점3"],"concerns":["우려1","우려2"],"recommendation":"권고사항 2~3문장"}

verdict: approved=75점↑, conditional=50~74점, rejected=49점↓
JSON 외 텍스트 절대 금지.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (message.content[0] as { type: string; text: string }).text.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('JSON 파싱 실패');
      parsed = JSON.parse(match[0]);
    }

    const result: SurveyResult = {
      verdict:        parsed.verdict ?? 'conditional',
      score:          Math.min(100, Math.max(0, Number(parsed.score) || 50)),
      summary:        parsed.summary ?? '분석 결과를 불러올 수 없습니다.',
      strengths:      Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      concerns:       Array.isArray(parsed.concerns) ? parsed.concerns.slice(0, 4) : [],
      recommendation: parsed.recommendation ?? '',
    };

    surveyCache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[survey]', err);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
