import { View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

export default function TestAlphaScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <AppText className="text-2xl font-poppins-bold">Alpha Tab</AppText>
            <AppText className="mt-2 text-text-muted">Minimal test screen</AppText>
        </View>
    )
}
