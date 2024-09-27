module.exports = {
    content: ['./app/**/*.{ts,tsx}', './node_modules/flowbite/**/*.js'],
    theme: {
        extend: {
            screens: {
                'tablet': '640px',
                'laptop': '1024px',
                'desktop': '1280px',
            },
        }
    },
    variants: {},
    plugins: [
        require('flowbite/plugin')
    ],
    darkMode: 'class',
}