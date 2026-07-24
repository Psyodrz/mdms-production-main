/**
 * Next.js API route: Student actions (approve, block, unblock)
 *
 * PATCH /api/cms/students/[id]?action=approve|block|unblock
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

const TABLE = 'course_enrollments';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const supabase = createAdminClient();

    if (action === 'approve') {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data, message: 'Student approved and course unlocked' });
    }

    if (action === 'block') {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data, message: 'Student blocked' });
    }

    if (action === 'unblock') {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_blocked: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data, message: 'Student unblocked' });
    }

    return NextResponse.json({ error: 'Invalid action. Use ?action=approve|block|unblock' }, { status: 400 });
  } catch (e) {
    console.error('[StudentAPI] PATCH error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
