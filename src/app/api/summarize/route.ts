import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
    นี่คือข้อความที่ถอดจากเสียงภาษาไทย:
    "${text}"
    
    คำสั่ง:
    1. [Correct]: แก้ไขคำผิดตามบริบท (Contextual Correction)
    2. [Summarize]: สรุปใจความสำคัญเป็นข้อๆ (Bullet points)
    3. ส่งคืนในรูปแบบ Markdown
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Gemini Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}