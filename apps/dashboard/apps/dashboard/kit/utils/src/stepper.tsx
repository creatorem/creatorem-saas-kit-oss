'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const StepperFormField = ({ children }: { name: string | string[]; children: React.ReactNode }) => children;

// Utility: collect field names recursively from a React node tree
const collectFieldNames = (node: React.ReactNode, acc: Set<string>, FormField: React.FC<any>) => {
    if (node == null || typeof node === 'boolean') return;
    if (Array.isArray(node)) {
        for (const child of node) collectFieldNames(child, acc, FormField);
        return;
    }
    if (typeof node === 'string' || typeof node === 'number') return;
    if (React.isValidElement(node)) {
        // Specifically detect our FormField component and extract its 'name' prop
        if (node.type === FormField) {
            const maybeName = (node.props as any)?.name;
            if (typeof maybeName === 'string') {
                acc.add(maybeName);
            }
        }

        if (node.type === StepperFormField) {
            const maybeName = (node.props as any)?.slug || (node.props as any)?.name;
            if (Array.isArray(maybeName)) {
                maybeName.forEach((n) => {
                    if (typeof n === 'string') {
                        acc.add(n);
                    }
                });
            } else if (typeof maybeName === 'string') {
                acc.add(maybeName);
            }
        }

        const childrenProp = (node.props as any)?.children;
        if (childrenProp) collectFieldNames(childrenProp, acc, FormField);
    }
};

