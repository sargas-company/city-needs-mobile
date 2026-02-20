import { Redirect } from 'expo-router'

// ══════════════════════════════════════════════════════════════════════════════
// MINIMAL TEST BUILD - iOS 26 TAB DEBUGGING
// Direct redirect to test tabs, no auth/onboarding logic
// ══════════════════════════════════════════════════════════════════════════════

export default function Index() {
    return <Redirect href="/(test-tabs)" />
}
