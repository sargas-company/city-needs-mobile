import React from 'react'
import { View } from 'react-native'
import { twMerge } from 'tailwind-merge'

import { AppText } from '@/components/ui/AppText'

type StatusVariant = 'active' | 'expired' | 'inactive'

type StatusBadgeProps = {
    label: string
    variant: StatusVariant
    className?: string
}

const variantStyles: Record<StatusVariant, { container: string; text: string }> = {
    active: {
        container: 'bg-[#27AE60] rounded-pill px-4 py-1',
        text: 'text-white font-poppins-semibold text-[13px]',
    },
    expired: {
        container: 'bg-[#FF4D4D] rounded-pill px-4 py-1',
        text: 'text-white font-poppins-semibold text-[13px]',
    },
    inactive: {
        container: 'bg-[#E0E0E0] rounded-pill px-4 py-1',
        text: 'text-[#8D8C92] font-poppins-semibold text-[13px]',
    },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant, className }) => {
    const styles = variantStyles[variant]

    return (
        <View className={twMerge(styles.container, className)}>
            <AppText className={styles.text}>{label}</AppText>
        </View>
    )
}
