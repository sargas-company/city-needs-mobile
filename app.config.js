const baseConfig = require('./app.json')

// Get the API key from environment variable (works in EAS builds with secrets)
// Try both: GOOGLE_MAPS_API_KEY (secret) and EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (plain text)
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

module.exports = {
    ...baseConfig,
    expo: {
        ...baseConfig.expo,
        ios: {
            ...baseConfig.expo.ios,
            config: {
                googleMapsApiKey,
            },
        },
        android: {
            ...baseConfig.expo.android,
            config: {
                googleMaps: {
                    apiKey: googleMapsApiKey,
                },
            },
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
        ],
    },
}
