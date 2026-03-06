/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4f46e5', // INDIGO-600
                secondary: '#f59e0b', // AMBER-500
            }
        },
    },
    plugins: [],
}
