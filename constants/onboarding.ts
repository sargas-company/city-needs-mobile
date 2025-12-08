// import onboarding1 from '@/assets/images/onboarding1.png'
// import onboarding2 from '@/assets/images/onboarding2.png'
// import onboarding3 from '@/assets/images/onboarding3.png'

export type OnboardingSlide = {
    id: number
    title: string
    description: string
    // image: ImageSourcePropType,
    image: any
}

export const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        title: 'The perfect ride is just a tap away!',
        description: 'Your journey begins with Ryde. Find your ideal ride effortlessly.',
        image: '',
    },
    {
        id: 2,
        title: 'Best car in your hands with Ryde',
        description: 'Discover the convenience of finding your perfect ride with Ryde',
        image: '',
    },
    {
        id: 3,
        title: "Your ride, your way. Let's go!",
        description: 'Enter your destination, sit back, and let us take care of the rest.',
        image: '',
    },
]

export const selectLastOnboardingIndex = (total: number) => Math.max(total - 1, 0)

export const isLastOnboardingSlide = (index: number, total: number) => index >= selectLastOnboardingIndex(total)
