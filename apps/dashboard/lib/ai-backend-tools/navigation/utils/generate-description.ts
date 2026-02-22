import type { DashboardNavigationPath } from './route-generator';

/**
 * Convert plural nouns to singular forms using English pluralization rules
 * Handles: -ies → -y, -es → ∅, -s → ∅, and irregular plurals
 *
 * Rules applied in order:
 * 1. Words ending in consonant + 'ies' → consonant + 'y' (e.g., 'entries' → 'entry')
 * 2. Words ending in 'shes', 'ches', 'xes', 'zes' → remove 'es' (e.g., 'boxes' → 'box')
 * 3. Words ending in 'oes' → remove 'es' (e.g., 'heroes' → 'hero')
 * 4. Words ending in 'ves' → replace with 'f' (e.g., 'wolves' → 'wolf')
 * 5. Words ending in 'ves' → replace with 'fe' (e.g., 'knives' → 'knife')
 * 6. Words ending in 's' → remove 's' (e.g., 'cats' → 'cat')
 *
 * @param word - The plural word to singularize
 * @returns The singular form of the word
 */
export function singularize(word: string): string {
    // Rule 0: Handle special cases (words that don't follow standard rules)
    // Latin/Greek origin words and irregular plurals
    const irregularMap: Record<string, string> = {
        analyses: 'analysis',
        crises: 'crisis',
        phenomena: 'phenomenon',
        criteria: 'criterion',
        data: 'datum',
        bases: 'basis',
        oases: 'oasis',
        buses: 'bus',
        oxen: 'ox',
        feet: 'foot',
        teeth: 'tooth',
        geese: 'goose',
        mice: 'mouse',
        people: 'person',
        children: 'child',
        men: 'man',
        women: 'woman',
    };

    if (irregularMap[word]) {
        return irregularMap[word];
    }

    // Rule 1: consonant + 'ies' → consonant + 'y'
    // Matches: entries, categories, queries, etc.
    if (/[^aeiou]ies$/.test(word)) {
        return `${word.slice(0, -3)}y`;
    }

    // Rule 2: 'shes', 'ches', 'xes', 'zes' → remove 'es'
    // Matches: boxes, brushes, watches, buzzes, etc.
    if (/^(.*)(sh|ch|x|z)es$/.test(word)) {
        return word.slice(0, -2);
    }

    // Rule 3: 'oes' → remove 'es' (potatoes, tomatoes, heroes, etc.)
    if (/oes$/.test(word)) {
        return word.slice(0, -2);
    }

    // Rule 4: words ending in 'ves' → replace with 'f' or 'fe'
    // Matches: wolves, calves, knives, wives, lives, etc.
    if (/ves$/.test(word)) {
        const base = word.slice(0, -3); // Remove 'ves'
        // Only 3 words in English end in 'fe' and pluralize with 'ves': knife, wife, life
        if (/(knif|wif|lif)$/.test(`${base}f`)) {
            return `${base}fe`;
        }
        // All other words ending in 'ves' come from '-f' singular: wolf, thief, shelf, etc.
        return `${base}f`;
    }

    // Rule 5: 'ses' → 'sis' (Greek/Latin origin: analysis → analyses, crisis → crises)
    // Must check before default 's' rule
    if (/sis$/.test(word)) {
        return `${word.slice(0, -2)}is`;
    }

    // Rule 6: words ending in 'ous' → keep as is
    if (/ous$/.test(word)) {
        return word;
    }

    // Rule 7: default - remove trailing 's'
    // Matches: cats, dogs, tables, books, orders, products, clients, etc.
    if (/s$/.test(word)) {
        return word.slice(0, -1);
    }

    // Return unchanged if no rules matched
    return word;
}

/**
 * Convert singular nouns to plural forms using English pluralization rules
 * Handles: y → ies, consonant + o → oes, f/fe → ves, add s/es
 *
 * Rules applied in order:
 * 1. Words ending in consonant + 'y' → consonant + 'ies' (e.g., 'entry' → 'entries')
 * 2. Words ending in 's', 'ss', 'x', 'z', 'ch', 'sh' → add 'es' (e.g., 'box' → 'boxes')
 * 3. Words ending in consonant + 'o' → add 'es' (e.g., 'hero' → 'heroes')
 * 4. Words ending in 'f' → replace with 'ves' (e.g., 'wolf' → 'wolves')
 * 5. Words ending in 'fe' → replace with 'ves' (e.g., 'knife' → 'knives')
 * 6. Words ending in 'is' → replace with 'es' (e.g., 'analysis' → 'analyses')
 * 7. Default → add 's' (e.g., 'cat' → 'cats')
 *
 * @param word - The singular word to pluralize
 * @returns The plural form of the word
 */
