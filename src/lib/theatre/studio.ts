/**
 * Development-only entry point for the Theatre.js editor.
 *
 * The `import()` is inside a `NODE_ENV` guard so the bundler folds the condition
 * away and drops the chunk from production output. See `next.config.ts` for the
 * second layer of defence (a resolve alias to `studio.noop.ts`).
 */
let initialized = false;

export async function initTheatreStudio(): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (initialized) return;

  initialized = true;

  const studio = (await import('@theatre/studio')).default;

  studio.initialize();
}
