import { useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, Text, View, useWindowDimensions, ScrollView } from 'react-native'
import { Path, useFormContext, useWatch } from 'react-hook-form'

import { BusinessHoursFormItem } from '@/components/forms/businessHoursSchema'
import type { BusinessInfoFormValues } from '@/components/forms/businessInfoSchema'

import { TimePickerModal } from './TimePickerModal'
import { WeekdayCard } from './WeekdayCard'

type TimeField = 'startTime' | 'endTime'

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const BusinessHoursForm = () => {
    const {
        control,
        setValue,
        formState: { errors, isSubmitted },
    } = useFormContext<BusinessInfoFormValues>()

    const fieldName = 'businessHours' as const
    const days = useWatch({ control, name: fieldName }) ?? []
    const [activeTime, setActiveTime] = useState<{ dayIndex: number; field: TimeField } | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const listRef = useRef<FlatList<BusinessHoursFormItem>>(null)
    const { width: screenWidth } = useWindowDimensions()
    const cardWidth = screenWidth - 48

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

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                    {weekLabels.map((label, index) => {
                        const isActive = index === activeIndex
                        const isConfigured = days[index]?.isEnabled
                        return (
                            <Pressable
                                key={label}
                                onPress={() => {
                                    setActiveIndex(index)
                                    listRef.current?.scrollToIndex({ index, animated: true })
                                }}
                                className={`rounded-full px-3 py-1.5 ${isActive ? 'bg-[#0C2A63]' : 'bg-[#F3F4F6]'}`}
                            >
                                <View className="flex-row items-center gap-2">
                                    <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-[#111827]'}`}>{label}</Text>
                                    {isConfigured ? <View className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#0C2A63]'}`} /> : null}
                                </View>
                            </Pressable>
                        )
                    })}
                </View>
            </ScrollView>

            <FlatList
                ref={listRef}
                data={days}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.weekday)}
                getItemLayout={(_, index) => ({
                    length: cardWidth,
                    offset: cardWidth * index,
                    index,
                })}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth)
                    setActiveIndex(nextIndex)
                }}
                renderItem={({ item, index }) => {
                    const dayError = (errors.businessHours?.[index] as { message?: string } | undefined)?.message
                    return (
                        <View style={{ width: cardWidth, paddingRight: index === days.length - 1 ? 0 : 12 }}>
                            <WeekdayCard
                                label={weekLabels[index]}
                                isEnabled={item.isEnabled}
                                is24h={item.is24h ?? false}
                                startTime={item.startTime ?? null}
                                endTime={item.endTime ?? null}
                                onToggleEnabled={(value) => toggleEnabled(index, value)}
                                onToggle24h={(value) => toggle24h(index, value)}
                                onPressStart={() => openPicker(index, 'startTime')}
                                onPressEnd={() => openPicker(index, 'endTime')}
                                errorMessage={dayError}
                                showError={isSubmitted}
                            />
                        </View>
                    )
                }}
            />

            <TimePickerModal visible={!!activeTime} value={activeValue} onSelect={onSelectTime} onClose={() => setActiveTime(null)} />
        </View>
    )
}
