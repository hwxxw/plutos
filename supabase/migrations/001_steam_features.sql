-- ============================================================
-- PLUTOS Steam-like Lock-in Features
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- ============================================================

-- 1. licenses 테이블 확장 (환불 추적)
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_usage_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- 2. users 테이블 확장
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS total_spent_krw INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS point_balance INTEGER DEFAULT 0;

-- 3. referrals 테이블
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',   -- pending / completed
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- 4. user_points 테이블 (거래 내역)
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,   -- referral_earn / referral_bonus / purchase_earn / checkout_use / admin
  description TEXT,
  reference_id UUID,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created ON user_points(created_at DESC);

-- 5. wishlists 테이블 (Phase 2 준비)
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- 6. 멤버십 등급 자동 계산 함수
CREATE OR REPLACE FUNCTION update_membership_tier(p_user_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_spent INTEGER; v_tier TEXT;
BEGIN
  SELECT COALESCE(total_spent_krw, 0) INTO v_spent FROM users WHERE id = p_user_id;
  IF v_spent >= 500000 THEN v_tier := 'platinum';
  ELSIF v_spent >= 200000 THEN v_tier := 'gold';
  ELSIF v_spent >= 50000  THEN v_tier := 'silver';
  ELSE v_tier := 'bronze';
  END IF;
  UPDATE users SET membership_tier = v_tier WHERE id = p_user_id;
END;
$$;

-- 7. 포인트 적립/차감 함수
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID, p_amount INTEGER, p_type TEXT,
  p_description TEXT DEFAULT NULL, p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE v_balance INTEGER;
BEGIN
  UPDATE users SET point_balance = GREATEST(0, point_balance + p_amount)
  WHERE id = p_user_id RETURNING point_balance INTO v_balance;
  INSERT INTO user_points(user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_balance);
  RETURN v_balance;
END;
$$;

-- 8. 추천 코드 자동 생성 트리거
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'PLT-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON users;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- 기존 유저 추천 코드 생성
UPDATE users SET
  referral_code = 'PLT-' || UPPER(SUBSTRING(MD5(id::TEXT), 1, 6))
WHERE referral_code IS NULL;

-- 9. RLS 정책
ALTER TABLE referrals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists   ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "referrals_own"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY IF NOT EXISTS "user_points_own"
  ON user_points FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "wishlists_own"
  ON wishlists FOR ALL USING (user_id = auth.uid());

-- 10. WebAuthn 테이블
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  raw_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webauthn_creds_user ON webauthn_credentials(user_id);

ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "webauthn_challenges_own"
  ON webauthn_challenges FOR ALL USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "webauthn_credentials_own"
  ON webauthn_credentials FOR SELECT USING (user_id = auth.uid());

-- 11. FDS (Fraud Detection) 테이블
CREATE TABLE IF NOT EXISTS fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  fingerprint_hash TEXT NOT NULL,
  ip TEXT,
  ua TEXT, screen TEXT, timezone TEXT, language TEXT,
  platform TEXT, memory INTEGER, cores INTEGER, canvas_hash TEXT,
  context TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_hash ON fraud_signals(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_user ON fraud_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_created ON fraud_signals(created_at DESC);

-- 12. 구매 후 total_spent_krw 업데이트 + 멤버십 자동 재계산
CREATE OR REPLACE FUNCTION update_membership_tier_after_purchase(
  p_user_id UUID, p_amount INTEGER
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users SET total_spent_krw = COALESCE(total_spent_krw, 0) + p_amount WHERE id = p_user_id;
  PERFORM update_membership_tier(p_user_id);
END;
$$;

-- 13. reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "reviews_public_read"
  ON reviews FOR SELECT
  USING (is_hidden = false);

CREATE POLICY IF NOT EXISTS "reviews_own_insert"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "reviews_own_update"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

-- 14. 앱 평점 재계산 함수
CREATE OR REPLACE FUNCTION recalc_app_rating(p_app_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_avg  NUMERIC;
  v_cnt  INTEGER;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COALESCE(COUNT(*), 0)
  INTO v_avg, v_cnt
  FROM reviews
  WHERE app_id = p_app_id AND is_hidden = false;

  UPDATE apps SET rating_avg = v_avg, rating_count = v_cnt WHERE id = p_app_id;
END;
$$;

-- 15. 리뷰 삽입 시 자동 평점 갱신 트리거
CREATE OR REPLACE FUNCTION trg_recalc_rating_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM recalc_app_rating(COALESCE(NEW.app_id, OLD.app_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_rating ON reviews;
CREATE TRIGGER trg_recalc_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_recalc_rating_fn();

-- ============================================================
-- 16. 성능 인덱스 (쿼리 최적화 핵심)
-- ============================================================

-- licenses: 가장 빈번한 조회 패턴
CREATE INDEX IF NOT EXISTS idx_licenses_user_app_status
  ON licenses(user_id, app_id, status);

CREATE INDEX IF NOT EXISTS idx_licenses_payment_intent
  ON licenses(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_licenses_user_active
  ON licenses(user_id, status) WHERE status = 'active';

-- app_tiers: checkout/upgrade 시 빈번 조회
CREATE INDEX IF NOT EXISTS idx_app_tiers_app_tier_active
  ON app_tiers(app_id, tier, is_active);

-- reviews: 앱 상세 페이지 조회
CREATE INDEX IF NOT EXISTS idx_reviews_app_hidden
  ON reviews(app_id, is_hidden, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_app
  ON reviews(user_id, app_id);

-- license_seats: 팀 관리
CREATE INDEX IF NOT EXISTS idx_license_seats_license_status
  ON license_seats(license_id, status);

CREATE INDEX IF NOT EXISTS idx_license_seats_token
  ON license_seats(invite_token) WHERE invite_token IS NOT NULL;

-- users: referral_code 조회 (이미 UNIQUE이지만 명시)
CREATE INDEX IF NOT EXISTS idx_users_referral_code
  ON users(referral_code) WHERE referral_code IS NOT NULL;

-- referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referred
  ON referrals(referred_id, status);

-- platform_events: 관리자 대시보드
CREATE INDEX IF NOT EXISTS idx_platform_events_type_created
  ON platform_events(event_type, created_at DESC);

-- apps: 홈페이지 정렬
CREATE INDEX IF NOT EXISTS idx_apps_featured_sales
  ON apps(is_featured DESC, total_sales DESC) WHERE status = 'active';

-- ============================================================
-- 완료. 이제 Vercel에서 API/UI를 배포하세요.
-- ============================================================
