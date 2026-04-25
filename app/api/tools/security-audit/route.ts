import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const client = new Anthropic();

function scoreToGrade(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  return 'D';
}

export async function POST(req: NextRequest) {
  try {
    const { appUrl, appName, appDesc } = await req.json();
    if (!appUrl) return NextResponse.json({ error: 'URL을 입력해주세요.' }, { status: 400 });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are a PWA security auditor. Analyze this web app for security best practices.

App URL: ${appUrl}
App Name: ${appName || 'Unknown'}
App Description: ${appDesc || 'N/A'}

Simulate a security audit and return a JSON object with these exact fields:
{
  "score": <integer 0-100>,
  "checks": [
    { "id": "https", "label": "HTTPS/TLS", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "csp", "label": "Content Security Policy", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "headers", "label": "Security Headers", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "cors", "label": "CORS Policy", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "pwa", "label": "PWA Manifest", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "auth", "label": "Auth Hardening", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "deps", "label": "Dependency Safety", "pass": <boolean>, "detail": "<short reason>" },
    { "id": "xss", "label": "XSS Protection", "pass": <boolean>, "detail": "<short reason>" }
  ],
  "recommendation": "<2-sentence improvement advice>"
}

Base your analysis on the URL pattern and app description. Use realistic assumptions. Return only valid JSON.`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const audit = JSON.parse(jsonMatch[0]);
    const grade = scoreToGrade(audit.score);

    // 응답 먼저 반환 후 Supabase 저장 (블로킹 방지)
    const supabase = createClient();
    supabase.from('security_audits').insert({
      app_url: appUrl,
      app_name: appName || null,
      score: audit.score,
      grade,
      checks: audit.checks,
      recommendation: audit.recommendation,
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ ...audit, grade });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '감사 실패. 다시 시도해주세요.' }, { status: 500 });
  }
}
