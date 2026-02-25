/**
 * @param {string} variableName
 * @returns {(params: { opacityValue?: number }) => string}
 */
function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}

export default {
    darkMode: ['class'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1380px',
            },
        },
        extend: {
            colors: {
                overlay: 'rgb(0 0 0 / 0.8)',
                border: {
                    DEFAULT: withOpacity('--border'),
                },
                input: withOpacity('--input'),
                ring: withOpacity('--ring'),
                background: withOpacity('--background'),
                foreground: withOpacity('--foreground'),
                primary: {
                    DEFAULT: withOpacity('--primary'),
                    foreground: withOpacity('--primary-foreground'),
                },
                secondary: {
                    DEFAULT: withOpacity('--secondary'),
                    foreground: withOpacity('--secondary-foreground'),
                },
                destructive: {
                    DEFAULT: withOpacity('--destructive'),
                    foreground: withOpacity('--destructive-foreground'),
                },
                muted: {
                    DEFAULT: withOpacity('--muted'),
                    foreground: withOpacity('--muted-foreground'),
                },
                accent: {
                    DEFAULT: withOpacity('--accent'),
                    foreground: withOpacity('--accent-foreground'),
                },
                popover: {
                    DEFAULT: withOpacity('--popover'),
                    foreground: withOpacity('--popover-foreground'),
                },
                card: {
                    DEFAULT: withOpacity('--card'),
                    foreground: withOpacity('--card-foreground'),
                },
                sidebar: {
                    DEFAULT: withOpacity('--sidebar-background'),
                    foreground: withOpacity('--sidebar-foreground'),
                    primary: withOpacity('--sidebar-primary'),
                    'primary-foreground': withOpacity('--sidebar-primary-foreground'),
                    accent: withOpacity('--sidebar-accent'),
                    'accent-foreground': withOpacity('--sidebar-accent-foreground'),
                    border: withOpacity('--sidebar-border'),
                    ring: withOpacity('--sidebar-ring'),
                },
            },
            backgroundImage: {
                striped:
                    'repeating-linear-gradient(315deg, transparent 0px, rgb(var(--border)) 1px,transparent 1px,transparent 10px, rgba(var(--border), 0.5) 11px, transparent 11px, transparent 20px)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'right-sheet-down': {
                    from: { width: '0' },
                    // w-sm
                    to: { width: '400px' },
                },
                'right-sheet-up': {
                    // w-sm
                    from: { width: '400px' },
                    to: { width: '0' },
                },
                'caret-blink': {
                    '0%,70%,100%': {
                        opacity: '1',
                    },
                    '20%,50%': {
                        opacity: '0',
                    },
                },
                'collapsible-down': {
                    from: {
                        height: '0',
                        opacity: '0',
                    },
                    to: {
                        height: 'var(--radix-collapsible-content-height)',
                        opacity: '1',
                    },
                },
                'collapsible-up': {
                    from: {
                        height: 'var(--radix-collapsible-content-height)',
                        opacity: '1',
                    },
                    to: {
                        height: '0',
                        opacity: '0',
                    },
                },
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                slideIn: {
                    '0%': {
                        transform: 'translateX(-100%)',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                    },
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(calc(-100% - var(--gap)))' },
                },
                'marquee-vertical': {
                    from: { transform: 'translateY(0)' },
                    to: { transform: 'translateY(calc(-100% - var(--gap)))' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'right-sheet-down': 'right-sheet-down .5s cubic-bezier(.4, 0, .2, 1)',
                'right-sheet-up': 'right-sheet-up .5s cubic-bezier(.4, 0, .2, 1)',
                'caret-blink': 'caret-blink 1.25s ease-out infinite',
                'collapsible-down': 'collapsible-down 0.2s ease-out',
                'collapsible-up': 'collapsible-up 0.2s ease-out',
                fadeIn: 'fadeIn 0.3s ease-in-out',
                slideIn: 'slideIn 0.3s ease-in-out',
                marquee: 'marquee var(--duration) linear infinite',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
            },
        },
    },
};
