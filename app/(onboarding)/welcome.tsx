import { useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Swiper from 'react-native-swiper'

import { useOnboarding } from '@/hooks/useOnboarding'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'

const DOT_CLASSNAME = 'w-[32px] h-[4px] mx-1 rounded-full'

const Welcome = () => {
    const router = useRouter()
    const swiperRef = useRef<Swiper | null>(null)
    const { slides, lastIndex, isCompleted, isLoading, markCompleted } = useOnboarding()
    const [activeIndex, setActiveIndex] = useState(0)

    const navigateToAuth = useCallback(() => {
        router.replace('/(auth)/sign-in')
    }, [router])

    // useEffect(() => {
    //     if (isCompleted && !isLoading) {
    //         navigateToAuth()
    //     }
    // }, [isCompleted, isLoading, navigateToAuth])

    const isLastSlide = useMemo(() => activeIndex >= lastIndex, [activeIndex, lastIndex])
    const primaryCtaLabel = useMemo(() => (isLastSlide ? 'Get Started' : 'Next'), [isLastSlide])

    const handleComplete = useCallback(async () => {
        await markCompleted()
        navigateToAuth()
    }, [markCompleted, navigateToAuth])

    const handleNext = useCallback(() => {
        if (isLastSlide) {
            handleComplete()
            return
        }

        swiperRef.current?.scrollBy(1, true)
    }, [handleComplete, isLastSlide])

    if (isLoading) {
        return null
    }

    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white px-1">
            <View className="w-full flex items-end p-5">
                <TouchableOpacity onPress={handleComplete} className="rounded-full bg-transparent px-4 py-2" accessibilityRole="button">
                    <AppText className="font-poppins-semibold text-brand">Skip</AppText>
                </TouchableOpacity>
            </View>

            <Swiper
                ref={swiperRef}
                loop={false}
                dot={<View className={`${DOT_CLASSNAME} bg-[#E2E8F0]`} />}
                activeDot={<View className={`${DOT_CLASSNAME} bg-[#0286FF]`} />}
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {slides.map((item) => (
                    <View key={item.id} className="flex items-center justify-center p-5">
                        <Image source={item.image} className="h-[300px] w-full" resizeMode="contain" />
                        <View className="mt-10 w-full flex flex-row items-center justify-center">
                            {/*<Text className="mx-10 text-center text-3xl font-bold text-black">{item.title}</Text>*/}
                            {/*<Text className="mx-10 text-center text-3xl font-bold text-black">{item.title}</Text>*/}

                            <AppText className="text-center font-poppins-semibold text-[25px] text-brand">{item.title}</AppText>
                        </View>
                    </View>
                ))}
            </Swiper>

            <View className={'w-11/12'}>
                <AppButton title={primaryCtaLabel} onPress={handleNext} loading={isLoading} disabled={isLoading} className={'mb-5'} />
            </View>
        </SafeAreaView>
    )
}

export default Welcome
