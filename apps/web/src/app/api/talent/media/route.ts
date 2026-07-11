import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = `https://${process.env.SUPABASE_PROJECT_ID || 'dummy'}.supabase.co`;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-to-bypass-build-check-length-must-be-long';
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const talentId = formData.get('talentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!talentId) {
      return NextResponse.json({ error: 'No talentId provided' }, { status: 400 });
    }

    // Lazy load supabase client
    const supabase = getSupabase();

    // Convert file to array buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `talent/${talentId}/${fileName}`;

    // Upload to 'mdms' bucket
    const { data, error } = await supabase.storage
      .from('mdms')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('mdms')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filePath: filePath
    }, { status: 200 });

  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
