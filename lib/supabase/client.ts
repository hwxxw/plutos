import { createBrowserClient } from '@supabase/ssr';

// 프로덕션에서는 `supabase gen types typescript` 로 자동 생성한 타입 사용 권장.
// 지금은 런타임 안전성 우선으로 generic 없이 구성.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
