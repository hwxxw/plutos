import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에서 세션 갱신:
     * - api/ (API 라우트는 자체 auth.getUser() 호출 — 중복 제거)
     * - _next/static, _next/image (정적/이미지)
     * - favicon.ico, robots.txt, sw.js 등 정적 파일
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
