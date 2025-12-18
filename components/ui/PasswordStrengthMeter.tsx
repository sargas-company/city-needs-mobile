import React from 'react'
import { Text, View } from 'react-native'

import { Design } from '@/constants/theme'

interface IPropsPasswordStrengthMeter {
    password: string
}
type Strength = 'empty' | 'weak' | 'medium' | 'strong'

const PasswordStrengthMeter: React.FC<IPropsPasswordStrengthMeter> = ({ password }) => {
    const getPasswordStrength = (pwd: string): Strength => {
        if (!pwd) return 'empty'

        let score = 0

        // Length
        if (pwd.length >= 3) score += 1
        if (pwd.length >= 5) score += 1

        // Symbols
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1
        if (/\d/.test(pwd)) score += 1
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1

        if (score <= 2) return 'weak'
        if (score <= 4) return 'medium'
        return 'strong'
    }

    const strengthStyles: Record<Exclude<Strength, 'empty'>, { color: string; bars: [string, string, string]; label: string }> = {
        weak: { color: Design.danger, bars: ['bg-danger', 'bg-border', 'bg-border'], label: 'Weak' },
        medium: { color: Design.brand, bars: ['bg-brand', 'bg-brand', 'bg-border'], label: 'Medium' },
        strong: { color: Design.brand2, bars: ['bg-brand2', 'bg-brand2', 'bg-brand2'], label: 'Strong' },
    }

    const strength = getPasswordStrength(password)
    if (strength === 'empty') {
        return (
            <View className="mt-2 flex-row items-center gap-2">
                <View className="h-1 flex-1 rounded-full bg-border" />
                <View className="h-1 flex-1 rounded-full bg-border" />
                <View className="h-1 flex-1 rounded-full bg-border" />
            </View>
        )
    }
    const { color, bars, label } = strengthStyles[strength]
    return (
        <View className="mt-2 flex-row items-center gap-2">
            <Text className="font-poppins-semibold text-xs" style={{ color }}>
                {label}
            </Text>
            {bars.map((bar, idx) => (
                <View key={idx} className={`h-1 flex-1 rounded-full ${bar}`} />
            ))}
        </View>
    )
}

export default PasswordStrengthMeter
