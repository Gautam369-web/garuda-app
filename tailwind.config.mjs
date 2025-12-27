/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-primary': '#00f2ff',
                'accent-secondary': '#7000ff',
                'status-pending': '#ffcc00',
                'status-approved': '#00ff88',
                'status-rejected': '#ff4444',
            },
            backgroundImage: {
                'cyber-gradient': 'linear-gradient(90deg, #00f2ff, #7000ff)',
            },
        },
    },
    plugins: [],
};
