'use client';

import { AudioChunk } from '@/types/audio';
import { CheckCircle, Loader2, AlertCircle, PlayCircle } from 'lucide-react';

interface ChunkTableProps {
  chunks: AudioChunk[];
  onTranscribe: (chunk: AudioChunk) => void;
  onUpdateText: (id: number, text: string) => void;
}

export default function ChunkTable({ chunks, onTranscribe, onUpdateText }: ChunkTableProps) {
  if (chunks.length === 0) return null;

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold w-24"># Part</th>
            <th className="p-4 font-semibold w-32">Status</th>
            <th className="p-4 font-semibold w-64">Audio</th>
            <th className="p-4 font-semibold">Transcription</th>
            <th className="p-4 font-semibold w-32 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {chunks.map((chunk, index) => {
            const sizeMB = (chunk.blob.size / (1024 * 1024)).toFixed(2);
            
            return (
              <tr key={chunk.id} className="hover:bg-gray-50 transition-colors">
                {/* 1. Part ID & Size */}
                <td className="p-4 align-top">
                  <div className="font-bold text-gray-700">Part {index + 1}</div>
                  <div className="text-xs font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded mt-1 inline-block">
                    {chunk.timeDisplay}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">{sizeMB} MB</div>
                </td>

                {/* 2. Status */}
                <td className="p-4 align-top">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    chunk.status === 'done' ? 'bg-green-100 text-green-700' :
                    chunk.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    chunk.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {chunk.status === 'done' && <CheckCircle size={12} />}
                    {chunk.status === 'processing' && <Loader2 size={12} className="animate-spin" />}
                    {chunk.status === 'error' && <AlertCircle size={12} />}
                    {chunk.status.toUpperCase()}
                  </div>
                </td>

                {/* 3. Audio Player */}
                <td className="p-4 align-top">
                  <audio 
                    controls 
                    src={chunk.url} 
                    className="w-full h-8 min-w-[200px]" 
                  />
                </td>

                {/* 4. Textarea (Editable) */}
                <td className="p-4 align-top">
                  <textarea
                    value={chunk.text}
                    onChange={(e) => onUpdateText(chunk.id, e.target.value)}
                    placeholder={chunk.status === 'processing' ? "กำลังถอดเสียง..." : "ข้อความจะปรากฏที่นี่..."}
                    className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y min-h-[80px] ${
                       chunk.status === 'processing' ? 'bg-gray-50 text-gray-400' : 'border-gray-300'
                    }`}
                    disabled={chunk.status === 'processing'}
                  />
                </td>

                {/* 5. Action Button */}
                <td className="p-4 align-top text-center">
                  <button
                    onClick={() => onTranscribe(chunk)}
                    disabled={chunk.status === 'processing'}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Transcribe this part"
                  >
                    <PlayCircle size={24} />
                  </button>
                  <div className="text-[10px] text-gray-400 mt-1">Run</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}