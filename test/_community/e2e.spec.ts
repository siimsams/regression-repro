import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { ensureCompilationIsDone, initPageConsoleErrorCatch } from '../__helpers/e2e/helpers.js'
import { AdminUrlUtil } from '../__helpers/shared/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../__helpers/shared/initPayloadE2ENoConfig.js'
import { TEST_TIMEOUT_LONG } from '../playwright.config.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Regression: custom view route shadowing (issue repro)', () => {
  let page: Page
  let serverURLGlobal: string

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { serverURL } = await initPayloadE2ENoConfig({ dirname })
    serverURLGlobal = serverURL
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _url = new AdminUrlUtil(serverURL, 'posts')

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
    await ensureCompilationIsDone({ page, serverURL })
  })

  test('list view renders at /admin/regression-repro', async () => {
    await page.goto(`${serverURLGlobal}/admin/regression-repro`)
    await expect(page.locator('#regression-list-view')).toBeVisible()
  })

  // This test FAILS on @payloadcms/next >= 3.83.0.
  // The list view ({ path: '/regression-repro' }) shadows the detail view
  // ({ path: '/regression-repro/:id' }) because isPathMatchingRoute now treats
  // a non-exact base path as a prefix match. Object.entries(views).find(...)
  // returns the first match, so the list view wins.
  test('detail view renders at /admin/regression-repro/123', async () => {
    await page.goto(`${serverURLGlobal}/admin/regression-repro/123`)
    await expect(page.locator('#regression-detail-view')).toBeVisible()
    await expect(page.locator('#regression-detail-id')).toHaveText('123')
  })
})
