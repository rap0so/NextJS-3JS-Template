import path from 'node:path';

import { PHASE_PRODUCTION_BUILD } from 'next/constants';

import type { NextConfig } from 'next';

/**
 * Stub that replaces `@theatre/studio` in production builds.
 *
 * Theatre's studio is the authoring UI: it is ~1MB of editor and must never
 * reach end users. Two independent mechanisms keep it out of the client bundle:
 *
 *  1. Every studio import is behind `process.env.NODE_ENV !== 'production'`,
 *     which the bundler statically folds and then dead-code-eliminates.
 *  2. This alias, so that even an accidental unguarded import -- in a component
 *     added later, or one that forgets the guard -- resolves to an inert module
 *     instead of the real editor. Verified: with the alias in place, a
 *     production build compiles even when @theatre/studio is absent from
 *     node_modules entirely.
 *
 * `@theatre/studio` is a devDependency, so CI must install devDependencies to
 * build -- which it must do anyway, since `typescript` lives there too.
 */
const THEATRE_STUDIO_STUB = './src/lib/theatre/studio.noop.ts';

const nextConfig = (phase: string): NextConfig => {
  const isProductionBuild = phase === PHASE_PRODUCTION_BUILD;

  return {
    reactStrictMode: true,

    turbopack: {
      resolveAlias: isProductionBuild ? { '@theatre/studio': THEATRE_STUDIO_STUB } : {},
    },

    // Only relevant when building with `next build --webpack`; Turbopack is the
    // default bundler in Next 16 and is handled by `turbopack.resolveAlias` above.
    webpack: (config) => {
      if (isProductionBuild) {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@theatre/studio': path.resolve(import.meta.dirname, THEATRE_STUDIO_STUB),
        };
      }

      return config;
    },
  };
};

export default nextConfig;
