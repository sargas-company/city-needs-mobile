import React from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'

import { AppInput } from '@/components/ui/AppInput'
import { AppPressable } from '@/components/ui/AppPressable'
import { AppText } from '@/components/ui/AppText'
import { WaveHeader } from '@/components/layout/WaveHeader'
import { HEADER_CONTENT_OFFSET } from '@/constants/layout'

// ── Mock data ──────────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
    { id: 'open-now', label: 'Open Now', active: false },
    { id: 'top-rated', label: 'Top Rated', active: true },
    { id: 'deals', label: 'Deals', active: false },
    { id: 'new', label: 'New', active: true },
    { id: 'fast-replies', label: 'Fast Replies', active: false },
    { id: 'best-price', label: 'Best Price', active: false },
]

const SERVICES = [
    {
        id: '1',
        name: 'Grooming',
        category: 'Pets',
        rating: 4.5,
        reviewCount: 112,
        location: 'Saskatoon',
        hours: '9 AM – 6 PM',
        priceRange: '$300 - $600',
        bookmarked: true,
        avatarColor: '#A3C9A8',
        initial: 'G',
    },
    {
        id: '2',
        name: 'Grooming',
        category: 'Pets',
        rating: 4.5,
        reviewCount: 112,
        location: 'Saskatoon',
        hours: '9 AM – 6 PM',
        priceRange: '$300 - $600',
        bookmarked: false,
        avatarColor: '#A3C9A8',
        initial: 'G',
    },
]

const EXPLORE_ITEMS = [
    { id: '1', title: 'Pets Grooming', category: 'Pets', rating: 4.5 },
    { id: '2', title: 'Pets Grooming', category: 'Pets', rating: 4.5 },
]

// ── Styles ─────────────────────────────────────────────────────────────────────

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}

// ── ServiceCard ────────────────────────────────────────────────────────────────

type Service = (typeof SERVICES)[number]

function ServiceCard({ service }: { service: Service }) {
    return (
        <View className="rounded-2xl bg-white px-5 py-4" style={cardShadow}>
            {/* Row 1: Avatar + Name + Category + Bookmark */}
            <View className="mb-2 flex-row items-center">
                <View className="mr-3 items-center justify-center rounded-xl" style={{ width: 56, height: 56, backgroundColor: service.avatarColor }}>
                    <AppText className="text-title font-poppins-bold text-white">{service.initial}.</AppText>
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <AppText className="text-subtitle font-poppins-bold text-text">{service.name}</AppText>
                        <View className="rounded-pill bg-orange px-3 py-0.5">
                            <AppText className="text-caption font-poppins-semibold text-white">{service.category}</AppText>
                        </View>
                    </View>

                    {/* Rating */}
                    <View className="mt-0.5 flex-row items-center gap-1">
                        <View className="h-3 w-3 rounded-full bg-[#F5C518]" />
                        <View className="h-3 w-3 rounded-full bg-brand" />
                        <AppText className="text-status text-text">({service.rating})</AppText>
                        <AppText className="text-status text-text-muted">{service.reviewCount} reviews</AppText>
                    </View>
                </View>

                <Feather name={service.bookmarked ? 'bookmark' : 'bookmark'} size={22} color="#0C2A63" />
            </View>

            {/* Row 3: Location | Hours | Fast replies */}
            <View className="mb-2 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={13} color="#e89f48" />
                    <AppText className="text-status text-text">{service.location}</AppText>
                </View>
                <AppText className="text-status text-border">|</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="clock" size={13} color="#8D8C92" />
                    <AppText className="text-status text-text">{service.hours}</AppText>
                </View>
                <AppText className="text-status text-border">|</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="zap" size={13} color="#e89f48" />
                    <AppText className="text-status text-text">Fast replies</AppText>
                </View>
            </View>

            {/* Row 4: Watch Reel · Call · Chat */}
            <View className="mb-3 flex-row items-center gap-2">
                <View className="flex-row items-center gap-1">
                    <Feather name="video" size={13} color="#0C2A63" />
                    <AppText className="text-status font-poppins-medium text-text">Watch Reel</AppText>
                </View>
                <AppText className="text-status text-text-muted">·</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="phone" size={13} color="#0C2A63" />
                    <AppText className="text-status font-poppins-medium text-text">Call</AppText>
                </View>
                <AppText className="text-status text-text-muted">·</AppText>
                <View className="flex-row items-center gap-1">
                    <Feather name="message-circle" size={13} color="#0C2A63" />
                    <AppText className="text-status font-poppins-medium text-text">Chat</AppText>
                </View>
            </View>

            {/* Row 5: Thumbnails + Price */}
            <View className="flex-row items-center gap-3">
                <View className="flex-row items-center">
                    <View className="h-12 w-12 rounded-lg bg-[#D9D9D9]" />
                    <View className="-ml-2 h-12 w-12 rounded-lg bg-[#C4C4C4]" />
                    <View className="-ml-2 h-12 w-12 items-center justify-center rounded-lg bg-[#B0B0B0]">
                        <Feather name="eye" size={16} color="#fff" />
                    </View>
                </View>

                <View className="flex-row items-baseline">
                    <AppText className="text-subtitle font-poppins-bold text-orange">{service.priceRange}</AppText>
                    <AppText className="text-status text-text-muted">/months</AppText>
                </View>
            </View>
        </View>
    )
}

