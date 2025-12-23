import { Pressable, Switch, Text, View } from 'react-native'

type WeekdayCardProps = {
    label: string
    isEnabled: boolean
    is24h: boolean
    startTime: string | null
    endTime: string | null
    onToggleEnabled: (value: boolean) => void
    onToggle24h: (value: boolean) => void
    onPressStart: () => void
    onPressEnd: () => void
    errorMessage?: string | null
    showError?: boolean
}

export const WeekdayCard = ({
    label,
    isEnabled,
    is24h,
    startTime,
    endTime,
    onToggleEnabled,
    onToggle24h,
    onPressStart,
    onPressEnd,
    errorMessage,
    showError,
}: WeekdayCardProps) => {
    const muted = !isEnabled

    return (
        <View className={`rounded-2xl border border-[#E5E7EB] bg-white p-4 ${muted ? 'opacity-50' : ''}`}>
            <Text className="text-base font-semibold text-[#111827]">{label}</Text>

            <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-[#111827]">Working this day</Text>
                <View onStartShouldSetResponderCapture={() => true} onMoveShouldSetResponderCapture={() => true}>
                    <Switch value={isEnabled} trackColor={{ true: '#0C2A63' }} onValueChange={onToggleEnabled} />
                </View>
            </View>

            {isEnabled ? (
                <View className="mt-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-[#111827]">24 hours</Text>
                        <View onStartShouldSetResponderCapture={() => true} onMoveShouldSetResponderCapture={() => true}>
                            <Switch value={is24h} trackColor={{ true: '#0C2A63' }} onValueChange={onToggle24h} />
                        </View>
                    </View>

                    {!is24h ? (
                        <View className="mt-3 flex-row items-center gap-3">
                            <Pressable onPress={onPressStart} className="flex-1 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2">
                                <Text className="text-xs text-[#9CA3AF]">From</Text>
                                <Text className="text-sm text-[#111827]">{startTime ?? '--:--'}</Text>
                            </Pressable>
                            <Pressable onPress={onPressEnd} className="flex-1 rounded-lg border border-[#D1D5DB] bg-white px-3 py-2">
                                <Text className="text-xs text-[#9CA3AF]">To</Text>
                                <Text className="text-sm text-[#111827]">{endTime ?? '--:--'}</Text>
                            </Pressable>
                        </View>
                    ) : null}
                </View>
            ) : null}

            {showError && errorMessage ? <Text className="mt-3 text-xs font-semibold text-[#EF4444]">{errorMessage}</Text> : null}
        </View>
    )
}
