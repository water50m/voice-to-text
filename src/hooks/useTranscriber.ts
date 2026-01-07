import { useState, useRef, useEffect } from 'react';
import { AudioChunk } from '@/types/audio';

export function useTranscriber() {
  // --- 1. State ทั้งหมด ---
  const [file, setFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<AudioChunk[]>([]);
  const [summary, setSummary] = useState<string>('');

  const [chunkSizeInput, setChunkSizeInput] = useState<string>('10'); 
  const [chunkSizeMB, setChunkSizeMB] = useState<number>(2);

  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);
  
  

  // --- 2. Helper Functions ---
  useEffect(() => {
    return () => clearOldChunks();
  }, []);

  const clearOldChunks = () => {
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setChunks([]); // อย่าลืม reset chunks ใน state ด้วยถ้าจำเป็น แต่ใน logic นี้เดี๋ยวถูกทับ
  };

  const createChunks = (sourceFile: File, sizeMB: number) => {
    const sizeBytes = Math.floor(sizeMB * 1024 * 1024);
    if (sizeBytes <= 0) return;

    const newChunks: AudioChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < sourceFile.size) {
      const end = Math.min(start + sizeBytes, sourceFile.size);
      const chunkBlob = sourceFile.slice(start, end, sourceFile.type);
      const audioUrl = URL.createObjectURL(chunkBlob);
      objectUrlsRef.current.push(audioUrl);

      newChunks.push({ id: index, blob: chunkBlob, url: audioUrl, text: '', status: 'idle' });
      start = end;
      index++;
    }
    setChunks(newChunks);
  };

  // --- 3. Actions ที่ Page จะเรียกใช้ ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      clearOldChunks();
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      createChunks(selectedFile, chunkSizeMB);
      setSummary('');
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
    formData.append('file', chunk.blob, `chunk_${chunk.id}.mp3`);

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
        body: JSON.stringify({ text: fullText }),
      });
      setSummary((await res.json()).summary);
    } catch {
      setSummary('Error summarizing');
    } finally {
      setIsSummarizing(false);
    }
  };

  // ส่งค่าออกไปให้ page.tsx ใช้
  return {
    file, chunks, summary, chunkSizeMB,
    isGlobalProcessing, isSummarizing, chunkSizeInput,
    handleFileChange, handleChunkSizeChange, handleChunkSizeBlur,
    transcribeChunk, updateChunk, runAllTranscribe, runSummarize
  };
}