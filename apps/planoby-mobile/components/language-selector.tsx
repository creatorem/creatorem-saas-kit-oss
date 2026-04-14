'use client';

import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface LanguageSelectorProps {
    className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ];

    const currentLanguage = i18n.language;

    const handleLanguageChange = async (languageCode: string) => {
        if (languageCode === currentLanguage) return;

        try {
            await i18n.changeLanguage(languageCode);
            // Force a re-render by using a simple navigation approach
            // This will trigger the component to re-render with new language
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    };

    return (
        <View className={`items-center py-4 ${className || ''}`}>
            <Text className="mb-3 text-sm font-medium text-gray-500">Language / Langue</Text>
            <View className="flex-row gap-3">
                {languages.map((language) => (
                    <TouchableOpacity
                        key={language.code}
                        className={`min-w-[100px] flex-row items-center justify-center rounded-full border px-4 py-2 ${
                            currentLanguage === language.code
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                        }`}
                        onPress={() => handleLanguageChange(language.code)}
                        activeOpacity={0.7}
                    >
                        <Text className="mr-2 text-base">{language.flag}</Text>
                        <Text
                            className={`text-sm font-medium ${
                                currentLanguage === language.code ? 'font-semibold text-gray-800' : 'text-gray-700'
                            }`}
                        >
                            {language.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
