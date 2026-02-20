// import React, { useMemo } from 'react'
// import { ActivityIndicator, FlatList, View } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { useLocalSearchParams, useRouter } from 'expo-router'
//
// import { useStickyBottomBar } from '@/hooks/useStickyBottomBar'
// import { BookingStepHeader } from '@/components/booking/BookingStepHeader'
// import { ServiceSelectCard } from '@/components/booking/ServiceSelectCard'
// import { AppButton } from '@/components/ui/AppButton'
// import { AppText } from '@/components/ui/AppText'
// import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
// import { toggleService } from '@/store/features/booking-flow/bookingFlow.slice'
// import { selectSelectedServiceIds } from '@/store/features/booking-flow/bookingFlow.selectors'
// import { useGetPublicBusinessServicesQuery } from '@/store/features/public-business/publicBusinessApi'
// import type { PublicServiceDto } from '@/store/features/public-business/publicBusiness.types'
// import { useAppDispatch, useAppSelector } from '@/store/hooks'
//
// const SelectServicesScreen = () => {
//     const { businessId } = useLocalSearchParams<{ businessId: string }>()
//     const router = useRouter()
//     const dispatch = useAppDispatch()
//     const selectedIds = useAppSelector(selectSelectedServiceIds)
//     const { data, isLoading, error } = useGetPublicBusinessServicesQuery(businessId!)
//
//     const { bottomBarStyle, contentPaddingBottom } = useStickyBottomBar()
//
//     const activeServices = useMemo(() => (data?.data ?? []).filter((s) => s.status === 'ACTIVE'), [data?.data])
//     const hasSelection = selectedIds.length > 0
//
//     const handleToggle = (id: string) => dispatch(toggleService(id))
//     const handleContinue = () => router.push(`/(protected)/user/book/${businessId}/select-datetime`)
//
//     const renderItem = ({ item }: { item: PublicServiceDto }) => (
//         <ServiceSelectCard
//             name={item.name}
//             price={item.price}
//             duration={item.duration}
//             selected={selectedIds.includes(item.id)}
//             onToggle={() => handleToggle(item.id)}
//         />
//     )
//
//     return (
//         <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
//             <BookingStepHeader title="Choose service" />
//
//             {isLoading ? (
//                 <View className="flex-1 items-center justify-center">
//                     <ActivityIndicator />
//                 </View>
//             ) : error ? (
//                 <View className="flex-1 items-center justify-center px-6">
//                     <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load services</AppText>
//                 </View>
//             ) : activeServices.length === 0 ? (
//                 <View className="flex-1 items-center justify-center px-6">
//                     <AppText className="text-center font-poppins-medium text-[14px] text-text-muted">No services available</AppText>
//                 </View>
//             ) : (
//                 <FlatList
//                     data={activeServices}
//                     keyExtractor={(item) => item.id}
//                     renderItem={renderItem}
//                     ListHeaderComponent={<AppText className="text-[18px] font-poppins-semibold text-[#0C2A63] mb-2">Grooming Center</AppText>}
//                     contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: contentPaddingBottom }}
//                     showsVerticalScrollIndicator={false}
//                 />
//             )}
//
//             {/* FIX: pointerEvents="box-none" prevents blocking tab bar touches */}
//             <View
//                 className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4"
//                 style={bottomBarStyle}
//                 pointerEvents="box-none"
//                 testID="sticky-bottom-bar-select-services"
//                 accessibilityLabel="sticky-bottom-bar-select-services"
//             >
//                 <AppButton title="Continue" onPress={handleContinue} disabled={!hasSelection} className="bg-[#0C2A63]" />
//             </View>
//         </SafeAreaView>
//     )
// }
//
// export default SelectServicesScreen

import React, { useMemo } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { BookingStepHeader } from '@/components/booking/BookingStepHeader'
import { ServiceSelectCard } from '@/components/booking/ServiceSelectCard'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'
import { toggleService } from '@/store/features/booking-flow/bookingFlow.slice'
import { selectSelectedServiceIds } from '@/store/features/booking-flow/bookingFlow.selectors'
import { useGetPublicBusinessServicesQuery } from '@/store/features/public-business/publicBusinessApi'
import type { PublicServiceDto } from '@/store/features/public-business/publicBusiness.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const FOOTER_HEIGHT = 72 // под твой дизайн (px-6 py-4 + кнопка)

const SelectServicesScreen = () => {
    const { businessId } = useLocalSearchParams<{ businessId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const selectedIds = useAppSelector(selectSelectedServiceIds)
    const { data, isLoading, error } = useGetPublicBusinessServicesQuery(businessId!)
    const insets = useSafeAreaInsets()

    const activeServices = useMemo(() => (data?.data ?? []).filter((s) => s.status === 'ACTIVE'), [data?.data])
    const hasSelection = selectedIds.length > 0

    const handleToggle = (id: string) => dispatch(toggleService(id))
    const handleContinue = () => router.push(`/(protected)/user/book/${businessId}/select-datetime`)

    const renderItem = ({ item }: { item: PublicServiceDto }) => (
        <ServiceSelectCard
            name={item.name}
            price={item.price}
            duration={item.duration}
            selected={selectedIds.includes(item.id)}
            onToggle={() => handleToggle(item.id)}
        />
    )

    // Сколько места резервируем снизу под: футер + safe area + (если нужно) таббар.
    // Если этот экран НЕ внутри tabs — можешь оставить только insets.bottom.
    const listBottomPadding = FOOTER_HEIGHT + Math.max(insets.bottom, 12)

    return (
        // ВАЖНО: edges без bottom, чтобы SafeArea не добавлял лишнее снизу и не “толкал” футер
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
            <BookingStepHeader title="Choose service" />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText className="text-center font-poppins-medium text-[14px] text-[#171717]">Failed to load services</AppText>
                </View>
            ) : activeServices.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <AppText className="text-center font-poppins-medium text-[14px] text-text-muted">No services available</AppText>
                </View>
            ) : (
                <FlatList
                    style={{ flex: 1 }} // ключ: список занимает всё пространство между header и footer
                    data={activeServices}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={<AppText className="text-[18px] font-poppins-semibold text-[#0C2A63] mb-2">Grooming Center</AppText>}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 8,
                        paddingBottom: listBottomPadding, // чтобы последний элемент не прятался под футером
                    }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Footer без absolute — всегда внизу за счёт flex layout */}
            <View className="bg-white px-6 py-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
                <AppButton title="Continue" onPress={handleContinue} disabled={!hasSelection} className="bg-[#0C2A63]" />
            </View>
        </SafeAreaView>
    )
}

export default SelectServicesScreen
