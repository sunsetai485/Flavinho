import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  let query = auth.supabase
    .from('transactions')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('date', { ascending: false });

  if (month && year) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0)
      .toISOString().split('T')[0];
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (year) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const body = await request.json();
  const { data, error } = await auth.supabase
    .from('transactions')
    .insert({ ...body, user_id: auth.user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const batch = searchParams.get('batch');

  if (batch) {
    const { error } = await auth.supabase
      .from('transactions')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('import_batch', batch);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: 'id or batch required' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
