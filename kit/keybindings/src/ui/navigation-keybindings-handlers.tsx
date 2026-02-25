import { useRouter } from 'next/navigation';
import { KeybindingAction, KeybindingsModel } from '../types';
import { useKeybinding } from './hooks/use-keybinding';

interface NavigationKeybindingHandlerProps {
    navigationUrlTransformers?: ((url: string) => string)[];
    action: KeybindingAction;
    id: string;
}

const NavigationKeybindingHandler = ({ navigationUrlTransformers, action, id }: NavigationKeybindingHandlerProps) => {
    const router = useRouter();

    useKeybinding(id, () => {
        if (action?.url) {
            const url =
                navigationUrlTransformers?.reduce((url, transformer) => transformer(url), action.url) || action.url;
            router.push(url);
        }
    });

    return null;
};

export interface NavigationKeybindingsProps {
    navigationUrlTransformers?: ((url: string) => string)[];
    model: KeybindingsModel;
}

export const NavigationKeybindingsHandlers = ({ model, navigationUrlTransformers }: NavigationKeybindingsProps) => {
    return Object.keys(model)
        .filter((key) => key.startsWith('navigation.'))
        .map((key) => {
            return (
                <NavigationKeybindingHandler
                    key={key}
                    navigationUrlTransformers={navigationUrlTransformers}
                    action={model[key] as KeybindingAction}
                    id={key}
                />
            );
        });
};
