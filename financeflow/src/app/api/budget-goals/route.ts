import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const { data, error } = await auth.supabase
    .from('budget_goals')
    .select('*')
    .eq('user_id', auth.user.id)
    .eq('is_active', true)
    .order('category_name');

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
    .from('budget_goals')
    .upsert(
      {
        user_id: auth.user.id,
        category_name: body.category_name,
        monthly_limit: body.monthly_limit,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,category_name' }
    )
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
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('budget_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
