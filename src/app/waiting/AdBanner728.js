export default function AdBanner728() {
  return (
    <div className="w-full flex items-center justify-center min-h-[90px] overflow-hidden my-4 hidden md:flex">
      <iframe 
        src="/ad-728x90.html" 
        width="728" 
        height="90" 
        frameBorder="0" 
        scrolling="no" 
        className="border-none"
        title="Advertisement Leaderboard"
      ></iframe>
    </div>
  );
}
