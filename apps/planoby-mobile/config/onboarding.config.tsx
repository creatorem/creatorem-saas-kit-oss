import { Icon } from '@kit/native-ui/icon';
import { StepperPrevious } from '@kit/native-ui/stepper';
import { Text } from '@kit/native-ui/text';
import { QuickFormStepConfig } from '@kit/utils/quick-form';
import { View } from 'react-native';
import { z } from 'zod';

export const onboardingUserSchema = {
    userImageUrl: z
        .string({
            invalid_type_error: 'Image must be a string.',
        })
        .optional()
        .nullable(),
    userName: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.',
        })
        .trim()
        .min(1, 'Name is required.')
        .max(64, 'Maximum 64 characters allowed.'),
    userPhone: z
        .string({
            invalid_type_error: 'Phone must be a string.',
        })
        .trim()
        .max(16, 'Maximum 16 characters allowed.')
        .optional()
        .or(z.literal('')),
    userEmail: z.string().email('Please enter a valid email'),
};

export const onboardingSchema = {
    ...onboardingUserSchema,
    userRole: z.enum(['designer', 'programmer', 'product_manager', 'tester', 'marketer']),
};

type OnboardingSchema = typeof onboardingSchema;

const goBackButton = (
    <View>
        <StepperPrevious className="active:bg-muted mr-auto border-none" variant={'ghost'} size="icon">
            <Icon name="ArrowLeft" size={24} className="text-foreground" />
        </StepperPrevious>
    </View>
);

export const onboardingStepsConfig: QuickFormStepConfig<OnboardingSchema>[] = [
    // id: 'onboarding',
    // submitButton: { hidden: true },
    // schema: onboardingSchema,
    // settings: [
    // {
    //     type: 'stepper',
    //     nextButton: {
    //         className: 'mx-auto w-full h-10',
    //     },
    //     hidePrevious: true,
    //     contentClassName: 'flex mt-8 gap-4 flex-col',
    //     steps: [
    {
        type: 'step',
        label: 'User',
        header: (
            <>
                <Text className="text-xl leading-none font-semibold tracking-tight lg:text-2xl">
                    Set up your profile
                </Text>
                <Text className="text-muted-foreground text-sm lg:text-base">
                    Make sure your profile information is correct. You'll be able to change this later.
                </Text>
            </>
        ),
        settings: [
            {
                type: 'ui',
                render: <View style={{ paddingTop: 32 }} />,
            },
            {
                type: 'user_media',
                slug: 'userImageUrl',
                className: 'mx-auto',
                triggerClassName: 'size-32 rounded-full mx-auto',
                imageClassName: 'w-full h-full object-cover',
                placeholder: (
                    <View className="border-input flex size-24 items-center justify-center rounded-full border border-dashed">
                        <Icon name="Image" size={20} />
                    </View>
                ),
            },
            {
                type: 'text',
                slug: 'userName',
                label: 'Name',
            },
            // {
            //     type: 'phone',
            //     slug: 'userPhone',
            //     label: 'Phone',
            // },
            {
                type: 'text',
                slug: 'userEmail',
                label: 'Email',
                disabled: true,
            },
        ],
    },
    {
        type: 'step',
        label: 'Profession',
        settings: [
            {
                type: 'ui',
                render: goBackButton,
            },
            {
                type: 'question_select',
                slug: 'userRole',
                question: 'Who are you ?',
                questionDescription: 'Help us understand your role to personalize your experience.',
                answers: [
                    {
                        value: 'designer',
                        label: 'Designer',
                        icon: 'Sparkles',
                        description: 'Create beautiful and intuitive user interfaces and experiences.',
                    },
                    {
                        value: 'programmer',
                        label: 'Programmer',
                        icon: 'Code',
                        description: 'Build robust software solutions and develop cutting-edge applications.',
                    },
                    {
                        value: 'product_manager',
                        label: 'Product manager',
                        icon: 'ShoppingCart',
                        description: 'Strategize product vision, roadmap planning, and feature development.',
                    },
                    {
                        value: 'tester',
                        label: 'Tester',
                        icon: 'TestTubeDiagonal',
                        description: 'Ensure quality through comprehensive testing and bug identification.',
                    },
                    {
                        value: 'marketer',
                        label: 'Marketer',
                        icon: 'Store',
                        description: 'Drive growth through strategic marketing campaigns and user acquisition.',
                    },
                ],
            },
        ],
    },
];
// },
// ],
// };
