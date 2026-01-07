
'use client';

interface SummaryDisplayProps {
  summary: string;
}

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
  if (!summary) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">✨</span> บทสรุปจาก AI
      </h2>
      <div className="prose prose-emerald max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
          {summary}
        </pre>
      </div>
    </div>
  );
}