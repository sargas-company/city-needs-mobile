/**
 * Google Maps custom style (Map Style JSON).
 * Hides POIs, transit, and road label icons; keeps roads, parks, water, and text labels.
 */
export const mapStyle = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]
