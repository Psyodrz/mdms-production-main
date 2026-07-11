import { corsHeaders } from './cors.ts'

export function ok(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

export function err(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

export function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}
