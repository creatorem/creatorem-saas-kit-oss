import { Button } from '@kit/native-ui/button';
import { Icon } from '@kit/native-ui/icon';
import { Section } from '@kit/native-ui/layout/section';
import { TouchableOpacity } from '@kit/native-ui/react-native';
import { Text } from '@kit/native-ui/text';
import { Linking, View } from 'react-native';
import Expandable from '~/components/expandable';

// FAQ data
const faqData = [
    {
        id: '1',
        question: 'Can I get a refund?',
        answer: 'Given the nature of the product, refunds are not possible.',
    },
    {
        id: '2',
        question: 'For who the creatorem saas kit is for?',
        answer: 'The creatorem saas kit is for developers who want to create professional saas applications as fast as possible.',
    },
    {
        id: '3',
        question: 'How can I can use the creatorem saas kit?',
        answer: 'You have purchase your access to the creatorem saas kit and you can use it to create your saas application. Get more usage information in our documentation.',
    },
    {
        id: '4',
        question: 'Will I get future updates?',
        answer: 'Yes, you will get future updates for free. Your purchase is for a lifetime access to the creatorem saas kit.',
    },
    {
        id: '5',
        question: 'Is there a setup fee?',
        answer: 'No, there are no setup fees. You can start using the creatorem saas kit immediately after signing up.',
    },
    {
        id: '6',
        question: 'How can I get support?',
        answer: 'Just submit a issue on github.',
    },
    {
        id: '7',
        question: 'How long is the access to the creatorem saas kit?',
        answer: 'Your purchase is for a lifetime access to the creatorem saas kit.',
    },
];

// Contact information
const contactInfo = [
    {
        id: 'email',
        type: 'Email',
        value: 'support@creatorem.com',
        icon: 'Mail' as const,
        action: () => Linking.openURL('mailto:support@creatorem.com'),
    },
    {
        id: 'phone',
        type: 'Phone',
        value: '+1 (555) 123-4567',
        icon: 'Phone' as const,
        action: () => Linking.openURL('tel:+15551234567'),
    },
    {
        id: 'hours',
        type: 'Business Hours',
        value: 'Monday-Friday: 9am-6pm EST',
        icon: 'Clock' as const,
        action: undefined,
    },
];

export function HelpScreen() {
    return (
        <View className="bg-background flex-1">
            {/* FAQ Section */}
            <Section title="Frequently Asked Questions" titleSize="xl" className="px-0 pt-6 pb-2" />

            <View className="px-0">
                {faqData.map((faq) => (
                    <Expandable key={faq.id} title={faq.question} className="py-1">
                        <Text className="leading-6">{faq.answer}</Text>
                    </Expandable>
                ))}
            </View>

            {/* Contact Section */}
            <Section
                title="Contact Us"
                titleSize="xl"
                className="mt-14 px-0 pb-2"
                subtitle="We're here to help with any questions or concerns"
            />

            <View className="px-0 pb-8">
                {contactInfo.map((contact) => (
                    <TouchableOpacity
                        key={contact.id}
                        onPress={contact.action}
                        disabled={!contact.action}
                        className="border-border flex-row items-center border-b py-4"
                    >
                        <View className="bg-secondary mr-4 h-10 w-10 items-center justify-center rounded-full">
                            <Icon name={contact.icon} size={20} />
                        </View>
                        <View>
                            <Text className="text-muted-foreground text-base">{contact.type}</Text>
                            <Text className="font-medium">{contact.value}</Text>
                        </View>
                        {contact.action && (
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground ml-auto" />
                        )}
                    </TouchableOpacity>
                ))}

                <Button className="mt-8" onPress={() => Linking.openURL('mailto:support@velora.com')}>
                    <Icon name="Mail" size={18} />
                    <Text className="text-foreground">Email Us</Text>
                </Button>
            </View>
        </View>
    );
}
