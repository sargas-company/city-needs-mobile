import React from 'react'
import { View } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormInput } from '@/components/ui/FormInput'
import { AppButton } from '@/components/ui/AppButton'

import { ServiceFormValues, serviceSchema } from './serviceSchema'

type ServiceFormProps = {
    onSubmit: (values: ServiceFormValues) => Promise<void> | void
    isSubmittingExternal?: boolean
}

const defaultValues: ServiceFormValues = {
    name: '',
    description: '',
    durationMinutes: 60,
    price: 0,
    currency: 'CAD',
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, isSubmittingExternal = false }) => {
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const isLoading = isSubmitting || isSubmittingExternal

    return (
        <View className="w-full max-w-md self-center gap-4">
            <FormInput<ServiceFormValues>
                control={control}
                name="name"
                label="Service name"
                required
                placeholder="e.g., Haircut"
                autoCapitalize="words"
            />

            <FormInput<ServiceFormValues>
                control={control}
                name="description"
                label="Description"
                placeholder="Add a short description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                inputWrapperClassName="items-start py-3"
                inputClassName="min-h-[96px]"
            />

            <FormInput<ServiceFormValues>
                control={control}
                name="durationMinutes"
                label="Duration (minutes)"
                required
                keyboardType="number-pad"
                placeholder="60"
            />

            <FormInput<ServiceFormValues> control={control} name="price" label="Price" required keyboardType="number-pad" placeholder="0" />

            <AppButton title="Create" onPress={handleSubmit(onSubmit)} loading={isLoading} disabled={isLoading} />
        </View>
    )
}
