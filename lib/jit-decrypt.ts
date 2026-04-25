/**
 * JIT (Just-In-Time) Decryption utility
 * 핵심 값을 AES-GCM으로 암호화해 번들에 저장, 사용 직전에만 복호화.
 * 소스에서는 암호화된 문자열만 보여 직접 추출 시 무의미.
 */

const ALGO = 'AES-GCM';
const KEY_USAGE: KeyUsage[] = ['encrypt', 'decrypt'];

async function deriveKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32));
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, false, KEY_USAGE);
}

export async function jitEncrypt(plaintext: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return Buffer.from(combined).toString('base64');
}

export async function jitDecrypt(ciphertext: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const combined = new Uint8Array(Buffer.from(ciphertext, 'base64'));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

/**
 * 실행 환경 무결성 체크 — 개발자 도구 감지 시도
 * (완벽한 차단은 불가능하지만 진입장벽 역할)
 */
export function integrityCheck(): boolean {
  if (typeof window === 'undefined') return true;

  // 개발자 도구 크기 감지
  const threshold = 160;
  const devtoolsOpen =
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold;

  if (devtoolsOpen) {
    console.warn('%c🔒 PLUTOS Security', 'color:#cc1a1a;font-size:20px;font-weight:bold');
    console.warn('Unauthorized inspection detected. Session will be invalidated.');
  }

  return !devtoolsOpen;
}

/**
 * 보호된 실행 래퍼 — 무결성 실패 시 콜백 호출 없이 종료
 */
export function withJITProtection<T>(
  fn: () => T,
  onViolation?: () => void
): T | undefined {
  if (!integrityCheck()) {
    onViolation?.();
    return undefined;
  }
  return fn();
}