export function pluralize(word: string): string {
    // Rule 0: Handle special cases (words that don't follow standard rules)
    // Latin/Greek origin words
    const irregularMap: Record<string, string> = {
        analysis: 'analyses',
        crisis: 'crises',
        phenomenon: 'phenomena',
        criterion: 'criteria',
        datum: 'data',
        basis: 'bases',
        oasis: 'oases',
    };

    if (irregularMap[word]) {
        return irregularMap[word];
    }

    // Rule 1: consonant + 'y' → consonant + 'ies'
    // Matches: entry → entries, category → categories
    if (/[^aeiou]y$/.test(word)) {
        return `${word.slice(0, -1)}ies`;
    }

    // Rule 2: 's', 'ss', 'x', 'z', 'ch', 'sh' → add 'es'
    // Matches: box → boxes, brush → brushes, watch → watches, bus → buses
    if (/^(.*)(s|ss|x|z|ch|sh)$/.test(word)) {
        return `${word}es`;
    }

    // Rule 3: consonant + 'o' → add 'es'
    // Matches: hero → heroes, tomato → tomatoes
    // But not 'photo' → 'photos', 'piano' → 'pianos'
    if (/[^aeiou]o$/.test(word)) {
        // Exceptions: photo, piano, solo, memo, pro are just +s
        if (/^(photo|piano|solo|memo|pro)$/.test(word)) {
            return `${word}s`;
        }
        return `${word}es`;
    }

    // Rule 4: 'fe' → 'ves'
    // Matches: knife → knives, wife → wives, life → lives
    if (/fe$/.test(word)) {
        return `${word.slice(0, -2)}ves`;
    }

    // Rule 5: 'f' → 'ves'
    // Matches: wolf → wolves, calf → calves
    // Exception: 'roof' → 'roofs', not 'rooves'
    if (/f$/.test(word)) {
        if (/^(roof|chief|chef|cliff|staff|loaf|sheaf|belief|brief|grief|relief)$/.test(word)) {
            return `${word}s`;
        }
        return `${word.slice(0, -1)}ves`;
    }

    // Rule 6: 'is' → 'es' (Greek/Latin origin)
    // Matches: analysis → analyses, crisis → crises (but basis/oasis are in irregularMap above)
    if (/is$/.test(word)) {
        return `${word.slice(0, -2)}es`;
    }

    // Rule 7: default → add 's'
    // Matches: cat → cats, dog → dogs, order → orders
    return `${word}s`;
}

/**
 * Format a word to title case with special handling for camelCase
 *
 * Examples:
 * - 'orders' → 'Orders'
 * - 'aiChat' → 'Ai Chat'
 * - 'keybindings' → 'Keybindings'
 *
 * @param word - The word to format
 * @returns The formatted word in title case
 */
export function formatWord(word: string): string {
    // Handle camelCase by inserting spaces before uppercase letters
    const withSpaces = word.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize first letter and lowercase the rest
    return withSpaces
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Generate a human-readable description for a navigation path dynamically
 * Detects patterns in the path and generates appropriate descriptions
 *
 * Patterns detected:
 * - '.new' suffix: "Create a new {singular}"
 * - 'settings' prefix: "{section} settings"
 * - camelCase: Converts to Title Case
 * - Multiple segments: Joins with " → "
 *
 * @param path - The navigation path (e.g., 'orders.new', 'settings.organization.members')
 * @returns A human-readable description
 */
export function generateDescription(path: DashboardNavigationPath): string {
    const parts = path.split('.');

    // Pattern 1: Handle ".new" suffix - "Create a new {singular}"
    if (parts[parts.length - 1] === 'new') {
        const resourcePlural = parts[0] ?? '';
        const resourceSingular = singularize(resourcePlural);
        return `Create a new ${resourceSingular}`;
    }

    // Pattern 2: Handle "settings" prefix
    if (parts[0] === 'settings') {
        if (parts.length === 1) {
            return 'Settings';
        }

        // For nested settings like 'settings.organization.members'
        // Generate: "Organization members settings"
        const settingsParts = parts.slice(1);
        const formatted = settingsParts.map((part) => formatWord(part)).join(' ');

        return `${formatted} settings`;
    }

    // Pattern 3: Single word paths - just format and capitalize
    if (parts.length === 1) {
        return formatWord(parts[0] ?? '');
    }

    // Pattern 4: Multi-part paths - capitalize each part and join with arrows
    // Example: 'orders.new' → 'Orders', 'products.categories' → 'Products → Categories'
    return parts.map((part) => formatWord(part)).join(' → ');
}
