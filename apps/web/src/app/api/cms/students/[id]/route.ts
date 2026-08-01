/**
 * Next.js API route: Student actions (approve, block, unblock)
 *
 * PATCH /api/cms/students/[id]?action=approve|block|unblock
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/cms/server/guard';

const TABLE = 'course_enrollments';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Approve / block / unblock a student enrollment — admins only.
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const updates: Record<string, { patch: Record<string, unknown>; message: string }> = {
      approve: { patch: { status: 'APPROVED' }, message: 'Student approved and course unlocked' },
      block: { patch: { is_blocked: true }, message: 'Student blocked' },
      unblock: { patch: { is_blocked: false }, message: 'Student unblocked' },
    };

    const op = action ? updates[action] : undefined;
    if (!op) {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=approve|block|unblock' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...op.patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Never fake success — surface the real failure so the admin UI can react.
      console.error('[StudentAPI] PATCH action failed:', error.message);
      return NextResponse.json({ error: error.message || 'Action failed' }, { status: 502 });
    }
    return NextResponse.json({ data, message: op.message });
  } catch (e) {
    console.error('[StudentAPI] PATCH error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Action failed' },
      { status: 500 },
    );
  }
}
