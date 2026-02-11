const baseConfig = require('./app.json')

// Get the API key from environment variable (works in EAS builds with secrets)
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? ''

module.exports = {
    ...baseConfig,
    expo: {
        ...baseConfig.expo,
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
            [
                'react-native-maps',
                {
                    googleMapsApiKey,
                },
            ],
        ],
    },
}
