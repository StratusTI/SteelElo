import { ApiReference } from '@scalar/nextjs-api-reference'
const config = {
  url: 'http://localhost:3000/openapi.json',
  theme: 'alternate',
}
export const GET = ApiReference(config)
