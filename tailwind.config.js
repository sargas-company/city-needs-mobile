require('ts-node').register({ transpileOnly: true })

const theme = require('./constants/theme')
const { DesignColors } = theme

module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                ...DesignColors,
            },
            fontFamily: {
                poppins: ['Poppins_400Regular'],
                'poppins-medium': ['Poppins_500Medium'],
                'poppins-semibold': ['Poppins_600SemiBold'],
                'poppins-bold': ['Poppins_700Bold'],
            },
            fontSize: {
                title: ['24px', { lineHeight: '36px' }],
                subtitle: ['16px', { lineHeight: '24px' }],
                base: ['14px', { lineHeight: '21px' }],
                step: ['20px', { lineHeight: '30px' }],
                status: ['13px', { lineHeight: '20px' }],
                caption: ['10px', { lineHeight: '15px' }],
            },
            borderRadius: {
                input: '12px',
                checkbox: '4px',
                pill: '40px',
            },
            spacing: {
                screen: '24px',
                control: '12px',
            },
        },
    },
    plugins: [],
}
