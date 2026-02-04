import React, { useCallback, useEffect, useState } from 'react'
import { Modal, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'

import { CategoryFilter } from './sections/CategoryFilter'
import { LocationFilter } from './sections/LocationFilter'
import { PriceFilter } from './sections/PriceFilter'
import { DateFilter } from './sections/DateFilter'
import { TimeFilter } from './sections/TimeFilter'
import { DEFAULT_FILTER_VALUES, type FilterModalProps, type FilterValues } from './FilterModal.types'

export function FilterModal({ visible, onClose, onApply, initialValues }: FilterModalProps) {
    const insets = useSafeAreaInsets()
    const [values, setValues] = useState<FilterValues>({ ...DEFAULT_FILTER_VALUES, ...initialValues })

    // Reinitialize when modal opens
    useEffect(() => {
        if (visible) {
            setValues({ ...DEFAULT_FILTER_VALUES, ...initialValues })
        }
    }, [visible, initialValues])

    const update = useCallback(<K extends keyof FilterValues>(key: K, val: FilterValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: val }))
    }, [])

    const handleReset = useCallback(() => {
        setValues({ ...DEFAULT_FILTER_VALUES })
    }, [])

    const handleApply = useCallback(() => {
        onApply(values)
        onClose()
    }, [values, onApply, onClose])

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                {/* Header */}
                <View className="flex-row items-center border-b border-border/30 px-4 pb-3 pt-2">
                    <AppPressable onPress={onClose} className="mr-3 p-1">
                        <Feather name="arrow-left" size={24} color="#171717" />
                    </AppPressable>
                    <AppText className="text-title font-poppins-semibold text-text">Filter</AppText>
                </View>

                {/* Content */}
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <CategoryFilter value={values.categoryId} onChange={(v) => update('categoryId', v)} />

                    <LocationFilter
                        city={values.city}
                        onCityChange={(v) => update('city', v)}
                        proximity={values.proximity}
                        onProximityChange={(v) => update('proximity', v)}
                    />

                    <PriceFilter value={values.priceMax} onChange={(v) => update('priceMax', v)} />

                    <DateFilter value={values.availabilityDate} onChange={(v) => update('availabilityDate', v)} />

                    <TimeFilter
                        hour={values.availabilityHour}
                        minute={values.availabilityMinute}
                        period={values.availabilityPeriod}
                        onHourChange={(v) => update('availabilityHour', v)}
                        onMinuteChange={(v) => update('availabilityMinute', v)}
                        onPeriodChange={(v) => update('availabilityPeriod', v)}
                    />
                </ScrollView>

                {/* Footer */}
                <View className="flex-row gap-3 border-t border-border/30 px-4 pb-2 pt-3">
                    <AppPressable onPress={handleReset} className="flex-1 items-center rounded-pill border border-orange py-3">
                        <AppText className="text-body font-poppins-semibold text-orange">Reset Filter</AppText>
                    </AppPressable>
                    <AppPressable onPress={handleApply} className="flex-1 items-center rounded-pill bg-orange py-3">
                        <AppText className="text-body font-poppins-semibold text-white">Apply</AppText>
                    </AppPressable>
                </View>
            </View>
        </Modal>
    )
}
