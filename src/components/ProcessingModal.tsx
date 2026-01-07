'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  step: 'converting' | 'chunking' | 'idle';
  progress: number; // 0 - 100
}

export default function ProcessingModal({ isOpen, step, progress }: ProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
        
        {/* Icon Animation */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-600 relative">
            <Loader2 size={32} className="animate-spin" />
          </div>
        </div>

        {/* Text Status */}
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {step === 'converting' ? 'กำลังแปลงวิดีโอเป็นเสียง...' : 'กำลังตัดแบ่งไฟล์...'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            กรุณาอย่าปิดหน้านี้ (ประมวลผลบนเครื่องของคุณ)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs font-mono text-gray-400 text-right">{Math.round(progress)}%</p>

      </div>
    </div>
  );
}