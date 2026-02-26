'use client';

import { cn } from '@kit/utils';
import { QuickFormStepperComponent } from '@kit/utils/quick-form';
import { Stepper, StepperMotionContent, StepperNext, StepperPrevious, StepperStep, StepperTrigger } from '../stepper';

const QuickFormStepperInternal: QuickFormStepperComponent = ({
    form,
    header,
    footer,
    className,
    steps,
    rawSteps,
    contentClassName,
    nextButton,
    onSubmit,
    hidePrevious,
    after,
}) => {
    return (
        <Stepper reactForm={form} disableForwardNav onSubmit={onSubmit}>
            <div className={className}>
                {header === undefined ? (
                    <nav aria-label="Progress">
                        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
                            {rawSteps.map((step, index) => (
                                <StepperTrigger asChild key={index} step={index + 1}>
                                    <li
                                        className={cn(
                                            'border-muted hover:border-muted-foreground/60 flex flex-col border-l-4 py-2 pl-4 transition-all md:flex-1 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0',
                                            'data-[state=active]:border-primary',
                                            'data-[state=complete]:border-primary/50 hover:data-[state=complete]:border-primary',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'text-foreground/80 group-hover/stepper-trigger:text-foreground text-sm font-medium transition-all',
                                                'group-data-[state=active]/stepper-trigger:text-primary',
                                                'group-data-[state=complete]/stepper-trigger:text-primary/60 group-hover/stepper-trigger:group-data-[state=complete]/stepper-trigger:text-primary/80',
                                            )}
                                        >
                                            {`Step ${index + 1}`}
                                        </span>
                                        {'label' in step && (
                                            <span
                                                className={'text-muted-foreground text-sm font-medium transition-all'}
                                            >
                                                {step.label}
                                            </span>
                                        )}
                                    </li>
                                </StepperTrigger>
                            ))}
                        </ol>
                    </nav>
                ) : (
                    header(rawSteps)
                )}

                <StepperMotionContent>
                    {steps.map((s, i) => (
                        <StepperStep key={i}>
                            <div className={contentClassName}>
                                {s}

                                {/* flex row reverse for focus control */}
                                {footer ?? (
                                    <div className="mt-4 flex flex-row-reverse justify-between">
                                        <StepperNext
                                            size="sm"
                                            lastChildren={<>Submit</>}
                                            className={nextButton?.className}
                                            canGoNext={async (index) => {
                                                const activeStep = rawSteps[index - 1];
                                                if (!activeStep || !activeStep.canGoNext) {
                                                    return true;
                                                }
                                                const res = await activeStep.canGoNext(form);
                                                return res;
                                            }}
                                        />

                                        {!hidePrevious && <StepperPrevious size="sm" />}
                                    </div>
                                )}
                            </div>
                        </StepperStep>
                    ))}
                </StepperMotionContent>

                {after}
            </div>
        </Stepper>
    );
};

export const QuickFormStepper: QuickFormStepperComponent = (props) => {
    return (
        <Stepper reactForm={props.form} disableForwardNav>
            <QuickFormStepperInternal {...props} />
        </Stepper>
    );
};
