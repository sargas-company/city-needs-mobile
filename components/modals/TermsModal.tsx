import React from 'react'
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native'

import { AppText } from '@/components/ui/AppText'

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'http://admin-cn.sargas.io/privacy'

interface IPropsTermsModal {
    visible: boolean
    onClose: () => void
}
const TermsModal: React.FC<IPropsTermsModal> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View style={{ height: '80%' }} className="rounded-t-3xl bg-white px-6 pt-4 pb-6">
                    <View className="mb-3 items-center">
                        <View className="h-1.5 w-14 rounded-full bg-border" />
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <AppText className="font-poppins-semibold text-lg text-brand">Terms & Privacy Policy</AppText>
                    </View>

                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator>
                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">1. Introduction</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            By creating an account, you agree that we may process your personal data in accordance with this Terms & Privacy Policy.
                            We use your information to create and manage your account, provide our services, and improve your overall experience.
                        </AppText>

                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">2. Use of the Service</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            You agree to provide accurate information and keep your account credentials secure. You are responsible for all activities
                            that occur under your account. You must not misuse the platform, attempt to access other users&apos; data, or use the
                            service for illegal activities.
                        </AppText>

                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">3. Data & Privacy</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            We may store your contact details, profile information, and activity data to operate the platform. We do not sell your
                            personal data to third parties. Some trusted partners may process limited data on our behalf, strictly for providing core
                            functionality such as authentication, analytics, or notifications.
                        </AppText>

                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">4. Cookies & Tracking</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            We may use cookies or similar technologies to remember your preferences and measure how the app is used. You can disable
                            certain tracking technologies in your device settings, but some features may stop working correctly.
                        </AppText>

                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">5. Changes to this Policy</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            We may update these Terms & Privacy Policy from time to time. When we make material changes, we will let you know, for
                            example, through an in-app notification or by updating the date at the top of this page.
                        </AppText>

                        <AppText className="mb-2 font-poppins-semibold text-sm text-text">6. Contact</AppText>
                        <AppText className="mb-4 font-poppins text-sm leading-5 text-text-muted">
                            If you have any questions about these terms or how we handle your data, please contact our support team.
                        </AppText>

                        <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                            <AppText className="font-poppins-medium text-sm text-brand underline">Read full Privacy Policy on our website</AppText>
                        </Pressable>
                    </ScrollView>

                    <Pressable onPress={onClose} className="mt-2 w-full items-center rounded-pill bg-brand px-4 py-3">
                        <AppText className="font-poppins-medium text-subtitle text-white">I understand</AppText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default TermsModal
