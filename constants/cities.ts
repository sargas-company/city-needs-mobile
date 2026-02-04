export const CITIES = {
    Saskatoon: {
        timeZone: 'America/Regina',
        countryCode: 'CA',
        state: 'SK',
        center: {
            lat: 52.1332,
            lng: -106.67,
        },
        autocompleteRadiusMeters: 30_000,
    },
    Regina: {
        timeZone: 'America/Regina',
        countryCode: 'CA',
        state: 'SK',
        center: {
            lat: 50.4452,
            lng: -104.6189,
        },
        autocompleteRadiusMeters: 20_000,
    },
} as const

export type City = keyof typeof CITIES

export const CITY_NAMES = Object.keys(CITIES) as City[]
