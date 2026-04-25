'use client';

export type FingerprintSignals = {
  ua: string;
  screen: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  memory: number | null;
  cores: number | null;
  canvasHash: string;
  hash: string;
};

function canvasHash(): string {
  if (typeof document === 'undefined') return 'ssr';
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-ctx';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('PLUTOS🔒', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('PLUTOS🔒', 4, 17);
    const data = canvas.toDataURL();
    // 간단 해시 (djb2)
    let h = 5381;
    for (let i = 0; i < data.length; i++) {
      h = ((h << 5) + h) ^ data.charCodeAt(i);
      h = h >>> 0;
    }
    return h.toString(16);
  } catch {
    return 'err';
  }
}

function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16);
}

export function collectFingerprint(): FingerprintSignals {
  const nav = navigator as any;
  const ua = nav.userAgent || '';
  const screen = `${window.screen.width}x${window.screen.height}`;
  const colorDepth = window.screen.colorDepth;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = nav.language || '';
  const platform = nav.platform || '';
  const memory = nav.deviceMemory ?? null;
  const cores = nav.hardwareConcurrency ?? null;
  const cvHash = canvasHash();

  const raw = [ua, screen, colorDepth, timezone, language, platform, memory, cores, cvHash].join('|');
  const hash = simpleHash(raw);

  return { ua, screen, colorDepth, timezone, language, platform, memory, cores, canvasHash: cvHash, hash };
}

export async function sendFingerprint(fingerprint: FingerprintSignals, context: 'checkout' | 'login' | 'install') {
  try {
    await fetch('/api/fds/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fingerprint, context }),
    });
  } catch {
    // best-effort, 실패해도 UX에 영향 없음
  }
}
