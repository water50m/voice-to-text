
'use client';
import { CheckCircle, Loader2, AlertCircle, Download } from 'lucide-react';
import { AudioChunk } from '@/types/audio';

interface ChunkItemProps {
  chunk: AudioChunk;
  index: number;
  onTranscribe: (chunk: AudioChunk) => void;
  onUpdateText: (id: number, text: string) => void;
}

export default function ChunkItem({ chunk, index, onTranscribe, onUpdateText }: ChunkItemProps) {

    const sizeMB = (chunk.blob.size / (1024 * 1024)).toFixed(2);
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      chunk.status === 'done' ? 'bg-white border-green-200 shadow-sm' : 
      chunk.status === 'processing' ? 'bg-yellow-50 border-yellow-200' : 
      'bg-gray-100 border-gray-200 opacity-80'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <span>Part {index + 1}</span>

          <div className="text-xs font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded mt-1 inline-block">
               {chunk.timeDisplay}
            </div>
          <span className="text-sm font-normal text-gray-500">
            ({sizeMB} MB)
          </span>
          <a 
                href={chunk.url} 
                download={chunk.fileName || `part-${index+1}.mp3`} // บังคับใช้ชื่อที่เราตั้ง
                className="inline-flex items-center gap-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors cursor-pointer border border-gray-300"
                title="บันทึกไฟล์นี้ลงเครื่อง"
              >
                <Download size={10} />
                บันทึก MP3
              </a>
          {chunk.status === 'done' && <CheckCircle size={16} className="text-green-500" />}
          {chunk.status === 'processing' && <Loader2 size={16} className="text-yellow-600 animate-spin" />}
          {chunk.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
        </h3>
        <audio controls src={chunk.url} className="h-8 w-64" />
      </div>

      <div className="grid gap-2">
        <textarea
          value={chunk.text}
          onChange={(e) => onUpdateText(chunk.id, e.target.value)}
          placeholder={chunk.status === 'idle' ? "รอการถอดเสียง..." : "ข้อความจะปรากฏที่นี่..."}
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm"
          disabled={chunk.status === 'processing'}
        />
        <div className="flex justify-end">
          <button 
            onClick={() => onTranscribe(chunk)}
            disabled={chunk.status === 'processing'}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline disabled:text-gray-400"
          >
            {chunk.text ? 'ถอดเสียงใหม่อีกครั้ง' : 'ถอดเสียงเฉพาะส่วนนี้'}
          </button>
        </div>
      </div>
    </div>
  );
}