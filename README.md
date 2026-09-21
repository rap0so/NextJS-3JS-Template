# nextjs-template

A project template: Next.js 16 (App Router) + TypeScript, with Airbnb ESLint,
native CSS nesting, GSAP and Theatre.js. The Contentful layer is scaffolded and
ready to wire up.

## Requirements

Node `>=20.9` (developed on 24.10, see `.nvmrc`) and Yarn 1.

```bash
yarn install
cp .env.example .env.local
yarn dev
```

## Scripts

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `yarn dev`           | Dev server (Turbopack) with the Theatre.js studio |
| `yarn build`         | Production build                                  |
| `yarn start`         | Serve the production build                        |
| `yarn lint`          | ESLint (Airbnb, flat config)                      |
| `yarn typecheck`     | `next typegen` + `tsc --noEmit`                   |
| `yarn test`          | Vitest + Testing Library                          |
| `yarn validate`      | typecheck + lint + test                           |
| `yarn verify:bundle` | Assert the Theatre studio is not in `.next`       |

## Stack notes

### ESLint

Airbnb's original `eslint-config-airbnb` is still ESLint 8 / `.eslintrc` only, so
this project uses [`eslint-config-airbnb-extended`](https://www.npmjs.com/package/eslint-config-airbnb-extended),
the maintained flat-config port, in `eslint.config.mjs`.

Two things about that package are easy to get wrong and are already handled:

- Plugins and rules are **separate exports**. The `plugins.*` entries must be
  spread into the config before any rule that references them.
- `configs.next.typescript` is only the React + TS half. The Next.js plugin rules
  live in `configs.next.recommended`, so the config uses `configs.next.all`.

ESLint is pinned to `^9` (with a `resolutions` entry) because `airbnb-extended`
declares `eslint: ^9.0.0` as its peer. Do not bump to ESLint 10 until it does.

### Styling

No preprocessor. Plain CSS with **native nesting**, CSS custom properties in
`src/styles/tokens.css`, and CSS Modules for components. Next.js lowers the
nesting syntax for older browsers at build time.

### GSAP

Plugins are registered once in `src/lib/gsap/index.ts`; import `gsap` and
`useGSAP` from there rather than from the packages directly.

`useGSAP` scopes selectors to a ref and reverts its tweens on unmount.

> One gotcha baked into the demo: animating sibling elements relocates the
> whitespace text nodes between them, which silently mangles a heading's
> accessible name. `AnimatedHero` splits words into `aria-hidden` spans, spaces
> them with CSS `gap`, and exposes the real text once via `aria-label`.

### Theatre.js — and keeping the studio out of production

`@theatre/core` ships to the browser. `@theatre/studio` (the authoring UI) must
not. Three layers enforce that:

1. `@theatre/studio` is a **devDependency**.
2. Every import of it sits behind `process.env.NODE_ENV !== 'production'`
   (`src/lib/theatre/studio.ts`), so the bundler folds the branch away.
3. `next.config.ts` aliases `@theatre/studio` to an inert stub
   (`src/lib/theatre/studio.noop.ts`) during a production build, keyed off
   `PHASE_PRODUCTION_BUILD` rather than `NODE_ENV`. This catches any future
   import that forgets the guard.

Verified on this build: the studio chunk is emitted in dev
(`.next/dev/static/chunks/node_modules_@theatre_studio_*`) and absent from every
file in `.next/static` and `.next/server` after `yarn build`.

`yarn verify:bundle` re-checks this after any build and is worth running in CI.

#### Authoring workflow

Run `yarn dev`, tweak the sheet in the studio panel, then export it and overwrite
`src/lib/theatre/state.json`. Production hydrates the project from that file; dev
leaves the state to the studio so your edits persist.

### Contentful

Not yet connected — the structure is in place under `src/lib/contentful`:

```
src/lib/contentful/
├── client.ts        # fetchContentful(): typed GraphQL wrapper over the Content API
├── config.ts        # lazy env resolution; throws only when a request is made
├── queries/page.ts  # example query + fragment against a `page` content type
├── types.ts         # placeholder shapes, to be replaced by codegen
└── index.ts
```

To wire it up:

1. Fill `CONTENTFUL_*` in `.env.local` (see `.env.example`). These are
   server-only — never add a `NEXT_PUBLIC_` prefix.
2. Rename `PageEntry` / the `page` query to match your real content model.
3. Generate types instead of hand-writing them:
   `yarn add -D @graphql-codegen/cli @graphql-codegen/client-preset`.

`fetchContentful` uses the instrumented `fetch`, so `revalidate` and `tags` work
as normal Next.js caching. Preview requests are never cached. A draft-mode route
(`/api/draft`) is the natural next step; `CONTENTFUL_PREVIEW_SECRET` is already
reserved for it.

## Making it yours

Nothing in here is branded. To start a real project from this template:

1. Set `name` in `package.json`.
2. Set `metadata.title` and `metadata.description` in `src/app/layout.tsx`.
3. Adjust the colours and type scale in `src/styles/tokens.css`.
4. Delete `src/components/demo/` (and its test) once you no longer need the
   GSAP + Theatre example, then point `src/app/page.tsx` at your own content.
5. Optionally rename `THEATRE_PROJECT_NAME` in `src/lib/theatre/project.ts` --
   it is the key Theatre stores studio edits under, so changing it later
   discards state saved under the old name.

## Layout

```
src/
├── app/                  # App Router routes
├── components/
│   ├── demo/             # AnimatedHero: GSAP + Theatre example (safe to delete)
│   └── theatre/          # dev-only studio bootstrap
├── lib/
│   ├── contentful/
│   ├── gsap/
│   └── theatre/
└── styles/               # globals.css + tokens.css
```

The `components/demo` folder is example code. Deleting it and its test leaves a
clean starting point.
