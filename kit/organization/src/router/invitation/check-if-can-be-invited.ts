import { AppClient } from '@kit/db';
import { z } from 'zod';
import { checkIfCanBeInvitedSchema as schema } from '../../shared/schemas/invitation/check-if-can-be-invited-schema';
import { InvitationEngine } from '../../shared/server/invitation';

export const checkIfCanBeInvitedSchema = schema;

export const checkIfCanBeInvitedAction = async (
    { email, organizationId }: z.infer<typeof checkIfCanBeInvitedSchema>,
    { db }: { db: AppClient },
) => {
    const normalizedEmail = email.toLowerCase();
    const invitationEngine = new InvitationEngine(db);
    const result = await invitationEngine.checkIfCanInvite(normalizedEmail, organizationId);
    const canInvite = result === true;

    return { canInvite };
};
