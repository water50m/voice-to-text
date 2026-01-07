import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File; // Cast Type เป็น File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ส่งไฟล์ไป Groq Whisper Large V3
    const transcription = await groq.audio.transcriptions.create({
      file: file, // Groq SDK รองรับ File object จาก Web API โดยตรง
      model: 'whisper-large-v3',
      language: 'th',
      response_format: 'json',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}