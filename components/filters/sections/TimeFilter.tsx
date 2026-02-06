import React, { useCallback, useEffect, useRef } from 'react'
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

type Props = {
    hour: number
    minute: number
    period: 'AM' | 'PM'
    onHourChange: (h: number) => void
    onMinuteChange: (m: number) => void
    onPeriodChange: (p: 'AM' | 'PM') => void
    disabled?: boolean
}

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 3

const SLOT_STEP_MINUTES = 10

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 6 }, (_, i) => i * SLOT_STEP_MINUTES)
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM']

/** Snap minute to nearest slot step (backend requires alignment) */
export function snapMinuteToSlotStep(minute: number, step = SLOT_STEP_MINUTES): number {
    return Math.round(minute / step) * step
}

function WheelColumn<T extends string | number>({
    data,
    selectedValue,
    onSelect,
    formatLabel,
}: {
    data: T[]
    selectedValue: T
    onSelect: (value: T) => void
    formatLabel?: (value: T) => string
}) {
    const scrollRef = useRef<ScrollView>(null)
    const isUserScroll = useRef(true)

    const selectedIndex = data.indexOf(selectedValue)

    useEffect(() => {
        if (!isUserScroll.current) {
            isUserScroll.current = true
            return
        }
        const idx = data.indexOf(selectedValue)
        if (idx >= 0 && scrollRef.current) {
            scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false })
        }
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleMomentumEnd = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const y = e.nativeEvent.contentOffset.y
            const idx = Math.round(y / ITEM_HEIGHT)
            const clamped = Math.max(0, Math.min(idx, data.length - 1))
            isUserScroll.current = false
            onSelect(data[clamped])
        },
        [data, onSelect]
    )

    return (
        <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, flex: 1, overflow: 'hidden' }}>
            {/* Center highlight lines */}
            <View
                style={{
                    position: 'absolute',
                    top: ITEM_HEIGHT,
                    left: 8,
                    right: 8,
                    height: ITEM_HEIGHT,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: '#CBCBCB',
                }}
                pointerEvents="none"
            />
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleMomentumEnd}
                contentContainerStyle={{
                    paddingTop: ITEM_HEIGHT,
                    paddingBottom: ITEM_HEIGHT,
                }}
                nestedScrollEnabled
            >
                {data.map((item, index) => {
                    const isSelected = index === selectedIndex
                    const label = formatLabel ? formatLabel(item) : String(item)
                    return (
                        <View key={String(item)} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                            <AppText
                                className={isSelected ? 'text-[18px] font-poppins-semibold text-text' : 'text-[14px] font-poppins text-text-muted'}
                            >
                                {label}
                            </AppText>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

export function TimeFilter({ hour, minute, period, onHourChange, onMinuteChange, onPeriodChange, disabled }: Props) {
    const formatMinute = useCallback((m: number) => String(m).padStart(2, '0'), [])
    const minuteAligned = snapMinuteToSlotStep(minute)

    return (
        <View className="mb-5" style={disabled ? { opacity: 0.4 } : undefined} pointerEvents={disabled ? 'none' : 'auto'}>
            <AppText className="mb-2 text-subtitle font-poppins-semibold text-text">Time</AppText>
            <View className="flex-row">
                <WheelColumn data={HOURS} selectedValue={hour} onSelect={onHourChange} />
                <WheelColumn data={MINUTES} selectedValue={minuteAligned} onSelect={onMinuteChange} formatLabel={formatMinute} />
                <WheelColumn data={PERIODS} selectedValue={period} onSelect={onPeriodChange} />
            </View>
        </View>
    )
}
