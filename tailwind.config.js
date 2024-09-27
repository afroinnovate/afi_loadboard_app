module.exports = {
    content: ['./app/**/*.{ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                green: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    // ... other shades
                    800: '#166534',
                    900: '#14532d',
                },
            },
        }
    },
    variants: {},
    plugins: [
        require('flowbite/plugin')
    ],
}