const areArraysEqual = (a: string[] | undefined, b: string[]) => {
    if (!a) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

interface StepperContextType {
    activeStep: number;
    /**
     * Number of direct StepperStep children inside StepperContent
     */
    stepLength: number | null;
    /**
     * Update the number of steps (called by StepperContent)
     * @param length
     * @returns
     */
    setStepLength: (length: number) => void;
    /**
     * Allow consumers to programmatically change step
     *
     * @param step
     * @returns
     */
    onStepChange: (step: number) => void;
    moveNext: () => void;
    movePrevious: () => void;
    isFirstStep: () => boolean;
    isLastStep: () => boolean;
    /**
     * If true, prevent StepperTrigger from navigating forward (only backward allowed)
     */
    disableForwardNav: boolean;
}

const StepperContext = React.createContext<StepperContextType | undefined>(undefined);

export function useStepper(): StepperContextType {
    const context = React.useContext(StepperContext);
    if (!context) {
        throw new Error('Stepper components must be used within a Stepper');
    }
    return context;
}

interface StepperFormContextType {
    /**
     * The reactForm of the form
     */
    reactForm: UseFormReturn<any> | undefined;
    /**
     * Detect the field names contained in a specific step react node tree
     *
     * @param stepChildren - The children of the step
     * @returns - The field names contained in the step
     */
    detectStepFieldNames: (
        stepChildren: React.ReactElement<
            StepperStepProps & {
                children: React.ReactNode;
            },
            string | React.JSXElementConstructor<any>
        >[],
    ) => void;
    /**
     * Whether the Next button is blocked for a given step due to failed validation
     */
    blockedSteps: Record<number, boolean>;
    /**
     * Whether the Next button is open for a given step due to requireDirtyOnStep
     */
    isDirtyGateOpen: boolean;
    /**
     * Validate the current step
     */
    validateStep: () => Promise<boolean>;
    onSubmit?: () => void;
}

const StepperFormContext = React.createContext<StepperFormContextType | undefined>(undefined);

export function useStepperForm(): StepperFormContextType {
    const context = React.useContext(StepperFormContext);
    if (!context) {
        throw new Error('Stepper form features must be used within a Stepper');
    }
    return context;
}

export function useStepperFormContext({
    reactForm,
    activeStep,
    requireDirtyOnStep,
    onSubmit,
    FormField,
}: Pick<StepperProps, 'reactForm' | 'requireDirtyOnStep' | 'onSubmit'> & {
    activeStep: number;
    FormField: React.FC<any>;
}): StepperFormContextType {
    const [stepToFieldNames, setStepToFieldNames] = useState<Record<number, string[]>>({});
    const [blockedSteps, setBlockedSteps] = useState<Record<number, boolean>>({});

    // When the current step is blocked due to failed validation, unblock it
    // as soon as any field in that step changes
    useEffect(() => {
        if (!reactForm) return;
        if (!blockedSteps[activeStep]) return;
        const fields = stepToFieldNames[activeStep] ?? [];
        if (fields.length === 0) return;

        const subscription = reactForm.watch((_value, { name }) => {
            if (!name) return;
            if (fields.includes(name)) {
                setBlockedSteps((prev) => (prev[activeStep] ? { ...prev, [activeStep]: false } : prev));
            }
        });

        return () => {
            try {
                subscription?.unsubscribe?.();
            } catch (_e) {
                // noop
            }
        };
    }, [reactForm, activeStep, blockedSteps, stepToFieldNames]);

    const registerStepFieldNames = useCallback(
        (
            stepChildren: React.ReactElement<
                StepperStepProps & {
                    children: React.ReactNode;
                },
                string | React.JSXElementConstructor<any>
            >[],
        ) => {
            // For each step, compute and register its field names only if changed
            for (let index = 0; index < stepChildren.length; index++) {
                const child = stepChildren[index];
                if (!child || !React.isValidElement(child)) continue;
                const stepNumber =
                    typeof (child.props as any)?.step === 'number' ? (child.props as any).step : index + 1;
                const namesSet = new Set<string>();
                collectFieldNames(child.props.children, namesSet, FormField);
                const names = Array.from(namesSet).sort();
                const prev = stepToFieldNames[stepNumber]?.slice().sort();
                if (!areArraysEqual(prev, names)) {
                    setStepToFieldNames((prev) => ({ ...prev, [stepNumber]: names }));
                }
            }
        },
        [FormField],
    );

    const isDirtyGateOpen = useMemo(() => {
        if (!requireDirtyOnStep || !reactForm) return true;
        const fields = stepToFieldNames[activeStep] ?? [];
        if (fields.length === 0) return true;
        const dirtyMap = (reactForm.formState.dirtyFields ?? {}) as Record<string, unknown>;
        return fields.some((name) => {
            const flag = dirtyMap[name];
            return typeof flag === 'boolean' ? flag : !!flag;
        });
    }, [requireDirtyOnStep, reactForm, activeStep, stepToFieldNames]);

    const validateStep = useCallback(async () => {
        if (!reactForm) return true;
        const fields = stepToFieldNames[activeStep] ?? [];
        if (fields.length === 0) return true;
        const valid = await reactForm.trigger(fields as any, { shouldFocus: true });
        if (!valid) {
            setBlockedSteps((prev) => (prev[activeStep] ? prev : { ...prev, [activeStep]: true }));
        }
        return valid;
    }, [reactForm, activeStep, stepToFieldNames]);

    return useMemo(
        () => ({
            reactForm,
            detectStepFieldNames: registerStepFieldNames,
            blockedSteps,
            isDirtyGateOpen,
            onSubmit,
            validateStep,
        }),
        [reactForm, requireDirtyOnStep, stepToFieldNames, blockedSteps],
    );
}

export interface StepperProps {
    step?: number;
    onStepChange?: (step: number) => void;
    children: React.ReactNode;
    /**
     * Pass your `react-hook-form` instance to enable per-step validation and submit handling
     */
    reactForm?: UseFormReturn<any>;
    /**
     * Works if `reactForm` is provided.
     * If true, require at least one field in the current step to be dirty to enable Next
     *
     * @default false
     */
    requireDirtyOnStep?: boolean;
    /**
     * The number of steps to render, if not provided, it will be the number of direct StepperStep children inside StepperContent
     */
    numberOfSteps?: number;
    /**
     * If true, clicking on StepperTrigger cannot move to a forward step.
     * Users must use the Next button to advance. Backward navigation via trigger remains allowed.
     *
     * We advise you to use this feature for your forms to make sure users don't skip steps.
     *
     * @default false
     */
    disableForwardNav?: boolean;
    onSubmit?: () => void;
}

function Stepper({
    step: controlledActiveStep,
    onStepChange,
    children,
    reactForm,
    requireDirtyOnStep = false,
    numberOfSteps,
    disableForwardNav = false,
    onSubmit,
    FormField,
}: StepperProps & { FormField: React.FC<any> }) {
    const [internalActiveStep, setInternalActiveStep] = useState<number>(1);
    const [stepLength, setStepLength] = useState<number | null>(numberOfSteps ?? null);

    const activeStep = controlledActiveStep ?? internalActiveStep;

    const handleStepChange = useCallback(
        (step: number): void => {
            if (onStepChange) {
                onStepChange(step);
            } else {
                setInternalActiveStep(step);
            }
        },
        [onStepChange, setInternalActiveStep],
    );

    const moveNext = useCallback(() => {
        handleStepChange(activeStep + 1);
    }, [activeStep, handleStepChange]);

    const movePrevious = useCallback(() => {
        handleStepChange(activeStep - 1);
    }, [activeStep, handleStepChange]);

    const contextValue = useMemo(
        () => ({
            activeStep,
            stepLength,
            setStepLength: (length: number) => setStepLength(length),
            onStepChange: handleStepChange,
            moveNext,
            movePrevious,
            isFirstStep: () => activeStep === 1,
            isLastStep: () => stepLength !== null && stepLength > 0 && activeStep === stepLength,
            disableForwardNav,
        }),
        [activeStep, stepLength, handleStepChange, moveNext, movePrevious, disableForwardNav],
    );

    const formContextValue = useStepperFormContext({
        reactForm,
        activeStep,
        requireDirtyOnStep,
        onSubmit,
        FormField,
    });

    return (
        <StepperContext.Provider value={contextValue}>
            <StepperFormContext.Provider value={formContextValue}>{children}</StepperFormContext.Provider>
        </StepperContext.Provider>
    );
}

// Shared base for StepperContent and StepperMotionContent
export function useStepperContentBase(children: React.ReactNode) {
    const { activeStep, setStepLength, stepLength } = useStepper();
    const { detectStepFieldNames } = useStepperForm();

    const stepChildren = useMemo(() => {
        const allChildren = React.Children.toArray(children);
        return allChildren.filter(
            (child): child is React.ReactElement<StepperStepProps> =>
                React.isValidElement(child) && child.type === StepperStep,
        );
    }, [children]);

    useEffect(() => {
        const length = stepChildren.length;
        if (length !== stepLength) setStepLength(length);
        detectStepFieldNames(stepChildren);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepChildren, stepLength, setStepLength, detectStepFieldNames]);

    const selectedChild = useMemo(() => {
        let selected: React.ReactNode | null = null;
        for (let index = 0; index < stepChildren.length; index++) {
            const child = stepChildren[index];
            if (!child || !React.isValidElement(child)) continue;
            const stepNumber = typeof (child.props as any)?.step === 'number' ? (child.props as any).step : index + 1;
            if (stepNumber === activeStep) {
                selected = child;
                break;
            }
        }
        return selected;
    }, [activeStep, stepChildren]);

    return { selectedChild };
}

const StepperActiveStep = () => {
    const { activeStep } = useStepper();
    return <>{activeStep}</>;
};
const StepperStepLength = () => {
    const { stepLength } = useStepper();
    return <>{stepLength}</>;
};

export interface StepperStepProps {
    /**
     * The assicated step number, if not provided, we will use the direct child index of StepperContent
     */
    step?: number;
    children: React.ReactNode;
}

/**
 * Must be the direct child of StepperContent
 */
function StepperStep({ children }: StepperStepProps) {
    return <>{children}</>;
}

export { Stepper, StepperActiveStep, StepperFormField, StepperStep, StepperStepLength };
