import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'node:url'
import path from 'path'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'
import { MediaCollection } from './collections/Media/index.js'
import { PostsCollection, postsSlug } from './collections/Posts/index.js'
import { MenuGlobal } from './globals/Menu/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfigWithDefaults({
  // ...extend config here
  collections: [PostsCollection, MediaCollection],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        // Bug reproduction: when two custom admin views are registered and the
        // base path of one (`/regression-repro`) is a prefix of the other
        // (`/regression-repro/:id`), visiting the detail URL renders the list
        // view instead of the detail view on @payloadcms/next >= 3.83.0.
        regressionList: {
          path: '/regression-repro',
          Component:
            '/components/views/RegressionListView/index.js#RegressionListView',
        },
        regressionDetail: {
          path: '/regression-repro/:id',
          Component:
            '/components/views/RegressionDetailView/index.js#RegressionDetailView',
        },
      },
    },
  },
  editor: lexicalEditor({}),
  globals: [
    // ...add more globals here
    MenuGlobal,
  ],
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })

    await payload.create({
      collection: postsSlug,
      data: {
        title: 'example post',
      },
    })
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
