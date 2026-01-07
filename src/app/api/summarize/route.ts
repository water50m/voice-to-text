import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    // ✅ 1. รับค่า modelName มาจากหน้าบ้าน (ถ้าไม่ส่งมา ให้ใช้ค่า Default เป็น 2.5 Flash)
    const { text, modelName } = await req.json();

    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    // ✅ 2. ใช้ชื่อ Model ที่ส่งมา (หรือใช้ Default)
    const selectedModel = modelName || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: selectedModel });
    
    const prompt = `
    นี่คือข้อความที่ถอดจากเสียงภาษาไทย:
    "${text}"
    
    คำสั่ง:
    1. [Correct]: แก้ไขคำผิดตามบริบท (Contextual Correction)
    2. [Summarize]: สรุปใจความสำคัญเป็นข้อๆ (Bullet points)
    
    ข้อกำหนดเพิ่มเติม (Constraints):
    - ห้ามใช้ตัวหนา (**...**) ในผลลัพธ์
    - ห้ามใช้ตัวเอียง (*...*)
    - ขอแค่ตัวอักษรธรรมดาเท่านั้น
    - ใช้ขีดกลาง (-) สำหรับหัวข้อ

    ส่งคืนในรูปแบบ Markdown
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