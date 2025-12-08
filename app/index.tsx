import { Redirect } from 'expo-router'

import { useOnboarding } from '@/hooks/useOnboarding'

const useAuth = () => {
    // TODO: replace with real auth selector; kept synchronous for now.
    return { isLoaded: true, isSignedIn: true }
}

export default function Index() {
    const { isCompleted, isLoading } = useOnboarding()
    const { isLoaded, isSignedIn } = useAuth()

    // if (isLoading || !isLoaded) {
    //     return null
    // }

    if (!isCompleted) {
        return <Redirect href="/(onboarding)/welcome" />
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />
    }

    return <Redirect href="/(protected)/home" />
}
