import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { Path, useFormContext, useWatch } from 'react-hook-form'

import { BusinessHoursFormItem } from '@/components/forms/businessHoursSchema'
import type { BusinessInfoFormValues } from '@/components/forms/businessInfoSchema'

import { TimePickerModal } from './TimePickerModal'
import { WeekdayCard } from './WeekdayCard'

type TimeField = 'startTime' | 'endTime'

const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const BusinessHoursForm = () => {
    const {
        control,
        setValue,
        formState: { errors, isSubmitted },
    } = useFormContext<BusinessInfoFormValues>()

    const fieldName = 'businessHours' as const
    const days = useWatch({ control, name: fieldName }) ?? []
    const [activeTime, setActiveTime] = useState<{ dayIndex: number; field: TimeField } | null>(null)

    const activeValue = useMemo(() => {
        if (!activeTime) return null
        return days[activeTime.dayIndex]?.[activeTime.field] ?? null
    }, [activeTime, days])

    const buildPath = (index: number, key: keyof BusinessHoursFormItem) => {
        return `${fieldName}.${index}.${key}` as Path<BusinessInfoFormValues>
    }

    const toggleEnabled = (index: number, value: boolean) => {
        setValue(buildPath(index, 'isEnabled'), value, { shouldDirty: true })
        if (!value) {
            setValue(buildPath(index, 'is24h'), false, { shouldDirty: true })
            setValue(buildPath(index, 'startTime'), null, { shouldDirty: true })
            setValue(buildPath(index, 'endTime'), null, { shouldDirty: true })
            return
        }
        const currentStart = days[index]?.startTime
        const currentEnd = days[index]?.endTime
        if (!currentStart) {
            setValue(buildPath(index, 'startTime'), '09:00', { shouldDirty: true })
        }
        if (!currentEnd) {
            setValue(buildPath(index, 'endTime'), '18:00', { shouldDirty: true })
        }
    }

    const toggle24h = (index: number, value: boolean) => {
        setValue(buildPath(index, 'is24h'), value, { shouldDirty: true })
        if (value) {
            setValue(buildPath(index, 'startTime'), null, { shouldDirty: true })
            setValue(buildPath(index, 'endTime'), null, { shouldDirty: true })
        }
    }

    const openPicker = (index: number, field: TimeField) => {
        setActiveTime({ dayIndex: index, field })
    }

    const onSelectTime = (value: string) => {
        if (!activeTime) return
        setValue(buildPath(activeTime.dayIndex, activeTime.field), value, { shouldDirty: true })
    }

    return (
        <View className="gap-4">
            <View className="gap-1">
                <Text className="text-lg font-semibold text-[#111827]">Business Hours</Text>
                <Text className="text-sm text-[#6B7280]">Set your weekly schedule</Text>
            </View>

            <View className="gap-3">
                {days.map((day, index) => {
                    const dayError = (errors.businessHours?.[index] as { message?: string } | undefined)?.message
                    return (
                        <WeekdayCard
                            key={day.weekday}
                            label={weekLabels[index]}
                            isEnabled={day.isEnabled}
                            is24h={day.is24h ?? false}
                            startTime={day.startTime ?? null}
                            endTime={day.endTime ?? null}
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

            <TimePickerModal visible={!!activeTime} value={activeValue} onSelect={onSelectTime} onClose={() => setActiveTime(null)} />
        </View>
    )
}
