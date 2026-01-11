import { ApiReference } from '@scalar/nextjs-api-reference'

const config = {
  url: 'http://localhost:3000/openapi.json',
  theme: 'alternate' as const,
}
export const GET = ApiReference(config)
