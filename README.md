# Creatorem SaaS Kit OSS

[![OSS](https://img.shields.io/badge/License-Open%20Source-1f7a8c)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Turborepo-0b132b)](#)
[![Edition](https://img.shields.io/badge/Edition-OSS-2d6a4f)](#)
[![Premium](https://img.shields.io/badge/Upgrade-Premium-ff7f11)](#)

Open-source starter kit for building SaaS applications with Supabase, Next.js, Tailwind CSS, and Turborepo.

> **Quick summary**
> Start fast with a production-oriented SaaS foundation: dashboard app, analytics, monitoring, i18n, and AI in the OSS version.
> Start fast with a production-oriented SaaS foundation: dashboard app, analytics, monitoring, i18n, and AI chat UI in the OSS version.
> Upgrade to Premium for mobile + marketing apps, advanced business modules, and React Native support for almost all features.

## Installation

1. The easiest way is to use the CLI to select the features you want to include in your project.

```bash
npx @creatorem/cli create
```

or you just just clone the repository.

2. Then you can install the dependencies and start the development server.

```bash
pnpm install
```

3. Start _Docker Desktop_

We gonna need to build your supabase migration file and start the supabase server :

```bash
creatorem generate-sql
pnpm run supabase:start
```

4. Generate your database types

```bash
pnpm run db:types
```

5. Start the development server

Go to the apps that you want to start, set your environment variables in the `.env` file and start the development server.

```bash
cd apps/dashboard
pnpm run dev
```

## Apps

| App       | OSS (this repository) | Premium |
| --------- | --------------------- | ------- |
| Dashboard | ✅                    | ✅      |
| Mobile    | ❌                    | ✅      |
| Marketing | ❌                    | ✅      |

## Features

| Feature                                                        | OSS (this repository) | Premium |
| -------------------------------------------------------------- | --------------------- | ------- |
| Analytics                                                      | ✅                    | ✅      |
| Monitoring                                                     | ✅                    | ✅      |
| i18n (translations)                                            | ✅                    | ✅      |
| AI chat UI                                                     | ✅                    | ✅      |
| Content-type (premade components to display your own app data) | ❌                    | ✅      |
| Billing                                                        | ❌                    | ✅      |
| Organization                                                   | ❌                    | ✅      |
| Notification                                                   | ❌                    | ✅      |
| Keybindings                                                    | ❌                    | ✅      |
| CMS                                                            | ❌                    | ✅      |
| Emailing (provider + templates)                                | ❌                    | ✅      |

### Platform and Examples

| Capability                        | OSS (this repository) | Premium                  |
| --------------------------------- | --------------------- | ------------------------ |
| React Native support for features | ❌                    | ✅ (almost all features) |
| Dashboard examples                | ❌                    | ✅                       |
| Mobile examples                   | ❌                    | ✅                       |

## Who Is OSS For?

- Teams launching a web-first SaaS dashboard quickly
- Founders validating product-market fit before adding paid modules
- Developers who want a clean baseline with Supabase + Next.js
- Projects that do not yet need billing, organizations, CMS, or mobile apps
