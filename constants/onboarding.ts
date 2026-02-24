import { ImageSourcePropType } from 'react-native'

import onboarding1 from '@/assets/images/onboarding1.png'
import onboarding2 from '@/assets/images/onboarding2.png'
import onboarding3 from '@/assets/images/onboarding3.png'

export type OnboardingSlide = {
    id: number
    title: string
    image: ImageSourcePropType
}

export const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Support local families,\nhome businesses, and\nmicro-entrepreneurs!',
        image: onboarding1,
    },
    {
        id: 2,
        title: 'See who’s nearby and book\n instantly — no middleman\n fees',
        image: onboarding2,
    },
    {
        id: 3,
        title: 'Farmers, caterers,\n plumbers — all in\n one place.',
        image: onboarding3,
    },
]

export const selectLastOnboardingIndex = (total: number) => Math.max(total - 1, 0)

export const isLastOnboardingSlide = (index: number, total: number) => index >= selectLastOnboardingIndex(total)
