import React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { AppPressable } from './AppPressable'
import { AppText } from './AppText'

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export type AppButtonVariant = 'solid' | 'outline'
export type AppButtonSize = 'md' // пока один, как в Figma (56)

type AppButtonProps = {
    title: string
    onPress?: () => void
    variant?: AppButtonVariant
    size?: AppButtonSize
    disabled?: boolean
    loading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode

    className?: string
    textClassName?: string
    contentClassName?: string
}

export const AppButton: React.FC<AppButtonProps> = ({
    title,
    onPress,
    variant = 'solid',
    size = 'md',
    disabled,
    loading,
    leftIcon,
    rightIcon,
    className,
    textClassName,
    contentClassName,
}) => {
    const isDisabled = !!disabled || !!loading

    const base = 'w-full flex-row items-center justify-center gap-2 rounded-pill'

    const sizeClass = size === 'md' ? 'h-14 px-4' : 'h-14 px-4'

    const solidClass = 'bg-brand'
    const outlineClass = 'border border-brand bg-transparent'

    const rootClass = cn(base, sizeClass, variant === 'solid' ? solidClass : outlineClass, className)

    const textBase = 'text-subtitle'
    const solidText = 'font-poppins-medium text-white'
    const outlineText = 'font-poppins-semibold text-brand'

    const finalTextClass = cn(textBase, variant === 'solid' ? solidText : outlineText, textClassName)

    return (
        <AppPressable
            onPress={onPress}
            disabled={isDisabled}
            className={rootClass}
            // disabled/pressed behavior is centralized in AppPressable
        >
            <View className={cn('flex-row items-center justify-center gap-2', contentClassName)}>
                {leftIcon ? <View>{leftIcon}</View> : null}

                {loading ? <ActivityIndicator /> : <AppText className={finalTextClass}>{title}</AppText>}

                {rightIcon ? <View>{rightIcon}</View> : null}
            </View>
        </AppPressable>
    )
}
