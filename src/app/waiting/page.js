"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdBanner from './AdBanner';
import AdBanner728 from './AdBanner728';

const OFFICE_TIPS = [
  "Tip: Use Ctrl + Shift + L in Excel to quickly toggle filters.",
  "Tip: Press F4 in Word/Excel to repeat the last action.",
  "Tip: Use Ctrl + ; to quickly insert the current date in Excel.",
  "Tip: In Word, highlight text and press Shift + F3 to quickly change case.",
  "Tip: Use Alt + = in Excel for AutoSum.",
  "Tip: Press Ctrl + K to quickly insert a hyperlink.",
  "Tip: Use Windows + V to open Clipboard history to view and paste multiple items."
];

function WaitingContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') || searchParams.get('id') || '';
  const namesParam = searchParams.get('names') || '';
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];
  const names = namesParam ? namesParam.split(',').map(decodeURIComponent) : [];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://breezy-cameras-yawn.loca.lt';

  const [timeLeft, setTimeLeft] = useState(10);
  const [tasks, setTasks] = useState({});
  const [randomTip, setRandomTip] = useState('');

  // 1. Khởi tạo danh sách các Task dựa trên ids và names từ URL
  useEffect(() => {
    if (ids.length === 0) return;
    const initialTasks = {};
    ids.forEach((id, index) => {
      initialTasks[id] = {
        id,
        name: names[index] || `File-${id.substring(0, 5)}`,
        status: 'Pending',
        downloadUrl: '',
        error: ''
      };
    });
    setTasks(initialTasks);
  }, [idsParam, namesParam]);

  useEffect(() => {
    setRandomTip(OFFICE_TIPS[Math.floor(Math.random() * OFFICE_TIPS.length)]);
  }, []);

  // 2. Đếm ngược 10 giây để chuẩn bị tài nguyên
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // 3. Polling API song song cho tất cả các Task chưa hoàn thành
  useEffect(() => {
    if (ids.length === 0) return;

    const completedIds = new Set();

    const intervalId = setInterval(async () => {
      const pendingIds = ids.filter(id => !completedIds.has(id));
      if (pendingIds.length === 0) {
        clearInterval(intervalId);
        return;
      }

      await Promise.all(
        pendingIds.map(async (id) => {
          try {
            const response = await fetch(`${API_URL}/api/convert/status/${id}`, {
              headers: {
                'Bypass-Tunnel-Reminder': 'true'
              }
            });
            if (response.ok) {
              const data = await response.json(); // { id, status, downloadUrl }
              
              if (data.status === 'Success' || data.status === 'Failed') {
                completedIds.add(id);
              }
              
              setTasks(prev => {
                if (!prev[id]) return prev;
                // Chỉ cập nhật nếu có sự thay đổi thực sự
                const nextUrl = data.downloadUrl ? `${API_URL}${data.downloadUrl}` : '';
                if (prev[id].status === data.status && prev[id].downloadUrl === nextUrl) {
                  return prev;
                }
                return {
                  ...prev,
                  [id]: {
                    ...prev[id],
                    status: data.status,
                    downloadUrl: nextUrl
                  }
                };
              });
            }
          } catch (error) {
            console.error(`Error polling task ${id}:`, error);
          }
        })
      );
    }, 2000);

    return () => clearInterval(intervalId);
  }, [idsParam]);

  // 4. Tính toán tiến trình tổng thể
  const getTaskProgress = (status) => {
    if (status === 'Success') return 100;
    if (status === 'Processing') return 50;
    return 0;
  };

  const taskCount = ids.length;
  const totalTaskProgress = taskCount > 0 
    ? Object.values(tasks).reduce((sum, t) => sum + getTaskProgress(t.status), 0) / taskCount
    : 0;

  const countdownProgress = Math.round(((10 - timeLeft) / 10) * 100);
  const progressPercent = Math.round(countdownProgress * 0.3 + totalTaskProgress * 0.7);

  // 5. Kiểm tra trạng thái sẵn sàng để tải tất cả
  const activeTasksList = Object.values(tasks);
  const allCompleted = activeTasksList.length > 0 && activeTasksList.every(t => t.status === 'Success' || t.status === 'Failed');
  const hasSuccessfulTasks = activeTasksList.some(t => t.status === 'Success');
  
  const isReady = timeLeft === 0 && allCompleted && hasSuccessfulTasks;

  const handleDownloadAll = () => {
    if (!isReady) return;

    const completedUrls = activeTasksList
      .filter(t => t.status === 'Success' && t.downloadUrl)
      .map(t => t.downloadUrl);

    // Tải tuần tự các file để tránh bị trình duyệt chặn tải hàng loạt
    completedUrls.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 400);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      
      {/* <!-- Banner Quảng Cáo Trên --> */}
      <div className="w-full flex justify-center mb-8">
        <AdBanner728 />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Documents</h1>
        <p className="text-gray-500 mb-6 text-sm">
          The system is optimizing and converting your file queue. Please keep this page open.
        </p>

        {/* Danh sách tiến trình chuyển đổi các file */}
        <div className="mt-4 text-left max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 mb-6 shadow-inner">
          {activeTasksList.map((task) => {
            const ext = task.name.substring(task.name.lastIndexOf('.')).toLowerCase();
            let iconColor = 'text-gray-400';
            let iconEmoji = '📄';
            if (ext === '.docx') { iconColor = 'text-blue-500'; iconEmoji = '📝'; }
            else if (ext === '.xlsx') { iconColor = 'text-green-500'; iconEmoji = '📊'; }
            else if (ext === '.pptx') { iconColor = 'text-orange-500'; iconEmoji = '📈'; }

            return (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden pr-4">
                  <span className={`text-xl ${iconColor}`}>{iconEmoji}</span>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate" title={task.name}>
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {task.status === 'Success' ? 'Ready' : task.status === 'Processing' ? 'Converting...' : task.status === 'Failed' ? 'Failed' : 'Queued'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {task.status === 'Success' && allCompleted && timeLeft === 0 ? (
                    <a
                      href={task.downloadUrl}
                      download
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                    >
                      <span>Download</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </a>
                  ) : task.status === 'Success' ? (
                    <div className="flex items-center space-x-1.5 text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span className="text-xs font-medium text-gray-500">Ready</span>
                    </div>
                  ) : task.status === 'Failed' ? (
                    <span className="text-red-500 text-xs font-semibold bg-red-50 px-2.5 py-1 rounded-full">Failed</span>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-blue-600">
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"></span>
                      <span className="text-xs font-medium text-gray-400">
                        {task.status === 'Processing' ? 'Converting' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={!isReady}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md ${
            isReady 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!allCompleted && timeLeft > 0 ? (
            `Preparing resources (${timeLeft}s)...`
          ) : !allCompleted && timeLeft === 0 ? (
            'Converting files, please wait...'
          ) : isReady ? (
            'DOWNLOAD ALL COMPLETED FILES'
          ) : (
            'CONVERSIONS INCOMPLETE OR FAILED'
          )}
        </button>

        <div className="mt-6">
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 font-medium text-right mb-6">{progressPercent}%</p>

          {randomTip && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start text-left shadow-sm">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{randomTip}</span>
            </div>
          )}
        </div>
      </div>

      {/* <!-- Banner Quảng Cáo Dưới --> */}
      <div className="w-full max-w-3xl min-h-[90px] flex items-center justify-center mt-8">
        <AdBanner />
      </div>

    </div>
  );
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <WaitingContent />
    </Suspense>
  );
}
