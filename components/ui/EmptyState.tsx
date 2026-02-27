import React from 'react'
import { View } from 'react-native'

import NoDataImage from '@/assets/images/system/NoData.svg'
import { AppText } from '@/components/ui/AppText'

type EmptyStateProps = {
    /** Custom SVG image component. Defaults to NoDataImage */
    image?: React.ComponentType<{ width: number; height: number }>
    /** Image width. Defaults to 100 */
    imageWidth?: number
    /** Image height. Defaults to 100 */
    imageHeight?: number
    /** Text to display. Defaults to "No data found" */
    text?: string
    /** Custom className for the text */
    textClassName?: string
    /** Custom className for the container */
    className?: string
}
const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

export function EmptyState({
    image: ImageComponent = NoDataImage,
    imageWidth = 100,
    imageHeight = 100,
    text = 'No data found',
    textClassName,
    className,
}: EmptyStateProps) {
    return (
        <View className={cn('items-center py-6', className)}>
            <ImageComponent width={imageWidth} height={imageHeight} />
            <AppText className={cn('mt-2 text-base font-poppins-semibold text-gray-400', textClassName)}>{text}</AppText>
        </View>
    )
}
