import React from 'react'
import { Text, View } from 'react-native'

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
        weak: { color: '#EF4444', bars: ['bg-red-500', 'bg-gray-300', 'bg-gray-300'], label: 'Weak' },
        medium: { color: '#F97316', bars: ['bg-orange-500', 'bg-orange-500', 'bg-gray-300'], label: 'Medium' },
        strong: { color: '#22C55E', bars: ['bg-green-500', 'bg-green-500', 'bg-green-500'], label: 'Strong' },
    }

    const strength = getPasswordStrength(password)
    if (strength === 'empty') {
        return (
            <View className="mt-2 flex-row items-center gap-2">
                <View className="h-1 flex-1 rounded-full bg-gray-300" />
                <View className="h-1 flex-1 rounded-full bg-gray-300" />
                <View className="h-1 flex-1 rounded-full bg-gray-300" />
            </View>
        )
    }
    const { color, bars, label } = strengthStyles[strength]
    return (
        <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs font-semibold" style={{ color }}>
                {label}
            </Text>
            {bars.map((bar, idx) => (
                <View key={idx} className={`h-1 flex-1 rounded-full ${bar}`} />
            ))}
        </View>
    )
}

export default PasswordStrengthMeter
