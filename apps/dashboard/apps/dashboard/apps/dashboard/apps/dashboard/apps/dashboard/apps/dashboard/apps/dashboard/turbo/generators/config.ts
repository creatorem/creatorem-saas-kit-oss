import type { PlopTypes } from '@turbo/gen';
import { createMigration } from './templates/migration/generator';
import { createPackage } from './templates/package/generator';

const TURBO_GENERATORS = [createPackage, createMigration];

export default function generator(plop: PlopTypes.NodePlopAPI): void {
    TURBO_GENERATORS.forEach((gen) => gen(plop));
}
