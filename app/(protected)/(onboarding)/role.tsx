import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAppDispatch } from '@/store/hooks'
import { selectRoleThunk } from '@/store/features/auth/auth.thunks'
import { AppButton } from '@/components/ui/AppButton'

const roleEnum = z.enum(['END_USER', 'BUSINESS_OWNER'] as const)
export type RoleValue = z.infer<typeof roleEnum>

export const roleSchema = z
    .object({
        role: roleEnum.optional(),
    })
    .refine((data) => !!data.role, {
        path: ['role'],
        message: 'Please select a role to continue.',
    })

export type FormValues = z.infer<typeof roleSchema>

type RoleCardProps = {
    title: string
    subtitle: string
    icon: React.ReactNode
    selected: boolean
    onPress: () => void
}

const RoleCard = ({ title, subtitle, icon, selected, onPress }: RoleCardProps) => {
    return (
        <Pressable
            onPress={onPress}
            className={[
                'w-full rounded-2xl border px-4 py-6',
                'flex-row items-center justify-between',
                selected ? 'border-orange bg-[#FBF4EA]' : 'border-gray-200 bg-white',
            ].join(' ')}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        >
            <View className="flex-row items-center gap-3">
                <View className={['h-12 w-12 items-center justify-center rounded-full', selected ? 'bg-orange' : 'bg-brand'].join(' ')}>{icon}</View>

                <View className="pr-6">
                    <Text className={['text-base font-semibold', selected ? 'text-brand' : 'text-gray-700'].join(' ')}>{title}</Text>
                    <Text className="mt-1 text-sm text-gray-500">{subtitle}</Text>
                </View>
            </View>

            <View
                className={[
                    'h-7 w-7 items-center justify-center rounded-full border',
                    selected ? 'border-orange bg-orange' : 'border-gray-300 bg-white',
                ].join(' ')}
            >
                {selected ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : <View className="h-3 w-3 rounded-full bg-transparent" />}
            </View>
        </Pressable>
    )
}

const RoleScreen = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()

    const {
        control,
        handleSubmit,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { role: undefined },
        mode: 'onSubmit',
    })

    const cards = useMemo(
        () => [
            {
                value: 'BUSINESS_OWNER' as const,
                title: 'Service Provider',
                subtitle: 'Grow your business & get customers.',
                icon: <MaterialIcons name="person" size={22} color="#FFFFFF" />,
            },
            {
                value: 'END_USER' as const,
                title: 'Customer',
                subtitle: 'Find & book local services.',
                icon: <MaterialIcons name="work" size={22} color="#FFFFFF" />,
            },
        ],
        []
    )

    const onSubmit = async (data: FormValues) => {
        if (!data.role) return
        try {
            await dispatch(selectRoleThunk(data.role)).unwrap()
            router.replace('/(protected)/(onboarding)/location')
        } catch {
            // noop for now
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-8">
                <View className="items-center">
                    <Text className="text-3xl font-extrabold text-brand">
                        Choose <Text className="text-orange">One</Text>
                    </Text>
                    <Text className="mt-3 text-center text-base text-gray-400">Are you here to provide services or to book{'\n'}local services?</Text>
                </View>

                <Controller
                    control={control}
                    name="role"
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                        <View className="mt-10 gap-4">
                            {cards.map((c) => (
                                <RoleCard
                                    key={c.value}
                                    title={c.title}
                                    subtitle={c.subtitle}
                                    icon={c.icon}
                                    selected={value === c.value}
                                    onPress={() => {
                                        onChange(c.value)
                                        clearErrors('role')
                                    }}
                                />
                            ))}
                            {!!errors.role?.message && <Text className="text-red-600">{errors.role.message}</Text>}
                        </View>
                    )}
                />

                <View className="flex-1" />

                <AppButton title="Continue" onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} className="mt-2" />
            </View>
        </SafeAreaView>
    )
}

export default RoleScreen
