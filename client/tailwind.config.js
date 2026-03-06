/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['"SF Pro Display"', '"Inter"', 'sans-serif'],
            },
            colors: {
                apple: {
                    50: '#FBFBFD', // Core background
                    100: '#F5F5F7', // Surface
                    200: '#E8E8ED', // Borders
                    300: '#D2D2D7',
                    400: '#86868B', // Secondary text
                    500: '#424245',
                    600: '#1D1D1F', // Primary text
                    blue: '#0066CC', // Primary CTA
                    blueHover: '#0077ED',
                    red: '#FF3B30',
                    green: '#34C759',
                    orange: '#FF9500',
                }
            },
            boxShadow: {
                'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'apple-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'apple-card': '2px 4px 12px rgba(0,0,0,0.08)',
                'apple-focus': '0 0 0 4px rgba(0, 102, 204, 0.15)',
            },
            transitionTimingFunction: {
                'apple': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
