export const BOTTOM_SHEET_DEFAULTS = {
    overlayOpacity: 0.35,
    overlayColor: '#000000',
    radiusTop: 32,
    closeOnOverlayTap: true,
    panGestureEnabled: true,
    withHandle: true,
    openAnimationConfig: {
        timing: { duration: 280 },
        spring: { speed: 14, bounciness: 5 },
    },
    closeAnimationConfig: {
        timing: { duration: 250 },
        spring: { speed: 14, bounciness: 5 },
    },
} as const
