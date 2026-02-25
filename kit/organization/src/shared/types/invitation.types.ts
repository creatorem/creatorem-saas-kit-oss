import { OrganizationInvitation } from '@kit/drizzle';

export interface OrganizationContext {
    id: string;
    name: string;
}

export interface UserContext {
    id: string;
    email: string;
    name?: string;
}

export interface InvitationRequest {
    email: string;
    roleId: string;
    organizationId: string;
    organizationName: string;
}

export interface CreateInvitationParams {
    email: string;
    roleId: string;
    organizationId: string;
}

export interface SendInvitationParams {
    email: string;
    organizationName: string;
    invitedByEmail: string;
    invitedByName?: string;
    token: string;
    invitationId: string;
    organizationId: string;
}

export interface AcceptInvitationParams {
    invitationId: string;
    userEmail: string;
}

export interface EngineActionResult<T = unknown> {
    data?: {
        success: boolean;
        result?: T;
    };
    serverError?: string;
    validationErrors?: Record<string, string[]>;
}

export interface InvitationEngineInterface {
    checkIfCanInvite(
        email: string,
        organizationId: string,
    ): Promise<true | 'already_member' | 'invitation_already_sent'>;
    createInvitation(params: CreateInvitationParams): Promise<OrganizationInvitation>;
    sendInvitationEmailRequest(params: SendInvitationParams): Promise<void>;
    acceptInvitation(params: AcceptInvitationParams): Promise<'expired' | 'wrong_email' | 'already_member' | true>;
    isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean>;
}

export interface InvitationActionsInterface {
    sendInvitation(request: InvitationRequest): Promise<EngineActionResult<{ invitationId: string }>>;
    acceptInvitation(params: AcceptInvitationParams): Promise<EngineActionResult<{ success: boolean }>>;
    checkIfCanBeInvited(email: string, organizationId: string): Promise<EngineActionResult<{ canInvite: boolean }>>;
}
