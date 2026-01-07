import { useState, useRef, useEffect } from 'react';
import { AudioChunk } from '@/types/audio';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const removeId3Tag = async (blob: Blob): Promise<Blob> => {
  // อ่าน 10 bytes แรกเพื่อดูว่าเป็น ID3 หรือไม่
  const header = new Uint8Array(await blob.slice(0, 10).arrayBuffer());
  
  // เช็คว่าขึ้นต้นด้วย 'I', 'D', '3' หรือไม่ (ASCII: 73, 68, 51)
  // ถ้าไม่ใช่ แสดงว่าไม่มีป้ายชื่อ ก็ส่งไฟล์เดิมกลับไป
  if (header[0] !== 73 || header[1] !== 68 || header[2] !== 51) {
    return blob;
  }

  // ถ้าใช่ ให้คำนวณขนาดของป้ายชื่อ (Logic ของ ID3v2 Size)
  // (Format: 4 bytes สุดท้ายของ header คือ size แบบ synchsafe integer)
  const tagSize = (header[6] << 21) | (header[7] << 14) | (header[8] << 7) | header[9];
  
  // ขนาด header จริง = 10 bytes แรก + ขนาดข้อมูลใน tag
  const totalHeaderSize = 10 + tagSize;

  console.log(`✂️ ตัด Metadata ออก: ${totalHeaderSize} bytes`);

  // เฉือนส่วนหัวทิ้ง ส่งคืนเฉพาะเนื้อหาเสียง
  return blob.slice(totalHeaderSize, blob.size, blob.type);
};

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  // ถ้ามีชั่วโมงให้โชว์ H:MM:SS ถ้าไม่มีเอาแค่ MM:SS
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  // ฟังก์ชันช่วยหาความยาวเสียงจริง (Duration) จาก Blob
const getBlobDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url); // ใช้เสร็จลบทิ้งทันที
      resolve(audio.duration || 0);
    };
    audio.onerror = () => resolve(0); // กัน Error
  });
};


