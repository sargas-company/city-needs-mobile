// @ts-nocheck
// @ts-ignore
import React, { useState } from 'react'
import { TextInput, TextInputProps, Text, View, Pressable, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native'

type AppInputProps = TextInputProps & {
    label?: string
    required?: boolean
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    onRightIconPress?: () => void

    containerClassName?: string
    labelClassName?: string
    inputWrapperClassName?: string
    inputClassName?: string
    errorClassName?: string
}

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export const AppInput: React.FC<AppInputProps> = ({
    label,
    required,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerClassName,
    labelClassName,
    inputWrapperClassName,
    inputClassName,
    errorClassName,
    editable = true,
    onFocus,
    onBlur,
    placeholderTextColor = '#CACACA',
    ...textInputProps
}) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true)
        onFocus?.(e)
    }

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false)
        onBlur?.(e)
    }

    //  error > focus > default
    const borderColorClass = error ? 'border-[#EF4444]' : isFocused ? 'border-[#0C2A63]' : 'border-[#CBCBCB]'

    const disabledClass = !editable ? 'opacity-60' : ''

    return (
        <View className={cn('w-full', containerClassName)}>
            {!!label && (
                <Text className={cn('mb-2 text-[14px] leading-[21px] font-normal text-[#171717]', labelClassName)}>
                    {label}
                    {required && <Text className="text-[#171717]">*</Text>}
                </Text>
            )}

            <View
                className={cn(
                    'flex-row items-center h-12 px-3 rounded-[12px] border bg-white',
                    borderColorClass,
                    disabledClass,
                    inputWrapperClassName
                )}
            >
                {leftIcon && <View className="mr-2">{leftIcon}</View>}

                <TextInput
                    className={cn('flex-1 text-[14px] text-[#171717]', inputClassName)}
                    placeholderTextColor={placeholderTextColor}
                    editable={editable}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />

                {rightIcon && (
                    <Pressable hitSlop={8} onPress={onRightIconPress} disabled={!onRightIconPress}>
                        {rightIcon}
                    </Pressable>
                )}
            </View>

            {!!error && <Text className={cn('mt-1 text-[12px] leading-4 font-semibold text-[#EF4444]', errorClassName)}>{error}</Text>}
        </View>
    )
}
