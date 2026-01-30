import React from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { TextInputProps } from 'react-native'

import { AppInput } from './AppInput'

type FormInputProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    label?: string
    required?: boolean
    keyboardType?: TextInputProps['keyboardType']
} & Omit<React.ComponentProps<typeof AppInput>, 'value' | 'onChangeText' | 'onBlur' | 'error'>

export function FormInput<T extends FieldValues>({ control, name, label, required, keyboardType, ...rest }: FormInputProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <AppInput
                    label={label}
                    required={required}
                    value={value != null ? String(value) : ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error?.message}
                    keyboardType={keyboardType}
                    {...rest}
                />
            )}
        />
    )
}
