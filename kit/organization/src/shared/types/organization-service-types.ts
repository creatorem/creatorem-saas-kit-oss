export interface OrganizationMemberWithUser {
    id: string;
    userId: string;
    organizationId: string;
    roleId: string;
    roleName: string;
    roleHierarchyLevel: number;
    isOwner: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string | null;
        name: string | null;
        profileUrl: string | null;
    };
}

export interface InviteMemberParams {
    email: string;
    roleId: string;
    organizationId: string;
    organizationName: string;
    invitedByEmail: string;
    invitedByName: string;
}

export interface UpdateMemberRoleParams {
    memberId: string;
    roleId: string;
    organizationId: string;
}

export interface RemoveMemberParams {
    memberId: string;
    organizationId: string;
}

export interface OrganizationEngineInterface {
    getOrganizationMembers(organizationId: string): Promise<OrganizationMemberWithUser[]>;
    checkIfCanInviteMember(
        email: string,
        organizationId: string,
    ): Promise<true | 'already_member' | 'invitation_already_sent'>;
    inviteMember(params: InviteMemberParams): Promise<{ invitationId: string }>;
    updateMemberRole(params: UpdateMemberRoleParams): Promise<void>;
    removeMember(params: RemoveMemberParams): Promise<void>;
    checkUserPermissions(
        userId: string,
        organizationId: string,
    ): Promise<{ roleId: string; roleName: string; roleHierarchyLevel: number; isOwner: boolean } | null>;

    // Higher-level operations with permission checking
    getMembersWithPermissionCheck(userId: string, organizationId: string): Promise<OrganizationMemberWithUser[]>;
    inviteMemberWithPermissionCheck(
        userId: string,
        userEmail: string,
        userName: string,
        params: InviteMemberParams,
    ): Promise<{ invitationId: string }>;
    updateMemberRoleWithPermissionCheck(userId: string, params: UpdateMemberRoleParams): Promise<void>;
    removeMemberWithPermissionCheck(userId: string, params: RemoveMemberParams): Promise<void>;

    // Organization session management
    getOrganizationSessionData(): Promise<any>; // Using any to avoid importing OrganizationContext
    getOrganizationBySlug(slug: string): Promise<any>; // Using any to avoid importing Organization
}
