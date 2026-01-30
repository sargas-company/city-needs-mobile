import React from 'react'
import { View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

type MonthData = {
    month: string
    views: number
    actions: number
}

type ActivityChartProps = {
    data: MonthData[]
}

const BAR_MAX_HEIGHT = 120
const BAR_WIDTH = 8
const BAR_GAP = 4

const ChartBar = ({ height, color }: { height: number; color: string }) => (
    <View
        style={{
            width: BAR_WIDTH,
            height: Math.max(height, 4),
            borderRadius: BAR_WIDTH / 2,
            backgroundColor: color,
        }}
    />
)

const LegendDot = ({ color, label }: { color: string; label: string }) => (
    <View className="flex-row items-center gap-1.5">
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <AppText className="font-poppins text-[12px] text-text-muted">{label}</AppText>
    </View>
)

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.flatMap((d) => [d.views, d.actions]), 1)

    const scale = (val: number) => (val / maxValue) * BAR_MAX_HEIGHT

    return (
        <View className="rounded-2xl bg-white px-4 pb-4 pt-3" style={cardShadow}>
            <View className="mb-4 flex-row items-center justify-center gap-5">
                <LegendDot color="#e89f48" label="Views" />
                <LegendDot color="#0C2A63" label="Actions" />
            </View>

            <View className="flex-row items-end justify-between">
                {data.map((item) => (
                    <View key={item.month} className="items-center">
                        <View className="flex-row items-end" style={{ gap: BAR_GAP, height: BAR_MAX_HEIGHT }}>
                            <ChartBar height={scale(item.views)} color="#e89f48" />
                            <ChartBar height={scale(item.actions)} color="#0C2A63" />
                        </View>
                        <AppText className="mt-2 font-poppins text-[11px] text-text-muted">{item.month}</AppText>
                    </View>
                ))}
            </View>
        </View>
    )
}

const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
}
