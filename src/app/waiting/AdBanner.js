export default function AdBanner() {
  return (
    <div className="w-full flex items-center justify-center min-h-[50px] overflow-hidden">
      <iframe 
        src="/ad.html" 
        width="320" 
        height="50" 
        frameBorder="0" 
        scrolling="no" 
        className="border-none"
        title="Advertisement"
      ></iframe>
    </div>
  );
}
