import type { PlopTypes } from '@turbo/gen';

export function createMigration(plop: PlopTypes.NodePlopAPI) {
    plop.setGenerator('migration', {
        description: 'Generate a new Supabase migration file for app-schemas',
        prompts: [
            {
                type: 'input',
                name: 'tableName',
                message:
                    'What is the table name? (lowercase, singular, use underscores for spaces, e.g., "user_setting" or "booking")',
                validate: (input: string) => {
                    if (!input) return 'Table name is required';
                    if (input !== input.toLowerCase()) return 'Table name must be lowercase';
                    if (input.includes(' ')) return 'Use underscores instead of spaces';
                    if (input.includes('-')) return 'Use underscores instead of hyphens';
                    return true;
                },
            },
            {
                type: 'list',
                name: 'scope',
                message: 'What is the scope of this table?',
                choices: [
                    { name: 'User scope (user_id)', value: 'user' },
                    { name: 'Organization scope (organization_id)', value: 'organization' },
                ],
                default: 'organization',
            },
        ],
        actions: [
            {
                type: 'add',
                path: 'supabase/app-schemas/{{ tableName }}.sql',
                templateFile: 'templates/migration/{{ scope }}-scoped.sql.hbs',
            },
            (answers) => {
                const tableName = 'tableName' in answers ? answers.tableName : 'unknown';
                const scope = 'scope' in answers ? answers.scope : 'unknown';
                return `Migration file created at supabase/app-schemas/${tableName}.sql with ${scope} scope`;
            },
        ],
    });
}
