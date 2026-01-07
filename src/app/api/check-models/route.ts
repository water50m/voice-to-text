import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY; // ใช้ Key เดิมที่มีใน .env.local

  if (!apiKey) {
    return NextResponse.json({ error: 'No API Key found' }, { status: 500 });
  }

  // ยิงไปที่ Endpoint มาตรฐานของ Google เพื่อขอดู list models
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // กรองเอาเฉพาะชื่อ model และ version มาแสดงให้อ่านง่ายๆ
    const models = data.models?.map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      inputTokenLimit: m.inputTokenLimit,
      outputTokenLimit: m.outputTokenLimit
    })) || [];

    return NextResponse.json({ count: models.length, models });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}