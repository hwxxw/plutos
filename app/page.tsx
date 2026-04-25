import { createClient } from '@/lib/supabase/server';
import { HomepageClient } from '@/components/HomepageClient';
import { ScrollFadeIn } from '@/components/ScrollFadeIn';
import { AboutSection } from '@/components/AboutSection';
import { HeroText } from '@/components/HeroText';
import { DevAdBanner } from '@/components/DevAdBanner';
import type { PublicApp } from '@/lib/supabase/types';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const { data: apps } = await supabase
    .from('apps_public')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('total_sales', { ascending: false })
    .limit(60);

  const { data: adApps } = await supabase
    .from('apps_public')
    .select('id, name, tagline, icon_url, slug, min_price_krw')
    .order('total_sales', { ascending: false })
    .limit(14);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="pt-10 pb-2 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(100,0,0,0.2) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <HeroText />
        </div>
      </section>

      {/* Interactive client section */}
      <ScrollFadeIn delay={100}>
        <HomepageClient apps={(apps || []) as PublicApp[]} />
      </ScrollFadeIn>

      {/* 광고 배너 — 소개 섹션 위 */}
      <DevAdBanner apps={(adApps || []) as any[]} />

      {/* 소개 섹션 — 스크롤하면 바로 보임 */}
      <AboutSection />
    </div>
  );
}
