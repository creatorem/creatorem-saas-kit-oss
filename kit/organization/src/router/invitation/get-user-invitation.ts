import { AppClient } from '@kit/db';
import { logger } from '@kit/utils';
import { InvitationEngine } from '../../shared/server/invitation';

export const getUserInvitationAction = async ({ db }: { db: AppClient }) => {
    try {
        const invitationEngine = new InvitationEngine(db);
        return await invitationEngine.getUserInvitationsServer();
    } catch (error) {
        logger.error({ error }, 'Failed to fetch user invitations (action with Drizzle RLS transaction)');
        throw new Error('Failed to fetch user invitations');
    }
};
