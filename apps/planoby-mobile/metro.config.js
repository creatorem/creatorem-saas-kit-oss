// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;

// Create the default Expo config for Metro
// This includes the automatic monorepo configuration for workspaces
// See: https://docs.expo.dev/guides/monorepos/#automatic-configuration
const config = getDefaultConfig(projectRoot, { isCSSEnabled: true });

// You can configure it manually as well, the most important parts are:
const monorepoRoot = path.resolve(__dirname, '../..');
// #1 - Watch all files within the monorepo
// @ts-expect-error
config.watchFolders = [monorepoRoot];
// #2 - Try resolving with project modules first, then hoisted workspace modules
// @ts-expect-error
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
];

// @ts-expect-error
config.resolver.sourceExts.push('sql');

// @ts-expect-error
config.resolver.assetExts.push('lottie');

// Use turborepo to restore the cache when possible
// @ts-expect-error
config.cacheStores = [new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') })];

// @ts-expect-error
module.exports = withUniwindConfig(config, {
    // relative path to your global.css file (from previous step)
    cssEntryFile: './global.css',
    // (optional) path where we gonna auto-generate typings
    // defaults to project's root
    dtsFile: './uniwind-types.d.ts',
});
