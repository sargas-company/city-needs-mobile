import { useCallback } from 'react'
import { Image, ScrollView, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'

import { useOnboarding } from '@/hooks/useOnboarding'
import { AppButton } from '@/components/ui/AppButton'
import { AppText } from '@/components/ui/AppText'
import { AppPressable } from '@/components/ui/AppPressable'
import Snail from '@/assets/images/snail.svg'
import manOne from '@/assets/images/man_one.png'
import family from '@/assets/images/family.png'

const PreOnboarding = () => {
    const router = useRouter()
    const { markCompleted } = useOnboarding()
    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    const heroHeight = Math.min(Math.max(screenHeight * 0.5, 280), 420)

    const handleFindServices = useCallback(() => {
        router.push('/(onboarding)/welcome')
    }, [router])

    const handleLogin = useCallback(async () => {
        await markCompleted()
        router.replace('/(auth)/sign-in')
    }, [markCompleted, router])

    return (
        <>
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
                <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Hero Image Collage */}
                    <View style={{ height: heroHeight }} className="w-full h-full">
                        <View className="absolute overflow-hidden">
                            <Image source={manOne} />
                        </View>

                        <View
                            style={{
                                top: heroHeight * 0.29,
                                right: 0,
                            }}
                            className="absolute "
                        >
                            <Image source={family} resizeMode="cover" />
                        </View>

                        <View className="absolute rounded-full bg-[#F7F7F7] w-[120px] h-[120px] top-0 right-0 rotate-[240deg]">
                            <View className={'rotate-[50deg]'}>
                                <Snail />
                            </View>
                        </View>

                        <View
                            className="absolute bg-orange rounded-pill px-4 py-2 border-2 border-white shadow-[0_0_4px_0_#00000030]"
                            style={{ top: heroHeight * 0.38, left: screenWidth * 0.25 }}
                        >
                            <AppText className="font-poppins-semibold text-white text-base">#Plumbing Help</AppText>
                        </View>

                        <View
                            className="absolute bg-brand rounded-pill px-4 py-2 border-2 border-white shadow-[0_0_4px_0_#00000030]"
                            style={{ bottom: heroHeight * 0.01 - 75, left: screenWidth * 0.55 }}
                        >
                            <AppText className="font-poppins-semibold text-white text-base">#Farmer Shop</AppText>
                        </View>
                    </View>

                    {/* Logo + Tagline */}
                    <View className="px-screen  " style={{ alignSelf: 'flex-start' }}>
                        <View className={'flex relative items-center justify-center w-[140px] h-[140px] rounded-full bg-[#F7F7F7] rotate-45 '}>
                            <Snail />
                        </View>
                    </View>

                    {/* Headline */}
                    <View className="flex-1" />
                    <View className="flex-1" />
                    <View className="px-2 mt-4 mb-6">
                        <AppText className="font-poppins-semibold text-[26px] leading-[36px] text-brand text-center">
                            Discover local talent,{'\n'}support small businesses,{'\n'}and grow your community
                        </AppText>
                    </View>

                    <View className="flex-1" />

                    {/* CTA Button */}
                    <View className="px-screen mb-4">
                        <AppButton title="Find Local Services Now" onPress={handleFindServices} />
                    </View>

                    {/* Login Link */}
                    <View className="flex-row items-center justify-center mb-6">
                        <AppText className="font-poppins-medium text-base text-text">Already Have An Account? </AppText>
                        <AppPressable onPress={handleLogin}>
                            <AppText className="font-poppins-semibold text-base text-brand underline">Login</AppText>
                        </AppPressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

export default PreOnboarding