export function useTranscriber() {
  // --- 1. State ทั้งหมด ---
  const [file, setFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<AudioChunk[]>([]);
  const [summary, setSummary] = useState<string>('');

  const [chunkSizeInput, setChunkSizeInput] = useState<string>('10'); 
  const [chunkSizeMB, setChunkSizeMB] = useState<number>(10);

  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  
  
  const [isConverting, setIsConverting] = useState(false); // เปิด/ปิด Modal
  const [conversionStep, setConversionStep] = useState<'converting' | 'chunking' | 'idle'>('idle');
  const [conversionProgress, setConversionProgress] = useState(0);


  const [modelName, setModelName] = useState<string>('gemini-2.5-flash');

  const objectUrlsRef = useRef<string[]>([]);
  const ffmpegRef = useRef<FFmpeg | null>(null); // เก็บ Instance ของ FFmpeg

  // --- 2. Helper Functions ---
  useEffect(() => {
    return () => clearOldChunks();
  }, []);

  const clearOldChunks = () => {
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setChunks([]); // อย่าลืม reset chunks ใน state ด้วยถ้าจำเป็น แต่ใน logic นี้เดี๋ยวถูกทับ
  };

  const createChunks = async (sourceFile: File, sizeMB: number) => {
    const sizeBytes = Math.floor(sizeMB * 1024 * 1024);
    if (sizeBytes <= 0) return;

    const newChunks: AudioChunk[] = [];
    let start = 0;
    let index = 0;
    let accumulatedTime = 0;

    while (start < sourceFile.size) {
      const end = Math.min(start + sizeBytes, sourceFile.size);
      let chunkBlob = sourceFile.slice(start, end, sourceFile.type);




      const duration = await getBlobDuration(chunkBlob);
      const startTime = accumulatedTime;
      const endTime = accumulatedTime + duration;
      const fileNameTime = `${formatTime(startTime).replace(/:/g, '-')} - ${formatTime(endTime).replace(/:/g, '-')}.mp3`;

      const audioUrl = URL.createObjectURL(chunkBlob);
      objectUrlsRef.current.push(audioUrl);

     newChunks.push({
        id: index,
        blob: chunkBlob,
        url: audioUrl,
        text: '',
        status: 'idle',
        // ✅ เก็บข้อมูลเวลาไว้โชว์หรือใช้ตั้งชื่อ
        fileName: fileNameTime, 
        timeDisplay: `${formatTime(startTime)} - ${formatTime(endTime)}`
      });
      accumulatedTime = endTime;
      start = end;
      index++;
      setConversionProgress((start / sourceFile.size) * 100);
    }
    setChunks(newChunks);
  };

  // --- 3. Actions ที่ Page จะเรียกใช้ ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChunkSizeInput(e.target.value);
  };

  const handleChunkSizeBlur = () => {
    let val = parseFloat(chunkSizeInput);
    if (isNaN(val) || val < 2) val = 2; // ถ้าค่าเพี้ยน ให้กลับมาเป็น 2
    
    setChunkSizeInput(val.toString()); // จัด format ให้สวยงาม
    setChunkSizeMB(val); // อัปเดตตัวแปร Number เพื่อไปใช้คำนวณ

    // สั่งตัดไฟล์ใหม่ (ถ้ามีไฟล์ค้างอยู่)
    if (file) {
      clearOldChunks();
      createChunks(file, val);
    }
  };

  const updateChunk = (id: number, updates: Partial<AudioChunk>) => {
    setChunks(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const transcribeChunk = async (chunk: AudioChunk) => {
    updateChunk(chunk.id, { status: 'processing' });
    const formData = new FormData();
    formData.append('file', chunk.blob, chunk.fileName);

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      updateChunk(chunk.id, { text: data.text, status: 'done' });
    } catch (error) {
      updateChunk(chunk.id, { status: 'error' });
    }
  };

  const runAllTranscribe = async () => {
    setIsGlobalProcessing(true);
    for (const chunk of chunks) {
      if (chunk.status !== 'done') await transcribeChunk(chunk);
    }
    setIsGlobalProcessing(false);
  };

  const runSummarize = async () => {
    const fullText = chunks.map(c => c.text).join(' ');
    if (!fullText.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, modelName: modelName }),
      });
      setSummary((await res.json()).summary);
    } catch {
      setSummary('Error summarizing');
    } finally {
      setIsSummarizing(false);
    }
  };

  const loadFFmpeg = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) return;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  };

  const processFile = async (inputFile: File) => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    clearOldChunks();
    setFile(inputFile); // โชว์ชื่อไฟล์ต้นฉบับไปก่อน
    setSummary('');
    
    // เปิด Popup
    setIsConverting(true);
    setConversionProgress(0);

    let audioFileToChunk = inputFile;

    // 1. ถ้าเป็น Video ให้แปลงเป็น Audio ก่อน
    if (inputFile.type.startsWith('video/')) {
      setConversionStep('converting');
      try {
        await loadFFmpeg();
        const ffmpeg = ffmpegRef.current;

        // Event จับ Progress การแปลง
        ffmpeg.on('progress', ({ progress }) => {
          setConversionProgress(progress * 100);
        });

        // เขียนไฟล์ลง Virtual File System
        await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile));

        // สั่งแปลง (แยกเสียงออกมาเป็น mp3)
        // -vn = ไม่เอาภาพ, -acodec libmp3lame = แปลงเป็น mp3, -q:a 4 = คุณภาพกลางๆ (ไฟล์เล็ก)
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-vn',                  // ไม่เอาภาพ
          '-acodec', 'libmp3lame',// ใช้ตัวแปลง MP3
          '-q:a', '4',            // คุณภาพกลางๆ
          '-write_xing', '0',     // 👈 [สำคัญ] ห้ามเขียนสารบัญความยาว (VBR Header)
          '-id3v2_version', '0',  // 👈 ห้ามใส่ ID3 Tag
          'output.mp3'
        ]);

        // อ่านไฟล์ผลลัพธ์
        const data = await ffmpeg.readFile('output.mp3');
        
        // สร้าง File Object ใหม่จากข้อมูลที่แปลงแล้ว
        const mp3Blob = new Blob([data as any], { type: 'audio/mp3' });
        audioFileToChunk = new File([mp3Blob], `${inputFile.name.split('.')[0]}.mp3`, { type: 'audio/mp3' });
        
        // ล้างไฟล์ใน Memory ของ FFmpeg ทิ้ง (ประหยัด RAM)
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('output.mp3');

      } catch (error) {
        console.error("Conversion Error:", error);
        alert("ไม่สามารถแปลงไฟล์วิดีโอได้ กรุณาลองใหม่");
        setIsConverting(false);
        return;
      }
    }
    setConversionStep('chunking');
    setConversionProgress(0); // รีเซ็ตหลอด
    
    // เรียกใช้ฟังก์ชันตัดไฟล์ (ต้องปรับแก้ createChunks ให้รองรับ async หรือ callback progress เล็กน้อยถ้าอยากได้หลอดแม่นๆ)
    // แต่ในที่นี้เราจะเรียกแบบ Synchronous เร็วๆ
    await createChunks(audioFileToChunk, chunkSizeMB);
    
    // เสร็จสิ้น ปิด Popup
    setConversionProgress(100);
    setTimeout(() => {
      setIsConverting(false);
      setConversionStep('idle');
    }, 500);
  };
  
  
    // ส่งค่าออกไปให้ page.tsx ใช้
  return {
    file, chunks, summary, chunkSizeMB, 
    isGlobalProcessing, isSummarizing, chunkSizeInput,
    isConverting, conversionStep, conversionProgress,
    handleFileChange, handleChunkSizeChange, handleChunkSizeBlur,
    transcribeChunk, updateChunk, runAllTranscribe, runSummarize,
    modelName, setModelName,
    
  };
}