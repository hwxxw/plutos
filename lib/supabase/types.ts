// ============================================================
// DB 타입 v5.0 (완전판 - 모든 테이블/뷰)
// ============================================================

export type AppCategory =
  | 'writing' | 'data' | 'automation' | 'design'
  | 'learning' | 'business' | 'marketing' | 'dev';

export type AppStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type UserRole = 'buyer' | 'developer' | 'admin';
export type LicenseStatus = 'active' | 'refunded' | 'disputed' | 'upgraded';
export type TierName = 'basic' | 'plus' | 'business';
export type SeatStatus = 'pending' | 'accepted' | 'removed';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  stripe_connect_id: string | null;
  stripe_connect_enabled: boolean;
  is_pro: boolean;
  pro_subscription_id: string | null;
  pro_expires_at: string | null;
  allow_dev_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export interface App {
  id: string;
  developer_id: string;
  name: string;
  short_name: string;
  slug: string;
  description: string;
  tagline: string | null;
  origin_url: string;
  icon_url: string;
  screenshots: unknown;
  theme_color: string;
  category: AppCategory;
  status: AppStatus;
  virustotal_scan_id: string | null;
  virustotal_verdict: 'clean' | 'suspicious' | 'malicious' | null;
  virustotal_scanned_at: string | null;
  total_sales: number;
  total_revenue_krw: number;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  is_featured: boolean;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AppTier {
  id: string;
  app_id: string;
  tier: TierName;
  price_krw: number;
  price_usd: number;
  max_seats: number;
  features: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppTag {
  app_id: string;
  tag: string;
}

export interface PublicApp {
  id: string;
  developer_id: string;
  name: string;
  short_name: string;
  slug: string;
  description: string;
  tagline: string | null;
  icon_url: string;
  screenshots: unknown;
  theme_color: string;
  category: AppCategory;
  min_price_krw: number;
  min_price_usd: number;
  tier_count: number;
  total_sales: number;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  featured_until: string | null;
  developer_name: string | null;
  developer_is_pro: boolean;
  created_at: string;
  published_at: string | null;
}

export interface License {
  id: string;
  user_id: string;
  app_id: string;
  tier: TierName;
  tier_id: string;
  max_seats: number;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string | null;
  amount_paid_krw: number;
  platform_fee_rate: number;
  platform_fee_amount: number;
  stripe_fee_amount: number;
  developer_payout: number;
  escrow_release_at: string;
  is_settled: boolean;
  settled_at: string | null;
  status: LicenseStatus;
  refund_reason: string | null;
  upgraded_from_license_id: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  purchased_at: string;
}

export interface LicenseSeat {
  id: string;
  license_id: string;
  user_id: string | null;
  invited_email: string;
  invite_token: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: SeatStatus;
}

export interface LicenseUpgrade {
  id: string;
  original_license_id: string;
  new_license_id: string;
  from_tier: TierName;
  to_tier: TierName;
  price_diff_krw: number;
  stripe_payment_intent_id: string;
  upgraded_at: string;
}

export interface Review {
  id: string;
  license_id: string;
  user_id: string;
  app_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  reviewer_tier: TierName | null;
  helpful_count: number;
  reported_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeaturedSlot {
  id: string;
  app_id: string;
  slot_type: 'home_main' | 'category_top' | 'new_top';
  slot_category: string | null;
  bid_amount_krw: number;
  starts_at: string;
  ends_at: string;
  stripe_payment_intent_id: string;
  is_active: boolean;
  created_at: string;
}

export interface FraudEvent {
  id: string;
  user_id: string | null;
  license_id: string | null;
  event_type: string;
  severity: 'low' | 'medium' | 'high';
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  action_taken: string | null;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  license_id: string;
  ip_address: string;
  user_agent: string | null;
  last_seen_at: string;
  created_at: string;
}

export interface PlatformEvent {
  id: string;
  actor_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: unknown;
  created_at: string;
}

export interface DeveloperCustomer {
  app_id: string;
  app_name: string;
  developer_id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string | null;
  tier: TierName;
  amount_paid_krw: number;
  purchased_at: string;
  marketing_consent: boolean;
  review_rating: number | null;
  review_at: string | null;
}

type Row<T> = {
  Row: T;
  Insert: Partial<T> & Record<string, any>;
  Update: Partial<T> & Record<string, any>;
  Relationships: [];
};

type ViewRow<T> = {
  Row: T;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users:             Row<User>;
      apps:              Row<App>;
      app_tiers:         Row<AppTier>;
      app_tags:          Row<AppTag>;
      licenses:          Row<License>;
      license_seats:     Row<LicenseSeat>;
      license_upgrades:  Row<LicenseUpgrade>;
      reviews:           Row<Review>;
      featured_slots:    Row<FeaturedSlot>;
      fraud_events:      Row<FraudEvent>;
      active_sessions:   Row<ActiveSession>;
      platform_events:   Row<PlatformEvent>;
    };
    Views: {
      apps_public:         ViewRow<PublicApp>;
      developer_customers: ViewRow<DeveloperCustomer>;
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─── 티어 메타데이터 ──────────────────────────────
export const TIER_INFO: Record<TierName, {
  label: string;
  description: string;
  color: string;
  minPrice: number;
  maxPrice: number;
  seats: number | number[];
}> = {
  basic: {
    label: 'Basic',
    description: '개인용 · 핵심 기능',
    color: '#64748b',
    minPrice: 4900,
    maxPrice: 14900,
    seats: 1,
  },
  plus: {
    label: 'Plus',
    description: '파워유저 · 전체 기능',
    color: '#6366f1',
    minPrice: 19900,
    maxPrice: 79900,
    seats: 1,
  },
  business: {
    label: 'Business',
    description: '팀 공유 · 관리 도구',
    color: '#f59e0b',
    minPrice: 79000,
    maxPrice: 499000,
    seats: [5, 10, 20],
  },
};

export const TIER_ORDER: TierName[] = ['basic', 'plus', 'business'];
