import React, { useState } from 'react';

interface TermsPrivacyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  content: 'terms' | 'privacy';
  theme: 'light' | 'dark';
}

export function TermsPrivacyPopup({ isOpen, onClose, content, theme }: TermsPrivacyPopupProps) {
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`${bgColor} ${textColor} p-8 rounded-lg max-w-2xl max-h-[80vh] overflow-auto`}>
        <h2 className="text-2xl font-bold mb-4">
          {content === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        </h2>
        <div className="mb-6">
          {content === 'terms' ? (
            <p>
              [Your terms of service content goes here]
            </p>
          ) : (
            <p>
              [Your privacy policy content goes here]
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}