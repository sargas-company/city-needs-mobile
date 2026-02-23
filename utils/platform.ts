import { Platform } from 'react-native'

/**
 * iOS 26+ introduced "Liquid Glass" design language
 * Use this to conditionally render modern native UI vs classic fallback
 */
export const IS_IOS_LIQUID_GLASS = Platform.OS === 'ios' && Number(Platform.Version) >= 26

/**
 * Platform checks
 */
export const IS_IOS = Platform.OS === 'ios'
export const IS_ANDROID = Platform.OS === 'android'
export const IS_WEB = Platform.OS === 'web'

/**
 * iOS version as number (0 for non-iOS)
 */
export const IOS_VERSION = Platform.OS === 'ios' ? Number(Platform.Version) : 0

/**
 * Check if iOS version is at least the specified version
 */
export const isIOSVersionAtLeast = (version: number): boolean => {
    return Platform.OS === 'ios' && Number(Platform.Version) >= version
}
