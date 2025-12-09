import { useCallback, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { isLastOnboardingSlide, onboardingSlides, selectLastOnboardingIndex } from '@/constants/onboarding'

const ONBOARDING_STORAGE_KEY = 'onboardingCompleted'

export const useOnboarding = () => {
    const slides = useMemo(() => onboardingSlides, [])
    const lastIndex = useMemo(() => selectLastOnboardingIndex(slides.length), [slides.length])

    const [isCompleted, setIsCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const hydrate = async () => {
            try {
                const flag = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY)
                setIsCompleted(flag === 'true')
            } catch (error) {
                console.warn('Failed to read onboarding flag', error)
            } finally {
                setIsLoading(false)
            }
        }

        void hydrate()
    }, [])

    const markCompleted = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
        setIsCompleted(true)
    }, [])

    return {
        slides,
        lastIndex,
        isCompleted,
        isLoading,
        markCompleted,
        isLastSlide: (index: number) => isLastOnboardingSlide(index, slides.length),
    }
}
