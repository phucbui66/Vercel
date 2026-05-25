"use client";

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://www.effectivecpmnetwork.com/zkzucecc?key=f7149d9f04f436f54a24ebcbb8b64572';
      script.async = true;
      
      // Chèn script vào trong thẻ div để quảng cáo hiển thị ngay tại đây
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div 
      ref={bannerRef} 
      className="w-full flex items-center justify-center min-h-[90px] overflow-hidden"
    >
      {/* Script sẽ tự động sinh HTML quảng cáo vào bên trong div này */}
    </div>
  );
}
