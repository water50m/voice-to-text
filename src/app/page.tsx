'use client';

import { useTranscriber } from '@/hooks/useTranscriber'; // เรียกใช้ Hook ที่เราสร้าง
import FileUploader from '@/components/FileUploader';
import ControlPanel from '@/components/ControlPanel';
import ChunkItem from '@/components/ChunkItem';
import SummaryDisplay from '@/components/SummaryDisplay';
import ProcessingModal from '@/components/ProcessingModal';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const logic = useTranscriber();

  return (
    // 1. เปลี่ยน Container หลักเป็น Flexbox
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 2. ใส่ Sidebar ไว้ด้านซ้าย */}
      <Sidebar logic={logic} />

      {/* 3. เนื้อหาหลัก (Main Content) */}
      {/* flex-1 = กินพื้นที่ที่เหลือ, w-0 = trick ให้ text truncation ทำงานได้ใน flex */}
      <main className="flex-1 w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header เล็กๆ (เพราะ Title ใหญ่อยู่ใน Sidebar แล้ว) */}
            <header className="md:hidden mb-8 text-center mt-10">
               <h1 className="text-2xl font-bold text-gray-900">AI Transcriber</h1>
            </header>

            {/* ❌ ลบ div ตั้งค่าอันเก่าออกให้หมด เพราะย้ายไป Sidebar แล้ว */}

            {/* --- Content เดิม --- */}
            
            <ProcessingModal 
              isOpen={logic.isConverting}
              step={logic.conversionStep}
              progress={logic.conversionProgress}
            />

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
        </div>
      </main>
    </div>
  );
}