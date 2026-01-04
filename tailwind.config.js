/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Sapphire & Mist Palette
                primary: '#1E3A8A',      // Deep Sapphire Blue - Primary Action
                sage: '#0EA5E9',         // Sky Blue - Secondary Accent
                rosegold: '#64748B',     // Slate - Accents
                cream: '#E2E8F0',        // Cool Mist Grey - Backgrounds
                softpink: '#F1F5F9',     // Lighter Mist - Secondary Backgrounds
                warmgray: '#475569',     // Slate Grey - Secondary Text
                deepplum: '#0F172A',     // Dark Navy - Main Text

                // Semantic colors (mapped to new palette)
                secondary: '#0EA5E9',    // Sky Blue
                accent: '#64748B',       // Slate
                dark: '#0F172A',         // Dark Navy
                light: '#E2E8F0',        // Cool Mist Grey
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            borderRadius: {
                'soft': '12px',
                'medium': '16px',
                'organic': '24px',
            },
            boxShadow: {
                'soft': '0 2px 15px rgba(184, 169, 214, 0.1)',
                'medium': '0 4px 20px rgba(184, 169, 214, 0.15)',
                'card': '0 2px 12px rgba(107, 91, 125, 0.08)',
            },
        },
    },
    plugins: [],
}
