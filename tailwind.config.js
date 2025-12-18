const tokens = require('./constants/design-tokens')

module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                ...tokens.colors,
            },
            fontFamily: {
                poppins: [tokens.fontFamily.poppins],
                'poppins-medium': [tokens.fontFamily.poppinsMedium],
                'poppins-semibold': [tokens.fontFamily.poppinsSemiBold],
                'poppins-bold': [tokens.fontFamily.poppinsBold],
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
                input: tokens.radii.input + 'px',
                checkbox: tokens.radii.checkbox + 'px',
                pill: tokens.radii.pill + 'px',
            },
            spacing: {
                screen: '24px',
                control: '12px',
            },
        },
    },
    plugins: [],
}
