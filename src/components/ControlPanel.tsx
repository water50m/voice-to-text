
'use client';
import { Play, CheckCircle, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  hasChunks: boolean;
  isGlobalProcessing: boolean;
  isSummarizing: boolean;
  canSummarize: boolean;
  onRunAll: () => void;
  onSummarize: () => void;
  totalChunks: number;
}

export default function ControlPanel({
  hasChunks,
  isGlobalProcessing,
  isSummarizing,
  canSummarize,
  onRunAll,
  onSummarize,
  totalChunks
}: ControlPanelProps) {
  if (!hasChunks) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        onClick={onRunAll}
        disabled={isGlobalProcessing}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isGlobalProcessing ? <Loader2 className="animate-spin" /> : <Play size={20} />}
        เริ่มถอดเสียงทั้งหมด ({totalChunks} ส่วน)
      </button>
      
      <button
        onClick={onSummarize}
        disabled={isSummarizing || !canSummarize}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isSummarizing ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
        สรุปใจความสำคัญ (Gemini)
      </button>
    </div>
  );
}