'use client';

import { useEffect, useState } from 'react';

interface ModelData {
  name: string;
  displayName: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  description: string;
}

export default function ModelListTable() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูลจาก API ที่เราทำไว้
    fetch('/api/check-models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models) {
          // กรองเอาเฉพาะ Gemini Flash/Pro เพื่อไม่ให้รกเกินไป
          const filtered = data.models.filter((m: any) => 
            m.name.includes('gemini') && 
            (m.name.includes('flash') || m.name.includes('pro'))
          );
          // เรียงลำดับตามชื่อ
          filtered.sort((a: any, b: any) => b.name.localeCompare(a.name)); 
          setModels(filtered);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-center">กำลังโหลดข้อมูล Model...</div>;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Model Name (ID)</th>
            <th className="px-6 py-3">Display Name</th>
            <th className="px-6 py-3 text-center">In / Out Limit</th>
            <th className="px-6 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.name} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                {model.name.replace('models/', '')}
              </td>
              <td className="px-6 py-4 font-bold text-gray-800">
                {model.displayName}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                  In: {(model.inputTokenLimit / 1000).toFixed(0)}k
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Out: {(model.outputTokenLimit / 1000).toFixed(0)}k
                </span>
              </td>
              <td className="px-6 py-4 truncate max-w-xs" title={model.description}>
                {model.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}