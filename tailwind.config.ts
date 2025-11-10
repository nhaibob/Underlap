// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Thêm các đường dẫn lib để đảm bảo Tailwind quét đủ files
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			panel: '#0F1720',
  			text: {
  				primary: '#E6EEF3',
  				secondary: '#9AA3B2'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			danger: '#FF6B6B',
  			'red-500': '#EF4444',
  			'blue-500': '#3B82F6',
  			'yellow-400': '#FACC15',
  			'rose-500': '#F43F5E',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			headline: [
  				'Space Grotesk"',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		spacing: {
  			'3': '12px',
  			'6': '24px',
  			'12': '48px'
  		}
  	}
  },
  // === KHỐI SAFELIST BẮT BUỘC CHO SVG ===
  safelist: [
    // Lớp STROKE (Viền ngoài)
    'stroke-red-500', 
    'stroke-blue-500', 
    'stroke-yellow-400', 
    'stroke-rose-500',
    // Lớp FILL (Nền mờ)
    'fill-red-500/20', 
    'fill-blue-500/20', 
    'fill-yellow-400/20', 
    'fill-rose-500/20',
  ],
  
  plugins: [require("tailwindcss-animate")],
}
export default config