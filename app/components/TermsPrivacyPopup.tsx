import React, { useState, useEffect, useRef } from 'react';

interface TermsPrivacyPopupProps {
  isOpen: boolean;
  onClose: (agreed: boolean) => void;
  theme: 'light' | 'dark';
}

export const TermsPrivacyPopup: React.FC<TermsPrivacyPopupProps> = ({ isOpen, onClose, theme }) => {
  const [canClose, setCanClose] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setCanClose(true);
      }
    }
  };

  const handleAgree = () => {
    onClose(true);
  };

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={popupRef} className={`${bgColor} p-8 rounded-lg shadow-xl w-3/4 max-w-2xl max-h-[80vh] flex flex-col`}>
        <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Terms and Privacy Policy</h2>
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className={`${textColor} overflow-y-auto flex-grow mb-4`}
          style={{ maxHeight: 'calc(80vh - 12rem)' }}
        >
          <h3 className="text-xl font-semibold mb-2">AfroInnovate No Responsibility Disclaimer</h3>
          <p className="mb-4">
            The services provided by AfroInnovate, including shipping and carrier services, are for general informational purposes only and not contractual. All services are provided in good faith; however, AfroInnovate makes no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any services provided by the carriers and shippers. The agreements and contracts are between the shippers and carriers, including terms and agreements associated with liability.
          </p>
          <p className="mb-4">
            Under no circumstance shall AfroInnovate have any liability to you for any loss or damage of any kind incurred because of the use of the services or reliance on any information provided on the site. Your use of the services and your reliance on any information on the site is solely at your own risk.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-6">AfroInnovate Privacy Statement</h3>
          <p className="mb-4">
            At AfroInnovate, we are committed to protecting your privacy. This Privacy Statement explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including shipping and carrier services.
          </p>

          <h4 className="text-lg font-semibold mb-2">1. Information We Collect</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Personal Data: We may collect personally identifiable information, such as your name, shipping address, email address, and phone number.</li>
            <li>Usage Data: We may collect information about your interactions with our website, such as your IP address, browser type, and pages visited.</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">2. How We Use Your Information</h4>
          <ul className="list-disc list-inside mb-4">
            <li>To provide and manage our services, including processing and fulfilling orders.</li>
            <li>To communicate with you, including sending updates and promotional materials.</li>
            <li>To improve our website and services based on your feedback and usage patterns.</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">3. Disclosure of Your Information</h4>
          <ul className="list-disc list-inside mb-4">
            <li>We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this Privacy Statement.</li>
            <li>We may share your information with third-party service providers who assist us in operating our website and conducting our business.</li>
            <li>We may disclose your information to comply with legal obligations or protect our rights.</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">4. Security of Your Information</h4>
          <p className="mb-4">
            We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h4 className="text-lg font-semibold mb-2">5. Your Rights</h4>
          <ul className="list-disc list-inside mb-4">
            <li>You have the right to access, correct, or delete your personal information.</li>
            <li>You have the right to withdraw your consent to our processing of your personal information at any time.</li>
          </ul>

          <h4 className="text-lg font-semibold mb-2">6. Changes to This Privacy Statement</h4>
          <p className="mb-4">
            We may update this Privacy Statement from time to time. We will notify you of any changes by posting the new Privacy Statement on our website.
          </p>

          <h4 className="text-lg font-semibold mb-2">7. Contact Us</h4>
          <p className="mb-4">
            If you have any questions about this Privacy Statement, please contact us 
            <span className="text-blue-700 block cursor-pointer">+251917220101</span>
            <span className="italic underline text-blue-700 cursor-pointer">support@afroinnovate.com</span>
          </p>
        </div>
        <button
          onClick={handleAgree}
          disabled={!canClose}
          className={`w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
            canClose
              ? 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              : 'bg-gray-400 cursor-not-allowed'
          } transition-colors duration-300`}
        >
          {canClose ? 'I Agree' : 'Please read the entire document'}
        </button>
      </div>
    </div>
  );
};
