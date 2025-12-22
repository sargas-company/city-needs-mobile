import { useMemo } from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'

type TimePickerModalProps = {
    visible: boolean
    value?: string | null
    onSelect: (value: string) => void
    onClose: () => void
    title?: string
}

const buildTimeOptions = (stepMinutes: number) => {
    const options: string[] = []
    for (let hour = 0; hour < 24; hour += 1) {
        for (let minute = 0; minute < 60; minute += stepMinutes) {
            const hh = String(hour).padStart(2, '0')
            const mm = String(minute).padStart(2, '0')
            options.push(`${hh}:${mm}`)
        }
    }
    return options
}

export const TimePickerModal = ({ visible, value, onSelect, onClose, title = 'Select time' }: TimePickerModalProps) => {
    const options = useMemo(() => buildTimeOptions(30), [])

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
                <Pressable className="max-h-[70%] w-full rounded-2xl bg-white p-4" onPress={() => undefined}>
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-[#111827]">{title}</Text>
                        <Pressable onPress={onClose}>
                            <Text className="text-base text-[#0C2A63]">Close</Text>
                        </Pressable>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isActive = item === value
                            return (
                                <Pressable
                                    onPress={() => {
                                        onSelect(item)
                                        onClose()
                                    }}
                                    className={`rounded-lg px-3 py-2 ${isActive ? 'bg-[#E9EEF9]' : ''}`}
                                >
                                    <Text className={`text-sm ${isActive ? 'text-[#0C2A63] font-semibold' : 'text-[#111827]'}`}>{item}</Text>
                                </Pressable>
                            )
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}
