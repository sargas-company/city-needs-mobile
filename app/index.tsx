import { Redirect } from 'expo-router'

import { useOnboarding } from '@/hooks/useOnboarding'

const Index = () => {
    const { isCompleted, isLoading } = useOnboarding()

    if (isLoading) {
        return null
    }

    if (!isCompleted) {
        return <Redirect href="/(onboarding)/welcome" />
    }

    return <Redirect href="/(protected)/gate" />
    // return <Redirect href="/(protected)/(onboarding)/provider/business-info" />
}

export default Index
