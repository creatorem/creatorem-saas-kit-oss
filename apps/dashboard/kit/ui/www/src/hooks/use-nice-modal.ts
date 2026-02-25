import NiceModal, { type NiceModalHandler as NiceModalHandlerType } from '@ebay/nice-modal-react';

export type NiceModalHandler = NiceModalHandlerType & {
    handleAnimationEndCapture: () => void;
    handleClose: () => void;
    handleOpenChange: (value: boolean) => void;
};

export function useNiceModal(): NiceModalHandler {
    const modal = NiceModal.useModal() as NiceModalHandlerType;
    return {
        ...modal,
        handleAnimationEndCapture: () => {
            modal.resolveHide();
            if (!modal.visible && !modal.keepMounted) {
                modal.remove();
            }
        },
        handleClose: () => {
            modal.hide();
        },
        handleOpenChange: (value) => {
            if (!value) {
                modal.hide();
                modal.resolveHide();
                if (!modal.visible && !modal.keepMounted) {
                    modal.remove();
                }
            }
        },
    } as NiceModalHandler;
}
