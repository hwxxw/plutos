import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const LANGS = [
  { code: 'en',    langName: 'English',    flag: '🇺🇸' },
  { code: 'ja',    langName: '日本語',      flag: '🇯🇵' },
  { code: 'zh',    langName: '中文(简)',    flag: '🇨🇳' },
  { code: 'zh-TW', langName: '中文(繁)',    flag: '🇹🇼' },
  { code: 'es',    langName: 'Español',    flag: '🇪🇸' },
  { code: 'fr',    langName: 'Français',   flag: '🇫🇷' },
  { code: 'de',    langName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt',    langName: 'Português',  flag: '🇧🇷' },
  { code: 'ru',    langName: 'Русский',    flag: '🇷🇺' },
  { code: 'ar',    langName: 'العربية',    flag: '🇸🇦' },
  { code: 'hi',    langName: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'id',    langName: 'Bahasa',     flag: '🇮🇩' },
  { code: 'th',    langName: 'ภาษาไทย',   flag: '🇹🇭' },
  { code: 'vi',    langName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr',    langName: 'Türkçe',     flag: '🇹🇷' },
  { code: 'pl',    langName: 'Polski',     flag: '🇵🇱' },
  { code: 'nl',    langName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv',    langName: 'Svenska',    flag: '🇸🇪' },
  { code: 'it',    langName: 'Italiano',   flag: '🇮🇹' },
  { code: 'ko',    langName: '한국어',     flag: '🇰🇷' },
];

export async function POST(req: NextRequest) {
  try {
    const { appName, appDesc } = await req.json();
    if (!appName || !appDesc) {
      return NextResponse.json({ error: '앱 이름과 설명을 입력해주세요.' }, { status: 400 });
    }

    const langList = LANGS.map(l => `${l.code} (${l.langName})`).join(', ');

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are a professional app localization and marketing expert. Translate and culturally adapt the following Korean app information into each language listed.

App Name (Korean): ${appName}
App Description (Korean): ${appDesc}

Translate into these 20 languages: ${langList}

For Korean (ko), return the original Korean text.

Return ONLY a JSON object with language codes as keys. Each value must have:
- "name": localized app name (natural, culturally appropriate, not literal)
- "desc": localized description (2-3 sentences, culturally adapted for that market)
- "marketing": a catchy marketing tagline for that country's app store (1 sentence, compelling)
- "tip": one short cultural insight for marketing in that country (max 12 words)

Example format:
{
  "en": { "name": "...", "desc": "...", "marketing": "...", "tip": "..." },
  "ja": { "name": "...", "desc": "...", "marketing": "...", "tip": "..." }
}

Return only valid JSON, nothing else.`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const translations = JSON.parse(jsonMatch[0]);

    const result = LANGS.map(l => ({
      code: l.code,
      langName: l.langName,
      flag: l.flag,
      translatedName: translations[l.code]?.name || appName,
      desc: translations[l.code]?.desc || appDesc,
      marketing: translations[l.code]?.marketing || '',
      tip: translations[l.code]?.tip || '',
    }));

    return NextResponse.json({ languages: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '번역 실패. 다시 시도해주세요.' }, { status: 500 });
  }
}
