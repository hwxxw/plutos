export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * 5자 이상의 UUID 접두부만 추출하여 앱 ID를 간소 표기
 */
export function shortId(id: string): string {
  return id.slice(0, 8);
}
