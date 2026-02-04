# Google Maps Setup Guide

This document provides the minimal steps required to configure Google Maps for iOS and Android in this Expo-managed React Native project.

## Prerequisites

- `react-native-maps` is already installed via `expo install react-native-maps`
- Google Maps API keys are required for both platforms

## 1. Obtain Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
4. Create API credentials:
   - For **Android**: Create an API key and restrict it to Android apps (add your app's package name and SHA-1 certificate fingerprint)
   - For **iOS**: Create an API key and restrict it to iOS apps (add your app's bundle identifier)

## 2. Configure API Keys

### Option A: Using app.json (Current Setup)

Edit `app.json` and add your API keys:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

### Option B: Using Environment Variables (Recommended for Security)

1. Install expo-constants if not already installed:
   ```bash
   npx expo install expo-constants
   ```

2. Add to your `.env` file:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=your_ios_key_here
   EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=your_android_key_here
   ```

3. Update `app.json` to use environment variables:
   ```json
   {
     "expo": {
       "ios": {
         "config": {
           "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY}"
         }
       },
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY}"
           }
         }
       }
     }
   }
   ```

## 3. Build and Run

### Development Build

For Expo-managed projects, you need to create a development build after adding native modules:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Note**: `expo start` alone won't work for the first time after adding `react-native-maps`. You need to create a development build.

### Production Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 4. Permissions

Location permissions are already configured in `app.json`:

- **iOS**: `NSLocationWhenInUseUsageDescription` is set
- **Android**: `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are set

No additional configuration needed.

## 5. Testing

After building and running the app:

1. Navigate to the Map tab in the user section
2. You should see a Google Map centered on Rome, Italy
3. The map should be interactive (pan, zoom, rotate)
4. If you granted location permissions, your current location should be visible

## Troubleshooting

### Map shows blank/gray screen

- **Cause**: Invalid or missing API key
- **Solution**: Double-check your API keys in `app.json` and ensure the correct APIs are enabled in Google Cloud Console

### "Google Maps SDK for iOS/Android is not installed"

- **Cause**: Development build not created after installing `react-native-maps`
- **Solution**: Run `npx expo run:ios` or `npx expo run:android` to create a new development build

### Location not showing

- **Cause**: Location permissions not granted
- **Solution**: Check device settings and ensure location permissions are granted to the app

### Android: "Authorization failure" or "API key not valid"

- **Cause**: API key restrictions don't match your app's package name or SHA-1 fingerprint
- **Solution**: 
  1. Get your app's SHA-1: `cd android && ./gradlew signingReport`
  2. Add it to your API key restrictions in Google Cloud Console

### iOS: Map not loading

- **Cause**: API key restrictions don't match your app's bundle identifier
- **Solution**: Verify the bundle identifier in Google Cloud Console matches your app's bundle ID

## Architecture Notes

This implementation uses an **adapter pattern** to allow easy switching between map providers:

- **Domain types** (`src/features/map/types/map.types.ts`): Engine-agnostic types
- **Map facade** (`src/features/map/components/Map.tsx`): Single entry point for all screens
- **Adapters** (`src/features/map/adapters/`): Engine-specific implementations
- **Provider** (`src/features/map/context/MapProvider.tsx`): Runtime engine selection

To switch to a different map provider (e.g., Mapbox) in the future:
1. Create a new adapter in `src/features/map/adapters/mapbox/`
2. Update the `Map` component to handle the new engine
3. Change the `engine` prop in `MapProvider` (in `app/_layout.tsx`)

No changes to screens or business logic required!
