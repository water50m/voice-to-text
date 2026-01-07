'use client';

import { useState } from 'react';
import { Settings, Bot, Menu, X, FileAudio, BarChart3 } from 'lucide-react';

interface SidebarProps {
  logic: any; // รับ logic ทั้งก้อนมาจาก useTranscriber
}

export default function Sidebar({ logic }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. ปุ่มเปิดเมนู (Mobile Only) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <Menu size={24} />
      </button>

      {/* 2. Background Overlay (Mobile Only) - กดที่ว่างเพื่อปิด */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 3. ตัว Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen md:shadow-none
      `}>
        
        {/* --- Header --- */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
             <FileAudio size={28} />
             <h1 className="text-xl font-bold tracking-tight">AI Transcriber</h1>
          </div>
          {/* ปุ่มปิด (Mobile Only) */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* --- Content Scrollable --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Group 1: การตั้งค่าไฟล์ */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Configuration
            </h3>
            
            <div className="space-y-5">
              
              {/* ⚙️ Chunk Size Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Settings size={16} />
                  ขนาดตัดแบ่ง (MB)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={logic.chunkSizeInput}
                    onChange={logic.handleChunkSizeChange}
                    onBlur={logic.handleChunkSizeBlur}
                    step="0.5" 
                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                    MB
                  </div>
                </div>
                <p className="text-xs text-gray-400 pl-1">
                   แนะนำ 2-4 MB เพื่อความเสถียร
                </p>
              </div>

              {/* 🤖 Model Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bot size={16} />
                  AI Model
                </label>
                <div className="relative">
                  <select 
                    value={logic.modelName}
                    onChange={(e) => logic.setModelName(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (แนะนำ)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (ฉลาดสุด)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                  </select>
                  {/* Custom Arrow Icon */}
                  <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Group 2: Stats (Optional) */}
          {logic.chunks.length > 0 && (
             <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Session Info
                </h3>
                <div className="bg-blue-50 p-4 rounded-xl space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-blue-600 flex items-center gap-2"><FileAudio size={14}/> Total Parts</span>
                      <span className="font-bold text-blue-800">{logic.chunks.length}</span>
                   </div>
                   {/* เพิ่ม Info อื่นๆ ได้ที่นี่ */}
                </div>
             </div>
          )}

        </div>

        {/* --- Footer --- */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
           <p className="text-xs text-center text-gray-400">
             Powered by Groq & Gemini
           </p>
        </div>

      </aside>
    </>
  );
}