import { useCtxTrpc } from '@planoby/shared/trpc-client-provider';
import { FilterApplier } from '@kit/utils/filters';
import { useLocalSearchParams } from 'expo-router';

export default function SettingsPage() {
    const { filteredScreens } = useLocalSearchParams<{
        filteredScreens: string;
    }>();
    const { clientTrpc } = useCtxTrpc();

    return <FilterApplier name="display_extra_screens" options={{ path: filteredScreens, clientTrpc }} />;
}
