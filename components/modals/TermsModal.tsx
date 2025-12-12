import React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'

interface IPropsTermsModal {
    visible: boolean
    onClose: () => void
}
const TermsModal: React.FC<IPropsTermsModal> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/40 justify-end">
                <View style={{ height: '80%' }} className="rounded-t-3xl bg-white px-6 pt-4 pb-6">
                    <View className="mb-3 items-center">
                        <View className="h-1.5 w-14 rounded-full bg-gray-300" />
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-lg font-semibold text-[#0C2A63]">Terms & Privacy Policy</Text>
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator>
                        <Text className="mb-2 text-sm font-semibold text-gray-800">1. Introduction</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            By creating an account, you agree that we may process your personal data in accordance with this Terms & Privacy Policy.
                            We use your information to create and manage your account, provide our services, and improve your overall experience.
                        </Text>

                        <Text className="mb-2 text-sm font-semibold text-gray-800">2. Use of the Service</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            You agree to provide accurate information and keep your account credentials secure. You are responsible for all activities
                            that occur under your account. You must not misuse the platform, attempt to access other users&apos; data, or use the
                            service for illegal activities.
                        </Text>

                        <Text className="mb-2 text-sm font-semibold text-gray-800">3. Data & Privacy</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            We may store your contact details, profile information, and activity data to operate the platform. We do not sell your
                            personal data to third parties. Some trusted partners may process limited data on our behalf, strictly for providing core
                            functionality such as authentication, analytics, or notifications.
                        </Text>

                        <Text className="mb-2 text-sm font-semibold text-gray-800">4. Cookies & Tracking</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            We may use cookies or similar technologies to remember your preferences and measure how the app is used. You can disable
                            certain tracking technologies in your device settings, but some features may stop working correctly.
                        </Text>

                        <Text className="mb-2 text-sm font-semibold text-gray-800">5. Changes to this Policy</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            We may update these Terms & Privacy Policy from time to time. When we make material changes, we will let you know, for
                            example, through an in-app notification or by updating the date at the top of this page.
                        </Text>

                        <Text className="mb-2 text-sm font-semibold text-gray-800">6. Contact</Text>
                        <Text className="mb-4 text-sm leading-5 text-gray-600">
                            If you have any questions about these terms or how we handle your data, please contact our support team.
                        </Text>
                    </ScrollView>

                    <Pressable onPress={onClose} className="mt-2 w-full items-center rounded-full bg-blue-600 px-4 py-3">
                        <Text className="text-base font-semibold text-white">I understand</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default TermsModal
