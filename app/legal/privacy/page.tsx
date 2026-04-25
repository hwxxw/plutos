import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 | PLUTOS',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10 text-sm leading-7" style={{ color: '#cccccc' }}>
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>Legal</div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>개인정보처리방침</h1>
        <p className="text-xs" style={{ color: '#666' }}>최종 업데이트: 2026년 4월 25일 · 시행일: 2026년 4월 25일</p>
      </div>

      <p style={{ color: '#aaa' }}>
        PLUTOS(이하 "회사")는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하며,
        이용자의 개인정보 보호를 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <Section title="1. 수집하는 개인정보 항목">
        <p className="mb-2">회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
        <Table
          headers={['구분', '수집 항목', '수집 방법']}
          rows={[
            ['회원 가입', '이메일 주소, 소셜 계정 식별자(Google/Apple/GitHub)', '회원 가입 시 입력 또는 OAuth 인증'],
            ['서비스 이용', 'IP 주소, 기기 정보, 접속 로그, 쿠키', '서비스 이용 과정 중 자동 수집'],
            ['결제', '결제 수단 정보(Stripe 처리), 구매 내역', '결제 시 Stripe 연동 수집'],
            ['개발자 회원', '사업자 정보(Stripe Connect), 계좌 정보', '개발자 등록 및 Stripe 온보딩'],
          ]}
        />
        <p className="mt-2 text-xs" style={{ color: '#888' }}>
          * 신용카드 번호 등 결제 민감정보는 Stripe Inc.가 직접 처리하며, 회사는 저장하지 않습니다.
        </p>
      </Section>

      <Section title="2. 개인정보 수집 및 이용 목적">
        <ol className="list-decimal list-inside space-y-1.5 ml-2">
          <li>회원 가입 및 본인 확인, 서비스 제공</li>
          <li>구매·판매 거래 처리 및 정산</li>
          <li>고객 문의 응대 및 분쟁 처리</li>
          <li>서비스 이용 통계 및 서비스 개선</li>
          <li>불법·부정 이용 방지 및 보안 강화</li>
          <li>법령상 의무 이행(전자상거래법, 부가가치세법 등)</li>
          <li>마케팅·프로모션 정보 제공 (동의한 경우에 한함)</li>
        </ol>
      </Section>

      <Section title="3. 개인정보 보유 및 이용 기간">
        <Table
          headers={['보유 항목', '보유 기간', '근거']}
          rows={[
            ['회원 정보', '회원 탈퇴 시까지', '이용자 동의'],
            ['계약·청약철회 기록', '5년', '전자상거래 등에서의 소비자보호에 관한 법률'],
            ['대금 결제 및 재화 공급 기록', '5년', '전자상거래법'],
            ['소비자 불만·분쟁 처리 기록', '3년', '전자상거래법'],
            ['접속 로그', '3개월', '통신비밀보호법'],
          ]}
        />
        <p className="mt-2 text-xs" style={{ color: '#888' }}>
          보유 기간이 경과하거나 이용 목적이 달성된 개인정보는 지체 없이 파기합니다.
        </p>
      </Section>

      <Section title="4. 개인정보 제3자 제공">
        <p className="mb-2">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>이용자의 사전 동의가 있는 경우</li>
          <li>법령에 의거하거나 수사기관의 적법한 절차에 따른 요청이 있는 경우</li>
          <li>결제 처리를 위해 Stripe Inc.에 필요한 최소한의 정보를 제공하는 경우</li>
        </ol>
      </Section>

      <Section title="5. 개인정보 처리 위탁">
        <p className="mb-2">회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
        <Table
          headers={['수탁업체', '위탁 업무', '보유 기간']}
          rows={[
            ['Supabase Inc.', '데이터베이스 호스팅 및 인증 서비스', '위탁 계약 종료 시'],
            ['Stripe Inc.', '결제 처리 및 개발자 정산', '위탁 계약 종료 시'],
            ['Vercel Inc.', '웹 서비스 호스팅', '위탁 계약 종료 시'],
            ['Anthropic PBC', 'AI 기반 콘텐츠 분석 (익명 처리 후 전달)', '위탁 계약 종료 시'],
          ]}
        />
      </Section>

      <Section title="6. 국외 이전">
        <p>
          회사는 서비스 운영을 위해 아래와 같이 개인정보를 국외로 이전합니다.
          이전되는 정보는 각 수탁업체의 개인정보 처리방침에 따라 보호됩니다.
        </p>
        <Table
          headers={['이전 대상', '국가', '이전 목적']}
          rows={[
            ['Supabase Inc.', '미국', '데이터베이스 및 인증'],
            ['Stripe Inc.', '미국', '결제 처리'],
            ['Vercel Inc.', '미국', '서비스 호스팅'],
          ]}
        />
      </Section>

      <Section title="7. 쿠키(Cookie) 사용">
        <ol className="list-decimal list-inside space-y-1.5 ml-2">
          <li>회사는 서비스 제공을 위해 필수 쿠키, 기능 쿠키, 분석 쿠키를 사용합니다.</li>
          <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.</li>
          <li>쿠키는 로그인 상태 유지, 서비스 이용 분석, 사용자 경험 개선 목적으로 사용됩니다.</li>
        </ol>
      </Section>

      <Section title="8. 이용자 권리 및 행사 방법">
        <p className="mb-2">이용자는 다음과 같은 권리를 행사할 수 있습니다.</p>
        <ol className="list-decimal list-inside space-y-1.5 ml-2">
          <li>개인정보 열람 요청</li>
          <li>개인정보 정정·삭제 요청</li>
          <li>개인정보 처리 정지 요청</li>
          <li>개인정보 이동(포터빌리티) 요청</li>
          <li>마케팅 수신 동의 철회</li>
        </ol>
        <p className="mt-2">
          위 권리 행사는 고객센터 이메일(support@plutos.app)로 요청하시면 되며, 법령에서 정한 바에 따라 신속히 처리합니다.
        </p>
      </Section>

      <Section title="9. 개인정보 보호를 위한 기술적·관리적 조치">
        <ol className="list-decimal list-inside space-y-1.5 ml-2">
          <li>개인정보는 암호화하여 저장하고, 전송 시 TLS/SSL로 보호합니다.</li>
          <li>개인정보 처리 시스템에 대한 접근 권한은 최소화하여 관리합니다.</li>
          <li>정기적인 보안 점검 및 취약점 스캔을 실시합니다.</li>
          <li>개인정보 취급 직원에 대한 교육을 정기적으로 실시합니다.</li>
          <li>Row Level Security(RLS) 정책을 통해 데이터 접근을 제어합니다.</li>
        </ol>
      </Section>

      <Section title="10. 개인정보 보호책임자">
        <ul className="space-y-1 text-xs" style={{ color: '#aaa' }}>
          <li>성명: PLUTOS 개인정보 보호담당자</li>
          <li>이메일: privacy@plutos.app</li>
          <li>운영시간: 평일 09:00 – 18:00</li>
        </ul>
        <p className="mt-3 text-xs" style={{ color: '#888' }}>
          개인정보 침해 신고나 상담은 개인정보 보호위원회(privacy.go.kr, 국번없이 182),
          한국인터넷진흥원(KISA) 개인정보침해 신고센터(privacy.kisa.or.kr, 국번없이 118)에서도 받으실 수 있습니다.
        </p>
      </Section>

      <Section title="11. 방침의 변경">
        <p>
          본 개인정보처리방침이 변경되는 경우 서비스 공지사항을 통해 최소 7일 전에 공지합니다.
          이용자에게 중요한 권리 변경이 있는 경우에는 30일 전에 공지하며, 이메일로도 별도 통보합니다.
        </p>
      </Section>

      <div className="pt-6 border-t flex items-center gap-4 text-xs" style={{ borderColor: '#2a1515', color: '#555' }}>
        <Link href="/legal/terms" className="hover:text-zinc-300 transition-colors">이용약관</Link>
        <Link href="/" className="hover:text-zinc-300 transition-colors">메인으로</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-3" style={{ fontFamily: 'Cinzel, serif' }}>{title}</h2>
      <div className="space-y-2 text-sm leading-7" style={{ color: '#aaaaaa' }}>{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-xs border-collapse" style={{ color: '#aaa' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #3a1515' }}>
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 font-semibold" style={{ color: '#cccccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1e1218' }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 align-top leading-relaxed">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
