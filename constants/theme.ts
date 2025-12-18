/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native'

const tintColorLight = '#0C2A63'
const tintColorDark = '#fff'

export const Colors = {
    light: {
        text: '#11181C',
        background: '#F9F8FD',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: '#ECEDEE',
        background: '#151718',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
    },
}

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: 'system-ui',
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: 'ui-serif',
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: 'ui-rounded',
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
})

export const DesignColors = {
    appBg: '#F9F8FD',
    brand: '#0C2A63',
    brand2: '#103E97',
    text: '#171717',
    textMuted: '#8D8C92',
    textPlaceholder: '#CACACA',
    border: '#CBCBCB',
    danger: '#FF4D4D',
    ink900: '#111827',
} as const

export const Radii = {
    input: 12,
    checkbox: 4,
    pill: 40,
} as const

export const FontFamily = {
    poppins: 'Poppins_400Regular',
    poppinsMedium: 'Poppins_500Medium',
    poppinsSemiBold: 'Poppins_600SemiBold',
    poppinsBold: 'Poppins_700Bold',
} as const
