import { Pressable, Text, View } from 'react-native'

export type CategoryCardProps = {
    label: string
    selected: boolean
    onPress: () => void
}

export const CategoryCard = ({ label, selected, onPress }: CategoryCardProps) => {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-3 w-full flex-row items-center rounded-2xl border px-4 py-3 ${
                selected ? 'border-[#0C2A63] bg-[#EFF4FF]' : 'border-[#E5E7EB] bg-white'
            }`}
        >
            <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                    selected ? 'border-[#0C2A63] bg-[#0C2A63]' : 'border-[#D1D5DB] bg-white'
                }`}
            >
                {selected ? <Text className="text-xs font-semibold text-white">✓</Text> : null}
            </View>
            <Text className={selected ? 'text-base font-semibold text-[#0C2A63]' : 'text-base font-medium text-[#111827]'}>{label}</Text>
        </Pressable>
    )
}
