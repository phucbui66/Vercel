export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">OfficeFlex Converter</h1>
        <p className="text-gray-600 text-sm mb-6">
          Hệ thống đang hoạt động tốt! <br/><br/>
          Vui lòng sử dụng <b>Chrome Extension</b> để tải file lên. Bạn sẽ được tự động chuyển hướng đến trang theo dõi tiến trình.
        </p>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
