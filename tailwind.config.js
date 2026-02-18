/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                dark: {
                    950: '#0b0b0c', // Deepest background (Main bg)
                    900: '#131314', // Page background
                    850: '#1e1f20', // Input / Card background
                    800: '#2d2e2f', // Hover states
                    700: '#444746', // Borders / Secondary text
                    600: '#5e5e5e',
                    500: '#8e8e8e', // Icons
                },
                brand: {
                    500: '#4c8df6', // Google Blue-ish
                    600: '#3b82f6',
                },
                ai: {
                    500: '#c084fc', // Gemini Purple/Pink gradients
                    600: '#a855f7',
                }
            }
        },
    },
    plugins: [],
}
