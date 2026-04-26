export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: userRow } = await supabase
      .from('users')
      .select('role, is_pro')
      .eq('id', user.id)
      .maybeSingle();

    if (!userRow || userRow.role !== 'developer') {
      return NextResponse.json({ error: 'not_a_developer' }, { status: 403 });
    }

    if (!userRow.is_pro) {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 });
    }

    const { data: customers, error } = await supabase
      .from('developer_customers')
      .select('*')
      .eq('developer_id', user.id)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    const headers = [
      'email', 'name', 'app_name', 'tier',
      'amount_krw', 'purchased_at', 'review_rating',
    ];

    const rows = (customers || []).map((c: any) => [
      c.customer_email,
      c.customer_name ?? '',
      c.app_name,
      c.tier,
      c.amount_paid_krw,
      new Date(c.purchased_at).toISOString().slice(0, 10),
      c.review_rating ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n');

    const filename = `customers_${new Date().toISOString().slice(0, 10)}.csv`;

    const BOM = '﻿';
    return new NextResponse(BOM + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[customers export] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'server_error' },
      { status: 500 }
    );
  }
}
