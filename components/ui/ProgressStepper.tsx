// ProgressStepper.tsx
import React, { useMemo } from 'react'
import { Text, View, ViewStyle } from 'react-native'

type StepItem = { label: string; key?: string }

type Props = {
    steps: (string | StepItem)[]
    currentStep: number // 1..steps.length
    title?: string // "Your Progress"
    showLabels?: boolean // подписи над полосками (как на скрине с Business Info...)
    showFooter?: boolean // "Step X of N · Label"

    completedColor?: string
    activeColor?: string
    pendingColor?: string

    barHeight?: number
    gap?: number
}

export const ProgressStepper: React.FC<Props> = ({
    steps,
    currentStep,
    title,
    showLabels = false,
    showFooter = true,
    completedColor = 'bg-brand',
    activeColor = 'bg-brand',
    pendingColor = '#E5E7EB',
    barHeight = 6,
    gap = 8,
}) => {
    const normalizedSteps = useMemo<StepItem[]>(() => steps.map((s) => (typeof s === 'string' ? { label: s } : s)), [steps])

    const total = normalizedSteps.length
    const safeCurrent = Math.min(Math.max(1, currentStep), Math.max(1, total))
    const activeIdx = safeCurrent - 1
    const activeLabel = normalizedSteps[activeIdx]?.label ?? ''

    const segmentStyleBase: ViewStyle = {
        flex: 1,
        height: barHeight,
        borderRadius: barHeight / 2,
    }

    const segmentBgClass = (idx: number) => {
        if (idx < activeIdx) return 'bg-brand'
        if (idx === activeIdx) return 'bg-brand'
        return 'bg-border'
    }

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center ">
                {!!title && <Text className="text-base font-semibold text-[#111827]">{title}</Text>}
                {showFooter && (
                    <Text className="ml-auto mt-2 text-sm font-medium text-[#0C2A63]">
                        Step {safeCurrent} of {total}
                    </Text>
                )}
            </View>

            {showLabels && (
                <View className="mt-3 flex-row">
                    {normalizedSteps.map((s, idx) => {
                        const isActive = idx === activeIdx
                        return (
                            <View key={s.key ?? `${s.label}-${idx}`} style={{ flex: 1, marginRight: idx === total - 1 ? 0 : gap }}>
                                <Text className={`text-center text-sm ${isActive ? 'text-brand font-semibold' : 'text-text-muted font-medium'}`}>
                                    {s.label}
                                </Text>
                            </View>
                        )
                    })}
                </View>
            )}

            <View className={showLabels ? 'mt-2 flex-row' : 'mt-3 flex-row'}>
                {normalizedSteps.map((s, idx) => (
                    <View
                        key={s.key ?? `${s.label}-${idx}-bar`}
                        className={`flex-1 rounded-full ${segmentBgClass(idx)}`}
                        style={{ height: barHeight, marginRight: idx === total - 1 ? 0 : gap }}
                    />
                ))}
            </View>
        </View>
    )
}
