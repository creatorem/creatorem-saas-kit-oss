import React from 'react';

export const SETTING_SAVE_BUTTON_ANCHOR_ID = 'setting-save-button-anchor';

export const SettingSaveButtonAnchor: React.FC<Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>> = ({
    children,
    ...props
}) => {
    return (
        <div {...props} id={SETTING_SAVE_BUTTON_ANCHOR_ID}>
            {children}
        </div>
    );
};
