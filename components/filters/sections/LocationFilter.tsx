import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import Feather from '@expo/vector-icons/Feather'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import type { ProximityOption } from '@/components/filters/FilterModal.types'
import { CITY_NAMES, type City } from '@/constants/cities'
import { useEnsureLocation } from '@/hooks/useEnsureLocation'

type Props = {
    city: City | null
    onCityChange: (city: City | null) => void
    proximity: ProximityOption | null
    onProximityChange: (value: ProximityOption | null) => void
}

const PROXIMITY_CHIPS: { id: ProximityOption; label: string }[] = [
    { id: 'within_5km', label: 'Within 5 km' },
    { id: 'within_1km', label: 'Within 1 km' },
]

export function LocationFilter({ city, onCityChange, proximity, onProximityChange }: Props) {
    const { location } = useEnsureLocation()
    const hasLocation = !!location

    const cityItems = useMemo(() => [{ label: 'All Cities', value: '' }, ...CITY_NAMES.map((c) => ({ label: c, value: c }))], [])

    return (
        <View className="mb-5">
            <AppText className="mb-2 text-subtitle font-poppins-semibold text-text">Location</AppText>

            <Dropdown
                data={cityItems}
                labelField="label"
                valueField="value"
                value={city ?? ''}
                placeholder="All Cities"
                onChange={(item) => onCityChange((item.value as City) || null)}
                style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#CBCBCB',
                    paddingHorizontal: 12,
                    backgroundColor: '#ffffff',
                    marginBottom: 12,
                }}
                placeholderStyle={{
                    fontSize: 14,
                    color: '#9CA3AF',
                }}
                selectedTextStyle={{
                    fontSize: 14,
                    color: '#171717',
                }}
                itemTextStyle={{
                    fontSize: 14,
                    color: '#171717',
                }}
                containerStyle={{
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                }}
            />

            <View className="flex-row flex-wrap gap-2">
                {PROXIMITY_CHIPS.map((chip) => {
                    const active = proximity === chip.id
                    const disabled = !hasLocation
                    return (
                        <AppPressable
                            key={chip.id}
                            disabled={disabled}
                            disabledClassName=""
                            onPress={() => onProximityChange(active ? null : chip.id)}
                            className={
                                active
                                    ? 'flex-row items-center gap-1 rounded-xl bg-orange px-3 py-2'
                                    : disabled
                                      ? 'flex-row items-center rounded-xl border border-border bg-white px-3 py-2 opacity-40'
                                      : 'flex-row items-center rounded-xl border border-border bg-white px-3 py-2'
                            }
                        >
                            <AppText className={active ? 'text-status font-poppins-medium text-white' : 'text-status font-poppins-medium text-text'}>
                                {chip.label}
                            </AppText>
                            {active && <Feather name="x" size={14} color="#fff" />}
                        </AppPressable>
                    )
                })}
            </View>
        </View>
    )
}
