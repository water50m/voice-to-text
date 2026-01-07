'use client';

import { useTranscriber } from '@/hooks/useTranscriber'; // เรียกใช้ Hook ที่เราสร้าง
import { Settings } from 'lucide-react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import ControlPanel from '@/components/ControlPanel';
import ChunkItem from '@/components/ChunkItem';
import SummaryDisplay from '@/components/SummaryDisplay';
import ChunkTable from '@/components/ChunkTable';

export default function Home() {
  // เรียกใช้สมองจาก Hook บรรทัดเดียวจบ!
  const logic = useTranscriber();

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Header />

        {/* Settings Bar */}
        <div className="flex justify-end items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
                <Settings size={18} />
                <span className="text-sm font-medium">ขนาดตัดแบ่ง (MB):</span>
            </div>
            <input 
                type="number" 
                value={logic.chunkSizeInput}
                onChange={logic.handleChunkSizeChange}
                onBlur={logic.handleChunkSizeBlur}
                step="0.5" 
                className="border border-gray-300 rounded px-2 py-1 w-20 text-center focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>

        <FileUploader 
          file={logic.file} 
          chunkCount={logic.chunks.length} 
          onFileSelect={logic.handleFileChange} 
        />

        <ControlPanel 
          hasChunks={logic.chunks.length > 0}
          isGlobalProcessing={logic.isGlobalProcessing}
          isSummarizing={logic.isSummarizing}
          canSummarize={logic.chunks.length > 0 && !logic.chunks.every(c => c.text === '')}
          totalChunks={logic.chunks.length}
          onRunAll={logic.runAllTranscribe}
          onSummarize={logic.runSummarize}
        />



        <div className="space-y-4">
          {logic.chunks.map((chunk, index) => (
            <ChunkItem 
              key={chunk.id} 
              chunk={chunk} 
              index={index} 
              onTranscribe={logic.transcribeChunk}
              onUpdateText={(id, text) => logic.updateChunk(id, { text })}
            />
          ))}
        </div>

        <SummaryDisplay summary={logic.summary} />

      </div>
    </main>
  );
}