import { AiConfig } from '@kit/ai/config';
import { AppClient } from '@kit/db';

export interface UsageLimitValidationResult {
    allowed: boolean;
    reason?: string;
    errorMessage?: string;
    includedAmount?: string;
    source?: 'plan' | 'wallet' | 'no-limit';
}

class AiUsageManager {
    constructor(private db: AppClient, private aiConfig: AiConfig) {}

    async validateUsageLimit(): Promise<UsageLimitValidationResult> {
        return { allowed: true, source: 'no-limit' };
    }

    async handleWalletDeduction(): Promise<void> {
        // Billing removed — no-op
    }
}

export function createAiUsageManager(db: AppClient, aiConfig: AiConfig): AiUsageManager {
    return new AiUsageManager(db, aiConfig);
}
