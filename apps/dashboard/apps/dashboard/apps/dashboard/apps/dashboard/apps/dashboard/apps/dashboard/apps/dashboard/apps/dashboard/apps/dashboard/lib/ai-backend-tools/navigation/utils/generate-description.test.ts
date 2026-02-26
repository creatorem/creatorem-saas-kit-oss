/// <reference types="jest" />

import { formatWord, generateDescription, pluralize, singularize } from './generate-description';
import type { DashboardNavigationPath } from './route-generator';

describe('Description Generation Functions', () => {
    // ============================================================================
    // singularize() Tests
    // ============================================================================

    describe('singularize()', () => {
        describe('Rule 0: Irregular plurals', () => {
            it('should handle irregular plural: analyses → analysis', () => {
                expect(singularize('analyses')).toBe('analysis');
            });

            it('should handle irregular plural: crises → crisis', () => {
                expect(singularize('crises')).toBe('crisis');
            });

            it('should handle irregular plural: phenomena → phenomenon', () => {
                expect(singularize('phenomena')).toBe('phenomenon');
            });

            it('should handle irregular plural: criteria → criterion', () => {
                expect(singularize('criteria')).toBe('criterion');
            });

            it('should handle irregular plural: data → datum', () => {
                expect(singularize('data')).toBe('datum');
            });

            it('should handle irregular plural: buses → bus', () => {
                expect(singularize('buses')).toBe('bus');
            });

            it('should handle irregular plural: oxen → ox', () => {
                expect(singularize('oxen')).toBe('ox');
            });

            it('should handle irregular plural: feet → foot', () => {
                expect(singularize('feet')).toBe('foot');
            });

            it('should handle irregular plural: teeth → tooth', () => {
                expect(singularize('teeth')).toBe('tooth');
            });

            it('should handle irregular plural: geese → goose', () => {
                expect(singularize('geese')).toBe('goose');
            });

            it('should handle irregular plural: mice → mouse', () => {
                expect(singularize('mice')).toBe('mouse');
            });

            it('should handle irregular plural: people → person', () => {
                expect(singularize('people')).toBe('person');
            });

            it('should handle irregular plural: children → child', () => {
                expect(singularize('children')).toBe('child');
            });

            it('should handle irregular plural: men → man', () => {
                expect(singularize('men')).toBe('man');
            });

            it('should handle irregular plural: women → woman', () => {
                expect(singularize('women')).toBe('woman');
            });
        });

        describe('Rule 1: consonant + ies → consonant + y', () => {
            it('should convert entries → entry', () => {
                expect(singularize('entries')).toBe('entry');
            });

            it('should convert categories → category', () => {
                expect(singularize('categories')).toBe('category');
            });

            it('should convert queries → query', () => {
                expect(singularize('queries')).toBe('query');
            });

            it('should not convert toys (vowel + y) to toy', () => {
                // 'toys' is already singular-like, but should handle 'ies' rule
                expect(singularize('toys')).toBe('toy');
            });

            it('should convert invitations → invitations (no rule match except default)', () => {
                expect(singularize('invitations')).toBe('invitation');
            });
        });

        describe('Rule 2: sh/ch/x/z + es → remove es', () => {
            it('should convert boxes → box', () => {
                expect(singularize('boxes')).toBe('box');
            });

            it('should convert brushes → brush', () => {
                expect(singularize('brushes')).toBe('brush');
            });

            it('should convert watches → watch', () => {
                expect(singularize('watches')).toBe('watch');
            });

            it('should convert buzzes → buzz', () => {
                expect(singularize('buzzes')).toBe('buzz');
            });
        });

        describe('Rule 3: oes → remove es', () => {
            it('should convert heroes → hero', () => {
                expect(singularize('heroes')).toBe('hero');
            });

            it('should convert potatoes → potato', () => {
                expect(singularize('potatoes')).toBe('potato');
            });

            it('should convert tomatoes → tomato', () => {
                expect(singularize('tomatoes')).toBe('tomato');
            });
        });

        describe('Rule 4: ves → f or fe', () => {
            it('should convert wolves → wolf', () => {
                expect(singularize('wolves')).toBe('wolf');
            });

            it('should convert calves → calf', () => {
                expect(singularize('calves')).toBe('calf');
            });

            it('should convert knives → knife', () => {
                expect(singularize('knives')).toBe('knife');
            });

            it('should convert wives → wife', () => {
                expect(singularize('wives')).toBe('wife');
            });

            it('should convert lives → life', () => {
                expect(singularize('lives')).toBe('life');
            });

            it('should convert leaves → leaf (f, not fe)', () => {
                expect(singularize('leaves')).toBe('leaf');
            });

            it('should convert thieves → thief (f, not fe)', () => {
                expect(singularize('thieves')).toBe('thief');
            });

            it('should convert shelves → shelf (f, not fe)', () => {
                expect(singularize('shelves')).toBe('shelf');
            });

            it('should convert elves → elf', () => {
                expect(singularize('elves')).toBe('elf');
            });
        });

        describe('Rule 5: vowel + ses → vowel + is', () => {
            it('should convert oases → oasis', () => {
                expect(singularize('oases')).toBe('oasis');
            });

            it('should convert bases → basis', () => {
                expect(singularize('bases')).toBe('basis');
            });
        });

        describe('Rule 6: ous → keep as is', () => {
            it('should keep enormous as is', () => {
                expect(singularize('enormous')).toBe('enormous');
            });

            it('should keep famous as is', () => {
                expect(singularize('famous')).toBe('famous');
            });
        });

        describe('Rule 7: default - remove s', () => {
            it('should convert cats → cat', () => {
                expect(singularize('cats')).toBe('cat');
            });

            it('should convert dogs → dog', () => {
                expect(singularize('dogs')).toBe('dog');
            });

            it('should convert orders → order', () => {
                expect(singularize('orders')).toBe('order');
            });

            it('should convert products → product', () => {
                expect(singularize('products')).toBe('product');
            });

            it('should convert clients → client', () => {
                expect(singularize('clients')).toBe('client');
            });

            it('should convert members → member', () => {
                expect(singularize('members')).toBe('member');
            });

            it('should convert roles → role', () => {
                expect(singularize('roles')).toBe('role');
            });

            it('should convert books → book', () => {
                expect(singularize('books')).toBe('book');
            });

            it('should convert tables → table', () => {
                expect(singularize('tables')).toBe('table');
            });
        });

        it('should return unchanged word if no rules match', () => {
            expect(singularize('sheep')).toBe('sheep');
        });
    });

    // ============================================================================
    // pluralize() Tests
    // ============================================================================

    describe('pluralize()', () => {
        describe('Rule 0: Irregular plurals', () => {
            it('should convert analysis → analyses', () => {
                expect(pluralize('analysis')).toBe('analyses');
            });

            it('should convert crisis → crises', () => {
                expect(pluralize('crisis')).toBe('crises');
            });

            it('should convert phenomenon → phenomena', () => {
                expect(pluralize('phenomenon')).toBe('phenomena');
            });

            it('should convert criterion → criteria', () => {
                expect(pluralize('criterion')).toBe('criteria');
            });

            it('should convert datum → data', () => {
                expect(pluralize('datum')).toBe('data');
            });
        });

        describe('Rule 1: consonant + y → ies', () => {
            it('should convert entry → entries', () => {
                expect(pluralize('entry')).toBe('entries');
            });

            it('should convert category → categories', () => {
                expect(pluralize('category')).toBe('categories');
            });

            it('should convert query → queries', () => {
                expect(pluralize('query')).toBe('queries');
            });

            it('should convert invitation → invitations', () => {
                expect(pluralize('invitation')).toBe('invitations');
            });

            it('should not convert boy to bies (vowel + y)', () => {
                expect(pluralize('boy')).toBe('boys');
            });
        });

        describe('Rule 2: s/ss/x/z/ch/sh → add es', () => {
            it('should convert box → boxes', () => {
                expect(pluralize('box')).toBe('boxes');
            });

            it('should convert brush → brushes', () => {
                expect(pluralize('brush')).toBe('brushes');
            });

            it('should convert watch → watches', () => {
                expect(pluralize('watch')).toBe('watches');
            });

            it('should convert bus → buses', () => {
                expect(pluralize('bus')).toBe('buses');
            });

            it('should convert buzz → buzzes', () => {
                expect(pluralize('buzz')).toBe('buzzes');
            });

            it('should convert glass → glasses', () => {
                expect(pluralize('glass')).toBe('glasses');
            });
        });

        describe('Rule 3: consonant + o → oes (with exceptions)', () => {
            it('should convert hero → heroes', () => {
                expect(pluralize('hero')).toBe('heroes');
            });

            it('should convert tomato → tomatoes', () => {
                expect(pluralize('tomato')).toBe('tomatoes');
            });

            it('should convert potato → potatoes', () => {
                expect(pluralize('potato')).toBe('potatoes');
            });

            it('should convert photo → photos (exception)', () => {
                expect(pluralize('photo')).toBe('photos');
            });

            it('should convert piano → pianos (exception)', () => {
                expect(pluralize('piano')).toBe('pianos');
            });

            it('should convert solo → solos (exception)', () => {
                expect(pluralize('solo')).toBe('solos');
            });

            it('should convert memo → memos (exception)', () => {
                expect(pluralize('memo')).toBe('memos');
            });

            it('should convert pro → pros (exception)', () => {
                expect(pluralize('pro')).toBe('pros');
            });
        });

        describe('Rule 4: fe → ves', () => {
            it('should convert knife → knives', () => {
                expect(pluralize('knife')).toBe('knives');
            });

            it('should convert wife → wives', () => {
                expect(pluralize('wife')).toBe('wives');
            });

            it('should convert life → lives', () => {
                expect(pluralize('life')).toBe('lives');
            });
        });

        describe('Rule 5: f → ves (with exceptions)', () => {
            it('should convert wolf → wolves', () => {
                expect(pluralize('wolf')).toBe('wolves');
            });

            it('should convert calf → calves', () => {
                expect(pluralize('calf')).toBe('calves');
            });

            it('should convert leaf → leaves', () => {
                expect(pluralize('leaf')).toBe('leaves');
            });

            it('should convert roof → roofs (exception)', () => {
                expect(pluralize('roof')).toBe('roofs');
            });

            it('should convert chief → chiefs (exception)', () => {
                expect(pluralize('chief')).toBe('chiefs');
            });

            it('should convert chef → chefs (exception)', () => {
                expect(pluralize('chef')).toBe('chefs');
            });

            it('should convert cliff → cliffs (exception)', () => {
                expect(pluralize('cliff')).toBe('cliffs');
            });

            it('should convert staff → staffs (exception)', () => {
                expect(pluralize('staff')).toBe('staffs');
            });

            it('should convert belief → beliefs (exception)', () => {
                expect(pluralize('belief')).toBe('beliefs');
            });

            it('should convert brief → briefs (exception)', () => {
                expect(pluralize('brief')).toBe('briefs');
            });

            it('should convert grief → griefs (exception)', () => {
                expect(pluralize('grief')).toBe('griefs');
            });

            it('should convert relief → reliefs (exception)', () => {
                expect(pluralize('relief')).toBe('reliefs');
            });
        });

        describe('Rule 6: is → es', () => {
            it('should convert basis → bases', () => {
                expect(pluralize('basis')).toBe('bases');
            });

            it('should convert oasis → oases', () => {
                expect(pluralize('oasis')).toBe('oases');
            });
        });

        describe('Rule 7: default - add s', () => {
            it('should convert cat → cats', () => {
                expect(pluralize('cat')).toBe('cats');
            });

            it('should convert dog → dogs', () => {
                expect(pluralize('dog')).toBe('dogs');
            });

            it('should convert order → orders', () => {
                expect(pluralize('order')).toBe('orders');
            });

            it('should convert product → products', () => {
                expect(pluralize('product')).toBe('products');
            });

            it('should convert client → clients', () => {
                expect(pluralize('client')).toBe('clients');
            });

            it('should convert member → members', () => {
                expect(pluralize('member')).toBe('members');
            });

            it('should convert role → roles', () => {
                expect(pluralize('role')).toBe('roles');
            });

            it('should convert book → books', () => {
                expect(pluralize('book')).toBe('books');
            });

            it('should convert table → tables', () => {
                expect(pluralize('table')).toBe('tables');
            });
        });
    });

    // ============================================================================
    // formatWord() Tests
    // ============================================================================

    describe('formatWord()', () => {
        it('should convert simple lowercase word to title case', () => {
            expect(formatWord('orders')).toBe('Orders');
        });

        it('should convert camelCase to title case with spaces', () => {
            expect(formatWord('aiChat')).toBe('Ai Chat');
        });

        it('should convert multi-word camelCase correctly', () => {
            expect(formatWord('organizationMembers')).toBe('Organization Members');
        });

        it('should capitalize keybindings correctly', () => {
            expect(formatWord('keybindings')).toBe('Keybindings');
        });

        it('should handle single uppercase letter', () => {
            expect(formatWord('a')).toBe('A');
        });

        it('should handle already capitalized word', () => {
            expect(formatWord('Orders')).toBe('Orders');
        });

        it('should handle word with multiple consecutive uppercase letters', () => {
            expect(formatWord('XMLParser')).toBe('Xmlparser');
        });

        it('should handle word with underscores (no special handling)', () => {
            expect(formatWord('dashboard_config')).toBe('Dashboard_config');
        });

        it('should trim and capitalize each word in phrase', () => {
            expect(formatWord('myNewDashboard')).toBe('My New Dashboard');
        });
    });

    // ============================================================================
    // generateDescription() Tests
    // ============================================================================

    describe('generateDescription()', () => {
        describe('Pattern 1: .new suffix', () => {
            it('should generate "Create a new order" for orders.new', () => {
                const path: DashboardNavigationPath = 'orders.new';
                expect(generateDescription(path)).toBe('Create a new order');
            });

            it('should generate "Create a new product" for products.new', () => {
                const path: DashboardNavigationPath = 'products.new';
                expect(generateDescription(path)).toBe('Create a new product');
            });

            it('should generate "Create a new client" for clients.new', () => {
                const path: DashboardNavigationPath = 'clients.new';
                expect(generateDescription(path)).toBe('Create a new client');
            });

            it('should generate "Create a new entry" for entries.new', () => {
                const path: DashboardNavigationPath = 'entries.new';
                expect(generateDescription(path)).toBe('Create a new entry');
            });
        });

        describe('Pattern 2: settings prefix', () => {
            it('should return "Settings" for settings alone', () => {
                const path: DashboardNavigationPath = 'settings';
                expect(generateDescription(path)).toBe('Settings');
            });

            it('should return "Profile settings" for settings.profile', () => {
                const path: DashboardNavigationPath = 'settings.profile';
                expect(generateDescription(path)).toBe('Profile settings');
            });

            it('should return "Security settings" for settings.security', () => {
                const path: DashboardNavigationPath = 'settings.security';
                expect(generateDescription(path)).toBe('Security settings');
            });

            it('should return "Keybindings settings" for settings.keybindings', () => {
                const path: DashboardNavigationPath = 'settings.keybindings';
                expect(generateDescription(path)).toBe('Keybindings settings');
            });

            it('should return "Invitations settings" for settings.invitations', () => {
                const path: DashboardNavigationPath = 'settings.invitations';
                expect(generateDescription(path)).toBe('Invitations settings');
            });

            it('should return "Organization settings" for settings.organization', () => {
                const path: DashboardNavigationPath = 'settings.organization';
                expect(generateDescription(path)).toBe('Organization settings');
            });

            it('should return "Organization Members settings" for settings.organization.members', () => {
                const path: DashboardNavigationPath = 'settings.organization.members';
                expect(generateDescription(path)).toBe('Organization Members settings');
            });

            it('should return "Organization Roles settings" for settings.organization.roles', () => {
                const path: DashboardNavigationPath = 'settings.organization.roles';
                expect(generateDescription(path)).toBe('Organization Roles settings');
            });

            it('should return "Organization Billing settings" for settings.organization.billing', () => {
                const path: DashboardNavigationPath = 'settings.organization.billing';
                expect(generateDescription(path)).toBe('Organization Billing settings');
            });
        });

        describe('Pattern 3: Single word paths', () => {
            it('should return "Dashboard" for dashboard', () => {
                const path: DashboardNavigationPath = 'dashboard';
                expect(generateDescription(path)).toBe('Dashboard');
            });

            it('should return "Orders" for orders', () => {
                const path: DashboardNavigationPath = 'orders';
                expect(generateDescription(path)).toBe('Orders');
            });

            it('should return "Products" for products', () => {
                const path: DashboardNavigationPath = 'products';
                expect(generateDescription(path)).toBe('Products');
            });

            it('should return "Clients" for clients', () => {
                const path: DashboardNavigationPath = 'clients';
                expect(generateDescription(path)).toBe('Clients');
            });

            it('should return "Billing" for billing', () => {
                const path: DashboardNavigationPath = 'billing';
                expect(generateDescription(path)).toBe('Billing');
            });

            it('should return "Ai Chat" for aiChat', () => {
                const path: DashboardNavigationPath = 'aiChat';
                expect(generateDescription(path)).toBe('Ai Chat');
            });
        });

        describe('Pattern 4: Multi-part paths', () => {
            it('should join multi-part paths with arrows', () => {
                const path: DashboardNavigationPath = 'products.categories';
                expect(generateDescription(path)).toBe('Products → Categories');
            });

            it('should format each part correctly in multi-part paths', () => {
                const path: DashboardNavigationPath = 'orders.details';
                expect(generateDescription(path)).toBe('Orders → Details');
            });
        });

        describe('Edge cases and integration', () => {
            it('should handle pattern priority: .new before multi-part', () => {
                const path: DashboardNavigationPath = 'orders.new';
                expect(generateDescription(path)).toBe('Create a new order');
                // Should not be 'Orders → New'
            });

            it('should handle settings taking priority over multi-part', () => {
                const path: DashboardNavigationPath = 'settings.organization.members';
                expect(generateDescription(path)).toBe('Organization Members settings');
                // Should not be 'Settings → Organization → Members'
            });

            it('should correctly identify .new as last part', () => {
                const path: DashboardNavigationPath = 'orders.new';
                const result = generateDescription(path);
                expect(result).toContain('Create a new');
            });

            it('should use singularize for .new pattern', () => {
                const path: DashboardNavigationPath = 'entries.new';
                const result = generateDescription(path);
                // entries should singularize to entry
                expect(result).toBe('Create a new entry');
            });

            it('should use formatWord for settings parts', () => {
                const path: DashboardNavigationPath = 'settings.organizationMembers';
                const result = generateDescription(path);
                expect(result).toBe('Organization Members settings');
            });
        });
    });

    // ============================================================================
    // Round-trip Tests (pluralize → singularize → pluralize)
    // ============================================================================

    describe('Round-trip tests (plural → singular → plural)', () => {
        it('should convert orders → order → orders', () => {
            const singular = singularize('orders');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('orders');
        });

        it('should convert products → product → products', () => {
            const singular = singularize('products');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('products');
        });

        it('should convert clients → client → clients', () => {
            const singular = singularize('clients');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('clients');
        });

        it('should convert entries → entry → entries', () => {
            const singular = singularize('entries');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('entries');
        });

        it('should convert knives → knife → knives', () => {
            const singular = singularize('knives');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('knives');
        });

        it('should convert wolves → wolf → wolves', () => {
            const singular = singularize('wolves');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('wolves');
        });

        it('should convert heroes → hero → heroes', () => {
            const singular = singularize('heroes');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('heroes');
        });

        it('should convert boxes → box → boxes', () => {
            const singular = singularize('boxes');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('boxes');
        });

        it('should convert analyses → analysis → analyses', () => {
            const singular = singularize('analyses');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('analyses');
        });

        it('should convert crises → crisis → crises', () => {
            const singular = singularize('crises');
            const backToPlural = pluralize(singular);
            expect(backToPlural).toBe('crises');
        });
    });

    // ============================================================================
    // Integration Tests
    // ============================================================================

    describe('Integration: Full workflow', () => {
        it('should handle complete flow: format + singularize + generate description', () => {
            const path: DashboardNavigationPath = 'orders.new';
            const description = generateDescription(path);
            expect(description).toBe('Create a new order');
            expect(description).toContain('order');
        });

        it('should generate correct descriptions for all navigation patterns', () => {
            const testCases: Array<[DashboardNavigationPath, string]> = [
                ['dashboard', 'Dashboard'],
                ['orders', 'Orders'],
                ['orders.new', 'Create a new order'],
                ['products', 'Products'],
                ['products.new', 'Create a new product'],
                ['clients', 'Clients'],
                ['clients.new', 'Create a new client'],
                ['billing', 'Billing'],
                ['settings', 'Settings'],
                ['settings.profile', 'Profile settings'],
                ['settings.security', 'Security settings'],
                ['settings.organization', 'Organization settings'],
                ['settings.organization.members', 'Organization Members settings'],
                ['settings.organization.roles', 'Organization Roles settings'],
                ['aiChat', 'Ai Chat'],
            ];

            testCases.forEach(([path, expected]) => {
                expect(generateDescription(path as DashboardNavigationPath)).toBe(expected);
            });
        });

        it('should maintain consistency across multiple calls', () => {
            const path: DashboardNavigationPath = 'orders.new';
            const result1 = generateDescription(path);
            const result2 = generateDescription(path);
            expect(result1).toBe(result2);
        });

        it('should work with complex nested paths', () => {
            const path: DashboardNavigationPath = 'settings.organization.members';
            const result = generateDescription(path);
            expect(result).toBe('Organization Members settings');
            expect(result).toContain('Members');
            expect(result).toContain('settings');
        });
    });
});
