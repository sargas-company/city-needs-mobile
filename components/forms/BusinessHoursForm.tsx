import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { businessHoursFormSchema, BusinessHoursFormValues, DayScheduleForm } from './businessHoursSchema'
import { TimePickerModal } from './TimePickerModal'
import { WeekdayCard } from './WeekdayCard'

type TimeField = 'startTime' | 'endTime'

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const createDefaultDays = (): DayScheduleForm[] => [
    { weekday: 0, isEnabled: true, is24h: false, startTime: '09:00', endTime: '18:00' },
    { weekday: 1, isEnabled: true, is24h: false, startTime: '09:00', endTime: '18:00' },
    { weekday: 2, isEnabled: true, is24h: false, startTime: '09:00', endTime: '18:00' },
    { weekday: 3, isEnabled: true, is24h: false, startTime: '09:00', endTime: '18:00' },
    { weekday: 4, isEnabled: true, is24h: false, startTime: '09:00', endTime: '18:00' },
    { weekday: 5, isEnabled: false, is24h: false, startTime: null, endTime: null },
    { weekday: 6, isEnabled: false, is24h: false, startTime: null, endTime: null },
]

export const BusinessHoursForm = () => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting, isSubmitted },
    } = useForm<BusinessHoursFormValues>({
        resolver: zodResolver(businessHoursFormSchema),
        defaultValues: { days: createDefaultDays() },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const days = useWatch({ control, name: 'days' }) ?? []
    const [activeTime, setActiveTime] = useState<{ dayIndex: number; field: TimeField } | null>(null)

    const activeValue = useMemo(() => {
        if (!activeTime) return null
        return days[activeTime.dayIndex]?.[activeTime.field] ?? null
    }, [activeTime, days])

    const toggleEnabled = (index: number, value: boolean) => {
        setValue(`days.${index}.isEnabled`, value, { shouldDirty: true })
        if (!value) {
            setValue(`days.${index}.is24h`, false, { shouldDirty: true })
            setValue(`days.${index}.startTime`, null, { shouldDirty: true })
            setValue(`days.${index}.endTime`, null, { shouldDirty: true })
            return
        }
        const currentStart = days[index]?.startTime
        const currentEnd = days[index]?.endTime
        if (!currentStart) {
            setValue(`days.${index}.startTime`, '09:00', { shouldDirty: true })
        }
        if (!currentEnd) {
            setValue(`days.${index}.endTime`, '18:00', { shouldDirty: true })
        }
    }

    const toggle24h = (index: number, value: boolean) => {
        setValue(`days.${index}.is24h`, value, { shouldDirty: true })
        if (value) {
            setValue(`days.${index}.startTime`, null, { shouldDirty: true })
            setValue(`days.${index}.endTime`, null, { shouldDirty: true })
        }
    }

    const openPicker = (index: number, field: TimeField) => {
        setActiveTime({ dayIndex: index, field })
    }

    const onSelectTime = (value: string) => {
        if (!activeTime) return
        setValue(`days.${activeTime.dayIndex}.${activeTime.field}`, value, { shouldDirty: true })
    }

    const onSubmit = async (_values: BusinessHoursFormValues) => {
        return
    }

    return (
        <View className="gap-4">
            <View className="gap-1">
                <Text className="text-lg font-semibold text-[#111827]">Business Hours</Text>
                <Text className="text-sm text-[#6B7280]">Set your weekly schedule</Text>
            </View>

            <View className="gap-3">
                {days.map((day, index) => {
                    const dayError = (errors.days?.[index] as { message?: string } | undefined)?.message
                    return (
                        <WeekdayCard
                            key={day.weekday}
                            label={weekLabels[index]}
                            isEnabled={day.isEnabled}
                            is24h={day.is24h}
                            startTime={day.startTime}
                            endTime={day.endTime}
                            onToggleEnabled={(value) => toggleEnabled(index, value)}
                            onToggle24h={(value) => toggle24h(index, value)}
                            onPressStart={() => openPicker(index, 'startTime')}
                            onPressEnd={() => openPicker(index, 'endTime')}
                            errorMessage={dayError}
                            showError={isSubmitted}
                        />
                    )
                })}
            </View>

            <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`mt-2 w-full items-center rounded-full bg-[#0C2A63] px-4 py-3 ${isSubmitting ? 'opacity-60' : ''}`}
            >
                <Text className="text-base font-semibold text-white">Save</Text>
            </Pressable>

            <TimePickerModal visible={!!activeTime} value={activeValue} onSelect={onSelectTime} onClose={() => setActiveTime(null)} />
        </View>
    )
}
