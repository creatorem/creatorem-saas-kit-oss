'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';
import { toast } from '@kit/ui/sonner';
import { MAX_IMAGE_SIZE } from '@kit/utils';
import { useCallback, useRef } from 'react';
import { useNiceModal } from '../hooks/use-nice-modal';
import { Cropper, type CropperElement } from './cropper';
export type CropPhotoModalProps = NiceModalHocProps & {
    file: File;
    aspectRatio?: number;
    circularCrop: boolean;
};

export const CropPhotoModal = NiceModal.create<CropPhotoModalProps>(({ file, aspectRatio, circularCrop }) => {
    const modal = useNiceModal();
    const title = 'Crop photo';
    const description = 'Adjust the size of the grid to crop your image.';
    const cropperRef = useRef<CropperElement>(null);

    const handleApply = useCallback(async () => {
        if (cropperRef.current) {
            const croppedImage = await cropperRef.current.getCroppedImage();
            if (croppedImage) {
                modal.resolve(croppedImage);
                modal.handleClose();
            } else {
                toast.error('Failed to crop the image.');
            }
        }
    }, [modal]);

    const handleChange = useCallback(
        (open: boolean) => {
            if (!open) {
                modal.handleClose();
            }
        },
        [modal],
    );

    return (
        <Dialog open={modal.visible} onOpenChange={handleChange}>
            <DialogContent className="max-w-lg" onAnimationEndCapture={modal.handleAnimationEndCapture}>
                <div className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Cropper
                        ref={cropperRef}
                        file={file}
                        aspectRatio={aspectRatio}
                        circularCrop={circularCrop}
                        maxImageSize={MAX_IMAGE_SIZE}
                    />
                    <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0">
                        <Button aria-label="Cancel" type="button" variant="outline" onClick={modal.handleClose}>
                            Cancel
                        </Button>
                        <Button aria-label="Apply" type="button" variant="default" onClick={handleApply}>
                            Apply
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
});
