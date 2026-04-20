# Reproduction: custom admin view route shadowing in @payloadcms/next ≥ 3.83.0

## Summary

When two custom admin views are registered via `admin.components.views` and the
base path of one is a prefix of the other (e.g. `/foo` and `/foo/:id`), the
list view shadows the detail view on every nested URL on @payloadcms/next
3.83.0 and later. The detail view is never rendered.

## Affected versions

- Broken: `@payloadcms/next` 3.83.0 (current `main`)
- Working: `@payloadcms/next` 3.82.x and earlier

## Root cause

PR [#16243](https://github.com/payloadcms/payload/pull/16243) rewrote
`packages/next/src/views/Root/isPathMatchingRoute.ts`. The non-exact branch
inverted its prefix check:

**Before** (3.82.x):

```ts
if (!exact) return viewRoute.startsWith(currentRoute)
```

For `currentRoute = '/regression-repro/123'` and view path `/regression-repro`,
the pattern resolves to `viewRoute = '/regression-repro'`. The check
`/regression-repro`.startsWith(`/regression-repro/123`) returns `false`, so the
list view does not match — the iteration continues and the `/regression-repro/:id`
view matches via pathToRegexp.

**After** (3.83.0):

```ts
if (!exact) {
  if (!currentRoute.startsWith(viewRoute)) return false
  const remainingPath = currentRoute.slice(viewRoute.length)
  return remainingPath === '' || remainingPath.startsWith('/')
}
```

Now `/regression-repro/123`.startsWith(`/regression-repro`) is `true` and the
remainder (`/123`) starts with `/`, so the list view matches. `getCustomViewByRoute`
returns the first `Object.entries(views).find(...)` match, so insertion order
silently decides which view wins.

## Reproduction

Files added/modified:

- `test/_community/config.ts` — registers two custom admin views:
  - `regressionList` → `/regression-repro` (list)
  - `regressionDetail` → `/regression-repro/:id` (detail)
- `test/_community/components/views/RegressionListView/index.tsx`
- `test/_community/components/views/RegressionDetailView/index.tsx`
- `test/_community/e2e.spec.ts` — asserts each URL renders the correct view.

Run:

```bash
pnpm install
pnpm dev _community
```

Then in the browser:

1. Visit `http://localhost:3000/admin/regression-repro` — the **list** view
   renders (correct).
2. Visit `http://localhost:3000/admin/regression-repro/123` — the **list**
   view renders again instead of the detail view (BUG).

Or run the Playwright spec:

```bash
pnpm test:e2e _community
```

The second test case fails on 3.83.0 and passes once the regression is fixed.

## Workaround

Add `exact: true` to the list view:

```ts
regressionList: {
  path: '/regression-repro',
  exact: true,
  Component: '/components/views/RegressionListView/index.js#RegressionListView',
},
```

This is a breaking change not mentioned in the 3.83.0 release notes. Projects
that previously relied on `/foo` + `/foo/:id` pairs silently route every
document-level request to the list view after upgrading.
