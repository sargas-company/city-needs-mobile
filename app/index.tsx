import { Redirect } from 'expo-router'

export default function Index() {
    const useAuth = () => {
        return { isLoaded: false, isSignedIn: true }
    }
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) return null

    return isSignedIn ? <Redirect href="/(protected)/home" /> : <Redirect href="/(auth)/welcome" />
}
