/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Geist"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                brand: {
                    primary: '#2E3192', // Deep Indigo
                    accent: '#D1FF1A',  // Electric Lime
                    dark: '#0A0A0B',    // Near Black
                    surface: '#161618', // Elevation 1
                    muted: '#242427',   // Elevation 2
                }
            },
            boxShadow: {
                'squircle': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
                'glass-glow': '0 8px 32px 0 rgba(46, 49, 146, 0.2)',
                'lime-glow': '0 0 20px -5px rgba(209, 255, 26, 0.3)',
            },
            borderRadius: {
                'squircle': '2rem',
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
                'float-slow': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.6', transform: 'scale(1.2)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                }
            }
        },
    },
    plugins: [],
}
