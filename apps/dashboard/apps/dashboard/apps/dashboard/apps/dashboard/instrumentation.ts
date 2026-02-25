import { MonitoringProvider } from '@kit/monitoring/provider';

export const register = MonitoringProvider.register;
export const onRequestError = MonitoringProvider.captureRequestError;
