import React from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { MaskedTextInput } from 'react-native-mask-text'
import { StyleSheet } from 'react-native'

import { AppInput } from './AppInput'

export type FormPhoneInputProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    label?: string
    required?: boolean
    mask?: string
    placeholder?: string
    leftIcon?: React.ReactNode
}

const DEFAULT_MASK = '+1 (999) 999-9999'

export function FormPhoneInput<T extends FieldValues>({
    control,
    name,
    label = 'Mobile Number',
    required,
    mask = DEFAULT_MASK,
    placeholder = DEFAULT_MASK,
    leftIcon,
}: FormPhoneInputProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <AppInput
                    label={label}
                    required={required}
                    error={error?.message}
                    keyboardType="phone-pad"
                    leftIcon={leftIcon}
                    placeholder={placeholder}
                    renderInput={(inputProps) => (
                        <MaskedTextInput
                            {...(() => {
                                const { className: _cn, style, placeholderTextColor, ...rest } = inputProps
                                return {
                                    ...rest,
                                    style: StyleSheet.flatten([{ flex: 1, fontSize: 14, color: '#171717' }, style]),
                                    placeholderTextColor,
                                }
                            })()}
                            mask={mask}
                            keyboardType="phone-pad"
                            value={(value as string) ?? ''}
                            onChangeText={(text) => {
                                onChange(text)
                            }}
                            onBlur={onBlur}
                        />
                    )}
                />
            )}
        />
    )
}
