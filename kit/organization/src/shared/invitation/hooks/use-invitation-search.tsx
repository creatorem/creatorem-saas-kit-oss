import { useMemo, useState } from 'react';
import { UserInvitationWithOrganization } from './use-invitation-responder';

export const useInvitationSearch = ({ invitations }: { invitations: UserInvitationWithOrganization[] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter invitations based on search
    const filteredInvitations = useMemo(() => {
        return invitations.filter((invitation) => {
            const matchesSearch =
                searchQuery === '' ||
                invitation.organization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invitation.organization.slug.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [invitations, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredInvitations,
    };
};
