export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to OfficeFlex Converter. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we handle your information when you use our Chrome Extension and Web Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <p>
              When you use our extension to convert documents, we collect the files you explicitly upload for conversion purposes only. 
              We do not collect any personal identifying information, browsing history, or track your activity outside of our extension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Document Conversion:</strong> Uploaded files are securely transferred to our server solely for the purpose of converting them to your desired format.</li>
              <li><strong>Temporary Storage:</strong> Files are temporarily stored in memory during the conversion process and are immediately discarded after the process completes. We do not permanently store, read, or analyze the contents of your documents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p>
              Our web interface may display advertisements provided by third-party ad networks. These networks may use cookies to serve ads based on your prior visits to our website or other websites. 
              However, the core Chrome Extension does not inject ads into your browsing experience outside of our dedicated conversion tracking page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Sharing</h2>
            <p>
              We absolutely do not sell, trade, or rent your files or personal information to others. 
              Your documents are kept strictly confidential and are used only for the mechanical conversion process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact the developer via the Chrome Web Store support tab.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
