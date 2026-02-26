'use client';

import NiceModal, { useModal } from '@ebay/nice-modal-react';

const ContentSearchModal = NiceModal.create(() => {
    const modal = useModal();

    if (!modal.visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => modal.hide()}
        >
            <div
                className="bg-background border rounded-xl shadow-lg p-8 max-w-md w-full text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-muted-foreground text-sm">
                    Implement your content search component here.
                </p>
            </div>
        </div>
    );
});

export const showContentTypeCmdSearch = () => {
    NiceModal.show(ContentSearchModal);
};
