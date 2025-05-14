// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            screens: {
                // всё, что меньше или равно 1400px
                'max1400': { 'max': '1400px' },
            },
        },
    },
    plugins: [],
}
