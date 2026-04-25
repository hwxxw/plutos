import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
  typescript: true,
});

/**
 * v5.0 수수료 계산 (전 티어 동일 정책)
 * - 일반 개발자: 20%
 * - Pro 개발자: 15%
 * - 챌린지 수상자: 5% (3개월 한정)
 */
export function calculatePlatformFee(
  amountKrw: number,
  developerIsPro: boolean,
  isChallengeWinner: boolean = false
): {
  feeRate: number;
  platformFee: number;
  developerPayout: number;
} {
  let feeRate: number;
  if (isChallengeWinner) feeRate = 0.05;
  else if (developerIsPro) feeRate = 0.15;
  else feeRate = 0.20;

  const platformFee = Math.round(amountKrw * feeRate);
  const developerPayout = amountKrw - platformFee;

  return { feeRate, platformFee, developerPayout };
}

/**
 * 에스크로 해제 일시
 */
export function calculateEscrowRelease(developerIsPro: boolean): Date {
  const now = new Date();
  if (developerIsPro) return now;
  return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
}
