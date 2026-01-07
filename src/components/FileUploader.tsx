
'use client';
import { Upload, FileAudio } from 'lucide-react';

interface FileUploaderProps {
  file: File | null;
  chunkCount: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploader({ file, chunkCount, onFileSelect }: FileUploaderProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
      <label className="cursor-pointer flex flex-col items-center gap-2">
        <div className="bg-blue-50 p-4 rounded-full text-blue-600">
          <Upload size={32} />
        </div>
        <span className="font-medium text-lg">คลิกเพื่อเลือกไฟล์เสียง</span>
        <span className="text-sm text-gray-400">รองรับไฟล์ใหญ่ (ระบบจะตัดแบ่งอัตโนมัติ)</span>
        <input 
          type="file" 
          accept="audio/*" 
          onChange={onFileSelect} 
          className="hidden" 
        />
      </label>
      {file && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg inline-flex items-center gap-2">
          <FileAudio size={20} />
          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          <span className="bg-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
            แบ่งได้ {chunkCount} ส่วน
          </span>
        </div>
      )}
    </div>
  );
}