import React, { useState } from 'react'
import { TextInput, TextInputProps, Text, View, Pressable, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native'

import { Design } from '@/constants/theme'

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

    renderInput?: (props: TextInputProps) => React.ReactNode
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
    placeholderTextColor = Design.textPlaceholder,
    renderInput,
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
    const borderColorClass = error ? 'border-danger' : isFocused ? 'border-brand' : 'border-border'

    const disabledClass = !editable ? 'opacity-60' : ''

    return (
        <View className={cn('w-full', containerClassName)}>
            {!!label && (
                <Text className={cn('mb-2 font-poppins text-base leading-[21px] text-text', labelClassName)}>
                    {label}
                    {required && <Text className="text-text">*</Text>}
                </Text>
            )}

            <View
                className={cn(
                    'flex-row items-center h-12 w-full rounded-input border border-border bg-white px-control',
                    borderColorClass,
                    disabledClass,
                    inputWrapperClassName
                )}
            >
                {leftIcon && <View className="mr-2">{leftIcon}</View>}

                {renderInput ? (
                    renderInput({
                        className: cn('flex-1 font-poppins text-base text-text', inputClassName),
                        placeholderTextColor,
                        editable,
                        onFocus: handleFocus,
                        onBlur: handleBlur,
                        ...textInputProps,
                    })
                ) : (
                    <TextInput
                        className={cn('flex-1 font-poppins text-base text-text', inputClassName)}
                        placeholderTextColor={placeholderTextColor}
                        editable={editable}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...textInputProps}
                    />
                )}

                {rightIcon && (
                    <Pressable hitSlop={8} onPress={onRightIconPress} disabled={!onRightIconPress}>
                        {rightIcon}
                    </Pressable>
                )}
            </View>

            {!!error && <Text className={cn('mt-1 font-poppins-semibold text-xs leading-4 text-danger', errorClassName)}>{error}</Text>}
        </View>
    )
}
