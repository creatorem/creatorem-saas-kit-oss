import { Badge } from '@kit/native-ui/badge';
import { Text } from '@kit/native-ui/text';
import { Textarea } from '@kit/native-ui/textarea';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { Pressable, View } from 'react-native';
import { getFieldStringValue } from './utils';

const SMS_VARIABLES = ['{{client_name}}', '{{service_name}}', '{{slot_date}}', '{{slot_time}}', '{{booking_url}}'];

export const SmsTemplateSettingInput: QuickFormInput = ({ field, placeholder }) => {
    const value = getFieldStringValue(field, '');

    const insertVariable = (variable: string) => {
        const spacer = value.length > 0 && !value.endsWith(' ') ? ' ' : '';
        field.onChange(`${value}${spacer}${variable}`);
    };

    return (
        <View className="gap-3">
            <Textarea
                value={value}
                editable={!field.disabled}
                onChangeText={field.onChange}
                placeholder={typeof placeholder === 'string' ? placeholder : ''}
                numberOfLines={4}
                className="min-h-28"
            />

            <View className="flex-row flex-wrap gap-2">
                {SMS_VARIABLES.map((variable) => (
                    <Pressable key={variable} onPress={() => insertVariable(variable)} disabled={field.disabled}>
                        <Badge variant="outline">
                            <Text className="text-xs">{variable}</Text>
                        </Badge>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};
