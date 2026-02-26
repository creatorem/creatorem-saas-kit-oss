import type { BaseInputProps } from './types';

// Generic type for the renderer that accepts any props from QuickFormInputConfig
type QuickFormInputRendererProps = BaseInputProps & {
    inputs: Record<string, React.FC<BaseInputProps & any>>;
    type: string;
    [key: string]: unknown; // Allow any additional props that will be passed to the input component
};

export function QuickFormInputRenderer({ type, inputs, ...props }: QuickFormInputRendererProps) {
    // Check if the input type exists in the base registered inputs
    const Input = inputs[type as keyof typeof inputs];

    if (!Input) {
        // For extensible input types, we need to handle them differently
        // This will be handled by the settings package's extended input renderer
        throw new Error(
            `Input type ${type} not found in base registered inputs. Use the extended input renderer from the settings package.`,
        );
    }

    // Use any to bypass TypeScript's strict type checking for component props
    // This is safe since we're delegating to registered components that have their own type checking
    return <Input {...(props as any)} />;
}
