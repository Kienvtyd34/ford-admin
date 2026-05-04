/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fordBlue: '#002855', // Màu xanh Ford chính thức
        fordGray: '#f4f4f4',
      },
      // Bạn có thể thêm font chữ chuyên dụng nếu muốn
      fontFamily: {
        ford: ['Antenna', 'Arial', 'sans-serif'], 
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}