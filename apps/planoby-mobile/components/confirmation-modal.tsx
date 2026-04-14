import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Text } from '@kit/native-ui/text';
import { useTheme } from '@kit/native-ui/theme-provider';
import * as NavigationBar from 'expo-navigation-bar';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

interface ConfirmationModalProps {
    isVisible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    actionSheetRef: React.RefObject<ActionSheetRef>;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    actionSheetRef,
}) => {
    const { isDark } = useTheme();
    const colors = useThemeColors();

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync(colors['--color-background']);
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

            return () => {
                // Reset to default theme color when modal closes
                NavigationBar.setBackgroundColorAsync(colors['--color-background']);
                NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
            };
        }
    }, [colors, isDark]);

    const handleConfirm = () => {
        actionSheetRef.current?.hide();
        onConfirm();
    };

    const handleCancel = () => {
        actionSheetRef.current?.hide();
        onCancel();
    };

    return (
        <ActionSheet
            ref={actionSheetRef}
            gestureEnabled={true}
            drawUnderStatusBar={false}
            statusBarTranslucent={true}
            containerStyle={{
                backgroundColor: colors['--color-background'],
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            }}
        >
            <View className="p-8 pb-14">
                <Text className="mb-2 text-2xl font-bold">{title}</Text>
                <Text className="text-muted-foreground mb-6">{message}</Text>

                <View className="flex-row justify-between space-x-3">
                    <Pressable onPress={handleCancel} className="bg-secondary flex-1 items-center rounded-lg px-4 py-3">
                        <Text>{cancelText}</Text>
                    </Pressable>
                    <Pressable onPress={handleConfirm} className="flex-1 items-center rounded-lg bg-red-500 px-4 py-3">
                        <Text className="text-white">{confirmText}</Text>
                    </Pressable>
                </View>
            </View>
        </ActionSheet>
    );
};

export default ConfirmationModal;
