'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="max-w-md mx-auto py-24 text-center px-4">
      <div className="rounded-2xl p-8 space-y-4" style={{ backgroundColor: '#120a0e', border: '1px solid #330000' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cc1a1a" strokeWidth={2} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>
        <h2 className="text-lg font-black" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>오류가 발생했습니다</h2>
        <p className="text-sm" style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          일시적인 오류입니다. 다시 시도해주세요.
        </p>
        <button onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-bold"
          style={{ backgroundColor: '#cc1a1a', color: '#fff', fontFamily: 'Cinzel, serif' }}>
          다시 시도
        </button>
      </div>
    </div>
  );
}
