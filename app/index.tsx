import { Redirect } from 'expo-router'

import { useOnboarding } from '@/hooks/useOnboarding'
import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus, selectIsAuth } from '@/store/features/auth/auth.selectors'

export default function Index() {
    const { isCompleted, isLoading } = useOnboarding()
    const status = useAppSelector(selectAuthStatus)
    const isAuth = useAppSelector(selectIsAuth)

    if (isLoading || status === 'loading') {
        return null
    }

    if (!isCompleted) {
        return <Redirect href="/(onboarding)/welcome" />
    }

    if (!isAuth) {
        return <Redirect href="/(auth)/sign-in" />
    }

    return <Redirect href="/(protected)/(tabs)" />
}
