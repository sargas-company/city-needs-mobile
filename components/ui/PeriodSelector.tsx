import React, { useState } from 'react'
import { View, Pressable, Modal, FlatList } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

import { AppText } from '@/components/ui/AppText'

type PeriodSelectorProps = {
    value: string
    options: string[]
    onChange: (value: string) => void
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Pressable onPress={() => setOpen(true)} className="flex-row items-center gap-1.5 rounded-pill border border-border bg-white px-4 py-2">
                <AppText className="font-poppins-medium text-[13px] text-brand">{value}</AppText>
                <Feather name="chevron-down" size={16} color="#0C2A63" />
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable className="flex-1 items-center justify-center bg-black/30" onPress={() => setOpen(false)}>
                    <View className="w-[200px] rounded-2xl bg-white p-2" style={dropdownShadow}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        onChange(item)
                                        setOpen(false)
                                    }}
                                    className={`rounded-xl px-4 py-3 ${item === value ? 'bg-[#F0F3FB]' : ''}`}
                                >
                                    <AppText className={`font-poppins-medium text-[14px] ${item === value ? 'text-brand' : 'text-text'}`}>
                                        {item}
                                    </AppText>
                                </Pressable>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

const dropdownShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
}
