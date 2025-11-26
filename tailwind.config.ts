// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Quét tất cả file trong src
  ],
  theme: {
    extend: {
      // 1. MÀU SẮC
      colors: {
        background: '#0B0E12',
        panel: '#0F1720',
        text: {
          primary: '#E6EEF3',
          secondary: '#9AA3B2',
        },
        // Accents
        primary: '#6C5CE7', // Violet
        secondary: '#19A7CE', // Cyan
        danger: '#FF6B6B',
        
        // Thêm các màu utility cho SVG nếu cần
        'red-500': '#EF4444',
        'blue-500': '#3B82F6',
        'yellow-400': '#FACC15',
        'rose-500': '#F43F5E',
      },
      // 2. FONT CHỮ
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      // 3. BO GÓC & SPACING
      borderRadius: {
        lg: '12px',
      },
      spacing: {
        '3': '12px',
        '6': '24px',
        '12': '48px',
      }
    },
  },
  // Safelist: Giữ lại các class động cho SVG (nếu dùng)
  safelist: [
    'stroke-red-500', 'stroke-blue-500', 'stroke-yellow-400', 'stroke-rose-500',
    'fill-red-500/20', 'fill-blue-500/20', 'fill-yellow-400/20', 'fill-rose-500/20',
  ],
  plugins: [],
}
export default config