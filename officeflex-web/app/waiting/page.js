"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WaitingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [timeLeft, setTimeLeft] = useState(10);
  const [apiStatus, setApiStatus] = useState('Pending');
  const [downloadUrl, setDownloadUrl] = useState('');

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
        const response = await fetch(`http://localhost:5000/api/convert/status/${id}`);
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.status);
          
          if (data.status === 'Success' && data.downloadUrl) {
            setDownloadUrl(`http://localhost:5000${data.downloadUrl}`);
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
      <div className="w-full max-w-3xl h-24 bg-gray-200 border border-gray-300 border-dashed rounded-lg flex items-center justify-center mb-8 text-gray-400">
        [Adsterra Banner Script Top]
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
      </div>

      {/* <!-- Banner Quảng Cáo Dưới --> */}
      <div className="w-full max-w-3xl h-24 bg-gray-200 border border-gray-300 border-dashed rounded-lg flex items-center justify-center mt-8 text-gray-400">
        [Adsterra Banner Script Bottom]
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
