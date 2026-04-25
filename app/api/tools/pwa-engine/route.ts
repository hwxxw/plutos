import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url, appName, themeColor } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL을 입력해주세요.' }, { status: 400 });

    let hostname = url;
    try { hostname = new URL(url).hostname; } catch (_) {}

    const slug = (appName || hostname).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const color = themeColor || '#0d0d14';

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Generate a complete PWA configuration for this web app.

URL: ${url}
App Name: ${appName || hostname}
Theme Color: ${color}

Return a JSON object with exactly these fields:
{
  "manifest": { <complete valid manifest.json object including name, short_name, description, start_url, display, background_color, theme_color, icons array with 192x192 and 512x512 placeholder paths> },
  "serviceWorker": "<complete service-worker.js code as a string with cache-first strategy>",
  "installInstructions": "<step-by-step Korean instructions for installing as PWA on iOS and Android>"
}

Make the manifest realistic and complete. The service worker should cache the main shell. Return only valid JSON.`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      slug,
      manifest: result.manifest,
      serviceWorker: result.serviceWorker,
      installInstructions: result.installInstructions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'PWA 생성 실패. 다시 시도해주세요.' }, { status: 500 });
  }
}
