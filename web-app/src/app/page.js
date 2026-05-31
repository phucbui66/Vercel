import AdBanner from './waiting/AdBanner';
import AdBanner728 from './waiting/AdBanner728';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50 py-8">
      <AdBanner728 />
      
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full my-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">OfficeFlex Converter</h1>
        <p className="text-gray-600 text-sm mb-6">
          System is running smoothly! <br/><br/>
          Please use the <b>Chrome Extension</b> to upload files. You will be automatically redirected to the progress tracking page.
        </p>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="w-full flex justify-center mt-auto">
        <AdBanner />
      </div>
    </div>
  );
}
