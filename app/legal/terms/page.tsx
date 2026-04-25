import Link from 'next/link';

export const metadata = {
  title: '이용약관 | PLUTOS',
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10 text-sm leading-7" style={{ color: '#cccccc' }}>
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>Legal</div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>이용약관</h1>
        <p className="text-xs" style={{ color: '#666' }}>최종 업데이트: 2026년 4월 25일 · 시행일: 2026년 4월 25일</p>
      </div>

      <Section title="제1조 (목적)">
        <p>
          본 이용약관(이하 "약관")은 PLUTOS(이하 "회사")가 운영하는 PWA 마켓플레이스 서비스(이하 "서비스")의
          이용에 관한 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (정의)">
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>"서비스"란 PLUTOS가 제공하는 PWA(Progressive Web App) 마켓플레이스 플랫폼 및 관련 부가 서비스를 의미합니다.</li>
          <li>"이용자"란 회사의 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
          <li>"회원"이란 회사에 이메일 등의 방법으로 가입하여 이용자 아이디(ID)를 부여받은 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 이용할 수 있는 자를 말합니다.</li>
          <li>"개발자 회원"이란 자신이 개발한 PWA 애플리케이션을 서비스에 등록·판매하는 회원을 의미합니다.</li>
          <li>"콘텐츠"란 개발자 회원이 서비스에 등록한 PWA 애플리케이션, 설명, 이미지 등 일체의 정보를 말합니다.</li>
          <li>"수수료"란 회사가 콘텐츠 거래를 중개하는 대가로 개발자 회원으로부터 취득하는 금액을 의미합니다.</li>
        </ol>
      </Section>

      <Section title="제3조 (약관의 효력 및 변경)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
          <li>회사는 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수 있으며, 변경 시 서비스 내 공지사항을 통해 최소 7일 전에 공지합니다. 단, 이용자에게 불리한 내용으로 변경할 경우에는 최소 30일 전에 공지합니다.</li>
          <li>이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다. 변경 약관 공지 후 서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로 간주합니다.</li>
        </ol>
      </Section>

      <Section title="제4조 (서비스의 제공 및 변경)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>회사는 다음과 같은 서비스를 제공합니다.
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs" style={{ color: '#aaa' }}>
              <li>PWA 애플리케이션 등록 및 유통 서비스</li>
              <li>PWA 애플리케이션 구매 및 라이선스 발급 서비스</li>
              <li>결제 처리 및 정산 서비스</li>
              <li>개발자 전용 대시보드 및 분석 서비스</li>
              <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
            </ul>
          </li>
          <li>회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 이 경우 사전에 공지합니다.</li>
          <li>서비스 이용은 연중무휴 24시간 원칙으로 하나, 시스템 점검 등의 경우 일시 중단될 수 있습니다.</li>
        </ol>
      </Section>

      <Section title="제5조 (회원 가입 및 계정 관리)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>이용자는 회사가 정한 절차에 따라 이메일 또는 소셜 계정(Google, Apple, GitHub 등)을 통해 회원으로 가입할 수 있습니다.</li>
          <li>회원은 가입 시 등록한 정보를 항상 최신 상태로 유지할 책임이 있습니다.</li>
          <li>회원은 계정 및 비밀번호를 타인에게 양도·대여하거나 공유할 수 없습니다.</li>
          <li>회원은 계정이 무단으로 사용된 경우 즉시 회사에 신고하여야 하며, 신고 전 발생한 손해에 대하여 회사는 책임지지 않습니다.</li>
          <li>회사는 다음에 해당하는 경우 이용 신청을 거부하거나 사후에 회원 자격을 취소할 수 있습니다.
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs" style={{ color: '#aaa' }}>
              <li>허위 정보를 기재하거나 타인의 정보를 도용한 경우</li>
              <li>만 14세 미만인 경우</li>
              <li>부정한 목적으로 서비스를 이용하려는 경우</li>
              <li>이전에 약관 위반으로 계정이 해지된 경우</li>
            </ul>
          </li>
        </ol>
      </Section>

      <Section title="제6조 (개발자 회원)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>일반 회원은 회사가 정한 절차에 따라 개발자 회원으로 전환을 신청할 수 있습니다.</li>
          <li>개발자 회원은 자신이 합법적으로 보유한 PWA 애플리케이션만 서비스에 등록할 수 있습니다.</li>
          <li>개발자 회원은 등록한 콘텐츠가 다음 요건을 충족함을 보증합니다.
            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-xs" style={{ color: '#aaa' }}>
              <li>제3자의 지식재산권(저작권, 상표권, 특허권 등)을 침해하지 않을 것</li>
              <li>음란물, 폭력적 내용, 혐오 표현 등 불법·유해 콘텐츠가 아닐 것</li>
              <li>악성 코드, 스파이웨어 등 보안 위협 요소가 없을 것</li>
              <li>관련 법령 및 정부 고시를 준수할 것</li>
            </ul>
          </li>
          <li>회사는 등록된 콘텐츠를 검토하여 위 요건에 미달하는 경우 사전 통보 없이 삭제하거나 서비스 제공을 중단할 수 있습니다.</li>
        </ol>
      </Section>

      <Section title="제7조 (수수료 및 정산)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>회사는 콘텐츠 거래 중개 서비스 제공 대가로 개발자 회원에게 수수료를 부과합니다.</li>
          <li>수수료율은 서비스 내 개발자 정책 페이지에 별도로 공지하며, 변경 시 30일 전에 사전 공지합니다.</li>
          <li>정산은 회사가 정한 정산 주기에 따르며, 개발자 회원이 Stripe Connect 계좌를 연결한 경우에 한하여 지급됩니다.</li>
          <li>환불이 발생한 경우 해당 거래에 대한 개발자 수익은 차감됩니다.</li>
          <li>조세 관련 의무는 각 개발자 회원이 해당 국가 법령에 따라 이행할 책임이 있습니다.</li>
        </ol>
      </Section>

      <Section title="제8조 (구매 및 환불)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>구매자는 회사가 제공하는 결제 수단(신용카드, 체크카드 등)을 이용하여 콘텐츠를 구매할 수 있습니다.</li>
          <li>구매 완료 후 7일 이내에 콘텐츠를 사용하지 않은 경우 환불을 신청할 수 있습니다. 단, 디지털 콘텐츠의 특성상 콘텐츠를 1회 이상 실행한 경우 환불이 제한될 수 있습니다.</li>
          <li>환불 요청은 고객센터를 통해 접수하며, 처리 기간은 영업일 기준 3~5일 소요됩니다.</li>
          <li>구독형 서비스의 경우 구독 기간 중 해지 시 잔여 기간에 대한 환불은 회사 정책에 따릅니다.</li>
        </ol>
      </Section>

      <Section title="제9조 (금지 행위)">
        <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다.</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>서비스를 통해 제공받은 콘텐츠를 무단으로 복제·배포·수정·판매하는 행위</li>
          <li>서비스의 보안 체계(프록시, 난독화, 디바이스 바인딩 등)를 우회하거나 해제하려는 행위</li>
          <li>서비스에 악성 코드를 유포하거나 서버에 과부하를 가하는 행위</li>
          <li>타인의 개인정보를 무단으로 수집·이용하는 행위</li>
          <li>허위 리뷰 또는 평점을 생성하거나 조작하는 행위</li>
          <li>관련 법령에 위배되는 일체의 행위</li>
        </ol>
      </Section>

      <Section title="제10조 (지식재산권)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>서비스에 관한 저작권 및 지식재산권은 회사에 귀속됩니다.</li>
          <li>개발자 회원이 등록한 콘텐츠의 저작권은 해당 개발자에게 귀속됩니다. 단, 개발자는 회사에게 서비스 운영·홍보에 필요한 범위 내에서 비독점적 이용 권한을 부여합니다.</li>
          <li>이용자는 서비스를 이용함으로써 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용할 수 없습니다.</li>
        </ol>
      </Section>

      <Section title="제11조 (면책 조항)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>회사는 천재지변, 전쟁, 테러, 해킹, 서비스 설비 장애 등 불가항력적 사유로 인해 서비스를 제공하지 못한 경우 책임을 지지 않습니다.</li>
          <li>회사는 개발자 회원이 등록한 콘텐츠의 품질, 정확성, 적합성에 대하여 보증하지 않으며, 이로 인한 손해에 대하여 책임을 지지 않습니다.</li>
          <li>회사는 이용자 간 거래 과정에서 발생한 분쟁에 대하여 직접적인 책임을 지지 않습니다.</li>
          <li>회사의 손해배상 책임은 관련 법령이 허용하는 최대 범위 내에서 제한됩니다.</li>
        </ol>
      </Section>

      <Section title="제12조 (준거법 및 관할법원)">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>본 약관은 대한민국 법령에 따라 해석되고 적용됩니다.</li>
          <li>서비스 이용으로 발생한 분쟁에 대하여 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</li>
        </ol>
      </Section>

      <Section title="제13조 (고객센터)">
        <p>서비스 관련 문의사항은 아래 연락처로 접수하시기 바랍니다.</p>
        <ul className="mt-2 space-y-1 text-xs" style={{ color: '#aaa' }}>
          <li>이메일: support@plutos.app</li>
          <li>운영시간: 평일 09:00 – 18:00 (공휴일 제외)</li>
        </ul>
      </Section>

      <div className="pt-6 border-t flex items-center gap-4 text-xs" style={{ borderColor: '#2a1515', color: '#555' }}>
        <Link href="/legal/privacy" className="hover:text-zinc-300 transition-colors">개인정보처리방침</Link>
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
