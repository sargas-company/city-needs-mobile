// Get the API key from environment variable (works in EAS builds with secrets)
// Try both: GOOGLE_MAPS_API_KEY (secret) and EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (plain text)
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

module.exports = {
    expo: {
        name: 'City Needs',
        slug: 'cityNeeds',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/app-icon/apple-devices/icon-ios-1024x1024.png',
        scheme: 'cityneedsfrontend',
        userInterfaceStyle: 'automatic',
        jsEngine: 'hermes',
        newArchEnabled: true,
        ios: {
            supportsTablet: false,
            infoPlist: {
                NSLocationWhenInUseUsageDescription: 'We use your location to show nearby providers and personalize results.',
                NSPhotoLibraryUsageDescription: 'We need access to your photo library to upload profile photos and business images.',
                ITSAppUsesNonExemptEncryption: false,
            },
            bundleIdentifier: 'com.cityneeds.app',
            config: {
                googleMapsApiKey,
            },
        },
        android: {
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png',
            },
            permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: 'com.cityneeds.app',
            versionCode: 1,
            config: {
                googleMaps: {
                    apiKey: googleMapsApiKey,
                },
            },
        },
        web: {
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                    dark: {
                        backgroundColor: '#000000',
                    },
                },
            ],
            'expo-secure-store',
            'expo-video',
            [
                'expo-image-picker',
                {
                    photosPermission: 'Allow $(PRODUCT_NAME) to access your photos to upload profile images.',
                },
            ],
            [
                'expo-location',
                {
                    locationWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location to show nearby providers.',
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
        extra: {
            router: {},
            eas: {
                projectId: '46c937e2-e8d6-458c-8053-020fdea31d8f',
            },
        },
    },
}
