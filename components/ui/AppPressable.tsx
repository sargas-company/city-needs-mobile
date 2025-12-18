import React from 'react'
import { Pressable, type PressableProps } from 'react-native'

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

type AppPressableProps = PressableProps & {
    className?: string
    disabledClassName?: string
}

export const AppPressable: React.FC<AppPressableProps> = ({ className, disabled, disabledClassName = 'opacity-60', ...props }) => {
    return <Pressable {...props} disabled={disabled} className={cn(className, disabled && disabledClassName)} />
}
