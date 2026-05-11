import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Whisper accepts: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
const ALLOWED_TYPES = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/mp4',
]);

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: key });
}

export async function POST(req: Request) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Request must be multipart/form-data' }, { status: 400 });
    }

    const file = form.get('audio');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio field in form data' }, { status: 400 });
    }

    const mimeBase = file.type.split(';')[0].trim();
    if (file.type && !ALLOWED_TYPES.has(file.type) && !ALLOWED_TYPES.has(mimeBase)) {
      return NextResponse.json({ error: `Unsupported audio type: ${file.type}` }, { status: 415 });
    }

    // Determine a sensible filename extension for Whisper — it uses it to pick the decoder
    const ext = file.type.includes('webm') ? 'webm'
               : file.type.includes('ogg')  ? 'ogg'
               : file.type.includes('wav')  ? 'wav'
               : file.type.includes('mp4')  ? 'mp4'
               : 'mp3';

    const buffer = Buffer.from(await file.arrayBuffer());
    const whisperFile = new File([buffer], `dump.${ext}`, { type: file.type || 'audio/webm' });

    const openai = getOpenAI();
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: whisperFile,
    });

    const text = transcription.text.trim();
    if (!text) {
      return NextResponse.json({ error: 'Whisper returned empty transcription' }, { status: 422 });
    }

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('morning_dumps')
      .insert({ transcription: text })
      .select('id, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id, transcription: text, created_at: data.created_at });
  } catch (err: any) {
    const status = err.status ?? 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
