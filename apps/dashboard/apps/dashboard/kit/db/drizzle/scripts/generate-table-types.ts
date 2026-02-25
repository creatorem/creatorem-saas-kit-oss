import * as fs from 'fs';
import * as path from 'path';

// Define paths
const ROOT_DIR = path.resolve(__dirname, '..');
const SCHEMA_FILE = path.join(ROOT_DIR, 'src', 'drizzle', 'schema.ts');
const TABLES_FILE = path.join(ROOT_DIR, 'src', 'tables.ts');

// Read the schema file
const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8');

// Find all exported tables in the schema file
const tableRegex = /export const (\w+) = pgTable\(/g;
const tableMatches = [...schemaContent.matchAll(tableRegex)];
const tableNames = tableMatches.map((match) => match[1]).filter((name): name is string => name !== undefined);

// Find all exported enum types
const enumRegex = /export const (\w+) = pgEnum\(/g;
const enumMatches = [...schemaContent.matchAll(enumRegex)];
const enumNames = enumMatches.map((match) => match[1]).filter((name): name is string => name !== undefined);

// Create tables.ts content
let tablesContent = `import { InferSelectModel } from 'drizzle-orm';
import * as schema from './drizzle/schema';

`;

// Add type definitions for each table
tableNames.forEach((tableName) => {
    // Convert to PascalCase for type name (e.g., userSetting -> UserSetting)
    const pascalCaseName = tableName.charAt(0).toUpperCase() + tableName.slice(1);

    tablesContent += `export type ${pascalCaseName} = InferSelectModel<typeof schema.${tableName}>;\n`;
});

// Add a line break before enum exports if any enums exist
if (enumNames.length > 0) {
    tablesContent += '\n// Enum Types\n';

    // Add export for each enum
    enumNames.forEach((enumName) => {
        // Convert to PascalCase with "Enum" suffix
        const pascalCaseName = `${enumName.charAt(0).toUpperCase() + enumName.slice(1)}Enum`;

        tablesContent += `export type ${pascalCaseName} = typeof schema.${enumName}.enumValues[number];\n`;
    });
}

// Add table schema map for dynamic table access
tablesContent += '\n// Table Schema Map for Dynamic Access\n';
tablesContent += 'export const tableSchemaMap = {\n';

// Generate the table schema map entries
tableNames.forEach((tableName, index) => {
    // Convert camelCase to snake_case for the key (e.g., userSetting -> user_setting)
    const snakeCaseKey = tableName.replace(/([A-Z])/g, '_$1').toLowerCase();

    tablesContent += `    '${snakeCaseKey}': schema.${tableName}`;

    // Add comma if not the last item
    if (index < tableNames.length - 1) {
        tablesContent += ',';
    }
    tablesContent += '\n';
});

tablesContent += '} as const;\n';

// Write the content to tables.ts
fs.writeFileSync(TABLES_FILE, tablesContent);

console.log(
    `🚀 Successfully generated ${tableNames.length} table types, ${enumNames.length} enum types, and table schema map in tables.ts`,
);
