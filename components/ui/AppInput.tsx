import React, { useState } from 'react'
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'
import { Design } from '@/constants/theme'

type AppInputProps = TextInputProps & {
    label?: string
    required?: boolean
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    onRightIconPress?: () => void

    clearable?: boolean
    onClear?: () => void

    containerClassName?: string
    labelClassName?: string
    inputWrapperClassName?: string
    inputClassName?: string
    errorClassName?: string

    renderInput?: (props: TextInputProps) => React.ReactNode
}

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

type OnFocus = NonNullable<TextInputProps['onFocus']>
type OnBlur = NonNullable<TextInputProps['onBlur']>

export const AppInput: React.FC<AppInputProps> = ({
    label,
    required,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,

    clearable = false,
    onClear,

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

    const handleFocus: OnFocus = (e) => {
        setIsFocused(true)
        onFocus?.(e)
    }

    const handleBlur: OnBlur = (e) => {
        setIsFocused(false)
        onBlur?.(e)
    }

    // error > focus > default
    const borderColorClass = error ? 'border-danger' : isFocused ? 'border-brand' : 'border-border'

    const disabledClass = !editable ? 'opacity-60' : ''

    const showClear = clearable && editable && typeof textInputProps.value === 'string' && textInputProps.value.length > 0

    const handleClear = () => {
        if (onClear) {
            onClear()
        } else {
            textInputProps.onChangeText?.('')
        }
    }

    return (
        <View className={cn('w-full', containerClassName)}>
            {!!label && (
                <AppText className={cn('mb-2 leading-[21px]', labelClassName)}>
                    {label}
                    {required && <AppText className="text-danger">*</AppText>}
                </AppText>
            )}

            <View
                className={cn(
                    'flex-row items-center h-12 w-full rounded-input border bg-white px-control',
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

                {showClear && (
                    <Pressable hitSlop={8} onPress={handleClear} className="ml-2">
                        <Text className="text-base text-[#6B7280]">✕</Text>
                    </Pressable>
                )}

                {!showClear && rightIcon && (
                    <Pressable hitSlop={8} onPress={onRightIconPress} disabled={!onRightIconPress}>
                        {rightIcon}
                    </Pressable>
                )}
            </View>

            {!!error && <AppText className={cn('mt-1 text-xs font-poppins-semibold leading-4 text-danger', errorClassName)}>{error}</AppText>}
        </View>
    )
}
