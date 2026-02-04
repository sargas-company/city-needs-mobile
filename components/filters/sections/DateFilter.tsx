import React, { useMemo } from 'react'
import { View } from 'react-native'
// @ts-ignore
import { Calendar, type DateData, type MarkedDates } from 'react-native-calendars'

import { AppText } from '@/components/ui/AppText'

type Props = {
    value: string | null
    onChange: (value: string | null) => void
}

const TODAY = new Date().toISOString().split('T')[0]

const CALENDAR_THEME = {
    todayTextColor: '#0C2A63',
    arrowColor: '#0C2A63',
    selectedDayBackgroundColor: '#e89f48',
    selectedDayTextColor: '#ffffff',
    textDayFontFamily: 'Poppins_400Regular',
    textMonthFontFamily: 'Poppins_600SemiBold',
    textDayHeaderFontFamily: 'Poppins_500Medium',
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
}

/**
 * Get all weekend dates (Sa/Su) for the visible month range.
 * Returns marked dates with orange text styling.
 */
function getWeekendMarks(baseDate: string): MarkedDates {
    const [year, month] = baseDate.split('-').map(Number)
    const marks: MarkedDates = {}

    // Cover current month + buffer
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay()
        if (day === 0 || day === 6) {
            const key = d.toISOString().split('T')[0]
            marks[key] = { customStyles: { text: { color: '#e89f48' } } }
        }
    }

    return marks
}

export function DateFilter({ value, onChange }: Props) {
    const [visibleMonth, setVisibleMonth] = React.useState(TODAY)

    const markedDates = useMemo<MarkedDates>(() => {
        const weekends = getWeekendMarks(visibleMonth)

        if (value) {
            weekends[value] = {
                ...weekends[value],
                selected: true,
                selectedColor: '#e89f48',
                selectedTextColor: '#ffffff',
            }
        }

        return weekends
    }, [value, visibleMonth])

    const handleDayPress = (day: DateData) => {
        onChange(day.dateString === value ? null : day.dateString)
    }

    return (
        <View className="mb-5">
            <AppText className="mb-2 text-subtitle font-poppins-semibold text-text">Date</AppText>
            <Calendar
                minDate={TODAY}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                onMonthChange={(month: DateData) => setVisibleMonth(month.dateString)}
                markingType="custom"
                theme={CALENDAR_THEME}
            />
        </View>
    )
}
