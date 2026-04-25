import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const LANGS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文(简)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文(繁)', flag: '🇹🇼' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export async function POST(req: NextRequest) {
  try {
    const { appName, appDesc } = await req.json();
    if (!appName || !appDesc) {
      return NextResponse.json({ error: '앱 이름과 설명을 입력해주세요.' }, { status: 400 });
    }

    const langList = LANGS.filter(l => l.code !== 'ko')
      .map(l => `${l.code} (${l.name})`)
      .join(', ');

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a professional app localization expert. Translate and culturally adapt the following Korean app name and description into each language listed.

App Name (Korean): ${appName}
App Description (Korean): ${appDesc}

Translate into these languages: ${langList}

Return ONLY a JSON object with language codes as keys. Each value must have:
- "name": localized app name (natural, not literal)
- "desc": localized description (1-2 sentences, culturally adapted)
- "tip": one short cultural insight for that market (max 10 words)

Example format:
{
  "en": { "name": "...", "desc": "...", "tip": "..." },
  "ja": { "name": "...", "desc": "...", "tip": "..." }
}

Return only valid JSON, nothing else.`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const translations = JSON.parse(jsonMatch[0]);

    const result = LANGS.map(l => ({
      ...l,
      ...(translations[l.code] || { name: appName, desc: appDesc, tip: '' }),
    }));

    return NextResponse.json({ languages: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '번역 실패. 다시 시도해주세요.' }, { status: 500 });
  }
}
