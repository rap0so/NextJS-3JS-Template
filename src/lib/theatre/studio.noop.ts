/**
 * Production stand-in for `@theatre/studio`.
 *
 * `next.config.ts` aliases `@theatre/studio` to this file during a production
 * build, so nothing from the real editor can be pulled into the client bundle
 * even if an import escapes its `NODE_ENV` guard.
 */
const noop = () => {};

const studioStub = {
  initialize: noop,
  extend: noop,
  transaction: noop,
  createPane: noop,
  getStudioProject: noop,
  ui: {
    hide: noop,
    restore: noop,
    isHidden: false,
  },
};

export default studioStub;
