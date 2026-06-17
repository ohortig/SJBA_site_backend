import { describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule('../config/supabase.js', () => ({
  describeSupabaseError: (error: unknown) => String(error),
  getSupabase: jest.fn(),
  getSupabaseAdmin: jest.fn(),
}));

jest.unstable_mockModule('../middleware/index.js', () => ({
  asyncHandler: (handler: unknown) => handler,
  requireAdminUser: function requireAdminUser() {
    return undefined;
  },
  validateInput: function validateInput() {
    return undefined;
  },
}));

const getRouteSurface = (router: unknown): Array<{ path: string; methods: string[] }> => {
  const stack = (
    router as { stack: Array<{ route?: { path: string; methods: Record<string, boolean> } }> }
  ).stack;

  return stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route!.path,
      methods: Object.entries(layer.route!.methods)
        .filter(([, enabled]) => enabled)
        .map(([method]) => method),
    }));
};

describe('resource admin methods', () => {
  it.each([
    ['board members', './boardMembers.js'],
    ['events', './events.js'],
    ['members', './members.js'],
    ['semesters', './semesters.js'],
    ['contact requests', './contactRequests.js'],
    ['newsletter signups', './newsletterSignups.js'],
  ])(
    '%s router exposes admin write methods on the resource endpoint',
    async (_label, modulePath) => {
      const { default: router } = (await import(modulePath)) as { default: unknown };
      const routeSurface = getRouteSurface(router);

      expect(routeSurface).toEqual(
        expect.arrayContaining([
          { path: '/', methods: ['post'] },
          { path: '/:id', methods: ['put'] },
          { path: '/:id', methods: ['delete'] },
        ])
      );
    }
  );
});
