import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AuditLogs } from './collections/AuditLogs'
import { Media } from './collections/Media'
import { Permissions } from './collections/Permissions'
import { Roles } from './collections/Roles'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Tenants, Users, Roles, Permissions, Media, AuditLogs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'no-reply@justbelieveintmissions.org',
    defaultFromName: 'Just Believe International Missions',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  // TODO: once Cloudflare R2 credentials exist, add @payloadcms/storage-s3
  // to the plugins array pointed at the R2 endpoint — Media.ts is already
  // storage-adapter-agnostic. See docs/02-architecture.md §1.
  sharp,
})
