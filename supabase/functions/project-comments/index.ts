import { getAdminClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'
import { getUserFromRequest } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const user = await getUserFromRequest(req)
    const adminSupabase = getAdminClient()

    const url = new URL(req.url)

    // 1. GET COMMENTS
    if (req.method === 'GET') {
      const projectId = url.searchParams.get('project_id') || url.searchParams.get('projectId')
      if (!projectId) return err('projectId is required')

      const { data, error } = await adminSupabase
        .from('Comment')
        .select('*, author:User(firstName, lastName, avatarUrl)')
        .eq('projectId', projectId)
        .order('createdAt', { ascending: true })

      if (error) throw error
      return ok(data)
    }

    // 2. POST COMMENT
    if (req.method === 'POST') {
      const body = await req.json()
      const projectId = body.projectId || url.searchParams.get('projectId')
      if (!projectId) return err('projectId is required')

      const { data, error } = await adminSupabase
        .from('Comment')
        .insert({
          projectId,
          authorId: user.id,
          content: body.content,
          timestampSec: body.timestampSec || null,
          versionId: body.versionId || null,
        })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    return err('Invalid method')
  } catch (error: any) {
    return err(error.message, 500)
  }
})
