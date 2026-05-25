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
  const id = searchParams.get('id');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://breezy-cameras-yawn.loca.lt';

  const [timeLeft, setTimeLeft] = useState(10);
  const [apiStatus, setApiStatus] = useState('Pending');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [randomTip, setRandomTip] = useState('');

  useEffect(() => {
    setRandomTip(OFFICE_TIPS[Math.floor(Math.random() * OFFICE_TIPS.length)]);
  }, []);

  const progressPercent = Math.round(((10 - timeLeft) / 10) * 100);

  // 1. Đếm ngược 10 giây
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // 2. Polling API mỗi 2 giây
  useEffect(() => {
    if (!id) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/convert/status/${id}`, {
          headers: {
            'Bypass-Tunnel-Reminder': 'true'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.status);
          
          if (data.status === 'Success' && data.downloadUrl) {
            setDownloadUrl(`${API_URL}${data.downloadUrl}`);
            clearInterval(intervalId); // Dừng polling khi đã success
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái:", error);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [id]);

  // 3. Logic hiển thị trạng thái nút bấm
  const isReady = timeLeft === 0 && apiStatus === 'Success';
  
  const handleDownload = () => {
    if (isReady && downloadUrl) {
      window.location.href = downloadUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      
      {/* <!-- Banner Quảng Cáo Trên --> */}
      <div className="w-full flex justify-center mb-8">
        <AdBanner728 />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Document</h1>
        <p className="text-gray-500 mb-8 text-sm">
          The system is automatically optimizing and converting your file. Please do not close this page.
        </p>

        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-blue-50">
            {isReady ? (
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!isReady}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md ${
            isReady 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:from-green-600 hover:to-green-700 transform hover:-translate-y-1'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!isReady && timeLeft > 0 ? (
            `Preparing resources (${timeLeft}s)...`
          ) : !isReady && timeLeft === 0 ? (
            'System is compressing file, please wait...'
          ) : (
            'DOWNLOAD COMPLETED FILE'
          )}
        </button>

        <div className="mt-6">
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear" 
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
