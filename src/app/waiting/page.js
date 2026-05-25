"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdBanner from './AdBanner';
import AdBanner728 from './AdBanner728';

const OFFICE_TIPS = [
  "Mẹo: Dùng Ctrl + Shift + L trong Excel để bật/tắt nhanh bộ lọc (Filter).",
  "Mẹo: Bấm F4 trong Word/Excel để lặp lại thao tác vừa thực hiện.",
  "Mẹo: Dùng Ctrl + ; để chèn nhanh ngày hiện tại vào ô Excel.",
  "Mẹo: Trong Word, bôi đen văn bản và bấm Shift + F3 để đổi nhanh chữ hoa/thường.",
  "Mẹo: Dùng Alt + = trong Excel để tính tổng nhanh (AutoSum).",
  "Mẹo: Bấm Ctrl + K để chèn nhanh một đường link (Hyperlink).",
  "Mẹo: Dùng Windows + V để mở lịch sử Clipboard, xem và dán nhiều nội dung."
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý tài liệu</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Hệ thống đang tự động tối ưu và chuyển đổi file của bạn. Vui lòng không đóng trang này.
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
            `Đang chuẩn bị tài nguyên (${timeLeft}s)...`
          ) : !isReady && timeLeft === 0 ? (
            'Hệ thống đang nén file, vui lòng đợi...'
          ) : (
            'TẢI FILE XONG NGAY'
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
