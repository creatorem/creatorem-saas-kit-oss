import { execSync } from 'node:child_process';
import type { PlopTypes } from '@turbo/gen';

export function createPackage(plop: PlopTypes.NodePlopAPI) {
    plop.setGenerator('package', {
        description: 'Generate a new package for the Monorepo',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: "What is the package's name? (Without the `@kit/` prefix)",
            },
        ],
        actions: [
            (answers) => {
                if ('name' in answers && typeof answers.name === 'string') {
                    if (answers.name.startsWith('@kit/')) {
                        answers.name = answers.name.replace('@kit/', '');
                    }
                }
                return 'Config sanitized';
            },
            {
                type: 'add',
                path: 'kit/{{ name }}/package.json',
                templateFile: 'templates/package/package.json.hbs',
            },
            {
                type: 'add',
                path: 'kit/{{ name }}/tsconfig.json',
                templateFile: 'templates/package/tsconfig.json.hbs',
            },
            {
                type: 'add',
                path: 'kit/{{ name }}/eslint.config.mjs',
                templateFile: 'templates/package/eslint.config.mjs.hbs',
            },
            {
                type: 'add',
                path: 'kit/{{ name }}/envs.ts',
                templateFile: 'templates/package/envs.ts.hbs',
            },
            {
                type: 'add',
                path: 'kit/{{ name }}/src/index.ts',
                template: '// Your code here',
            },
            // Install dependencies after all files are created
            () => {
                try {
                    console.log('Installing dependencies...');
                    execSync('pnpm install', {
                        stdio: 'inherit',
                        cwd: process.cwd(),
                    });
                    return 'Dependencies installed successfully';
                } catch (error) {
                    console.error('Failed to install dependencies:', error);
                    return 'Failed to install dependencies - you may need to run `pnpm install` manually';
                }
            },
        ],
    });
}