// ── SearchScreen ───────────────────────────────────────────────────────────────

export default function SearchScreen() {
    return (
        <View className="flex-1 bg-white">
            <WaveHeader />

            <SafeAreaView className="flex-1" style={{ paddingTop: HEADER_CONTENT_OFFSET }}>
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-screen">
                    {/* ── Location row ─────────────────────────── */}
                    <View className="mb-3 flex-row items-center justify-between">
                        <View>
                            <AppText className="text-status text-text-muted">Location</AppText>
                            <View className="flex-row items-center gap-1">
                                <Feather name="map-pin" size={16} color="#e89f48" />
                                <AppText className="text-subtitle font-poppins-semibold text-text">Saskatoon</AppText>
                                <Feather name="chevron-down" size={16} color="#e89f48" />
                            </View>
                        </View>
                    </View>

                    {/* ── Search bar row ────────────────────────── */}
                    <View className="mb-3 flex-row items-center gap-3">
                        <View className="flex-1">
                            <AppInput
                                leftIcon={<Feather name="search" size={18} color="#8D8C92" />}
                                clearable
                                value="Grooming"
                                placeholder="Search services..."
                            />
                        </View>
                    </View>

                    {/* ── Filter chips ──────────────────────────── */}
                    <View className="mb-3 flex-row flex-wrap gap-2">
                        {FILTER_CHIPS.map((chip) => (
                            <AppPressable
                                key={chip.id}
                                className={
                                    chip.active
                                        ? 'flex-row items-center gap-1 rounded-xl bg-orange px-2.5 py-1.5'
                                        : 'flex-row items-center rounded-xl border border-border bg-white px-2.5 py-1.5'
                                }
                            >
                                <AppText
                                    className={
                                        chip.active
                                            ? 'text-sm text-status font-poppins-medium text-white'
                                            : 'text-sm text-status font-poppins-medium text-text'
                                    }
                                >
                                    {chip.label}
                                </AppText>
                                {chip.active && <Feather name="x" size={14} color="#fff" />}
                            </AppPressable>
                        ))}
                    </View>

                    {/* ── Sort & advanced filter row ────────────── */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <AppPressable className="flex-row items-center gap-1 rounded-pill bg-brand px-5 py-2.5">
                            <AppText className="text-status font-poppins-medium text-white">Sort by</AppText>
                            <Feather name="chevron-down" size={16} color="#fff" />
                        </AppPressable>
                        <AppPressable className="items-center justify-center rounded-xl bg-orange p-2.5">
                            <Feather name="sliders" size={20} color="#fff" />
                        </AppPressable>
                    </View>

                    {/* ── Results count ─────────────────────────── */}
                    <AppText className="mb-4 text-title font-poppins-bold text-brand">211 Results Found</AppText>

                    {/* ── Service cards ─────────────────────────── */}
                    <View className="mb-6 gap-4">
                        {SERVICES.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </View>

                    {/* ── Explore more section ──────────────────── */}
                    {/*<AppText className="mb-3 text-title font-poppins-bold text-brand">Explore more in Grooming</AppText>*/}
                </ScrollView>

                {/* Horizontal scroll outside of main ScrollView padding for edge-to-edge */}
                {/*<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-screen gap-3 pb-6">*/}
                {/*    {EXPLORE_ITEMS.map((item) => (*/}
                {/*        <View key={item.id} className="overflow-hidden rounded-2xl" style={{ width: 180, height: 200 }}>*/}
                {/*            <View className="flex-1 bg-[#C4C4C4]" />*/}
                {/*            <View className="absolute bottom-0 left-0 right-0 p-3">*/}
                {/*                <AppText className="text-base font-poppins-bold text-white">{item.title}</AppText>*/}
                {/*                <View className="mt-1 flex-row items-center gap-2">*/}
                {/*                    <View className="flex-row items-center gap-1">*/}
                {/*                        <View className="h-3 w-3 rounded-full bg-[#F5C518]" />*/}
                {/*                        <View className="h-3 w-3 rounded-full bg-brand" />*/}
                {/*                        <AppText className="text-caption text-white">({item.rating})</AppText>*/}
                {/*                    </View>*/}
                {/*                    <View className="rounded-pill bg-orange px-2 py-0.5">*/}
                {/*                        <AppText className="text-caption font-poppins-semibold text-white">{item.category}</AppText>*/}
                {/*                    </View>*/}
                {/*                </View>*/}
                {/*            </View>*/}
                {/*        </View>*/}
                {/*    ))}*/}
                {/*</ScrollView>*/}
            </SafeAreaView>
        </View>
    )
}
