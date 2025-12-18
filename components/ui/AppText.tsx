import React from 'react'
import { Text as RNText, type TextProps } from 'react-native'
import { twMerge } from 'tailwind-merge'

type AppTextProps = TextProps & { className?: string }

/**
 * Default text style:
 * - font: Poppins regular
 * - size: base (14/21)
 * - color: token "text"
 */
export const AppText: React.FC<AppTextProps> = ({ className, ...props }) => {
    const base = 'font-poppins text-base text-text'
    return <RNText {...props} className={twMerge(base, className)} />
}
