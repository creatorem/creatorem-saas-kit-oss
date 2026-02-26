import { Icon, IconName } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import { QuickFormInput } from '@kit/utils/quick-form';
import { motion } from 'motion/react';

const DELAY_STEP = 0.1;

export const QuestionSelectInput: QuickFormInput<{
    question: string;
    questionDescription?: string;
    answerClassName?: string;
    answers: {
        label: string;
        value: string;
        description?: string;
        icon?: IconName;
    }[];
}> = ({ field, answers, question, questionDescription, answerClassName, slug }) => {
    return (
        <div className="flex flex-col items-center gap-8">
            <input type="hidden" value={field.value ?? ''} name={slug} onChange={field.onChange} />
            <div className="flex w-full flex-col items-center gap-4">
                <p className="text-center text-2xl font-semibold">{question}</p>
                {questionDescription && (
                    <p className="text-muted-foreground text-center text-sm sm:text-base">{questionDescription}</p>
                )}
            </div>

            <div className="flex w-full flex-col items-center gap-4">
                {answers.map((a, i) => (
                    <motion.button
                        key={a.value}
                        role="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            field.onChange(a.value);
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: DELAY_STEP * i }}
                        className={cn(
                            'bg-card relative flex w-full cursor-pointer flex-col items-start gap-2 rounded-md border p-4',
                            a.value === field.value ? 'border-primary bg-primary/10' : 'hover:bg-accent',
                            answerClassName,
                        )}
                    >
                        <p className="text-[17px] font-semibold dark:text-white">{a.label}</p>
                        {a.description && (
                            <p className="mt-2 text-left text-sm font-normal dark:text-white/60">{a.description}</p>
                        )}
                        {a.icon && (
                            <div className="absolute top-0 right-0 rounded-full p-4">
                                <Icon name={a.icon} className="size-5" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
