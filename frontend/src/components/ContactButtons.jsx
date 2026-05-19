import React from 'react';

const ContactButtons = () => {
  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-4">
      {/* Nút Zalo */}
      <a 
        href="https://zalo.me/0338797170" 
        target="_blank" 
        rel="noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
          alt="Zalo" 
          className="w-8 h-8"
        />

        <span className="absolute left-16 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-blue-100">
          Chat Zalo ngay
        </span>
      </a>

      {/* Nút Gọi điện */}
      <a 
        href="tel:0338797170" 
        className="group relative flex items-center justify-center w-14 h-14 bg-red-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>

        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-7 w-7 text-white relative z-10" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>

        <span className="absolute left-16 bg-white text-red-600 px-4 py-2 rounded-lg shadow-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-red-100">
          Gọi: 0338.797.170
        </span>
      </a>
    </div>
  );
};

export default ContactButtons;