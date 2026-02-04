import React, { useMemo } from 'react'
import { View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

import { AppText } from '@/components/ui/AppText'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'

type Props = {
    value: string | null
    onChange: (value: string | null) => void
}

export function CategoryFilter({ value, onChange }: Props) {
    const { data: categories = [] } = useGetCategoriesQuery()

    const items = useMemo(() => [{ label: 'All Categories', value: '' }, ...categories.map((c) => ({ label: c.title, value: c.id }))], [categories])

    return (
        <View className="mb-5">
            <AppText className="mb-2 text-subtitle font-poppins-semibold text-text">Category</AppText>
            <Dropdown
                data={items}
                labelField="label"
                valueField="value"
                value={value ?? ''}
                placeholder="All Categories"
                onChange={(item) => onChange(item.value || null)}
                style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#CBCBCB',
                    paddingHorizontal: 12,
                    backgroundColor: '#ffffff',
                }}
                placeholderStyle={{
                    fontSize: 14,
                    color: '#9CA3AF',
                }}
                selectedTextStyle={{
                    fontSize: 14,
                    color: '#171717',
                }}
                itemTextStyle={{
                    fontSize: 14,
                    color: '#171717',
                }}
                containerStyle={{
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                }}
            />
        </View>
    )
}
