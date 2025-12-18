import { Platform } from 'react-native'

const tokens = require('./design-tokens')

const tintColorLight = '#0C2A63'
const tintColorDark = '#fff'

export const Colors = {
    light: {
        text: '#171717',
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
} as const

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
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

export const Design = {
    appBg: tokens.colors['app-bg'],
    brand: tokens.colors.brand,
    brand2: tokens.colors['brand-2'],
    text: tokens.colors.text,
    textMuted: tokens.colors['text-muted'],
    textPlaceholder: tokens.colors['text-placeholder'],
    border: tokens.colors.border,
    danger: tokens.colors.danger,
    ink900: tokens.colors['ink-900'],
} as const
